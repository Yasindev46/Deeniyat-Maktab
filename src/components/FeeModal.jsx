import '../css/FeeModal.css';

export default function FeeModal({ student, onClose, onSubmit, busy }) {
  async function handleSubmit(event) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    await onSubmit(student, {
      paid_amount: values.get('paid_amount'),
      notes: values.get('notes'),
    });
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <form className="modal-card" onSubmit={handleSubmit}>
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close">×</button>
        <p className="eyebrow">FEE RECORD</p>
        <h2>Manage payment</h2>
        <p className="modal-student">{student.name} <span>· #{student.sr} · {student.class}</span></p>
        <label>Amount paid (₹)<input name="paid_amount" type="number" min="0" max="2400" step="0.01" defaultValue={student.paid_amount} required /></label>
        <label>Notes<input name="notes" type="text" defaultValue={student.notes} placeholder="Optional payment note" /></label>
        <div className="modal-actions">
          <button type="button" className="button button-plain" onClick={onClose}>Cancel</button>
          <button className="button button-primary" disabled={busy}>{busy ? 'Saving…' : 'Save payment'}</button>
        </div>
      </form>
    </div>
  );
}
