import { createContext, useContext, useState } from 'react';

// Context API holds the logged-in user (session-wide state that many components read).
// Accounts live in localStorage, so no server is needed.
const AuthContext = createContext(null);
const read = (key, fallback) => JSON.parse(localStorage.getItem(key) || fallback);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => read('qm_session', 'null'));

  const startSession = ({ id, name, email }) => {
    const session = { id, name, email };
    localStorage.setItem('qm_session', JSON.stringify(session));
    setUser(session);
  };

  // register and login return an error message, or null when they succeed
  const register = ({ name, email, password }) => {
    const users = read('qm_users', '[]');
    if (users.some((u) => u.email === email)) return 'An account with this email already exists.';
    const account = { id: email, name, email, password };
    localStorage.setItem('qm_users', JSON.stringify([...users, account]));
    startSession(account);
    return null;
  };

  const login = ({ email, password }) => {
    const account = read('qm_users', '[]').find((u) => u.email === email && u.password === password);
    if (!account) return 'Email or password is incorrect.';
    startSession(account);
    return null;
  };

  const guest = () => startSession({ id: 'guest', name: 'Guest', email: '' });

  const logout = () => {
    localStorage.removeItem('qm_session');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, register, login, guest, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
