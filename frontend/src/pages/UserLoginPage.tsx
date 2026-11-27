import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import { User as UserIcon, Mail, Lock, Phone, AlertCircle, ArrowRight, ShieldAlert } from 'lucide-react';

const UserLoginPage: React.FC = () => {
  const { login, token, user } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  // Toggle tab: 'login' | 'register'
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Status states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already logged in, redirect
  useEffect(() => {
    if (token) {
      navigate(redirect);
    }
  }, [token, navigate, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        const response = await api.post('/auth/login', { email, password });
        if (response.data?.success) {
          const { token: jwt, user: userData } = response.data.data;
          login(jwt, userData);
          navigate(redirect);
        }
      } else {
        const response = await api.post('/auth/register', { name, phone, email, password });
        if (response.data?.success) {
          const { token: jwt, user: userData } = response.data.data;
          login(jwt, userData);
          navigate(redirect);
        }
      }
    } catch (err: any) {
      console.error('[User Login] Error:', err);
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-md dark:border-slate-800 dark:bg-[#0f1b35] transition-colors duration-200">
        
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-govBlue-700 text-white mx-auto shadow-md shadow-govBlue-700/20">
            <UserIcon className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-slate-800 dark:text-white">
            {tab === 'login' ? 'Citizen Sign In' : 'Register Citizen Account'}
          </h2>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            Sign in to file complaints, track resolutions, and save bookmarks.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-[#112240] mb-4">
          <button
            type="button"
            onClick={() => { setTab('login'); setErrorMessage(null); }}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all duration-150 ${
              tab === 'login'
                ? 'bg-white text-govBlue-700 shadow dark:bg-[#0f1b35] dark:text-sky-400'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setErrorMessage(null); }}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all duration-150 ${
              tab === 'register'
                ? 'bg-white text-govBlue-700 shadow dark:bg-[#0f1b35] dark:text-sky-400'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Demo Citizen Credentials Box */}
        {tab === 'login' && (
          <div 
            onClick={() => {
              setEmail('citizen@civicconnect.gov.in');
              setPassword('citizen123');
            }}
            className="mb-5 p-3 rounded-xl bg-govBlue-50/80 dark:bg-sky-950/20 border border-govBlue-100 dark:border-sky-800/40 text-xs text-govBlue-900 dark:text-sky-200 cursor-pointer hover:bg-govBlue-100/70 transition-all group"
            title="Click to auto-fill credentials"
          >
            <div className="flex items-center justify-between font-extrabold text-[11px] text-govBlue-700 dark:text-sky-400 mb-1">
              <span className="flex items-center gap-1">
                <UserIcon className="h-3.5 w-3.5" />
                Example Citizen Account:
              </span>
              <span className="text-[10px] bg-govBlue-700 text-white px-2 py-0.5 rounded-md group-hover:scale-105 transition-transform">
                Click to Auto-fill
              </span>
            </div>
            <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
              Email: <strong>citizen@civicconnect.gov.in</strong>
            </div>
            <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
              Password: <strong>citizen123</strong>
            </div>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-govBlue-500 dark:border-slate-800 dark:bg-[#0b1528] dark:focus:border-sky-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-govBlue-500 dark:border-slate-800 dark:bg-[#0b1528] dark:focus:border-sky-500"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                placeholder="citizen@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-govBlue-500 dark:border-slate-800 dark:bg-[#0b1528] dark:focus:border-sky-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-govBlue-500 dark:border-slate-800 dark:bg-[#0b1528] dark:focus:border-sky-500"
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
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-govBlue-700 py-3.5 text-sm font-extrabold text-white hover:bg-govBlue-800 dark:bg-sky-600 dark:hover:bg-sky-500 shadow-md shadow-govBlue-700/20 active:scale-95 transition-all disabled:opacity-75"
          >
            <span>{loading ? 'Authenticating...' : tab === 'login' ? 'Sign In as Citizen' : 'Register Account'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Link to Admin Login */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Are you a municipal or department official?
          </p>
          <Link
            to="/admin/login"
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Go to Admin Login &rarr;</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default UserLoginPage;
