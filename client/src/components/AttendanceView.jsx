import { useMemo, useState } from 'react';
import { AttendanceReport, ClassOptions, StatCard, StudentTable } from './shared';
import '../css/AttendanceView.css';

export default function AttendanceView({ students, loading, busy, onToggle, onMarkAll, onFinalize }) {
  const [classFilter, setClassFilter] = useState('All');
  const [search, setSearch] = useState('');
  const classes = useMemo(() => [...new Set(students.map((student) => student.class))].sort((a, b) => a.localeCompare(b)), [students]);
  const visibleStudents = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return students.filter((student) => (
      (classFilter === 'All' || student.class === classFilter)
      && `${student.name} ${student.sr}`.toLocaleLowerCase().includes(query)
    ));
  }, [classFilter, search, students]);
  const attendanceCount = visibleStudents.filter((student) => student.today_status === 'Present').length;

  return (
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
          <button className="button button-whatsapp" onClick={() => onFinalize(classFilter)} disabled={busy || !students.length}>
            {busy ? 'Saving attendance…' : '✓ Finalize & copy report'}
          </button>
          <p className="helper-text">Students not marked present will be recorded as absent for today.</p>
        </aside>
      </section>
    </>
  );
}
