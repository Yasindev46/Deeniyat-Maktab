import { useMemo, useState } from 'react';
import { StudentTable } from './shared';
import '../css/RosterView.css';

const emptyStudent = { sr: '', name: '', class: '', mobile: '' };

export default function RosterView({ students, loading, busy, onSave, onImport }) {
  const [search, setSearch] = useState('');
  const [studentForm, setStudentForm] = useState(emptyStudent);
  const [editingStudent, setEditingStudent] = useState(null);
  const visibleStudents = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return students.filter((student) => `${student.name} ${student.sr}`.toLocaleLowerCase().includes(query));
  }, [search, students]);

  function editStudent(student) {
    setEditingStudent(student);
    setStudentForm({ sr: student.sr, name: student.name, class: student.class, mobile: student.mobile });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function submitStudent(event) {
    event.preventDefault();
    const saved = await onSave(studentForm, editingStudent);
    if (saved) {
      setStudentForm(emptyStudent);
      setEditingStudent(null);
    }
  }

  async function submitImport(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const file = form.elements.csv_file.files[0];
    if (file && await onImport(file)) form.reset();
  }

  return (
    <section className="roster-management">
      <div className="manager-grid">
        <form className="panel form-panel" onSubmit={submitStudent}>
          <div className="panel-heading">
            <div><h2>{editingStudent ? 'Edit student' : 'Add a student'}</h2><p>Student details are saved to the current roster.</p></div>
          </div>
          <div className="form-grid">
            <label>Serial number<input required value={studentForm.sr} disabled={Boolean(editingStudent)} placeholder="e.g. 101" onChange={(event) => setStudentForm({ ...studentForm, sr: event.target.value })} /></label>
            <label>Full name<input required value={studentForm.name} placeholder="Student name" onChange={(event) => setStudentForm({ ...studentForm, name: event.target.value })} /></label>
            <label>Class<input required value={studentForm.class} placeholder="e.g. Class 1" onChange={(event) => setStudentForm({ ...studentForm, class: event.target.value })} /></label>
            <label>Mobile number<input required value={studentForm.mobile} placeholder="Contact number" onChange={(event) => setStudentForm({ ...studentForm, mobile: event.target.value })} /></label>
          </div>
          <div className="form-actions">
            {editingStudent && <button className="button button-plain" type="button" onClick={() => { setEditingStudent(null); setStudentForm(emptyStudent); }}>Cancel</button>}
            <button className="button button-primary" disabled={busy}>{editingStudent ? 'Save changes' : 'Add student'}</button>
          </div>
        </form>
        <form className="panel import-panel" onSubmit={submitImport}>
          <div className="panel-heading">
            <div><h2>Import a student</h2><p>Quickly add or update multiple students at once.</p></div>
            {/* <span className="upload-icon" aria-hidden="true">↑</span> */}
          </div>
          <label className="upload-box">
            <span className="upload-symbol">＋</span><strong>Choose a CSV file</strong><span>Use columns: sr, name, class, mobile</span>
            <input name="csv_file" type="file" accept=".csv,text/csv" required />
          </label>
          <button className="button button-dark" disabled={busy}>Upload student list</button>
        </form>
      </div>
      <div className="panel">
        <div className="panel-heading">
          <div><h2>Student directory</h2><p>Edit contact details and class assignments.</p></div>
          <label className="search-box compact-search"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a student" /></label>
        </div>
        <StudentTable students={visibleStudents} mode="roster" onEdit={editStudent} loading={loading} />
      </div>
    </section>
  );
}
