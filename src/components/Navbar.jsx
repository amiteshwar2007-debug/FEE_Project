import { Link, NavLink } from 'react-router-dom';
import { FaBullseye, FaUser, FaSun, FaMoon } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const links = [['/', 'Home'], ['/prepare', 'Study Notes'], ['/quiz', 'Start Quiz'], ['/leaderboard', 'Leaderboard'], ['/history', 'History']];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  return (
    <header>
      <nav className="navbar">
        <Link to="/" className="logo"><FaBullseye style={{ color: 'var(--primary)' }} /> Quiz<span>Master</span></Link>
        <ul className="nav-links">
          {links.map(([to, label]) => (
            <li key={to}><NavLink to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>{label}</NavLink></li>
          ))}
        </ul>
        <div className="nav-actions">
          <button type="button" className="theme-toggle-btn" onClick={toggle} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}>
            {theme === 'light' ? <FaMoon /> : <FaSun style={{ color: '#f59e0b' }} />}
          </button>
          {user ? (
            <>
              <span className="nav-user"><FaUser /> {user.name}</span>
              <button type="button" className="btn btn-outline btn-sm" onClick={logout}>Logout</button>
            </>
          ) : (
            <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
          )}
        </div>
      </nav>
    </header>
  );
}
