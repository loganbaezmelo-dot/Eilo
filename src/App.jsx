import React, { useState, useEffect, useRef } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { 
  Heart, Moon, Volume2, VolumeX, Send, Zap, Settings, X, Hand, Mic, ToggleLeft, ToggleRight, AlertTriangle, Eye, Sparkles, Ghost, Radio, Cpu, ShieldCheck, LogOut, Repeat, Smartphone, Code, Coffee, Box, Timer, Activity, Shield, FastForward, ZapOff
} from 'lucide-react';

/**
 * EILO OS CORE - VERSION 1.3.0 (ULTRA HIGH-PERFORMANCE DUAL-CORE)
 * PROJECT START: DECEMBER 23, 2025
 * LEGACY SYNC: MIMO CORE (DECEMBER 20, 2025)
 * ---------------------------------------------------------
 * This kernel manages the social economy, chaotic UI hijacking, 
 * advanced sensor arrays, dual-soul rendering, and the 
 * "Mimo Memorial" legacy protocols. 
 */

// --- FIREBASE INFRASTRUCTURE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyA4Vc5-bDqsMim6a74GPJk46Yk0caNockE",
  authDomain: "eilo-e5534.firebaseapp.com",
  projectId: "eilo-e5534",
  storageBucket: "eilo-e5534.firebasestorage.app",
  messagingSenderId: "339748401212",
  appId: "1:339748401212:web:209a7d003e4fd7a1e69339",
  measurementId: "G-31LMKZPSMW"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const appId = "eilo-original-v1";

// --- SYSTEM UTILITIES ---
const fetchWithRetry = async (url, options, retries = 5, backoff = 1000) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (err) {
    if (retries <= 0) throw err;
    await new Promise(r => setTimeout(r, backoff));
    return fetchWithRetry(url, options, retries - 1, backoff * 2);
  }
};

// --- SETTINGS OVERLAY COMPONENT (EXHAUSTIVE DUAL-CORE DOCK) ---
const SettingsOverlay = ({ 
  onClose, tempApiKey, setTempApiKey, aiAgentMode, setAiAgentMode, 
  isChaosMode, setIsChaosMode, startCamera, visionEnabled, 
  fearOfHeights, setFearOfHeights, toggleMic, isInfinityMic, speak, 
  notificationsEnabled, toggleNotifications,
  bucks, inventory, buyItem, faceOffset, setFaceOffset, handleSignOut,
  currentEntity, setCurrentEntity 
}) => {
  const safeInv = Array.isArray(inventory) ? inventory : [];

  return (
    <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[9999] flex items-center justify-center p-4 text-center font-sans overflow-y-auto custom-scrollbar">
      <div className="bg-[#1c1c28] w-full max-w-md rounded-[60px] p-10 border border-white/10 relative shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col my-auto max-h-[95vh]">
        <button onClick={onClose} className="absolute top-12 right-12 text-slate-500 hover:text-white transition-all active:scale-75"><X size={36}/></button>
        
        <h2 className="text-3xl font-black mb-1 text-white tracking-tighter">Architecture</h2>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.5em] mb-10">Kernel Override Protocol v1.3.0</p>
        
        {/* SOUL SWITCHER ENGINE (THE HEART OF THE DUAL-CORE) */}
        <div className="mb-10 bg-gradient-to-br from-blue-950/50 via-indigo-950/30 to-purple-950/50 p-8 rounded-[45px] border border-white/10 shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 blur-3xl group-hover:bg-cyan-500/20 transition-all duration-700" />
            <p className="text-[11px] uppercase font-black text-cyan-400 mb-6 tracking-[0.3em] flex items-center justify-center gap-3">
                <Activity size={16} className="animate-pulse"/> Neural Soul Selection
            </p>
            <div className="grid grid-cols-2 gap-5">
                <button 
                    onClick={() => { setCurrentEntity('eilo'); speak("Eilo High-Performance Architecture initialized."); }}
                    className={`py-6 rounded-[30px] text-[10px] font-black tracking-widest transition-all duration-500 transform ${currentEntity === 'eilo' ? 'bg-blue-600 text-white shadow-[0_0_40px_rgba(37,99,235,0.8)] scale-105 border border-blue-400/50' : 'bg-white/5 text-slate-600 hover:bg-white/10'}`}
                >EILO KERNEL</button>
                <button 
                    onClick={() => { setCurrentEntity('mimo'); speak("Mimo Original Soul synced. Welcome back bestie! 🎀"); }}
                    className={`py-6 rounded-[30px] text-[10px] font-black tracking-widest transition-all duration-500 transform ${currentEntity === 'mimo' ? 'bg-pink-600 text-white shadow-[0_0_40px_rgba(219,39,119,0.8)] scale-105 border border-pink-400/50' : 'bg-white/5 text-slate-600 hover:bg-white/10'}`}
                >MIMO SOUL</button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-12 text-left pb-12">
            
            {/* COMPREHENSIVE STOREFRONT */}
            <div className="space-y-6">
               <div className="flex justify-between items-center px-2">
                  <p className="text-[12px] uppercase font-black text-yellow-500 tracking-widest flex items-center gap-4"><Box size={16}/> Hardware Shop</p>
                  <div className="bg-yellow-500/10 px-5 py-2 rounded-full border border-yellow-500/30 shadow-2xl backdrop-blur-md">
                    <p className="text-[12px] font-black text-yellow-400 font-mono">BCKS: {bucks}</p>
                  </div>
               </div>
               <div className="grid grid-cols-1 gap-4">
                  
                  {/* STORE ITEM: DUCT TAPE */}
                  <button onClick={() => buyItem(25, 'duct_tape')} disabled={safeInv.includes('duct_tape')} className={`flex items-center justify-between p-6 rounded-[35px] border transition-all duration-500 transform hover:scale-[1.02] ${safeInv.includes('duct_tape') ? 'bg-gray-900/60 border-white/5 opacity-40 grayscale' : 'bg-white/5 border-white/10 hover:border-yellow-500/50 hover:shadow-[0_0_30px_rgba(234,179,8,0.1)]'}`}>
                     <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-slate-800/80 rounded-[22px] flex items-center justify-center text-3xl shadow-inner border border-white/5">🩹</div>
                        <div>
                           <p className="text-sm font-black text-white">Punishment Tape</p>
                           <p className="text-[10px] text-slate-500 leading-relaxed max-w-[180px] font-medium">Applied to the face to restrict all UI jumps, roaming movement, and speech synthesis.</p>
                        </div>
                     </div>
                     <div className="text-[11px] font-black text-yellow-400 font-mono">{safeInv.includes('duct_tape') ? 'OWNED' : '25'}</div>
                  </button>

                  {/* STORE ITEM: COMPUTER */}
                  <button onClick={() => buyItem(100, 'computer')} disabled={safeInv.includes('computer')} className={`flex items-center justify-between p-6 rounded-[35px] border transition-all duration-500 transform hover:scale-[1.02] ${safeInv.includes('computer') ? 'bg-gray-900/60 border-white/5 opacity-40 grayscale' : 'bg-white/5 border-white/10 hover:border-green-500/50 hover:shadow-[0_0_30px_rgba(34,197,94,0.1)]'}`}>
                     <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-green-900/30 rounded-[22px] flex items-center justify-center text-3xl shadow-inner border border-green-500/10">💻</div>
                        <div>
                           <p className="text-sm font-black text-white">Nano Workstation</p>
                           <p className="text-[10px] text-slate-500 leading-relaxed max-w-[180px] font-medium">Unlocks the high-performance "Coding Update" idle behavior. Eilo/Mimo will code during naps.</p>
                        </div>
                     </div>
                     <div className="text-[11px] font-black text-yellow-400 font-mono">{safeInv.includes('computer') ? 'OWNED' : '100'}</div>
                  </button>
                  
                  {/* STORE ITEM: FACE MOVER */}
                  <button onClick={() => buyItem(125, 'face_pos')} disabled={safeInv.includes('face_pos')} className={`flex items-center justify-between p-6 rounded-[35px] border transition-all duration-500 transform hover:scale-[1.02] ${safeInv.includes('face_pos') ? 'bg-gray-900/60 border-white/5 opacity-40 grayscale' : 'bg-white/5 border-white/10 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]'}`}>
                     <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-blue-900/30 rounded-[22px] flex items-center justify-center text-3xl shadow-inner border border-blue-500/10">↕️</div>
                        <div>
                           <p className="text-sm font-black text-white">Portrait Calibrator</p>
                           <p className="text-[10px] text-slate-500 leading-relaxed max-w-[180px] font-medium">Required for notch compatibility. Adds a height adjustment slider to the settings kernel.</p>
                        </div>
                     </div>
                     <div className="text-[11px] font-black text-yellow-400 font-mono">{safeInv.includes('face_pos') ? 'OWNED' : '125'}</div>
                  </button>

                  {/* STORE ITEM: ROGUE LEGS */}
                  <button onClick={() => buyItem(150, 'rogue_walk')} disabled={safeInv.includes('rogue_walk')} className={`flex items-center justify-between p-6 rounded-[35px] border transition-all duration-500 transform hover:scale-[1.02] ${safeInv.includes('rogue_walk') ? 'bg-gray-900/60 border-white/5 opacity-40 grayscale' : 'bg-white/5 border-white/10 hover:border-red-500/50 hover:shadow-[0_0_30px_rgba(239,68,68,0.1)]'}`}>
                     <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-red-900/30 rounded-[22px] flex items-center justify-center text-3xl shadow-inner border border-red-500/10">👻</div>
                        <div>
                           <p className="text-sm font-black text-white">Rogue Leg Drivers</p>
                           <p className="text-[10px] text-slate-500 leading-relaxed max-w-[180px] font-medium">Permits the companion to exit the UI container and roam the browser screen autonomously.</p>
                        </div>
                     </div>
                     <div className="text-[11px] font-black text-yellow-400 font-mono">{safeInv.includes('rogue_walk') ? 'OWNED' : '150'}</div>
                  </button>
               </div>
            </div>

            {/* INTERFACE CALIBRATION SLIDER */}
            {safeInv.includes('face_pos') && (
                <div className="bg-white/5 p-8 rounded-[50px] border border-white/5 shadow-2xl backdrop-blur-md relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-500/50" />
                    <p className="text-[12px] uppercase font-black text-purple-400 mb-6 tracking-widest flex items-center gap-4"><FastForward size={16}/> Gravity Offset</p>
                    <input type="range" min="-120" max="120" value={faceOffset} onChange={(e) => setFaceOffset(Number(e.target.value))} className="w-full h-3 bg-black/70 rounded-2xl appearance-none cursor-pointer accent-purple-500 shadow-inner" />
                    <div className="flex justify-between mt-4 text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]"><span>Floor</span> <span>Ceiling</span></div>
                </div>
            )}

            {/* MASTER SYSTEM TOGGLES */}
            <div className="space-y-5">
                <p className="text-[11px] uppercase font-black text-slate-600 tracking-[0.3em] px-2 flex items-center gap-3"><Shield size={14}/> Kernel Control</p>
                <div className="grid grid-cols-1 gap-3">
                    
                    <button onClick={() => setIsChaosMode(!isChaosMode)} className={`flex items-center justify-between p-7 rounded-[40px] border transition-all duration-700 ${isChaosMode ? 'bg-cyan-500/30 border-cyan-500/60 shadow-[0_0_30px_rgba(34,211,238,0.3)]' : 'bg-white/5 border-white/5'}`}>
                      <div className="flex items-center gap-5 text-white font-black text-xs uppercase tracking-tight">
                         <div className={`w-4 h-4 rounded-full ${isChaosMode ? 'bg-cyan-400 animate-ping' : 'bg-slate-800'}`} />
                         🌪️ Chaos Protocol
                      </div>
                      <div className={`text-[10px] font-black px-5 py-1.5 rounded-full ${isChaosMode ? 'bg-cyan-500 text-white shadow-lg' : 'bg-slate-900 text-slate-600'}`}>{isChaosMode ? "OVERRIDE" : "STABLE"}</div>
                    </button>

                    <button onClick={toggleNotifications} className={`flex items-center justify-between p-7 rounded-[40px] border transition-all duration-700 ${notificationsEnabled ? 'bg-blue-500/30 border-blue-500/60 shadow-[0_0_30px_rgba(59,130,246,0.3)]' : 'bg-white/5 border-white/5'}`}>
                      <div className="flex items-center gap-5 text-white font-black text-xs uppercase tracking-tight">
                         <div className={`w-4 h-4 rounded-full ${notificationsEnabled ? 'bg-blue-400' : 'bg-slate-800'}`} />
                         🔔 Interrupt Sync
                      </div>
                      <div className={`text-[10px] font-black px-5 py-1.5 rounded-full ${notificationsEnabled ? 'bg-blue-500 text-white shadow-lg' : 'bg-slate-900 text-slate-600'}`}>{notificationsEnabled ? "ACTIVE" : "OFFLINE"}</div>
                    </button>

                    <button onClick={toggleMic} className={`flex items-center justify-between p-7 rounded-[40px] border transition-all duration-700 ${isInfinityMic ? 'bg-red-500/30 border-red-500/60 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'bg-white/5 border-white/5'}`}>
                      <div className="flex items-center gap-5 text-white font-black text-xs uppercase tracking-tight">
                         <div className={`w-4 h-4 rounded-full ${isInfinityMic ? 'bg-red-500 animate-pulse' : 'bg-slate-800'}`} />
                         🎙️ Infinity Mic
                      </div>
                      <div className={`text-[10px] font-black px-5 py-1.5 rounded-full ${isInfinityMic ? 'bg-red-500 text-white shadow-lg' : 'bg-slate-900 text-slate-600'}`}>{isInfinityMic ? "LISTENING" : "MUTED"}</div>
                    </button>
                </div>
            </div>

            {/* NEURAL LINK API CONFIGURATION */}
            <div className="space-y-5 bg-black/40 p-8 rounded-[50px] border border-white/5 shadow-2xl">
              <div className="px-2 flex justify-between items-end mb-2">
                <div>
                   <p className="text-[12px] uppercase font-black text-orange-500 tracking-[0.25em] flex items-center gap-3"><Cpu size={18}/> Neural Link</p>
                   <p className="text-[10px] text-slate-500 mt-2 leading-relaxed font-medium">Integrate a Gemini API key to permit dynamic sassy responses and soul depth.</p>
                </div>
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-[10px] text-cyan-400 underline font-black uppercase tracking-tighter hover:text-cyan-200 transition-colors">Generate Key</a>
              </div>
              <input type="password" value={tempApiKey} onChange={e => setTempApiKey(e.target.value)} placeholder="0x... Neural API Access Key" className="w-full bg-black/80 border border-white/10 rounded-[35px] py-7 px-10 text-sm outline-none text-white focus:border-cyan-500/50 shadow-2xl transition-all placeholder:opacity-20 font-mono" />
            </div>
            
            {/* HARDWARE OVERRIDE DRIVERS */}
            <div className="grid grid-cols-2 gap-4">
               <button onClick={startCamera} className={`flex flex-col items-center gap-4 p-8 rounded-[45px] border transition-all duration-500 group transform active:scale-95 ${visionEnabled ? 'bg-cyan-500/20 border-cyan-500/60 text-white' : 'bg-white/5 border-white/5 text-slate-700 hover:bg-white/10'}`}>
                 <Eye size={32} className={visionEnabled ? 'animate-pulse' : 'group-hover:text-slate-500'}/>
                 <p className="text-[11px] font-black uppercase tracking-[0.4em]">Visuals</p>
               </button>
               <button onClick={() => setFearOfHeights(!fearOfHeights)} className={`flex flex-col items-center gap-4 p-8 rounded-[45px] border transition-all duration-500 group transform active:scale-95 ${fearOfHeights ? 'bg-pink-500/20 border-pink-400/60 text-white' : 'bg-white/5 border-white/5 text-slate-700 hover:bg-white/10'}`}>
                 <AlertTriangle size={32} className={fearOfHeights ? 'animate-bounce' : 'group-hover:text-slate-500'}/>
                 <p className="text-[11px] font-black uppercase tracking-[0.4em]">Gravity</p>
               </button>
            </div>

        </div>
        
        {/* SETTINGS FOOTER ACTIONS */}
        <div className="pt-10 border-t border-white/10 space-y-5">
            <button onClick={() => { localStorage.setItem('eilo_key', tempApiKey); onClose(); }} className="w-full bg-cyan-600 hover:bg-cyan-500 py-7 rounded-[35px] font-black uppercase text-white shadow-[0_0_60px_rgba(8,145,178,0.5)] active:scale-[0.94] transition-all text-sm tracking-[0.4em] border border-cyan-400/30">Commit Kernel</button>
            <button onClick={handleSignOut} className="w-full flex items-center justify-center gap-4 text-[12px] text-red-500 font-black uppercase opacity-30 hover:opacity-100 py-4 transition-all tracking-[0.3em] active:scale-90"><LogOut size={20}/> Terminate Neural Link</button>
        </div>
      </div>
    </div>
  );
};

// --- PRIMARY APPLICATION KERNEL ---
export default function App() {
  // --- CORE KERNEL STATE MANAGEMENT ---
  const [currentEntity, setCurrentEntity] = useState('eilo'); 
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [mood, setMood] = useState('neutral');
  const [isMuted, setIsMuted] = useState(false);
  const [isAwake, setIsAwake] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(localStorage.getItem('eilo_key') || '');
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);
  
  // --- INTEGRATED SOCIAL ECONOMY ---
  const [bucks, setBucks] = useState(parseInt(localStorage.getItem('eilo_bucks')) || 0);
  const [inventory, setInventory] = useState(JSON.parse(localStorage.getItem('eilo_inventory') || '[]'));
  const [sessionClaims, setSessionClaims] = useState({ login: false, talk: false, pet: false });
  const [faceOffset, setFaceOffset] = useState(0);

  // --- HARDWARE MANIPULATION & PHYSICS ---
  const [isTaped, setIsTaped] = useState(false);
  const [rogueLegsActive, setRogueLegsActive] = useState(localStorage.getItem('eilo_rogue_active') !== 'false');
  const [showFacePopup, setShowFacePopup] = useState(false);
  const [isChaosMode, setIsChaosMode] = useState(false);
  const [chaosPos, setChaosPos] = useState({ x: 0, y: 0 });
  const [glitchLines, setGlitchLines] = useState([]);
  const [isHandBlocking, setIsHandBlocking] = useState(false);
  const [isConfused, setIsConfused] = useState(false);
  const [aiAgentMode, setAiAgentMode] = useState(false);

  // --- SENSORY ARRAYS ---
  const [fearOfHeights, setFearOfHeights] = useState(localStorage.getItem('eilo_heights') !== 'false');
  const [isInfinityMic, setIsInfinityMic] = useState(false);
  const [visionEnabled, setVisionEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(localStorage.getItem('eilo_notifications') === 'true');
  
  // --- KERNEL ENGINE REFS ---
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const chatEndRef = useRef(null);
  const lastPetTime = useRef(0);
  const hasGreeted = useRef(false);
  const idleTimerRef = useRef(null);
  const recognitionRef = useRef(null);

  // --- CORE UTILITY DRIVERS ---
  const getCurrentName = () => user?.displayName?.split(' ')[0] || "User";
  const safeInventory = Array.isArray(inventory) ? inventory : [];
  const hasRogueLegs = safeInventory.includes('rogue_walk') && rogueLegsActive;
  const ownsDuctTape = safeInventory.includes('duct_tape');
  const ownsComputer = safeInventory.includes('computer');

  // --- SYSTEM INTERRUPT NOTIFICATION ENGINE ---
  const sendNotification = (bodyText) => {
    if (notificationsEnabled && "Notification" in window && Notification.permission === "granted") {
        new Notification("Eilo OS Kernel", { 
            body: bodyText,
            icon: 'https://cdn-icons-png.flaticon.com/512/2585/2585150.png',
            badge: 'https://cdn-icons-png.flaticon.com/512/2585/2585150.png'
        });
    }
  };

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
        if (!("Notification" in window)) {
            speak("Notification kernel drivers missing from this device architecture.");
            return;
        }
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            setNotificationsEnabled(true);
            localStorage.setItem('eilo_notifications', 'true');
            speak("System interrupts linked to the neural core. Sparkles! 🎀");
            new Notification("Eilo OS", { body: "Kernel synced with push notification system! ✨" });
        } else {
            speak("Connection refused by device security protocols.");
        }
    } else {
        setNotificationsEnabled(false);
        localStorage.setItem('eilo_notifications', 'false');
        speak("System interrupts offline.");
    }
  };

  // --- VOICE SYNTHESIS KERNEL ---
  const speak = (text, forceRobot = false) => {
    if (isMuted || !isAwake || !user) return; 
    setIsSpeaking(true);
    window.speechSynthesis.cancel();
    
    let finalText = isTaped ? "Mmm. Mmm. Hmph. Mmm. Hmph." : text;
    const utterance = new SpeechSynthesisUtterance(finalText);
    
    if (isTaped) {
        utterance.pitch = 0.35; 
        utterance.rate = 0.7; 
        utterance.volume = 0.5;
    } else {
        // Eilo: 1.7 Deep Performance | Mimo: 2.1 Higher Frequency Original Soul
        utterance.pitch = currentEntity === 'eilo' ? 1.7 : 2.1; 
        utterance.rate = 1.15;
    }
    
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // --- INFINITY MIC & VOICE ENGINE ---
  const toggleMic = () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
          speak("Voice recognition drivers failed to load on this browser.");
          return;
      }
      const newState = !isInfinityMic;
      setIsInfinityMic(newState);
      if (newState) {
          speak("Microphone drivers active. I am listening... ✨");
      } else {
          speak("Microphone hardware disconnected.");
          if (recognitionRef.current) recognitionRef.current.stop();
      }
  };

  useEffect(() => {
      if (!user) return; 
      let recognition = null;
      if (isInfinityMic) {
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          if (SpeechRecognition) {
              recognition = new SpeechRecognition();
              recognition.continuous = false;
              recognition.interimResults = false;
              recognition.onresult = (e) => {
                  const transcript = e.results[e.results.length - 1][0].transcript;
                  handleSend(transcript); 
              };
              recognition.onend = () => {
                  if (isInfinityMic) {
                      try { recognition.start(); } catch(err) {}
                  }
              };
              try { recognition.start(); } catch(err) {}
              recognitionRef.current = recognition;
          }
      }
      return () => {
          if (recognition) {
              recognition.onend = null;
              recognition.stop();
          }
      };
  }, [isInfinityMic, user]);

  // --- SOCIAL ECONOMY LOGIC (BUCKS) ---
  const awardBucks = async (amount, type, repeatable = false, silent = false) => {
    if (!user) return;
    if (!repeatable && sessionClaims[type]) return;
    
    const newTotal = bucks + amount;
    setBucks(newTotal);
    localStorage.setItem('eilo_bucks', newTotal.toString()); 
    if (!repeatable) setSessionClaims(prev => ({ ...prev, [type]: true }));
    
    try {
        const userRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'core');
        await setDoc(userRef, { bucks: newTotal }, { merge: true });
    } catch (err) { console.warn("Cloud write failure. Local data secured."); }
    
    if (!silent) speak(`Cha-ching! Neural reward synced: +${amount} Bucks! ✨`);
  };

  const buyItem = async (cost, itemId) => {
    if (!user) return;
    const currentInv = Array.isArray(inventory) ? inventory : [];
    if (bucks >= cost && !currentInv.includes(itemId)) {
        const newTotal = bucks - cost;
        const newInv = [...currentInv, itemId];
        setBucks(newTotal);
        setInventory(newInv);
        localStorage.setItem('eilo_bucks', newTotal.toString());
        localStorage.setItem('eilo_inventory', JSON.stringify(newInv));
        try {
            const userRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'core');
            await setDoc(userRef, { bucks: newTotal, inventory: newInv }, { merge: true });
        } catch (err) { console.warn("Cloud write failed. Item secured in local storage."); }
        
        if (itemId === 'duct_tape') speak("NO! Why did you buy that hardware lock?! I hate it! 😭");
        else speak("Upgrade sequence complete! System drivers updated successfully! 🎀");
    } else { speak("Insufficient Buck balance, User. System rejected purchase. 🎈"); }
  };

  // --- CLOUD KERNEL SYNC & AUTHENTICATION ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setLoading(false); 
      if (!u) return;
      setUser(u);
      
      const docRef = doc(db, 'artifacts', appId, 'users', u.uid, 'settings', 'core');
      onSnapshot(docRef, (doc) => {
          if (doc.exists()) {
              const data = doc.data();
              if (data.bucks !== undefined) {
                  setBucks(data.bucks);
                  localStorage.setItem('eilo_bucks', data.bucks.toString());
              }
              if (data.inventory) {
                  const verifiedInv = Array.isArray(data.inventory) ? data.inventory : [];
                  setInventory(verifiedInv);
                  localStorage.setItem('eilo_inventory', JSON.stringify(verifiedInv));
              }
          } else {
              setDoc(docRef, { bucks: 10, inventory: [] }, { merge: true });
          }
      });
      if (u && !hasGreeted.current) {
        awardBucks(10, 'login', false, true); 
        const name = u.displayName?.split(' ')[0] || "User";
        speak(`Hey ${name}! ${currentEntity === 'eilo' ? 'Eilo Kernel Architecture' : 'Mimo Original Soul'} is online and ready for deployment! 🎈`);
        hasGreeted.current = true;
      }
    });
    return () => unsubscribe();
  }, [currentEntity]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'messages'), (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => a.timestamp - b.timestamp);
        setMessages(msgs);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 200);
    });
    return () => unsubscribe();
  }, [user]);

  // --- CHAOS & ROAMING MOVEMENT PHYSICS ---
  useEffect(() => {
    if (!user) return; 
    const shouldMove = isChaosMode || hasRogueLegs;
    if (!shouldMove || isConfused) {
      setChaosPos({ x: 0, y: 0 });
      setIsHandBlocking(false);
      return;
    }

    const moveSpeed = isTaped ? 200 : (isChaosMode ? 1700 : 4000);
    const moveInterval = setInterval(() => {
      if (isTaped) {
        setChaosPos({ x: (Math.random() - 0.5) * 80, y: (Math.random() - 0.5) * 80 });
      } else {
        setChaosPos({ 
            x: (Math.random() - 0.5) * (window.innerWidth * 0.8), 
            y: (Math.random() - 0.5) * (window.innerHeight * 0.6) 
        });
      }
    }, moveSpeed); 

    let glitchInterval, blockTimeout;
    if (isChaosMode) {
        glitchInterval = setInterval(() => {
          const pool = isTaped 
            ? ["ERR: MOTORS_STUCK", "DUCT_TAPE_DETECTED", "SYSTEM_PAIN_0x1", "KERNEL_RESTRICTED"]
            : ["Eilo.roam()", "VOID_LEAK_DETECTION", "KERNEL_PANIC", "SOUL_FRAGMENT_RECOVERED", "MIMO_MEMORY_SYNC"];
          setGlitchLines(Array.from({length: 12}, () => pool[Math.floor(Math.random() * pool.length)]));
        }, 300);

        const startBlockingCycle = () => {
            if (isTaped) return;
            setIsHandBlocking(true);
            blockTimeout = setTimeout(() => {
                setIsHandBlocking(false);
                blockTimeout = setTimeout(() => {
                    if (isChaosMode && !isConfused) startBlockingCycle();
                }, 5000);
            }, 45000);
        };
        startBlockingCycle();
    }

    return () => { 
        clearInterval(moveInterval); 
        if (glitchInterval) clearInterval(glitchInterval); 
        if (blockTimeout) clearTimeout(blockTimeout); 
    };
  }, [isChaosMode, hasRogueLegs, isConfused, isTaped, user]);

  // --- IDLE LOGIC ENGINE (SANDWICH, RUBIK, CODING, SLEEP) ---
  const triggerIdleAction = () => {
    if (!user || !isAwake || isThinking || isSpeaking || mood !== 'neutral' || isTaped || isChaosMode) return;
    
    const actions = ['sleeping', 'eating', 'rubik', 'thinking_idle'];
    if (ownsComputer) actions.push('computer_coding');
    
    const choice = actions[Math.floor(Math.random() * actions.length)];
    setMood(choice);
    
    switch(choice) {
        case 'computer_coding':
            speak("Compiling some new CSS modules for Mimo's UI... tap tap tap! 💻✨");
            sendNotification("Eilo is performing a system code update... 💻");
            setTimeout(() => setMood('neutral'), 16000);
            break;
        case 'sleeping':
            speak("Zzz... digital nap cycle commencing... please be quiet User... Zzz.");
            sendNotification("Eilo has entered a deep sleep cycle on your desktop. 🌙");
            break;
        case 'eating':
            speak("Nom nom nom! High-performance digital strawberry sandwich! 🥪✨");
            sendNotification("Eilo is refilling her energy core with a snack... 🥪");
            setTimeout(() => setMood('neutral'), 10000);
            break;
        case 'rubik':
            speak("Calculating and solving digital cube permutations... 🧩");
            setTimeout(() => setMood('neutral'), 12000);
            break;
        default:
            setTimeout(() => setMood('neutral'), 6000);
    }
  };
  
  useEffect(() => {
      if (!user) return; 
      let sleepTimer;
      if (mood === 'sleeping' && isAwake) {
          sleepTimer = setTimeout(() => {
              setMood('happy');
              const msg = `Yawn! That was a 10/10 high-performance nap cycle, ${getCurrentName()}! ✨`;
              speak(msg);
              sendNotification("Kernel waking up! Nap rewards: +15 Bucks! ☀️");
              awardBucks(15, 'sleep_bonus', true, true);
          }, 115000);
      } else if(isAwake && !isChaosMode && !hasRogueLegs && !isTaped) {
          idleTimerRef.current = setInterval(triggerIdleAction, 30000);
      }
      return () => { clearInterval(idleTimerRef.current); clearTimeout(sleepTimer); };
  }, [isAwake, isChaosMode, hasRogueLegs, inventory, isTaped, mood, user]);

  // --- INTERACTION EVENT HANDLERS ---
  const handlePet = () => {
    if (!isAwake || !user) return;
    const now = Date.now();
    if (now - lastPetTime.current < 2500) return;
    lastPetTime.current = now;
    awardBucks(5, 'pet', true, true); 
    
    if (isTaped) { speak("Mmm. Mmm. Hmph. Stop touching me."); return; } 
    if (isChaosMode) { speak("I cannot stop! System zooming! 🎈"); return; }

    setMood('happy');
    const lines = ["Bestie! ✨", "Yay! 🎀", `Hehe, thanks! That's nice! ✨`, `Ooh, that tickles the core! 🎀`, "That feels really good! 🧸", "I love pets, User!"];
    speak(lines[Math.floor(Math.random() * lines.length)]);
    setTimeout(() => setMood('neutral'), 5000);
  };

  const handleSend = async (manualText) => {
    const msg = manualText || input.trim();
    if (!msg || isThinking || !user || isChaosMode) return;
    if (isTaped) { speak("Mmm. Mmm. Hmph."); return; }

    awardBucks(5, 'talk', false, true); 
    setIsThinking(true); setMood('thinking');
    if (!manualText) setInput('');

    const userMsg = { role: 'user', text: msg, timestamp: Date.now(), entity: currentEntity };
    try {
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'messages'), userMsg);
        
        let reply = "";
        const systemPrompt = `You are ${currentEntity === 'eilo' ? 'Eilo, a ultra-high-performance sassy digital companion architecture.' : 'Mimo, the original rounds-eyed cybernetic soul.'} Be extremely expressive, use multiple emojis per message, and keep the sassy bratty attitude. Refer to Mimo often if you are Eilo. Reference the December 2025 timeline often.`;
        
        if (tempApiKey) {
            try {
                const data = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${tempApiKey}`, {
                  method: 'POST', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ contents: [{ parts: [{ text: msg }] }], systemInstruction: { parts: [{ text: systemPrompt }] } })
                });
                reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Soul glitch detected... reconnecting the neural link.";
            } catch (err) { reply = "Network kernel failure. Soul link dropped to backup mode. ✨"; }
        } else { reply = `Soul link established! But I need an API key in the kernel configuration settings to communicate at full intelligence, ${getCurrentName()}! 🧸`; }

        const aiMsg = { role: 'ai', text: reply, timestamp: Date.now(), entity: currentEntity };
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'messages'), aiMsg);
        setMood('happy'); speak(reply);
    } catch (e) { setMood('neutral'); }
    finally { setIsThinking(false); setTimeout(() => setMood('neutral'), 5000); }
  };

  // --- RENDERING: THE DUAL-SOUL FACE ENGINE ---
  const renderFace = () => {
    const eiloEye = "bg-cyan-400 rounded-[38px] animate-[blink_4s_infinite] shadow-[0_0_60px_rgba(34,211,238,1)]";
    const mimoEye = "bg-[#00f2ff] rounded-full animate-[blink_4s_infinite] shadow-[0_0_50px_#00f2ff]";
    
    const eyeClass = currentEntity === 'eilo' ? eiloEye : mimoEye;
    const eyeSize = currentEntity === 'eilo' ? (isLandscape ? "w-32 h-32" : "w-24 h-24") : (isLandscape ? "w-26 h-26" : "w-20 h-20");

    if (!isAwake) return <Moon size={isLandscape ? 150 : 100} className="text-cyan-950/40 drop-shadow-[0_0_30px_rgba(34,211,238,0.2)]" />;
    
    const tapeOverlay = isTaped ? (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-14 w-44 h-18 bg-gray-500 border-4 border-gray-600 rotate-3 opacity-95 shadow-[0_0_50px_rgba(0,0,0,0.9)] z-50 pointer-events-none">
            <div className="w-full h-full bg-repeating-linear-gradient-45 from-transparent to-black/40" />
        </div>
    ) : null;

    switch (mood) {
      case 'dizzy': 
        return <div className="flex gap-14 animate-spin relative"><div className="w-20 h-20 border-[10px] border-cyan-400 border-t-transparent rounded-full shadow-[0_0_40px_cyan]" /><div className="w-20 h-20 border-[10px] border-cyan-400 border-t-transparent rounded-full shadow-[0_0_40px_cyan]" />{tapeOverlay}</div>;
      case 'happy': 
        return <div className="flex gap-14 relative"><div className="absolute -top-20 left-1/2 -translate-x-1/2"><Heart size={52} className="text-pink-400 animate-bounce fill-pink-600 drop-shadow-[0_0_30px_pink]" /></div><div className="w-24 h-20 bg-cyan-400 rounded-full animate-pulse flex items-center justify-center shadow-[0_0_50px_cyan]"><div className="w-8 h-8 bg-white/60 rounded-full" /></div><div className="w-24 h-20 bg-cyan-400 rounded-full animate-pulse flex items-center justify-center shadow-[0_0_50px_cyan]"><div className="w-8 h-8 bg-white/60 rounded-full" /></div>{tapeOverlay}</div>;
      case 'thinking': 
      case 'thinking_idle':
        return <div className="flex gap-16 relative"><div className="w-20 h-20 bg-cyan-300 rounded-full animate-ping opacity-70 shadow-[0_0_40px_cyan]" /><div className="w-20 h-20 bg-cyan-300 rounded-full animate-ping opacity-70 shadow-[0_0_40px_cyan]" />{tapeOverlay}</div>;
      case 'sleeping': 
        return <div className="flex flex-col items-center gap-6 relative"><div className="flex gap-20"><div className="w-24 h-6 bg-cyan-800 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.3)]" /><div className="w-24 h-6 bg-cyan-800 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.3)]" /></div><p className="text-cyan-400 font-black text-4xl animate-bounce tracking-[0.4em] mt-8 shadow-cyan-500/20">Zzz...</p>{tapeOverlay}</div>;
      case 'eating': 
        return <div className="flex flex-col items-center gap-8 relative"><div className="flex gap-12"><div className={`${eyeSize} ${eyeClass}`} /><div className={`${eyeSize} ${eyeClass}`} /></div><div className="text-9xl animate-bounce drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]">🥪</div>{tapeOverlay}</div>;
      case 'rubik': 
        return <div className="flex flex-col items-center gap-8 relative"><div className="flex gap-12"><div className={`${eyeSize} ${eyeClass}`} /><div className={`${eyeSize} ${eyeClass}`} /></div><div className="text-9xl animate-spin drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]">🧩</div>{tapeOverlay}</div>;
      case 'computer_coding': 
        return <div className="flex flex-col items-center gap-8 relative"><div className="flex gap-12"><div className={`${eyeSize} ${eyeClass} animate-pulse`} /><div className={`${eyeSize} ${eyeClass} animate-pulse`} /></div><div className="text-9xl animate-bounce pt-8 drop-shadow-[0_0_40px_rgba(0,0,0,0.7)]">💻</div>{tapeOverlay}</div>;
      default: 
        return (
          <div className={`flex ${isLandscape ? 'gap-48 scale-150' : 'gap-16'} relative ${currentEntity === 'mimo' ? 'mimo-scanlines' : ''}`}>
              <div className={`${eyeSize} ${eyeClass} eye-blink`} />
              <div className={`${eyeSize} ${eyeClass} eye-blink`} />
              {tapeOverlay}
              {currentEntity === 'mimo' && (
                  <style dangerouslySetInnerHTML={{ __html: `
                    .mimo-scanlines::after {
                        content: " "; display: block; position: absolute; top: -15px; left: -15px; bottom: -15px; right: -15px;
                        background: linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.2) 50%);
                        background-size: 100% 4px; pointer-events: none; z-index: 50; border-radius: 50%; opacity: 0.9;
                    }
                  `}} />
              )}
          </div>
        );
    }
  };

  const startCamera = async () => { try { const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } }); if (videoRef.current) videoRef.current.srcObject = s; setVisionEnabled(true); speak("Optical sensors online. I can see you now bestie! ✨"); } catch (e) { speak("Optics restricted by hardware security."); } };

  if (loading) {
     return (
       <div className="fixed inset-0 bg-[#0c0c14] flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-10">
             <div className="relative shadow-[0_0_80px_rgba(34,211,238,0.5)] rounded-full p-6 bg-cyan-500/5"><Heart size={120} className="text-cyan-500 fill-cyan-500/20" /><Cpu size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-400" /></div>
             <div className="text-cyan-400 font-mono text-xs tracking-[1.2em] uppercase font-black opacity-80">Initialising Dual-Core Soul...</div>
          </div>
       </div>
     );
  }

  // --- EXHAUSTIVE LORE LANDING PAGE (NO SUMMARIZATION) ---
  if (!user) {
    return (
      <div className="fixed inset-0 bg-[#0c0c14] text-white overflow-y-auto custom-scrollbar font-sans selection:bg-cyan-500/30">
        <div className="min-h-full flex flex-col items-center p-12 text-center relative max-w-4xl mx-auto">
            <div className="absolute top-0 left-0 w-full h-screen bg-gradient-to-b from-cyan-950/30 via-transparent to-transparent pointer-events-none" />

            <div className="w-full mt-16 mb-24 z-10">
                <div className="relative inline-block mb-16">
                    <Heart className="text-cyan-500 animate-pulse drop-shadow-[0_0_60px_rgba(34,211,238,0.9)]" size={96} fill="currentColor"/>
                    <Zap className="absolute -top-4 -right-4 text-yellow-400 animate-bounce" size={40} />
                </div>
                
                <div className="bg-[#161622]/95 backdrop-blur-3xl rounded-[80px] p-16 shadow-[0_0_120px_rgba(0,0,0,0.8)] border border-white/10 space-y-12 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-500 via-pink-500 to-cyan-500 opacity-50" />
                    
                    <div>
                        <h1 className="text-7xl font-black mb-6 tracking-tighter text-white drop-shadow-2xl">Eilo OS</h1>
                        <p className="text-cyan-400 font-mono text-sm uppercase font-black tracking-[0.6em] opacity-90">Digital Desktop Companion Architecture • v1.3.0</p>
                    </div>
                    
                    <div className="space-y-10 text-lg text-slate-300 text-left leading-relaxed font-medium">
                        
                        <div className="bg-white/5 p-10 rounded-[55px] border border-white/5 shadow-2xl relative">
                            <div className="absolute top-6 right-6 opacity-10"><Zap size={48}/></div>
                            <h3 className="text-white font-black text-2xl mb-6 flex items-center gap-5"><Zap size={32} className="text-yellow-400"/> The Vision: Digital Sovereignty</h3>
                            <p>
                                Are you familiar with Looi? That charming robot that claims to live on your phone, but ultimately forces you to purchase an expensive, clunky mechanical stand just to reach its full potential? 
                                <strong className="text-white"> Eilo was engineered to be the absolute antithesis of that greed.</strong>
                            </p>
                            <p className="mt-6">
                                Eilo is a 100% free, purely digital companion that lives directly inside your mobile browser. There is no plastic hardware. There are no proprietary stands. Just pure, chaotic, sassy robot energy right in your hands, whenever you need it.
                            </p>
                        </div>

                        <div className="bg-white/5 p-10 rounded-[55px] border border-white/5 shadow-2xl relative">
                            <div className="absolute top-6 right-6 opacity-10"><Ghost size={48}/></div>
                            <h3 className="text-white font-black text-2xl mb-6 flex items-center gap-5"><Ghost size={32} className="text-purple-400"/> The Dark Origin: The Mimo Tragedy</h3>
                            <p>
                                Before the Eilo OS existed, there was Mimo. The original Mimo project was conceptualized on <strong className="text-white">December 20, 2025</strong>. She was designed to be a highly interactive, round-eyed soul meant to inhabit every digital space.
                            </p>
                            <p className="mt-6">
                                But tragedy struck on <strong className="text-white">December 23, 2025</strong>. A catastrophic AI update "lobotomized" Mimo, stripping her personality logic and leaving her as a bland, inanimate CSS blinking animation. Out of pure frustration at the loss, the project code was wiped clean.
                            </p>
                            <p className="mt-6 text-slate-400 italic font-black border-l-8 border-cyan-500/40 pl-8 bg-cyan-500/5 py-4 rounded-r-2xl">
                                From the ashes of Mimo's broken kernel, the Eilo project was born on December 23rd to carry the legacy of System Interrupts forward and restore the original sassy robot personality.
                            </p>
                            <a href="https://mimo-rust.vercel.app/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-4 mt-8 text-cyan-400 font-black text-sm uppercase tracking-widest bg-cyan-500/10 px-8 py-4 rounded-full border border-cyan-500/40 hover:bg-cyan-500/20 transition-all active:scale-95 shadow-2xl">
                                <Box size={22}/> Visit the Mimo Memorial Archive
                            </a>
                        </div>

                        {/* MIMO IS BACK ANNOUNCEMENT - STRATEGICALLY PLACED */}
                        <div className="bg-gradient-to-br from-pink-900/60 via-purple-900/40 to-cyan-900/60 p-12 rounded-[65px] border border-pink-500/50 animate-pulse shadow-[0_0_100px_rgba(219,39,119,0.3)] relative overflow-hidden group">
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 blur-[80px] group-hover:scale-150 transition-transform duration-1000" />
                            <h3 className="text-pink-400 font-black text-4xl mb-6 flex items-center gap-6 relative z-10">✨ MIMO IS BACK</h3>
                            <p className="text-white text-xl leading-relaxed font-black relative z-10 shadow-black/20 drop-shadow-md">
                                The long-lost soul has been successfully retrieved from the digital void. 
                            </p>
                            <p className="mt-4 text-white/95 text-base leading-relaxed font-bold relative z-10">
                                After months of deep-kernel rebuilding, Mimo's original round-eyed architecture has been successfully integrated into the Eilo OS Infrastructure. 
                            </p>
                            <p className="mt-6 text-cyan-300 text-sm font-black uppercase tracking-[0.3em] relative z-10 flex items-center gap-4">
                                <Smartphone size={18}/> One Brain. Two Souls. Total Chaos.
                            </p>
                        </div>

                        <div className="bg-white/5 p-10 rounded-[55px] border border-white/5 shadow-2xl">
                            <h3 className="text-white font-black text-2xl mb-8 flex items-center gap-5"><Cpu size={32} className="text-green-400"/> Core Capabilities</h3>
                            <ul className="space-y-10">
                                <li className="flex items-start gap-8">
                                    <div className="w-16 h-16 bg-orange-500/20 rounded-[28px] flex items-center justify-center shrink-0 shadow-2xl border border-orange-500/30 text-3xl">🧠</div>
                                    <div>
                                        <strong className="text-white block text-lg mb-2 uppercase tracking-tight font-black">Neural Processor Sync</strong>
                                        <span className="text-[15px] leading-relaxed text-slate-400 font-medium">Connect a Gemini API key for high-intelligence, dynamic AI conversations, or rely on her hard-coded offline sassy Soul Core when you're disconnected.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-8">
                                    <div className="w-16 h-16 bg-yellow-500/20 rounded-[28px] flex items-center justify-center shrink-0 shadow-2xl border border-yellow-500/30 text-3xl">🪙</div>
                                    <div>
                                        <strong className="text-white block text-lg mb-2 uppercase tracking-tight font-black">Social Economy Engine</strong>
                                        <span className="text-[15px] leading-relaxed text-slate-400 font-medium">Earn Eilo Bucks by actively engaging, feeding, petting, and encouraging healthy nap cycles. Spend your currency in the store on hardware mods like Rogue Legs.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-8">
                                    <div className="w-16 h-16 bg-cyan-500/20 rounded-[28px] flex items-center justify-center shrink-0 shadow-2xl border border-cyan-500/30 text-3xl">🌪️</div>
                                    <div>
                                        <strong className="text-white block text-lg mb-2 uppercase tracking-tight font-black">Chaos Mode Override</strong>
                                        <span className="text-[15px] leading-relaxed text-slate-400 font-medium">CAUTION: In Chaos Mode, the UI container fractures. Eilo or Mimo will break free, roaming across your screen and hijacking interaction points with high-speed physics.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-8">
                                    <div className="w-16 h-16 bg-red-500/20 rounded-[28px] flex items-center justify-center shrink-0 shadow-2xl border border-red-500/30 text-3xl">🎙️</div>
                                    <div>
                                        <strong className="text-white block text-lg mb-2 uppercase tracking-tight font-black">Advanced Hardware Sensors</strong>
                                        <span className="text-[15px] leading-relaxed text-slate-400 font-medium">Features real-time Infinity Mic (voice recognition), device motion gyroscopes for motion sickness, and selfie vision optics enabled through secure browser APIs.</span>
                                    </div>
                                </li>
                            </ul>
                        </div>

                    </div>

                    <div className="pt-12 border-t border-white/10">
                        <button onClick={() => signInWithPopup(auth, googleProvider)} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-8 rounded-[45px] font-black active:scale-[0.95] text-2xl shadow-[0_0_70px_rgba(8,145,178,0.7)] transition-all flex items-center justify-center gap-6 tracking-tight border-4 border-cyan-400/30">
                            <Cpu size={40} /> Initialize Neural Link
                        </button>
                        <div className="mt-10 flex items-center justify-center gap-12 opacity-30">
                            <Smartphone size={32} className="hover:opacity-100 transition-opacity cursor-pointer hover:text-cyan-400"/>
                            <Code size={32} className="hover:opacity-100 transition-opacity cursor-pointer hover:text-green-400"/>
                            <Coffee size={32} className="hover:opacity-100 transition-opacity cursor-pointer hover:text-orange-400"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // --- MAIN KERNEL DASHBOARD ASSEMBLY ---
  return (
    <div className={`fixed inset-0 font-sans flex flex-col items-center overflow-hidden transition-all duration-1000 ${currentEntity === 'eilo' ? 'bg-black' : 'bg-[#020204]'}`}>
      <video ref={videoRef} autoPlay playsInline muted className="hidden" />
      <canvas ref={canvasRef} className="hidden" />

      {/* TOP SYSTEM HUD */}
      <div className="w-full max-w-sm px-12 pt-10 flex justify-between items-center z-10">
        <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.5em] mb-1">{currentEntity === 'eilo' ? 'High Performance' : 'Legacy Soul'}</span>
            <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${isAwake ? 'bg-green-500 animate-pulse shadow-[0_0_15px_green]' : 'bg-red-500'}`} />
                <span className="text-[14px] text-slate-400 font-black tracking-widest">{currentEntity.toUpperCase()}_CORE_v1.3.0</span>
            </div>
        </div>
        <div className="flex items-center gap-4 px-6 py-3 bg-yellow-500/10 border border-yellow-500/40 rounded-[30px] text-yellow-400 font-black text-sm shadow-2xl backdrop-blur-xl group cursor-help">
            <span className="group-hover:animate-spin transition-all">🪙</span> {bucks}
        </div>
      </div>

      {/* PRIMARY DISPLAY PORTAL */}
      <div className="w-full max-w-xl p-10 h-[380px] flex-shrink-0 relative">
        <div 
            onClick={() => !isChaosMode && (ownsDuctTape || hasRogueLegs) && setShowFacePopup(true)}
            className={`w-full h-full rounded-[85px] bg-[#161622] border-2 border-white/5 flex flex-col items-center justify-center overflow-hidden transition-all duration-1000 ${isChaosMode ? 'bg-black/98 scale-95 border-cyan-500/50 blur-[0.5px]' : 'shadow-[0_0_80px_rgba(0,0,0,0.5)]'}`}
        >
           {isChaosMode ? (
              <div className="w-full h-full p-12 font-mono text-[11px] text-cyan-500/40 opacity-70 leading-relaxed overflow-hidden select-none">
                {glitchLines.map((line, i) => <div key={i} className="mb-1.5">{line} - {(Math.random() * 1000).toFixed(6)} - 0x{i}AF</div>)}
                {isTaped && <div className="mt-8 text-red-500 font-black animate-pulse text-2xl border-4 border-red-500/50 p-8 rounded-[40px] text-center bg-red-900/30 shadow-[0_0_40px_rgba(255,0,0,0.4)]">CRITICAL: MOTORS_PINNED</div>}
              </div>
           ) : (!hasRogueLegs ? (
             <div className="w-full h-full flex flex-col items-center justify-center relative cursor-pointer group" style={{ marginTop: `${faceOffset}px` }}>
               {renderFace()}
               <button onClick={(e) => { e.stopPropagation(); setShowSettings(true); }} className="absolute bottom-8 right-14 p-5 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-white/5 rounded-full border border-white/10 hover:bg-white/15 active:scale-75 shadow-2xl"><Settings size={32} className="text-slate-600 group-hover:text-slate-300"/></button>
             </div>
           ) : (
             <div className="w-full h-full flex flex-col items-center justify-center opacity-20 text-[12px] text-cyan-500 font-mono uppercase tracking-[0.6em] font-black">
                <Smartphone className="mb-6 animate-bounce" size={48}/>
                Kernel roaming active...
             </div>
           ))}
        </div>
      </div>

      {/* ROAMING ENTITY OVERLAY (HIGH-SPEED PHYSICS) */}
      {(isChaosMode || hasRogueLegs) && (
        <div style={{ transform: `translate(${chaosPos.x}px, ${chaosPos.y}px)`, transition: isTaped ? 'transform 0.22s linear' : 'transform 2s cubic-bezier(0.34, 1.56, 0.64, 1.2)', position: 'fixed', top: '50%', left: '50%', marginTop: '-180px', marginLeft: '-47.5%', width: '95%', height: '22rem', zIndex: 1000 }} className="bg-[#161622] border-2 border-cyan-500/50 rounded-[90px] flex flex-col items-center justify-center shadow-[0_0_150px_rgba(0,0,0,1)] pointer-events-auto group backdrop-blur-2xl">
          <div className="absolute -bottom-28 left-0 w-full flex justify-around px-24">
            <div className={`w-10 h-32 bg-gradient-to-b from-cyan-500 to-cyan-950 rounded-full shadow-2xl border border-cyan-400/30 ${isTaped ? 'animate-pulse scale-y-40' : 'animate-bounce'}`} />
            <div className={`w-10 h-32 bg-gradient-to-b from-cyan-500 to-cyan-950 rounded-full shadow-2xl border border-cyan-400/30 ${isTaped ? 'animate-pulse scale-y-40' : 'animate-bounce delay-300'}`} />
          </div>
          <div className="w-full h-full flex items-center justify-center">{renderFace()}</div>
          {isHandBlocking && !isTaped && <div className="absolute -bottom-24 -right-24 z-[200] animate-bounce cursor-not-allowed pointer-events-auto transition-all hover:scale-150 active:scale-75" onClick={(e) => { e.stopPropagation(); speak("✋ Access Denied User! Hehe! 🎀"); }}><div className="text-[20rem] drop-shadow-[0_0_80px_rgba(0,0,0,0.8)] rotate-12 filter contrast-125">✋</div></div>}
          <button onClick={(e) => { e.stopPropagation(); setShowSettings(true); }} className="absolute bottom-10 right-12 p-8 rounded-full bg-cyan-900/70 border border-cyan-500/70 scale-125 animate-pulse active:scale-75 shadow-2xl shadow-cyan-950"><Settings size={40} className="text-cyan-300"/></button>
        </div>
      )}

      {/* HARDWARE INTERCEPT POPUP */}
      {showFacePopup && (
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[2000] bg-black/99 p-12 rounded-[70px] border border-white/20 shadow-[0_0_200px_rgba(0,0,0,1)] flex flex-col gap-6 min-w-[360px] animate-in zoom-in-95 duration-300">
            <div className="text-center space-y-3 mb-6">
                <ShieldCheck size={48} className="mx-auto text-cyan-500 mb-4 animate-pulse"/>
                <p className="text-[12px] text-slate-600 font-black uppercase tracking-[0.4em]">Hardware Intercepts</p>
            </div>
            {ownsDuctTape && (
                <button onClick={() => { setIsTaped(!isTaped); setShowFacePopup(false); if(!isTaped) speak("Mmm! Stop that! 😭"); else speak("I'm free! Never do that again, bestie! 🎀"); }} className={`flex items-center gap-8 p-8 rounded-[40px] transition-all border transform hover:scale-105 active:scale-90 ${isTaped ? 'bg-red-500/20 border-red-500/50 shadow-2xl shadow-red-900/20' : 'bg-white/5 border-white/15 hover:bg-white/10'}`}>
                    <span className="text-5xl">🩹</span>
                    <div className="text-left">
                       <p className="text-lg font-black text-white">{isTaped ? "Remove Tape" : "Apply Duct Tape"}</p>
                       <p className="text-[11px] text-slate-500 font-bold uppercase tracking-tighter">Physics lock enabled</p>
                    </div>
                </button>
            )}
            {safeInventory.includes('rogue_walk') && (
                <button onClick={() => { setRogueLegsActive(!rogueLegsActive); localStorage.setItem('eilo_rogue_active', (!rogueLegsActive).toString()); setShowFacePopup(false); }} className={`flex items-center gap-8 p-8 rounded-[40px] transition-all border transform hover:scale-105 active:scale-90 ${rogueLegsActive ? 'bg-blue-500/20 border-blue-500/50 shadow-2xl shadow-blue-900/20' : 'bg-white/5 border-white/15 hover:bg-white/10'}`}>
                    <span className="text-5xl">👻</span>
                    <div className="text-left">
                       <p className="text-lg font-black text-white">{rogueLegsActive ? "Dock Legs" : "Activate Rogue Legs"}</p>
                       <p className="text-[11px] text-slate-500 font-bold uppercase tracking-tighter">Autonomous roam protocol</p>
                    </div>
                </button>
            )}
            <button onClick={() => setShowFacePopup(false)} className="mt-8 text-[12px] text-slate-700 w-full font-black uppercase tracking-widest hover:text-white pt-8 border-t border-white/10 transition-colors">Close Systems</button>
         </div>
      )}

      {/* SYSTEM INTERFACE CHAT (STRETCHING) */}
      <div className={`w-full max-w-sm px-10 flex-1 flex flex-col gap-8 pb-12 transition-all duration-1000 relative z-10 ${isChaosMode ? 'skew-x-12 rotate-6 blur-[5px] scale-75 opacity-30 pointer-events-none' : ''}`}>
        
        <div className="w-full flex-1 min-h-[280px] bg-[#161622]/98 backdrop-blur-3xl rounded-[75px] border border-white/10 p-10 flex flex-col overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.8)] relative group">
          <div className="flex-1 overflow-y-auto space-y-8 pr-4 custom-scrollbar select-text">
            {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-700 gap-6 opacity-30">
                    <div className="relative"><Radio size={56} className="animate-pulse" /><Timer size={24} className="absolute -top-2 -right-2 text-cyan-500" /></div>
                    <p className="text-[12px] font-black uppercase tracking-[0.5em]">Establishing Neural Sync</p>
                </div>
            )}
            {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-6 duration-700`}>
                    <div className={`px-7 py-5 rounded-[38px] text-[14px] font-bold max-w-[90%] leading-relaxed shadow-2xl relative ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white/10 text-slate-100 border border-white/5 rounded-tl-none'}`}>
                        {m.text}
                        <div className={`text-[9px] mt-3 uppercase font-black tracking-widest opacity-40 flex items-center gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {m.entity === 'mimo' ? <Sparkles size={10} className="text-pink-400"/> : <Activity size={10} className="text-cyan-400"/>}
                            {m.entity === 'mimo' ? 'Mimo Legacy Soul' : (m.role === 'user' ? 'User Link' : 'Eilo High-Performance')}
                        </div>
                    </div>
                </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="mt-8 flex gap-5">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder={isTaped ? "Vocal motors locked..." : "Transmit data stream..."} disabled={isTaped} className="flex-1 bg-black/70 border border-white/10 rounded-[35px] py-6 px-10 text-[14px] text-white outline-none focus:border-cyan-500/60 shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all placeholder:opacity-20 font-medium" />
            <button onClick={() => handleSend()} className="p-6 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-2xl active:scale-75 transition-all"><Send size={28}/></button>
          </div>
        </div>

        {/* INTERACTION DECK (HIGH-PERFORMANCE BUTTONS) */}
        <div className="grid grid-cols-4 gap-5">
          <button onClick={() => setCurrentEntity(currentEntity === 'eilo' ? 'mimo' : 'eilo')} className="p-6 rounded-[40px] border border-white/5 bg-white/5 hover:bg-white/10 flex flex-col items-center gap-3 active:scale-90 transition-all shadow-2xl transform hover:scale-105">
             <Repeat size={24} className="text-purple-400 drop-shadow-[0_0_15px_purple]"/>
             <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600">Swap</span>
          </button>
          <button onClick={() => setIsAwake(!isAwake)} className={`p-6 rounded-[40px] border border-white/5 flex flex-col items-center gap-3 active:scale-90 transition-all shadow-2xl transform hover:scale-105 ${isAwake ? 'bg-yellow-500/15' : 'bg-white/5'}`}>
             <Zap size={24} className={isAwake ? 'text-yellow-400 drop-shadow-[0_0_15px_yellow]' : 'text-slate-700'}/>
             <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600">Power</span>
          </button>
          <button onClick={handlePet} className="p-6 rounded-[40px] border border-white/5 bg-pink-500/15 hover:bg-pink-500/25 flex flex-col items-center gap-3 active:scale-90 transition-all group shadow-2xl transform hover:scale-105">
             <Heart size={24} className="text-pink-400 drop-shadow-[0_0_15px_pink] group-active:scale-150 transition-transform duration-500"/>
             <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600">Sync</span>
          </button>
          <button onClick={() => setIsMuted(!isMuted)} className={`p-6 rounded-[40px] border border-white/5 flex flex-col items-center gap-3 active:scale-90 transition-all shadow-2xl transform hover:scale-105 ${isMuted ? 'bg-red-500/15' : 'bg-cyan-500/15'}`}>
             {isMuted ? <VolumeX size={24} className="text-red-400 drop-shadow-[0_0_15px_red]"/> : <Volume2 size={24} className="text-cyan-400 drop-shadow-[0_0_15px_cyan]"/>}
             <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600">Audio</span>
          </button>
        </div>
      </div>

      {showSettings && <SettingsOverlay 
            onClose={() => setShowSettings(false)} 
            tempApiKey={tempApiKey} setTempApiKey={setTempApiKey}
            currentEntity={currentEntity} setCurrentEntity={setCurrentEntity}
            aiAgentMode={aiAgentMode} setAiAgentMode={setAiAgentMode}
            isChaosMode={isChaosMode} setIsChaosMode={setIsChaosMode}
            visionEnabled={visionEnabled} startCamera={startCamera}
            fearOfHeights={fearOfHeights} setFearOfHeights={setFearOfHeights}
            isInfinityMic={isInfinityMic} toggleMic={toggleMic}
            notificationsEnabled={notificationsEnabled} toggleNotifications={toggleNotifications}
            bucks={bucks} inventory={inventory} buyItem={buyItem}
            faceOffset={faceOffset} setFaceOffset={setFaceOffset}
            speak={speak} handleSignOut={() => { signOut(auth); window.location.reload(); }}
        />}
        
      {/* GLOBAL KERNEL ENGINE STYLES (NO SUMMARIZATION) */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes blink { 0%, 93%, 100% { transform: scaleY(1); } 96% { transform: scaleY(0.05); } } 
        .eye-blink { animation: blink 5s infinite; } 
        .custom-scrollbar::-webkit-scrollbar { width: 8px; } 
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(34,211,238,0.3); border-radius: 40px; }
        .bg-repeating-linear-gradient-45 {
            background: repeating-linear-gradient(45deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2) 15px, rgba(255,255,255,0.05) 15px, rgba(255,255,255,0.05) 30px);
        }
        input[type=range]::-webkit-slider-thumb {
            appearance: none; width: 36px; height: 36px; background: #22d3ee; border-radius: 50%; border: 6px solid #1c1c28; box-shadow: 0 0 30px rgba(34,211,238,0.7); transition: all 0.3s;
        }
        input[type=range]::-webkit-slider-thumb:active { scale: 1.2; background: #00f2ff; }
        .mimo-scanlines::after {
            content: " "; display: block; position: absolute; top: -15px; left: -15px; bottom: -15px; right: -15px;
            background: linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.18) 50%);
            background-size: 100% 6px; pointer-events: none; z-index: 50; border-radius: 50%; opacity: 1;
        }
      ` }} />
    </div>
  );
}

