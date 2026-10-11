import { useMemo, useState } from 'react';
import { AttendanceReport, ClassOptions, StatCard, StudentTable } from './shared';
import '../css/AttendanceView.css';

export default function AttendanceView({ students, loading, busy, onToggle, onMarkAll, onFinalize }) {
  const [classFilter, setClassFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showFinalizeConfirmation, setShowFinalizeConfirmation] = useState(false);
  const classes = useMemo(() => [...new Set(students.map((student) => student.class))].sort((a, b) => a.localeCompare(b)), [students]);
  const visibleStudents = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return students.filter((student) => (
      (classFilter === 'All' || student.class === classFilter)
      && `${student.name} ${student.sr}`.toLocaleLowerCase().includes(query)
    ));
  }, [classFilter, search, students]);
  const attendanceCount = visibleStudents.filter((student) => student.today_status === 'Present').length;

  async function confirmFinalize() {
    setShowFinalizeConfirmation(false);
    await onFinalize(classFilter);
  }

  return (
    <>
      <section className="stats-grid">
        <StatCard label="Total students" value={loading ? 'Loading...' : visibleStudents.length} detail={classFilter === 'All' ? 'Across all classes' : classFilter} tone="blue" />
        <StatCard label="Present today" value={loading ? 'Loading...' :attendanceCount} detail={`${visibleStudents.length ? Math.round((attendanceCount / visibleStudents.length) * 100) : 0}% attendance`} tone="green" />
        <StatCard label="Absent today" value={loading ? 'Loading...' :visibleStudents.length - attendanceCount} detail="Can be finalized as absent" tone="orange" />
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
            <button className="button button-soft" onClick={() => onMarkAll(classFilter)} disabled={busy || !visibleStudents.length}>✓ <span className="button-label">Mark all present</span></button>
          </div>
          <StudentTable students={visibleStudents} mode="attendance" onToggle={onToggle} loading={loading || busy} />
        </div>
        <aside className="panel report-panel">
          <div className="panel-heading">
            <div><h2>Daily report</h2><p>Ready to share with your group.</p></div>
            <span className="report-icon" aria-hidden="true">↗</span>
          </div>
          <AttendanceReport students={students} classFilter={classFilter} />
          <button className="button button-whatsapp" onClick={() => setShowFinalizeConfirmation(true)} disabled={busy || !students.length}>
            {busy ? 'Saving attendance…' : '✓ Finalize & copy report'}
          </button>
          <p className="helper-text">Students not marked present will be recorded as absent for today.</p>
        </aside>
      </section>
      {showFinalizeConfirmation && (
        <div
          className="attendance-confirm-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowFinalizeConfirmation(false);
          }}
        >
          <section className="attendance-confirm-card" role="dialog" aria-modal="true" aria-labelledby="attendance-confirm-title">
            <p className="eyebrow">FINALIZE ATTENDANCE</p>
            <h2 id="attendance-confirm-title">
              Lock attendance for {classFilter === 'All' ? 'all classes' : classFilter}?
            </h2>
            <p className="attendance-confirm-description">
              Students not marked present will be recorded as absent. This will finalize attendance and copy the report.
            </p>
            <div className="attendance-confirm-actions">
              <button className="button button-plain" type="button" onClick={() => setShowFinalizeConfirmation(false)}>Cancel</button>
              <button className="button button-primary" type="button" onClick={confirmFinalize}>Confirm</button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
