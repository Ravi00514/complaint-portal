import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Send, X, Bot, User as UserIcon, 
  Volume2, VolumeX, RotateCcw, Square, CheckCircle2,
  Sparkles, Play, Volume1, AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../services/api';

interface ParsedComplaint {
  title?: string;
  description?: string;
  category?: string;
  location?: string;
  priority?: string;
}

interface Message {
  role: 'ai' | 'user';
  text: string;
}

type AssistantState = 'ready' | 'listening' | 'understanding' | 'thinking' | 'speaking' | 'complaint_ready';

export const AIVoiceAssistant: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onComplaintSubmit: (complaint: ParsedComplaint) => void;
}> = ({ isOpen, onClose, onComplaintSubmit }) => {
  const { user } = useApp();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [language, setLanguage] = useState<'en-IN' | 'te-IN' | 'hi-IN'>('en-IN');
  
  const [assistantState, setAssistantState] = useState<AssistantState>('ready');
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [blockedAutoplayText, setBlockedAutoplayText] = useState<string | null>(null);
  
  const [transcript, setTranscript] = useState('');
  const [manualInputText, setManualInputText] = useState('');
  
  const [stage, setStage] = useState<'welcome' | 'language' | 'conversation' | 'confirm' | 'submitting' | 'done'>('welcome');
  const [parsedComplaint, setParsedComplaint] = useState<ParsedComplaint | null>(null);
  const [lastAiMessage, setLastAiMessage] = useState<string>('');

  // Refs to eliminate stale closure bugs during speech synthesis and recognition cycles
  const stageRef = useRef(stage);
  stageRef.current = stage;
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const languageRef = useRef(language);
  languageRef.current = language;
  const parsedComplaintRef = useRef(parsedComplaint);
  parsedComplaintRef.current = parsedComplaint;

  // Citizen Information
  const [citizenName, setCitizenName] = useState(user?.name || '');
  const [citizenPhone, setCitizenPhone] = useState(user?.phone || '');
  const [showUserInfoFields, setShowUserInfoFields] = useState(false);

  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const synth = window.speechSynthesis;

  const addMessage = (role: 'ai' | 'user', text: string) => {
    setMessages((prev) => [...prev, { role, text }]);
  };

  // Scroll to bottom on new content
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, transcript, parsedComplaint, assistantState]);

  // Helper to play a short diagnostic chime & unlock Web Audio API hardware
  const playDiagnosticChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioCtx();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5 note
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
        console.log('[VOICE] Hardware speaker chime played successfully');
      }
    } catch (e) {
      console.warn('[VOICE ERROR] Chime play error:', e);
    }
  };

  // Unlock Audio Engine on user gesture
  const unlockAudio = () => {
    if (!isAudioUnlocked) {
      console.log('[VOICE] Unlocking browser audio hardware via user gesture...');
      setIsAudioUnlocked(true);
      playDiagnosticChime();
      
      // Warm up SpeechSynthesis
      if (synth) {
        try {
          synth.cancel();
          const silentUtterance = new SpeechSynthesisUtterance(' ');
          silentUtterance.volume = 0.01;
          synth.speak(silentUtterance);
        } catch {}
      }
    }
  };

  // Speaker Sound Test Handler
  const handleTestSpeaker = () => {
    unlockAudio();
    const testText = language === 'te-IN' 
      ? "ఆడియో సిస్టమ్ పనిచేస్తోంది. AI వాయిస్ సిద్ధంగా ఉంది." 
      : language === 'hi-IN' 
      ? "ऑडियो सिस्टम काम कर रहा है। AI आवाज तैयार है।" 
      : "Audio system is active. AI Voice is ready.";
    speakText(testText, language);
  };

  // Core Multilingual Text-to-Speech Engine with Audio Logging
  const speakText = (text: string, lang: string) => {
    console.log(`[VOICE] AI response received: "${text.slice(0, 40)}..."`);

    if (isMuted) {
      console.log('[VOICE] TTS skipped (Muted)');
      setAssistantState(stage === 'confirm' ? 'complaint_ready' : 'ready');
      return;
    }

    // Prefer the browser voice engine so playback does not depend on the backend
    // being available or on a cross-origin audio request being allowed.
    if (synth) {
      speakWithBrowserSynthesis(text, lang);
      return;
    }

    console.log('[VOICE] Starting TTS');
    stopSpeaking();
    setBlockedAutoplayText(null);

    const langCode = lang.split('-')[0].toLowerCase();
    const encodedText = encodeURIComponent(text.slice(0, 300));
    
    // Construct full URLs for both Backend proxy and Google direct mirror
    const backendTtsUrl = `http://localhost:5000/api/complaints/tts?text=${encodedText}&lang=${lang}`;
    const directTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${langCode}&client=tw-ob`;

    console.log('[VOICE] TTS response received from route builder');
    console.log('[VOICE] Creating audio element');

    const audio = new Audio(backendTtsUrl);
    audioRef.current = audio;
    audio.volume = 1.0;

    audio.onplay = () => {
      console.log('[VOICE] Starting playback');
      console.log('[VOICE] Playback started');
      setAssistantState('speaking');
    };

    audio.onended = () => {
      console.log('[VOICE] Playback completed');
      audioRef.current = null;
      const currentStage = stageRef.current;
      if (currentStage === 'confirm' || currentStage === 'done') {
        setAssistantState(currentStage === 'confirm' ? 'complaint_ready' : 'ready');
      } else {
        setAssistantState('ready');
        setTimeout(() => startListening(lang), 450);
      }
    };

    audio.onerror = (err) => {
      console.warn('[VOICE ERROR] Primary backend audio failed, switching to direct URL fallback...', err);
      
      // Fallback 1: Direct Google TTS
      console.log('[VOICE] Creating audio fallback');
      const fallbackAudio = new Audio(directTtsUrl);
      audioRef.current = fallbackAudio;
      fallbackAudio.volume = 1.0;

      fallbackAudio.onplay = () => {
        console.log('[VOICE] Playback started (fallback audio)');
        setAssistantState('speaking');
      };

      fallbackAudio.onended = () => {
        console.log('[VOICE] Playback completed (fallback audio)');
        audioRef.current = null;
        const currentStage = stageRef.current;
        if (currentStage === 'confirm' || currentStage === 'done') {
          setAssistantState(currentStage === 'confirm' ? 'complaint_ready' : 'ready');
        } else {
          setAssistantState('ready');
          setTimeout(() => startListening(lang), 450);
        }
      };

      fallbackAudio.onerror = (e) => {
        console.error('[VOICE ERROR] Audio creation failed across network MP3 streams. Trying browser SpeechSynthesis...', e);
        speakWithBrowserSynthesis(text, lang);
      };

      fallbackAudio.play().catch((playErr) => {
        console.warn('[VOICE ERROR] Direct audio play promise rejected:', playErr);
        speakWithBrowserSynthesis(text, lang);
      });
    };

    // Trigger Playback
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        console.log('[VOICE] Audio data received & play promise resolved');
      }).catch((playErr) => {
        console.error('[VOICE ERROR] Audio playback failed (browser autoplay block):', playErr);
        setBlockedAutoplayText(text);
        setAssistantState('ready');
        // Secondary fallback to SpeechSynthesis
        speakWithBrowserSynthesis(text, lang);
      });
    }
  };

  // Secondary Fallback: Browser SpeechSynthesis Engine
  const speakWithBrowserSynthesis = (text: string, lang: string) => {
    if (!synth) {
      console.error('[VOICE ERROR] TTS failed - Browser SpeechSynthesis API unavailable');
      return;
    }

    try {
      synth.cancel();
      if (synth.paused) synth.resume();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      const voices = synth.getVoices();
      const langPrefix = lang.split('-')[0].toLowerCase();
      const matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith(langPrefix));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onstart = () => {
        console.log('[VOICE] Playback started (Browser SpeechSynthesis)');
        setAssistantState('speaking');
        setBlockedAutoplayText(null);
      };

      utterance.onend = () => {
        console.log('[VOICE] Playback completed (Browser SpeechSynthesis)');
        const currentStage = stageRef.current;
        if (currentStage === 'confirm' || currentStage === 'done') {
          setAssistantState(currentStage === 'confirm' ? 'complaint_ready' : 'ready');
        } else {
          setAssistantState('ready');
          setTimeout(() => startListening(lang), 450);
        }
      };

      utterance.onerror = (e) => {
        console.error('[VOICE ERROR] Audio playback failed on SpeechSynthesis:', e);
        setAssistantState('ready');
        setBlockedAutoplayText(text);
      };

      synth.speak(utterance);
    } catch (e) {
      console.error('[VOICE ERROR] TTS failed with exception:', e);
      setBlockedAutoplayText(text);
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch {}
      audioRef.current = null;
    }
    if (synth && (synth.speaking || synth.pending)) {
      try { synth.cancel(); } catch {}
    }
    if (assistantState === 'speaking') {
      setAssistantState('ready');
    }
  };

  // Speech Recognition Engine (Speech-to-Text)
  const startListening = (lang: string = language) => {
    unlockAudio();
    stopSpeaking();

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('[VOICE ERROR] Microphone API unavailable');
      alert("Speech Recognition is not supported in this browser. You can type your message below.");
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      console.log('[VOICE] Microphone active. Listening in:', lang);
      setAssistantState('listening');
      setTranscript('');
    };

    recognition.onresult = (event: any) => {
      const current = event.results[event.results.length - 1][0].transcript;
      setTranscript(current);
    };

    recognition.onerror = (event: any) => {
      console.error('[VOICE ERROR] Speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
        setAssistantState('ready');
      }
    };

    recognition.onend = () => {
      console.log('[VOICE] Speech recognition finished.');
      setAssistantState((prev) => prev === 'listening' ? 'ready' : prev);
      
      setTimeout(() => {
        setTranscript((curr) => {
          if (curr.trim()) {
            handleUserSpeech(curr.trim());
          }
          return '';
        });
      }, 150);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      console.error('[VOICE ERROR] Failed to start microphone:', e);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    if (assistantState === 'listening') {
      setAssistantState('ready');
    }
  };

  // Initialize Modal lifecycle
  useEffect(() => {
    if (isOpen) {
      setMessages([]);
      setStage('welcome');
      setAssistantState('ready');
      setTranscript('');
      setParsedComplaint(null);
      setBlockedAutoplayText(null);
      
      const welcomeMsg = "Hello! I am your AI Voice Complaint Assistant. Which language are you comfortable speaking? English, Telugu, or Hindi?";
      addMessage('ai', welcomeMsg);
      setLastAiMessage(welcomeMsg);

      if (isAudioUnlocked) {
        speakText(welcomeMsg, 'en-IN');
      }
    } else {
      stopListening();
      stopSpeaking();
    }
  }, [isOpen]);

  // Main Speech / Text Flow Handler
  const handleUserSpeech = async (userText: string) => {
    if (!userText) return;
    unlockAudio();

    addMessage('user', userText);
    const textLower = userText.toLowerCase();
    const currentStage = stageRef.current;
    const currentLang = languageRef.current;

    // Stage 1: Welcome / Language Selection
    if (currentStage === 'welcome' || currentStage === 'language') {
      let chosenLang: 'en-IN' | 'te-IN' | 'hi-IN' = 'en-IN';
      let confirmReply = "";

      if (textLower.includes('telugu') || textLower.includes('తెలుగు')) {
        chosenLang = 'te-IN';
        confirmReply = "ధన్యవాదాలు. దయచేసి మీరు ఎదుర్కొంటున్న సమస్యను మరియు స్థానాన్ని చెప్పండి.";
      } else if (textLower.includes('hindi') || textLower.includes('हिंदी')) {
        chosenLang = 'hi-IN';
        confirmReply = "धन्यवाद। कृपया मुझे बताएं कि आप किस समस्या का सामना कर रहे हैं और स्थान क्या है।";
      } else {
        chosenLang = 'en-IN';
        confirmReply = "Thank you. Please tell me the problem you are facing and where it is located.";
      }

      setLanguage(chosenLang);
      languageRef.current = chosenLang;
      setStage('conversation');
      stageRef.current = 'conversation';
      addMessage('ai', confirmReply);
      setLastAiMessage(confirmReply);
      speakText(confirmReply, chosenLang);
      return;
    }

    // Stage 2: Conversation & AI Processing
    if (currentStage === 'conversation') {
      setAssistantState('understanding');

      // Only include user inputs after the language selection stage
      const complaintUserInputs = messagesRef.current
        .filter(m => m.role === 'user')
        .map(m => m.text)
        .concat(userText)
        .filter(t => !/^(english|telugu|hindi|తెలుగు|हिंदी)$/i.test(t.trim()))
        .join('. ');

      const activeTranscript = complaintUserInputs.trim() || userText;

      try {
        setAssistantState('thinking');
        const res = await api.post('/complaints/ai-parse', { 
          transcript: activeTranscript,
          language: currentLang 
        });

        if (res.data?.success && res.data.data) {
          const parsed = res.data.data;
          setParsedComplaint(parsed);
          parsedComplaintRef.current = parsed;

          if (parsed.isComplete) {
            setStage('confirm');
            stageRef.current = 'confirm';
            const summaryText = parsed.summary || (
              currentLang === 'hi-IN' 
                ? `मैंने आपकी शिकायत समझ ली है। शीर्षक: ${parsed.title}। स्थान: ${parsed.location}। क्या मैं इसे दर्ज करूँ?`
                : currentLang === 'te-IN'
                ? `నేను మీ ఫిర్యాదును అర్థం చేసుకున్నాను. శీర్షిక: ${parsed.title}. స్థానం: ${parsed.location}. నేను దీన్ని సమర్పించవచ్చా?`
                : `I have understood your complaint. Title: ${parsed.title}. Location: ${parsed.location}. Category: ${parsed.category}. Priority: ${parsed.priority}. Should I submit this complaint?`
            );

            addMessage('ai', summaryText);
            setLastAiMessage(summaryText);
            speakText(summaryText, currentLang);
          } else {
            const questionText = parsed.nextQuestion || (
              currentLang === 'hi-IN' 
                ? "कृपया मुझे बताएं कि समस्या कहाँ है?" 
                : currentLang === 'te-IN' 
                ? "సమస్య ఎక్కడ ఉందో దయచేసి చెప్పగలరా?" 
                : "Could you please specify where this problem is located?"
            );

            addMessage('ai', questionText);
            setLastAiMessage(questionText);
            speakText(questionText, currentLang);
          }
        }
      } catch (err) {
        console.error('[VOICE ERROR] AI API ERROR:', err);
        const errReply = currentLang === 'hi-IN' 
          ? "क्षमा करें, समझने में परेशानी हुई। क्या आप पुनः बता सकते हैं?" 
          : currentLang === 'te-IN'
          ? "క్షమించండి, నన్ను మళ్ళీ వివరంగా చెప్పనివ్వండి."
          : "Sorry, I had trouble processing that. Could you please repeat your problem?";

        addMessage('ai', errReply);
        setLastAiMessage(errReply);
        speakText(errReply, currentLang);
      }
      return;
    }

    // Stage 3: Confirmation
    if (currentStage === 'confirm') {
      const isYes = textLower.includes('yes') || textLower.includes('submit') || 
                    textLower.includes('हाँ') || textLower.includes('అవును') || textLower.includes('సరే');

      if (isYes) {
        submitParsedComplaint();
      } else {
        setStage('conversation');
        stageRef.current = 'conversation';
        const editReply = currentLang === 'hi-IN'
          ? "ठीक है, कृपया बताएं कि क्या सुधारना है।"
          : currentLang === 'te-IN'
          ? "సరే, దయచేసి ఏమి మార్చాలో చెప్పండి."
          : "Okay, let's correct it. Please tell me what information needs to be changed.";
        
        addMessage('ai', editReply);
        setLastAiMessage(editReply);
        speakText(editReply, currentLang);
      }
    }
  };

  // Submit Complaint to Database
  const submitParsedComplaint = async () => {
    if (!parsedComplaint) return;
    stopListening();
    stopSpeaking();
    setStage('submitting');

    try {
      const finalUserName = citizenName.trim() || user?.name || 'Citizen User';
      const finalUserPhone = citizenPhone.trim() || user?.phone || '9999999999';

      const payload = {
        categoryId: 99,
        departmentId: 99,
        categoryName: parsedComplaint.category || 'General',
        departmentName: 'Public Grievance Department',
        officeName: 'Central Civic Office',
        userId: user?.id || 1,
        userName: finalUserName,
        userPhone: finalUserPhone,
        priority: parsedComplaint.priority || 'Medium',
        location: parsedComplaint.location || 'City Center',
        description: `[AI Voice Complaint Registered]\nCitizen: ${finalUserName} (${finalUserPhone})\nTitle: ${parsedComplaint.title || 'Voice Complaint'}\nDetails: ${parsedComplaint.description || ''}`
      };

      const res = await api.post('/complaints', payload);

      if (res.data?.success) {
        const refNum = res.data.data?.id ? `CMP-${res.data.data.id}` : 'CMP-10082';
        setStage('done');

        const successText = language === 'hi-IN'
          ? `आपकी शिकायत सफलतापूर्वक दर्ज कर ली गई है। आपका संदर्भ नंबर है ${refNum}। धन्यवाद!`
          : language === 'te-IN'
          ? `మీ ఫిర్యాదు విజయవంతంగా నమోదైంది. మీ రిఫరెన్స్ నంబర్ ${refNum}. ధన్యవాదాలు!`
          : `Your complaint has been successfully registered! Your reference number is ${refNum}. Thank you!`;

        addMessage('ai', successText);
        setLastAiMessage(successText);
        speakText(successText, language);

        setTimeout(() => {
          onComplaintSubmit(parsedComplaint);
          onClose();
        }, 5500);
      }
    } catch (e) {
      console.error('[VOICE ERROR] Complaint submission error:', e);
      setStage('confirm');
      const failMsg = language === 'hi-IN'
        ? "नेटवर्क त्रुटि के कारण शिकायत दर्ज नहीं हो सकी। कृपया पुनः प्रयास करें।"
        : language === 'te-IN'
        ? "నెట్‌వర్క్ లోపం కారణంగా ఫిర్యాదు నమోదు విఫలమైంది. దయచేసి మళ్ళీ ప్రయత్నించండి."
        : "Submission failed due to a network error. Please try again.";
      addMessage('ai', failMsg);
      setLastAiMessage(failMsg);
      speakText(failMsg, language);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-[#0b1329] dark:border dark:border-slate-800 transition-all flex flex-col h-[85vh] max-h-[680px]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-[#0d1835]/80 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-md shadow-purple-500/20">
              <Bot className="h-5 w-5" />
              {assistantState === 'speaking' && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              )}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                AI Voice Assistant
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                  {language === 'te-IN' ? 'తెలుగు' : language === 'hi-IN' ? 'हिंदी' : 'English'}
                </span>
              </h2>
              
              {/* Dynamic State Indicator */}
              <div className="flex items-center gap-1.5 mt-0.5">
                {assistantState === 'listening' && (
                  <span className="text-xs font-bold text-rose-500 flex items-center gap-1 animate-pulse">
                    <span className="h-2 w-2 rounded-full bg-rose-500"></span> 🔴 Listening...
                  </span>
                )}
                {assistantState === 'understanding' && (
                  <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                    🧠 Understanding...
                  </span>
                )}
                {assistantState === 'thinking' && (
                  <span className="text-xs font-bold text-indigo-400 flex items-center gap-1 animate-pulse">
                    🤖 AI is thinking...
                  </span>
                )}
                {assistantState === 'speaking' && (
                  <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                    🔊 AI is speaking...
                  </span>
                )}
                {assistantState === 'complaint_ready' && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    ✓ Complaint Ready
                  </span>
                )}
                {assistantState === 'ready' && (
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    🎙️ Ready
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-1.5">
            {/* Diagnostic Speaker Test Button */}
            <button
              onClick={handleTestSpeaker}
              title="Test device speaker hardware sound"
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/60 font-semibold text-xs transition-colors shadow-sm"
            >
              <Volume1 className="h-3.5 w-3.5" /> Test Sound
            </button>

            <button
              onClick={() => {
                const nextMuted = !isMuted;
                setIsMuted(nextMuted);
                if (nextMuted) stopSpeaking();
              }}
              title={isMuted ? "Unmute AI Voice" : "Mute AI Voice"}
              className={`p-2 rounded-xl transition-colors ${isMuted ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800'}`}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Start Voice Assistant Overlay / Autoplay Unlock Banner */}
        {!isAudioUnlocked && (
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-3 px-6 text-white flex items-center justify-between text-xs font-medium shadow-inner">
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-300 animate-spin" />
              Click button to unlock speaker sound
            </span>
            <button
              onClick={() => {
                unlockAudio();
                if (lastAiMessage) speakText(lastAiMessage, language);
              }}
              className="px-3 py-1 bg-white text-purple-700 hover:bg-purple-50 rounded-lg font-bold text-xs shadow transition-all active:scale-95 flex items-center gap-1"
            >
              <Play className="h-3 w-3 fill-purple-700" /> 🎙️ Start Voice Assistant
            </button>
          </div>
        )}

        {/* Autoplay Blocked Fallback Button */}
        {blockedAutoplayText && (
          <div className="bg-amber-500 text-white p-3 px-6 flex items-center justify-between text-xs font-bold shadow-md animate-pulse">
            <span className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> Click button below to play AI speech out loud:
            </span>
            <button
              onClick={() => {
                unlockAudio();
                speakText(blockedAutoplayText, language);
              }}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg transition-all flex items-center gap-1.5 text-xs shadow"
            >
              <Volume2 className="h-4 w-4 text-emerald-400 animate-bounce" /> 🔊 PLAY AI VOICE ALOUD
            </button>
          </div>
        )}

        {/* Conversation Transcript Container */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/40 dark:bg-transparent">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl font-bold ${
                m.role === 'user' 
                  ? 'bg-govBlue-600 text-white shadow-sm' 
                  : 'bg-purple-600 text-white shadow-sm shadow-purple-500/20'
              }`}>
                {m.role === 'user' ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={`px-4 py-3 rounded-2xl max-w-[80%] text-sm leading-relaxed ${
                m.role === 'user' 
                  ? 'bg-govBlue-600 text-white rounded-tr-none' 
                  : 'bg-white border border-slate-200 text-slate-800 dark:bg-[#111f3c] dark:border-slate-800 dark:text-slate-100 rounded-tl-none shadow-sm'
              }`}>
                {m.text}
              </div>
            </div>
          ))}

          {/* Live Microphone Transcript */}
          {transcript && (
            <div className="flex gap-3 flex-row-reverse opacity-80 animate-pulse">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-sm">
                <Mic className="h-4 w-4" />
              </div>
              <div className="px-4 py-3 rounded-2xl max-w-[80%] text-sm bg-rose-500 text-white rounded-tr-none italic shadow-sm">
                {transcript}...
              </div>
            </div>
          )}

          {/* AI Speaking Waveform Animation */}
          {assistantState === 'speaking' && (
            <div className="flex items-center gap-2 p-3 px-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl text-xs text-emerald-700 dark:text-emerald-300 animate-fadeIn">
              <Volume2 className="h-4 w-4 text-emerald-600 animate-bounce" />
              <span className="font-semibold">AI is speaking aloud through speakers...</span>
              <div className="flex items-end gap-1 h-4 ml-auto">
                <span className="w-1 bg-emerald-500 rounded-full animate-[bounce_1s_infinite_100ms] h-full"></span>
                <span className="w-1 bg-emerald-500 rounded-full animate-[bounce_1s_infinite_300ms] h-3"></span>
                <span className="w-1 bg-emerald-500 rounded-full animate-[bounce_1s_infinite_200ms] h-full"></span>
                <span className="w-1 bg-emerald-500 rounded-full animate-[bounce_1s_infinite_400ms] h-2"></span>
              </div>
            </div>
          )}

          {/* Parsed Complaint Preview Card */}
          {parsedComplaint && stage === 'confirm' && (
            <div className="mx-2 sm:mx-4 rounded-2xl border border-purple-200 bg-purple-50/70 p-4 dark:border-purple-900/40 dark:bg-purple-950/20 text-left text-xs space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between border-b border-purple-200/60 dark:border-purple-900/40 pb-2">
                <span className="font-extrabold text-purple-950 dark:text-purple-300 text-sm flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-purple-600" /> Extracted Complaint Details
                </span>
                <span className="px-2 py-0.5 rounded-md bg-purple-200 text-purple-800 font-bold uppercase text-[10px] dark:bg-purple-900/60 dark:text-purple-200">
                  {parsedComplaint.priority || 'Medium'} Priority
                </span>
              </div>

              <p><strong className="text-purple-900 dark:text-purple-300">Title:</strong> <span className="text-slate-700 dark:text-slate-200">{parsedComplaint.title}</span></p>
              <p><strong className="text-purple-900 dark:text-purple-300">Category:</strong> <span className="text-slate-700 dark:text-slate-200">{parsedComplaint.category}</span></p>
              <p><strong className="text-purple-900 dark:text-purple-300">Location:</strong> <span className="text-slate-700 dark:text-slate-200">{parsedComplaint.location}</span></p>
              <p><strong className="text-purple-900 dark:text-purple-300">Details:</strong> <span className="text-slate-700 dark:text-slate-200">{parsedComplaint.description}</span></p>
              
              {/* Citizen Personal Info Section */}
              <div className="mt-2 pt-2 border-t border-purple-200/60 dark:border-purple-900/40">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1">
                    <UserIcon className="h-3.5 w-3.5" /> Citizen Information
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowUserInfoFields(!showUserInfoFields)}
                    className="text-[10px] text-purple-700 dark:text-purple-300 underline font-semibold hover:text-purple-900"
                  >
                    {showUserInfoFields ? 'Hide' : 'Edit Contact'}
                  </button>
                </div>

                {showUserInfoFields ? (
                  <div className="grid grid-cols-2 gap-2 mt-1.5">
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Your Name</label>
                      <input
                        type="text"
                        value={citizenName}
                        onChange={(e) => setCitizenName(e.target.value)}
                        placeholder="Citizen Name"
                        className="w-full px-2 py-1.5 text-xs bg-white dark:bg-[#111f3c] border border-purple-200 dark:border-purple-800 rounded-lg text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Phone Number</label>
                      <input
                        type="text"
                        value={citizenPhone}
                        onChange={(e) => setCitizenPhone(e.target.value)}
                        placeholder="Phone Number"
                        className="w-full px-2 py-1.5 text-xs bg-white dark:bg-[#111f3c] border border-purple-200 dark:border-purple-800 rounded-lg text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Registering under: <strong className="text-slate-800 dark:text-slate-200">{citizenName || user?.name || 'Citizen User'}</strong> ({citizenPhone || user?.phone || 'Not provided'})
                  </p>
                )}
              </div>
              
              <div className="pt-2 flex gap-2">
                <button 
                  onClick={submitParsedComplaint} 
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2.5 rounded-xl font-bold hover:from-purple-700 hover:to-indigo-700 shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" /> Register Complaint
                </button>
                <button 
                  onClick={() => {
                    setStage('conversation');
                    const editMsg = language === 'hi-IN'
                      ? "ठीक है, कृपया बताएं कि क्या सुधारना है।"
                      : language === 'te-IN'
                      ? "సరే, దయచేసి ఏమి మార్చాలో చెప్పండి."
                      : "Okay, let's correct it. Please tell me what information needs to be changed.";
                    addMessage('ai', editMsg);
                    setLastAiMessage(editMsg);
                    speakText(editMsg, language);
                  }} 
                  className="flex-1 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-2.5 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                >
                  Edit Information
                </button>
              </div>
            </div>
          )}

          {/* Submission Success Screen */}
          {stage === 'done' && (
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-900/30">
              <div className="h-12 w-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-bounce">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h3 className="text-base font-extrabold text-emerald-800 dark:text-emerald-300">Complaint Submitted Successfully!</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">Your complaint has been saved in the system. The assistant will close automatically in a moment.</p>
            </div>
          )}
        </div>

        {/* Audio Action Controls Toolbar (Replay, Stop Speech, Mute) */}
        <div className="px-4 py-2 bg-slate-100/70 dark:bg-[#0c162e] border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {/* Replay Button */}
            <button
              onClick={() => {
                if (lastAiMessage) {
                  unlockAudio();
                  console.log('[VOICE] Replay last response clicked:', lastAiMessage);
                  speakText(lastAiMessage, language);
                }
              }}
              disabled={!lastAiMessage}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors font-medium"
              title="Replay last AI response"
            >
              <RotateCcw className="h-3.5 w-3.5" /> 🔁 Replay Voice
            </button>

            {/* Stop Speech Button */}
            {assistantState === 'speaking' && (
              <button
                onClick={stopSpeaking}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 hover:bg-rose-100 font-medium transition-colors"
                title="Stop AI voice"
              >
                <Square className="h-3.5 w-3.5 fill-rose-600" /> ⏹️ Stop AI Voice
              </button>
            )}
          </div>

          {/* Selected Language Display */}
          <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
            <span>Lang:</span>
            <select
              value={language}
              onChange={(e) => {
                const newLang = e.target.value as any;
                setLanguage(newLang);
                unlockAudio();
                const switchMsg = newLang === 'te-IN' 
                  ? "మీరు తెలుగు ఎంచుకున్నారు. మీ సమస్యను చెప్పండి." 
                  : newLang === 'hi-IN' 
                  ? "आपने हिंदी चुनी है। कृपया अपनी समस्या बताएं।" 
                  : "You selected English. Please describe your complaint.";
                setStage('conversation');
                addMessage('ai', switchMsg);
                setLastAiMessage(switchMsg);
                speakText(switchMsg, newLang);
              }}
              className="bg-white dark:bg-[#111f3c] border border-slate-200 dark:border-slate-700 rounded-md px-1.5 py-0.5 text-xs text-slate-800 dark:text-slate-200 font-bold focus:outline-none"
            >
              <option value="en-IN">English</option>
              <option value="te-IN">Telugu (తెలుగు)</option>
              <option value="hi-IN">Hindi (हिंदी)</option>
            </select>
          </div>
        </div>

        {/* Input Controls Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#080f21] space-y-3">
          
          {/* Quick Language Selection Buttons (Welcome Stage) */}
          {(stage === 'welcome' || stage === 'language') && (
            <div className="flex gap-2 w-full">
              <button 
                onClick={() => handleUserSpeech('English')} 
                className="flex-1 py-2.5 text-xs font-extrabold rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/60 transition-colors shadow-sm"
              >
                🇬🇧 English
              </button>
              <button 
                onClick={() => handleUserSpeech('Telugu')} 
                className="flex-1 py-2.5 text-xs font-extrabold rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60 transition-colors shadow-sm"
              >
                🇮🇳 తెలుగు (Telugu)
              </button>
              <button 
                onClick={() => handleUserSpeech('Hindi')} 
                className="flex-1 py-2.5 text-xs font-extrabold rounded-xl bg-orange-50 text-orange-700 hover:bg-orange-100 dark:bg-orange-950/40 dark:text-orange-300 dark:hover:bg-orange-900/60 transition-colors shadow-sm"
              >
                🇮🇳 हिंदी (Hindi)
              </button>
            </div>
          )}

          {/* Main Controls: Mic Button & Text Input */}
          {stage !== 'done' && stage !== 'submitting' && (
            <div className="flex items-center gap-2">
              
              {/* Text Input Fallback */}
              <input
                type="text"
                placeholder={
                  language === 'te-IN' ? "మీ సమస్యను ఇక్కడ టైప్ చేయండి లేదా మాట్లాడండి..." 
                  : language === 'hi-IN' ? "अपनी समस्या यहाँ टाइप करें या बोलें..." 
                  : "Type or speak your complaint..."
                }
                value={manualInputText}
                onChange={(e) => setManualInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && manualInputText.trim()) {
                    handleUserSpeech(manualInputText.trim());
                    setManualInputText('');
                  }
                }}
                className="flex-1 px-4 py-3 text-xs bg-slate-100 dark:bg-[#111f3c] border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              {manualInputText.trim() ? (
                <button
                  onClick={() => {
                    handleUserSpeech(manualInputText.trim());
                    setManualInputText('');
                  }}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-md hover:bg-purple-700 transition-all active:scale-95"
                >
                  <Send className="h-5 w-5" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (assistantState === 'listening') {
                      stopListening();
                    } else {
                      startListening();
                    }
                  }}
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-lg transition-all active:scale-95 ${
                    assistantState === 'listening'
                      ? 'bg-rose-500 text-white shadow-rose-500/30 animate-pulse'
                      : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-purple-600/30 hover:from-purple-700 hover:to-indigo-700'
                  }`}
                  title={assistantState === 'listening' ? 'Stop Listening' : 'Start Listening'}
                >
                  {assistantState === 'listening' ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default AIVoiceAssistant;
