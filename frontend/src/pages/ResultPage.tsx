import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import type { Department } from '../types';
import MapComponent from '../components/MapComponent';
import FileComplaintModal from '../components/FileComplaintModal';
import { getFallbackDepartmentsForCategory } from '../data/fallbackData';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Globe, 
  Navigation, 
  Copy, 
  Share2, 
  Bookmark, 
  BookmarkCheck,
  ChevronRight, 
  ShieldAlert, 
  Activity, 
  ArrowLeft,
  Check,
  FileText
} from 'lucide-react';

const ResultPage: React.FC = () => {
  const { 
    currentCategory, 
    coords, 
    locationDetails, 
    token, 
    isBookmarked, 
    addBookmark, 
    removeBookmark 
  } = useApp();
  
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [offices, setOffices] = useState<Department[]>([]);
  const [selectedOffice, setSelectedOffice] = useState<Department | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState<boolean>(false);
  
  // Toast notifications trigger states
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [bookmarkingId, setBookmarkingId] = useState<number | null>(null);
  const [shareSuccess, setShareSuccess] = useState<boolean>(false);

  useEffect(() => {
    // If category is not set, set a sensible default category instead of kicking user back
    const activeCategory = currentCategory || {
      id: 1,
      category_name: 'Power Cut',
      department_name: 'Electricity Department',
      icon: 'Zap',
      description: 'Reporting power outages, transformer sparks, and wire snaps.'
    };
    if (!currentCategory) {
      setCurrentCategory(activeCategory);
    }

    const currentLat = coords?.latitude || 12.9716;
    const currentLng = coords?.longitude || 77.5946;
    const currentCity = locationDetails?.city || 'Bengaluru';

    const fetchNearestOffices = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(
          `/departments/nearest?latitude=${currentLat}&longitude=${currentLng}&category=${encodeURIComponent(activeCategory.category_name)}&limit=5`
        );
        if (response.data?.success && response.data.data.length > 0) {
          const data: Department[] = response.data.data;
          setOffices(data);
          setSelectedOffice(data[0]);
        } else {
          // Use comprehensive adaptive local fallback dataset if backend has 0 entries
          const fallback = getFallbackDepartmentsForCategory(
            activeCategory.category_name,
            currentLat,
            currentLng,
            currentCity
          );
          setOffices(fallback);
          setSelectedOffice(fallback[0] || null);
        }
      } catch (err: any) {
        console.warn('[Result Page] API error, loading local fallback dataset:', err);
        const fallback = getFallbackDepartmentsForCategory(
          activeCategory.category_name,
          currentLat,
          currentLng,
          currentCity
        );
        setOffices(fallback);
        setSelectedOffice(fallback[0] || null);
      } finally {
        setLoading(false);
      }
    };

    fetchNearestOffices();
  }, [currentCategory, coords, navigate]);

  const handleCopyNumber = (phone: string, id: number) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = async (office: Department) => {
    const shareData = {
      title: `CivicConnect - ${office.office_name}`,
      text: `Responsible desk for: ${currentCategory?.category_name}. Contact: ${office.phone}. Address: ${office.address}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          `${shareData.title}\nContact: ${shareData.text}\nDirect Nav: https://www.google.com/maps/dir/?api=1&destination=${office.latitude},${office.longitude}`
        );
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2500);
      }
    } catch (err) {
      console.warn('[Share] Canceled or unsupported.', err);
    }
  };

  const handleBookmarkToggle = async (office: Department) => {
    setBookmarkingId(office.id);
    if (isBookmarked(office.id)) {
      await removeBookmark(office.id);
    } else {
      await addBookmark(office);
    }
    setBookmarkingId(null);
  };

  if (loading) {
    return (
      <div className="flex-1 px-4 py-8 sm:px-6 mx-auto max-w-5xl animate-pulse">
        <div className="h-6 w-48 rounded bg-slate-200 dark:bg-slate-800"></div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4 md:col-span-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
            ))}
          </div>
          <div className="h-[450px] rounded-2xl bg-slate-200 dark:bg-slate-800 md:col-span-2"></div>
        </div>
      </div>
    );
  }

  if (error || offices.length === 0) {
    return (
      <div className="flex-1 px-4 py-16 sm:px-6 mx-auto max-w-md text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 mx-auto mb-4">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          No responsible offices found
        </h2>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {error || `We couldn't identify any offices under '${currentCategory?.category_name}' within range of your current location.`}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Link
            to="/location-selector"
            className="rounded-xl bg-govBlue-700 py-3 text-xs font-bold text-white hover:bg-govBlue-800 dark:bg-sky-600 dark:hover:bg-sky-500"
          >
            Change Location
          </Link>
          <Link
            to="/complaints"
            className="rounded-xl border border-slate-200 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Select Another Category
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 py-8 sm:px-6 mx-auto max-w-5xl">
      
      {/* Upper Navigation Back Button & Category Indicator */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/complaints')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Change Category</span>
        </button>

        <div className="rounded-xl bg-govBlue-50/80 px-3.5 py-1.5 text-[11px] font-bold text-govBlue-700 dark:bg-sky-500/10 dark:text-sky-400 flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 animate-pulse" />
          <span>Concern: {currentCategory?.category_name}</span>
        </div>
      </div>

      {/* Main split dashboard view */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Office lists panel */}
        <div className="space-y-4 md:col-span-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Nearest Departments ({offices.length})
          </h2>
          
          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {offices.map((office) => {
              const isActive = selectedOffice?.id === office.id;
              return (
                <button
                  key={office.id}
                  onClick={() => setSelectedOffice(office)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-150 relative ${
                    isActive
                      ? 'border-govBlue-500 bg-govBlue-50/30 dark:border-sky-500 dark:bg-sky-500/5'
                      : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-[#0f1b35]'
                  }`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                      {office.department_name}
                    </span>
                    <span className="text-[10px] font-bold text-govBlue-600 dark:text-sky-400 shrink-0">
                      {office.distance_text || 'Nearby'}
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mt-2 line-clamp-1">
                    {office.office_name}
                  </h3>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                    {office.city}, {office.state}
                  </p>

                  <div className="mt-3 flex items-center justify-between">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold ${
                      office.status === 'Open' 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-rose-500/10 text-rose-600'
                    }`}>
                      {office.status}
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Maps routing and Selected office details */}
        {selectedOffice && (
          <div className="space-y-6 md:col-span-2">
            
            {/* Map Canvas */}
            <MapComponent
              userLat={coords?.latitude || 16.5062}
              userLng={coords?.longitude || 80.6480}
              destLat={selectedOffice.latitude}
              destLng={selectedOffice.longitude}
              officeName={selectedOffice.office_name}
              distanceText={selectedOffice.distance_text}
            />

            {/* Office Profile Details Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0f1b35] transition-colors duration-200">
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-3">
                <div>
                  <span className="text-xs font-bold text-govBlue-600 dark:text-sky-400 uppercase tracking-wider">
                    {selectedOffice.department_name}
                  </span>
                  <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {selectedOffice.office_name}
                  </h1>
                </div>

                {/* Bookmark & Share Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBookmarkToggle(selectedOffice)}
                    disabled={bookmarkingId !== null}
                    className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
                    title={isBookmarked(selectedOffice.id) ? 'Remove Bookmark' : 'Save Department'}
                  >
                    {isBookmarked(selectedOffice.id) ? (
                      <BookmarkCheck className="h-5 w-5 text-emerald-500 fill-emerald-500/10" />
                    ) : (
                      <Bookmark className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleShare(selectedOffice)}
                    className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors relative"
                    title="Share Department Info"
                  >
                    {shareSuccess ? <Check className="h-5 w-5 text-emerald-500" /> : <Share2 className="h-5 w-5" />}
                    {shareSuccess && (
                      <span className="absolute bottom-full mb-1.5 right-1/2 translate-x-1/2 text-[9px] bg-slate-900 text-white rounded px-1.5 py-0.5 font-bold whitespace-nowrap">
                        Copied Link!
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Core Office Info Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">
                
                {/* Officer details */}
                <div className="space-y-3.5">
                  <div className="flex items-start gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Officer Contact</p>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                        {selectedOffice.officer_name || 'Officer Desk'} ({selectedOffice.designation || 'Representative'})
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <a
                          href={`tel:${selectedOffice.phone}`}
                          className="text-sm font-extrabold text-govBlue-700 dark:text-sky-400 hover:underline"
                        >
                          {selectedOffice.phone}
                        </a>
                        <button
                          onClick={() => handleCopyNumber(selectedOffice.phone, selectedOffice.id)}
                          className="p-1 rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                        >
                          {copiedId === selectedOffice.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {selectedOffice.emergency_phone && (
                    <div className="flex items-start gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-rose-500 dark:text-rose-400 uppercase tracking-wider">Emergency Line</p>
                        <a
                          href={`tel:${selectedOffice.emergency_phone}`}
                          className="text-sm font-extrabold text-rose-600 dark:text-rose-400 hover:underline block mt-0.5"
                        >
                          {selectedOffice.emergency_phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {selectedOffice.email && (
                    <div className="flex items-start gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                        <a
                          href={`mailto:${selectedOffice.email}`}
                          className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:underline block mt-0.5 truncate"
                        >
                          {selectedOffice.email}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Operations & Location details */}
                <div className="space-y-3.5">
                  <div className="flex items-start gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Office Address</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
                        {selectedOffice.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Working Hours</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                        {selectedOffice.working_hours}
                      </p>
                    </div>
                  </div>

                  {selectedOffice.website && (
                    <div className="flex items-start gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                        <Globe className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Website Portal</p>
                        <a
                          href={selectedOffice.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-govBlue-700 dark:text-sky-400 hover:underline block mt-0.5 truncate"
                        >
                          {selectedOffice.website}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Action Buttons Panel */}
              <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                <a
                  href={`tel:${selectedOffice.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-govBlue-700 hover:bg-govBlue-800 dark:bg-sky-600 dark:hover:bg-sky-500 text-white font-extrabold py-3.5 text-xs shadow-md transition-all duration-150 active:scale-95"
                >
                  <Phone className="h-4 w-4" />
                  <span>Call Department</span>
                </a>

                <button
                  onClick={() => setIsComplaintModalOpen(true)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 text-xs shadow-md transition-all duration-150 active:scale-95"
                >
                  <FileText className="h-4 w-4" />
                  <span>File Instant Complaint</span>
                </button>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&origin=${coords?.latitude || 12.9716},${coords?.longitude || 77.5946}&destination=${selectedOffice.latitude},${selectedOffice.longitude}&travelmode=driving`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800 font-extrabold py-3.5 text-xs transition-all duration-150 active:scale-95"
                >
                  <Navigation className="h-4 w-4 text-govBlue-600 dark:text-sky-400" />
                  <span>Get Driving Route</span>
                </a>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* File Official Complaint Modal */}
      <FileComplaintModal
        isOpen={isComplaintModalOpen}
        onClose={() => setIsComplaintModalOpen(false)}
        department={selectedOffice}
        category={currentCategory}
      />

    </div>
  );
};

export default ResultPage;
