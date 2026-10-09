import { postJson, request } from '../api';
import { clearError, loadExpenses, loadFees, loadStudents } from '../store';

const FIXED_FEE = 2400;

export const VIEW_COPY = {
  attendance: ['Attendance sheet', 'Take attendance and share a daily class update.'],
  analytics: ['Attendance analytics', 'Review historical attendance by student or class.'],
  roster: ['Manage students details', 'Add students, update their details, or import a class list.'],
  fees: ['Fees & collections', 'Keep track of student payments and outstanding balances.'],
  expenses: ['Expenses', 'Keep track of total expenses and payments.'],
};

export const getClasses = (students) =>
  [...new Set(students.map((student) => student.class))].sort((a, b) => a.localeCompare(b));

export const createRupeeSymbolImage = () => {
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

export const buildAttendanceMessage = (students, classFilter) => {
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

export const addPdfCurrency = (doc, symbolImage, amount, x, y) => {
  const symbolWidth = 3.4;
  const symbolHeight = 3.4;
  const symbolGap = 0.8;
  doc.addImage(symbolImage, 'PNG', x, y - symbolHeight + 0.4, symbolWidth, symbolHeight);
  const value = Number(amount || 0).toLocaleString('en-IN');
  doc.text(value, x + symbolWidth + symbolGap, y);
  return symbolWidth + symbolGap + doc.getTextWidth(value);
}

export const createAppActions = ({ dispatch, setBusy, setLocalError, setNotice }) => {
  async function perform(action, successMessage = '') {
    dispatch(clearError());
    setLocalError('');
    setNotice('');
    setBusy(true);
    try {
      const result = await action();
      if (successMessage) {
      setNotice(successMessage);
      setTimeout(() => setNotice(''), 3000);
      }
      return result ?? true;
    } catch (error) {
      setLocalError(error.message || 'The request could not be completed.');
      return false;
    } finally {
      setBusy(false);
    }
  }

  function dismissError() {
    setLocalError('');
    dispatch(clearError());
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

  async function saveExpense(values) {
    console.log('Saving expense:', values);
    return perform(async () => {
      await postJson('/expenses', values);
      await dispatch(loadExpenses()).unwrap();
    }, 'Expense saved.');
  
  
};

async function onDeleteExpense(expense) {
  return perform(async () => {
    await request(`/expenses/${expense.exp_id}`, { method: 'DELETE' });
    await dispatch(loadExpenses()).unwrap();
  }, 'Expense record deleted.');
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
      const columns = ['Sr No.', 'Student', 'Mobile', 'Class', 'Paid', 'Balance', 'Notes'];
      const widths = [15, 35, 25, 21, 25, 26, 35];
      doc.setFont(undefined, 'bold');
      columns.forEach((column, index) => doc.text(column, 14 + widths.slice(0, index).reduce((sum, width) => sum + width, 0), y));
      doc.setFont(undefined, 'normal');
      y += 8;
      filteredFees.forEach((fee) => {
        if (y > 280) {
          doc.addPage();
          y = 18;
        }
        const values = [fee.sr, fee.name, fee.mobile || '-', fee.class, fee.paid_amount, FIXED_FEE - fee.paid_amount, fee.notes || '-'];
        values.forEach((value, index) => {
          const x = 14 + widths.slice(0, index).reduce((sum, width) => sum + width, 0);
          if (index === 4 || index === 5) {
            addPdfCurrency(doc, rupeeSymbolImage, index === 4 ? fee.paid_amount : FIXED_FEE - fee.paid_amount, x, y);
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

  async function downloadExpensesPdf(expenses, totalCollected, totalExpenses) {
    return perform(async () => {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      const rupeeSymbolImage = createRupeeSymbolImage();
      doc.setFontSize(16);
      doc.text('Deeniyat Maktab - Expenses Report', 14, 18);
      doc.setFontSize(9);
      doc.text(`Generated ${new Date().toLocaleDateString('en-IN')}`, 14, 26);
      doc.setFontSize(9);
      [
        ['Total Collected', totalCollected, 14],
        ['Total Expenses', totalExpenses, 77],
        ['Total Available', totalCollected - totalExpenses, 140],
      ].forEach(([label, amount, x]) => {
        doc.text(label, x, 36);
        addPdfCurrency(doc, rupeeSymbolImage, amount, x, 43);
      });

      const drawTableHeader = (y) => {
        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        doc.text('Date', 14, y);
        doc.text('Purpose', 50, y);
        doc.text('Amount', 160, y);
        doc.setFont(undefined, 'normal');
        return y + 7;
      };

      let y = drawTableHeader(56);
      if (expenses.length === 0) {
        doc.setFontSize(9);
        doc.text('No expense records found.', 14, y);
      } else {
        expenses.forEach((expense) => {
          const purpose = doc.splitTextToSize(String(expense.purpose || '-'), 106);
          const rowHeight = Math.max(8, purpose.length * 5 + 3);
          if (y + rowHeight > 282) {
            doc.addPage();
            y = drawTableHeader(20);
          }

          const date = String(expense.date || '');
          const displayDate = /^\d{4}-\d{2}-\d{2}$/.test(date)
            ? new Date(`${date}T00:00:00`).toLocaleDateString('en-IN')
            : (date || '-');
          const amount = Number(expense.amount ?? expense.paid_amount ?? 0);

          doc.text(displayDate, 14, y);
          doc.text(purpose, 50, y);
          addPdfCurrency(doc, rupeeSymbolImage, amount, 160, y);
          y += rowHeight;
        });
      }

      doc.save('Deeniyat-Expenses-Report.pdf');
    });
  }
  return {
    dismissError,
    handleViewError,
    toggleAttendance,
    markAllPresent,
    finalizeAttendance,
    saveStudent,
    importRoster,
    saveFee,
    saveExpense,
    downloadFeesPdf,
    downloadExpensesPdf,
    onDeleteExpense
  };
};