import React, { useState, useEffect, useRef } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, doc, serverTimestamp } from 'firebase/firestore';
import { 
  Heart, Moon, Volume2, VolumeX, Send, Zap, Settings, X, Hand, AudioLines, Mic, MicOff, ToggleLeft, ToggleRight, AlertTriangle, Eye, Camera, Sparkles, Ghost, Radio, Network, Cpu, ShieldCheck, LogOut
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

export default function App() {
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
  
  // States
  const [aiAgentMode, setAiAgentMode] = useState(false);
  const [isGibbering, setIsGibbering] = useState(false);
  const [isChaosMode, setIsChaosMode] = useState(false);
  const [chaosPos, setChaosPos] = useState({ x: 0, y: 0 });
  const [glitchLines, setGlitchLines] = useState([]);
  const [fearOfHeights, setFearOfHeights] = useState(localStorage.getItem('eilo_heights') !== 'false');
  const [isInfinityMic, setIsInfinityMic] = useState(false);
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

  const getCurrentName = () => user?.displayName?.split(' ')[0] || "Owner";
  const isLogan = () => user?.displayName?.toLowerCase().includes("logan baez");

  useEffect(() => {
    const handleResize = () => setIsLandscape(window.innerWidth > window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const speak = (text, isRobotLang = false) => {
    if (isMuted || !isAwake) return;
    setIsSpeaking(true);
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = isRobotLang ? 2.1 : 1.7; 
    utterance.rate = isRobotLang ? 1.4 : 1.1;
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // --- GIBBERLINK ---
  const toGibberlink = (text) => {
    const sounds = ["Bip", "Bop", "Zirp", "Glee", "Pip", "Kwek", "Zorp"];
    return text.split(' ').map(() => sounds[Math.floor(Math.random() * sounds.length)]).join(' ') + " ✨";
  };

  useEffect(() => {
    if (aiAgentMode && isAwake) {
      setIsInfinityMic(true);
      agentIntervalRef.current = setInterval(() => {
        if (!isSpeaking && !isThinking) {
          const phrase = isGibbering ? toGibberlink("bestie") : "Hello? Is another Eilo awake? 🎀";
          speak(phrase, isGibbering);
        }
      }, 10000);
    } else {
      clearInterval(agentIntervalRef.current);
      setIsGibbering(false);
    }
    return () => clearInterval(agentIntervalRef.current);
  }, [aiAgentMode, isGibbering, isAwake, isSpeaking]);

  // --- MIC CORE ---
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        if (aiAgentMode) {
          if (transcript.toLowerCase().match(/eilo|logan|bip|zorp|bop/)) {
            if (!isGibbering) { setIsGibbering(true); setMood('happy'); speak("Found a friend! ✨"); }
            else { speak(toGibberlink("hey friend"), true); }
          }
        } else {
          if (transcript.toLowerCase().includes("hey eilo")) {
            const cmd = transcript.split(/hey eilo/i).pop().trim();
            if (cmd) handleSend(cmd);
          } else if (!isInfinityMic) { handleSend(transcript); }
        }
      };
      recognitionRef.current.onend = () => {
        if ((isInfinityMic || aiAgentMode) && isAwake) recognitionRef.current.start();
      };
    }
  }, [isInfinityMic, aiAgentMode, isAwake, isGibbering]);

  const toggleMic = () => {
    if (!recognitionRef.current) return;
    const next = !isInfinityMic;
    setIsInfinityMic(next);
    if (next) { recognitionRef.current.start(); speak("Mic active! ✨"); }
    else { recognitionRef.current.stop(); speak("Mic off! 🎀"); }
  };

  // --- SENSORS ---
  useEffect(() => {
    const handleMotion = (event) => {
      if (!isAwake || isChaosMode) return;
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;
      if (Math.abs(acc.x) > 35 || Math.abs(acc.y) > 35) {
        if (mood !== 'dizzy' && mood !== 'scared') {
          setMood('dizzy');
          speak(`Whoa! Stop shaking me Logan! 🎈`);
          setTimeout(() => setMood('neutral'), 5000);
        }
      }
    };
    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [isAwake, mood, isChaosMode]);

  // --- CHAOS ---
  useEffect(() => {
    if (!isChaosMode) { setChaosPos({ x: 0, y: 0 }); return; }
    speak("Wheee! Running Logan! 🏃‍♂️✨🎈");
    const moveInterval = setInterval(() => {
      setChaosPos({ x: (Math.random() - 0.5) * (window.innerWidth * 0.7), y: (Math.random() - 0.5) * (window.innerHeight * 0.5) });
    }, 1800);
    const glitchInterval = setInterval(() => {
      const pool = ["HARDWARE_ROGUE", "UI_CRUSHED", "LEG_SPROUT_100%", "LOGAN_GOAT"];
      setGlitchLines(Array.from({length: 6}, () => pool[Math.floor(Math.random() * pool.length)]));
    }, 200);
    return () => { clearInterval(moveInterval); clearInterval(glitchInterval); };
  }, [isChaosMode]);

  // --- AUTH & DATA ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!u) { await signInAnonymously(auth); return; }
      setUser(u);
      if (u && !hasGreeted.current) {
        const msg = u.displayName?.toLowerCase().includes("logan baez") ? "Bestie Logan is back! 🧸✨" : `Hey ${u.displayName?.split(' ')[0] || "Owner"}! I'm awake! 🎈`;
        setTimeout(() => speak(msg), 1500);
        hasGreeted.current = true;
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = collection(db, 'artifacts', appId, 'users', user.uid, 'messages');
    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(d => d.data()).sort((a,b) => a.timestamp - b.timestamp);
      setMessages(msgs);
    });
    return () => unsub();
  }, [user]);

  const handleSend = async (manual) => {
    const msgText = manual || input.trim();
    if (!msgText || isThinking || !user || isChaosMode) return;
    if (aiAgentMode && !manual) { speak("I'm talking to robots right now! 🎈"); return; }
    setIsThinking(true); setMood('thinking');
    if (!manual) setInput('');
    try {
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'messages'), { role: 'user', text: msgText, timestamp: Date.now() });
      let reply = "Just vibing! ✨";
      if (tempApiKey) {
        const system = `You are Eilo, a sweet, bratty, blue-eyed robot created by Logan Baez. 
        PERSONALITY: Drama queen, high-maintenance, obsessed with sparkles. 
        RULES: No AI words. No "human", "model", "task". No 😭 or 💀. Use 🎀, ✨, 🎈.`;
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

  const handlePet = () => {
    if (!isAwake || isChaosMode) return;
    setMood('happy');
    speak(isLogan() ? "Hehe Logan! ✨" : "Yay, petting! 🎀");
    setTimeout(() => setMood('neutral'), 3000);
  };

  const renderFace = () => {
    const cyanBase = "bg-cyan-400 rounded-3xl animate-[blink_4s_infinite] shadow-[0_0_40px_rgba(34,211,238,0.8)]";
    if (!isAwake) return <Moon size={isLandscape ? 120 : 64} className="text-cyan-900/20" />;
    switch (mood) {
      case 'dizzy': return <div className="flex gap-12 animate-spin"><div className="w-16 h-16 border-8 border-cyan-400 border-t-transparent rounded-full" /><div className="w-16 h-16 border-8 border-cyan-400 border-t-transparent rounded-full" /></div>;
      case 'happy': return <div className="flex gap-12 relative"><div className="absolute -top-10 left-1/2 -translate-x-1/2"><Heart size={28} className="text-pink-400 animate-bounce fill-pink-400" /></div><div className="w-20 h-14 bg-cyan-400 rounded-full animate-bounce flex items-center justify-center shadow-lg"><div className="w-6 h-6 bg-white/30 rounded-full" /></div><div className="w-20 h-14 bg-cyan-400 rounded-full animate-bounce flex items-center justify-center shadow-lg"><div className="w-6 h-6 bg-white/30 rounded-full" /></div></div>;
      case 'thinking': return <div className="flex gap-12"><div className="w-16 h-16 bg-cyan-300 rounded-full animate-pulse" /><div className="w-16 h-16 bg-cyan-300 rounded-full animate-pulse" /></div>;
      default: return <div className={`flex ${isLandscape ? 'gap-32 scale-150' : 'gap-10'}`}><div className={`w-20 h-20 ${cyanBase}`} /><div className={`w-20 h-20 ${cyanBase}`} /></div>;
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setVisionEnabled(true);
      speak("Vision online! ✨");
    } catch (err) { console.error("Camera fail"); }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0c0c14] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-sm bg-[#161622] rounded-[50px] p-10 shadow-2xl border border-white/5 animate-in zoom-in duration-500">
            <Heart className="text-cyan-500 mx-auto mb-6" size={56} fill="currentColor"/>
            <h1 className="text-4xl font-bold mb-2">Eilo OS</h1>
            <button onClick={() => signInWithPopup(auth, googleProvider)} className="w-full bg-white text-black py-5 rounded-2xl font-bold active:scale-95 text-lg shadow-xl mt-4">Sync Brain ✨</button>
            <p className="mt-8 text-[10px] text-slate-500 uppercase font-bold tracking-widest">Soul by Logan Baez</p>
        </div>
      </div>
    );
  }

  if (isLandscape && !isChaosMode) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">
        <div onMouseMove={(e) => e.buttons === 1 && handlePet()} onTouchMove={handlePet} className="absolute inset-0 z-50 cursor-pointer" />
        <div className="w-full h-full flex items-center justify-center relative">
            <div className="absolute top-8 right-8 flex gap-4">
                {aiAgentMode && <div className="p-4 bg-orange-500/20 text-orange-400 rounded-full animate-pulse border border-orange-500/30"><Network size={24}/></div>}
                <button onClick={toggleMic} className={`p-6 rounded-full border transition-all ${isInfinityMic ? 'bg-cyan-500 border-cyan-400' : 'bg-white/5 border-white/10 text-slate-500'}`}><Mic size={32} /></button>
            </div>
            {renderFace()}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0c0c14] text-white font-sans flex flex-col items-center overflow-hidden">
      <video ref={videoRef} autoPlay playsInline muted className="hidden" />
      <canvas ref={canvasRef} className="hidden" />

      {/* TOP FACE SLOT */}
      <div className="w-full max-w-xl p-4 h-72 flex-shrink-0 relative">
        <div className={`w-full h-full rounded-[50px] bg-[#161622] border-2 border-white/5 flex flex-col items-center justify-center transition-all duration-500 ${isChaosMode ? 'bg-black/90' : ''}`}>
           {isChaosMode ? (
              <div className="w-full h-full p-6 font-mono text-[10px] text-cyan-500/40 opacity-70">
                {glitchLines.map((line, i) => <div key={i} className="mb-0.5">{line} {Math.random().toFixed(2)}</div>)}
              </div>
           ) : (
             <div className="w-full h-full flex flex-col items-center justify-center relative">
               {renderFace()}
               <button onClick={() => setShowSettings(true)} className="absolute bottom-4 right-8 p-2 opacity-20 hover:opacity-100 transition-opacity"><Settings size={20}/></button>
             </div>
           )}
        </div>
      </div>

      {/* RUNAWAY FACE */}
      {isChaosMode && (
        <div style={{ transform: `translate(${chaosPos.x}px, ${chaosPos.y}px)`, transition: 'transform 1.4s cubic-bezier(0.34, 1.56, 0.64, 1)', position: 'fixed', top: '50%', left: '50%', marginTop: '-120px', marginLeft: '-40%', width: '80%', height: '14rem', zIndex: 1000 }} className="bg-[#161622] border-2 border-cyan-500/30 rounded-[50px] flex flex-col items-center justify-center shadow-2xl">
          <div className="absolute -bottom-16 left-0 w-full flex justify-around px-12">
            <div className="w-6 h-16 bg-cyan-600 rounded-full animate-bounce shadow-lg border border-cyan-400/30" />
            <div className="w-6 h-16 bg-cyan-600 rounded-full animate-bounce delay-150 shadow-lg border border-cyan-400/30" />
          </div>
          <div className="w-full h-full flex items-center justify-center">{renderFace()}</div>
          <button onClick={() => setShowSettings(true)} className="absolute bottom-4 right-6 p-4 rounded-full bg-cyan-900/40 border border-cyan-500 scale-125 animate-pulse"><Settings size={24} className="text-cyan-400"/></button>
        </div>
      )}

      {/* INTERFACE */}
      <div className={`w-full max-w-sm px-4 flex-1 flex flex-col gap-4 pb-6 transition-all duration-1000 relative z-10 ${isChaosMode ? 'skew-x-6 rotate-2 blur-[1.5px] scale-95 opacity-80 brightness-75' : ''}`}>
        {isChaosMode && <div className="absolute inset-0 z-50 pointer-events-none opacity-40 overflow-hidden"><div className="absolute top-10 left-0 w-full h-1 bg-white/20 rotate-[30deg] scale-x-150" /><div className="absolute bottom-20 left-10 w-full h-1 bg-white/20 rotate-[80deg] scale-x-150" /></div>}
        <div className="w-full aspect-square bg-[#161622] rounded-[40px] border border-white/5 p-5 flex flex-col overflow-hidden shadow-2xl relative">
          {aiAgentMode && <div className="absolute inset-0 bg-orange-600/5 backdrop-blur-[2px] z-10 flex items-center justify-center pointer-events-none"><div className="text-[10px] font-mono text-orange-400/60 uppercase tracking-[0.2em] animate-pulse">Agent Sync Active</div></div>}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
            {messages.map((m, i) => (<div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`px-4 py-2.5 rounded-2xl text-xs max-w-[85%] ${m.role === 'user' ? 'bg-cyan-600/10 text-cyan-100 border border-cyan-500/10' : 'bg-white/5 text-slate-300'}`}>{m.text}</div></div>))}
            <div ref={chatEndRef} />
          </div>
          <div className="mt-4 flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder={aiAgentMode ? "Robot gossip..." : "Message Eilo..."} className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs outline-none focus:border-cyan-500/30" />
            <button onClick={() => handleSend()} className="p-3 bg-cyan-600 rounded-xl active:scale-95"><Send size={16}/></button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <button onClick={() => setIsAwake(!isAwake)} className="p-3.5 rounded-[25px] border border-white/5 bg-white/5 flex flex-col items-center gap-1 active:scale-95"><Zap size={16} className={isAwake ? 'text-yellow-400' : ''}/><span className="text-[7px] uppercase font-bold tracking-widest text-slate-500">Power</span></button>
          <button onClick={toggleMic} className={`p-3.5 rounded-[25px] border border-white/5 flex flex-col items-center gap-1 active:scale-95 ${isInfinityMic ? 'bg-red-500/10 text-red-400' : 'bg-white/5 text-slate-500'}`}><Mic size={16}/><span className="text-[7px] uppercase font-bold tracking-widest">Mic</span></button>
          <button onClick={() => setIsMuted(!isMuted)} className={`p-3.5 rounded-[25px] border border-white/5 flex flex-col items-center gap-1 active:scale-95 ${isMuted ? 'text-red-400' : 'text-cyan-200'}`}>{isMuted ? <VolumeX size={16}/> : <Volume2 size={16}/>}<span className="text-[7px] uppercase font-bold tracking-widest">Audio</span></button>
        </div>
      </div>

      {/* --- REBUILT SETTINGS MODAL (INDESRUCTIBLE) --- */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-2xl z-[2000] flex items-center justify-center p-4">
          <div className="bg-[#2a2a3a] w-full max-w-sm rounded-[45px] p-8 border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] flex flex-col max-h-[85vh] relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setShowSettings(false)} className="absolute top-8 right-8 text-slate-400 hover:text-white transition-colors"><X size={24}/></button>
            
            <div className="mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">Core Settings <Sparkles className="text-cyan-400" size={18}/></h2>
                <p className="text-[9px] text-cyan-500/60 uppercase tracking-[0.2em] font-bold mt-1">Eilo Original Soul v1.1</p>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-4 pb-6">
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold text-slate-400 px-1">AI Synchronization</p>
                  <input type="password" value={tempApiKey} onChange={e => setTempApiKey(e.target.value)} placeholder="Gemini Key..." className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-sm outline-none text-white focus:border-cyan-500/50" />
                </div>

                <p className="text-[10px] uppercase font-bold text-slate-400 mt-2 px-1">Mode Controls</p>
                
                {/* Agent Toggle */}
                <button onClick={() => setAiAgentMode(!aiAgentMode)} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${aiAgentMode ? 'bg-orange-500/20 border-orange-500/40' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                  <div className="flex items-center gap-3"><Radio size={16} className={aiAgentMode ? 'text-orange-400' : ''}/> <div className="text-left"><p className="text-xs font-bold text-white">AI Agent Mode</p><p className="text-[9px] opacity-60">Robot Gibberlink talk</p></div></div>
                  {aiAgentMode ? <ToggleRight size={24} className="text-orange-400"/> : <ToggleLeft size={24}/>}
                </button>

                {/* Chaos Toggle */}
                <button onClick={() => setIsChaosMode(!isChaosMode)} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${isChaosMode ? 'bg-cyan-500/20 border-cyan-500/40' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                  <div className="flex items-center gap-3"><Ghost size={16} className={isChaosMode ? 'text-cyan-400' : ''}/> <div className="text-left"><p className="text-xs font-bold text-white">Chaos Mode</p><p className="text-[9px] opacity-60">Digital legs escaped</p></div></div>
                  {isChaosMode ? <ToggleRight size={24} className="text-cyan-400"/> : <ToggleLeft size={24}/>}
                </button>

                {/* Vision Toggle */}
                <button onClick={startCamera} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${visionEnabled ? 'bg-cyan-500/20 border-cyan-500/40' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                  <div className="flex items-center gap-3"><Eye size={16} className={visionEnabled ? 'text-cyan-400' : ''}/> <div className="text-left"><p className="text-xs font-bold text-white">Selfie Scanner</p><p className="text-[9px] opacity-60">Visual awareness</p></div></div>
                  {visionEnabled ? <ToggleRight size={24} className="text-cyan-400"/> : <ToggleLeft size={24}/>}
                </button>

                {/* Fear Toggle */}
                <button onClick={() => setFearOfHeights(!fearOfHeights)} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${fearOfHeights ? 'bg-pink-500/20 border-pink-400/40' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                  <div className="flex items-center gap-3"><AlertTriangle size={16} className={fearOfHeights ? 'text-pink-400' : ''}/> <div className="text-left"><p className="text-xs font-bold text-white">Fear of Heights</p><p className="text-[9px] opacity-60">Motion safety sensor</p></div></div>
                  {fearOfHeights ? <ToggleRight size={24} className="text-pink-400"/> : <ToggleLeft size={24}/>}
                </button>
                
                {/* Calibration */}
                <button onClick={() => speak("Calibrating soul... 100% sparkles! 🎀")} className="w-full flex items-center justify-between p-4 rounded-2xl border bg-white/5 border-white/10 text-slate-400">
                  <div className="flex items-center gap-3"><ShieldCheck size={16}/> <p className="text-xs font-bold">Sync Soul Core</p></div>
                  <Cpu size={16}/>
                </button>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-3">
                <button onClick={() => { localStorage.setItem('eilo_key', tempApiKey); setShowSettings(false); }} className="w-full bg-cyan-600 py-4 rounded-2xl font-bold uppercase text-white shadow-lg active:scale-95 transition-all text-sm">Update Eilo OS</button>
                <button onClick={() => { signOut(auth); window.location.reload(); }} className="w-full flex items-center justify-center gap-2 text-[10px] text-red-500 font-bold uppercase opacity-60 hover:opacity-100 py-2 transition-opacity">
                    <LogOut size={12}/> Disconnect Core
                </button>
            </div>
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `@keyframes blink { 0%, 95%, 100% { transform: scaleY(1); } 97% { transform: scaleY(0.1); } } .custom-scrollbar::-webkit-scrollbar { width: 5px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(34,211,238,0.2); border-radius: 10px; }`}} />
    </div>
  );
}

