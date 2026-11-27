import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, WifiOff, RefreshCw, Home } from 'lucide-react';

// 404 - Not Found Page
export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-16 text-center">
      <div className="h-16 w-16 bg-govBlue-500/10 text-govBlue-700 rounded-2xl flex items-center justify-center mb-6 dark:bg-sky-500/5 dark:text-sky-400">
        <ShieldAlert className="h-8 w-8" />
      </div>
      
      <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">
        404 - Page Not Found
      </h1>
      
      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
        The resource you are looking for has been moved, renamed, or is temporarily unavailable.
      </p>

      <div className="mt-8 flex gap-3">
        <Link
          to="/"
          className="rounded-xl bg-govBlue-700 px-5 py-3 text-xs font-bold text-white hover:bg-govBlue-800 dark:bg-sky-600 dark:hover:bg-sky-500 transition-all flex items-center gap-1.5 shadow"
        >
          <Home className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
};

// 500 - Server Error Page
export const ServerErrorPage: React.FC = () => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-16 text-center">
      <div className="h-16 w-16 bg-rose-500/10 text-rose-600 rounded-2xl flex items-center justify-center mb-6">
        <ShieldAlert className="h-8 w-8 animate-bounce" />
      </div>

      <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">
        500 - Server Error
      </h1>

      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
        Our gateway is experiencing connectivity issues. Please try refreshing or validating your connection.
      </p>

      <div className="mt-8 flex gap-3">
        <button
          onClick={handleReload}
          className="rounded-xl bg-govBlue-700 px-5 py-3 text-xs font-bold text-white hover:bg-govBlue-800 dark:bg-sky-600 dark:hover:bg-sky-500 transition-all flex items-center gap-1.5 shadow"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Retry Request</span>
        </button>
      </div>
    </div>
  );
};

// Offline Message Page
export const OfflinePage: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-16 text-center">
      <div className="h-16 w-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mb-6">
        <WifiOff className="h-8 w-8" />
      </div>

      <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
        Connection Lost
      </h1>

      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
        You are currently offline. CivicConnect requires an active network link to execute geo-location requests.
      </p>
      
      <p className="text-[10px] text-emerald-500 font-bold mt-4 uppercase tracking-wider animate-pulse">
        Waiting for network reconnect...
      </p>
    </div>
  );
};
