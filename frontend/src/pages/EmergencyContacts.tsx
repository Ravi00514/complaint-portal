import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import type { EmergencyContact } from '../types';
import { FallbackEmergencyContacts } from '../data/fallbackData';
import { Phone, Search, ShieldAlert, MapPin, Building2, HelpCircle } from 'lucide-react';

const EmergencyContacts: React.FC = () => {
  const { locationDetails } = useApp();
  const [contacts, setContacts] = useState<EmergencyContact[]>(FallbackEmergencyContacts);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Filter queries
  const [cityFilter, setCityFilter] = useState(locationDetails?.city || '');
  const [stateFilter, setStateFilter] = useState(locationDetails?.state || '');

  const fetchEmergencyContacts = async () => {
    setLoading(true);
    try {
      const city = cityFilter ? encodeURIComponent(cityFilter) : '';
      const state = stateFilter ? encodeURIComponent(stateFilter) : '';
      
      const response = await api.get(`/emergency?city=${city}&state=${state}`);
      if (response.data?.success && response.data.data.length > 0) {
        setContacts(response.data.data);
      } else {
        setContacts(FallbackEmergencyContacts);
      }
    } catch (error) {
      console.warn('[Emergency Contacts] API failed, loading local fallback emergency contacts:', error);
      setContacts(FallbackEmergencyContacts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencyContacts();
  }, [cityFilter, stateFilter]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredContacts = contacts.filter((c) => {
    const term = searchQuery.toLowerCase();
    return (
      c.department.toLowerCase().includes(term) ||
      c.phone.includes(term) ||
      (c.city && c.city.toLowerCase().includes(term)) ||
      (c.state && c.state.toLowerCase().includes(term))
    );
  });

  // Separate national vs local numbers
  const nationalHotlines = filteredContacts.filter((c) => c.city === 'All' && c.state === 'All');
  const regionalHotlines = filteredContacts.filter((c) => c.city !== 'All' || c.state !== 'All');

  return (
    <div className="flex-1 px-4 py-8 sm:px-6 mx-auto max-w-5xl">
      <div className="border-b border-slate-200/50 pb-6 dark:border-slate-800/50">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Emergency Helplines
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          Find and trigger rapid emergency hotlines. Filtered by your active location where applicable.
        </p>
      </div>

      {/* Filter and search utilities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by department name..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs outline-none focus:border-govBlue-500 dark:border-slate-800 dark:bg-[#0f1b35] dark:text-slate-100"
          />
        </div>

        <div className="relative">
          <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter City (e.g. Mumbai)"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs outline-none focus:border-govBlue-500 dark:border-slate-800 dark:bg-[#0f1b35] dark:text-slate-100"
          />
        </div>

        <div className="relative">
          <Building2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter State (e.g. Maharashtra)"
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs outline-none focus:border-govBlue-500 dark:border-slate-800 dark:bg-[#0f1b35] dark:text-slate-100"
          />
        </div>
      </div>

      {loading ? (
        <div className="mt-8 space-y-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
          ))}
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {/* National Section */}
          {nationalHotlines.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3.5 flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-rose-500" />
                Primary National Helplines
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {nationalHotlines.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 dark:border-slate-800 dark:bg-[#0f1b35] shadow-sm hover:border-slate-300 dark:hover:border-slate-700/80 transition-colors"
                  >
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                        {contact.department}
                      </h3>
                      <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider mt-1">
                        National Dispatcher
                      </p>
                    </div>

                    <a
                      href={`tel:${contact.phone}`}
                      className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 active:scale-95 transition-all"
                    >
                      <Phone className="h-5 w-5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regional Section */}
          {regionalHotlines.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3.5 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-govBlue-600 dark:text-sky-400" />
                Regional Municipal & Local Hotlines
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {regionalHotlines.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 dark:border-slate-800 dark:bg-[#0f1b35] shadow-sm"
                  >
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                        {contact.department}
                      </h3>
                      <p className="text-[10px] font-bold text-govBlue-600 dark:text-sky-400 uppercase tracking-wider mt-1">
                        Local: {contact.city}, {contact.state}
                      </p>
                    </div>

                    <a
                      href={`tel:${contact.phone}`}
                      className="flex h-11 w-11 items-center justify-center rounded-xl bg-govBlue-50 text-govBlue-700 dark:bg-sky-500/10 dark:text-sky-400 hover:bg-govBlue-100 dark:hover:bg-sky-500/20 active:scale-95 transition-all"
                    >
                      <Phone className="h-5 w-5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredContacts.length === 0 && (
            <div className="p-10 text-center rounded-2xl bg-slate-50 dark:bg-[#0f1b35]/40 border border-slate-200/50 dark:border-slate-800/50">
              <HelpCircle className="h-10 w-10 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No helplines match your query</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Clear filters or try searching globally.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmergencyContacts;
