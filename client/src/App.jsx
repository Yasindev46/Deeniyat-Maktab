import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { postJson, request } from './api';
import { clearError, loadFees, loadStudents } from './store';

const AttendanceView = lazy(() => import('./components/AttendanceView'));
const RosterView = lazy(() => import('./components/RosterView'));
const FeesView = lazy(() => import('./components/FeesView'));
const AnalyticsView = lazy(() => import('./components/AnalyticsView'));
const FIXED_FEE = 2400;

const VIEW_COPY = {
  attendance: ['Attendance sheet', 'Take attendance and share a daily class update.'],
  analytics: ['Attendance analytics', 'Review historical attendance by student or class.'],
  roster: ['Manage students details', 'Add students, update their details, or import a class list.'],
  fees: ['Fees & collections', 'Keep track of student payments and outstanding balances.'],
};

function createRupeeSymbolImage() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Your browser cannot render the rupee symbol for the PDF.');

  context.fillStyle = '#182230';
  context.font = '96px Arial, sans-serif';
  context.textBaseline = 'alphabetic';
  context.fillText('₹', 8, 104);
  return canvas.toDataURL('image/png');
}

function addPdfCurrency(doc, symbolImage, amount, x, y) {
  const symbolWidth = 3.4;
  const symbolHeight = 3.4;
  const symbolGap = 0.8;
  doc.addImage(symbolImage, 'PNG', x, y - symbolHeight + 0.4, symbolWidth, symbolHeight);
  const value = Number(amount || 0).toLocaleString('en-IN');
  doc.text(value, x + symbolWidth + symbolGap, y);
  return symbolWidth + symbolGap + doc.getTextWidth(value);
}

function App() {
  const dispatch = useDispatch();
  const { students, fees, loadingStudents, loadingFees, error: storeError } = useSelector((state) => state.portal);
  const [view, setView] = useState('attendance');
  const [localError, setLocalError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    dispatch(loadStudents());
  }, [dispatch]);

  useEffect(() => {
    if (view === 'fees') dispatch(loadFees());
  }, [dispatch, view]);

  const classes = useMemo(
    () => [...new Set(students.map((student) => student.class))].sort((a, b) => a.localeCompare(b)),
    [students],
  );
  const pageError = localError || storeError;

  async function perform(action, successMessage = '') {
    dispatch(clearError());
    setLocalError('');
    setNotice('');
    setBusy(true);
    try {
      const result = await action();
      if (successMessage) setNotice(successMessage);
      return result ?? true;
    } catch (error) {
      setLocalError(error.message || 'The request could not be completed.');
      return false;
    } finally {
      setBusy(false);
    }
  }

  function handleViewError(message) {
    setLocalError(message);
    setNotice('');
  }

  async function refreshStudents() {
    return dispatch(loadStudents()).unwrap();
  }

  async function toggleAttendance(student, status) {
    return perform(async () => {
      await postJson(`/attendance/${student.id}`, { status });
      await refreshStudents();
    });
  }

  async function markAllPresent(classFilter) {
    return perform(async () => {
      await postJson('/attendance/mark-all', { class: classFilter });
      await refreshStudents();
    }, `Everyone in ${classFilter === 'All' ? 'the roster' : classFilter} is marked present.`);
  }

  async function finalizeAttendance(classFilter) {
    const confirmed = window.confirm(`Lock attendance for ${classFilter === 'All' ? 'all classes' : classFilter}? Unmarked students will be recorded as absent.`);
    if (!confirmed) return false;
    return perform(async () => {
      await postJson('/attendance/finalize', { class: classFilter });
      const updatedStudents = await refreshStudents();
      const report = buildAttendanceMessage(updatedStudents, classFilter);
      await navigator.clipboard.writeText(report);
    }, 'Attendance finalized. The report has been copied; paste it into your WhatsApp group.');
  }

  async function saveStudent(student, editingStudent) {
    return perform(async () => {
      if (editingStudent) {
        await postJson(`/students/${editingStudent.id}`, student, 'PUT');
      } else {
        await postJson('/students', student);
      }
      await refreshStudents();
    }, editingStudent ? 'Student profile updated.' : 'Student profile saved.');
  }

  async function importRoster(file) {
    const formData = new FormData();
    formData.append('csv_file', file);
    return perform(async () => {
      const result = await request('/students/import', { method: 'POST', body: formData });
      await refreshStudents();
      setNotice(`${result.count} student ${result.count === 1 ? 'record was' : 'records were'} imported.`);
    });
  }

  async function saveFee(feeStudent, values) {
    return perform(async () => {
      await postJson(`/fees/${feeStudent.student_id}`, values, 'PUT');
      await dispatch(loadFees()).unwrap();
    }, 'Fee record updated.');
  }

  async function downloadFeesPdf(filteredFees, totals) {
    return perform(async () => {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      const rupeeSymbolImage = createRupeeSymbolImage();
      doc.setFontSize(16);
      doc.text('Deeniyat Maktab - Collection Register', 14, 18);
      doc.setFontSize(9);
      doc.text(`Generated ${new Date().toLocaleDateString('en-IN')}`, 14, 26);
      doc.setFontSize(8);
      [
        ['Expected', totals.expected, 14],
        ['Collected', totals.collected, 77],
        ['Pending', totals.pending, 140],
      ].forEach(([label, amount, x]) => {
        doc.text(label, x, 34);
        addPdfCurrency(doc, rupeeSymbolImage, amount, x + doc.getTextWidth(`${label} `), 34);
      });
      doc.setFontSize(9);
      let y = 43;
      const columns = ['Sr No.', 'Student', 'Class', 'Paid', 'Balance', 'Notes'];
      const widths = [18, 41, 24, 27, 28, 44];
      doc.setFont(undefined, 'bold');
      columns.forEach((column, index) => doc.text(column, 14 + widths.slice(0, index).reduce((sum, width) => sum + width, 0), y));
      doc.setFont(undefined, 'normal');
      y += 8;
      filteredFees.forEach((fee) => {
        if (y > 280) {
          doc.addPage();
          y = 18;
        }
        const values = [fee.sr, fee.name, fee.class, fee.paid_amount, FIXED_FEE - fee.paid_amount, fee.notes || '-'];
        values.forEach((value, index) => {
          const x = 14 + widths.slice(0, index).reduce((sum, width) => sum + width, 0);
          if (index === 3 || index === 4) {
            addPdfCurrency(doc, rupeeSymbolImage, index === 3 ? fee.paid_amount : FIXED_FEE - fee.paid_amount, x, y);
            return;
          }
          const text = doc.splitTextToSize(String(value), widths[index] - 3);
          doc.text(text.slice(0, 2), x, y);
        });
        y += 8;
      });
      doc.save('Deeniyat-Collection-Ledger.pdf');
    });
  }

  const [heading, subtitle] = VIEW_COPY[view];

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Deeniyat Maktab Portal home">
          <span className="brand-copy">
            <strong>Deeniyat Maktab, Walhekarwadi</strong>
          </span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <button className={view === 'attendance' ? 'nav-link active' : 'nav-link'} onClick={() => setView('attendance')}>Attendance</button>
          <button className={view === 'analytics' ? 'nav-link active' : 'nav-link'} onClick={() => setView('analytics')}>Reports</button>
          <button className={view === 'roster' ? 'nav-link active' : 'nav-link'} onClick={() => setView('roster')}>Admin View</button>
          <button className={view === 'fees' ? 'nav-link active nav-fees' : 'nav-link nav-fees'} onClick={() => setView('fees')}>Fees ledger</button>
        </nav>
        <div className="today-pill"><span className="live-dot" /> {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
      </header>

      <section className="page-heading">
        <div>
          {/* <p className="eyebrow">MAKTAB OVERVIEW</p> */}
          <h1>{heading}</h1>
          <p className="page-subtitle">{subtitle}</p>
        </div>
        <div className="heading-count"><strong>{students.length}</strong><span>students enrolled</span></div>
      </section>

      {pageError && (
        <div className="alert alert-error" role="alert">
          <span>{pageError}</span>
          <button onClick={() => { setLocalError(''); dispatch(clearError()); }} aria-label="Dismiss error">×</button>
        </div>
      )}
      {notice && (
        <div className="alert alert-success" role="status">
          <span>{notice}</span>
          <button onClick={() => setNotice('')} aria-label="Dismiss message">×</button>
        </div>
      )}

      <Suspense fallback={<div className="panel view-loading" role="status">Loading {heading.toLocaleLowerCase()}…</div>}>
        {view === 'attendance' && (
          <AttendanceView
            students={students}
            loading={loadingStudents}
            busy={busy}
            onToggle={toggleAttendance}
            onMarkAll={markAllPresent}
            onFinalize={finalizeAttendance}
          />
        )}
        {view === 'roster' && (
          <RosterView
            students={students}
            loading={loadingStudents}
            busy={busy}
            onSave={saveStudent}
            onImport={importRoster}
          />
        )}
        {view === 'fees' && (
          <FeesView
            fees={fees}
            classes={classes}
            loading={loadingFees}
            busy={busy}
            onSaveFee={saveFee}
            onDownloadPdf={downloadFeesPdf}
          />
        )}
        {view === 'analytics' && (
          <AnalyticsView students={students} classes={classes} onError={handleViewError} />
        )}
      </Suspense>

      <footer className="footer">Deeniyat Maktab <span>·</span> Attendance & fee management</footer>
    </main>
  );
}

function buildAttendanceMessage(students, classFilter) {
  const roster = students.filter((student) => classFilter === 'All' || student.class === classFilter);
  const absent = roster.filter((student) => student.today_status !== 'Present');
  const date = new Date().toLocaleDateString('en-GB');
  const lines = [
    '*DEENIYAT MAKTAB ATTENDANCE REPORT*',
    `📅 *Date:* ${date}`,
    `🏫 *Class:* ${classFilter}`,
    '───────────────────',
    `✅ Present: ${roster.length - absent.length}`,
    `❌ Absent: ${absent.length}`,
    '',
    absent.length ? `📋 *Absentees:*\n${absent.map((student) => `🔹 ${student.name} (${student.class})`).join('\n')}` : '🎉 *Alhamdulillah! Everyone present.*',
  ];
  return lines.join('\n');
}

export default App;
