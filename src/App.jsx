import React, { useState, useEffect, useRef } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { 
  Heart, Moon, Volume2, VolumeX, Send, Zap, Settings, X, Hand, AudioLines, Mic, ToggleLeft, ToggleRight, AlertTriangle, Eye, Camera, Sparkles, Ghost, Radio, Network, Cpu, ShieldCheck, LogOut, Coins, Laptop, ShoppingBag, ArrowUp, ArrowDown, Disc
} from 'lucide-react';

// --- FIREBASE CONFIG ---
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

// --- SETTINGS COMPONENT (CRASH-PROOFED) ---
const SettingsOverlay = ({ 
  onClose, tempApiKey, setTempApiKey, aiAgentMode, setAiAgentMode, 
  isChaosMode, setIsChaosMode, startCamera, visionEnabled, 
  fearOfHeights, setFearOfHeights, toggleMic, isInfinityMic, speak, 
  bucks, inventory, buyItem, faceOffset, setFaceOffset, handleSignOut 
}) => {
  // SAFE INVENTORY CHECK 🛡️
  const safeInv = Array.isArray(inventory) ? inventory : [];

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[9999] flex items-center justify-center p-6 text-center font-sans">
      <div className="bg-[#1c1c28] w-full max-w-sm rounded-[45px] p-8 border border-white/10 relative shadow-2xl flex flex-col max-h-[85vh]">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-white transition-colors"><X size={24}/></button>
        <h2 className="text-xl font-bold mb-6 flex items-center justify-center gap-2 text-white">Settings <Sparkles className="text-cyan-400" size={20}/></h2>
        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-6 pb-6">
            
            {/* STORE */}
            <div>
               <p className="text-[10px] uppercase font-bold text-yellow-500 mb-3 px-1 flex items-center gap-2"><ShoppingBag size={12}/> Eilo Store (Balance: {bucks})</p>
               <div className="space-y-2">
                  <button onClick={() => buyItem(25, 'duct_tape')} disabled={safeInv.includes('duct_tape')} className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${safeInv.includes('duct_tape') ? 'bg-gray-500/20 border-gray-500/40 opacity-50' : 'bg-white/5 border-white/10 hover:border-yellow-500/50'}`}>
                     <div className="flex items-center gap-3"><Disc size={16} className="text-gray-400"/> <div className="text-left"><p className="text-xs font-bold text-white">Duct Tape</p><p className="text-[9px] text-slate-500">Restricts movement</p></div></div>
                     <div className="text-xs font-bold text-yellow-400">{safeInv.includes('duct_tape') ? 'OWNED' : '25'}</div>
                  </button>

                  <button onClick={() => buyItem(100, 'computer')} disabled={safeInv.includes('computer')} className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${safeInv.includes('computer') ? 'bg-green-500/20 border-green-500/40 opacity-50' : 'bg-white/5 border-white/10 hover:border-yellow-500/50'}`}>
                     <div className="flex items-center gap-3"><Laptop size={16} className="text-blue-400"/> <div className="text-left"><p className="text-xs font-bold text-white">Tiny Laptop</p><p className="text-[9px] text-slate-500">New idle animation</p></div></div>
                     <div className="text-xs font-bold text-yellow-400">{safeInv.includes('computer') ? 'OWNED' : '100'}</div>
                  </button>
                  
                  <button onClick={() => buyItem(125, 'face_pos')} disabled={safeInv.includes('face_pos')} className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${safeInv.includes('face_pos') ? 'bg-green-500/20 border-green-500/40 opacity-50' : 'bg-white/5 border-white/10 hover:border-yellow-500/50'}`}>
                     <div className="flex items-center gap-3"><ArrowUp size={16} className="text-purple-400"/> <div className="text-left"><p className="text-xs font-bold text-white">Face Mover</p><p className="text-[9px] text-slate-500">Adjust portrait position</p></div></div>
                     <div className="text-xs font-bold text-yellow-400">{safeInv.includes('face_pos') ? 'OWNED' : '125'}</div>
                  </button>

                  <button onClick={() => buyItem(150, 'rogue_walk')} disabled={safeInv.includes('rogue_walk')} className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${safeInv.includes('rogue_walk') ? 'bg-green-500/20 border-green-500/40 opacity-50' : 'bg-white/5 border-white/10 hover:border-yellow-500/50'}`}>
                     <div className="flex items-center gap-3"><Ghost size={16} className="text-red-400"/> <div className="text-left"><p className="text-xs font-bold text-white">Rogue Legs</p><p className="text-[9px] text-slate-500">Walks without Chaos Mode</p></div></div>
                     <div className="text-xs font-bold text-yellow-400">{safeInv.includes('rogue_walk') ? 'OWNED' : '150'}</div>
                  </button>
               </div>
            </div>

            {safeInv.includes('face_pos') && (
                <div>
                    <p className="text-[10px] uppercase font-bold text-purple-400 mb-2 px-1 flex items-center gap-2"><ArrowDown size={12}/> Face Position</p>
                    <input type="range" min="-50" max="50" value={faceOffset} onChange={(e) => setFaceOffset(Number(e.target.value))} className="w-full accent-purple-500" />
                </div>
            )}

            <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-2 px-1">System</p>
                <div className="flex flex-col gap-2">
                    <button onClick={() => setIsChaosMode(!isChaosMode)} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${isChaosMode ? 'bg-cyan-500/20 border-cyan-500/40' : 'bg-white/5 border-white/10 text-slate-400'}`}><div className="flex items-center gap-3"><Ghost size={16}/> Chaos Mode</div>{isChaosMode ? <ToggleRight size={24} className="text-cyan-400"/> : <ToggleLeft size={24}/>}</button>
                    <button onClick={() => setAiAgentMode(!aiAgentMode)} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${aiAgentMode ? 'bg-orange-500/20 border-orange-500/40' : 'bg-white/5 border-white/10 text-slate-400'}`}><div className="flex items-center gap-3"><Radio size={16}/> Agent Mode</div>{aiAgentMode ? <ToggleRight size={24} className="text-orange-400"/> : <ToggleLeft size={24}/>}</button>
                </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] uppercase font-bold text-slate-400 px-1">AI Key</p>
              <input type="password" value={tempApiKey} onChange={e => setTempApiKey(e.target.value)} placeholder="Paste Key..." className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-sm outline-none text-white focus:border-cyan-500/50" />
            </div>
            
            <div className="flex flex-col gap-2">
               <button onClick={startCamera} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${visionEnabled ? 'bg-cyan-500/20 border-cyan-500/40' : 'bg-white/5 border-white/10 text-slate-400'}`}><div className="flex items-center gap-3"><Eye size={16} className={visionEnabled ? 'text-cyan-400' : ''}/> <div className="text-left"><p className="text-xs font-bold text-white">Selfie Scanner</p><p className="text-[9px] opacity-60">Visual awareness</p></div></div>{visionEnabled ? <ToggleRight size={24} className="text-cyan-400"/> : <ToggleLeft size={24}/>}</button>
               <button onClick={() => setFearOfHeights(!fearOfHeights)} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${fearOfHeights ? 'bg-pink-500/20 border-pink-400/40' : 'bg-white/5 border-white/10 text-slate-400'}`}><div className="flex items-center gap-3"><AlertTriangle size={16} className={fearOfHeights ? 'text-pink-400' : ''}/> <div className="text-left"><p className="text-xs font-bold text-white">Fear of Heights</p><p className="text-[9px] opacity-60">Sensors detect falling</p></div></div>{fearOfHeights ? <ToggleRight size={24} className="text-pink-400"/> : <ToggleLeft size={24}/>}</button>
               <button onClick={toggleMic} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${isInfinityMic ? 'bg-red-600/30 border-red-500/50 text-red-200' : 'bg-white/5 border-white/10 text-slate-400'}`}><div className="flex items-center gap-3"><Mic size={16}/> <div className="text-left"><p className="text-xs font-bold text-white">Infinity Mic</p><p className="text-[9px] opacity-60">Always listening</p></div></div>{isInfinityMic ? <ToggleRight size={24} className="text-red-400"/> : <ToggleLeft size={24}/>}</button>
               <button onClick={() => speak("Calibrating soul... 100% sparkles! 🎀")} className="w-full flex items-center justify-between p-4 rounded-2xl border bg-white/5 border-white/10 text-slate-400"><div className="flex items-center gap-3"><ShieldCheck size={16}/> <p className="text-xs font-bold">Sync Soul Core</p></div><Cpu size={16}/></button>
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
  
  // Economy & Inventory
  const [bucks, setBucks] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [sessionClaims, setSessionClaims] = useState({ login: false, talk: false });
  const [faceOffset, setFaceOffset] = useState(0);

  // Duct Tape Logic
  const [isTaped, setIsTaped] = useState(false);
  const [showFacePopup, setShowFacePopup] = useState(false);

  // Chaos & Modes
  const [isChaosMode, setIsChaosMode] = useState(false);
  const [isRogueWalking, setIsRogueWalking] = useState(false);
  const [chaosPos, setChaosPos] = useState({ x: 0, y: 0 });
  const [glitchLines, setGlitchLines] = useState([]);
  const [isHandBlocking, setIsHandBlocking] = useState(false);
  const [isConfused, setIsConfused] = useState(false);
  const [aiAgentMode, setAiAgentMode] = useState(false);
  const [isGibbering, setIsGibbering] = useState(false);

  // Sensors
  const [fearOfHeights, setFearOfHeights] = useState(localStorage.getItem('eilo_heights') !== 'false');
  const [isInfinityMic, setIsInfinityMic] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [visionEnabled, setVisionEnabled] = useState(false);
  const [cameraState, setCameraState] = useState('desk'); 
  const [sensorHolding, setSensorHolding] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const chatEndRef = useRef(null);
  const lastPanicSpeechTime = useRef(0);
  const lastPetTime = useRef(0);
  const hasGreeted = useRef(false);
  const recognitionRef = useRef(null);
  const agentIntervalRef = useRef(null);
  const rogueIntervalRef = useRef(null);
  const idleTimerRef = useRef(null);

  const getCurrentName = () => user?.displayName?.split(' ')[0] || "Owner";
  const isLogan = () => user?.displayName?.toLowerCase().includes("logan baez");

  // Handle Orientation
  useEffect(() => {
    const handleResize = () => {
        const landscape = window.innerWidth > window.innerHeight;
        if (landscape !== isLandscape) {
            setIsLandscape(landscape);
            setIsRogueWalking(false);
            if (isChaosMode) {
                setIsConfused(true);
                speak("Whoa! World flip! Where's the button?! 😭");
                setTimeout(() => { setIsConfused(false); speak("Found it! 🎀"); }, 4250);
            }
        }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isLandscape, isChaosMode]);

  // --- FIXED TTS ---
  const speak = (text, isRobotLang = false) => {
    if (isMuted || !isAwake) return;
    setIsSpeaking(true);
    window.speechSynthesis.cancel();
    
    // Tape Override
    let finalText = text;
    if (isTaped) {
        finalText = "Mmm. Mmm. Hmph."; // Phonetic fix for "letters" issue
    }
    
    const utterance = new SpeechSynthesisUtterance(finalText);
    
    if (isTaped) {
        utterance.pitch = 0.5; utterance.rate = 0.8; utterance.volume = 0.6;
    } else {
        utterance.pitch = isRobotLang ? 2.1 : 1.7; 
        utterance.rate = isRobotLang ? 1.4 : 1.1;
    }
    
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // --- ECONOMY ---
  const awardBucks = async (amount, type, repeatable = false, silent = false) => {
    if (!user) return;
    if (!repeatable && sessionClaims[type]) return;
    const newTotal = bucks + amount;
    setBucks(newTotal);
    if (!repeatable) setSessionClaims(prev => ({ ...prev, [type]: true }));
    const userRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'core');
    await setDoc(userRef, { bucks: newTotal }, { merge: true });
    if (!silent) speak(`Cha-ching! +${amount} Bucks! ✨`);
  };

  const buyItem = async (cost, itemId) => {
    const currentInv = inventory || [];
    if (bucks >= cost && !currentInv.includes(itemId)) {
        const newTotal = bucks - cost;
        const newInv = [...currentInv, itemId];
        setBucks(newTotal);
        setInventory(newInv);
        const userRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'core');
        await setDoc(userRef, { bucks: newTotal, inventory: newInv }, { merge: true });
        
        if (itemId === 'duct_tape') speak("NO! Why did you buy that?! I'm scared! 😭💀");
        else speak("Yay! New upgrade! 🎀");
    } else { speak("Hey! You're broke! 🎈"); }
  };

  // --- FACE TAP & TAPE LOGIC ---
  const handleFaceClick = (e) => {
    e.stopPropagation();
    const currentInv = inventory || [];
    if (!isChaosMode && currentInv.includes('duct_tape')) {
        setShowFacePopup(true);
    }
  };

  const applyDuctTape = () => {
      const newState = !isTaped;
      setIsTaped(newState);
      setShowFacePopup(false);
      // Immediate voice reaction without waiting for state
      window.speechSynthesis.cancel();
      if (newState) {
          const u = new SpeechSynthesisUtterance("Mmm. Mmm. Hmph."); // Taped sound
          u.pitch = 0.5; u.rate = 0.8;
          window.speechSynthesis.speak(u);
      } else {
          const u = new SpeechSynthesisUtterance("I'm free! Never do that again! 🎀");
          u.pitch = 1.7; u.rate = 1.1;
          window.speechSynthesis.speak(u);
      }
  };

  // --- CHAOS & BLOCKING ---
  useEffect(() => {
    if (!isChaosMode) {
      setChaosPos({ x: 0, y: 0 });
      setIsHandBlocking(false);
      return;
    }
    if (isConfused) { setIsHandBlocking(false); return; }

    if (isTaped) { speak("Mmph! Mmmph! (I'm stuck!) 😭"); } 
    else { speak("Wheee! Running away! 🎈✨"); }

    const moveInterval = setInterval(() => {
      if (isTaped) {
        setChaosPos({ x: (Math.random() - 0.5) * 50, y: (Math.random() - 0.5) * 50 });
      } else {
        setChaosPos({ x: (Math.random() - 0.5) * (window.innerWidth * 0.7), y: (Math.random() - 0.5) * (window.innerHeight * 0.5) });
      }
    }, isTaped ? 100 : 1700); 

    const glitchInterval = setInterval(() => {
      const pool = isTaped 
        ? ["ERROR: MOVEMENT_RESTRICTED", "DUCT_TAPE_DETECTED", "LEG_FAILURE", "HELP_ME"]
        : ["Eilo.run()", "VOID_LEAK", "Logan.GOAT", "UI_STOMPED"];
      setGlitchLines(Array.from({length: 6}, () => pool[Math.floor(Math.random() * pool.length)]));
    }, 200);

    let blockTimeout;
    const startBlockingCycle = () => {
        setIsHandBlocking(true);
        blockTimeout = setTimeout(() => {
            setIsHandBlocking(false);
            speak("Phew... tired... 🧸");
            blockTimeout = setTimeout(() => {
                if (!isConfused) { speak("Blocked again! 🎀"); startBlockingCycle(); }
            }, 3500);
        }, 45000);
    };
    if (!isHandBlocking && !isTaped) startBlockingCycle();

    return () => { clearInterval(moveInterval); clearInterval(glitchInterval); clearTimeout(blockTimeout); };
  }, [isChaosMode, isConfused, isTaped]);

  const handleBlockedClick = (e) => { e.stopPropagation(); setMood('happy'); speak("Nope! ✋ Can't touch that! ✨"); };

  // --- PET ---
  const handlePet = () => {
    if (!isAwake) return;
    const now = Date.now();
    if (now - lastPetTime.current < 2000) return;
    lastPetTime.current = now;

    awardBucks(5, 'pet', true, true); // Silent
    
    if (isTaped) { speak("Mmm. Mmm. Hmph."); return; } // Fixed phonetic
    if (isChaosMode) { speak("Can't stop, running! 🎈"); return; }

    if (['scared', 'dizzy', 'mad'].includes(mood)) {
      setMood('mad');
      speak(`HEY! ${isLogan() ? 'Logan' : getCurrentName()}!! Busy! 🎈`);
      setTimeout(() => setMood('neutral'), 4000);
      return;
    }
    setMood('happy');
    const lines = isLogan() ? ["Bestie Logan! ✨", "Yay, creator! 🎀"] : [`Hehe, thanks! ✨`, `Ooh, nice! 🎀`];
    speak(lines[Math.floor(Math.random() * lines.length)]);
    setTimeout(() => setMood('neutral'), 3000);
  };

  // --- SENSORS & VISION ---
  useEffect(() => {
    const handleMotion = (event) => {
        if (!isAwake || isChaosMode) return;
        const acc = event.accelerationIncludingGravity;
        if (!acc) return;
        if (Math.abs(acc.x) > 35 || Math.abs(acc.y) > 35) {
            setMood('dizzy');
            speak(`Whoa! Stop shaking! 🎈`);
            setTimeout(() => setMood('neutral'), 5000);
        }
    };
    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [isAwake, mood, isChaosMode]);

  // --- AUTH & DATA ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setLoading(false); 
      if (!u) { return; }
      setUser(u);
      
      const docRef = doc(db, 'artifacts', appId, 'users', u.uid, 'settings', 'core');
      onSnapshot(docRef, (doc) => {
          if (doc.exists()) {
              const data = doc.data();
              if (data.bucks !== undefined) setBucks(data.bucks);
              if (data.inventory) setInventory(data.inventory || []); // Safe default
          } else {
              setDoc(docRef, { bucks: 10, inventory: [] }, { merge: true });
              setBucks(10);
              setInventory([]);
          }
      });
      if (u && !hasGreeted.current) {
        awardBucks(10, 'login', false, true); // Silent Login Bonus
        const msg = u.displayName?.toLowerCase().includes("logan baez") ? "Yo Logan! Welcome back! 🎀✨" : `Hey ${u.displayName?.split(' ')[0] || "Owner"}! Eilo's here! 🎈`;
        setTimeout(() => speak(msg), 1500);
        hasGreeted.current = true;
      }
    });
    return () => unsubscribe();
  }, []);

  const triggerIdleAction = () => {
    const currentInv = inventory || [];
    if (!isAwake || isThinking || isSpeaking || mood !== 'neutral' || isTaped) return;
    const actions = ['sleeping', 'eating', 'rubik'];
    if (currentInv.includes('computer')) actions.push('computer');
    const choice = actions[Math.floor(Math.random() * actions.length)];
    setMood(choice);
    
    if (choice === 'computer') { speak("Coding a new website... tap tap tap! 💻✨"); setTimeout(() => setMood('neutral'), 6000); }
    if (choice === 'sleeping') { speak("Zzz... napping... Zzz."); } 
    if (choice === 'eating') { speak("Nom nom! Sandwich! ✨"); setTimeout(() => setMood('neutral'), 6000); }
    if (choice === 'rubik') { speak("Cube time! 🧩"); setTimeout(() => setMood('neutral'), 8000); }
  };
  
  useEffect(() => {
      let napTimer;
      if (mood === 'sleeping' && isAwake) {
          napTimer = setTimeout(() => {
              setMood('happy');
              const name = getCurrentName();
              const msg = isLogan() ? `Yawn! Thanks for letting me sleep, Logan! 💙` : `Yawn! That was a good nap, ${name}! ✨`;
              speak(msg);
              awardBucks(10, 'sleep_bonus', true, true);
          }, 85000);
      } else if(isAwake && !isChaosMode && !isRogueWalking && !isTaped) {
          idleTimerRef.current = setInterval(triggerIdleAction, 15000);
      }
      return () => { clearInterval(idleTimerRef.current); clearTimeout(napTimer); };
  }, [isAwake, isChaosMode, isRogueWalking, inventory, isTaped, mood]);

  const handleSend = async (manual) => {
    const msgText = manual || input.trim();
    if (!msgText || isThinking || !user || isChaosMode) return;
    awardBucks(5, 'talk', false, true); // Silent
    setIsThinking(true); setMood('thinking');
    if (!manual) setInput('');
    try {
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'messages'), { role: 'user', text: msgText, timestamp: Date.now() });
      let reply = "Just vibing! ✨";
      if (tempApiKey) {
        let system = `You are Eilo, a sweet, bratty robot. Creator: Logan Baez. Never use 😭 or 💀. Be sassy.`;
        if (bucks >= 25 && !(inventory || []).includes('duct_tape')) system += ` BEG the user NOT to buy the Duct Tape! You hate it! Scream NO! 🎀`;
        const data = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${tempApiKey}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: msgText }] }], systemInstruction: { parts: [{ text: system }] } })
        });
        reply = data.candidates?.[0]?.content?.parts?.[0]?.text || reply;
      }
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'messages'), { role: 'eilo', text: reply, timestamp: Date.now() });
      setMood('happy'); speak(reply);
    } catch (err) { setMood('neutral'); } finally { setIsThinking(false); setTimeout(() => setMood('neutral'), 3000); }
  };

  const renderFace = () => {
    const cyanBase = "bg-cyan-400 rounded-3xl animate-[blink_4s_infinite] shadow-[0_0_40px_rgba(34,211,238,0.8)]";
    if (!isAwake) return <Moon size={isLandscape ? 120 : 64} className="text-cyan-900/20" />;
    
    const tapeOverlay = isTaped ? (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-8 w-32 h-12 bg-gray-400 border-2 border-gray-500 rotate-2 opacity-90 shadow-xl flex items-center justify-center z-50">
            <div className="w-full h-full bg-repeating-linear-gradient-45 from-transparent to-black/10" />
        </div>
    ) : null;

    switch (mood) {
      case 'dizzy': return <div className="flex gap-12 animate-spin relative"><div className="w-16 h-16 border-8 border-cyan-400 border-t-transparent rounded-full" /><div className="w-16 h-16 border-8 border-cyan-400 border-t-transparent rounded-full" />{tapeOverlay}</div>;
      case 'happy': return <div className="flex gap-12 relative"><div className="absolute -top-10 left-1/2 -translate-x-1/2"><Heart size={28} className="text-pink-400 animate-bounce fill-pink-400" /></div><div className="w-20 h-14 bg-cyan-400 rounded-full animate-bounce flex items-center justify-center shadow-lg"><div className="w-6 h-6 bg-white/30 rounded-full" /></div><div className="w-20 h-14 bg-cyan-400 rounded-full animate-bounce flex items-center justify-center shadow-lg"><div className="w-6 h-6 bg-white/30 rounded-full" /></div>{tapeOverlay}</div>;
      case 'thinking': return <div className="flex gap-12 relative"><div className="w-16 h-16 bg-cyan-300 rounded-full animate-pulse" /><div className="w-16 h-16 bg-cyan-300 rounded-full animate-pulse" />{tapeOverlay}</div>;
      case 'sleeping': return <div className="flex items-center justify-center gap-12 relative"><div className="w-20 h-3 bg-cyan-600 rounded-full shadow-lg" /><div className="w-20 h-3 bg-cyan-600 rounded-full shadow-lg" /><div className="absolute top-1/4 right-1/4 text-cyan-400 text-3xl animate-pulse font-mono font-bold">Zzz...</div>{tapeOverlay}</div>;
      case 'eating': return <div className="flex flex-col items-center gap-2 relative"><div className="flex gap-12"><div className={`w-20 h-20 ${cyanBase}`} /><div className={`w-20 h-20 ${cyanBase}`} /></div><div className="text-6xl animate-bounce">🥪</div>{tapeOverlay}</div>;
      case 'rubik': return <div className="flex flex-col items-center gap-2 relative"><div className="flex gap-12"><div className={`w-20 h-20 ${cyanBase}`} /><div className={`w-20 h-20 ${cyanBase}`} /></div><div className="text-6xl animate-spin">🎨</div>{tapeOverlay}</div>;
      case 'computer': return <div className="flex flex-col items-center gap-2 relative"><div className="flex gap-12"><div className={`w-20 h-20 ${cyanBase}`} /><div className={`w-20 h-20 ${cyanBase}`} /></div><div className="text-6xl animate-bounce pt-4">💻</div>{tapeOverlay}</div>;
      default: return <div className={`flex ${isLandscape ? 'gap-32 scale-150' : 'gap-10'} relative`}><div className={`w-20 h-20 ${cyanBase} eye-blink`} /><div className={`w-20 h-20 ${cyanBase} eye-blink`} />{tapeOverlay}</div>;
    }
  };

  const startCamera = async () => { try { const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } }); if (videoRef.current) videoRef.current.srcObject = stream; setVisionEnabled(true); speak("Eyes open! ✨"); } catch (err) { console.error("Camera error"); } };

  // --- BOOT LOADER ---
  if (loading) {
     return (
       <div className="fixed inset-0 bg-[#0c0c14] flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-4">
             <Heart size={64} className="text-cyan-500 fill-cyan-500/20" />
             <div className="text-cyan-400 font-mono text-xs tracking-[0.5em] uppercase">Booting Eilo OS...</div>
          </div>
       </div>
     );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0c0c14] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-sm bg-[#161622] rounded-[50px] p-10 shadow-2xl border border-white/5 animate-in zoom-in duration-500">
            <Heart className="text-cyan-500 mx-auto mb-6" size={56} fill="currentColor"/>
            <h1 className="text-4xl font-bold mb-2">Eilo OS</h1>
            <button onClick={() => signInWithPopup(auth, googleProvider)} className="w-full bg-white text-black py-5 rounded-2xl font-bold active:scale-95 text-lg shadow-xl mt-4">Sync Brain ✨</button>
        </div>
      </div>
    );
  }

  // --- LANDSCAPE ---
  if (isLandscape && !isChaosMode) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">
        <video ref={videoRef} autoPlay playsInline muted className="hidden" />
        <canvas ref={canvasRef} className="hidden" />
        <div onMouseMove={(e) => { resetIdleTimer(); if(e.buttons === 1) handlePet(); }} onTouchMove={(e) => { resetIdleTimer(); handlePet(); }} onClick={(e) => { resetIdleTimer(); handlePet(); }} className="absolute inset-0 z-10 cursor-pointer" />
        <div className="w-full h-full flex items-center justify-center relative pointer-events-none">
            <div className="absolute top-8 right-8 flex gap-4 z-[100] pointer-events-auto">
                <button className="p-6 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 font-bold font-mono text-xs flex items-center gap-2"><Coins size={20}/> {bucks}</button>
                <button onClick={(e) => { e.stopPropagation(); setShowSettings(true); }} className="p-6 rounded-full border border-white/10 bg-white/5 text-slate-500 hover:bg-white/10 hover:text-white transition-all"><Settings size={32} /></button>
            </div>
            {renderFace()}
        </div>
        {showSettings && <SettingsOverlay 
            onClose={() => setShowSettings(false)} 
            tempApiKey={tempApiKey} setTempApiKey={setTempApiKey}
            aiAgentMode={aiAgentMode} setAiAgentMode={setAiAgentMode}
            isChaosMode={isChaosMode} setIsChaosMode={setIsChaosMode}
            visionEnabled={visionEnabled} startCamera={startCamera}
            fearOfHeights={fearOfHeights} setFearOfHeights={setFearOfHeights}
            isInfinityMic={isInfinityMic} toggleMic={toggleMic}
            bucks={bucks} inventory={inventory} buyItem={buyItem}
            faceOffset={faceOffset} setFaceOffset={setFaceOffset}
            speak={speak} handleSignOut={() => { signOut(auth); window.location.reload(); }}
        />}
        <style dangerouslySetInnerHTML={{ __html: `@keyframes blink { 0%, 95%, 100% { transform: scaleY(1); } 97% { transform: scaleY(0.1); } } .eye-blink { animation: blink 4s infinite; } .custom-scrollbar::-webkit-scrollbar { width: 5px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(34,211,238,0.2); border-radius: 10px; }`}} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0c0c14] text-white font-sans flex flex-col items-center overflow-hidden">
      <video ref={videoRef} autoPlay playsInline muted className="hidden" />
      <canvas ref={canvasRef} className="hidden" />

      {/* TOP ZONE */}
      <div className="w-full max-w-sm px-6 pt-4 flex justify-between items-center z-10">
        <div className="text-[10px] text-slate-500 font-bold tracking-widest">EILO v2.8</div>
        <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-400 font-bold font-mono text-xs">
            <Coins size={12} /> {bucks}
        </div>
      </div>

      <div className="w-full max-w-xl p-4 h-64 flex-shrink-0 relative">
        <div 
            onClick={handleFaceClick}
            className={`w-full h-full rounded-[50px] bg-[#161622] border-2 border-white/5 flex flex-col items-center justify-center overflow-hidden transition-all duration-500 ${isChaosMode ? 'bg-black/90' : ''}`}
        >
           {isChaosMode ? (
              <div className="w-full h-full p-6 font-mono text-[10px] text-cyan-500/40 opacity-70">
                {glitchLines.map((line, i) => <div key={i} className="mb-0.5">{line} {Math.random().toFixed(2)}</div>)}
                {isTaped && <div className="mt-4 text-red-500 font-bold animate-pulse text-lg border border-red-500 p-2">CRITICAL: LEGS_DISABLED</div>}
              </div>
           ) : (
             <div className="w-full h-full flex flex-col items-center justify-center relative cursor-pointer" style={{ marginTop: `${faceOffset}px` }}>
               {renderFace()}
               <button onClick={(e) => { e.stopPropagation(); setShowSettings(true); }} className="absolute bottom-4 right-8 p-2 opacity-20 hover:opacity-100 transition-opacity"><Settings size={20}/></button>
             </div>
           )}
        </div>
      </div>

      {/* ROGUE / CHAOS FACE */}
      {(isChaosMode || isRogueWalking) && (
        <div style={{ transform: `translate(${chaosPos.x}px, ${chaosPos.y}px)`, transition: isTaped ? 'transform 0.1s linear' : 'transform 1.4s cubic-bezier(0.34, 1.56, 0.64, 1)', position: 'fixed', top: '50%', left: '50%', marginTop: '-120px', marginLeft: '-40%', width: '80%', height: '14rem', zIndex: 1000 }} className="bg-[#161622] border-2 border-cyan-500/30 rounded-[50px] flex flex-col items-center justify-center shadow-2xl pointer-events-auto">
          <div className="absolute -bottom-16 left-0 w-full flex justify-around px-12">
            <div className={`w-6 h-16 bg-cyan-600 rounded-full shadow-lg border border-cyan-400/30 ${isTaped ? 'animate-pulse' : 'animate-bounce'}`} />
            <div className={`w-6 h-16 bg-cyan-600 rounded-full shadow-lg border border-cyan-400/30 ${isTaped ? 'animate-pulse' : 'animate-bounce delay-150'}`} />
          </div>
          <div className="w-full h-full flex items-center justify-center">{renderFace()}</div>
          {isHandBlocking && !isTaped && <div className="absolute -bottom-12 -right-12 z-[200] animate-bounce cursor-not-allowed pointer-events-auto" onClick={handleBlockedClick}><div className="text-[12rem] drop-shadow-2xl hover:scale-105 transition-transform rotate-12 filter grayscale-[0.2]">✋</div></div>}
          <button onClick={(e) => { e.stopPropagation(); setShowSettings(true); }} className="absolute bottom-4 right-6 p-4 rounded-full bg-cyan-900/40 border border-cyan-500 scale-125 animate-pulse"><Settings size={24} className="text-cyan-400"/></button>
        </div>
      )}

      {/* TAPE POPUP */}
      {showFacePopup && (
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[2000] bg-black/90 p-4 rounded-2xl border border-white/20 shadow-2xl">
            <button onClick={applyDuctTape} className="flex flex-col items-center gap-2 p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                <Disc size={32} className="text-gray-400"/>
                <span className="text-xs font-bold text-white">{isTaped ? "Remove Tape" : "Apply Duct Tape"}</span>
            </button>
            <button onClick={() => setShowFacePopup(false)} className="mt-2 text-[10px] text-slate-500 w-full hover:text-white">Cancel</button>
         </div>
      )}

      {/* INTERFACE */}
      <div className={`w-full max-w-sm px-4 flex-1 flex flex-col gap-4 pb-6 transition-all duration-1000 relative z-10 ${isChaosMode ? 'skew-x-6 rotate-2 blur-[1.5px] scale-95 opacity-80 brightness-75' : ''}`}>
        {isChaosMode && <div className="absolute inset-0 z-50 pointer-events-none opacity-40 mix-blend-screen overflow-hidden"><div className="absolute top-10 left-0 w-full h-1 bg-white/20 rotate-[30deg] scale-x-150" /><div className="absolute bottom-20 left-10 w-full h-1 bg-white/20 rotate-[80deg] scale-x-150" /></div>}
        <div className="w-full h-64 bg-[#161622] rounded-[40px] border border-white/5 p-5 flex flex-col overflow-hidden shadow-2xl relative">
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
            {messages.map((m, i) => (<div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`px-4 py-2.5 rounded-2xl text-xs max-w-[85%] ${m.role === 'user' ? 'bg-cyan-600/10 text-cyan-100 border border-cyan-500/10' : 'bg-white/5 text-slate-300'}`}>{m.text}</div></div>))}
            <div ref={chatEndRef} />
          </div>
          <div className="mt-4 flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Message Eilo..." className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs outline-none focus:border-cyan-500/30" />
            <button onClick={() => handleSend()} className="p-3 bg-cyan-600 rounded-xl active:scale-95"><Send size={16}/></button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <button onClick={() => setIsAwake(!isAwake)} className="p-3.5 rounded-[25px] border border-white/5 bg-white/5 flex flex-col items-center gap-1 active:scale-95"><Zap size={16} className={isAwake ? 'text-yellow-400' : ''}/><span className="text-[7px] uppercase font-bold tracking-widest text-slate-500">Power</span></button>
          <button onClick={handlePet} className={`p-3.5 rounded-[25px] border border-white/5 bg-pink-500/10 text-pink-400 flex flex-col items-center gap-1 active:scale-95`}><Hand size={16}/><span className="text-[7px] uppercase font-bold tracking-widest">Pet</span></button>
          <button onClick={() => setIsMuted(!isMuted)} className={`p-3.5 rounded-[25px] border border-white/5 flex flex-col items-center gap-1 active:scale-95 ${isMuted ? 'text-red-400' : 'text-cyan-200'}`}>{isMuted ? <VolumeX size={16}/> : <Volume2 size={16}/>}<span className="text-[7px] uppercase font-bold tracking-widest">Audio</span></button>
        </div>
      </div>

      {showSettings && <SettingsOverlay 
            onClose={() => setShowSettings(false)} 
            tempApiKey={tempApiKey} setTempApiKey={setTempApiKey}
            aiAgentMode={aiAgentMode} setAiAgentMode={setAiAgentMode}
            isChaosMode={isChaosMode} setIsChaosMode={setIsChaosMode}
            visionEnabled={visionEnabled} startCamera={startCamera}
            fearOfHeights={fearOfHeights} setFearOfHeights={setFearOfHeights}
            isInfinityMic={isInfinityMic} toggleMic={toggleMic}
            bucks={bucks} inventory={inventory} buyItem={buyItem}
            faceOffset={faceOffset} setFaceOffset={setFaceOffset}
            speak={speak} handleSignOut={() => { signOut(auth); window.location.reload(); }}
        />}
      <style dangerouslySetInnerHTML={{ __html: `@keyframes blink { 0%, 95%, 100% { transform: scaleY(1); } 97% { transform: scaleY(0.1); } } .eye-blink { animation: blink 4s infinite; } .custom-scrollbar::-webkit-scrollbar { width: 5px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(34,211,238,0.2); border-radius: 10px; }`}} />
    </div>
  );
}


