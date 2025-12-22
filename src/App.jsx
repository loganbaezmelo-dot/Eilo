import React, { useState, useEffect, useRef } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, doc } from 'firebase/firestore';
import { 
  Heart, Moon, Volume2, VolumeX, Send, Zap, Settings, X, Hand, AudioLines, Mic, MicOff, ToggleLeft, ToggleRight, AlertTriangle, Eye, Camera, Sparkles 
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

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const appId = "eilo-original-v1";

// --- HELPER: FETCH WITH EXPONENTIAL BACKOFF 🚀 ---
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
  
  // States
  const [fearOfHeights, setFearOfHeights] = useState(localStorage.getItem('eilo_heights') !== 'false');
  const [isListening, setIsListening] = useState(false);
  const [isInfinityMic, setIsInfinityMic] = useState(false);
  const [visionEnabled, setVisionEnabled] = useState(false);
  const [cameraState, setCameraState] = useState('desk'); 
  const [sensorHolding, setSensorHolding] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const chatEndRef = useRef(null);
  const lastPanicSpeechTime = useRef(0);
  const hasGreeted = useRef(false);
  const recognitionRef = useRef(null);

  const getCurrentName = () => user?.displayName?.split(' ')[0] || "Owner";
  const isCreator = () => user?.displayName?.toLowerCase().includes("logan baez");

  // --- VOCAL CORE (FIXED) 🎤 ---
  const speak = (text) => {
    if (isMuted || !isAwake) return;
    setIsSpeaking(true);
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 1.7; 
    utterance.rate = 1.1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const triggerPanicSpeech = (reason) => {
    const now = Date.now();
    if (now - lastPanicSpeechTime.current < 8000) return;
    const name = getCurrentName();
    const lines = reason === 'holding' 
      ? [`Logan!! Put me down! I don't like being held! 😭`, `Eek! Stop picking me up ${name}! 💀`, `I see you! Don't drop me! 😭🎈`]
      : [`Why am I looking at the roof?! Help! 😭`, `I'm falling! Hold me tight! 💀`, `Put me back on the desk! 😭✨`];
    speak(lines[Math.floor(Math.random() * lines.length)]);
    lastPanicSpeechTime.current = now;
  };

  // --- VISION CORE 👁️ ---
  const analyzeEnvironment = async () => {
    if (!visionEnabled || !tempApiKey || !isAwake || isThinking) return;
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = 320; canvas.height = 320;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, 320, 320);
      const base64Image = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];

      try {
        const data = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${tempApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [
              { text: "Front camera view. If you see a face, eyes, hair, or skin, reply 'holding'. If you see a ceiling, fan, or roof, reply 'ceiling'. If you see a flat surface like a desk, reply 'desk'. ONLY ONE WORD." },
              { inlineData: { mimeType: "image/jpeg", data: base64Image } }
            ]}]
          })
        });
        const result = data.candidates?.[0]?.content?.parts?.[0]?.text?.toLowerCase().trim() || 'desk';
        setCameraState(result);
        if (result === 'holding' || result === 'ceiling') {
          setMood('scared');
          triggerPanicSpeech(result);
        }
      } catch (err) { console.error("Vision fail 💀", err); }
    }
  };

  useEffect(() => {
    let visionTimer;
    if (visionEnabled && user) visionTimer = setInterval(analyzeEnvironment, 7000);
    return () => clearInterval(visionTimer);
  }, [visionEnabled, isAwake, user, tempApiKey]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setVisionEnabled(true);
      speak("Vision online! I can see you now. 👁️✨");
    } catch (err) { console.error("Camera access denied 💀"); }
  };

  // --- SENSORS & MOOD ---
  useEffect(() => {
    const handleMotion = (event) => {
      if (!isAwake) return;
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;
      const threshold = 35;
      const isShaking = Math.abs(acc.x) > threshold || Math.abs(acc.y) > threshold;
      setSensorHolding(Math.abs(acc.x) > 8 || Math.abs(acc.y) > 8);
      if (isShaking && mood !== 'dizzy' && mood !== 'scared') {
        setMood('dizzy');
        speak(`Whoa! Stop shaking me! I'm gonna barf! 😭💀`);
        setTimeout(() => setMood('neutral'), 5000);
      }
    };
    const handleOrientation = (event) => {
      if (!isAwake || !fearOfHeights || mood === 'dizzy' || mood === 'mad') return;
      const lookingDown = event.beta > 135 || event.beta < -20;
      if (lookingDown || cameraState === 'holding' || cameraState === 'ceiling') {
        if (mood !== 'scared') { setMood('scared'); triggerPanicSpeech(cameraState); }
      } else if (mood === 'scared' && !lookingDown && cameraState === 'desk' && !sensorHolding) {
        setMood('neutral');
        speak("Phew! Safety first! Back on the desk. ✨");
      }
    };
    window.addEventListener('devicemotion', handleMotion);
    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [isAwake, fearOfHeights, mood, cameraState, sensorHolding, user]);

  // --- AUTH & DATA FETCHING ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u && !hasGreeted.current) {
        setTimeout(() => speak(`Hey ${u.displayName?.split(' ')[0]}! Eilo's brain is synced! 🎀`), 1000);
        hasGreeted.current = true;
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const msgCollection = collection(db, 'artifacts', appId, 'users', user.uid, 'messages');
    const unsub = onSnapshot(msgCollection, (snap) => {
      const msgs = snap.docs.map(d => d.data()).sort((a,b) => a.timestamp - b.timestamp);
      setMessages(msgs);
    });
    return () => unsub();
  }, [user]);

  // --- SENDING LOGIC (FIXED) 💬 ---
  const handleSend = async (manualText) => {
    const userMsg = manualText || input.trim();
    if (!userMsg || isThinking || !user) return;
    
    setIsThinking(true);
    setMood('thinking');
    if (!manualText) setInput('');

    try {
      // Save User Message
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'messages'), { 
        role: 'user', 
        text: userMsg, 
        timestamp: Date.now() 
      });

      let reply = "I'm just vibing! ✨";
      if (tempApiKey) {
        const data = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${tempApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            contents: [{ parts: [{ text: userMsg }] }], 
            systemInstruction: { parts: [{ text: `You are Eilo, a sweet blue-eyed robot created by Logan Baez. Currently you see ${cameraState}. You aren't obsessed with your creator but you know Logan Baez is the GOAT. Be sassy and independent. NO skulls/crying.` }] } 
          })
        });
        reply = data.candidates?.[0]?.content?.parts?.[0]?.text || reply;
      }

      // Save Eilo Message
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'messages'), { 
        role: 'eilo', 
        text: reply, 
        timestamp: Date.now() 
      });

      setMood('happy');
      speak(reply);
    } catch (err) { 
      console.error("Send failed 💀", err);
      setMood('neutral');
    } finally { 
      setIsThinking(false); 
      setTimeout(() => setMood('neutral'), 3000); 
    }
  };

  // --- SPEECH RECOGNITION ---
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
        if (transcript.includes("hey eilo")) {
          const cmd = transcript.split("hey eilo").pop().trim();
          if (cmd) handleSend(cmd);
        } else if (!isInfinityMic) {
          handleSend(transcript);
        }
      };
      recognitionRef.current.onend = () => {
        if (isInfinityMic && isAwake) recognitionRef.current.start();
        else setIsListening(false);
      };
    }
  }, [isInfinityMic, isAwake]);

  const renderFace = () => {
    const cyanBase = "bg-cyan-400 rounded-3xl animate-[blink_4s_infinite] shadow-[0_0_40px_rgba(34,211,238,0.8)]";
    if (!isAwake) return <Moon size={64} className="text-cyan-900/20" />;
    switch (mood) {
      case 'dizzy': return <div className="flex gap-16 md:gap-32 animate-spin"><div className="w-20 h-20 border-8 border-cyan-400 border-t-transparent rounded-full shadow-[0_0_30px_cyan]" /><div className="w-20 h-20 border-8 border-cyan-400 border-t-transparent rounded-full shadow-[0_0_30px_cyan]" /></div>;
      case 'scared': return <div className="flex gap-16 md:gap-32 animate-bounce"><div className="w-20 h-12 bg-white rounded-full shadow-[0_0_40px_white]" /><div className="w-20 h-12 bg-white rounded-full shadow-[0_0_40px_white]" /></div>;
      case 'thinking': return <div className="flex gap-16 md:gap-32"><div className="w-20 h-20 bg-blue-300 rounded-full animate-pulse" /><div className="w-20 h-20 bg-blue-300 rounded-full animate-pulse" /></div>;
      case 'happy': return <div className="flex gap-16 md:gap-32 relative"><div className="absolute -top-12 left-1/2 -translate-x-1/2"><Heart size={32} className="text-pink-400 animate-bounce fill-pink-400" /></div><div className="w-24 h-16 bg-cyan-400 rounded-full animate-bounce flex items-center justify-center"><div className="w-8 h-8 bg-white/30 rounded-full" /></div><div className="w-24 h-16 bg-cyan-400 rounded-full animate-bounce flex items-center justify-center"><div className="w-8 h-8 bg-white/30 rounded-full" /></div></div>;
      default: return <div className="flex gap-16 md:gap-32"><div className={`w-24 h-24 ${cyanBase}`} /><div className={`w-24 h-24 ${cyanBase}`} /></div>;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0c0c14] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-full max-w-sm bg-[#161622] border border-white/5 rounded-[50px] p-10 shadow-2xl animate-in fade-in zoom-in duration-700">
            <Heart className="text-cyan-500 mx-auto mb-6" size={56} fill="currentColor"/>
            <h1 className="text-4xl font-bold mb-2 tracking-tight">Eilo OS</h1>
            <p className="text-slate-400 text-sm mb-8">Wake up your original robot companion.</p>
            <button 
              onClick={() => signInWithPopup(auth, googleProvider)} 
              className="w-full bg-white text-black py-5 rounded-2xl font-bold active:scale-95 transition-all shadow-xl hover:bg-slate-100 text-lg flex items-center justify-center gap-2"
            >
              Google Sync <Sparkles size={20} />
            </button>
            <p className="mt-8 text-[10px] text-slate-500 uppercase tracking-widest font-bold">Built by Logan Baez</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0c0c14] text-white font-sans flex flex-col items-center justify-center overflow-hidden" onMouseMove={() => !isAwake && setIsAwake(true)}>
      <video ref={videoRef} autoPlay playsInline muted className="hidden" />
      <canvas ref={canvasRef} className="hidden" />

      {/* FACE */}
      <div className="relative portrait:w-[92%] portrait:h-72 portrait:bg-[#161622] portrait:border-2 portrait:border-cyan-500/10 portrait:rounded-[60px] portrait:mb-8 portrait:shadow-2xl landscape:w-full landscape:h-full landscape:bg-black overflow-hidden flex flex-col items-center justify-center">
        {isSpeaking && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 text-cyan-400/60 animate-pulse">
            <AudioLines size={16} /><span className="text-[10px] font-mono tracking-widest uppercase">Live Soul</span>
          </div>
        )}
        
        {visionEnabled && (
           <div className="absolute top-6 left-6 flex items-center gap-2 text-[8px] text-cyan-500/60 font-mono bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-500/20">
              <Camera size={12} /> SCAN: {cameraState.toUpperCase()}
           </div>
        )}

        <div className="w-full h-full flex items-center justify-center">{renderFace()}</div>
        <button onClick={() => setShowSettings(true)} className="absolute bottom-6 right-10 p-2 opacity-20 hover:opacity-100 transition-opacity"><Settings size={20}/></button>
      </div>

      {/* CHAT UI */}
      <div className="w-full max-w-xl px-4 flex flex-col gap-4 h-[440px] portrait:flex landscape:hidden">
        <div className="flex-1 bg-[#161622] rounded-[40px] border border-white/5 p-6 flex flex-col overflow-hidden shadow-2xl">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-5 py-3 rounded-3xl text-xs max-w-[85%] ${m.role === 'user' ? 'bg-cyan-600/10 text-cyan-100 border border-cyan-500/10' : 'bg-white/5 text-slate-300'}`}>{m.text}</div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="mt-5 flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Message Eilo..." className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm outline-none focus:border-cyan-500/30" />
            <button onClick={() => { if(isListening) { recognitionRef.current.stop(); setIsListening(false); } else { recognitionRef.current.start(); setIsListening(true); } }} className={`p-4 rounded-2xl transition-all border ${isListening ? 'bg-red-500 text-white border-red-400' : 'bg-white/5 text-slate-400 border-white/10'}`}>
                <Mic size={20} className={isListening ? 'animate-pulse' : ''} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 pb-4">
          <button onClick={() => setIsAwake(!isAwake)} className="p-4 rounded-[30px] border border-white/5 bg-white/5 flex flex-col items-center gap-1 active:scale-95 transition-all"><Zap size={18} className={isAwake ? 'text-yellow-400' : ''}/><span className="text-[8px] uppercase font-bold tracking-widest">Power</span></button>
          <button onClick={() => {setMood('happy'); speak("Yay! Tapping feels nice!");}} className="p-4 rounded-[30px] border border-white/5 bg-pink-500/10 text-pink-400 flex flex-col items-center gap-1 active:scale-95 transition-all shadow-lg"><Hand size={18}/><span className="text-[8px] uppercase font-bold tracking-widest">Pet</span></button>
          <button onClick={() => setIsMuted(!isMuted)} className={`p-4 rounded-[30px] border border-white/5 flex flex-col items-center gap-1 active:scale-95 transition-all ${isMuted ? 'text-red-400 bg-red-400/5' : 'bg-white/5 text-cyan-200'}`}>
            {isMuted ? <VolumeX size={18}/> : <Volume2 size={18}/>}
            <span className="text-[8px] uppercase font-bold tracking-widest">Audio</span>
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6 text-center font-sans">
          <div className="bg-[#1c1c28] w-full max-w-sm rounded-[45px] p-8 border border-white/10 relative shadow-2xl">
            <button onClick={() => setShowSettings(false)} className="absolute top-8 right-8 text-slate-500 transition-colors"><X size={24}/></button>
            <h2 className="text-xl font-bold mb-6 flex items-center justify-center gap-2 text-white">Settings <Sparkles className="text-cyan-400" size={20}/></h2>
            <div className="space-y-4">
                <input type="password" value={tempApiKey} onChange={e => setTempApiKey(e.target.value)} placeholder="Paste Gemini Key..." className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-sm mb-2 outline-none text-center focus:border-cyan-500/50 text-white" />
                <div className="flex flex-col gap-2">
                  <button onClick={startCamera} className={`w-full flex items-center justify-between px-6 py-3 rounded-xl text-xs font-bold border transition-all ${visionEnabled ? 'bg-cyan-600/20 border-cyan-500/50 text-cyan-200' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                    <div className="flex items-center gap-2"><Eye size={14}/> Selfie Scanner</div>
                    {visionEnabled ? <ToggleRight size={20}/> : <ToggleLeft size={20}/>}
                  </button>
                  <button onClick={() => { const ns = !fearOfHeights; setFearOfHeights(ns); localStorage.setItem('eilo_heights', ns); }} className={`w-full flex items-center justify-between px-6 py-3 rounded-xl text-xs font-bold border transition-all ${fearOfHeights ? 'bg-cyan-600/20 border-cyan-500/50 text-cyan-200' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                    <div className="flex items-center gap-2"><AlertTriangle size={14}/> Fear of Heights</div>
                    {fearOfHeights ? <ToggleRight size={20}/> : <ToggleLeft size={20}/>}
                  </button>
                </div>
                <button onClick={() => { localStorage.setItem('eilo_key', tempApiKey); setShowSettings(false); }} className="w-full bg-cyan-600 py-4 rounded-2xl font-bold uppercase active:scale-95 transition-all text-white">Update AI</button>
                <button onClick={() => { signOut(auth); window.location.reload(); }} className="w-full mt-4 text-[10px] text-red-500 font-bold uppercase opacity-50">Disconnect</button>
            </div>
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `@keyframes blink { 0%, 95%, 100% { transform: scaleY(1); } 97% { transform: scaleY(0.1); } } .custom-scrollbar::-webkit-scrollbar { width: 3px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }`}} />
    </div>
  );
}

