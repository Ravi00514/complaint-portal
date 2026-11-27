import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, PhoneCall, Heart } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200 bg-white py-8 px-4 dark:border-slate-800 dark:bg-[#0f1b35] md:px-8 mt-12 pb-24 md:pb-8 transition-colors duration-200">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          
          {/* Logo & Pitch */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-govBlue-700 text-white">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
              <span className="text-lg font-bold text-slate-800 dark:text-white">
                CivicConnect
              </span>
            </div>
            <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              CivicConnect is an automated spatial locator that helps citizens immediately locate and contact local government departments and civic departments nearby.
            </p>
          </div>

          {/* Quick Nav Links */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Governance Links
            </h4>
            <ul className="space-y-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400">
              <li><Link to="/" className="hover:text-govBlue-700 dark:hover:text-sky-400">Dashboard / Home</Link></li>
              <li><Link to="/complaints" className="hover:text-govBlue-700 dark:hover:text-sky-400">Complaint Categories</Link></li>
              <li><Link to="/emergency" className="hover:text-govBlue-700 dark:hover:text-sky-400">Emergency Hotlines</Link></li>
              <li><Link to="/nearest-offices" className="hover:text-govBlue-700 dark:hover:text-sky-400">Locate Nearest Offices</Link></li>
            </ul>
          </div>

          {/* Contact and Emergency Hotlines */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Emergency Services
            </h4>
            <div className="space-y-3.5">
              <a
                href="tel:112"
                className="flex items-center gap-2 rounded-xl bg-rose-500/10 px-3.5 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-all duration-150 w-fit"
              >
                <PhoneCall className="h-3.5 w-3.5 animate-pulse" />
                <span>National Hotline: Dial 112</span>
              </a>
              <div className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                <p>Helpline: support@civicconnect.gov.in</p>
                <p className="mt-1">Available 24x7 for civic mapping assistance.</p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Banner */}
        <div className="mt-8 border-t border-slate-100 pt-6 text-center dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-400 dark:text-slate-500">
          <p>© {CURRENT_YEAR} CivicConnect. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 flex items-center justify-center gap-1">
            Built for smart governance with <Heart className="h-3 w-3 text-rose-500 fill-rose-500" /> by Antigravity.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
