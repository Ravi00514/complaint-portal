import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import { ShieldAlert, ShieldCheck, Mail, Lock, AlertCircle, ArrowRight, User as UserIcon } from 'lucide-react';

const AdminLoginPage: React.FC = () => {
  const { login, token, user } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin';

  // Form states - prefilled with default test admin for convenience
  const [email, setEmail] = useState('admin@civicconnect.gov.in');
  const [password, setPassword] = useState('admin123');

  // Status states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already logged in as admin, redirect to admin control
  useEffect(() => {
    if (token && user?.isAdmin) {
      navigate('/admin');
    }
  }, [token, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data?.success) {
        const { token: jwt, user: userData } = response.data.data;
        if (!userData.isAdmin) {
          throw new Error('Access denied. This account does not have Administrative authority.');
        }
        login(jwt, userData);
        navigate('/admin');
      }
    } catch (err: any) {
      console.error('[Admin Login] Error:', err);
      setErrorMessage(err.message || 'Authentication failed. Please verify admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-md rounded-2xl border-2 border-amber-500/30 bg-white p-8 shadow-xl dark:border-amber-500/20 dark:bg-[#0f1b35] transition-colors duration-200">
        
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-600 text-white mx-auto shadow-lg shadow-amber-600/30">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <span className="mt-3 inline-block rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Official Access Only
          </span>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-800 dark:text-white">
            Administrative Login
          </h2>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            Secure login for municipal officers and system administrators.
          </p>
        </div>

        {/* Demo Credentials Box */}
        <div className="text-xs text-amber-800 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl mb-6 leading-relaxed">
          <span className="font-extrabold flex items-center gap-1.5 mb-1.5 text-amber-700 dark:text-amber-400">
            <ShieldCheck className="h-4 w-4" />
            Testing Admin Credentials:
          </span>
          <div><strong className="font-mono text-slate-700 dark:text-slate-200">Email:</strong> admin@civicconnect.gov.in</div>
          <div><strong className="font-mono text-slate-700 dark:text-slate-200">Password:</strong> admin123</div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                placeholder="admin@civicconnect.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 dark:border-slate-800 dark:bg-[#0b1528] dark:focus:border-amber-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 dark:border-slate-800 dark:bg-[#0b1528] dark:focus:border-amber-400"
                required
              />
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-600 py-3.5 text-sm font-extrabold text-white hover:bg-amber-700 shadow-lg shadow-amber-600/20 active:scale-95 transition-all disabled:opacity-75 cursor-pointer"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>{loading ? 'Authenticating Admin...' : 'Authenticate & Enter Admin'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Back to Citizen Login Link */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Citizen seeking local departments or filing a grievance?
          </p>
          <Link
            to="/login"
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-govBlue-700 hover:text-govBlue-800 dark:text-sky-400 dark:hover:text-sky-300 transition-colors"
          >
            <UserIcon className="h-3.5 w-3.5" />
            <span>Switch to Citizen Login &rarr;</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default AdminLoginPage;
