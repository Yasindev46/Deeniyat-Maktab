import { lazy, Suspense, useMemo, useState } from 'react';
import { ClassOptions, EmptyRow, StatCard } from './shared';
import '../css/FeesView.css';

const FeeModal = lazy(() => import('./FeeModal'));
const FIXED_FEE = 2400;
const money = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

export default function FeesView({ fees, classes, loading, busy, onSaveFee, onDownloadPdf }) {
  const [feeClass, setFeeClass] = useState('All');
  const [feeStatus, setFeeStatus] = useState('All');
  const [feeSearch, setFeeSearch] = useState('');
  const [feeStudent, setFeeStudent] = useState(null);
  const filteredFees = useMemo(() => {
    const query = feeSearch.trim().toLocaleLowerCase();
    return fees.filter((fee) => {
      const balance = FIXED_FEE - Number(fee.paid_amount);
      return (feeClass === 'All' || fee.class === feeClass)
        && `${fee.name} ${fee.sr}`.toLocaleLowerCase().includes(query)
        && (feeStatus === 'All' || (feeStatus === 'Paid' ? balance <= 0 : balance > 0));
    });
  }, [feeClass, feeSearch, feeStatus, fees]);
  const totals = filteredFees.reduce((result, fee) => ({
    expected: result.expected + FIXED_FEE,
    collected: result.collected + Number(fee.paid_amount),
    pending: result.pending + FIXED_FEE - Number(fee.paid_amount),
  }), { expected: 0, collected: 0, pending: 0 });

  async function submitFee(student, values) {
    if (await onSaveFee(student, values)) setFeeStudent(null);
  }

  return (
    <>
      <section className="stats-grid">
        <StatCard label="Expected fees" value={money(totals.expected)} detail={`${filteredFees.length} students in view`} tone="blue" />
        <StatCard label="Collected" value={money(totals.collected)} detail="Payments recorded" tone="green" />
        <StatCard label="Balance due" value={money(totals.pending)} detail="Outstanding amount" tone="orange" />
      </section>
      <section className="panel">
        <div className="panel-heading">
          <div><h2>Collection ledger</h2><p>Manage payments against the ₹{FIXED_FEE.toLocaleString('en-IN')} student fee.</p></div>
          <button className="button button-soft" onClick={() => onDownloadPdf(filteredFees, totals)} disabled={busy}>↓ <span className="button-label">Download PDF</span></button>
        </div>
        <div className="toolbar fee-toolbar">
          <label className="search-box"><span aria-hidden="true">⌕</span><input value={feeSearch} onChange={(event) => setFeeSearch(event.target.value)} placeholder="Search by name or serial no." /></label>
          <select aria-label="Filter fees by class" value={feeClass} onChange={(event) => setFeeClass(event.target.value)}><ClassOptions classes={classes} /></select>
          <select aria-label="Filter fees by payment status" value={feeStatus} onChange={(event) => setFeeStatus(event.target.value)}><option value="All">All payment statuses</option><option value="Paid">Fully paid</option><option value="Unpaid">Balance due</option></select>
        </div>
        <div className="table-wrap">
          <table className="data-table fee-table">
            <thead><tr><th>Student</th><th>Class</th><th>Paid</th><th>Balance</th><th>Notes</th><th aria-label="Actions" /></tr></thead>
            <tbody>
              {filteredFees.map((fee) => {
                const balance = FIXED_FEE - Number(fee.paid_amount);
                return (
                  <tr key={fee.student_id}>
                    <td><div className="student-cell"><strong>{fee.name}</strong><span>#{fee.sr}</span></div></td>
                    <td>{fee.class}</td>
                    <td className="amount-paid">{money(fee.paid_amount)}</td>
                    <td className={balance > 0 ? 'amount-due' : 'amount-paid'}>{money(balance)}</td>
                    <td className="notes-cell">{fee.notes || '—'}</td>
                    <td><button className="button button-small button-plain" onClick={() => setFeeStudent(fee)}>Manage</button></td>
                  </tr>
                );
              })}
              {!filteredFees.length && <EmptyRow columns={6} loading={loading} />}
            </tbody>
          </table>
        </div>
      </section>
      {feeStudent && (
        <Suspense fallback={<div className="modal-backdrop"><div className="modal-card">Loading payment form…</div></div>}>
          <FeeModal student={feeStudent} busy={busy} onClose={() => setFeeStudent(null)} onSubmit={submitFee} />
        </Suspense>
      )}
    </>
  );
}
