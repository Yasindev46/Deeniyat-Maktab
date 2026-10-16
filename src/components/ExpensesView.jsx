import { useMemo, useState } from 'react';
import { toArray } from '../Utils/arrays';
import { EmptyRow, StatCard } from './shared';
import '../css/ExpensesView.css';

const money = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;
const LAST_YEAR_BALANCE_KEY = 'deeniyat.lastYearBalance';

function readLastYearBalance() {
  try {
    const storedBalance = window.localStorage.getItem(LAST_YEAR_BALANCE_KEY);
    const balance = storedBalance === null ? 0 : Number(storedBalance);
    if (!Number.isFinite(balance) || balance < 0) {
      return { balance: 0, error: 'The saved last year balance is invalid. Enter a new amount to replace it.' };
    }
    return { balance, error: '' };
  } catch {
    return { balance: 0, error: 'Unable to read the last year balance from local storage.' };
  }
}

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
  const safeFees = toArray(fees);
  const safeExpenses = toArray(expenses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [date, setDate] = useState(todayInputDate);
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [initialLastYearBalance] = useState(readLastYearBalance);
  const [lastYearBalance, setLastYearBalance] = useState(initialLastYearBalance.balance);
  const [lastYearBalanceInput, setLastYearBalanceInput] = useState(String(initialLastYearBalance.balance));
  const [lastYearBalanceError, setLastYearBalanceError] = useState(initialLastYearBalance.error);

  const totalCollected = useMemo(
    () => safeFees.reduce((total, fee) => total + Number(fee.paid_amount || 0), 0),
    [safeFees],
  );
  const totalExpenses = useMemo(
    () => safeExpenses.reduce((total, expense) => total + Number(expense.amount || 0), 0),
    [safeExpenses],
  );
  const totalAvailable = totalCollected + lastYearBalance - totalExpenses;
  const sortedExpenses = useMemo(
    () => [...safeExpenses].sort((first, second) => (
      String(second.date).localeCompare(String(first.date))
      || Number(second.exp_id) - Number(first.exp_id)
    )),
    [safeExpenses],
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

  function submitLastYearBalance(event) {
    event.preventDefault();
    const balance = Number(lastYearBalanceInput);
    if (!Number.isFinite(balance) || balance < 0) {
      setLastYearBalanceError('Enter a valid balance of zero or more.');
      return;
    }

    try {
      window.localStorage.setItem(LAST_YEAR_BALANCE_KEY, String(balance));
      setLastYearBalance(balance);
      setLastYearBalanceError('');
    } catch {
      setLastYearBalanceError('Unable to save the last year balance to local storage.');
    }
  }

  async function confirmDeleteExpense() {
    if (await onDeleteExpense(expenseToDelete)) setExpenseToDelete(null);
  }

  return (
    <div className='expenses-container'>
      <section className="stats-grid expenses-stats-grid">
        <StatCard label="Total collected" value={money(totalCollected)} detail="Payments recorded" tone="green" view="Expenses" />
        <StatCard label="Last year balance" value={money(lastYearBalance)} detail="Saved on this device" tone="blue" />
        <StatCard label="Total expenses" value={money(totalExpenses)} detail={`${safeExpenses.length} expenses recorded`} tone="orange" />
        <StatCard label="Total available" value={money(totalAvailable)} detail="Collected + last year balance − expenses" tone="blue" />
      </section>

      <section className="panel expenses-panel">
        <div className="panel-heading">
          <div>
            <h2>Expenses ledger</h2>
            <p>Record and review expense entries saved to the database.</p>
          </div>
          
          <div className="panel-actions" style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="button button-soft" onClick={() => onDownloadPdf(safeExpenses, totalCollected, totalExpenses, lastYearBalance)} disabled={busy}>↓ <span className="button-label">Download PDF</span></button>
          </div>
        </div>
        <div className="toolbar expenses-toolbar">
          <label className="search-box"><span aria-hidden="true">⌕</span><input value={expenseSearch} onChange={(event) => setExpenseSearch(event.target.value)} placeholder="Search by purpose or date." /></label>
          <form className="expenses-balance-form" onSubmit={submitLastYearBalance}>
            <label className="visually-hidden" htmlFor="last-year-balance">Last year balance (₹)</label>
            <input
              id="last-year-balance"
              type="number"
              min="0"
              step="0.01"
              value={lastYearBalanceInput}
              onChange={(event) => setLastYearBalanceInput(event.target.value)}
              placeholder="Last year balance (₹)"
              aria-label="Last year balance in rupees"
              required
            />
            <button className="button button-primary" type="submit">Save last year balance</button>
          </form>
            <button className="button button-primary" onClick={openExpenseModal}>＋ Add expense</button>
        </div>
        {lastYearBalanceError && <p className="expenses-balance-error" role="alert">{lastYearBalanceError}</p>}
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
                  <td className="amount-due"><button className="button button-small button-plain" onClick={() => setExpenseToDelete(expense)}>Delete</button></td>
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

      {expenseToDelete && (
        <div
          className="expense-modal-backdrop"
          onMouseDown={(event) => {
            if (!busy && event.target === event.currentTarget) setExpenseToDelete(null);
          }}
        >
          <section
            className="expense-modal expense-confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-expense-title"
            aria-describedby="delete-expense-description"
          >
            <p className="eyebrow">CONFIRM DELETION</p>
            <h2 id="delete-expense-title">Delete this expense?</h2>
            <p id="delete-expense-description" className="expense-confirm-description">
              This expense record will be permanently removed.
            </p>
            <dl className="expense-confirm-details">
              <div><dt>Date</dt><dd>{formatExpenseDate(String(expenseToDelete.date || ''))}</dd></div>
              <div><dt>Purpose</dt><dd>{expenseToDelete.purpose || '—'}</dd></div>
              <div><dt>Amount</dt><dd>{money(expenseToDelete.amount)}</dd></div>
              <div><dt>Record ID</dt><dd>{expenseToDelete.exp_id}</dd></div>
            </dl>
            <div className="expense-modal-actions">
              <button className="button button-plain" type="button" onClick={() => setExpenseToDelete(null)} disabled={busy}>
                Cancel
              </button>
              <button className="button button-danger" type="button" onClick={confirmDeleteExpense} disabled={busy}>
                {busy ? 'Deleting…' : 'Confirm delete'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
