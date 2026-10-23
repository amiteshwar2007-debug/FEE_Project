import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import QuizConfig from './pages/QuizConfig';
import Arena from './pages/Arena';
import StudyNotes from './pages/StudyNotes';
import History from './pages/History';
import Leaderboard from './pages/Leaderboard';
import Login from './pages/Login';
import { useAuth } from './context/AuthContext';

// Protected routes: logged-out visitors are sent to /login and returned afterwards
function Protected() {
  const { user } = useAuth();
  const location = useLocation();
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="prepare" element={<StudyNotes />} />
          <Route path="login" element={<Login />} />
          <Route element={<Protected />}>
            <Route path="quiz" element={<QuizConfig />} />
            <Route path="arena" element={<Arena />} />
            <Route path="history" element={<History />} />
            <Route path="leaderboard" element={<Leaderboard />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
