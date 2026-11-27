import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import { ShieldCheck, Mail, Lock, User as UserIcon, Phone, AlertCircle, ArrowRight } from 'lucide-react';

const AuthPage: React.FC = () => {
  const { login, token, user: currentUser } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const portalType = searchParams.get('portal') || (searchParams.get('redirect')?.includes('admin') ? 'admin' : 'citizen');
  const redirect = searchParams.get('redirect') || (portalType === 'admin' ? '/admin' : '/');

  // Portal selection: 'citizen' | 'admin'
  const [portal, setPortal] = useState<'citizen' | 'admin'>(portalType === 'admin' ? 'admin' : 'citizen');

  // Toggle tab: 'login' | 'register'
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Input states
  const [email, setEmail] = useState(portalType === 'admin' ? 'admin@civicconnect.gov.in' : '');
  const [password, setPassword] = useState(portalType === 'admin' ? 'admin123' : '');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Status states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already logged in, redirect
  useEffect(() => {
    if (token) {
      if (currentUser?.isAdmin && portal === 'admin') {
        navigate('/admin');
      } else {
        navigate(redirect);
      }
    }
  }, [token, currentUser, navigate, redirect, portal]);

  const handlePortalSwitch = (newPortal: 'citizen' | 'admin') => {
    setPortal(newPortal);
    setErrorMessage(null);
    if (newPortal === 'admin') {
      setTab('login');
      setEmail('admin@civicconnect.gov.in');
      setPassword('admin123');
    } else {
      setEmail('');
      setPassword('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        const response = await api.post('/auth/login', { email, password });
        if (response.data?.success) {
          const { token: jwt, user } = response.data.data;
          if (portal === 'admin' && !user.isAdmin) {
            throw new Error('Access denied. This account does not have Administrative privileges.');
          }
          login(jwt, user);
          navigate(user.isAdmin && portal === 'admin' ? '/admin' : redirect);
        }
      } else {
        const response = await api.post('/auth/register', { name, phone, email, password });
        if (response.data?.success) {
          const { token: jwt, user } = response.data.data;
          login(jwt, user);
          navigate(redirect);
        }
      }
    } catch (err: any) {
      console.error('[Authentication] Error:', err);
      setErrorMessage(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 sm:px-6">
      
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-md dark:border-slate-800 dark:bg-[#0f1b35] transition-colors duration-200">
        
        {/* Portal Mode Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 dark:bg-[#112240] rounded-xl mb-6">
          <button
            type="button"
            onClick={() => handlePortalSwitch('citizen')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-extrabold transition-all duration-200 ${
              portal === 'citizen'
                ? 'bg-govBlue-700 text-white shadow-md shadow-govBlue-700/20'
                : 'text-slate-600 dark:text-slate-300 hover:text-govBlue-600'
            }`}
          >
            <UserIcon className="h-4 w-4" />
            <span>Citizen Portal</span>
          </button>
          <button
            type="button"
            onClick={() => handlePortalSwitch('admin')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-extrabold transition-all duration-200 ${
              portal === 'admin'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'text-slate-600 dark:text-slate-300 hover:text-amber-500'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Admin Portal</span>
          </button>
        </div>

        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white mx-auto shadow-md ${
            portal === 'admin' ? 'bg-amber-600' : 'bg-govBlue-700'
          }`}>
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-slate-800 dark:text-white">
            {portal === 'admin' 
              ? 'CivicConnect Admin Portal' 
              : tab === 'login' ? 'Citizen Sign In' : 'Register Citizen Account'}
          </h2>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            {portal === 'admin'
              ? 'Authorized administrative personnel only. Manage municipal directories and grievances.'
              : 'Sign in to file civic complaints, track resolutions, and bookmark local desks.'}
          </p>
        </div>

        {/* Tab switchers (Hidden for admin) */}
        {portal === 'citizen' && (
          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-[#112240] mb-6">
            <button
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
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {tab === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                  Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Enter your full name"
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
                    placeholder="e.g. +91 98765 43210"
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
                placeholder="citizen@gov.in"
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

          {/* Admin credentials note */}
          {portal === 'admin' ? (
            <div className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl mt-2 leading-relaxed">
              <span className="font-extrabold flex items-center gap-1 mb-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                Default Administrative Credentials:
              </span>
              <div><strong className="font-mono">Email:</strong> admin@civicconnect.gov.in</div>
              <div><strong className="font-mono">Password:</strong> admin123</div>
            </div>
          ) : tab === 'login' ? (
            <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#070f1e] border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl mt-2 leading-relaxed">
              <span>Looking for Admin Access? </span>
              <button
                type="button"
                onClick={() => handlePortalSwitch('admin')}
                className="text-amber-600 dark:text-amber-400 font-bold hover:underline ml-1"
              >
                Switch to Admin Portal &rarr;
              </button>
            </div>
          ) : null}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-extrabold text-white active:scale-95 transition-all disabled:opacity-75 disabled:cursor-not-allowed shadow-md ${
              portal === 'admin' 
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20' 
                : 'bg-govBlue-700 hover:bg-govBlue-800 dark:bg-sky-600 dark:hover:bg-sky-500 shadow-govBlue-700/20'
            }`}
          >
            <span>
              {loading 
                ? 'Authenticating...' 
                : portal === 'admin' 
                  ? 'Access Admin Portal' 
                  : tab === 'login' ? 'Sign In as Citizen' : 'Create Citizen Account'}
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

      </div>
    </div>
  );
};

export default AuthPage;
