import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MapPin, Search, Sun, Moon, Bell, LogOut, ShieldAlert, User as UserIcon, RefreshCw } from 'lucide-react';

const Navbar: React.FC = () => {
  const {
    theme,
    toggleTheme,
    user,
    logout,
    locationDetails,
    isLocating,
    detectLocation,
    setIsVoiceAssistantOpen,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const triggerLocationDetection = async () => {
    await detectLocation(true);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md transition-colors duration-200 dark:border-slate-800/80 dark:bg-[#0f1b35]/80">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        
        {/* Left Side: Brand Logo */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-govBlue-700 to-sky-500 shadow-md shadow-govBlue-700/20 group-hover:scale-105 transition-transform duration-200">
              <ShieldAlert className="h-5.5 w-5.5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-govBlue-800 to-sky-500 bg-clip-text text-xl font-extrabold tracking-tight text-transparent dark:from-white dark:to-slate-300">
              CivicConnect
            </span>
          </Link>

          {/* Location Badge */}
          <div className="hidden md:flex items-center ml-4">
            <button
              onClick={triggerLocationDetection}
              disabled={isLocating}
              className="flex items-center gap-1.5 rounded-full bg-slate-100/80 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors duration-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              title="Click to recalculate current GPS location"
            >
              <MapPin className="h-3.5 w-3.5 text-govBlue-600 dark:text-sky-400" />
              {isLocating ? (
                <span className="flex items-center gap-1">
                  Locating... <RefreshCw className="h-3 w-3 animate-spin" />
                </span>
              ) : locationDetails ? (
                <span>{locationDetails.city}, {locationDetails.state}</span>
              ) : (
                <span>Set Location</span>
              )}
            </button>
          </div>
        </div>

        {/* Center: Search Box */}
        <form onSubmit={handleSearchSubmit} className="hidden sm:flex relative max-w-md w-full mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search departments, categories, or cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-4 text-sm outline-none transition-all duration-200 focus:border-govBlue-500 focus:bg-white focus:ring-2 focus:ring-govBlue-100 dark:border-slate-800 dark:bg-[#0b1528] dark:text-slate-100 dark:focus:border-sky-500 dark:focus:bg-[#070f1e] dark:focus:ring-sky-500/10"
            />
          </div>
        </form>

        {/* Right Side: Quick Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Button (Mobile Only) */}
          <button 
            onClick={() => navigate('/complaints')}
            className="p-2.5 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 sm:hidden"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* AI Voice Assistant Trigger */}
          <button
            onClick={() => setIsVoiceAssistantOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-govBlue-600 to-sky-600 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-govBlue-700/20 hover:scale-105 hover:from-govBlue-700 hover:to-sky-500 active:scale-95 transition-all"
            title="Register complaint by speaking (English, Hindi, Telugu)"
          >
            <span className="text-sm">🎙️</span>
            <span className="hidden sm:inline">Voice Assistant</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full text-slate-500 hover:bg-slate-100 transition-colors duration-200 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Toggle theme mode"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-600" />}
          </button>

          {/* Notification Alert Bell */}
          <div className="relative">
            <button className="p-2.5 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0f1b35]"></span>
            </button>
          </div>

          {/* User Profile dropdown */}
          <div className="relative">
            {user ? (
              <div>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className={`flex h-9 items-center gap-2 px-3 rounded-full text-xs font-bold text-white shadow-md transition-transform duration-200 hover:scale-105 ${
                    user.isAdmin 
                      ? 'bg-gradient-to-r from-amber-600 to-orange-500' 
                      : 'bg-gradient-to-tr from-govBlue-600 to-sky-500'
                  }`}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden sm:inline font-bold">
                    {user.isAdmin ? 'Admin' : 'Citizen'}
                  </span>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-60 origin-top-right rounded-2xl border border-slate-200/80 bg-white p-2 shadow-xl ring-1 ring-black/5 dark:border-slate-800/80 dark:bg-[#0f1b35] z-50">
                    <div className="px-3.5 py-3 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                        {user.isAdmin ? 'Administrative Account' : 'Citizen Account'}
                      </p>
                      <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">{user.name}</p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                      {user.isAdmin && (
                        <span className="mt-1.5 inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-extrabold text-amber-500 border border-amber-500/20">
                          🛡️ Full Admin Access
                        </span>
                      )}
                    </div>
                    
                    <div className="py-1">
                      {user.isAdmin ? (
                        <>
                          <Link
                            to="/admin"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex w-full items-center gap-2 rounded-lg px-3.5 py-2.5 text-left text-sm font-bold text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/20"
                          >
                            <ShieldAlert className="h-4 w-4 text-amber-500" />
                            Admin Control Portal
                          </Link>
                          <Link
                            to="/"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex w-full items-center gap-2 rounded-lg px-3.5 py-2 text-left text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50"
                          >
                            <UserIcon className="h-3.5 w-3.5 text-sky-500" />
                            View Citizen Portal
                          </Link>
                        </>
                      ) : (
                        <Link
                          to="/my-complaints"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex w-full items-center gap-2 rounded-lg px-3.5 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50"
                        >
                          <UserIcon className="h-4 w-4 text-sky-500" />
                          My Grievances
                        </Link>
                      )}
                      
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                          navigate('/');
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3.5 py-2.5 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50/50 dark:text-rose-400 dark:hover:bg-rose-950/20"
                      >
                        <LogOut className="h-4 w-4" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 rounded-full bg-govBlue-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-govBlue-700/10 hover:bg-govBlue-800 dark:bg-sky-600 dark:hover:bg-sky-500 transition-all duration-200"
                >
                  <UserIcon className="h-3.5 w-3.5" />
                  <span>Citizen Login</span>
                </Link>
                <Link
                  to="/admin/login"
                  className="hidden sm:flex items-center gap-1.5 rounded-full bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-amber-600/10 hover:bg-amber-700 transition-all duration-200"
                >
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>Admin Login</span>
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};

export default Navbar;
