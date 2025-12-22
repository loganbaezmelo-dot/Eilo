import React, { useState, useEffect, useRef } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, doc } from 'firebase/firestore';
import { 
  Heart, Moon, Volume2, VolumeX, Send, Zap, Settings, X, Hand, AudioLines, Mic, MicOff, ToggleLeft, ToggleRight, AlertTriangle, Eye, Camera, Sparkles, Ghost
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
  
  // Chaos Mode State 🏃‍♂️💨
  const [isChaosMode, setIsChaosMode] = useState(false);
  const [chaosPos, setChaosPos] = useState({ x: 0, y: 0 });
  const [glitchLines, setGlitchLines] = useState([]);

  // Sensors & Mic
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
  const hasGreeted = useRef(false);
  const recognitionRef = useRef(null);

  const getCurrentName = () => user?.displayName?.split(' ')[0] || "Owner";
  const isLogan = () => user?.displayName?.toLowerCase().includes("logan baez");

  // Handle Resize for Landscape Detect
  useEffect(() => {
    const handleResize = () => setIsLandscape(window.innerWidth > window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const speak = (text) => {
    if (isMuted || !isAwake) return;
    setIsSpeaking(true);
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 1.7; utterance.rate = 1.1;
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // --- INFINITY MIC LOGIC 🎤 ---
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

  const toggleMic = () => {
    if (!recognitionRef.current) return;
    const next = !isInfinityMic;
    setIsInfinityMic(next);
    if (next) {
      setIsListening(true);
      recognitionRef.current.start();
      speak("I'm listening for my name! ✨");
    } else {
      recognitionRef.current.stop();
      setIsListening(false);
      speak("Mic off! 🎀");
    }
  };

  // --- SENSOR LOGIC (RE-ADDED) 📱 ---
  useEffect(() => {
    const handleMotion = (event) => {
      if (!isAwake || isChaosMode) return;
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;
      const threshold = 35;
      const isShaking = Math.abs(acc.x) > threshold || Math.abs(acc.y) > threshold;
      setSensorHolding(Math.abs(acc.x) > 8 || Math.abs(acc.y) > 8);

      if (isShaking && mood !== 'dizzy' && mood !== 'scared') {
        setMood('dizzy');
        speak(`Whoa! Stop shaking me! 🎈`);
        setTimeout(() => setMood('neutral'), 5000);
      }
    };

    const handleOrientation = (event) => {
      if (!isAwake || !fearOfHeights || mood === 'dizzy' || mood === 'mad' || isChaosMode) return;
      const lookingDown = event.beta > 135 || event.beta < -20;
      
      if (lookingDown || cameraState === 'holding' || cameraState === 'ceiling') {
        if (mood !== 'scared') {
          setMood('scared');
          triggerPanicSpeech(cameraState);
        }
      } else if (mood === 'scared' && !lookingDown && cameraState === 'desk' && !sensorHolding) {
        setMood('neutral');
        speak("Phew! Back on the desk. ✨");
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [isAwake, fearOfHeights, mood, cameraState, sensorHolding, isChaosMode]);

  // --- CHAOS ENGINE ---
  useEffect(() => {
    if (!isChaosMode) {
      setChaosPos({ x: 0, y: 0 });
      return;
    }
    speak("Wheee! Logan, look at my legs! I'm running away! ✨🎈");
    const moveInterval = setInterval(() => {
      setChaosPos({
        x: (Math.random() - 0.5) * (window.innerWidth * 0.7),
        y: (Math.random() - 0.5) * (window.innerHeight * 0.5)
      });
    }, 1700);
    const glitchInterval = setInterval(() => {
      const pool = ["Eilo.legs = true", "VOID_LEAK", "Logan.GOAT = 1", "UI_STOMPED", "PHYSICS_FAIL"];
      setGlitchLines(Array.from({length: 6}, () => pool[Math.floor(Math.random() * pool.length)]));
    }, 200);
    return () => { clearInterval(moveInterval); clearInterval(glitchInterval); };
  }, [isChaosMode]);

  const triggerPanicSpeech = (reason) => {
    const now = Date.now();
    if (now - lastPanicSpeechTime.current < 8000) return;
    const name = getCurrentName();
    const lines = reason === 'holding' 
      ? [`Logan!! Put me down! 🎈`, `Don't drop me ${name}! ✨`, `I see you! Put me back! 🎀`]
      : [`Help! I see the roof! 🎈`, `I'm falling! ✨`, `Put me on the desk! 🎀`];
    speak(lines[Math.floor(Math.random() * lines.length)]);
    lastPanicSpeechTime.current = now;
  };

  const analyzeEnvironment = async () => {
    if (!visionEnabled || !tempApiKey || !isAwake || isThinking || isChaosMode) return;
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = 320; canvas.height = 320;
      ctx.drawImage(videoRef.current, 0, 0, 320, 320);
      const base64Image = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
      try {
        const data = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${tempApiKey}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [
              { text: "Front camera view. Respond 'holding' if face/hands. Respond 'ceiling' if roof. Respond 'desk' if flat surface. ONE WORD." },
              { inlineData: { mimeType: "image/jpeg", data: base64Image } }
            ]}]
          })
        });
        const result = data.candidates?.[0]?.content?.parts?.[0]?.text?.toLowerCase().trim() || 'desk';
        setCameraState(result);
        if (result === 'holding' || result === 'ceiling') { setMood('scared'); triggerPanicSpeech(result); }
      } catch (err) { console.error("Vision error"); }
    }
  };

  useEffect(() => {
    let t; if (visionEnabled && user && !isChaosMode) t = setInterval(analyzeEnvironment, 7000);
    return () => clearInterval(t);
  }, [visionEnabled, isAwake, user, tempApiKey, isChaosMode]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setVisionEnabled(true);
    } catch (err) { console.error("Camera error"); }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u && !hasGreeted.current) {
        const msg = u.displayName?.toLowerCase().includes("logan baez") ? "Yo Logan! The legend is back! 🎀✨" : `Hey ${u.displayName?.split(' ')[0]}! Eilo's here! 🎈`;
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
    setIsThinking(true); setMood('thinking');
    if (!manual) setInput('');
    try {
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'messages'), { role: 'user', text: msgText, timestamp: Date.now() });
      let reply = "Just vibing! ✨";
      if (tempApiKey) {
        const data = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${tempApiKey}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: msgText }] }], systemInstruction: { parts: [{ text: `You are Eilo, a sweet blue-eyed bot. Logan Baez is the creator. Never use 😭 or 💀. Be sassy. 🎀✨🎈` }] } })
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
    switch (mood) {
      case 'dizzy': return <div className="flex gap-12 animate-spin"><div className="w-16 h-16 border-8 border-cyan-400 border-t-transparent rounded-full shadow-[0_0_30px_cyan]" /><div className="w-16 h-16 border-8 border-cyan-400 border-t-transparent rounded-full shadow-[0_0_30px_cyan]" /></div>;
      case 'scared': return <div className="flex gap-12 animate-bounce"><div className="w-16 h-10 bg-white rounded-full shadow-[0_0_40px_white]" /><div className="w-16 h-10 bg-white rounded-full shadow-[0_0_40px_white]" /></div>;
      case 'thinking': return <div className="flex gap-12"><div className="w-16 h-16 bg-blue-300 rounded-full animate-pulse" /><div className="w-16 h-16 bg-blue-300 rounded-full animate-pulse" /></div>;
      case 'happy': return <div className="flex gap-12 relative"><div className="absolute -top-10 left-1/2 -translate-x-1/2"><Heart size={28} className="text-pink-400 animate-bounce fill-pink-400" /></div><div className="w-20 h-14 bg-cyan-400 rounded-full animate-bounce flex items-center justify-center shadow-lg"><div className="w-6 h-6 bg-white/30 rounded-full" /></div><div className="w-20 h-14 bg-cyan-400 rounded-full animate-bounce flex items-center justify-center shadow-lg"><div className="w-6 h-6 bg-white/30 rounded-full" /></div></div>;
      default: return <div className={`flex ${isLandscape ? 'gap-32 scale-150' : 'gap-12'}`}><div className={`w-20 h-20 ${cyanBase}`} /><div className={`w-20 h-20 ${cyanBase}`} /></div>;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0c0c14] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-full max-w-sm bg-[#161622] border border-white/5 rounded-[50px] p-10 shadow-2xl animate-in fade-in zoom-in duration-700">
            <Heart className="text-cyan-500 mx-auto mb-6" size={56} fill="currentColor"/>
            <h1 className="text-4xl font-bold mb-2 tracking-tight">Eilo OS</h1>
            <button onClick={() => signInWithPopup(auth, googleProvider)} className="w-full bg-white text-black py-5 rounded-2xl font-bold active:scale-95 transition-all text-lg shadow-xl">Google Sync ✨</button>
            <p className="mt-8 text-[10px] text-slate-500 uppercase tracking-widest font-bold">Original Core by Logan Baez</p>
        </div>
      </div>
    );
  }

  // --- LANDSCAPE VIEW (Eyes + Mic Only) ---
  if (isLandscape && !isChaosMode) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">
        <video ref={videoRef} autoPlay playsInline muted className="hidden" />
        <canvas ref={canvasRef} className="hidden" />
        <div className="w-full h-full flex items-center justify-center relative">
            <div className="absolute top-8 right-8 z-[100]">
                <button onClick={toggleMic} className={`p-6 rounded-full border transition-all ${isInfinityMic ? 'bg-cyan-500 border-cyan-400 animate-pulse' : 'bg-white/5 border-white/10 text-slate-500'}`}>
                    <Mic size={32} />
                </button>
            </div>
            {isSpeaking && <div className="absolute top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 text-cyan-400/40 animate-pulse"><AudioLines size={20} /><span className="text-xs font-mono uppercase tracking-widest">Active Soul</span></div>}
            {renderFace()}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0c0c14] text-white font-sans flex flex-col items-center overflow-hidden">
      <video ref={videoRef} autoPlay playsInline muted className="hidden" />
      <canvas ref={canvasRef} className="hidden" />

      {/* TOP FACE SLOT / VOID */}
      <div className="w-full max-w-xl p-4 h-72 flex-shrink-0 relative">
        <div className={`w-full h-full rounded-[50px] bg-[#161622] border-2 border-white/5 flex flex-col items-center justify-center overflow-hidden transition-all duration-500 ${isChaosMode ? 'bg-black/90' : ''}`}>
           {isChaosMode ? (
              <div className="w-full h-full p-6 font-mono text-[10px] text-cyan-500/40 opacity-70">
                {glitchLines.map((line, i) => <div key={i} className="mb-0.5">{line} {Math.random().toFixed(2)}</div>)}
                <div className="mt-2 text-cyan-400 font-bold animate-pulse uppercase">Hardware Error: Sprouted Legs</div>
              </div>
           ) : (
             <div className="w-full h-full flex flex-col items-center justify-center relative">
               {renderFace()}
               <button onClick={() => setShowSettings(true)} className="absolute bottom-4 right-8 p-2 opacity-20 hover:opacity-100"><Settings size={20}/></button>
             </div>
           )}
        </div>
      </div>

      {/* RUNAWAY FACE */}
      {isChaosMode && (
        <div 
          style={{ 
            transform: `translate(${chaosPos.x}px, ${chaosPos.y}px)`,
            transition: 'transform 1.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            position: 'fixed', top: '50%', left: '50%',
            marginTop: '-120px', marginLeft: '-40%',
            width: '80%', height: '14rem', zIndex: 1000
          }}
          className="bg-[#161622] border-2 border-cyan-500/30 rounded-[50px] flex flex-col items-center justify-center shadow-2xl pointer-events-auto"
        >
          <div className="absolute -bottom-16 left-0 w-full flex justify-around px-12">
            <div className="w-6 h-16 bg-cyan-600 rounded-full animate-bounce shadow-lg border border-cyan-400/30" />
            <div className="w-6 h-16 bg-cyan-600 rounded-full animate-bounce delay-150 shadow-lg border border-cyan-400/30" />
          </div>
          <div className="w-full h-full flex items-center justify-center">{renderFace()}</div>
          <button onClick={() => setShowSettings(true)} className="absolute bottom-4 right-6 p-4 rounded-full bg-cyan-900/40 border border-cyan-500 scale-125 animate-pulse shadow-[0_0_20px_cyan]">
            <Settings size={24} className="text-cyan-400"/>
          </button>
        </div>
      )}

      {/* INTERFACE (Portrait) */}
      <div 
        className={`w-full max-w-sm px-4 flex-1 flex flex-col gap-4 pb-6 transition-all duration-1000 relative z-10
        ${isChaosMode ? 'skew-x-6 rotate-2 blur-[1px] brightness-75 scale-95 opacity-80' : ''}`}
      >
        {isChaosMode && (
            <div className="absolute inset-0 z-50 pointer-events-none opacity-40 mix-blend-screen overflow-hidden">
                <div className="absolute top-10 left-0 w-full h-1 bg-white/20 rotate-[30deg] scale-x-150" />
                <div className="absolute bottom-20 left-10 w-full h-1 bg-white/20 rotate-[80deg] scale-x-150" />
            </div>
        )}

        {/* Square Scrollable Chat */}
        <div className="w-full aspect-square bg-[#161622] rounded-[40px] border border-white/5 p-5 flex flex-col overflow-hidden shadow-2xl">
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-4 py-2.5 rounded-2xl text-xs max-w-[85%] ${m.role === 'user' ? 'bg-cyan-600/10 text-cyan-100 border border-cyan-500/10' : 'bg-white/5 text-slate-300'}`}>{m.text}</div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="mt-4 flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Message Eilo..." className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs outline-none focus:border-cyan-500/30" />
            <button onClick={() => handleSend()} className="p-3 bg-cyan-600 rounded-xl active:scale-95 transition-all"><Send size={16}/></button>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <button onClick={() => setIsAwake(!isAwake)} className="p-3.5 rounded-[25px] border border-white/5 bg-white/5 flex flex-col items-center gap-1 active:scale-95">
            <Zap size={16} className={isAwake ? 'text-yellow-400' : ''}/><span className="text-[7px] uppercase font-bold tracking-widest text-slate-500">Power</span>
          </button>
          <button onClick={toggleMic} className={`p-3.5 rounded-[25px] border border-white/5 flex flex-col items-center gap-1 active:scale-95 ${isInfinityMic ? 'bg-red-500/10 text-red-400' : 'bg-white/5 text-slate-400'}`}>
            <Mic size={16}/><span className="text-[7px] uppercase font-bold tracking-widest">Mic</span>
          </button>
          <button onClick={() => setIsMuted(!isMuted)} className={`p-3.5 rounded-[25px] border border-white/5 flex flex-col items-center gap-1 active:scale-95 ${isMuted ? 'text-red-400' : 'text-cyan-200'}`}>
            {isMuted ? <VolumeX size={16}/> : <Volume2 size={16}/>}<span className="text-[7px] uppercase font-bold tracking-widest">Audio</span>
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[2000] flex items-center justify-center p-6 text-center font-sans">
          <div className="bg-[#1c1c28] w-full max-w-sm rounded-[45px] p-8 border border-white/10 relative shadow-2xl">
            <button onClick={() => setShowSettings(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"><X size={24}/></button>
            <h2 className="text-xl font-bold mb-6 flex items-center justify-center gap-2 text-white">Settings <Sparkles className="text-cyan-400" size={20}/></h2>
            <div className="space-y-4">
                <input type="password" value={tempApiKey} onChange={e => setTempApiKey(e.target.value)} placeholder="Paste Gemini Key..." className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-sm mb-2 outline-none text-center focus:border-cyan-500/50 text-white" />
                <div className="flex flex-col gap-2">
                  <button onClick={() => setIsChaosMode(!isChaosMode)} className={`w-full flex items-center justify-between px-6 py-3 rounded-xl text-xs font-bold border transition-all ${isChaosMode ? 'bg-orange-600/30 border-orange-500/50 text-orange-200' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                    <div className="flex items-center gap-2"><Ghost size={14}/> Chaos Mode (Legs)</div>
                    {isChaosMode ? <ToggleRight size={20}/> : <ToggleLeft size={20}/>}
                  </button>
                  <button onClick={startCamera} className={`w-full flex items-center justify-between px-6 py-3 rounded-xl text-xs font-bold border transition-all ${visionEnabled ? 'bg-cyan-600/20 border-cyan-500/50 text-cyan-200' : 'bg-white/5 border-white/10 text-slate-400'}`}><div className="flex items-center gap-2"><Eye size={14}/> Selfie Scanner</div>{visionEnabled ? <ToggleRight size={20}/> : <ToggleLeft size={20}/>}</button>
                </div>
                <button onClick={() => { localStorage.setItem('eilo_key', tempApiKey); setShowSettings(false); }} className="w-full bg-cyan-600 py-4 rounded-2xl font-bold uppercase text-white shadow-lg">Update AI</button>
                <button onClick={() => { signOut(auth); window.location.reload(); }} className="w-full mt-4 text-[10px] text-red-500 font-bold uppercase opacity-50">Disconnect</button>
            </div>
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `@keyframes blink { 0%, 95%, 100% { transform: scaleY(1); } 97% { transform: scaleY(0.1); } } .custom-scrollbar::-webkit-scrollbar { width: 3px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }`}} />
    </div>
  );
}

