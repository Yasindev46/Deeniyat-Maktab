import { useMemo, useState } from 'react';
import { EmptyRow, StatCard } from './shared';
import '../css/ExpensesView.css';

const money = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

function todayInputDate() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${today.getFullYear()}-${month}-${day}`;
}

function formatExpenseDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-IN');
}

export default function ExpensesView({ fees = [], expenses = [], loading, busy, onSaveExpense, onDeleteExpense,onDownloadPdf }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [date, setDate] = useState(todayInputDate);
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [expenseSearch, setExpenseSearch] = useState('');

  const totalCollected = useMemo(
    () => fees.reduce((total, fee) => total + Number(fee.paid_amount || 0), 0),
    [fees],
  );
  const totalExpenses = useMemo(
    () => expenses.reduce((total, expense) => total + Number(expense.amount || 0), 0),
    [expenses],
  );
  const sortedExpenses = useMemo(
    () => [...expenses].sort((first, second) => (
      String(second.date).localeCompare(String(first.date))
      || Number(second.exp_id) - Number(first.exp_id)
    )),
    [expenses],
  );
  const filteredExpenses = useMemo(() => {
    const query = expenseSearch.trim().toLocaleLowerCase();
    if (!query) return sortedExpenses;

    return sortedExpenses.filter((expense) => [
      expense.purpose,
      expense.date,
      formatExpenseDate(String(expense.date || '')),
      expense.amount,
      money(expense.amount),
    ].some((value) => String(value ?? '').toLocaleLowerCase().includes(query)));
  }, [expenseSearch, sortedExpenses]);

  function openExpenseModal() {
    setDate(todayInputDate());
    setAmount('');
    setPurpose('');
    setIsModalOpen(true);
  }

  async function submitExpense(event) {
    event.preventDefault();
    if (await onSaveExpense({ date, amount: Number(amount), purpose })) setIsModalOpen(false);
  }

  return (
    <>
      <section className="stats-grid">
        <StatCard label="Total collected" value={money(totalCollected)} detail="Payments recorded" tone="green" />
        <StatCard label="Total expenses" value={money(totalExpenses)} detail={`${expenses.length} expenses recorded`} tone="orange" />
        <StatCard label="Total available" value={money(totalCollected - totalExpenses)} detail="After expenses" tone="blue" />
      </section>

      <section className="panel expenses-panel">
        <div className="panel-heading">
          <div>
            <h2>Expenses ledger</h2>
            <p>Record and review expense entries saved to the database.</p>
          </div>
          
          <div className="panel-actions" style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="button button-soft" onClick={() => onDownloadPdf(expenses, totalCollected, totalExpenses)} disabled={busy}>↓ <span className="button-label">Download PDF</span></button>
          </div>
        </div>
        <div className="toolbar fee-toolbar" style={{ display: 'flex', justifyContent: 'space-between', gap: '2.5rem',  }}>
          <label className="search-box"><span aria-hidden="true">⌕</span><input value={expenseSearch} onChange={(event) => setExpenseSearch(event.target.value)} placeholder="Search by purpose or date." /></label>
            <button className="button button-primary" onClick={openExpenseModal}>＋ Add expense</button>
        </div>
        <div className="expenses-table-header">
        </div>

        <div className="table-wrap">
          <table className="data-table expenses-table">
            <thead>
              <tr><th>Date</th><th>Purpose</th><th>Amount</th><th>Manage</th></tr>
            </thead>
            <tbody>
              {filteredExpenses.map((expense) => (
                <tr key={expense.exp_id}>
                  <td>{formatExpenseDate(expense.date)}</td>
                  <td className="expense-purpose">{expense.purpose || '—'}</td>
                  <td className="amount-due">{money(expense.amount)}</td>
                  <td className="amount-due"><button className="button button-small button-plain" onClick={() => onDeleteExpense(expense)}>Delete</button></td>
                </tr>
              ))}
              {!filteredExpenses.length && <EmptyRow columns={4} loading={loading} />}
            </tbody>
          </table>
        </div>
        <p className="expenses-local-note">Expense records are saved to the server.</p>
      </section>

      {isModalOpen && (
        <div
          className="expense-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsModalOpen(false);
          }}
        >
          <form
            className="expense-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="expense-modal-title"
            onSubmit={submitExpense}
          >
            <button
              className="expense-modal-close"
              type="button"
              onClick={() => setIsModalOpen(false)}
              aria-label="Close add expense form"
            >
              ×
            </button>
            <p className="eyebrow">EXPENSE ENTRY</p>
            <h2 id="expense-modal-title">Add an expense</h2>
            <label>
              Date
              <input type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
            </label>
            <label>
              Amount (₹)
              <input
                type="number"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                min="0.01"
                step="0.01"
                placeholder="Enter amount"
                required
              />
            </label>
            <label>
              Purpose
              <input
                type="text"
                value={purpose}
                onChange={(event) => setPurpose(event.target.value)}
                maxLength="200"
                placeholder="What was this expense for?"
                required
              />
            </label>
            <div className="expense-modal-actions">
              <button className="button button-plain" type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="button button-primary" type="submit" disabled={busy}>Save expense</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
