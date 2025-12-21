import React, { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, onSnapshot, collection, addDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';
import { 
  Heart, Star, Sparkles, Moon, Volume2, VolumeX, 
  Send, Battery, Wifi, Zap, Settings, X, LogOut, Hand, AudioLines, Mic, MicOff, ToggleLeft, ToggleRight, AlertTriangle
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
  
  const [fearOfHeights, setFearOfHeights] = useState(localStorage.getItem('eilo_heights') !== 'false');
  const [isListening, setIsListening] = useState(false);
  const [isInfinityMic, setIsInfinityMic] = useState(false);
  
  const chatEndRef = useRef(null);
  const idleTimerRef = useRef(null);
  const lastPetTime = useRef(0);
  const audioContextRef = useRef(null);
  const hasGreeted = useRef(false);
  const recognitionRef = useRef(null);

  const getCurrentName = () => user?.displayName?.split(' ')[0] || "Owner";
  const isCreator = () => user?.displayName?.toLowerCase().includes("logan baez");

  const speak = (text) => {
    if (isMuted) {
      window.speechSynthesis.cancel();
      return;
    }
    setIsSpeaking(true);
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 1.7; 
    utterance.rate = 1.1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const playClick = () => {
    if (isMuted) return;
    if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  };

  // --- RECALIBRATED MOTION SENSORS (NO MORE STAND PANIC) 📱 ---
  useEffect(() => {
    const handleMotion = (event) => {
      if (!isAwake) return;
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;
      const threshold = 30; // Even less sensitive to accidental bumps 😭
      const isShaking = Math.abs(acc.x) > threshold || Math.abs(acc.y) > threshold || Math.abs(acc.z) > threshold + 20;

      if (isShaking) {
        if (mood !== 'dizzy' && mood !== 'mad') {
          setMood('dizzy');
          const name = getCurrentName();
          speak(`Whoa! ${name}, stop shaking me! I'm so dizzy! 😭💀`);
          setTimeout(() => setMood('neutral'), 5000);
        }
      }
    };

    const handleOrientation = (event) => {
      if (!isAwake || !fearOfHeights || mood === 'dizzy' || mood === 'mad') return;
      
      // Stand logic fix: 
      // Most stands are tilted back (beta 40-80). 
      // Face-down/Looking over cliff is beta > 135.
      // If we are looking face-down (near 180), she gets scared.
      const lookingDown = event.beta > 135 || event.beta < -20;

      if (lookingDown) {
        if (mood !== 'scared') {
          setMood('scared');
          const name = getCurrentName();
          speak(`Eek! ${name}, are we falling?! Hold me! 😭💀`);
        }
      } else if (mood === 'scared') {
        setMood('neutral');
        speak("Phew, the ground looks safe now. ✨");
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [isAwake, fearOfHeights, mood, user]);

  // --- MIC LOGIC ---
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
        if (transcript.includes("hey eilo")) {
          const command = transcript.split("hey eilo").pop().trim();
          if (command) {
            handleSend(command);
            setMood('happy');
            setTimeout(() => setMood('neutral'), 1000);
          }
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
    if (isListening) { recognitionRef.current.stop(); setIsListening(false); setIsInfinityMic(false); }
    else { setIsListening(true); recognitionRef.current.start(); }
  };

  const toggleInfinityMic = () => {
    if (!recognitionRef.current) return;
    const nextState = !isInfinityMic;
    setIsInfinityMic(nextState);
    if (nextState) { setIsListening(true); recognitionRef.current.start(); speak("Infinity mic active. ✨"); }
    else { recognitionRef.current.stop(); setIsListening(false); speak("Infinity mic off. 🧸"); }
  };

  const getLocalResponse = (text) => {
    const t = text.toLowerCase();
    const name = getCurrentName();
    const logan = isCreator();
    if (t.includes("who made you") || t.includes("who created you")) return logan ? "You did, Logan! You're my goat creator! ✨" : "I was created from scratch by Logan Baez! 🎀";
    if (t.includes("hi") || t.includes("hello")) return `Hey ${name}! What's up? 🎀`;
    return `I'm just vibing with you, ${name}! 🧸`;
  };

  const triggerIdleAction = () => {
    if (!isAwake || isThinking || isSpeaking || mood !== 'neutral') return;
    const actions = ['sleeping', 'eating', 'rubik'];
    const choice = actions[Math.floor(Math.random() * actions.length)];
    setMood(choice);
    if (choice === 'sleeping') { speak("Zzz. Power nap time. Zzz."); setTimeout(() => setMood('neutral'), 12000); }
    if (choice === 'eating') { speak("Nom nom! I love my original snack! ✨"); let bites = 0; const munch = setInterval(() => { if (bites > 8) { clearInterval(munch); setMood('neutral'); return; } playClick(); bites++; }, 1500); }
    if (choice === 'rubik') { speak("Watch me solve this, I'm a pro. 🧩"); let moves = 0; const solve = setInterval(() => { if (moves > 12) { clearInterval(solve); setMood('neutral'); return; } playClick(); moves++; }, 1000); }
  };

  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (!['neutral', 'happy', 'thinking', 'mad', 'dizzy', 'scared'].includes(mood)) setMood('neutral');
    idleTimerRef.current = setTimeout(triggerIdleAction, 15000);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u && !hasGreeted.current) {
        const name = u.displayName?.split(' ')[0] || "Owner";
        const greeting = u.displayName?.toLowerCase().includes("logan baez") 
          ? `Yo Logan! My creator is home. ✨` 
          : `Hey ${name}! Eilo is online. 🎀`;
        setTimeout(() => speak(greeting), 1000);
        hasGreeted.current = true;
      }
    });
    resetIdleTimer();
    return () => { unsubscribe(); clearTimeout(idleTimerRef.current); window.speechSynthesis.cancel(); };
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

  const handleSend = async (manualText) => {
    const userMsg = manualText || input.trim();
    if (!userMsg || isThinking || !user) return;
    resetIdleTimer();
    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'messages'), { role: 'user', text: userMsg, timestamp: Date.now() });
    if (!manualText) setInput('');
    setIsThinking(true); setMood('thinking');
    try {
        let reply = getLocalResponse(userMsg);
        if (tempApiKey) {
            const userName = user.displayName || "Owner";
            const logan = isCreator();
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${tempApiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: userMsg }] }], systemInstruction: { parts: [{ text: `You are Eilo, a sweet robot with blue eyes. Logan Baez is your creator. ${logan ? "This user is Logan Baez!" : ""} NO skulls/crying.` }] } })
            });
            const data = await response.json();
            reply = data.candidates?.[0]?.content?.parts?.[0]?.text || reply;
        }
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'messages'), { role: 'eilo', text: reply, timestamp: Date.now() });
        setMood('happy'); speak(reply);
    } catch (err) { setMood('neutral'); speak(getLocalResponse(userMsg)); } 
    finally { setIsThinking(false); setTimeout(() => { setMood('neutral'); resetIdleTimer(); }, 3000); }
  };

  const handlePet = () => {
    if (!isAwake) return;
    const now = Date.now();
    if (now - lastPetTime.current < 2000) return; 
    lastPetTime.current = now;
    if (['sleeping', 'eating', 'rubik', 'dizzy', 'scared'].includes(mood)) {
        setMood('mad');
        const name = getCurrentName();
        speak(`Hey ${name}! I'm busy! 😭💀`);
        setTimeout(() => { setMood('neutral'); resetIdleTimer(); }, 4000);
        return;
    }
    setMood('happy');
    speak(["Ooh, nice! ✨", "Hehe, thanks! 🎀"][Math.floor(Math.random() * 2)]);
    setTimeout(() => { setMood('neutral'); resetIdleTimer(); }, 3000);
  };

  const renderFace = () => {
    const cyanBase = "bg-cyan-400 rounded-3xl animate-[blink_4s_infinite] shadow-[0_0_40px_rgba(34,211,238,0.8)]";
    if (!isAwake) return <div className="text-cyan-900/10 flex items-center justify-center h-full"><Moon size={64}/></div>;
    switch (mood) {
      case 'dizzy': return <div className="flex items-center justify-center gap-16 md:gap-32 h-full animate-spin"><div className="w-20 h-20 border-8 border-cyan-400 border-t-transparent rounded-full shadow-[0_0_30px_cyan]" /><div className="w-20 h-20 border-8 border-cyan-400 border-t-transparent rounded-full shadow-[0_0_30px_cyan]" /></div>;
      case 'scared': return <div className="flex items-center justify-center gap-16 md:gap-32 h-full animate-bounce"><div className="w-20 h-12 bg-cyan-100 rounded-full shadow-[0_0_40px_white]" /><div className="w-20 h-12 bg-cyan-100 rounded-full shadow-[0_0_40px_white]" /></div>;
      case 'thinking': return <div className="flex items-center justify-center gap-16 md:gap-32 h-full"><div className="w-20 h-20 bg-blue-300 rounded-full animate-pulse" /><div className="w-20 h-20 bg-blue-300 rounded-full animate-pulse" /></div>;
      case 'happy': return <div className="flex items-center justify-center gap-16 md:gap-32 h-full relative"><div className="absolute -top-12 flex gap-32"><Heart size={24} className="text-pink-400 animate-bounce fill-pink-400" /></div><div className="w-24 h-16 bg-cyan-400 rounded-full animate-bounce flex items-center justify-center shadow-lg"><div className="w-8 h-8 bg-white/30 rounded-full" /></div><div className="w-24 h-16 bg-cyan-400 rounded-full animate-bounce flex items-center justify-center shadow-lg"><div className="w-8 h-8 bg-white/30 rounded-full" /></div></div>;
      case 'sleeping': return <div className="flex items-center justify-center gap-16 md:gap-32 h-full relative"><div className="w-24 h-3 bg-cyan-600 rounded-full shadow-lg" /><div className="w-24 h-3 bg-cyan-600 rounded-full shadow-lg" /><div className="absolute top-1/4 right-1/4 text-cyan-400 text-3xl animate-pulse font-mono font-bold">Zzz...</div></div>;
      case 'eating': return <div className="h-full flex flex-col items-center justify-center pt-8"><div className="flex gap-16 md:gap-32 mb-6"><div className={`w-24 h-24 ${cyanBase}`} /><div className={`w-24 h-24 ${cyanBase}`} /></div><div className="flex items-center gap-4"><div className="w-8 h-12 bg-cyan-600 rounded-full shadow-md" /><div className="text-7xl animate-bounce">🥪</div><div className="w-8 h-12 bg-cyan-600 rounded-full shadow-md" /></div></div>;
      case 'rubik': return <div className="h-full flex flex-col items-center justify-center pt-8"><div className="flex gap-16 md:gap-32 mb-6"><div className={`w-20 h-20 ${cyanBase}`} /><div className={`w-20 h-20 ${cyanBase}`} /></div><div className="flex items-center gap-6"><div className="w-8 h-12 bg-cyan-600 rounded-full shadow-md" /><div className="grid grid-cols-3 grid-rows-3 gap-0.5 w-16 h-16 bg-black border-2 border-black rounded-lg animate-spin shadow-xl">{[...Array(9)].map((_, i) => <div key={i} className={`w-full h-full ${['bg-red-500', 'bg-blue-600', 'bg-green-500', 'bg-yellow-400', 'bg-orange-500', 'bg-white'][Math.floor(Math.random() * 6)]} rounded-sm`} />)}</div><div className="w-8 h-12 bg-cyan-600 rounded-full shadow-md" /></div></div>;
      case 'mad': return <div className="flex items-center justify-center gap-16 md:gap-32 h-full"><div className="w-24 h-10 bg-red-400 rounded-full rotate-12 shadow-[0_0_30px_red]" /><div className="w-24 h-10 bg-red-400 rounded-full -rotate-12 shadow-[0_0_30px_red]" /></div>;
      default: return <div className="flex items-center justify-center gap-16 md:gap-32 h-full"><div className={`w-24 h-24 ${cyanBase}`} /><div className={`w-24 h-24 ${cyanBase}`} /></div>;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0c0c14] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-sm bg-[#161622] border border-white/5 rounded-[50px] p-10 shadow-2xl">
            <Heart className="text-cyan-500 mx-auto mb-6" size={48} fill="currentColor"/>
            <h1 className="text-3xl font-bold mb-8 tracking-tight font-sans">Eilo OS</h1>
            <button onClick={() => signInWithPopup(auth, googleProvider)} className="w-full bg-white text-black py-4 rounded-2xl font-bold active:scale-95 transition-all">Google Sync ✨</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0c0c14] text-white font-sans flex flex-col items-center justify-center overflow-hidden" onMouseMove={resetIdleTimer} onTouchStart={resetIdleTimer}>
      
      <div className="relative portrait:w-[92%] portrait:h-72 portrait:bg-[#161622] portrait:border-2 portrait:border-cyan-500/10 portrait:rounded-[60px] portrait:mb-8 portrait:shadow-2xl landscape:w-full landscape:h-full landscape:bg-black overflow-hidden flex flex-col items-center justify-center">
        {isSpeaking && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 text-cyan-400/60 animate-pulse">
            <AudioLines size={16} /><span className="text-[10px] font-mono tracking-widest uppercase">Eilo Original</span>
          </div>
        )}

        <div className="hidden landscape:block absolute top-6 right-6 z-[60]">
            <button onClick={toggleInfinityMic} className={`p-3 rounded-full transition-all border ${isInfinityMic ? 'bg-cyan-500 text-white border-cyan-400 animate-pulse' : 'bg-white/5 text-slate-500 border-white/10'}`}>
              {isInfinityMic ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
        </div>

        <div onMouseMove={(e) => e.buttons === 1 && handlePet()} onTouchMove={handlePet} className="hidden landscape:block absolute top-0 left-0 w-full h-1/3 z-50 cursor-pointer" />
        <div className="w-full h-full flex items-center justify-center">{renderFace()}</div>
        <button onClick={() => setShowSettings(true)} className="absolute bottom-6 right-10 p-2 opacity-20 hover:opacity-100 portrait:block landscape:hidden transition-opacity"><Settings size={20}/></button>
      </div>

      <div className="w-full max-w-xl px-4 flex flex-col gap-4 h-[440px] portrait:flex landscape:hidden font-sans">
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
            <div className="relative flex-1">
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Message Eilo..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-sm outline-none focus:border-cyan-500/30" />
                <button onClick={() => handleSend()} className="absolute right-2 top-2 p-3 bg-cyan-600 rounded-xl shadow-lg"><Send size={18}/></button>
            </div>
            <button onClick={toggleMic} className={`p-4 rounded-2xl transition-all border ${isListening ? 'bg-red-500 text-white border-red-400 shadow-lg shadow-red-900/20' : 'bg-white/5 text-slate-400 border-white/10'}`}>
                {isListening ? <Mic size={20} className="animate-pulse" /> : <MicOff size={20} />}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 pb-4">
          <button onClick={() => setIsAwake(!isAwake)} className="p-4 rounded-[30px] border border-white/5 bg-white/5 flex flex-col items-center gap-1 active:scale-95 transition-all"><Zap size={18} className={isAwake ? 'text-yellow-400' : ''}/><span className="text-[8px] uppercase font-bold tracking-widest">Power</span></button>
          <button onClick={handlePet} className="p-4 rounded-[30px] border border-white/5 bg-pink-500/10 text-pink-400 flex flex-col items-center gap-1 active:scale-95 transition-all shadow-lg shadow-pink-900/10"><Hand size={18}/><span className="text-[8px] uppercase font-bold tracking-widest">Pet</span></button>
          <button onClick={() => setIsMuted(!isMuted)} className={`p-4 rounded-[30px] border border-white/5 flex flex-col items-center gap-1 active:scale-95 transition-all ${isMuted ? 'text-red-400 bg-red-400/5 border-red-500/20' : 'bg-white/5 text-cyan-200'}`}>
            {isMuted ? <VolumeX size={18}/> : <Volume2 size={18}/>}
            <span className="text-[8px] uppercase font-bold tracking-widest">Audio</span>
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6 text-center font-sans">
          <div className="bg-[#1c1c28] w-full max-w-sm rounded-[45px] p-8 border border-white/10 relative shadow-2xl">
            <button onClick={() => setShowSettings(false)} className="absolute top-8 right-8 text-slate-500 transition-colors"><X size={24}/></button>
            <h2 className="text-xl font-bold mb-6 flex items-center justify-center gap-2 text-white">Eilo Settings <Sparkles className="text-cyan-400" size={20}/></h2>
            <div className="space-y-4">
                <input type="password" value={tempApiKey} onChange={e => setTempApiKey(e.target.value)} placeholder="Paste Gemini Key..." className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-sm mb-2 outline-none text-center focus:border-cyan-500/50" />
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => {
                      const newState = !fearOfHeights;
                      setFearOfHeights(newState);
                      localStorage.setItem('eilo_heights', newState);
                    }} 
                    className={`w-full flex items-center justify-between px-6 py-3 rounded-xl text-xs font-bold border transition-all ${fearOfHeights ? 'bg-cyan-600/20 border-cyan-500/50 text-cyan-200' : 'bg-white/5 border-white/10 text-slate-400'}`}
                  >
                    <div className="flex items-center gap-2"><AlertTriangle size={14}/> Fear of Heights</div>
                    {fearOfHeights ? <ToggleRight size={20}/> : <ToggleLeft size={20}/>}
                  </button>
                </div>
                <button onClick={() => { localStorage.setItem('eilo_key', tempApiKey); setShowSettings(false); }} className="w-full bg-cyan-600 py-4 rounded-2xl font-bold uppercase active:scale-95 transition-all text-white shadow-lg shadow-cyan-900/20">Update AI</button>
                <button onClick={() => { signOut(auth); window.location.reload(); }} className="w-full mt-4 text-[10px] text-red-500 font-bold uppercase opacity-50">Disconnect</button>
            </div>
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `@keyframes blink { 0%, 95%, 100% { transform: scaleY(1); } 97% { transform: scaleY(0.1); } } .custom-scrollbar::-webkit-scrollbar { width: 3px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }`}} />
    </div>
  );
}

