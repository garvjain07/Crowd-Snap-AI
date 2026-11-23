// ============================================
// Crowd Snap AI - Navbar Component
// ============================================
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiGrid, FiUser, FiMenu, FiX } from 'react-icons/fi';

export default function Navbar() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const closeMenu = () => setMobileOpen(false);

  return (
    <nav className="glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Application logo */}
          <Link to="/" className="flex items-center gap-3" onClick={closeMenu}>
            <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-black tracking-tight">CS</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Crowd Snap AI</span>
              <span className="text-[10px] text-slate-500 tracking-[0.22em] uppercase">Event photo search</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/"
              className="text-slate-600 hover:text-slate-950 transition-colors text-sm font-medium"
            >
              Search Photos
            </Link>

            {admin ? (
              <>
                <Link
                  to="/admin/dashboard"
                  className="flex items-center gap-1 text-slate-600 hover:text-slate-950 transition-colors text-sm font-medium"
                >
                  <FiGrid size={16} />
                  Dashboard
                </Link>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <FiUser size={14} />
                  {admin.name}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors text-sm"
                >
                  <FiLogOut size={14} />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/admin/login"
                className="btn-primary !py-2 !px-4 text-sm"
              >
                Admin Login
              </Link>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-slate-700 hover:text-slate-950 p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-slate-700/50 space-y-3 animate-fade-in">
            <Link
              to="/"
              onClick={closeMenu}
              className="block text-slate-600 hover:text-slate-950 transition-colors text-sm font-medium py-2"
            >
              Search Photos
            </Link>

            {admin ? (
              <>
                <Link
                  to="/admin/dashboard"
                  onClick={closeMenu}
                  className="flex items-center gap-2 text-slate-600 hover:text-slate-950 transition-colors text-sm font-medium py-2"
                >
                  <FiGrid size={16} />
                  Dashboard
                </Link>
                <div className="flex items-center gap-2 text-slate-400 text-sm py-2">
                  <FiUser size={14} />
                  {admin.name}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors text-sm py-2"
                >
                  <FiLogOut size={14} />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/admin/login"
                onClick={closeMenu}
                className="block btn-primary !py-2 !px-4 text-sm text-center"
              >
                Admin Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
