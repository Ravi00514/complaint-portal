import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Bookmark, Phone, Navigation, Trash2, Heart, ExternalLink, MapPin } from 'lucide-react';

const SavedBookmarks: React.FC = () => {
  const { token, bookmarks, removeBookmark, fetchBookmarks } = useApp();

  useEffect(() => {
    if (token) {
      fetchBookmarks();
    }
  }, [token]);

  const handleRemove = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Remove this saved office?')) {
      await removeBookmark(id);
    }
  };

  // Render bookmarks for both signed-in and guest users
  return (
    <div className="flex-1 px-4 py-8 sm:px-6 mx-auto max-w-5xl">
      <div className="border-b border-slate-200/50 pb-6 dark:border-slate-800/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Bookmark className="h-7 w-7 text-govBlue-600 dark:text-sky-400" />
            <span>Saved Bookmarks</span>
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Access your stored local administrative contacts, departments, and emergency desks.
          </p>
        </div>

        {!token && (
          <div className="flex items-center gap-2 text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-3.5 py-2 rounded-xl">
            <span>Saved locally.</span>
            <Link to="/login?redirect=saved" className="font-bold underline hover:text-amber-700">
              Sign In to sync across devices &rarr;
            </Link>
          </div>
        )}
      </div>

      {bookmarks.length === 0 ? (
        <div className="mt-12 p-10 text-center rounded-2xl bg-white border border-slate-200/50 dark:bg-[#0f1b35] dark:border-slate-800/50 max-w-md mx-auto">
          <Heart className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No bookmarks saved yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto leading-normal">
            Search for civic offices near you and click the save icon to cache them in your profile.
          </p>
          <Link
            to="/complaints"
            className="mt-5 inline-block rounded-lg bg-govBlue-700 hover:bg-govBlue-800 dark:bg-sky-600 dark:hover:bg-sky-500 px-4 py-2 text-xs font-bold text-white transition-all"
          >
            Find Offices Now
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {bookmarks.map((office) => (
            <div
              key={office.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0f1b35] flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-1">
                  <span className="text-[10px] font-bold text-govBlue-600 dark:text-sky-400 uppercase tracking-wider">
                    {office.department_name}
                  </span>
                  
                  <button
                    onClick={(e) => handleRemove(e, office.id)}
                    className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                    title="Remove Bookmark"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 mt-2">
                  {office.office_name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-start gap-1 leading-normal">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400 mt-0.5" />
                  <span>{office.address}</span>
                </p>

                <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <p className="font-semibold">Officer: <span className="font-normal">{office.officer_name} ({office.designation})</span></p>
                  <p className="font-semibold">Hours: <span className="font-normal">{office.working_hours}</span></p>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <a
                  href={`tel:${office.phone}`}
                  className="flex-1 flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/80 font-bold py-2.5 rounded-xl text-xs transition-colors"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>Call Phone</span>
                </a>
                
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${office.latitude},${office.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1 bg-govBlue-700 hover:bg-govBlue-800 dark:bg-sky-600 dark:hover:bg-sky-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  <span>Navigate</span>
                  <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedBookmarks;
