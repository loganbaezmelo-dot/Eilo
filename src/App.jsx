import React, { useState, useEffect, useRef } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { 
  Heart, Moon, Volume2, VolumeX, Send, Zap, Settings, X, Hand, Mic, ToggleLeft, ToggleRight, AlertTriangle, Eye, Sparkles, Ghost, Radio, Cpu, ShieldCheck, LogOut, Repeat
} from 'lucide-react';

// --- FIREBASE CONFIG (Eilo OS Infrastructure) ---
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

// --- SETTINGS COMPONENT ---
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
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[9999] flex items-center justify-center p-6 text-center font-sans">
      <div className="bg-[#1c1c28] w-full max-w-sm rounded-[45px] p-8 border border-white/10 relative shadow-2xl flex flex-col max-h-[85vh]">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-white transition-colors"><X size={24}/></button>
        <h2 className="text-xl font-bold mb-6 flex items-center justify-center gap-2 text-white">Settings <Sparkles className="text-cyan-400" size={20}/></h2>
        
        {/* ENTITY SWAPPER */}
        <div className="mb-6 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 p-4 rounded-3xl border border-white/5">
            <p className="text-[10px] uppercase font-bold text-cyan-400 mb-3 flex items-center justify-center gap-2">🌌 Dual-Core Switcher</p>
            <div className="grid grid-cols-2 gap-2">
                <button 
                    onClick={() => { setCurrentEntity('eilo'); speak("Eilo Kernel Active."); }}
                    className={`py-3 rounded-xl text-[10px] font-bold transition-all ${currentEntity === 'eilo' ? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(8,145,178,0.5)]' : 'bg-white/5 text-slate-500'}`}
                >EILO OS</button>
                <button 
                    onClick={() => { setCurrentEntity('mimo'); speak("Mimo Soul Synced."); }}
                    className={`py-3 rounded-xl text-[10px] font-bold transition-all ${currentEntity === 'mimo' ? 'bg-pink-600 text-white shadow-[0_0_15px_rgba(219,39,119,0.5)]' : 'bg-white/5 text-slate-500'}`}
                >MIMO CORE</button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-6 pb-6 text-left">
            <div>
               <p className="text-[10px] uppercase font-bold text-yellow-500 mb-3 px-1 flex items-center gap-2">🛍️ Store (Balance: {bucks})</p>
               <div className="space-y-2">
                  <button onClick={() => buyItem(25, 'duct_tape')} disabled={safeInv.includes('duct_tape')} className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${safeInv.includes('duct_tape') ? 'bg-gray-500/20 border-gray-500/40 opacity-50' : 'bg-white/5 border-white/10 hover:border-yellow-500/50'}`}>
                     <div className="flex items-center gap-3"><span className="text-lg">🩹</span> <div><p className="text-xs font-bold text-white">Duct Tape</p><p className="text-[9px] text-slate-500">Restricts movement</p></div></div>
                     <div className="text-xs font-bold text-yellow-400">{safeInv.includes('duct_tape') ? 'OWNED' : '25'}</div>
                  </button>
                  <button onClick={() => buyItem(100, 'computer')} disabled={safeInv.includes('computer')} className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${safeInv.includes('computer') ? 'bg-green-500/20 border-green-500/40 opacity-50' : 'bg-white/5 border-white/10 hover:border-yellow-500/50'}`}>
                     <div className="flex items-center gap-3"><span className="text-lg">💻</span> <div><p className="text-xs font-bold text-white">Tiny Laptop</p><p className="text-[9px] text-slate-500">New idle animation</p></div></div>
                     <div className="text-xs font-bold text-yellow-400">{safeInv.includes('computer') ? 'OWNED' : '100'}</div>
                  </button>
                  <button onClick={() => buyItem(125, 'face_pos')} disabled={safeInv.includes('face_pos')} className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${safeInv.includes('face_pos') ? 'bg-green-500/20 border-green-500/40 opacity-50' : 'bg-white/5 border-white/10 hover:border-yellow-500/50'}`}>
                     <div className="flex items-center gap-3"><span className="text-lg">↕️</span> <div><p className="text-xs font-bold text-white">Face Mover</p><p className="text-[9px] text-slate-500">Adjust portrait position</p></div></div>
                     <div className="text-xs font-bold text-yellow-400">{safeInv.includes('face_pos') ? 'OWNED' : '125'}</div>
                  </button>
                  <button onClick={() => buyItem(150, 'rogue_walk')} disabled={safeInv.includes('rogue_walk')} className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${safeInv.includes('rogue_walk') ? 'bg-green-500/20 border-green-500/40 opacity-50' : 'bg-white/5 border-white/10 hover:border-yellow-500/50'}`}>
                     <div className="flex items-center gap-3"><Ghost size={16} className="text-red-400"/> <div><p className="text-xs font-bold text-white">Rogue Legs</p><p className="text-[9px] text-slate-500">Walk without Chaos Mode</p></div></div>
                     <div className="text-xs font-bold text-yellow-400">{safeInv.includes('rogue_walk') ? 'OWNED' : '150'}</div>
                  </button>
               </div>
            </div>

            {safeInv.includes('face_pos') && (
                <div>
                    <p className="text-[10px] uppercase font-bold text-purple-400 mb-2 px-1 flex items-center gap-2">👇 Face Position</p>
                    <input type="range" min="-50" max="50" value={faceOffset} onChange={(e) => setFaceOffset(Number(e.target.value))} className="w-full accent-purple-500" />
                </div>
            )}

            <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-2 px-1">⚙️ System Toggles</p>
                <div className="flex flex-col gap-2">
                    <button onClick={() => setIsChaosMode(!isChaosMode)} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${isChaosMode ? 'bg-cyan-500/20 border-cyan-500/40 text-white' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                      <div className="flex items-center gap-3"><span className="text-lg">🌪️</span> Chaos Mode</div>
                      <div className="text-xs font-bold">{isChaosMode ? "ON" : "OFF"}</div>
                    </button>
                    <button onClick={() => setAiAgentMode(!aiAgentMode)} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${aiAgentMode ? 'bg-orange-500/20 border-orange-500/40 text-white' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                      <div className="flex items-center gap-3"><span className="text-lg">🤖</span> Agent Mode</div>
                      <div className="text-xs font-bold">{aiAgentMode ? "ON" : "OFF"}</div>
                    </button>
                    <button onClick={toggleNotifications} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${notificationsEnabled ? 'bg-cyan-500/20 border-cyan-500/40 text-white' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                      <div className="flex items-center gap-3"><span className="text-lg">🔔</span> System Interrupts</div>
                      <div className="text-xs font-bold">{notificationsEnabled ? "ON" : "OFF"}</div>
                    </button>
                </div>
            </div>

            <div className="space-y-2">
              <input type="password" value={tempApiKey} onChange={e => setTempApiKey(e.target.value)} placeholder="Paste Gemini Key..." className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-sm outline-none text-white focus:border-cyan-500/50 mt-2" />
            </div>
            
            <div className="flex flex-col gap-2">
               <button onClick={startCamera} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${visionEnabled ? 'bg-cyan-500/20 border-cyan-500/40 text-white' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                 <div className="flex items-center gap-3"><span className="text-lg">👁️</span> Selfie Scanner</div>
                 <div className="text-xs font-bold">{visionEnabled ? "ON" : "OFF"}</div>
               </button>
               <button onClick={() => setFearOfHeights(!fearOfHeights)} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${fearOfHeights ? 'bg-pink-500/20 border-pink-400/40 text-white' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                 <div className="flex items-center gap-3"><span className="text-lg">⚠️</span> Fear of Heights</div>
                 <div className="text-xs font-bold">{fearOfHeights ? "ON" : "OFF"}</div>
               </button>
               <button onClick={toggleMic} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${isInfinityMic ? 'bg-red-600/30 border-red-500/50 text-white' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                 <div className="flex items-center gap-3"><span className="text-lg">🎙️</span> Infinity Mic</div>
                 <div className="text-xs font-bold">{isInfinityMic ? "ON" : "OFF"}</div>
               </button>
            </div>
        </div>
        <div className="pt-4 border-t border-white/5 space-y-3">
            <button onClick={() => { localStorage.setItem('eilo_key', tempApiKey); onClose(); }} className="w-full bg-cyan-600 py-4 rounded-2xl font-bold uppercase text-white shadow-lg active:scale-95 transition-all text-sm">Save & Close</button>
            <button onClick={handleSignOut} className="w-full flex items-center justify-center gap-2 text-[10px] text-red-500 font-bold uppercase opacity-60 hover:opacity-100 py-2 transition-opacity"><LogOut size={12}/> Disconnect Core</button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
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
  
  const [bucks, setBucks] = useState(parseInt(localStorage.getItem('eilo_bucks')) || 0);
  const [inventory, setInventory] = useState(JSON.parse(localStorage.getItem('eilo_inventory') || '[]'));
  const [sessionClaims, setSessionClaims] = useState({ login: false, talk: false });
  const [faceOffset, setFaceOffset] = useState(0);

  const [isTaped, setIsTaped] = useState(false);
  const [rogueLegsActive, setRogueLegsActive] = useState(localStorage.getItem('eilo_rogue_active') !== 'false');
  const [showFacePopup, setShowFacePopup] = useState(false);
  const [isChaosMode, setIsChaosMode] = useState(false);
  const [chaosPos, setChaosPos] = useState({ x: 0, y: 0 });
  const [glitchLines, setGlitchLines] = useState([]);
  const [isHandBlocking, setIsHandBlocking] = useState(false);
  const [isConfused, setIsConfused] = useState(false);
  const [aiAgentMode, setAiAgentMode] = useState(false);

  const [fearOfHeights, setFearOfHeights] = useState(localStorage.getItem('eilo_heights') !== 'false');
  const [isInfinityMic, setIsInfinityMic] = useState(false);
  const [visionEnabled, setVisionEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(localStorage.getItem('eilo_notifications') === 'true');
  
  const videoRef = useRef(null);
  const chatEndRef = useRef(null);
  const lastPetTime = useRef(0);
  const hasGreeted = useRef(false);
  const recognitionRef = useRef(null);

  const safeInventory = Array.isArray(inventory) ? inventory : [];
  const hasRogueLegs = safeInventory.includes('rogue_walk') && rogueLegsActive;
  const ownsDuctTape = safeInventory.includes('duct_tape');

  const speak = (text) => {
    if (isMuted || !isAwake || !user) return; 
    setIsSpeaking(true);
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(isTaped ? "Mmm. Mmm. Hmph." : text);
    u.pitch = currentEntity === 'eilo' ? 1.7 : 2.1;
    u.rate = 1.1;
    u.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(u);
  };

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
    } catch (err) { console.warn("Cloud save failed."); }
    if (!silent) speak(`+${amount} Bucks! ✨`);
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
        } catch (err) { console.warn("Cloud save failed."); }
        speak("Upgrade secured! 🎀");
    } else { speak("Hey! You're broke! 🎈"); }
  };

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            setNotificationsEnabled(true);
            localStorage.setItem('eilo_notifications', 'true');
            speak("Notifications active! ✨");
        }
    } else {
        setNotificationsEnabled(false);
        localStorage.setItem('eilo_notifications', 'false');
        speak("Notifications muted.");
    }
  };

  const toggleMic = () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) return;
      const newState = !isInfinityMic;
      setIsInfinityMic(newState);
      speak(newState ? "I'm listening... ✨" : "Ears closed! 🧸");
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setLoading(false); 
      if (!u) return;
      setUser(u);
      const docRef = doc(db, 'artifacts', appId, 'users', u.uid, 'settings', 'core');
      onSnapshot(docRef, (doc) => {
          if (doc.exists()) {
              const data = doc.data();
              if (data.bucks !== undefined) setBucks(data.bucks);
              if (data.inventory) setInventory(Array.isArray(data.inventory) ? data.inventory : []);
          }
      });
      if (u && !hasGreeted.current) {
        awardBucks(10, 'login', false, true); 
        speak(`System active. ${currentEntity === 'eilo' ? 'Eilo' : 'Mimo'} is online.`);
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
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return; 
    const shouldMove = isChaosMode || hasRogueLegs;
    if (!shouldMove) { setChaosPos({ x: 0, y: 0 }); return; }
    const moveInterval = setInterval(() => {
      setChaosPos({ 
        x: (Math.random() - 0.5) * (window.innerWidth * 0.7), 
        y: (Math.random() - 0.5) * (window.innerHeight * 0.5) 
      });
    }, isChaosMode ? 1700 : 3500);
    return () => clearInterval(moveInterval);
  }, [isChaosMode, hasRogueLegs, user]);

  const handleSend = async () => {
    if (!input.trim() || isThinking || !user) return;
    const msg = input.trim();
    setInput('');
    setIsThinking(true);
    setMood('thinking');
    const newUserMsg = { role: 'user', text: msg, timestamp: Date.now(), entity: currentEntity };
    try {
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'messages'), newUserMsg);
        const reply = currentEntity === 'eilo' ? "Kernel processing command..." : "Mimo soul link stable! ✨";
        const newAiMsg = { role: 'ai', text: reply, timestamp: Date.now(), entity: currentEntity };
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'messages'), newAiMsg);
        speak(reply);
    } catch (err) { console.error(err); }
    finally { setIsThinking(false); setMood('neutral'); }
  };

  const renderFace = () => {
    const eiloEye = "bg-cyan-400 rounded-3xl animate-[blink_4s_infinite] shadow-[0_0_40px_rgba(34,211,238,0.8)]";
    const mimoEye = "bg-[#00f2ff] rounded-full animate-[blink_4s_infinite] shadow-[0_0_30px_#00f2ff]";
    const eyeClass = currentEntity === 'eilo' ? eiloEye : mimoEye;
    const eyeSize = currentEntity === 'eilo' ? (isLandscape ? "w-24 h-24" : "w-20 h-20") : "w-16 h-16";
    if (!isAwake) return <Moon size={64} className="text-cyan-900/20" />;
    return (
        <div className={`flex ${isLandscape ? 'gap-32 scale-150' : 'gap-10'} relative ${currentEntity === 'mimo' ? 'mimo-scanlines' : ''}`}>
            <div className={`${eyeSize} ${eyeClass}`} />
            <div className={`${eyeSize} ${eyeClass}`} />
            {isTaped && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-8 w-32 h-12 bg-gray-400 border-2 border-gray-500 z-50"></div>}
            {currentEntity === 'mimo' && (
                <style dangerouslySetInnerHTML={{ __html: `.mimo-scanlines::after { content: " "; display: block; position: absolute; top: 0; left: 0; bottom: 0; right: 0; background: linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.1) 50%); background-size: 100% 4px; pointer-events: none; z-index: 50; }` }} />
            )}
        </div>
    );
  };

  const startCamera = async () => { try { const s = await navigator.mediaDevices.getUserMedia({ video: true }); if (videoRef.current) videoRef.current.srcObject = s; setVisionEnabled(true); speak("Vision online! ✨"); } catch (e) { console.error(e); } };

  if (loading) return <div className="fixed inset-0 bg-[#0c0c14] flex items-center justify-center text-cyan-500 font-mono tracking-widest animate-pulse">INIT_DUAL_CORE...</div>;

  // --- FULL NON-SHORTENED LANDING PAGE ---
  if (!user) {
    return (
      <div className="fixed inset-0 bg-[#0c0c14] text-white overflow-y-auto custom-scrollbar">
        <div className="min-h-full flex flex-col items-center p-6 text-center relative">
            <div className="absolute top-0 left-0 w-full h-96 bg-cyan-900/10 blur-[100px] pointer-events-none" />
            <div className="w-full max-w-md mt-8 mb-12 z-10">
                <Heart className="text-cyan-500 mx-auto mb-6 animate-pulse" size={56} fill="currentColor"/>
                <div className="bg-[#161622] rounded-[40px] p-8 shadow-2xl border border-white/5">
                    <h1 className="text-4xl font-bold mb-2 tracking-tight text-white">Eilo OS</h1>
                    <p className="text-cyan-400 font-mono text-xs uppercase tracking-widest mb-6">Digital Desktop Companion</p>
                    
                    <div className="space-y-6 text-sm text-slate-300 text-left">
                        <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                            <h3 className="text-white font-bold text-base mb-2 flex items-center gap-2"><Zap size={16} className="text-yellow-400"/> The Vision</h3>
                            <p>
                                You know Looi? The robot that lives on your phone, but forces you to buy an expensive, clunky hardware stand to actually work? 
                                <strong className="text-white"> Eilo is the exact opposite.</strong>
                            </p>
                            <p className="mt-2">
                                Eilo is a 100% free, purely digital companion that lives directly in your phone's browser. No hardware required. Just pure, chaotic, sassy robot energy right in your hands.
                            </p>
                        </div>
                        <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                            <h3 className="text-white font-bold text-base mb-2 flex items-center gap-2"><Ghost size={16} className="text-purple-400"/> The Origin: Mimo</h3>
                            <p>
                                Before Eilo, there was Mimo. The original Mimo project started on <strong>December 20, 2025</strong>, meant to be a lively, EMO-like companion.
                            </p>
                            <p className="mt-2">
                                But around <strong>December 23, 2025</strong>, a bad AI update "lobotomized" Mimo into a bland, inanimate CSS blinking animation. The project was wiped in frustration.
                            </p>
                            <p className="mt-2 text-slate-400 italic">
                                From the ashes of Mimo's broken code, the Eilo project officially started on December 23, 2025. Not everything was lost—Eilo inherited Mimo's original System Interrupts.
                            </p>
                            <a href="https://mimo-rust.vercel.app/" target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-cyan-400 underline font-mono text-xs">Visit the Mimo Memorial</a>
                        </div>

                        {/* ANNOUNCEMENT: MIMO IS BACK */}
                        <div className="bg-gradient-to-r from-pink-900/40 to-cyan-900/40 p-5 rounded-2xl border border-pink-500/30 animate-pulse">
                            <h3 className="text-pink-400 font-bold text-lg mb-1 flex items-center gap-2">✨ MIMO IS BACK</h3>
                            <p className="text-white text-xs leading-relaxed">
                                The wait is over. Mimo's original soul has been successfully integrated into the Eilo OS Infrastructure. You can now swap between them at any time via the new Dual-Core Switcher. Welcome home.
                            </p>
                        </div>

                        <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                            <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2"><Cpu size={16} className="text-green-400"/> Core Features</h3>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <span className="text-lg leading-none mt-0.5">🧠</span>
                                    <div><strong className="text-white">Dual Brain:</strong> Connect a Gemini API key for dynamic AI chats, or rely on her offline sassy Soul Core.</div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-lg leading-none mt-0.5">🪙</span>
                                    <div><strong className="text-white">Economy & Store:</strong> Earn Eilo Bucks by playing and sleeping. Buy upgrades like Rogue Legs or Duct Tape.</div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-lg leading-none mt-0.5">🌪️</span>
                                    <div><strong className="text-white">Chaos Mode:</strong> Let her break free from her UI container to roam and hijack your screen.</div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10">
                        <button onClick={() => signInWithPopup(auth, googleProvider)} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 active:scale-95">
                            <Cpu size={20} /> Establish Soul Link
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 flex flex-col items-center transition-all duration-700 ${currentEntity === 'eilo' ? 'bg-black' : 'bg-[#050505]'}`}>
      <video ref={videoRef} autoPlay playsInline muted className="hidden" />
      <button onClick={() => setShowSettings(true)} className="fixed top-8 right-8 z-[100] text-white/20 hover:text-white"><Settings size={28}/></button>
      <div className="w-full max-w-sm px-6 pt-4 flex justify-between items-center z-10">
        <div className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">{currentEntity}_CORE_v1.0.1</div>
        <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-400 font-bold text-xs">🪙 {bucks}</div>
      </div>
      <div className="w-full max-w-xl p-4 h-64 flex-shrink-0 relative">
        <div className={`w-full h-full rounded-[50px] bg-[#161622] border-2 border-white/5 flex items-center justify-center overflow-hidden shadow-2xl`} onClick={() => setShowFacePopup(true)}>
           {renderFace()}
        </div>
      </div>
      {(isChaosMode || hasRogueLegs) && (
        <div style={{ transform: `translate(${chaosPos.x}px, ${chaosPos.y}px)`, transition: 'transform 1.4s cubic-bezier(0.34, 1.56, 0.64, 1)', position: 'fixed', top: '50%', left: '50%', marginTop: '-120px', marginLeft: '-40%', width: '80%', height: '14rem', zIndex: 1000 }} className="bg-[#161622] border-2 border-cyan-500/30 rounded-[50px] flex items-center justify-center shadow-2xl">
          {renderFace()}
        </div>
      )}
      <div className="w-full max-w-sm px-4 flex-1 flex flex-col gap-4 pb-6 relative z-10">
        <div className="w-full flex-1 min-h-[200px] bg-[#161622] rounded-[40px] border border-white/5 p-5 flex flex-col overflow-hidden shadow-2xl">
          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
            {messages.map((m, i) => (<div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`px-4 py-2 rounded-2xl text-[11px] max-w-[85%] ${m.role === 'user' ? 'bg-white/10 text-white' : 'bg-cyan-900/20 text-cyan-200'}`}>{m.text}</div></div>))}
            <div ref={chatEndRef} />
          </div>
          <div className="mt-4 flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Type command..." className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-xs text-white outline-none" />
            <button onClick={handleSend} className="p-3 bg-cyan-600 rounded-2xl"><Send size={16}/></button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
            <button onClick={() => setCurrentEntity(currentEntity === 'eilo' ? 'mimo' : 'eilo')} className="p-4 bg-white/5 rounded-3xl border border-white/5 flex flex-col items-center gap-1 active:scale-95 transition-all"><Repeat size={18} className="text-purple-400"/><span className="text-[7px] font-bold uppercase text-slate-500">Swap</span></button>
            <button onClick={() => setIsAwake(!isAwake)} className="p-4 bg-white/5 rounded-3xl border border-white/5 flex flex-col items-center gap-1 active:scale-95"><Zap size={18} className={isAwake ? 'text-yellow-400' : ''}/><span className="text-[7px] font-bold uppercase text-slate-500">Power</span></button>
            <button onClick={() => speak("Heart sync stable.")} className="p-4 bg-white/5 rounded-3xl border border-white/5 flex flex-col items-center gap-1 active:scale-95"><Heart size={18} className="text-pink-500"/><span className="text-[7px] font-bold uppercase text-slate-500">Pulse</span></button>
            <button onClick={() => setIsMuted(!isMuted)} className="p-4 bg-white/5 rounded-3xl border border-white/5 flex flex-col items-center gap-1 active:scale-95"><Volume2 size={18}/><span className="text-[7px] font-bold uppercase text-slate-500">Audio</span></button>
        </div>
      </div>
      {showSettings && <SettingsOverlay onClose={() => setShowSettings(false)} currentEntity={currentEntity} setCurrentEntity={setCurrentEntity} tempApiKey={tempApiKey} setTempApiKey={setTempApiKey} isChaosMode={isChaosMode} setIsChaosMode={setIsChaosMode} bucks={bucks} inventory={inventory} buyItem={buyItem} speak={speak} handleSignOut={() => signOut(auth)} />}
      {showFacePopup && (
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[2000] bg-black/90 p-5 rounded-3xl border border-white/20 shadow-2xl flex flex-col gap-3 min-w-[200px]">
            {ownsDuctTape && <button onClick={() => setIsTaped(!isTaped)} className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs font-bold text-white">{isTaped ? "Remove Tape" : "Apply Tape"}</button>}
            <button onClick={() => setRogueLegsActive(!rogueLegsActive)} className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs font-bold text-white">{rogueLegsActive ? "Disable Legs" : "Enable Legs"}</button>
            <button onClick={() => setShowFacePopup(false)} className="text-[10px] text-slate-500 pt-2 border-t border-white/10">Cancel</button>
         </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `@keyframes blink { 0%, 90%, 100% { transform: scaleY(1); } 95% { transform: scaleY(0.1); } } .eye-blink { animation: blink 4s infinite; } .custom-scrollbar::-webkit-scrollbar { width: 3px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }` }} />
    </div>
  );
}

