const SESSION_KEY = 'deeniyat-maktab-session';

export function getSession() {
  const serializedSession = localStorage.getItem(SESSION_KEY);
  if (!serializedSession) return null;

  try {
    const session = JSON.parse(serializedSession);
    if (typeof session.token === 'string'
        && typeof session.user?.username === 'string'
        && ['admin', 'nonAdmin'].includes(session.user.role)) {
      return session;
    }
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }

  localStorage.removeItem(SESSION_KEY);
  return null;
}

export function getSessionToken() {
  return getSession()?.token ?? null;
}

export function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
