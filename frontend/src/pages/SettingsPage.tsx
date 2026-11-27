import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Settings, MapPin, RefreshCw, Sun, Moon, Trash2 } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { 
    theme, 
    toggleTheme, 
    locationDetails, 
    coords, 
    detectLocation, 
    isLocating,
    logout 
  } = useApp();
  
  const navigate = useNavigate();

  const handleClearCache = () => {
    if (window.confirm('Clear all cached location and category preferences?')) {
      localStorage.removeItem('civicconnect_coords');
      localStorage.removeItem('civicconnect_location_details');
      localStorage.removeItem('civicconnect_category');
      logout();
      window.location.href = '/';
    }
  };

  return (
    <div className="flex-1 px-4 py-8 sm:px-6 mx-auto max-w-xl">
      <div className="border-b border-slate-200/50 pb-6 dark:border-slate-800/50">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Settings className="h-8 w-8 text-slate-400" />
          <span>System Settings</span>
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          Manage theme styles, location settings, and local preferences.
        </p>
      </div>

      <div className="mt-8 space-y-6">
        
        {/* Style configurations card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0f1b35]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
            Appearance Mode
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Dark Mode Palette</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Toggle interface dark/light theme.</p>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#112240] dark:hover:bg-slate-800 px-4 py-2.5 text-xs font-bold transition-all"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-4.5 w-4.5 text-amber-500" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-4.5 w-4.5 text-slate-600" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Location configuration card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0f1b35]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
            GPS Location Coordinates
          </h2>
          
          {locationDetails ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/50 dark:bg-[#112240] dark:border-slate-800/40 text-xs text-slate-600 dark:text-slate-400 space-y-2">
                <p className="flex justify-between font-semibold">City: <span className="font-bold text-slate-850 dark:text-slate-200">{locationDetails.city}</span></p>
                <p className="flex justify-between font-semibold">State: <span className="font-bold text-slate-850 dark:text-slate-200">{locationDetails.state}</span></p>
                <p className="flex justify-between font-semibold">Pincode: <span className="font-bold text-slate-850 dark:text-slate-200">{locationDetails.pincode}</span></p>
                {coords && (
                  <p className="flex justify-between font-semibold">Coordinates: <span className="font-bold text-slate-850 dark:text-slate-200">{coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}</span></p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => detectLocation(true)}
                  disabled={isLocating}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <RefreshCw className={`h-4 w-4 ${isLocating ? 'animate-spin' : ''}`} />
                  <span>Re-detect GPS</span>
                </button>
                
                <button
                  onClick={() => navigate('/location-selector')}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-govBlue-700 hover:bg-govBlue-800 dark:bg-sky-600 dark:hover:bg-sky-500 py-3 text-xs font-bold text-white transition-colors"
                >
                  <MapPin className="h-4 w-4" />
                  <span>Set Manually</span>
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs text-amber-500 font-bold mb-4">Location preferences are not set yet.</p>
              <button
                onClick={() => navigate('/location-selector')}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-govBlue-700 py-3 text-xs font-bold text-white"
              >
                <MapPin className="h-4 w-4" />
                <span>Configure Location</span>
              </button>
            </div>
          )}
        </div>

        {/* Clear local Storage preferences */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0f1b35]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-rose-500 mb-4">
            Danger Zone
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Reset Application</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Flush local coordinates cache and logout.</p>
            </div>
            <button
              onClick={handleClearCache}
              className="flex items-center gap-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 px-4 py-2.5 text-xs font-bold text-rose-600 transition-all"
            >
              <Trash2 className="h-4.5 w-4.5" />
              <span>Reset Cache</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;
