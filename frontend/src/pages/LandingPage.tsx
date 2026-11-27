import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MapPin, Shield, Phone, ArrowRight, Grid, Navigation, Bookmark, CheckCircle } from 'lucide-react';

const LandingPage: React.FC = () => {
  const { detectLocation, isLocating, locationDetails, setIsVoiceAssistantOpen } = useApp();
  const navigate = useNavigate();

  const handleGetStarted = async () => {
    // Attempt location auto-detection, then redirect to complaints selection
    await detectLocation();
    navigate('/complaints');
  };

  const steps = [
    {
      num: '01',
      title: 'Share Location',
      desc: 'Enable GPS location auto-detection or select your city manually.',
      icon: MapPin,
      color: 'text-blue-500 bg-blue-500/10'
    },
    {
      num: '02',
      title: 'Select Category',
      desc: 'Browse municipal, energy, police, water supply and medical concerns.',
      icon: Grid,
      color: 'text-purple-500 bg-purple-500/10'
    },
    {
      num: '03',
      title: 'Connect Instantly',
      desc: 'Find closest officer with driving directions, emails, and direct calling.',
      icon: Navigation,
      color: 'text-emerald-500 bg-emerald-500/10'
    }
  ];

  const features = [
    {
      title: 'Geospatial Sorting',
      desc: 'Uses PostgreSQL PostGIS nearest-neighbor indexing to calculate exact office distance.',
      icon: Shield,
    },
    {
      title: 'One-Click Calling',
      desc: 'Dial local departments or emergency dispatchers instantly from any mobile browser.',
      icon: Phone,
    },
    {
      title: 'Personal Bookmarks',
      desc: 'Save frequently needed civic offices for instantaneous off-line access.',
      icon: Bookmark,
    },
    {
      title: 'Smart Fallbacks',
      desc: 'Deny location permissions? Switch to country/state/city lookup at any time.',
      icon: CheckCircle,
    }
  ];

  return (
    <div className="flex-1 w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24 px-4 sm:px-6">
        {/* Decorative background glows */}
        <div className="absolute top-1/4 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-govBlue-700/10 blur-3xl dark:bg-sky-500/5"></div>
        <div className="absolute top-1/3 right-1/4 -z-10 h-72 w-72 rounded-full bg-emerald-500/5 blur-3xl"></div>

        <div className="mx-auto max-w-5xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-govBlue-500/10 px-3.5 py-1.5 text-xs font-bold text-govBlue-600 dark:bg-sky-500/10 dark:text-sky-400">
            <span className="h-2 w-2 rounded-full bg-govBlue-500 animate-ping dark:bg-sky-400"></span>
            Phase 1 MVP Live
          </span>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl dark:text-white leading-tight">
            Smart Location-Based <br />
            <span className="bg-gradient-to-r from-govBlue-700 to-sky-500 bg-clip-text text-transparent dark:from-sky-400 dark:to-teal-300">
              Citizen Complaint Locator
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base md:text-lg text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
            Instantly identify and contact the nearest government offices responsible for your civic complaints. Supported by advanced geospatial distance sorting.
          </p>

          {/* Call to Actions */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleGetStarted}
              disabled={isLocating}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-govBlue-700 px-7 py-4 text-base font-extrabold text-white shadow-lg shadow-govBlue-700/20 hover:bg-govBlue-800 dark:bg-sky-600 dark:hover:bg-sky-500 hover:shadow-xl hover:shadow-govBlue-700/10 active:scale-[0.98] transition-all"
            >
              <span>{isLocating ? 'Locating...' : 'Search Nearest Complaint Office'}</span>
              <ArrowRight className="h-5 w-5" />
            </button>

            <button
              onClick={() => setIsVoiceAssistantOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-base font-extrabold text-white shadow-lg shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-500 hover:shadow-xl hover:shadow-emerald-600/30 active:scale-[0.98] transition-all"
            >
              <span className="text-xl">🎙️</span>
              <span>Register by Voice</span>
            </button>

            <Link
              to="/complaints"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/60 backdrop-blur-md px-7 py-4 text-base font-extrabold text-slate-700 hover:bg-slate-100/60 dark:border-slate-800 dark:bg-[#0f1b35]/60 dark:text-slate-200 dark:hover:bg-[#152545]/60 transition-all"
            >
              Browse Issues
            </Link>
          </div>

          {/* Active location indicator */}
          {locationDetails && (
            <p className="mt-4 text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-govBlue-500" />
              Location active: <span className="text-slate-600 dark:text-slate-300">{locationDetails.city}, {locationDetails.state}</span>
            </p>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-slate-100/50 border-y border-slate-200/50 dark:bg-[#090f1d] dark:border-slate-800/50 px-4 sm:px-6 transition-colors duration-200">
        <div className="mx-auto max-w-5xl">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              How CivicConnect Works
            </h2>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-normal">
              Three simple steps to resolve reporting delays and reach the exact administrative focal point.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="relative rounded-2xl bg-white border border-slate-200/60 p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#0f1b35] transition-all hover:translate-y-[-2px]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-extrabold text-slate-200 dark:text-slate-800">
                      {step.num}
                    </span>
                    <div className={`p-2.5 rounded-xl ${step.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="mt-5 text-base font-extrabold text-slate-800 dark:text-slate-100">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-normal">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Grids */}
      <section className="py-16 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white leading-snug">
                Architected for Rapid Local Civic Actions
              </h2>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Finding the correct administrative desk shouldn't require scanning complex municipal hierarchies. CivicConnect queries spatial indices in real-time, matching categories directly to municipal, energy, fire, water, and road branches closest to your coordinates.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.title}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200/50 dark:bg-[#112240] dark:border-slate-800/40"
                  >
                    <Icon className="h-5 w-5 text-govBlue-700 dark:text-sky-400 mb-3" />
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {feat.title}
                    </h4>
                    <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-normal">
                      {feat.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Quick-Numbers Section */}
      <section className="py-16 bg-rose-500/5 border-t border-rose-500/10 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
            Emergency Service Numbers
          </h2>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-normal">
            For critical, life-threatening scenarios, call primary national responders immediately.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Police', phone: '100', bg: 'bg-blue-600/10 text-blue-600 dark:text-blue-400' },
              { label: 'Fire', phone: '101', bg: 'bg-orange-600/10 text-orange-600 dark:text-orange-400' },
              { label: 'Ambulance', phone: '102', bg: 'bg-emerald-600/10 text-emerald-600 dark:text-emerald-400' },
              { label: 'National Disaster', phone: '108', bg: 'bg-rose-600/10 text-rose-600 dark:text-rose-400' },
            ].map((hotline) => (
              <a
                key={hotline.label}
                href={`tel:${hotline.phone}`}
                className={`flex flex-col items-center justify-center p-5 rounded-2xl border border-transparent shadow-sm hover:scale-[1.01] transition-transform duration-200 ${hotline.bg}`}
              >
                <span className="text-xs font-semibold uppercase tracking-wider">{hotline.label}</span>
                <span className="mt-1 text-2xl font-extrabold">{hotline.phone}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
