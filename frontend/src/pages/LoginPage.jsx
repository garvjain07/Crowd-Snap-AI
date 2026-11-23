// ============================================
// Crowd Snap AI - Admin Login Page
// ============================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { adminLogin, getAdminProfile } from '../services/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await adminLogin(email, password);
      const token = res.data.access_token;
      localStorage.setItem('crowdsnap_token', token);

      const profile = await getAdminProfile();
      login(token, profile.data);
      toast.success('Welcome back!');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-7 sm:p-9 shadow-[0_24px_70px_rgba(40,55,90,0.12)]">
        <img src="/crowd-snap-logo.svg" alt="Crowd Snap AI" className="w-12 h-12 rounded-2xl mb-6" />
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-slate-950 mb-2">Organizer access</h1>
          <p className="text-slate-500 text-sm">Sign in to manage events and photo galleries</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@crowdsnap.ai"
                className="input-field !pl-10"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1 block">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field !pl-10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <FiLogIn size={18} /> Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-4 p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 text-center">
          Use admin credentials set during setup
        </div>
      </div>
    </div>
  );
}
