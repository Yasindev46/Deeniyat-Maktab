import { lazy, Suspense, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createAppActions, getClasses, VIEW_COPY } from './Utils/Utils';
import { loadExpenses, loadFees, loadStudents, resetPortal } from './store';
import { clearSession, getSession, saveSession } from './session';
import AuthView from './components/AuthView';

const AttendanceView = lazy(() => import('./components/AttendanceView'));
const RosterView = lazy(() => import('./components/RosterView'));
const FeesView = lazy(() => import('./components/FeesView'));
const AnalyticsView = lazy(() => import('./components/AnalyticsView'));
const ExpensesView = lazy(() => import('./components/ExpensesView'));

function App() {
  const dispatch = useDispatch();
  const { students, fees, expenses, loadingStudents, loadingFees, loadingExpenses, error: storeError } = useSelector((state) => state.portal);
  const [session, setSession] = useState(getSession);
  const [view, setView] = useState('attendance');
  const [localError, setLocalError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) dispatch(loadStudents());
  }, [dispatch, session]);

  useEffect(() => {
    if (!session || session.user.role !== 'admin') return;
    if (view === 'fees' || view === 'expenses') dispatch(loadFees());
    if (view === 'expenses') dispatch(loadExpenses());
  }, [dispatch, view, session]);

  useEffect(() => {
    function expireSession() {
      clearSession();
      dispatch(resetPortal());
      setSession(null);
      setView('attendance');
      setLocalError('Your session has expired. Please sign in again.');
    }
    window.addEventListener('auth-expired', expireSession);
    return () => window.removeEventListener('auth-expired', expireSession);
  }, [dispatch]);

  async function authenticateUser(authenticatedSession) {
    saveSession(authenticatedSession);
    setSession(authenticatedSession);
    setLocalError('');
    setNotice('');
  }

  function logout() {
    clearSession();
    dispatch(resetPortal());
    setSession(null);
    setView('attendance');
    setLocalError('');
    setNotice('');
  }

  const classes = getClasses(students);
  const pageError = localError || storeError;
  const {
    dismissError,
    handleViewError,
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

  if (!session) return <AuthView onAuthenticated={authenticateUser} message={localError} />;

  const isAdmin = session.user.role === 'admin';
  const [heading, subtitle] = VIEW_COPY[view];

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Deeniyat Maktab Portal home">
          <span className="brand-copy">
            <strong>Deeniyat Maktab, Walhekarwadi</strong>
          </span>
        </a>
        {/* <button className="sign-out-button-small" type="button" onClick={logout} aria-label="Sign out" title="Sign out">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M10 17l5-5-5-5M15 12H3" />
              <path d="M12 3h6a2 2 0 012 2v14a2 2 0 01-2 2h-6" />
            </svg>
          </button> */}
        <nav className="main-nav" aria-label="Main navigation">
          <button className={view === 'attendance' ? 'nav-link active' : 'nav-link'} onClick={() => setView('attendance')}>Attendance</button>
          <button className={view === 'analytics' ? 'nav-link active' : 'nav-link'} onClick={() => setView('analytics')}>Reports</button>
          <button className={view === 'roster' ? 'nav-link active' : 'nav-link'} onClick={() => setView('roster')}>Admin View</button>
          {isAdmin && <button className={view === 'fees' ? 'nav-link active nav-fees' : 'nav-link nav-fees'} onClick={() => setView('fees')}>Fees ledger</button>}
          {isAdmin && <button className={view === 'expenses' ? 'nav-link active nav-expenses' : 'nav-link nav-expenses'} onClick={() => setView('expenses')}>Expenses</button>}
        </nav>
        <div className="session-actions">
          {/* <span className="signed-in-as">{session.user.username}</span> */}
          <button className="sign-out-button-medium" type="button" onClick={logout} aria-label="Sign out" title="Sign out">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M10 17l5-5-5-5M15 12H3" />
              <path d="M12 3h6a2 2 0 012 2v14a2 2 0 01-2 2h-6" />
            </svg>
          </button>
          <div className="today-pill"><span className="live-dot" /> {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
        </div>
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
        {view === 'fees' && isAdmin && (
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
        {view === 'expenses' && isAdmin && (
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
