import { useEffect,useState } from 'react';
import '../css/FeeModal.css';

export default function FeeModal({ student, onClose, onSubmit, busy }) {

  async function handleSubmit(event) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    await onSubmit(student, {
       paid_amount:(student.paid_amount + parseFloat(values.get('paid_amount'))),
      notes: values.get('notes'),
    });
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <form className="modal-card" onSubmit={handleSubmit}>
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close">×</button>
        <p className="eyebrow">FEE RECORD</p>
        <h2>Manage payment</h2>
        <p className="modal-student">{student.name} <span>· #{student.sr} · <strong className="modal-student">Class - </strong> {student.class} <br></br></span> Contact No - <span> {student.mobile}</span></p>
        <label>Amount paid (₹)<input name="paid_amount" type="number"  max="2400" step="0.01" required /></label>
        <label>Notes & Date<input name="notes" type="text" defaultValue={student.notes} placeholder="Optional payment note" /></label>
        <div className="modal-actions">
          <button type="button" className="button button-plain" onClick={onClose}>Cancel</button>
          <button className="button button-primary" disabled={busy}>{busy ? 'Saving…' : 'Save payment'}   </button>
        </div>
      </form>
    </div>
  );
}
