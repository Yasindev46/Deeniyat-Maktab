import { lazy, Suspense, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createAppActions, getClasses, VIEW_COPY } from './Utils/Utils';
import { loadExpenses, loadFees, loadStudents } from './store';

const AttendanceView = lazy(() => import('./components/AttendanceView'));
const RosterView = lazy(() => import('./components/RosterView'));
const FeesView = lazy(() => import('./components/FeesView'));
const AnalyticsView = lazy(() => import('./components/AnalyticsView'));
const ExpensesView = lazy(() => import('./components/ExpensesView'));

function App() {
  const dispatch = useDispatch();
  const { students, fees, expenses, loadingStudents, loadingFees, loadingExpenses, error: storeError } = useSelector((state) => state.portal);
  const [view, setView] = useState('attendance');
  const [localError, setLocalError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    dispatch(loadStudents());
  }, [dispatch]);

  useEffect(() => {
    if (view === 'fees' || view === 'expenses') dispatch(loadFees());
    if (view === 'expenses') dispatch(loadExpenses());
  }, [dispatch, view]);

  const classes = getClasses(students);
  const pageError = localError || storeError;
  const {
    dismissError,
    handleViewError,
    toggleAttendance,
    markAllPresent,
    finalizeAttendance,
    saveStudent,
    importRoster,
    saveFee,
    saveExpense,
    downloadFeesPdf,
    downloadExpensesPdf,
    onDeleteExpense
  } = createAppActions({ dispatch, setBusy, setLocalError, setNotice });

  const [heading, subtitle] = VIEW_COPY[view];

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Deeniyat Maktab Portal home">
          <span className="brand-copy">
            <strong>Deeniyat Maktab, Walhekarwadi</strong>
          </span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <button className={view === 'attendance' ? 'nav-link active' : 'nav-link'} onClick={() => setView('attendance')}>Attendance</button>
          <button className={view === 'analytics' ? 'nav-link active' : 'nav-link'} onClick={() => setView('analytics')}>Reports</button>
          <button className={view === 'roster' ? 'nav-link active' : 'nav-link'} onClick={() => setView('roster')}>Admin View</button>
          <button className={view === 'fees' ? 'nav-link active nav-fees' : 'nav-link nav-fees'} onClick={() => setView('fees')}>Fees ledger</button>
          <button className={view === 'expenses' ? 'nav-link active nav-expenses' : 'nav-link nav-expenses'} onClick={() => setView('expenses')}>Expenses</button>
        </nav>
        <div className="today-pill"><span className="live-dot" /> {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
      </header>

      <section className="page-heading">
        <div>
          <h1>{heading}</h1>
          <p className="page-subtitle">{subtitle}</p>
        </div>
        {view !== 'expenses' && (
          <div className="heading-count"><strong>{students.length}</strong><span>students enrolled</span></div>
        )}
      </section>

      {pageError && (
        <div className="alert alert-error" role="alert">
          <span>{pageError}</span>
          <button onClick={dismissError} aria-label="Dismiss error">×</button>
        </div>
      )}
      {notice && (
        <div className="alert alert-success" role="status">
          <span>{notice}</span>
          <button onClick={() => setNotice('')} aria-label="Dismiss message">×</button>
        </div>
      )}

      <Suspense fallback={<div className="panel view-loading" role="status">Loading {heading.toLocaleLowerCase()}…</div>}>
        {view === 'attendance' && (
          <AttendanceView
            students={students}
            loading={loadingStudents}
            busy={busy}
            onToggle={toggleAttendance}
            onMarkAll={markAllPresent}
            onFinalize={finalizeAttendance}
          />
        )}
        {view === 'roster' && (
          <RosterView
            students={students}
            loading={loadingStudents}
            busy={busy}
            onSave={saveStudent}
            onImport={importRoster}
          />
        )}
        {view === 'fees' && (
          <FeesView
            fees={fees}
            classes={classes}
            loading={loadingFees}
            busy={busy}
            onSaveFee={saveFee}
            onDownloadPdf={downloadFeesPdf}
          />
        )}
        {view === 'analytics' && (
          <AnalyticsView
           students={students} 
           classes={classes} 
           onError={handleViewError}
            />
        )}
        {view === 'expenses' && (
          <ExpensesView
            fees={fees}
            expenses={expenses}
            loading={loadingExpenses}
            busy={busy}
            onSaveExpense={saveExpense}
            onDeleteExpense={onDeleteExpense}
            onDownloadPdf={downloadExpensesPdf}
          />
        )}
      </Suspense>

      <footer className="footer">Deeniyat Maktab <span>·</span> Attendance & fee management</footer>
    </main>
  );
}

export default App;
