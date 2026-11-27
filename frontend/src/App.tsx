import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import ComplaintSelection from './pages/ComplaintSelection';
import LocationSelector from './pages/LocationSelector';
import ResultPage from './pages/ResultPage';
import EmergencyContacts from './pages/EmergencyContacts';
import SavedBookmarks from './pages/SavedBookmarks';
import SettingsPage from './pages/SettingsPage';
import AuthPage from './pages/AuthPage';
import SearchPage from './pages/SearchPage';
import AdminDashboard from './pages/AdminDashboard';
import MyComplaintsPage from './pages/MyComplaintsPage';
import UserLoginPage from './pages/UserLoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import { NotFoundPage } from './pages/ErrorPages';
import AIVoiceAssistant from './components/AIVoiceAssistant';
import { WifiOff } from 'lucide-react';

const AppContent: React.FC = () => {
  const { isOffline, isVoiceAssistantOpen, setIsVoiceAssistantOpen } = useApp();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 dark:bg-[#0b1528] dark:text-slate-100 transition-colors duration-200">
      
      {/* Offline Alert Banner */}
      {isOffline && (
        <div className="sticky top-0 z-50 bg-amber-500 text-white text-center py-2.5 text-xs font-extrabold flex items-center justify-center gap-1.5 animate-pulse shadow-md">
          <WifiOff className="h-4 w-4" />
          <span>You are operating offline. Map routing is disabled, but saved bookmarks are accessible.</span>
        </div>
      )}

      {/* Main App Layout */}
      <Navbar />
      
      <div className="flex flex-1 flex-col md:flex-row relative">
        <Sidebar />
        
        {/* Main page router workspace */}
        <main className="flex-grow flex flex-col min-w-0 bg-slate-50 dark:bg-[#0b1528] transition-colors duration-200">
          <div className="flex-grow flex flex-col pb-20 md:pb-0">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/complaints" element={<ComplaintSelection />} />
              <Route path="/location-selector" element={<LocationSelector />} />
              <Route path="/results" element={<ResultPage />} />
              <Route path="/nearest-offices" element={<ResultPage />} />
              <Route path="/my-complaints" element={<MyComplaintsPage />} />
              <Route path="/emergency" element={<EmergencyContacts />} />
              <Route path="/saved" element={<SavedBookmarks />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/login" element={<UserLoginPage />} />
              <Route path="/user/login" element={<UserLoginPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
          <Footer />
        </main>
      </div>

      {/* Floating AI Voice Assistant Trigger Button */}
      <button
        onClick={() => setIsVoiceAssistantOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-govBlue-600 via-sky-600 to-indigo-600 px-4 py-3 text-sm font-extrabold text-white shadow-xl shadow-sky-600/30 hover:scale-105 hover:shadow-2xl hover:shadow-sky-600/40 active:scale-95 transition-all duration-200 border border-white/20 backdrop-blur-md group"
        title="Open AI Voice Assistant to register complaints by voice"
      >
        <div className="relative flex h-3 w-3 items-center justify-center">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
        </div>
        <span className="text-base">🎙️</span>
        <span className="hidden sm:inline">AI Voice Assistant</span>
      </button>

      {/* Multilingual Voice Complaint Registration Modal */}
      <AIVoiceAssistant
        isOpen={isVoiceAssistantOpen}
        onClose={() => setIsVoiceAssistantOpen(false)}
        onComplaintSubmit={() => {
          setIsVoiceAssistantOpen(false);
        }}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
};

export default App;
