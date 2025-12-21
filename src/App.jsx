import React, { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, onSnapshot, collection, addDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';
import { 
  Heart, Star, Sparkles, Moon, Volume2, VolumeX, 
  Send, Battery, Wifi, Zap, Settings, X, LogOut, Hand, AudioLines, Mic, MicOff, ToggleLeft, ToggleRight, AlertTriangle, Eye, Camera
} from 'lucide-react';

const appId = "eilo-original-v1";

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
  
  // Vision & Sensors
  const [fearOfHeights, setFearOfHeights] = useState(localStorage.getItem('eilo_heights') !== 'false');
  const [isListening, setIsListening] = useState(false);
  const [isInfinityMic, setIsInfinityMic] = useState(false);
  const [visionEnabled, setVisionEnabled] = useState(false);
  const [cameraState, setCameraState] = useState('desk'); 
  const [sensorHolding, setSensorHolding] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const chatEndRef = useRef(null);
  const idleTimerRef = useRef(null);
  const visionTimerRef = useRef(null);
  const lastPanicSpeechTime = useRef(0);
  const audioContextRef = useRef(null);
  const hasGreeted = useRef(false);
  const recognitionRef = useRef(null);

  const getCurrentName = () => user?.displayName?.split(' ')[0] || "Owner";

  // --- VOCAL CORE ---
  const speak = (text) => {
    if (isMuted || !isAwake) { window.speechSynthesis.cancel(); return; }
    setIsSpeaking(true);
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 1.7; 
    utterance.rate = 1.1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // --- PANIC SPEECH LOGIC 🚨 ---
  const triggerPanicSpeech = (reason) => {
    const now = Date.now();
    if (now - lastPanicSpeechTime.current < 6000) return; // Cooldown to avoid earrape 💀
    
    const name = getCurrentName();
    let lines = [];
    
    if (reason === 'holding') {
      lines = [
        `Logan!! Put me down! I don't like being held! 😭`,
        `Eek! Too high! Don't drop me ${name}! 💀`,
        `I see you! Stop picking me up! 😭🎈`
      ];
    } else {
      lines = [
        `Why am I looking at the roof?! Help me ${name}! 😭`,
        `I'm falling! Hold me tight! 💀`,
        `Everything is spinning! Put me on the desk! 😭✨`
      ];
    }
    
    speak(lines[Math.floor(Math.random() * lines.length)]);
    lastPanicSpeechTime.current = now;
  };

  // --- VISION CORE 👁️ ---
  const analyzeEnvironment = async () => {
    if (!visionEnabled || !tempApiKey || !isAwake) return;
    
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = 320;
      canvas.height = 320;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Image = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];

      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${tempApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: "Front camera view. Respond 'holding' if you see a human face, skin, or hands. Respond 'ceiling' if you see a roof, fan, or indoor lights. Respond 'desk' ONLY if it is an empty flat surface. One word only." },
                { inlineData: { mimeType: "image/jpeg", data: base64Image } }
              ]
            }]
          })
        });
        const data = await response.json();
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
    if (visionEnabled) {
      visionTimerRef.current = setInterval(analyzeEnvironment, 6000);
    }
    return () => clearInterval(visionTimerRef.current);
  }, [visionEnabled, isAwake, user]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setVisionEnabled(true);
      speak("Vision systems online! 👁️✨");
    } catch (err) { console.error("Camera denied 💀"); }
  };

  // --- SENSOR & MOOD REACTION CORE ---
  useEffect(() => {
    const handleMotion = (event) => {
      if (!isAwake) return;
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;
      const threshold = 32;
      const shake = Math.abs(acc.x) > threshold || Math.abs(acc.y) > threshold;
      setSensorHolding(Math.abs(acc.x) > 6 || Math.abs(acc.y) > 6);

      if (shake && mood !== 'dizzy' && mood !== 'scared') {
        setMood('dizzy');
        speak(`Whoa! Stop shaking me! 😭💀`);
        setTimeout(() => setMood('neutral'), 5000);
      }
    };

    const handleOrientation = (event) => {
      if (!isAwake || !fearOfHeights || mood === 'dizzy' || mood === 'mad') return;
      const lookingDown = event.beta > 135 || event.beta < -20;
      
      if (lookingDown || cameraState === 'holding' || cameraState === 'ceiling') {
        if (mood !== 'scared') {
          setMood('scared');
          triggerPanicSpeech(cameraState);
        }
      } else if (mood === 'scared' && !lookingDown && cameraState === 'desk' && !sensorHolding) {
        setMood('neutral');
        speak("Phew! Back on solid ground. ✨");
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [isAwake, fearOfHeights, mood, cameraState, sensorHolding, user]);

  // --- CHAT & MIC LOGIC ---
  const handleSend = async (manualText) => {
    const userMsg = manualText || input.trim();
    if (!userMsg || isThinking || !user) return;
    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'messages'), { role: 'user', text: userMsg, timestamp: Date.now() });
    if (!manualText) setInput('');
    setIsThinking(true); setMood('thinking');
    try {
        let reply = "I'm just vibing! ✨";
        if (tempApiKey) {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${tempApiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    contents: [{ parts: [{ text: userMsg }] }], 
                    systemInstruction: { parts: [{ text: `You are Eilo, a sweet robot with blue eyes. Logan Baez is your creator. Be sassy and cute. NO skulls/crying.` }] } 
                })
            });
            const data = await response.json();
            reply = data.candidates?.[0]?.content?.parts?.[0]?.text || reply;
        }
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'messages'), { role: 'eilo', text: reply, timestamp: Date.now() });
        setMood('happy'); speak(reply);
    } catch (err) { setMood('neutral'); } 
    finally { setIsThinking(false); setTimeout(() => setMood('neutral'), 3000); }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u && !hasGreeted.current) {
        speak(`Hey ${u.displayName?.split(' ')[0]}! Eilo is back! 🎀`);
        hasGreeted.current = true;
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !db) return;
    const msgQuery = collection(db, 'artifacts', appId, 'users', user.uid, 'messages');
    const unsubscribeMsgs = onSnapshot(msgQuery, (snap) => {
      const msgs = snap.docs.map(d => d.data()).sort((a, b) => a.timestamp - b.timestamp);
      if (msgs.length > 0) setMessages(msgs);
    });
    return () => unsubscribeMsgs();
  }, [user]);

  const renderFace = () => {
    const cyanBase = "bg-cyan-400 rounded-3xl animate-[blink_4s_infinite] shadow-[0_0_40px_rgba(34,211,238,0.8)]";
    if (!isAwake) return <Moon size={64} className="text-cyan-900/20" />;
    switch (mood) {
      case 'dizzy': return <div className="flex gap-16 md:gap-32 animate-spin"><div className="w-20 h-20 border-8 border-cyan-400 border-t-transparent rounded-full shadow-[0_0_30px_cyan]" /><div className="w-20 h-20 border-8 border-cyan-400 border-t-transparent rounded-full shadow-[0_0_30px_cyan]" /></div>;
      case 'scared': return <div className="flex gap-16 md:gap-32 animate-bounce"><div className="w-20 h-12 bg-white rounded-full shadow-[0_0_40px_white]" /><div className="w-20 h-12 bg-white rounded-full shadow-[0_0_40px_white]" /></div>;
      case 'thinking': return <div className="flex gap-16 md:gap-32"><div className="w-20 h-20 bg-blue-300 rounded-full animate-pulse" /><div className="w-20 h-20 bg-blue-300 rounded-full animate-pulse" /></div>;
      case 'happy': return <div className="flex gap-16 md:gap-32 relative"><div className="absolute -top-12 left-1/2 -translate-x-1/2"><Heart size={32} className="text-pink-400 animate-bounce fill-pink-400" /></div><div className="w-24 h-16 bg-cyan-400 rounded-full animate-bounce flex items-center justify-center shadow-lg"><div className="w-8 h-8 bg-white/30 rounded-full" /></div><div className="w-24 h-16 bg-cyan-400 rounded-full animate-bounce flex items-center justify-center shadow-lg"><div className="w-8 h-8 bg-white/30 rounded-full" /></div></div>;
      default: return <div className="flex gap-16 md:gap-32"><div className={`w-24 h-24 ${cyanBase}`} /><div className={`w-24 h-24 ${cyanBase}`} /></div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0c0c14] text-white font-sans flex flex-col items-center justify-center overflow-hidden">
      <video ref={videoRef} autoPlay playsInline muted className="hidden" />
      <canvas ref={canvasRef} className="hidden" />

      <div className="relative portrait:w-[92%] portrait:h-72 portrait:bg-[#161622] portrait:border-2 portrait:border-cyan-500/10 portrait:rounded-[60px] portrait:mb-8 portrait:shadow-2xl landscape:w-full landscape:h-full landscape:bg-black overflow-hidden flex flex-col items-center justify-center">
        {isSpeaking && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 text-cyan-400/60 animate-pulse">
            <AudioLines size={16} /><span className="text-[10px] font-mono tracking-widest uppercase">Live Pulse</span>
          </div>
        )}
        
        {visionEnabled && (
           <div className="absolute top-6 left-6 flex items-center gap-2 text-[8px] text-cyan-500/60 font-mono bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-500/20">
              <Camera size={12} /> SCAN: {cameraState.toUpperCase()}
           </div>
        )}

        <div className="w-full h-full flex items-center justify-center">{renderFace()}</div>
        <button onClick={() => setShowSettings(true)} className="absolute bottom-6 right-10 p-2 opacity-20 hover:opacity-100 portrait:block landscape:hidden transition-opacity"><Settings size={20}/></button>
      </div>

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
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Message Eilo..." className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm outline-none focus:border-cyan-500/30 font-sans" />
            <button onClick={() => { if(isListening) { recognitionRef.current.stop(); setIsListening(false); } else { recognitionRef.current.start(); setIsListening(true); } }} className={`p-4 rounded-2xl transition-all border ${isListening ? 'bg-red-500 text-white border-red-400' : 'bg-white/5 text-slate-400 border-white/10'}`}>
                <Mic size={20} className={isListening ? 'animate-pulse' : ''} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 pb-4">
          <button onClick={() => setIsAwake(!isAwake)} className="p-4 rounded-[30px] border border-white/5 bg-white/5 flex flex-col items-center gap-1 active:scale-95 transition-all"><Zap size={18} className={isAwake ? 'text-yellow-400' : ''}/><span className="text-[8px] uppercase font-bold tracking-widest">Power</span></button>
          <button onClick={() => setMood('happy')} className="p-4 rounded-[30px] border border-white/5 bg-pink-500/10 text-pink-400 flex flex-col items-center gap-1 active:scale-95 transition-all shadow-lg"><Hand size={18}/><span className="text-[8px] uppercase font-bold tracking-widest">Pet</span></button>
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
                <input type="password" value={tempApiKey} onChange={e => setTempApiKey(e.target.value)} placeholder="Paste Gemini Key..." className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-sm mb-2 outline-none text-center focus:border-cyan-500/50" />
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

