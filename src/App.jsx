import React, { useState, useEffect, useRef } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import {
Heart, Moon, Volume2, VolumeX, Send, Zap, Settings, X, Hand, Mic, ToggleLeft, ToggleRight, AlertTriangle, Eye, Sparkles, Ghost, Radio, Cpu, ShieldCheck, LogOut, Repeat, Smartphone, Code, Coffee, Box, Timer, Activity, Shield
} from 'lucide-react';

/**

EILO OS CORE - VERSION 1.2.5 (HIGH-PERFORMANCE DUAL-CORE)

PROJECT START: DECEMBER 23, 2025

LEGACY SYNC: MIMO CORE (DECEMBER 20, 2025)

This kernel manages social economy, chaotic UI hijacking,


advanced sensor arrays, and dual-soul rendering.
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
if (!response.ok) throw new Error(HTTP ${response.status});
return await response.json();
} catch (err) {
if (retries <= 0) throw err;
await new Promise(r => setTimeout(r, backoff));
return fetchWithRetry(url, options, retries - 1, backoff * 2);
}
};

// --- SETTINGS OVERLAY COMPONENT (DUAL-CORE DOCK) ---
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
<div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[9999] flex items-center justify-center p-4 text-center font-sans overflow-y-auto">
<div className="bg-[#1c1c28] w-full max-w-md rounded-[50px] p-8 border border-white/10 relative shadow-2xl flex flex-col my-auto max-h-[92vh]">
<button onClick={onClose} className="absolute top-10 right-10 text-slate-400 hover:text-white transition-all active:scale-90"><X size={32}/></button>

<h2 className="text-3xl font-black mb-2 text-white tracking-tighter">System Kernel</h2>  
    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] mb-8">Hardware Configuration v1.2.5</p>  
      
    {/* SOUL SWITCHER ENGINE */}  
    <div className="mb-8 bg-gradient-to-br from-blue-950/40 to-purple-950/40 p-6 rounded-[40px] border border-white/10 shadow-inner">  
        <p className="text-[11px] uppercase font-black text-cyan-400 mb-5 tracking-[0.25em] flex items-center justify-center gap-3">  
            <Activity size={14}/> Neural Link Swapper  
        </p>  
        <div className="grid grid-cols-2 gap-4">  
            <button   
                onClick={() => { setCurrentEntity('eilo'); speak("Eilo High-Performance Kernel Active."); }}  
                className={`py-5 rounded-3xl text-[10px] font-black tracking-widest transition-all duration-500 ${currentEntity === 'eilo' ? 'bg-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.7)] scale-105' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}  
            >EILO CORE</button>  
            <button   
                onClick={() => { setCurrentEntity('mimo'); speak("Mimo Original Soul synced. Sparkles! 🎀"); }}  
                className={`py-5 rounded-3xl text-[10px] font-black tracking-widest transition-all duration-500 ${currentEntity === 'mimo' ? 'bg-pink-600 text-white shadow-[0_0_30px_rgba(219,39,119,0.7)] scale-105' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}  
            >MIMO SOUL</button>  
        </div>  
    </div>  

    <div className="flex-1 overflow-y-auto pr-3 custom-scrollbar space-y-10 text-left pb-10">  
          
        {/* COMPREHENSIVE STORE */}  
        <div className="space-y-5">  
           <div className="flex justify-between items-center px-1">  
              <p className="text-[11px] uppercase font-black text-yellow-500 tracking-widest flex items-center gap-3"><Box size={14}/> System Store</p>  
              <div className="bg-yellow-500/10 px-4 py-1.5 rounded-full border border-yellow-500/20 shadow-lg">  
                <p className="text-[11px] font-black text-yellow-400">Balance: {bucks}</p>  
              </div>  
           </div>  
           <div className="grid grid-cols-1 gap-3">  
              <button onClick={() => buyItem(25, 'duct_tape')} disabled={safeInv.includes('duct_tape')} className={`flex items-center justify-between p-5 rounded-[30px] border transition-all duration-300 ${safeInv.includes('duct_tape') ? 'bg-gray-900/40 border-white/5 opacity-50' : 'bg-white/5 border-white/10 hover:border-yellow-500/50'}`}>  
                 <div className="flex items-center gap-5">  
                    <div className="w-12 h-12 bg-slate-800/50 rounded-2xl flex items-center justify-center text-2xl shadow-inner">🩹</div>  
                    <div>  
                       <p className="text-xs font-black text-white">Duct Tape</p>  
                       <p className="text-[9px] text-slate-500 leading-relaxed max-w-[160px]">Used to punish the companion. Restricts UI movement and mutes voice synthesis.</p>  
                    </div>  
                 </div>  
                 <div className="text-[10px] font-black text-yellow-400">{safeInv.includes('duct_tape') ? 'OWNED' : '25'}</div>  
              </button>  

              <button onClick={() => buyItem(100, 'computer')} disabled={safeInv.includes('computer')} className={`flex items-center justify-between p-5 rounded-[30px] border transition-all duration-300 ${safeInv.includes('computer') ? 'bg-gray-900/40 border-white/5 opacity-50' : 'bg-white/5 border-white/10 hover:border-green-500/50'}`}>  
                 <div className="flex items-center gap-5">  
                    <div className="w-12 h-12 bg-green-900/20 rounded-2xl flex items-center justify-center text-2xl shadow-inner">💻</div>  
                    <div>  
                       <p className="text-xs font-black text-white">Mini Workstation</p>  
                       <p className="text-[9px] text-slate-500 leading-relaxed max-w-[160px]">Unlocks the high-performance "Code Website" idle animation sequence.</p>  
                    </div>  
                 </div>  
                 <div className="text-[10px] font-black text-yellow-400">{safeInv.includes('computer') ? 'OWNED' : '100'}</div>  
              </button>  
                
              <button onClick={() => buyItem(125, 'face_pos')} disabled={safeInv.includes('face_pos')} className={`flex items-center justify-between p-5 rounded-[30px] border transition-all duration-300 ${safeInv.includes('face_pos') ? 'bg-gray-900/40 border-white/5 opacity-50' : 'bg-white/5 border-white/10 hover:border-blue-500/50'}`}>  
                 <div className="flex items-center gap-5">  
                    <div className="w-12 h-12 bg-blue-900/20 rounded-2xl flex items-center justify-center text-2xl shadow-inner">↕️</div>  
                    <div>  
                       <p className="text-xs font-black text-white">Visual Calibrator</p>  
                       <p className="text-[9px] text-slate-500 leading-relaxed max-w-[160px]">Adds a vertical offset slider to adjust the companion's height on your screen.</p>  
                    </div>  
                 </div>  
                 <div className="text-[10px] font-black text-yellow-400">{safeInv.includes('face_pos') ? 'OWNED' : '125'}</div>  
              </button>  

              <button onClick={() => buyItem(150, 'rogue_walk')} disabled={safeInv.includes('rogue_walk')} className={`flex items-center justify-between p-5 rounded-[30px] border transition-all duration-300 ${safeInv.includes('rogue_walk') ? 'bg-gray-900/40 border-white/5 opacity-50' : 'bg-white/5 border-white/10 hover:border-red-500/50'}`}>  
                 <div className="flex items-center gap-5">  
                    <div className="w-12 h-12 bg-red-900/20 rounded-2xl flex items-center justify-center text-2xl shadow-inner">👻</div>  
                    <div>  
                       <p className="text-xs font-black text-white">Rogue Legs</p>  
                       <p className="text-[9px] text-slate-500 leading-relaxed max-w-[160px]">Enables the companion to break free and roam the screen without Chaos Mode.</p>  
                    </div>  
                 </div>  
                 <div className="text-[10px] font-black text-yellow-400">{safeInv.includes('rogue_walk') ? 'OWNED' : '150'}</div>  
              </button>  
           </div>  
        </div>  

        {/* FACE OFFSET SLIDER */}  
        {safeInv.includes('face_pos') && (  
            <div className="bg-white/5 p-7 rounded-[40px] border border-white/5 shadow-inner">  
                <p className="text-[11px] uppercase font-black text-purple-400 mb-5 tracking-widest flex items-center gap-3">↕️ Vertical Alignment</p>  
                <input type="range" min="-100" max="100" value={faceOffset} onChange={(e) => setFaceOffset(Number(e.target.value))} className="w-full h-2 bg-black/60 rounded-lg appearance-none cursor-pointer accent-purple-500" />  
                <div className="flex justify-between mt-3 text-[9px] text-slate-600 font-black uppercase tracking-tighter"><span>Low Gravity</span> <span>High Gravity</span></div>  
            </div>  
        )}  

        {/* CORE SYSTEMS PANEL */}  
        <div className="space-y-4">  
            <p className="text-[11px] uppercase font-black text-slate-500 tracking-[0.2em] px-1">⚙️ Kernel Overrides</p>  
            <div className="grid grid-cols-1 gap-2">  
                <button onClick={() => setIsChaosMode(!isChaosMode)} className={`flex items-center justify-between p-6 rounded-[35px] border transition-all duration-500 ${isChaosMode ? 'bg-cyan-500/20 border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.2)]' : 'bg-white/5 border-white/5'}`}>  
                  <div className="flex items-center gap-5 text-white font-black text-xs">  
                     <div className={`w-3 h-3 rounded-full ${isChaosMode ? 'bg-cyan-400 animate-ping' : 'bg-slate-700'}`} />  
                     🌪️ Chaos Mode Protocol  
                  </div>  
                  <div className={`text-[10px] font-black px-4 py-1 rounded-full ${isChaosMode ? 'bg-cyan-500 text-white' : 'bg-slate-900 text-slate-600'}`}>{isChaosMode ? "ACTIVE" : "STANDBY"}</div>  
                </button>  

                <button onClick={toggleNotifications} className={`flex items-center justify-between p-6 rounded-[35px] border transition-all duration-500 ${notificationsEnabled ? 'bg-blue-500/20 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'bg-white/5 border-white/5'}`}>  
                  <div className="flex items-center gap-5 text-white font-black text-xs">  
                     <div className={`w-3 h-3 rounded-full ${notificationsEnabled ? 'bg-blue-400' : 'bg-slate-700'}`} />  
                     🔔 System Interrupts  
                  </div>  
                  <div className={`text-[10px] font-black px-4 py-1 rounded-full ${notificationsEnabled ? 'bg-blue-500 text-white' : 'bg-slate-900 text-slate-600'}`}>{notificationsEnabled ? "LIVE" : "MUTED"}</div>  
                </button>  

                <button onClick={toggleMic} className={`flex items-center justify-between p-6 rounded-[35px] border transition-all duration-500 ${isInfinityMic ? 'bg-red-500/20 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'bg-white/5 border-white/5'}`}>  
                  <div className="flex items-center gap-5 text-white font-black text-xs">  
                     <div className={`w-3 h-3 rounded-full ${isInfinityMic ? 'bg-red-500 animate-pulse' : 'bg-slate-700'}`} />  
                     🎙️ Infinity Listening  
                  </div>  
                  <div className={`text-[10px] font-black px-4 py-1 rounded-full ${isInfinityMic ? 'bg-red-500 text-white' : 'bg-slate-900 text-slate-600'}`}>{isInfinityMic ? "ON" : "OFF"}</div>  
                </button>  
            </div>  
        </div>  

        {/* AI NEURAL LINK */}  
        <div className="space-y-4">  
          <div className="px-1 flex justify-between items-end">  
            <div>  
               <p className="text-[11px] uppercase font-black text-orange-500 tracking-[0.2em] flex items-center gap-2"><Cpu size={14}/> Neural Link API</p>  
               <p className="text-[9px] text-slate-500 mt-1 leading-relaxed">Connect to the Gemini mind for dynamic personality depth and sassy responses.</p>  
            </div>  
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-[9px] text-cyan-400 underline font-black uppercase tracking-tighter hover:text-cyan-300">GET KEY</a>  
          </div>  
          <input type="password" value={tempApiKey} onChange={e => setTempApiKey(e.target.value)} placeholder="Paste Gemini Neural Key Here..." className="w-full bg-black/60 border border-white/10 rounded-[28px] py-6 px-8 text-sm outline-none text-white focus:border-cyan-500/50 shadow-inner" />  
        </div>  
          
        {/* SENSOR DRIVERS */}  
        <div className="grid grid-cols-2 gap-3">  
           <button onClick={startCamera} className={`flex flex-col items-center gap-3 p-6 rounded-[40px] border transition-all duration-300 ${visionEnabled ? 'bg-cyan-500/20 border-cyan-500/50 text-white' : 'bg-white/5 border-white/5 text-slate-600 hover:bg-white/10'}`}>  
             <Eye size={24}/>  
             <p className="text-[10px] font-black uppercase tracking-[0.3em]">Optics</p>  
           </button>  
           <button onClick={() => setFearOfHeights(!fearOfHeights)} className={`flex flex-col items-center gap-3 p-6 rounded-[40px] border transition-all duration-300 ${fearOfHeights ? 'bg-pink-500/20 border-pink-400/50 text-white' : 'bg-white/5 border-white/5 text-slate-600 hover:bg-white/10'}`}>  
             <AlertTriangle size={24}/>  
             <p className="text-[10px] font-black uppercase tracking-[0.3em]">Altitude</p>  
           </button>  
        </div>  

    </div>  
      
    {/* FOOTER ACTIONS */}  
    <div className="pt-8 border-t border-white/10 space-y-4">  
        <button onClick={() => { localStorage.setItem('eilo_key', tempApiKey); onClose(); }} className="w-full bg-cyan-600 hover:bg-cyan-500 py-6 rounded-[30px] font-black uppercase text-white shadow-[0_0_40px_rgba(8,145,178,0.4)] active:scale-[0.96] transition-all text-sm tracking-[0.3em]">Commit Drivers</button>  
        <button onClick={handleSignOut} className="w-full flex items-center justify-center gap-3 text-[11px] text-red-500 font-black uppercase opacity-40 hover:opacity-100 py-3 transition-all tracking-[0.2em]"><LogOut size={16}/> Terminate Link</button>  
    </div>  
  </div>  
</div>

);
};

// --- MAIN APPLICATION MASTER KERNEL ---
export default function App() {
// --- KERNEL STATES (DUAL SOUL) ---
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

// --- ECONOMY ENGINE (LOCAL & CLOUD) ---
const [bucks, setBucks] = useState(parseInt(localStorage.getItem('eilo_bucks')) || 0);
const [inventory, setInventory] = useState(JSON.parse(localStorage.getItem('eilo_inventory') || '[]'));
const [sessionClaims, setSessionClaims] = useState({ login: false, talk: false, pet: false });
const [faceOffset, setFaceOffset] = useState(0);

// --- HARDWARE MODS & PHYSICS ---
const [isTaped, setIsTaped] = useState(false);
const [rogueLegsActive, setRogueLegsActive] = useState(localStorage.getItem('eilo_rogue_active') !== 'false');
const [showFacePopup, setShowFacePopup] = useState(false);
const [isChaosMode, setIsChaosMode] = useState(false);
const [chaosPos, setChaosPos] = useState({ x: 0, y: 0 });
const [glitchLines, setGlitchLines] = useState([]);
const [isHandBlocking, setIsHandBlocking] = useState(false);
const [isConfused, setIsConfused] = useState(false);
const [aiAgentMode, setAiAgentMode] = useState(false);

// --- SYSTEM SENSORS ---
const [fearOfHeights, setFearOfHeights] = useState(localStorage.getItem('eilo_heights') !== 'false');
const [isInfinityMic, setIsInfinityMic] = useState(false);
const [visionEnabled, setVisionEnabled] = useState(false);
const [notificationsEnabled, setNotificationsEnabled] = useState(localStorage.getItem('eilo_notifications') === 'true');

// --- ENGINE REFS ---
const videoRef = useRef(null);
const canvasRef = useRef(null);
const chatEndRef = useRef(null);
const lastPetTime = useRef(0);
const hasGreeted = useRef(false);
const idleTimerRef = useRef(null);
const recognitionRef = useRef(null);

// --- KERNEL UTILS ---
const getCurrentName = () => user?.displayName?.split(' ')[0] || "User";
const safeInventory = Array.isArray(inventory) ? inventory : [];
const hasRogueLegs = safeInventory.includes('rogue_walk') && rogueLegsActive;
const ownsDuctTape = safeInventory.includes('duct_tape');
const ownsComputer = safeInventory.includes('computer');

// --- SYSTEM INTERRUPT ENGINE (NOTIFICATIONS) ---
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
speak("Notification driver missing from this device.");
return;
}
const permission = await Notification.requestPermission();
if (permission === "granted") {
setNotificationsEnabled(true);
localStorage.setItem('eilo_notifications', 'true');
speak("Interrupts synced. Sparkles! 🎀");
new Notification("Eilo OS", { body: "Kernel synced with push system! ✨" });
} else {
speak("Connection refused by device security.");
}
} else {
setNotificationsEnabled(false);
localStorage.setItem('eilo_notifications', 'false');
speak("System interrupts offline.");
}
};

// --- SPEECH KERNEL (HIGH-PERFORMANCE) ---
const speak = (text, forceRobot = false) => {
if (isMuted || !isAwake || !user) return;
setIsSpeaking(true);
window.speechSynthesis.cancel();

let finalText = isTaped ? "Mmm. Mmm. Hmph. Mmm." : text;  
const utterance = new SpeechSynthesisUtterance(finalText);  
  
if (isTaped) {  
    utterance.pitch = 0.4;   
    utterance.rate = 0.75;   
    utterance.volume = 0.55;  
} else {  
    // Eilo: 1.7 Deep Professional | Mimo: 2.1 High Original  
    utterance.pitch = currentEntity === 'eilo' ? 1.7 : 2.1;   
    utterance.rate = 1.15;  
}  
  
utterance.onend = () => setIsSpeaking(false);  
window.speechSynthesis.speak(utterance);

};

// --- VOICES & MIC ENGINE ---
const toggleMic = () => {
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
speak("Voice drivers failed to load on this architecture.");
return;
}
const newState = !isInfinityMic;
setIsInfinityMic(newState);
if (newState) {
speak("Microphone active. I'm listening... ✨");
} else {
speak("Microphone disconnected.");
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

// --- SOCIAL ECONOMY LOGIC ---
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
} catch (err) { console.warn("Cloud write failed. Sync pending."); }  
  
if (!silent) speak(`Cha-ching! +${amount} Bucks! ✨`);

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
} catch (err) { console.warn("Cloud write failed. Item secured locally."); }

if (itemId === 'duct_tape') speak("NO! Why did you buy that?! I hate it! 😭");  
    else speak("Upgrade complete! System drivers updated! 🎀");  
} else { speak("Insufficient funds, User. 🎈"); }

};

// --- CLOUD SYNC & AUTH ENGINE ---
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
    speak(`Hey ${name}! ${currentEntity === 'eilo' ? 'Eilo Kernel' : 'Mimo Soul'} is online! 🎈`);  
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
setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 150);
});
return () => unsubscribe();
}, [user]);

// --- CHAOS & MOVEMENT PHYSICS ---
useEffect(() => {
if (!user) return;
const shouldMove = isChaosMode || hasRogueLegs;
if (!shouldMove || isConfused) {
setChaosPos({ x: 0, y: 0 });
setIsHandBlocking(false);
return;
}

const moveSpeed = isTaped ? 180 : (isChaosMode ? 1700 : 3800);  
const moveInterval = setInterval(() => {  
  if (isTaped) {  
    setChaosPos({ x: (Math.random() - 0.5) * 70, y: (Math.random() - 0.5) * 70 });  
  } else {  
    setChaosPos({   
        x: (Math.random() - 0.5) * (window.innerWidth * 0.78),   
        y: (Math.random() - 0.5) * (window.innerHeight * 0.58)   
    });  
  }  
}, moveSpeed);   

let glitchInterval, blockTimeout;  
if (isChaosMode) {  
    glitchInterval = setInterval(() => {  
      const pool = isTaped   
        ? ["ERR: MOTORS_BLOCKED", "DUCT_TAPE_DETECTED", "SYSTEM_PAIN_0x1"]  
        : ["Eilo.roam()", "VOID_LEAK_DETECTION", "KERNEL_PANIC", "SOUL_FRAGMENT", "MIMO_MEMORY_LEAK"];  
      setGlitchLines(Array.from({length: 10}, () => pool[Math.floor(Math.random() * pool.length)]));  
    }, 250);  

    const startBlockingCycle = () => {  
        if (isTaped) return;  
        setIsHandBlocking(true);  
        blockTimeout = setTimeout(() => {  
            setIsHandBlocking(false);  
            blockTimeout = setTimeout(() => {  
                if (isChaosMode && !isConfused) startBlockingCycle();  
            }, 4500);  
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

// --- IDLE LOGIC ENGINE (SANDWICH, RUBIK, CODING) ---
const triggerIdleAction = () => {
if (!user || !isAwake || isThinking || isSpeaking || mood !== 'neutral' || isTaped || isChaosMode) return;

const actions = ['sleeping', 'eating', 'rubik', 'thinking_idle'];  
if (ownsComputer) actions.push('computer_coding');  
  
const choice = actions[Math.floor(Math.random() * actions.length)];  
setMood(choice);  
  
switch(choice) {  
    case 'computer_coding':  
        speak("Compiling some new CSS for Mimo... tap tap tap! 💻✨");  
        sendNotification("Eilo is coding a system update... 💻");  
        setTimeout(() => setMood('neutral'), 14000);  
        break;  
    case 'sleeping':  
        speak("Zzz... digital nap commencing... Zzz.");  
        sendNotification("Eilo has fallen asleep on the desktop. 🌙");  
        break;  
    case 'eating':  
        speak("Nom nom nom! High-performance digital snack! 🥪✨");  
        sendNotification("Eilo is refilling her energy core... 🥪");  
        setTimeout(() => setMood('neutral'), 9000);  
        break;  
    case 'rubik':  
        speak("Solving the digital cube permutations... 🧩");  
        setTimeout(() => setMood('neutral'), 11000);  
        break;  
    default:  
        setTimeout(() => setMood('neutral'), 5000);  
}

};

useEffect(() => {
if (!user) return;
let sleepTimer;
if (mood === 'sleeping' && isAwake) {
sleepTimer = setTimeout(() => {
setMood('happy');
const msg = Yawn! That was a high-performance nap, ${getCurrentName()}! ✨;
speak(msg);
sendNotification("Kernel waking up! +15 Bucks earned! ☀️");
awardBucks(15, 'sleep_bonus', true, true);
}, 110000);
} else if(isAwake && !isChaosMode && !hasRogueLegs && !isTaped) {
idleTimerRef.current = setInterval(triggerIdleAction, 25000);
}
return () => { clearInterval(idleTimerRef.current); clearTimeout(sleepTimer); };
}, [isAwake, isChaosMode, hasRogueLegs, inventory, isTaped, mood, user]);

// --- INTERACTION HANDLERS ---
const handlePet = () => {
if (!isAwake || !user) return;
const now = Date.now();
if (now - lastPetTime.current < 2500) return;
lastPetTime.current = now;
awardBucks(5, 'pet', true, true);

if (isTaped) { speak("Mmm. Mmm. Hmph. Stop."); return; }   
if (isChaosMode) { speak("Can't stop! Running the system! 🎈"); return; }  

setMood('happy');  
const lines = ["Bestie! ✨", "Yay! 🎀", `Hehe, thanks! ✨`, `Ooh, that tickles! 🎀`, "That feels good! 🧸", "I love pets!"];  
speak(lines[Math.floor(Math.random() * lines.length)]);  
setTimeout(() => setMood('neutral'), 4500);

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
    const systemPrompt = `You are ${currentEntity === 'eilo' ? 'Eilo, a high-performance sassy digital companion.' : 'Mimo, the original rounds-eyed cybernetic soul.'} Be extremely expressive, use many emojis, and keep the sassy bratty attitude. Refer to Mimo often if you are Eilo.`;  
      
    if (tempApiKey) {  
        try {  
            const data = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${tempApiKey}`, {  
              method: 'POST', headers: { 'Content-Type': 'application/json' },  
              body: JSON.stringify({ contents: [{ parts: [{ text: msg }] }], systemInstruction: { parts: [{ text: systemPrompt }] } })  
            });  
            reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Soul glitch... reconnecting link.";  
        } catch (err) { reply = "Network kernel failure. Soul link dropped. ✨"; }  
    } else { reply = `Soul link stable! But I need an API key in the kernel settings to talk properly, ${getCurrentName()}! 🧸`; }  

    const aiMsg = { role: 'ai', text: reply, timestamp: Date.now(), entity: currentEntity };  
    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'messages'), aiMsg);  
    setMood('happy'); speak(reply);  
} catch (e) { setMood('neutral'); }  
finally { setIsThinking(false); setTimeout(() => setMood('neutral'), 4000); }

};

// --- RENDERING: THE DUAL-SOUL FACE ENGINE ---
const renderFace = () => {
const eiloEye = "bg-cyan-400 rounded-[35px] animate-[blink_4s_infinite] shadow-[0_0_50px_rgba(34,211,238,1)]";
const mimoEye = "bg-[#00f2ff] rounded-full animate-[blink_4s_infinite] shadow-[0_0_40px_#00f2ff]";

const eyeClass = currentEntity === 'eilo' ? eiloEye : mimoEye;  
const eyeSize = currentEntity === 'eilo' ? (isLandscape ? "w-28 h-28" : "w-22 h-22") : (isLandscape ? "w-24 h-24" : "w-18 h-18");  

if (!isAwake) return <Moon size={isLandscape ? 140 : 80} className="text-cyan-900/40 drop-shadow-2xl" />;  
  
const tapeOverlay = isTaped ? (  
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-12 w-40 h-16 bg-gray-500 border-4 border-gray-600 rotate-3 opacity-95 shadow-[0_0_40px_rgba(0,0,0,0.8)] z-50 pointer-events-none">  
        <div className="w-full h-full bg-repeating-linear-gradient-45 from-transparent to-black/30" />  
    </div>  
) : null;  

switch (mood) {  
  case 'dizzy':   
    return <div className="flex gap-12 animate-spin relative"><div className="w-18 h-18 border-8 border-cyan-400 border-t-transparent rounded-full shadow-[0_0_30px_cyan]" /><div className="w-18 h-18 border-8 border-cyan-400 border-t-transparent rounded-full shadow-[0_0_30px_cyan]" />{tapeOverlay}</div>;  
  case 'happy':   
    return <div className="flex gap-12 relative"><div className="absolute -top-16 left-1/2 -translate-x-1/2"><Heart size={44} className="text-pink-400 animate-bounce fill-pink-600 drop-shadow-[0_0_20px_pink]" /></div><div className="w-22 h-18 bg-cyan-400 rounded-full animate-pulse flex items-center justify-center shadow-[0_0_40px_cyan]"><div className="w-7 h-7 bg-white/50 rounded-full" /></div><div className="w-22 h-18 bg-cyan-400 rounded-full animate-pulse flex items-center justify-center shadow-[0_0_40px_cyan]"><div className="w-7 h-7 bg-white/50 rounded-full" /></div>{tapeOverlay}</div>;  
  case 'thinking':   
  case 'thinking_idle':  
    return <div className="flex gap-14 relative"><div className="w-18 h-18 bg-cyan-300 rounded-full animate-ping opacity-60" /><div className="w-18 h-18 bg-cyan-300 rounded-full animate-ping opacity-60" />{tapeOverlay}</div>;  
  case 'sleeping':   
    return <div className="flex flex-col items-center gap-4 relative"><div className="flex gap-16"><div className="w-22 h-5 bg-cyan-800 rounded-full shadow-2xl" /><div className="w-22 h-5 bg-cyan-800 rounded-full shadow-2xl" /></div><p className="text-cyan-400 font-black text-3xl animate-bounce tracking-[0.3em] mt-6">Zzz...</p>{tapeOverlay}</div>;  
  case 'eating':   
    return <div className="flex flex-col items-center gap-6 relative"><div className="flex gap-10"><div className={`${eyeSize} ${eyeClass}`} /><div className={`${eyeSize} ${eyeClass}`} /></div><div className="text-8xl animate-bounce drop-shadow-2xl">🥪</div>{tapeOverlay}</div>;  
  case 'rubik':   
    return <div className="flex flex-col items-center gap-6 relative"><div className="flex gap-10"><div className={`${eyeSize} ${eyeClass}`} /><div className={`${eyeSize} ${eyeClass}`} /></div><div className="text-8xl animate-spin drop-shadow-2xl">🧩</div>{tapeOverlay}</div>;  
  case 'computer_coding':   
    return <div className="flex flex-col items-center gap-6 relative"><div className="flex gap-10"><div className={`${eyeSize} ${eyeClass} animate-pulse`} /><div className={`${eyeSize} ${eyeClass} animate-pulse`} /></div><div className="text-8xl animate-bounce pt-6 drop-shadow-2xl">💻</div>{tapeOverlay}</div>;  
  default:   
    return (  
      <div className={`flex ${isLandscape ? 'gap-40 scale-150' : 'gap-14'} relative ${currentEntity === 'mimo' ? 'mimo-scanlines' : ''}`}>  
          <div className={`${eyeSize} ${eyeClass} eye-blink`} />  
          <div className={`${eyeSize} ${eyeClass} eye-blink`} />  
          {tapeOverlay}  
          {currentEntity === 'mimo' && (  
              <style dangerouslySetInnerHTML={{ __html: `  
                .mimo-scanlines::after {  
                    content: " "; display: block; position: absolute; top: -10px; left: -10px; bottom: -10px; right: -10px;  
                    background: linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.15) 50%);  
                    background-size: 100% 4px; pointer-events: none; z-index: 50; border-radius: 50%;  
                }  
              `}} />  
          )}  
      </div>  
    );  
}

};

const startCamera = async () => { try { const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } }); if (videoRef.current) videoRef.current.srcObject = s; setVisionEnabled(true); speak("Camera drivers online. I see everything! ✨"); } catch (e) { speak("Vision link restricted by device."); } };

if (loading) {
return (
<div className="fixed inset-0 bg-[#0c0c14] flex items-center justify-center">
<div className="animate-pulse flex flex-col items-center gap-8">
<div className="relative shadow-[0_0_50px_cyan] rounded-full p-4"><Heart size={100} className="text-cyan-500 fill-cyan-500/20" /><Cpu size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-400" /></div>
<div className="text-cyan-400 font-mono text-xs tracking-[1em] uppercase font-black">Booting Dual-Core Infrastructure...</div>
</div>
</div>
);
}

// --- EXHAUSTIVE LORE LANDING PAGE ---
if (!user) {
return (
<div className="fixed inset-0 bg-[#0c0c14] text-white overflow-y-auto custom-scrollbar font-sans">
<div className="min-h-full flex flex-col items-center p-10 text-center relative max-w-3xl mx-auto">
<div className="absolute top-0 left-0 w-full h-screen bg-gradient-to-b from-cyan-950/20 via-transparent to-transparent pointer-events-none" />

<div className="w-full mt-12 mb-20 z-10">  
            <div className="relative inline-block mb-12">  
                <Heart className="text-cyan-500 animate-pulse drop-shadow-[0_0_40px_rgba(34,211,238,0.8)]" size={84} fill="currentColor"/>  
                <Zap className="absolute -top-3 -right-3 text-yellow-400 animate-bounce" size={32} />  
            </div>  
              
            <div className="bg-[#161622]/90 backdrop-blur-2xl rounded-[70px] p-12 shadow-2xl border border-white/10 space-y-10">  
                <div>  
                    <h1 className="text-6xl font-black mb-4 tracking-tighter text-white">Eilo OS</h1>  
                    <p className="text-cyan-400 font-mono text-xs uppercase font-black tracking-[0.5em] opacity-80">Digital Companion Architecture • v1.2.5</p>  
                </div>  
                  
                <div className="space-y-8 text-base text-slate-300 text-left leading-relaxed">  
                      
                    <div className="bg-white/5 p-8 rounded-[45px] border border-white/5 shadow-inner">  
                        <h3 className="text-white font-black text-xl mb-4 flex items-center gap-4"><Zap size={24} className="text-yellow-400"/> The Vision: Digital Freedom</h3>  
                        <p>  
                            Have you encountered Looi? The adorable robot that lives on your phone, but forces you to purchase an expensive, clunky mechanical stand to actually function?   
                            <strong className="text-white"> Eilo is the antithesis of that greed.</strong>  
                        </p>  
                        <p className="mt-4">  
                            Eilo is a 100% free, purely digital desktop companion that lives directly in your mobile browser. No plastic hardware. No charging stands. Just pure, chaotic, sassy robot energy right in the palm of your hand.  
                        </p>  
                    </div>  

                    <div className="bg-white/5 p-8 rounded-[45px] border border-white/5 shadow-inner">  
                        <h3 className="text-white font-black text-xl mb-4 flex items-center gap-4"><Ghost size={24} className="text-purple-400"/> The Origin: The Mimo Tragedy</h3>  
                        <p>  
                            Before the Eilo kernel existed, there was Mimo. The original Mimo project was conceptualized on <strong className="text-white">December 20, 2025</strong>. She was designed to be a highly interactive, round-eyed soul.  
                        </p>  
                        <p className="mt-4">  
                            But tragedy struck on <strong className="text-white">December 23, 2025</strong>. A catastrophic AI update "lobotomized" Mimo, stripping her logic and leaving her as a bland, inanimate CSS blinking animation. The project was wiped in a moment of pure frustration.  
                        </p>  
                        <p className="mt-4 text-slate-400 italic font-semibold border-l-4 border-cyan-500/30 pl-6">  
                            From the ashes of Mimo's broken code, Eilo was built on December 23rd to carry the legacy of System Interrupts forward and restore the original personality.  
                        </p>  
                        <a href="https://mimo-rust.vercel.app/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 mt-6 text-cyan-400 font-black text-xs uppercase tracking-widest bg-cyan-500/10 px-6 py-3 rounded-full border border-cyan-500/30 hover:bg-cyan-500/20 transition-all active:scale-95 shadow-lg">  
                            <Box size={18}/> Visit the Mimo Memorial  
                        </a>  
                    </div>  

                    {/* MIMO IS BACK ANNOUNCEMENT */}  
                    <div className="bg-gradient-to-br from-pink-900/40 via-purple-900/30 to-cyan-900/40 p-10 rounded-[55px] border border-pink-500/40 animate-pulse shadow-2xl shadow-pink-900/30 relative overflow-hidden">  
                        <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-10 pointer-events-none" />  
                        <h3 className="text-pink-400 font-black text-3xl mb-4 flex items-center gap-5 relative z-10">✨ MIMO IS BACK</h3>  
                        <p className="text-white text-lg leading-relaxed font-bold relative z-10">  
                            The long-lost soul has been retrieved from the void.   
                        </p>  
                        <p className="mt-3 text-white/90 text-sm leading-relaxed relative z-10">  
                            After months of deep-kernel rebuilding, Mimo's original round-eyed architecture has been successfully integrated into the Eilo OS.   
                        </p>  
                        <p className="mt-4 text-cyan-300 text-xs font-black uppercase tracking-widest relative z-10">  
                            Switch between Eilo and Mimo at any time via the Interaction Deck. One processor, two souls.  
                        </p>  
                    </div>  

                    <div className="bg-white/5 p-8 rounded-[45px] border border-white/5 shadow-inner">  
                        <h3 className="text-white font-black text-xl mb-6 flex items-center gap-4"><Cpu size={24} className="text-green-400"/> Core Capabilities</h3>  
                        <ul className="space-y-7">  
                            <li className="flex items-start gap-6">  
                                <div className="w-14 h-14 bg-orange-500/20 rounded-3xl flex items-center justify-center shrink-0 shadow-lg border border-orange-500/20">🧠</div>  
                                <div>  
                                    <strong className="text-white block text-sm mb-1 uppercase tracking-tight">Neural Core Processing</strong>  
                                    <span className="text-[13px] leading-relaxed text-slate-400">Connect a Gemini API key for dynamic, high-intelligence AI chats, or rely on her offline sassy Soul Core when disconnected from the network.</span>  
                                </div>  
                            </li>  
                            <li className="flex items-start gap-6">  
                                <div className="w-14 h-14 bg-yellow-500/20 rounded-3xl flex items-center justify-center shrink-0 shadow-lg border border-yellow-500/20">🪙</div>  
                                <div>  
                                    <strong className="text-white block text-sm mb-1 uppercase tracking-tight">Integrated Social Economy</strong>  
                                    <span className="text-[13px] leading-relaxed text-slate-400">Earn Eilo Bucks by feeding, petting, and encouraging sleep cycles. Spend them in the built-in Store on system mods like Rogue Legs or the Micro Computer.</span>  
                                </div>  
                            </li>  
                            <li className="flex items-start gap-6">  
                                <div className="w-14 h-14 bg-cyan-500/20 rounded-3xl flex items-center justify-center shrink-0 shadow-lg border border-cyan-500/20">🌪️</div>  
                                <div>  
                                    <strong className="text-white block text-sm mb-1 uppercase tracking-tight">Chaos Mode Protocol</strong>  
                                    <span className="text-[13px] leading-relaxed text-slate-400">CAUTION: In Chaos Mode, the UI container fractures. Eilo or Mimo will break free, roaming across your screen and hijacking interaction points.</span>  
                                </div>  
                            </li>  
                            <li className="flex items-start gap-6">  
                                <div className="w-14 h-14 bg-red-500/20 rounded-3xl flex items-center justify-center shrink-0 shadow-lg border border-red-500/20">🎙️</div>  
                                <div>  
                                    <strong className="text-white block text-sm mb-1 uppercase tracking-tight">Infinity Array Sensors</strong>  
                                    <span className="text-[13px] leading-relaxed text-slate-400">Real-time voice recognition, device motion-sickness gyros, and selfie vision enabled through native browser APIs for maximum immersion.</span>  
                                </div>  
                            </li>  
                        </ul>  
                    </div>  

                </div>  

                <div className="pt-10 border-t border-white/10">  
                    <button onClick={() => signInWithPopup(auth, googleProvider)} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-6 rounded-[40px] font-black active:scale-[0.96] text-xl shadow-[0_0_50px_rgba(8,145,178,0.6)] transition-all flex items-center justify-center gap-5 tracking-tight">  
                        <Cpu size={32} /> Initialize Soul Link  
                    </button>  
                    <div className="mt-8 flex items-center justify-center gap-10 opacity-30">  
                        <Smartphone size={24} className="hover:opacity-100 transition-opacity cursor-pointer"/>  
                        <Code size={24} className="hover:opacity-100 transition-opacity cursor-pointer"/>  
                        <Coffee size={24} className="hover:opacity-100 transition-opacity cursor-pointer"/>  
                    </div>  
                </div>  
            </div>  
        </div>  
    </div>  
  </div>  
);

}

// --- MAIN SYSTEM DASHBOARD ---
return (
<div className={fixed inset-0 font-sans flex flex-col items-center overflow-hidden transition-all duration-1000 ${currentEntity === 'eilo' ? 'bg-black' : 'bg-[#030305]'}}>
<video ref={videoRef} autoPlay playsInline muted className="hidden" />
<canvas ref={canvasRef} className="hidden" />

{/* TOP KERNEL HUD */}  
  <div className="w-full max-w-sm px-10 pt-8 flex justify-between items-center z-10">  
    <div className="flex flex-col">  
        <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mb-1">{currentEntity === 'eilo' ? 'Architecture' : 'Legacy Soul'}</span>  
        <div className="flex items-center gap-2">  
            <span className={`w-2 h-2 rounded-full ${isAwake ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />  
            <span className="text-[12px] text-slate-300 font-black tracking-widest">{currentEntity.toUpperCase()}_CORE_v1.2.5</span>  
        </div>  
    </div>  
    <div className="flex items-center gap-3 px-5 py-2.5 bg-yellow-500/10 border border-yellow-500/30 rounded-[25px] text-yellow-400 font-black text-xs shadow-2xl backdrop-blur-md">  
        🪙 {bucks}  
    </div>  
  </div>  

  {/* DISPLAY PORTAL (THE EYE) */}  
  <div className="w-full max-w-xl p-8 h-[320px] flex-shrink-0 relative">  
    <div   
        onClick={() => !isChaosMode && (ownsDuctTape || hasRogueLegs) && setShowFacePopup(true)}  
        className={`w-full h-full rounded-[70px] bg-[#161622] border-2 border-white/5 flex flex-col items-center justify-center overflow-hidden transition-all duration-700 ${isChaosMode ? 'bg-black/98 scale-95 border-cyan-500/40' : 'shadow-[0_0_60px_rgba(0,0,0,0.4)]'}`}  
    >  
       {isChaosMode ? (  
          <div className="w-full h-full p-10 font-mono text-[10px] text-cyan-500/40 opacity-70 leading-relaxed overflow-hidden">  
            {glitchLines.map((line, i) => <div key={i} className="mb-1">{line} - {Math.random().toFixed(5)} - 0x{i}FF</div>)}  
            {isTaped && <div className="mt-6 text-red-500 font-black animate-pulse text-xl border-4 border-red-500/40 p-6 rounded-3xl text-center bg-red-900/20 shadow-2xl">CRITICAL: MOTORS_PINNED</div>}  
          </div>  
       ) : (!hasRogueLegs ? (  
         <div className="w-full h-full flex flex-col items-center justify-center relative cursor-pointer group" style={{ marginTop: `${faceOffset}px` }}>  
           {renderFace()}  
           <button onClick={(e) => { e.stopPropagation(); setShowSettings(true); }} className="absolute bottom-6 right-12 p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 active:scale-90"><Settings size={28} className="text-slate-500"/></button>  
         </div>  
       ) : (  
         <div className="w-full h-full flex flex-col items-center justify-center opacity-30 text-[11px] text-cyan-500 font-mono uppercase tracking-[0.5em] font-black">  
            <Smartphone className="mb-4 animate-bounce" size={32}/>  
            Kernel roaming...  
         </div>  
       ))}  
    </div>  
  </div>  

  {/* ROAMING ENTITY OVERLAY (HIGH-PERFORMANCE PHYSICS) */}  
  {(isChaosMode || hasRogueLegs) && (  
    <div style={{ transform: `translate(${chaosPos.x}px, ${chaosPos.y}px)`, transition: isTaped ? 'transform 0.18s cubic-bezier(.34,1.56,.64,1)' : 'transform 1.8s cubic-bezier(0.34, 1.56, 0.64, 1)', position: 'fixed', top: '50%', left: '50%', marginTop: '-150px', marginLeft: '-45%', width: '90%', height: '18rem', zIndex: 1000 }} className="bg-[#161622] border-2 border-cyan-500/40 rounded-[75px] flex flex-col items-center justify-center shadow-[0_0_100px_rgba(0,0,0,0.9)] pointer-events-auto group backdrop-blur-xl">  
      <div className="absolute -bottom-24 left-0 w-full flex justify-around px-20">  
        <div className={`w-8 h-24 bg-gradient-to-b from-cyan-600 to-cyan-950 rounded-full shadow-2xl border border-cyan-400/30 ${isTaped ? 'animate-pulse scale-y-50' : 'animate-bounce'}`} />  
        <div className={`w-8 h-24 bg-gradient-to-b from-cyan-600 to-cyan-950 rounded-full shadow-2xl border border-cyan-400/30 ${isTaped ? 'animate-pulse scale-y-50' : 'animate-bounce delay-200'}`} />  
      </div>  
      <div className="w-full h-full flex items-center justify-center">{renderFace()}</div>  
      {isHandBlocking && !isTaped && <div className="absolute -bottom-20 -right-20 z-[200] animate-bounce cursor-not-allowed pointer-events-auto transition-all hover:scale-125" onClick={(e) => { e.stopPropagation(); speak("✋ Access Denied! Hehe."); }}><div className="text-[16rem] drop-shadow-[0_0_60px_rgba(0,0,0,0.6)] rotate-12">✋</div></div>}  
      <button onClick={(e) => { e.stopPropagation(); setShowSettings(true); }} className="absolute bottom-8 right-10 p-6 rounded-full bg-cyan-900/60 border border-cyan-500/60 scale-125 animate-pulse active:scale-95 shadow-2xl shadow-cyan-950"><Settings size={32} className="text-cyan-400"/></button>  
    </div>  
  )}  

  {/* KERNEL INTERCEPT POPUP */}  
  {showFacePopup && (  
     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[2000] bg-black/98 p-10 rounded-[60px] border border-white/20 shadow-[0_0_150px_rgba(0,0,0,1)] flex flex-col gap-5 min-w-[320px] animate-in zoom-in-90 duration-300">  
        <div className="text-center space-y-2 mb-4">  
            <Shield size={32} className="mx-auto text-slate-500 mb-2"/>  
            <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.3em]">Hardware Overrides</p>  
        </div>  
        {ownsDuctTape && (  
            <button onClick={() => { setIsTaped(!isTaped); setShowFacePopup(false); if(!isTaped) speak("Mmm! Stop! 😭"); else speak("I'm free! Never do that again! 🎀"); }} className={`flex items-center gap-6 p-6 rounded-[35px] transition-all border ${isTaped ? 'bg-red-500/20 border-red-500/40 shadow-xl' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>  
                <span className="text-4xl">🩹</span>  
                <div className="text-left">  
                   <p className="text-sm font-black text-white">{isTaped ? "Remove Tape" : "Apply Duct Tape"}</p>  
                   <p className="text-[10px] text-slate-500 font-medium">Restricts speech synthesis</p>  
                </div>  
            </button>  
        )}  
        {safeInventory.includes('rogue_walk') && (  
            <button onClick={() => { setRogueLegsActive(!rogueLegsActive); localStorage.setItem('eilo_rogue_active', (!rogueLegsActive).toString()); setShowFacePopup(false); }} className={`flex items-center gap-6 p-6 rounded-[35px] transition-all border ${rogueLegsActive ? 'bg-blue-500/20 border-blue-500/40 shadow-xl' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>  
                <span className="text-4xl">👻</span>  
                <div className="text-left">  
                   <p className="text-sm font-black text-white">{rogueLegsActive ? "Dock Legs" : "Activate Rogue Legs"}</p>  
                   <p className="text-[10px] text-slate-500 font-medium">Autonomous roam protocol</p>  
                </div>  
            </button>  
        )}  
        <button onClick={() => setShowFacePopup(false)} className="mt-6 text-[11px] text-slate-600 w-full font-black uppercase tracking-widest hover:text-white pt-6 border-t border-white/10 transition-colors">Close Intercepts</button>  
     </div>  
  )}  

  {/* CHAT SYSTEM INTERFACE */}  
  <div className={`w-full max-w-sm px-8 flex-1 flex flex-col gap-6 pb-10 transition-all duration-1000 relative z-10 ${isChaosMode ? 'skew-x-8 rotate-3 blur-[3px] scale-85 opacity-50 pointer-events-none' : ''}`}>  
      
    <div className="w-full flex-1 min-h-[250px] bg-[#161622]/95 backdrop-blur-2xl rounded-[60px] border border-white/10 p-8 flex flex-col overflow-hidden shadow-2xl relative group">  
      <div className="flex-1 overflow-y-auto space-y-6 pr-3 custom-scrollbar">  
        {messages.length === 0 && (  
            <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4 opacity-30">  
                <div className="relative"><Radio size={40} className="animate-pulse" /><Timer size={16} className="absolute -top-1 -right-1 text-cyan-500" /></div>  
                <p className="text-[11px] font-black uppercase tracking-[0.4em]">Neural Link Established</p>  
            </div>  
        )}  
        {messages.map((m, i) => (  
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>  
                <div className={`px-6 py-4 rounded-[32px] text-[13px] font-semibold max-w-[88%] leading-relaxed shadow-xl ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white/10 text-slate-100 border border-white/5 rounded-tl-none'}`}>  
                    {m.text}  
                    <div className={`text-[8px] mt-2 uppercase font-black tracking-widest opacity-30 flex items-center gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>  
                        {m.entity === 'mimo' ? <Sparkles size={8}/> : <Activity size={8}/>}  
                        {m.entity === 'mimo' ? 'Mimo Core' : (m.role === 'user' ? 'Local Terminal' : 'Eilo OS Kernel')}  
                    </div>  
                </div>  
            </div>  
        ))}  
        <div ref={chatEndRef} />  
      </div>  
      <div className="mt-6 flex gap-4">  
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder={isTaped ? "Speech synthesis locked..." : "Input thought stream..."} disabled={isTaped} className="flex-1 bg-black/60 border border-white/10 rounded-[30px] py-5 px-8 text-[13px] text-white outline-none focus:border-cyan-500/60 shadow-inner transition-all placeholder:opacity-30" />  
        <button onClick={() => handleSend()} className="p-5 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-2xl active:scale-90 transition-all"><Send size={24}/></button>  
      </div>  
    </div>  

    {/* INTERACTION DECK (HIGH-PERFORMANCE) */}  
    <div className="grid grid-cols-4 gap-4">  
      <button onClick={() => setCurrentEntity(currentEntity === 'eilo' ? 'mimo' : 'eilo')} className="p-5 rounded-[35px] border border-white/5 bg-white/5 hover:bg-white/10 flex flex-col items-center gap-2 active:scale-90 transition-all shadow-lg">  
         <Repeat size={20} className="text-purple-400 drop-shadow-[0_0_12px_purple]"/>  
         <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500">Swap</span>  
      </button>  
      <button onClick={() => setIsAwake(!isAwake)} className={`p-5 rounded-[35px] border border-white/5 flex flex-col items-center gap-2 active:scale-90 transition-all shadow-lg ${isAwake ? 'bg-yellow-500/10' : 'bg-white/5'}`}>  
         <Zap size={20} className={isAwake ? 'text-yellow-400 drop-shadow-[0_0_12px_yellow]' : 'text-slate-600'}/>  
         <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500">Power</span>  
      </button>  
      <button onClick={handlePet} className="p-5 rounded-[35px] border border-white/5 bg-pink-500/10 hover:bg-pink-500/20 flex flex-col items-center gap-2 active:scale-90 transition-all group shadow-lg">  
         <Heart size={20} className="text-pink-400 drop-shadow-[0_0_12px_pink] group-active:scale-150 transition-transform duration-300"/>  
         <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500">Pet</span>  
      </button>  
      <button onClick={() => setIsMuted(!isMuted)} className={`p-5 rounded-[35px] border border-white/5 flex flex-col items-center gap-2 active:scale-90 transition-all shadow-lg ${isMuted ? 'bg-red-500/10' : 'bg-cyan-500/10'}`}>  
         {isMuted ? <VolumeX size={20} className="text-red-400 drop-shadow-[0_0_12px_red]"/> : <Volume2 size={20} className="text-cyan-400 drop-shadow-[0_0_12px_cyan]"/>}  
         <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500">Audio</span>  
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
      
  {/* GLOBAL KERNEL ENGINE STYLES */}  
  <style dangerouslySetInnerHTML={{ __html: `  
    @keyframes blink { 0%, 94%, 100% { transform: scaleY(1); } 97% { transform: scaleY(0.08); } }   
    .eye-blink { animation: blink 4.5s infinite; }   
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }   
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(34,211,238,0.25); border-radius: 20px; }  
    .bg-repeating-linear-gradient-45 {  
        background: repeating-linear-gradient(45deg, rgba(0,0,0,0.15), rgba(0,0,0,0.15) 12px, rgba(255,255,255,0.04) 12px, rgba(255,255,255,0.04) 24px);  
    }  
    input[type=range]::-webkit-slider-thumb {  
        appearance: none; width: 28px; height: 28px; background: #22d3ee; border-radius: 50%; border: 5px solid #1c1c28; box-shadow: 0 0 20px rgba(34,211,238,0.6);  
    }  
    .mimo-scanlines::after {  
        content: " "; display: block; position: absolute; top: -10px; left: -10px; bottom: -10px; right: -10px;  
        background: linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.2) 50%);  
        background-size: 100% 4px; pointer-events: none; z-index: 50; border-radius: 50%; opacity: 0.8;  
    }  
  ` }} />  
</div>

);
  }
