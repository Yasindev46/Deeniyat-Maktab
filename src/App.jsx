import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { postJson, request } from './api';
import { clearError, loadFees, loadStudents } from './store';

const FIXED_FEE = 2400;
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const money = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

function App() {
  const dispatch = useDispatch();
  const { students, fees, loadingStudents, loadingFees, error: storeError } = useSelector((state) => state.portal);
  const [view, setView] = useState('attendance');
  const [classFilter, setClassFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [feeClass, setFeeClass] = useState('All');
  const [feeStatus, setFeeStatus] = useState('All');
  const [feeSearch, setFeeSearch] = useState('');
  const [feeStudent, setFeeStudent] = useState(null);
  const [studentForm, setStudentForm] = useState({ sr: '', name: '', class: '', mobile: '' });
  const [editingStudent, setEditingStudent] = useState(null);
  const [analyticsType, setAnalyticsType] = useState('class');
  const [analyticsClass, setAnalyticsClass] = useState('All');
  const [analyticsStudent, setAnalyticsStudent] = useState('');
  const [analyticsYear, setAnalyticsYear] = useState(String(new Date().getFullYear()));
  const [analyticsMonth, setAnalyticsMonth] = useState('All');
  const [analytics, setAnalytics] = useState([]);
  const [analyticsLoaded, setAnalyticsLoaded] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    dispatch(loadStudents());
  }, [dispatch]);

  useEffect(() => {
    if (view === 'fees') dispatch(loadFees());
  }, [dispatch, view]);

  useEffect(() => {
    if (!analyticsStudent && students.length) setAnalyticsStudent(String(students[0].id));
  }, [analyticsStudent, students]);

  const classes = useMemo(
    () => [...new Set(students.map((student) => student.class))].sort((a, b) => a.localeCompare(b)),
    [students],
  );
  const visibleStudents = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return students.filter((student) => (
      (classFilter === 'All' || student.class === classFilter)
      && (`${student.name} ${student.sr}`.toLocaleLowerCase().includes(query))
    ));
  }, [classFilter, search, students]);
  const attendanceCount = visibleStudents.reduce((count, student) => count + (student.today_status === 'Present' ? 1 : 0), 0);
  const filteredFees = useMemo(() => {
    const query = feeSearch.trim().toLocaleLowerCase();
    return fees.filter((fee) => {
      const balance = FIXED_FEE - Number(fee.paid_amount);
      return (feeClass === 'All' || fee.class === feeClass)
        && (`${fee.name} ${fee.sr}`.toLocaleLowerCase().includes(query))
        && (feeStatus === 'All' || (feeStatus === 'Paid' ? balance <= 0 : balance > 0));
    });
  }, [feeClass, feeSearch, feeStatus, fees]);
  const feeTotals = filteredFees.reduce((totals, fee) => ({
    expected: totals.expected + FIXED_FEE,
    collected: totals.collected + Number(fee.paid_amount),
    pending: totals.pending + FIXED_FEE - Number(fee.paid_amount),
  }), { expected: 0, collected: 0, pending: 0 });
  const years = Array.from({ length: 6 }, (_, index) => String(new Date().getFullYear() - index));
  const pageError = localError || storeError;

  async function perform(action, successMessage = '') {
    dispatch(clearError());
    setLocalError('');
    setNotice('');
    setBusy(true);
    try {
      await action();
      if (successMessage) setNotice(successMessage);
    } catch (error) {
      setLocalError(error.message || 'The request could not be completed.');
    } finally {
      setBusy(false);
    }
  }

  async function refreshStudents() {
    return dispatch(loadStudents()).unwrap();
  }

  async function toggleAttendance(student, status) {
    await perform(async () => {
      await postJson(`/attendance/${student.id}`, { status });
      await refreshStudents();
    });
  }

  async function markAllPresent() {
    await perform(async () => {
      await postJson('/attendance/mark-all', { class: classFilter });
      await refreshStudents();
    }, `Everyone in ${classFilter === 'All' ? 'the roster' : classFilter} is marked present.`);
  }

  async function finalizeAttendance() {
    const confirmed = window.confirm(`Lock attendance for ${classFilter === 'All' ? 'all classes' : classFilter}? Unmarked students will be recorded as absent.`);
    if (!confirmed) return;
    await perform(async () => {
      await postJson('/attendance/finalize', { class: classFilter });
      const updatedStudents = await refreshStudents();
      const message = buildAttendanceMessage(updatedStudents, classFilter);
      await navigator.clipboard.writeText(message);
      setNotice('Attendance finalized. The report has been copied; paste it into your WhatsApp group.');
    });
  }

  async function saveStudent(event) {
    event.preventDefault();
    await perform(async () => {
      if (editingStudent) {
        await postJson(`/students/${editingStudent.id}`, studentForm, 'PUT');
      } else {
        await postJson('/students', studentForm);
      }
      setStudentForm({ sr: '', name: '', class: '', mobile: '' });
      setEditingStudent(null);
      await refreshStudents();
    }, editingStudent ? 'Student profile updated.' : 'Student profile saved.');
  }

  function editStudent(student) {
    setEditingStudent(student);
    setStudentForm({ sr: student.sr, name: student.name, class: student.class, mobile: student.mobile });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function importCsv(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const file = formElement.elements.csv_file.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('csv_file', file);
    await perform(async () => {
      const result = await request('/students/import', { method: 'POST', body: formData });
      formElement.reset();
      await refreshStudents();
      setNotice(`${result.count} student ${result.count === 1 ? 'record was' : 'records were'} imported.`);
    });
  }

  async function saveFee(event) {
    event.preventDefault();
    if (!feeStudent) return;
    const form = new FormData(event.currentTarget);
    await perform(async () => {
      await postJson(`/fees/${feeStudent.student_id}`, {
        paid_amount: form.get('paid_amount'),
        notes: form.get('notes'),
      }, 'PUT');
      setFeeStudent(null);
      await dispatch(loadFees()).unwrap();
    }, 'Fee record updated.');
  }

  async function generateAnalytics(event) {
    event.preventDefault();
    setAnalyticsLoading(true);
    setLocalError('');
    try {
      const params = new URLSearchParams({
        filter_type: analyticsType,
        class: analyticsClass,
        student_id: analyticsStudent,
        year: analyticsYear,
        month: analyticsMonth,
      });
      setAnalytics(await request(`/analytics?${params}`));
      setAnalyticsLoaded(true);
    } catch (error) {
      setLocalError(error.message);
    } finally {
      setAnalyticsLoading(false);
    }
  }

  async function downloadFeesPdf() {
    await perform(async () => {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('Deeniyat Maktab - Collection Register', 14, 18);
      doc.setFontSize(9);
      doc.text(`Generated ${new Date().toLocaleDateString('en-IN')}  |  Expected ${money(feeTotals.expected)}  |  Collected ${money(feeTotals.collected)}  |  Pending ${money(feeTotals.pending)}`, 14, 26);
      let y = 37;
      const columns = ['Sr No.', 'Student', 'Class', 'Paid', 'Balance', 'Notes'];
      const widths = [20, 50, 30, 28, 30, 38];
      doc.setFont(undefined, 'bold');
      columns.forEach((column, index) => doc.text(column, 14 + widths.slice(0, index).reduce((sum, width) => sum + width, 0), y));
      doc.setFont(undefined, 'normal');
      y += 8;
      filteredFees.forEach((fee) => {
        if (y > 280) {
          doc.addPage();
          y = 18;
        }
        const values = [fee.sr, fee.name, fee.class, money(fee.paid_amount), money(FIXED_FEE - fee.paid_amount), fee.notes || '-'];
        values.forEach((value, index) => {
          const text = doc.splitTextToSize(String(value), widths[index] - 3);
          doc.text(text.slice(0, 2), 14 + widths.slice(0, index).reduce((sum, width) => sum + width, 0), y);
        });
        y += 8;
      });
      doc.save('Deeniyat-Collection-Ledger.pdf');
    });
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Deeniyat Maktab Portal home">
          <span className="brand-mark" aria-hidden="true">D</span>
          <span className="brand-copy">
            <strong>Deeniyat Maktab</strong>
            <span>Student management portal</span>
          </span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <button className={view === 'attendance' ? 'nav-link active' : 'nav-link'} onClick={() => setView('attendance')}>Attendance</button>
          <button className={view === 'analytics' ? 'nav-link active' : 'nav-link'} onClick={() => setView('analytics')}>Analytics</button>
          <button className={view === 'roster' ? 'nav-link active' : 'nav-link'} onClick={() => setView('roster')}>Manage roster</button>
          <button className={view === 'fees' ? 'nav-link active nav-fees' : 'nav-link nav-fees'} onClick={() => setView('fees')}>Fees ledger</button>
        </nav>
        <div className="today-pill"><span className="live-dot" /> {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
      </header>

      <section className="page-heading">
        <div>
          <p className="eyebrow">MAKTAB OVERVIEW</p>
          <h1>{view === 'attendance' ? 'Attendance sheet' : view === 'roster' ? 'Manage your roster' : view === 'fees' ? 'Fees & collections' : 'Attendance analytics'}</h1>
          <p className="page-subtitle">
            {view === 'attendance' && 'Take attendance and share a daily class update.'}
            {view === 'roster' && 'Add students, update their details, or import a class list.'}
            {view === 'fees' && 'Keep track of student payments and outstanding balances.'}
            {view === 'analytics' && 'Review historical attendance by student or class.'}
          </p>
        </div>
        <div className="heading-count"><strong>{students.length}</strong><span>students enrolled</span></div>
      </section>

      {pageError && <div className="alert alert-error" role="alert"><span>{pageError}</span><button onClick={() => { setLocalError(''); dispatch(clearError()); }} aria-label="Dismiss error">×</button></div>}
      {notice && <div className="alert alert-success" role="status"><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Dismiss message">×</button></div>}

      {view === 'attendance' && (
        <>
          <section className="stats-grid">
            <StatCard label="Students in view" value={visibleStudents.length} detail={classFilter === 'All' ? 'Across all classes' : classFilter} tone="blue" />
            <StatCard label="Present today" value={attendanceCount} detail={`${visibleStudents.length ? Math.round((attendanceCount / visibleStudents.length) * 100) : 0}% attendance`} tone="green" />
            <StatCard label="Not marked present" value={visibleStudents.length - attendanceCount} detail="Can be finalized as absent" tone="orange" />
          </section>
          <section className="content-grid">
            <div className="panel roster-panel">
              <div className="panel-heading">
                <div><h2>Today&apos;s roster</h2><p>Tap a status to update attendance.</p></div>
                <span className="subtle-count">{visibleStudents.length} students</span>
              </div>
              <div className="toolbar">
                <label className="search-box"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or serial no." /></label>
                <select aria-label="Filter attendance by class" value={classFilter} onChange={(event) => setClassFilter(event.target.value)}><ClassOptions classes={classes} /></select>
                <button className="button button-soft" onClick={markAllPresent} disabled={busy || !visibleStudents.length}>✓ <span className="button-label">Mark all present</span></button>
              </div>
              <StudentTable students={visibleStudents} mode="attendance" onToggle={toggleAttendance} loading={loadingStudents || busy} />
            </div>
            <aside className="panel report-panel">
              <div className="panel-heading">
                <div><h2>Daily report</h2><p>Ready to share with your group.</p></div>
                <span className="report-icon" aria-hidden="true">↗</span>
              </div>
              <AttendanceReport students={students} classFilter={classFilter} />
              <button className="button button-whatsapp" onClick={finalizeAttendance} disabled={busy || !students.length}>
                {busy ? 'Saving attendance…' : '✓ Finalize & copy report'}
              </button>
              <p className="helper-text">Students not marked present will be recorded as absent for today.</p>
            </aside>
          </section>
        </>
      )}

      {view === 'roster' && (
        <section className="roster-management">
          <div className="manager-grid">
            <form className="panel form-panel" onSubmit={saveStudent}>
              <div className="panel-heading"><div><h2>{editingStudent ? 'Edit student' : 'Add a student'}</h2><p>Student details are saved to the current roster.</p></div></div>
              <div className="form-grid">
                <label>Serial number<input required value={studentForm.sr} disabled={Boolean(editingStudent)} placeholder="e.g. 101" onChange={(event) => setStudentForm({ ...studentForm, sr: event.target.value })} /></label>
                <label>Full name<input required value={studentForm.name} placeholder="Student name" onChange={(event) => setStudentForm({ ...studentForm, name: event.target.value })} /></label>
                <label>Class<input required value={studentForm.class} placeholder="e.g. Class 1" onChange={(event) => setStudentForm({ ...studentForm, class: event.target.value })} /></label>
                <label>Mobile number<input required value={studentForm.mobile} placeholder="Contact number" onChange={(event) => setStudentForm({ ...studentForm, mobile: event.target.value })} /></label>
              </div>
              <div className="form-actions">
                {editingStudent && <button className="button button-plain" type="button" onClick={() => { setEditingStudent(null); setStudentForm({ sr: '', name: '', class: '', mobile: '' }); }}>Cancel</button>}
                <button className="button button-primary" disabled={busy}>{editingStudent ? 'Save changes' : 'Add student'}</button>
              </div>
            </form>
            <form className="panel import-panel" onSubmit={importCsv}>
              <div className="panel-heading"><div><h2>Import a roster</h2><p>Quickly add or update multiple students at once.</p></div><span className="upload-icon" aria-hidden="true">↑</span></div>
              <label className="upload-box"><span className="upload-symbol">＋</span><strong>Choose a CSV file</strong><span>Use columns: sr, name, class, mobile</span><input name="csv_file" type="file" accept=".csv,text/csv" required /></label>
              <button className="button button-dark" disabled={busy}>Upload student list</button>
            </form>
          </div>
          <div className="panel">
            <div className="panel-heading">
              <div><h2>Student directory</h2><p>Edit contact details and class assignments.</p></div>
              <label className="search-box compact-search"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a student" /></label>
            </div>
            <StudentTable students={visibleStudents} mode="roster" onEdit={editStudent} loading={loadingStudents} />
          </div>
        </section>
      )}

      {view === 'fees' && (
        <>
          <section className="stats-grid">
            <StatCard label="Expected fees" value={money(feeTotals.expected)} detail={`${filteredFees.length} students in view`} tone="blue" />
            <StatCard label="Collected" value={money(feeTotals.collected)} detail="Payments recorded" tone="green" />
            <StatCard label="Balance due" value={money(feeTotals.pending)} detail="Outstanding amount" tone="orange" />
          </section>
          <section className="panel">
            <div className="panel-heading">
              <div><h2>Collection ledger</h2><p>Manage payments against the ₹{FIXED_FEE.toLocaleString('en-IN')} student fee.</p></div>
              <button className="button button-soft" onClick={downloadFeesPdf}>↓ <span className="button-label">Download PDF</span></button>
            </div>
            <div className="toolbar fee-toolbar">
              <label className="search-box"><span aria-hidden="true">⌕</span><input value={feeSearch} onChange={(event) => setFeeSearch(event.target.value)} placeholder="Search by name or serial no." /></label>
              <select aria-label="Filter fees by class" value={feeClass} onChange={(event) => setFeeClass(event.target.value)}><ClassOptions classes={classes} /></select>
              <select aria-label="Filter fees by payment status" value={feeStatus} onChange={(event) => setFeeStatus(event.target.value)}><option value="All">All payment statuses</option><option value="Paid">Fully paid</option><option value="Unpaid">Balance due</option></select>
            </div>
            <div className="table-wrap"><table className="data-table fee-table">
              <thead><tr><th>Student</th><th>Class</th><th>Paid</th><th>Balance</th><th>Notes</th><th aria-label="Actions" /></tr></thead>
              <tbody>
                {filteredFees.map((fee) => {
                  const balance = FIXED_FEE - Number(fee.paid_amount);
                  return <tr key={fee.student_id}>
                    <td><div className="student-cell"><strong>{fee.name}</strong><span>#{fee.sr}</span></div></td>
                    <td>{fee.class}</td>
                    <td className="amount-paid">{money(fee.paid_amount)}</td>
                    <td className={balance > 0 ? 'amount-due' : 'amount-paid'}>{money(balance)}</td>
                    <td className="notes-cell">{fee.notes || '—'}</td>
                    <td><button className="button button-small button-plain" onClick={() => setFeeStudent(fee)}>Manage</button></td>
                  </tr>;
                })}
                {!filteredFees.length && <EmptyRow columns={6} loading={loadingFees} />}
              </tbody>
            </table></div>
          </section>
        </>
      )}

      {view === 'analytics' && (
        <section className="panel analytics-panel">
          <div className="panel-heading"><div><h2>Attendance history</h2><p>Generate a monthly or yearly attendance report.</p></div></div>
          <form className="analytics-filters" onSubmit={generateAnalytics}>
            <label>Report type<select value={analyticsType} onChange={(event) => setAnalyticsType(event.target.value)}><option value="class">Class summary</option><option value="student">Individual student</option></select></label>
            {analyticsType === 'class'
              ? <label>Class<select value={analyticsClass} onChange={(event) => setAnalyticsClass(event.target.value)}><ClassOptions classes={classes} /></select></label>
              : <label>Student<select value={analyticsStudent} onChange={(event) => setAnalyticsStudent(event.target.value)}>{students.map((student) => <option key={student.id} value={student.id}>[{student.sr}] {student.name} ({student.class})</option>)}</select></label>}
            <label>Year<select value={analyticsYear} onChange={(event) => setAnalyticsYear(event.target.value)}>{years.map((year) => <option key={year}>{year}</option>)}</select></label>
            <label>Period<select value={analyticsMonth} onChange={(event) => setAnalyticsMonth(event.target.value)}><option value="All">Full year</option>{MONTHS.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}</select></label>
            <button className="button button-primary" disabled={analyticsLoading || !students.length}>{analyticsLoading ? 'Generating…' : 'Generate report'}</button>
          </form>
          {analyticsLoaded && (analyticsType === 'student'
            ? <div className="table-wrap analytics-results"><table className="data-table">
              <thead><tr><th>Date</th><th>Serial no.</th><th>Student</th><th>Class</th><th>Status</th></tr></thead>
              <tbody>{analytics.map((row) => <tr key={`${row.sr}-${row.date}`}><td>{row.date}</td><td>{row.sr}</td><td><strong>{row.name}</strong></td><td>{row.class}</td><td><StatusBadge status={row.status} /></td></tr>)}{!analytics.length && <EmptyRow columns={5} />}</tbody>
            </table></div>
            : <div className="table-wrap analytics-results"><table className="data-table">
              <thead><tr><th>Serial no.</th><th>Student</th><th>Class</th><th>Present</th><th>Absent</th><th>Attendance rate</th></tr></thead>
              <tbody>{analytics.map((row) => {
                const present = Number(row.present_count || 0);
                const total = Number(row.total_days || 0);
                const rate = total ? Math.round((present / total) * 100) : 0;
                return <tr key={row.sr}><td>{row.sr}</td><td><strong>{row.name}</strong></td><td>{row.class}</td><td className="amount-paid">{present} days</td><td className="amount-due">{Number(row.absent_count || 0)} days</td><td><div className="rate-cell"><span>{rate}%</span><div className="progress-track"><span style={{ width: `${rate}%` }} /></div></div></td></tr>;
              })}{!analytics.length && <EmptyRow columns={6} />}</tbody>
            </table></div>)}
        </section>
      )}

      {feeStudent && <FeeModal student={feeStudent} onClose={() => setFeeStudent(null)} onSubmit={saveFee} busy={busy} />}
      <footer className="footer">Deeniyat Maktab <span>·</span> Attendance & fee management</footer>
    </main>
  );
}

function ClassOptions({ classes }) {
  return <><option value="All">All classes</option>{classes.map((className) => <option key={className} value={className}>{className}</option>)}</>;
}

function StatCard({ label, value, detail, tone }) {
  return <article className={`stat-card stat-${tone}`}><span className="stat-label">{label}</span><strong className="stat-value">{value}</strong><span className="stat-detail">{detail}</span></article>;
}

function EmptyRow({ columns, loading = false }) {
  return <tr><td className="empty-cell" colSpan={columns}>{loading ? 'Loading records…' : 'No records found for these filters.'}</td></tr>;
}

function StudentTable({ students, mode, onToggle, onEdit, loading }) {
  return <div className="table-wrap"><table className="data-table">
    <thead><tr><th>Student</th><th>Class</th>{mode === 'roster' ? <><th>Mobile</th><th>Attendance</th><th aria-label="Actions" /></> : <><th>Today&apos;s status</th>{mode === 'attendance' && <th aria-label="Mark attendance" />}</>}</tr></thead>
    <tbody>{students.map((student) => <tr key={student.id}>
      <td><div className="student-cell"><strong>{student.name}</strong><span>#{student.sr}</span></div></td>
      <td>{student.class}</td>
      {mode === 'roster'
        ? <><td>{student.mobile || '—'}</td><td><StatusBadge status={student.today_status} /></td><td><button className="button button-small button-plain" onClick={() => onEdit(student)}>Edit</button></td></>
        : <><td><StatusBadge status={student.today_status} /></td>{mode === 'attendance' && <td><button className={`attendance-toggle ${student.today_status === 'Present' ? 'is-present' : ''}`} disabled={loading} onClick={() => onToggle(student, student.today_status === 'Present' ? 'Absent' : 'Present')} aria-label={`Mark ${student.name} ${student.today_status === 'Present' ? 'absent' : 'present'}`}>{student.today_status === 'Present' ? '✓' : '+'}</button></td>}</>}
    </tr>)}{!students.length && <EmptyRow columns={mode === 'roster' ? 5 : mode === 'attendance' ? 4 : 3} loading={loading} />}</tbody>
  </table></div>;
}

function StatusBadge({ status }) {
  return <span className={`status-badge ${status === 'Present' ? 'status-present' : 'status-absent'}`}><span />{status || 'Absent'}</span>;
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

function AttendanceReport({ students, classFilter }) {
  const roster = students.filter((student) => classFilter === 'All' || student.class === classFilter);
  const absent = roster.filter((student) => student.today_status !== 'Present');
  return <div className="report-preview">
    <div className="report-date">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
    <div className="report-summary"><span><strong>{roster.length - absent.length}</strong> present</span><span><strong>{absent.length}</strong> absent</span></div>
    <div className="report-divider" />
    <strong className="absent-heading">{absent.length ? 'Absent students' : 'All students are present'}</strong>
    <ul className="absent-list">{absent.length ? absent.map((student) => <li key={student.id}>{student.name}<span>{student.class}</span></li>) : <li className="all-present">Great work — the whole class is here.</li>}</ul>
  </div>;
}

function FeeModal({ student, onClose, onSubmit, busy }) {
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <form className="modal-card" onSubmit={onSubmit}>
      <button className="modal-close" type="button" onClick={onClose} aria-label="Close">×</button>
      <p className="eyebrow">FEE RECORD</p>
      <h2>Manage payment</h2>
      <p className="modal-student">{student.name} <span>· #{student.sr} · {student.class}</span></p>
      <label>Amount paid (₹)<input name="paid_amount" type="number" min="0" max={FIXED_FEE} step="0.01" defaultValue={student.paid_amount} required /></label>
      <label>Notes<input name="notes" type="text" defaultValue={student.notes} placeholder="Optional payment note" /></label>
      <div className="modal-actions"><button type="button" className="button button-plain" onClick={onClose}>Cancel</button><button className="button button-primary" disabled={busy}>{busy ? 'Saving…' : 'Save payment'}</button></div>
    </form>
  </div>;
}

export default App;
