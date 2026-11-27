import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import type { ComplaintCategory } from '../types';
import * as Icons from 'lucide-react';
import { MapPin, HelpCircle, AlertTriangle } from 'lucide-react';
import { FallbackCategories } from '../data/fallbackData';

// Dynamic icon resolver from Lucide with fallback
const IconResolver: React.FC<{ name: string; className?: string }> = React.memo(({ name, className }) => {
  const IconComponent = (Icons as any)[name];
  if (!IconComponent) {
    return <HelpCircle className={className} />;
  }
  return <IconComponent className={className} />;
});

const ComplaintSelection: React.FC = () => {
  const { locationDetails, setCurrentCategory, detectLocation, isLocating, setIsVoiceAssistantOpen } = useApp();
  // Initialize with FallbackCategories immediately to prevent layout glitch/flicker
  const [categories, setCategories] = useState<ComplaintCategory[]>(FallbackCategories);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        if (isMounted && response.data?.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
          setCategories(response.data.data);
        }
      } catch (error) {
        console.warn('[Categories Selection] Using fallback category list:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectCategory = (cat: ComplaintCategory) => {
    setCurrentCategory(cat);
    // Directly go to results (ResultPage gracefully uses available coordinates or defaults)
    navigate('/results');
  };

  return (
    <div className="flex-1 px-4 py-8 sm:px-6 mx-auto max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200/50 pb-6 dark:border-slate-800/50">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Select Complaint Category
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Pick a department category below to instantly find the nearest responsible administrative office.
          </p>
        </div>

        {/* Voice Assistant Button */}
        <div className="mt-4 md:mt-0 flex gap-4 items-center">
          <button
            onClick={() => setIsVoiceAssistantOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-purple-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-700 active:scale-95 transition-all"
          >
            <span className="text-lg">🎙️</span>
            <span>AI Voice Assistant</span>
          </button>
        </div>

        {/* Location Indicator Widget */}
        <div className="mt-4 md:mt-0">
          {locationDetails ? (
            <div className="flex items-center gap-2 text-xs font-semibold rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 text-emerald-600 dark:text-emerald-400">
              <MapPin className="h-4 w-4 animate-bounce" />
              <span>Target: {locationDetails.city}, {locationDetails.state}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              <span>GPS Location not configured</span>
              <button
                onClick={() => detectLocation(true)}
                disabled={isLocating}
                className="ml-1.5 rounded-lg bg-amber-500 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-amber-600 active:scale-95 transition-all disabled:bg-slate-400"
              >
                {isLocating ? 'Locating...' : 'Enable GPS'}
              </button>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        // Loading Skeleton Cards
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#0f1b35]">
              <div className="h-12 w-12 rounded-xl bg-slate-200 dark:bg-slate-800"></div>
              <div className="mt-5 h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-800"></div>
              <div className="mt-3 h-4 w-full rounded bg-slate-200 dark:bg-slate-800"></div>
              <div className="mt-2 h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-800"></div>
            </div>
          ))}
        </div>
      ) : (
        // Categories Grid
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleSelectCategory(cat)}
              className="group text-left rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-govBlue-400 dark:border-slate-800 dark:bg-[#0f1b35] dark:hover:border-sky-500 transition-all duration-200 hover:-translate-y-[1px] active:scale-[0.99]"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-govBlue-50 text-govBlue-700 group-hover:bg-govBlue-100 group-hover:scale-105 dark:bg-slate-800 dark:text-sky-400 dark:group-hover:bg-slate-700/80 transition-all duration-200">
                  <IconResolver name={cat.icon} className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 group-hover:text-govBlue-600 dark:group-hover:text-sky-400">
                  {cat.department_name.split(' ')[0]}
                </span>
              </div>

              <h3 className="mt-5 text-base font-extrabold text-slate-800 group-hover:text-govBlue-800 dark:text-slate-100 dark:group-hover:text-sky-400">
                {cat.category_name}
              </h3>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                {cat.description}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ComplaintSelection;
