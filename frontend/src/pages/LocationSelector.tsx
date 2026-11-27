import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MapPin, Navigation, Keyboard, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import type { LocationData } from '../types';

// Hardcoded state-district-city dataset for Indian clusters
const REGION_MAPPINGS = [
  { city: 'Vijayawada', district: 'NTR District', state: 'Andhra Pradesh', pincode: '520001', latitude: 16.5062, longitude: 80.6480 },
  { city: 'Guntur', district: 'Guntur', state: 'Andhra Pradesh', pincode: '522002', latitude: 16.3067, longitude: 80.4365 },
  { city: 'Namburu', district: 'Guntur', state: 'Andhra Pradesh', pincode: '522508', latitude: 16.3685, longitude: 80.5234 },
  { city: 'Pedakakani', district: 'Guntur', state: 'Andhra Pradesh', pincode: '522509', latitude: 16.3421, longitude: 80.4938 },
  { city: 'Mangalagiri', district: 'Guntur', state: 'Andhra Pradesh', pincode: '522503', latitude: 16.4326, longitude: 80.5582 },
  { city: 'Visakhapatnam', district: 'Visakhapatnam', state: 'Andhra Pradesh', pincode: '530001', latitude: 17.7231, longitude: 83.3013 },
  { city: 'Tirupati', district: 'Tirupati', state: 'Andhra Pradesh', pincode: '517501', latitude: 13.6288, longitude: 79.4192 },
  { city: 'Kurnool', district: 'Kurnool', state: 'Andhra Pradesh', pincode: '518001', latitude: 15.8281, longitude: 78.0373 },
  { city: 'Rajahmundry', district: 'East Godavari', state: 'Andhra Pradesh', pincode: '533101', latitude: 17.0005, longitude: 81.7800 },
  { city: 'Nellore', district: 'SPSR Nellore', state: 'Andhra Pradesh', pincode: '524001', latitude: 14.4426, longitude: 79.9865 },
  { city: 'Kakinada', district: 'Kakinada', state: 'Andhra Pradesh', pincode: '533001', latitude: 16.9890, longitude: 82.2475 },
  { city: 'Anantapur', district: 'Ananthapuramu', state: 'Andhra Pradesh', pincode: '515001', latitude: 14.6819, longitude: 77.6006 },
  { city: 'Kadapa', district: 'YSR Kadapa', state: 'Andhra Pradesh', pincode: '516001', latitude: 14.4674, longitude: 78.8242 },
  { city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', pincode: '560001', latitude: 12.9716, longitude: 77.5946 },
  { city: 'Mumbai', district: 'Mumbai City', state: 'Maharashtra', pincode: '400001', latitude: 18.9750, longitude: 72.8258 },
  { city: 'Delhi', district: 'New Delhi', state: 'Delhi', pincode: '110001', latitude: 28.6139, longitude: 77.2090 },
  { city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', pincode: '500001', latitude: 17.3850, longitude: 78.4867 },
  { city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', pincode: '600001', latitude: 13.0827, longitude: 80.2707 },
  { city: 'Kolkata', district: 'Kolkata', state: 'West Bengal', pincode: '700001', latitude: 22.5726, longitude: 88.3639 },
  { city: 'Pune', district: 'Pune', state: 'Maharashtra', pincode: '411001', latitude: 18.5204, longitude: 73.8567 },
  { city: 'Ahmedabad', district: 'Ahmedabad', state: 'Gujarat', pincode: '380001', latitude: 23.0225, longitude: 72.5714 },
];

const LocationSelector: React.FC = () => {
  const { detectLocation, setManualLocation, isLocating, locationDetails, locationError } = useApp();
  const [activeTab, setActiveTab] = useState<'auto' | 'manual'>('auto');
  const navigate = useNavigate();

  // Manual Form States
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleAutoDetect = async () => {
    const details = await detectLocation(true);
    if (details) {
      // Successfully detected, redirect back to complaints or results
      navigate('/complaints');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!state || !district || !city || !pincode) {
      setFormError('Please fill out all required fields.');
      return;
    }

    // Pincode validation
    if (!/^\d{6}$/.test(pincode)) {
      setFormError('Please enter a valid 6-digit Pincode.');
      return;
    }

    // Attempt to map coordinates from known regional seeds (City exact > City partial > District > State)
    const trimmedCity = city.trim().toLowerCase();
    const trimmedDistrict = district.trim().toLowerCase();
    const trimmedState = state.trim().toLowerCase();

    const match = REGION_MAPPINGS.find(r => r.city.toLowerCase() === trimmedCity)
      || REGION_MAPPINGS.find(r => r.city.toLowerCase().includes(trimmedCity) || trimmedCity.includes(r.city.toLowerCase()))
      || REGION_MAPPINGS.find(r => r.district.toLowerCase() === trimmedDistrict)
      || REGION_MAPPINGS.find(r => r.state.toLowerCase() === trimmedState);

    const lat = match ? match.latitude : 16.5062; // Fallback to Vijayawada / AP center
    const lng = match ? match.longitude : 80.6480;

    const locData: LocationData = {
      city: city.trim(),
      district: district.trim(),
      state: state.trim(),
      country: country.trim(),
      pincode: pincode.trim(),
      latitude: lat,
      longitude: lng,
      formatted_address: `${city.trim()}, ${district.trim()}, ${state.trim()}, ${country.trim()}`,
    };

    setManualLocation(locData);
    navigate('/complaints');
  };

  const loadPresetCity = (preset: typeof REGION_MAPPINGS[0]) => {
    setState(preset.state);
    setDistrict(preset.district);
    setCity(preset.city);
    setPincode(preset.pincode);
  };

  return (
    <div className="flex-1 px-4 py-8 sm:px-6 mx-auto max-w-xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Configure Location
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Set your current location to connect with local civic offices.
        </p>
      </div>

      {/* Tab Selectors */}
      <div className="flex rounded-2xl bg-slate-100 p-1.5 dark:bg-[#112240] mb-6">
        <button
          onClick={() => setActiveTab('auto')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all duration-150 ${
            activeTab === 'auto'
              ? 'bg-white text-govBlue-700 shadow dark:bg-[#0f1b35] dark:text-sky-400'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Navigation className="h-4 w-4" />
          <span>Auto Detect (GPS)</span>
        </button>
        <button
          onClick={() => setActiveTab('manual')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all duration-150 ${
            activeTab === 'manual'
              ? 'bg-white text-govBlue-700 shadow dark:bg-[#0f1b35] dark:text-sky-400'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Keyboard className="h-4 w-4" />
          <span>Manual Input</span>
        </button>
      </div>

      {/* Auto Detect Panel */}
      {activeTab === 'auto' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0f1b35] text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-govBlue-50 text-govBlue-700 mx-auto dark:bg-slate-800 dark:text-sky-400 mb-5">
            <MapPin className={`h-8 w-8 ${isLocating ? 'animate-bounce' : ''}`} />
          </div>

          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Use Browser Geolocation
          </h3>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
            Your browser will request permission to read GPS coordinates, which is securely parsed to resolve state, municipal, and city coverage.
          </p>

          {locationDetails && (
            <div className="mt-5 p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5">
              <CheckCircle className="h-4 w-4" />
              <span>Current: {locationDetails.formatted_address}</span>
            </div>
          )}

          {locationError && (
            <div className="mt-5 p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center justify-center gap-1.5">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{locationError}</span>
            </div>
          )}

          <button
            onClick={handleAutoDetect}
            disabled={isLocating}
            className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-govBlue-700 py-3.5 text-sm font-extrabold text-white hover:bg-govBlue-800 dark:bg-sky-600 dark:hover:bg-sky-500 active:scale-95 transition-all disabled:opacity-75 disabled:cursor-not-allowed"
          >
            <span>{isLocating ? 'Acquiring GPS Fix...' : 'Detect My Location'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Manual Input Panel */}
      {activeTab === 'manual' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0f1b35]">
          
          {/* Preset Buttons helper */}
          <div className="mb-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Quick Presets
            </span>
            <div className="flex gap-2 mt-2">
              {REGION_MAPPINGS.map((preset) => (
                <button
                  key={preset.city}
                  type="button"
                  onClick={() => loadPresetCity(preset)}
                  className="rounded-lg bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  {preset.city}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                Country
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-sm outline-none focus:border-govBlue-500 dark:border-slate-800 dark:bg-[#0b1528] dark:focus:border-sky-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                  State
                </label>
                <input
                  type="text"
                  placeholder="e.g. Karnataka"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-sm outline-none focus:border-govBlue-500 dark:border-slate-800 dark:bg-[#0b1528] dark:focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                  District
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bengaluru Urban"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-sm outline-none focus:border-govBlue-500 dark:border-slate-800 dark:bg-[#0b1528] dark:focus:border-sky-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                  City / Town
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bengaluru"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-sm outline-none focus:border-govBlue-500 dark:border-slate-800 dark:bg-[#0b1528] dark:focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                  Pincode
                </label>
                <input
                  type="text"
                  placeholder="e.g. 560001"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  maxLength={6}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-sm outline-none focus:border-govBlue-500 dark:border-slate-800 dark:bg-[#0b1528] dark:focus:border-sky-500"
                  required
                />
              </div>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" />
                <span>{formError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-govBlue-700 py-3.5 text-sm font-extrabold text-white hover:bg-govBlue-800 dark:bg-sky-600 dark:hover:bg-sky-500 active:scale-95 transition-all"
            >
              <span>Save and Proceed</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
};

export default LocationSelector;
