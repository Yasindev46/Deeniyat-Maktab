export function ClassOptions({ classes }) {
  return (
    <>
      <option value="All">All classes</option>
      {classes.map((className) => <option key={className} value={className}>{className}</option>)}
    </>
  );
}

export function StatCard({ label, value, detail, tone }) {
  return (
    <article className={`stat-card stat-${tone}`}>
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      <span className="stat-detail">{detail}</span>
    </article>
  );
}

export function EmptyRow({ columns, loading = false }) {
  return <tr><td className="empty-cell" colSpan={columns}>{loading ? 'Loading records…' : 'No records found for these filters.'}</td></tr>;
}

export function StudentTable({ students, mode, onToggle, onEdit, loading }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Class</th>
            {mode === 'roster'
              ? <><th>Mobile</th><th>Actions</th><th aria-label="Actions" /></>
              : <><th>Today&apos;s status</th>{mode === 'attendance' && <th aria-label="Mark attendance" />}</>}
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td><div className="student-cell"><strong>{student.name}</strong><span>#{student.sr}</span></div></td>
              <td>{student.class}</td>
              {mode === 'roster'
                ? (
                  <>
                    <td>{student.mobile || '—'}</td>
                    {/* <td><StatusBadge status={student.today_status} /></td> */}
                    <td><button className="button-edit button-small button-plain" onClick={() => onEdit(student)}>Edit</button></td>
                  </>
                )
                : (
                  <>
                    <td><StatusBadge status={student.today_status} /></td>
                    {mode === 'attendance' && (
                      <td>
                        <button
                          className={`attendance-toggle ${student.today_status === 'Present' ? 'is-present' : ''}`}
                          disabled={loading}
                          onClick={() => onToggle(student, student.today_status === 'Present' ? 'Absent' : 'Present')}
                          aria-label={`Mark ${student.name} ${student.today_status === 'Present' ? 'absent' : 'present'}`}
                        >
                          {student.today_status === 'Present' ? '✓' : '+'}
                        </button>
                      </td>
                    )}
                  </>
                )}
            </tr>
          ))}
          {!students.length && <EmptyRow columns={mode === 'roster' ? 5 : mode === 'attendance' ? 4 : 3} loading={loading} />}
        </tbody>
      </table>
    </div>
  );
}

export function StatusBadge({ status }) {
  return <span className={`status-badge ${status === 'Present' ? 'status-present' : 'status-absent'}`}><span />{status || 'Absent'}</span>;
}

export function AttendanceReport({ students, classFilter }) {
  const roster = students.filter((student) => classFilter === 'All' || student.class === classFilter);
  const absent = roster.filter((student) => student.today_status !== 'Present');

  return (
    <div className="report-preview">
      <div className="report-date">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
      <div className="report-summary">
        <span><strong>{roster.length - absent.length}</strong> present</span>
        <span><strong>{absent.length}</strong> absent</span>
      </div>
      <div className="report-divider" />
      <strong className="absent-heading">{absent.length ? 'Absent students' : 'All students are present'}</strong>
      <ul className="absent-list">
        {absent.length
          ? absent.map((student) => <li key={student.id}>{student.name}<span>{student.class}</span></li>)
          : <li className="all-present">Great work — the whole class is here.</li>}
      </ul>
    </div>
  );
}
