import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { ToastProvider } from './Toast';

// Shared page frame: every route renders inside <Outlet />
export default function Layout() {
  return (
    <ToastProvider>
      <Navbar />
      <Outlet />
      <Footer />
    </ToastProvider>
  );
}
