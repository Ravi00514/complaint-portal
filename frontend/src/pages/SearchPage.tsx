import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import type { Department } from '../types';
import { FallbackDepartments } from '../data/fallbackData';
import { Search, MapPin, Phone, Mail, Navigation, HelpCircle, ArrowLeft } from 'lucide-react';

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getFallbackSearchResults = (term: string): Department[] => {
    const q = term.toLowerCase().trim();
    if (!q) return FallbackDepartments;
    return FallbackDepartments.filter(
      d => d.department_name.toLowerCase().includes(q) ||
           d.office_name.toLowerCase().includes(q) ||
           d.city.toLowerCase().includes(q) ||
           d.address.toLowerCase().includes(q) ||
           d.phone.includes(q)
    );
  };

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/departments?search=${encodeURIComponent(query)}`);
        if (response.data?.success && response.data.data.length > 0) {
          setResults(response.data.data);
        } else {
          setResults(getFallbackSearchResults(query));
        }
      } catch (err: any) {
        console.warn('[Search Page] API error, loading local fallback search dataset:', err);
        setResults(getFallbackSearchResults(query));
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchSearchResults();
    } else {
      setResults(FallbackDepartments);
      setLoading(false);
    }
  }, [query]);

  return (
    <div className="flex-1 px-4 py-8 sm:px-6 mx-auto max-w-5xl">
      
      <div className="flex items-center gap-2 mb-6">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="border-b border-slate-200/50 pb-6 dark:border-slate-800/50 mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <Search className="h-8 w-8 text-slate-400" />
          <span>Search Results</span>
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          Showing matching department entries for: <span className="font-extrabold text-govBlue-700 dark:text-sky-400">"{query}"</span>
        </p>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center rounded-2xl bg-rose-500/5 border border-rose-500/10 text-rose-600">
          <p className="text-sm font-bold">{error}</p>
        </div>
      ) : results.length === 0 ? (
        <div className="p-10 text-center rounded-2xl bg-white border border-slate-200/50 dark:bg-[#0f1b35] dark:border-slate-800/50 max-w-md mx-auto">
          <HelpCircle className="h-10 w-10 text-slate-350 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No departments match your query</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed">
            Try checking spelling or searching for cities like "Bengaluru", "Mumbai", or "Delhi" to discover regional nodes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {results.map((office) => (
            <div
              key={office.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0f1b35] flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold text-govBlue-600 dark:text-sky-400 uppercase tracking-wider">
                  {office.department_name}
                </span>

                <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 mt-2">
                  {office.office_name}
                </h3>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-start gap-1 leading-normal">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400 mt-0.5" />
                  <span>{office.address}</span>
                </p>

                <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-3 space-y-1 text-xs text-slate-650 dark:text-slate-400">
                  <p className="font-semibold">Representative: <span className="font-normal text-slate-600 dark:text-slate-300">{office.officer_name} ({office.designation})</span></p>
                  <p className="font-semibold">Working Hours: <span className="font-normal text-slate-650 dark:text-slate-300">{office.working_hours}</span></p>
                  {office.email && (
                    <p className="font-semibold flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span className="font-normal truncate">{office.email}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <a
                  href={`tel:${office.phone}`}
                  className="flex-1 flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/80 font-bold py-2.5 rounded-xl text-xs transition-colors"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>Call Department</span>
                </a>
                
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${office.latitude},${office.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1 bg-govBlue-700 hover:bg-govBlue-800 dark:bg-sky-600 dark:hover:bg-sky-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  <span>Get Route</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
