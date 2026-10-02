import { useEffect, useState } from 'react';
import { request } from '../api';
import { ClassOptions, EmptyRow, StatusBadge } from './shared';
import '../css/AnalyticsView.css';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function AnalyticsView({ students, classes, onError }) {
  const [analyticsType, setAnalyticsType] = useState('class');
  const [analyticsClass, setAnalyticsClass] = useState('All');
  const [analyticsStudent, setAnalyticsStudent] = useState(() => students[0] ? String(students[0].id) : '');
  const [analyticsYear, setAnalyticsYear] = useState(String(new Date().getFullYear()));
  const [analyticsMonth, setAnalyticsMonth] = useState('All');
  const [analytics, setAnalytics] = useState([]);
  const [analyticsLoaded, setAnalyticsLoaded] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const years = Array.from({ length: 6 }, (_, index) => String(new Date().getFullYear() - index));

  useEffect(() => {
    if (!analyticsStudent && students.length) setAnalyticsStudent(String(students[0].id));
  }, [analyticsStudent, students]);

  async function generateAnalytics(event) {
    event.preventDefault();
    setAnalyticsLoading(true);
    try {
      const params = new URLSearchParams({
        filter_type: analyticsType,
        class: analyticsClass,
        student_id: analyticsStudent,
        year: analyticsYear,
        month: analyticsMonth,
      });
      setAnalytics(await request(`/analytics?${params}`));
      setAnalyticsLoaded(true);
    } catch (error) {
      onError(error.message);
    } finally {
      setAnalyticsLoading(false);
    }
  }

  return (
    <section className="panel analytics-panel">
      <div className="panel-heading"><div><h2>Attendance history</h2><p>Generate a monthly or yearly attendance report.</p></div></div>
      <form className="analytics-filters" onSubmit={generateAnalytics}>
        <label>Report type<select value={analyticsType} onChange={(event) => setAnalyticsType(event.target.value)}><option value="class">Class summary</option><option value="student">Individual student</option></select></label>
        {analyticsType === 'class'
          ? <label>Class<select value={analyticsClass} onChange={(event) => setAnalyticsClass(event.target.value)}><ClassOptions classes={classes} /></select></label>
          : <label>Student<select value={analyticsStudent} onChange={(event) => setAnalyticsStudent(event.target.value)}>{students.map((student) => <option key={student.id} value={student.id}>[{student.sr}] {student.name} ({student.class})</option>)}</select></label>}
        <label>Year<select value={analyticsYear} onChange={(event) => setAnalyticsYear(event.target.value)}>{years.map((year) => <option key={year}>{year}</option>)}</select></label>
        <label>Period<select value={analyticsMonth} onChange={(event) => setAnalyticsMonth(event.target.value)}><option value="All">Full year</option>{MONTHS.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}</select></label>
        <button className="button button-primary" disabled={analyticsLoading || !students.length}>{analyticsLoading ? 'Generating…' : 'Generate report'}</button>
      </form>
      {analyticsLoaded && (analyticsType === 'student'
        ? (
          <div className="table-wrap analytics-results">
            <table className="data-table">
              <thead><tr><th>Date</th><th>Serial no.</th><th>Student</th><th>Class</th><th>Status</th></tr></thead>
              <tbody>
                {analytics.map((row) => <tr key={`${row.sr}-${row.date}`}><td>{row.date}</td><td>{row.sr}</td><td><strong>{row.name}</strong></td><td>{row.class}</td><td><StatusBadge status={row.status} /></td></tr>)}
                {!analytics.length && <EmptyRow columns={5} />}
              </tbody>
            </table>
          </div>
        )
        : (
          <div className="table-wrap analytics-results">
            <table className="data-table">
              <thead><tr><th>Serial no.</th><th>Student</th><th>Class</th><th>Present</th><th>Absent</th><th>Attendance rate</th></tr></thead>
              <tbody>
                {analytics.map((row) => {
                  const present = Number(row.present_count || 0);
                  const total = Number(row.total_days || 0);
                  const rate = total ? Math.round((present / total) * 100) : 0;
                  return <tr key={row.sr}><td>{row.sr}</td><td><strong>{row.name}</strong></td><td>{row.class}</td><td className="amount-paid">{present} days</td><td className="amount-due">{Number(row.absent_count || 0)} days</td><td><div className="rate-cell"><span>{rate}%</span><div className="progress-track"><span style={{ width: `${rate}%` }} /></div></div></td></tr>;
                })}
                {!analytics.length && <EmptyRow columns={6} />}
              </tbody>
            </table>
          </div>
        ))}
    </section>
  );
}
