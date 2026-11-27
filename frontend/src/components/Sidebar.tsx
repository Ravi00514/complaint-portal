import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Home, 
  Grid, 
  PhoneCall, 
  Map, 
  Bookmark, 
  Settings, 
  ShieldCheck,
  MapPin,
  FileText
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user, locationDetails } = useApp();

  const links = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/complaints', icon: Grid, label: 'Categories' },
    { to: '/my-complaints', icon: FileText, label: 'My Complaints' },
    { to: '/emergency', icon: PhoneCall, label: 'Emergency Numbers' },
    { to: '/results', icon: Map, label: 'Nearest Offices' },
    { to: '/saved', icon: Bookmark, label: 'Saved Bookmarks' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="fixed bottom-0 left-0 z-30 flex h-16 w-full border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0f1b35] md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:w-64 md:flex-col md:border-r md:border-t-0 py-4 px-3 shrink-0">
      
      {/* Location Widget (Desktop only) */}
      <div className="hidden md:block mb-6 rounded-2xl bg-gradient-to-br from-govBlue-50 to-sky-100/50 p-4 border border-govBlue-100/30 dark:from-[#112240] dark:to-[#172a45]/40 dark:border-slate-800">
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
          <MapPin className="h-3 w-3 text-govBlue-600 dark:text-sky-400" />
          Coverage Area
        </p>
        {locationDetails ? (
          <div>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight">
              {locationDetails.city}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
              {locationDetails.district}, {locationDetails.state}
            </p>
          </div>
        ) : (
          <p className="text-xs text-amber-500 font-medium">
            Location not set. Check browser permission.
          </p>
        )}
      </div>

      {/* Main Nav Links */}
      <nav className="flex w-full items-center justify-around md:flex-col md:justify-start md:gap-1.5">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex flex-col md:flex-row items-center gap-1 md:gap-3.5 rounded-xl px-3 py-1.5 md:py-3 text-center md:text-left text-[10px] md:text-sm font-bold w-full transition-all duration-150 ${
                  isActive
                    ? 'text-govBlue-700 bg-govBlue-50/80 dark:text-sky-400 dark:bg-sky-500/10'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/40'
                }`
              }
            >
              <Icon className="h-4.5 w-4.5 md:h-5 md:w-5 shrink-0" />
              <span className="md:mt-0">{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Admin Quick-link at sidebar bottom (Desktop only) */}
      {user?.isAdmin && (
        <div className="hidden md:block mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-bold w-full transition-all duration-150 ${
                isActive
                  ? 'text-amber-500 bg-amber-500/10'
                  : 'text-amber-600 hover:bg-amber-500/5'
              }`
            }
          >
            <ShieldCheck className="h-5 w-5 text-amber-500 shrink-0" />
            <span>Admin Control</span>
          </NavLink>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
