import { useMemo, useState } from 'react';
import { toArray } from '../Utils/arrays';
import { AttendanceReport, ClassOptions, StatCard, StudentTable } from './shared';
import '../css/AttendanceView.css';

export default function AttendanceView({ students, loading, busy, onMarkAll, onFinalize }) {
  const safeStudents = toArray(students);
  const [classFilter, setClassFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showFinalizeConfirmation, setShowFinalizeConfirmation] = useState(false);
  const [stagedStatuses, setStagedStatuses] = useState({});
  const classes = useMemo(() => [...new Set(safeStudents.map((student) => student.class))].sort((a, b) => a.localeCompare(b)), [safeStudents]);
  const stagedStudents = useMemo(
    () => safeStudents.map((student) => ({
      ...student,
      today_status: stagedStatuses[student.id] ?? student.today_status,
    })),
    [stagedStatuses, safeStudents],
  );
  const visibleStudents = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return stagedStudents.filter((student) => (
      (classFilter === 'All' || student.class === classFilter)
      && `${student.name} ${student.sr}`.toLocaleLowerCase().includes(query)
    ));
  }, [classFilter, search, stagedStudents]);
  const attendanceCount = visibleStudents.filter((student) => student.today_status === 'Present').length;

  function stageAttendance(student, status) {
    const originalStatus = safeStudents.find(({ id }) => id === student.id)?.today_status;
    setStagedStatuses((current) => {
      const next = { ...current };
      if (status === originalStatus) {
        delete next[student.id];
      } else {
        next[student.id] = status;
      }
      return next;
    });
  }

  async function confirmFinalize() {
    setShowFinalizeConfirmation(false);
    const updates = stagedStudents
      .filter((student) => classFilter === 'All' || student.class === classFilter)
      .filter((student) => stagedStatuses[student.id] !== undefined)
      .map((student) => ({ studentId: student.id, status: stagedStatuses[student.id] }));
    const finalized = await onFinalize(classFilter, updates);
    if (finalized) {
      setStagedStatuses((current) => {
        const next = { ...current };
        updates.forEach(({ studentId }) => delete next[studentId]);
        return next;
      });
    }
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
          <StudentTable students={visibleStudents} mode="attendance" onToggle={stageAttendance} loading={loading || busy} />
        </div>
        <aside className="panel report-panel">
          <div className="panel-heading">
            <div><h2>Daily report</h2><p>Ready to share with your group.</p></div>
            <span className="report-icon" aria-hidden="true">↗</span>
          </div>
          <AttendanceReport students={stagedStudents} classFilter={classFilter} />
          <button className="button button-whatsapp" onClick={() => setShowFinalizeConfirmation(true)} disabled={busy || !safeStudents.length}>
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
              Lock attendance for {classFilter === 'All' ? 'all classes' :"class "+ classFilter}?
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
