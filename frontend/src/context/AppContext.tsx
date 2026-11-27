import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, LocationData, ComplaintCategory, Department } from '../types';
import api from '../services/api';

interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  coords: { latitude: number; longitude: number } | null;
  locationDetails: LocationData | null;
  isLocating: boolean;
  locationError: string | null;
  detectLocation: (forced?: boolean) => Promise<LocationData | null>;
  setManualLocation: (details: LocationData) => void;
  bookmarks: Department[];
  addBookmark: (dept: Department) => Promise<void>;
  removeBookmark: (deptId: number) => Promise<void>;
  isBookmarked: (deptId: number) => boolean;
  currentCategory: ComplaintCategory | null;
  setCurrentCategory: (cat: ComplaintCategory | null) => void;
  isOffline: boolean;
  fetchBookmarks: () => Promise<void>;
  isVoiceAssistantOpen: boolean;
  setIsVoiceAssistantOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('civicconnect_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    // Default to dark theme for premium dark aesthetics
    return 'dark';
  });

  // Auth state
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('civicconnect_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('civicconnect_token');
  });

  // Location state
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(() => {
    const saved = localStorage.getItem('civicconnect_coords');
    return saved ? JSON.parse(saved) : null;
  });
  const [locationDetails, setLocationDetails] = useState<LocationData | null>(() => {
    const saved = localStorage.getItem('civicconnect_location_details');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Bookmarks state (with localStorage persistence for instant offline & guest access)
  const [bookmarks, setBookmarks] = useState<Department[]>(() => {
    try {
      const saved = localStorage.getItem('civicconnect_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Selected complaint category
  const [currentCategory, setCurrentCategory] = useState<ComplaintCategory | null>(() => {
    const saved = localStorage.getItem('civicconnect_category');
    return saved ? JSON.parse(saved) : null;
  });

  // Network offline state
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  // Global AI Voice Assistant state
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState<boolean>(false);

  // Sync theme class to document body
  useEffect(() => {
    const body = document.body;
    if (theme === 'dark') {
      body.classList.add('dark');
    } else {
      body.classList.remove('dark');
    }
    localStorage.setItem('civicconnect_theme', theme);
  }, [theme]);

  // Sync currentCategory cache
  useEffect(() => {
    if (currentCategory) {
      localStorage.setItem('civicconnect_category', JSON.stringify(currentCategory));
    } else {
      localStorage.removeItem('civicconnect_category');
    }
  }, [currentCategory]);

  // Network state listeners
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch bookmarks when authenticated
  const fetchBookmarks = async () => {
    if (!token) {
      // Load local bookmarks for guest
      try {
        const saved = localStorage.getItem('civicconnect_bookmarks');
        if (saved) setBookmarks(JSON.parse(saved));
      } catch {}
      return;
    }
    try {
      const response = await api.get('/bookmarks');
      if (response.data?.success && Array.isArray(response.data.data)) {
        setBookmarks(response.data.data);
        localStorage.setItem('civicconnect_bookmarks', JSON.stringify(response.data.data));
      }
    } catch (error) {
      console.warn('[AppContext] API fetch bookmarks failed, loading cached:', error);
      try {
        const saved = localStorage.getItem('civicconnect_bookmarks');
        if (saved) setBookmarks(JSON.parse(saved));
      } catch {}
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, [token]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('civicconnect_token', newToken);
    localStorage.setItem('civicconnect_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setBookmarks([]);
    localStorage.removeItem('civicconnect_token');
    localStorage.removeItem('civicconnect_user');
  };

  // Detect location using Geolocation API with robust fallback
  const detectLocation = async (forced = false): Promise<LocationData | null> => {
    if (!forced && locationDetails && coords) {
      return locationDetails;
    }

    setIsLocating(true);
    setLocationError(null);

    // Fallback: If browser GPS fails or is denied, use IP-based lookup as fallback
    const fallbackToIpLookup = async (errorMsg: string): Promise<LocationData | null> => {
      try {
        const ipRes = await fetch('https://ipapi.co/json/');
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          if (ipData && ipData.latitude && ipData.longitude) {
            const coordData = { latitude: ipData.latitude, longitude: ipData.longitude };
            setCoords(coordData);
            localStorage.setItem('civicconnect_coords', JSON.stringify(coordData));

            const resolvedDetails: LocationData = {
              city: ipData.city || 'Local City',
              district: ipData.region || ipData.city || 'District',
              state: ipData.region || 'State',
              country: ipData.country_name || 'India',
              pincode: ipData.postal || '500001',
              latitude: ipData.latitude,
              longitude: ipData.longitude,
              formatted_address: `${ipData.city || 'City'}, ${ipData.region || ''}, ${ipData.country_name || 'India'}`,
            };

            setLocationDetails(resolvedDetails);
            localStorage.setItem('civicconnect_location_details', JSON.stringify(resolvedDetails));
            setIsLocating(false);
            setLocationError(null);
            return resolvedDetails;
          }
        }
      } catch (e) {
        console.warn('[Location] IP fallback lookup failed, using preset default.', e);
      }

      // Default to Andhra Pradesh / Vijayawada hub if all lookups fail
      const defaultHub: LocationData = {
        city: 'Vijayawada',
        district: 'NTR District',
        state: 'Andhra Pradesh',
        country: 'India',
        pincode: '520001',
        latitude: 16.5062,
        longitude: 80.6480,
        formatted_address: 'Vijayawada, NTR District, Andhra Pradesh, India',
      };
      setCoords({ latitude: defaultHub.latitude, longitude: defaultHub.longitude });
      setLocationDetails(defaultHub);
      localStorage.setItem('civicconnect_coords', JSON.stringify({ latitude: defaultHub.latitude, longitude: defaultHub.longitude }));
      localStorage.setItem('civicconnect_location_details', JSON.stringify(defaultHub));
      setLocationError(`${errorMsg} Defaulted to Vijayawada center.`);
      setIsLocating(false);
      return defaultHub;
    };

    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        fallbackToIpLookup('Geolocation not supported by browser.').then(resolve);
        return;
      }

      const handleSuccess = async (position: GeolocationPosition) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const coordData = { latitude: lat, longitude: lng };
        setCoords(coordData);
        localStorage.setItem('civicconnect_coords', JSON.stringify(coordData));

        try {
          const response = await api.get(`/location?latitude=${lat}&longitude=${lng}`);
          if (response.data?.success) {
            const details: LocationData = response.data.data;
            setLocationDetails(details);
            localStorage.setItem('civicconnect_location_details', JSON.stringify(details));
            setIsLocating(false);
            setLocationError(null);
            resolve(details);
            return;
          }
        } catch (error: any) {
          console.error('[Location Detection] Reverse geocoding failed:', error);
        }

        // Construct clean fallback from coordinates
        const fallbackDetails: LocationData = {
          city: 'Local Area',
          district: 'Region',
          state: 'State',
          country: 'India',
          pincode: '500001',
          latitude: lat,
          longitude: lng,
          formatted_address: `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        };
        setLocationDetails(fallbackDetails);
        localStorage.setItem('civicconnect_location_details', JSON.stringify(fallbackDetails));
        setIsLocating(false);
        resolve(fallbackDetails);
      };

      const handleError = (error: GeolocationPositionError) => {
        let msg = 'Failed to retrieve location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission denied.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location information unavailable.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out.';
        }
        // Fallback gracefully instead of failing completely
        fallbackToIpLookup(msg).then(resolve);
      };

      // Try with high accuracy, fall back without high accuracy if timeout
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        () => {
          // Retry once with standard accuracy and higher timeout
          navigator.geolocation.getCurrentPosition(
            handleSuccess,
            handleError,
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
          );
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 30000 }
      );
    });
  };

  const setManualLocation = (details: LocationData) => {
    setLocationDetails(details);
    const coordData = { latitude: details.latitude, longitude: details.longitude };
    setCoords(coordData);
    localStorage.setItem('civicconnect_coords', JSON.stringify(coordData));
    localStorage.setItem('civicconnect_location_details', JSON.stringify(details));
    setLocationError(null);
  };

  const addBookmark = async (dept: Department) => {
    // Always update local state & localStorage immediately
    setBookmarks((prev) => {
      if (prev.some((d) => d.id === dept.id)) return prev;
      const updated = [dept, ...prev];
      localStorage.setItem('civicconnect_bookmarks', JSON.stringify(updated));
      return updated;
    });

    if (token) {
      try {
        await api.post('/bookmarks', { department_id: dept.id });
      } catch (error: any) {
        console.warn('[AppContext] Sync add bookmark to server failed:', error.message);
      }
    }
  };

  const removeBookmark = async (deptId: number) => {
    // Always update local state & localStorage immediately
    setBookmarks((prev) => {
      const updated = prev.filter((d) => d.id !== deptId);
      localStorage.setItem('civicconnect_bookmarks', JSON.stringify(updated));
      return updated;
    });

    if (token) {
      try {
        await api.delete(`/bookmarks/${deptId}`);
      } catch (error: any) {
        console.warn('[AppContext] Sync remove bookmark from server failed:', error.message);
      }
    }
  };

  const isBookmarked = (deptId: number) => {
    return bookmarks.some((d) => Number(d.id) === Number(deptId));
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        user,
        token,
        login,
        logout,
        coords,
        locationDetails,
        isLocating,
        locationError,
        detectLocation,
        setManualLocation,
        bookmarks,
        addBookmark,
        removeBookmark,
        isBookmarked,
        currentCategory,
        setCurrentCategory,
        isOffline,
        fetchBookmarks,
        isVoiceAssistantOpen,
        setIsVoiceAssistantOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
