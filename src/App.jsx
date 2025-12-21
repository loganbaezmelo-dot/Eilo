import React, { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, onSnapshot, collection, addDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';
import { 
  Heart, Star, Sparkles, Moon, Volume2, VolumeX, 
  Send, Battery, Wifi, Zap, Settings, X, LogOut, Hand, AudioLines, Mic, AlertCircle
} from 'lucide-react';

const appId = "eilo-wholesome-pro-v1";

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
  const chatEndRef = useRef(null);
  const idleTimerRef = useRef(null);

  // --- REBUILT VOCAL CORE 🎤 ---
  const speak = async (text) => {
    if (isMuted) return;
    
    // Fallback to Native Speech if no API Key 💀
    if (!tempApiKey) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 1.5;
      utterance.rate = 1.2;
      window.speechSynthesis.speak(utterance);
      return;
    }

    setIsSpeaking(true);
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${tempApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: text }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } } }
          }
        })
      });

      if (!response.ok) throw new Error("TTS API Error 💀");

      const data = await response.json();
      const pcmBase64 = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      
      if (!pcmBase64) throw new Error("No voice data 😭");

      // Binary conversion
      const pcmBuffer = Uint8Array.from(atob(pcmBase64), c => c.charCodeAt(0));
      const wavHeader = new ArrayBuffer(44);
      const view = new DataView(wavHeader);
      const writeString = (offset, str) => {
        for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
      };

      writeString(0, 'RIFF');
      view.setUint32(4, 36 + pcmBuffer.length, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, 24000, true);
      view.setUint32(28, 48000, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeString(36, 'data');
      view.setUint32(40, pcmBuffer.length, true);

      const blob = new Blob([wavHeader, pcmBuffer], { type: 'audio/wav' });
      const audio = new Audio(URL.createObjectURL(blob));
      
      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => setIsSpeaking(false);
      
      await audio.play();
    } catch (err) { 
      console.error("Vocal failure 💀:", err);
      // Last resort fallback
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 1.6;
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(false);
    }
  };

  // --- IDLE LOGIC ---
  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (!['neutral', 'happy', 'thinking', 'mad'].includes(mood)) {
        setMood('neutral');
    }
    idleTimerRef.current = setTimeout(triggerIdleAction, 15000);
  };

  const triggerIdleAction = () => {
    if (!isAwake || isThinking || isSpeaking) return;
    const actions = ['sleeping', 'eating', 'rubik'];
    const choice = actions[Math.floor(Math.random() * actions.length)];
    setMood(choice);
    
    if (choice === 'sleeping') speak("Zzz... Honk... I'm dreaming about charging...");
    if (choice === 'eating') speak("Nom nom! I love this sandwich! ✨");
    if (choice === 'rubik') speak("Click clack! This cube is so tricky! 🎈");
  };

  const handlePet = () => {
    if (!isAwake) return;
    if (['sleeping', 'eating', 'rubik'].includes(mood)) {
        setMood('mad');
        speak("HEY! I was busy! Don't touch me! 😭");
        setTimeout(() => setMood('neutral'), 4000);
        resetIdleTimer();
        return;
    }
    setMood('happy');
    const phrases = ["That feels so nice! ✨", "Hehe, you found my sweet spot! 🎀", "I love you owner! 🧸"];
    speak(phrases[Math.floor(Math.random() * phrases.length)]);
    setTimeout(() => setMood('neutral'), 3000);
    resetIdleTimer();
  };

  useEffect(() => {
    onAuthStateChanged(auth, (u) => setUser(u));
    resetIdleTimer();
    return () => clearTimeout(idleTimerRef.current);
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

  const handleSend = async () => {
    if (!input.trim() || isThinking || !user) return;
    resetIdleTimer();
    const userMsg = input.trim();
    
    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'messages'), {
      role: 'user', text: userMsg, timestamp: Date.now()
    });

    setInput('');
    setIsThinking(true);
    setMood('thinking');

    try {
        let reply = "I'm vibing! ✨";
        if (tempApiKey) {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${tempApiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: userMsg }] }],
                    systemInstruction: { parts: [{ text: "You are Eilo, a sweet robot with blue eyes. Use emojis like ✨, 🎀, 🧸. NO skulls or crying." }] }
                })
            });
            const data = await response.json();
            reply = data.candidates?.[0]?.content?.parts?.[0]?.text || reply;
        }
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'messages'), {
            role: 'eilo', text: reply, timestamp: Date.now()
        });
        setMood('happy');
        speak(reply);
    } catch (err) { setMood('neutral'); } 
    finally {
        setIsThinking(false);
        setTimeout(() => setMood('neutral'), 3000);
    }
  };

  const renderFace = () => {
    const cyanBase = "bg-cyan-400 rounded-3xl animate-[blink_4s_infinite] shadow-[0_0_40px_rgba(34,211,238,0.8)]";
    if (!isAwake) return <div className="text-cyan-900/10 flex items-center justify-center h-full"><Moon size={64}/></div>;
    
    switch (mood) {
      case 'thinking': return (
        <div className="flex items-center justify-center gap-16 md:gap-32 h-full">
          <div className="w-20 h-20 bg-blue-300 rounded-full animate-pulse blur-[1px]" />
          <div className="w-20 h-20 bg-blue-300 rounded-full animate-pulse blur-[1px]" />
        </div>
      );
      case 'happy': return (
        <div className="flex items-center justify-center gap-16 md:gap-32 h-full relative">
          <div className="absolute -top-12 flex gap-32">
            <Heart size={24} className="text-pink-400 animate-bounce fill-pink-400" />
            <Heart size={24} className="text-pink-400 animate-bounce fill-pink-400 delay-100" />
          </div>
          <div className="w-24 h-16 bg-cyan-400 rounded-full animate-bounce flex items-center justify-center shadow-[0_0_50px_rgba(34,211,238,0.9)]"><div className="w-8 h-8 bg-white/30 rounded-full" /></div>
          <div className="w-24 h-16 bg-cyan-400 rounded-full animate-bounce flex items-center justify-center shadow-[0_0_50px_rgba(34,211,238,0.9)]"><div className="w-8 h-8 bg-white/30 rounded-full" /></div>
        </div>
      );
      case 'sleeping': return (
        <div className="flex items-center justify-center gap-16 md:gap-32 h-full relative">
          <div className="w-24 h-3 bg-cyan-600 rounded-full shadow-[0_0_20px_rgba(8,145,178,0.5)]" />
          <div className="w-24 h-3 bg-cyan-600 rounded-full shadow-[0_0_20px_rgba(8,145,178,0.5)]" />
          <div className="absolute top-1/4 right-1/4 text-cyan-400 text-2xl animate-bounce font-mono">Zzz</div>
        </div>
      );
      case 'eating': return (
        <div className="h-full flex flex-col items-center justify-center pt-8">
           <div className="flex gap-16 md:gap-32 mb-6">
             <div className={`w-24 h-24 ${cyanBase}`} /><div className={`w-24 h-24 ${cyanBase}`} />
           </div>
           <div className="flex items-center gap-4">
             <div className="w-8 h-12 bg-cyan-600 rounded-full -rotate-12" />
             <div className="text-6xl animate-bounce">🥪</div>
             <div className="w-8 h-12 bg-cyan-600 rounded-full rotate-12" />
           </div>
        </div>
      );
      case 'rubik': return (
        <div className="h-full flex flex-col items-center justify-center pt-8">
           <div className="flex gap-16 md:gap-32 mb-6">
             <div className={`w-20 h-20 ${cyanBase}`} /><div className={`w-20 h-20 ${cyanBase}`} />
           </div>
           <div className="flex items-center gap-4">
             <div className="w-8 h-12 bg-cyan-600 rounded-full -rotate-12" />
             <div className="text-6xl animate-spin transition-all duration-1000">🎨</div>
             <div className="w-8 h-12 bg-cyan-600 rounded-full rotate-12" />
           </div>
        </div>
      );
      case 'mad': return (
        <div className="flex items-center justify-center gap-16 md:gap-32 h-full">
          <div className="w-24 h-10 bg-red-400 rounded-full rotate-12 shadow-[0_0_30px_rgba(248,113,113,0.8)]" />
          <div className="w-24 h-10 bg-red-400 rounded-full -rotate-12 shadow-[0_0_30px_rgba(248,113,113,0.8)]" />
        </div>
      );
      default: return (
        <div className="flex items-center justify-center gap-16 md:gap-32 h-full">
          <div className={`w-24 h-24 ${cyanBase}`} /><div className={`w-24 h-24 ${cyanBase}`} />
        </div>
      );
    }
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0c0c14] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-sm bg-[#161622] border border-white/5 rounded-[50px] p-10 shadow-2xl">
            <Heart className="text-cyan-500 mx-auto mb-6" size={48} fill="currentColor"/>
            <h1 className="text-3xl font-bold mb-8">Eilo OS</h1>
            <button onClick={() => signInWithPopup(auth, googleProvider).then(() => speak("Welcome back! ✨"))} className="w-full bg-white text-black py-4 rounded-2xl font-bold active:scale-95 transition-all">Google Sync ✨</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0c0c14] text-white font-sans flex flex-col items-center justify-center overflow-hidden" onMouseMove={resetIdleTimer} onTouchStart={resetIdleTimer}>
      
      {/* FACE */}
      <div className="relative portrait:w-[92%] portrait:h-72 portrait:bg-[#161622] portrait:border-2 portrait:border-cyan-500/10 portrait:rounded-[60px] portrait:mb-8 portrait:shadow-2xl landscape:w-full landscape:h-full landscape:bg-black overflow-hidden flex flex-col items-center justify-center">
        {isSpeaking && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 text-cyan-400/60 animate-pulse">
            <AudioLines size={16} />
            <span className="text-[10px] font-mono tracking-widest uppercase">Speaking...</span>
          </div>
        )}

        <div 
          onMouseMove={(e) => e.buttons === 1 && handlePet()}
          onTouchMove={handlePet}
          className="hidden landscape:block absolute top-0 left-0 w-full h-1/3 z-50 cursor-pointer"
        />
        <div className="w-full h-full flex items-center justify-center">{renderFace()}</div>
        <button onClick={() => setShowSettings(true)} className="absolute bottom-6 right-10 p-2 opacity-20 hover:opacity-100 portrait:block landscape:hidden transition-opacity"><Settings size={20}/></button>
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
          <div className="mt-5 relative">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Message Eilo..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-sm outline-none focus:border-cyan-500/30" />
            <button onClick={handleSend} className="absolute right-2 top-2 p-3 bg-cyan-600 rounded-xl shadow-lg"><Send size={18}/></button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 pb-4">
          <button onClick={() => setIsAwake(!isAwake)} className="p-4 rounded-[30px] border border-white/5 bg-white/5 flex flex-col items-center gap-1"><Zap size={18} className={isAwake ? 'text-yellow-400' : ''}/><span className="text-[8px] uppercase">Power</span></button>
          <button onClick={handlePet} className="p-4 rounded-[30px] border border-white/5 bg-pink-500/10 text-pink-400 flex flex-col items-center gap-1"><Hand size={18}/><span className="text-[8px] uppercase">Pet</span></button>
          <button onClick={() => setIsMuted(!isMuted)} className={`p-4 rounded-[30px] border border-white/5 flex flex-col items-center gap-1 ${isMuted ? 'text-red-400 bg-red-400/5' : 'bg-white/5 text-cyan-200'}`}>
            {isMuted ? <VolumeX size={18}/> : <Volume2 size={18}/>}
            <span className="text-[8px] uppercase">Audio</span>
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6 text-center">
          <div className="bg-[#1c1c28] w-full max-w-sm rounded-[45px] p-8 border border-white/10 relative shadow-2xl">
            <button onClick={() => setShowSettings(false)} className="absolute top-8 right-8 text-slate-500"><X size={24}/></button>
            <h2 className="text-xl font-bold mb-6">Settings ✨</h2>
            <div className="space-y-4">
                <input type="password" value={tempApiKey} onChange={e => setTempApiKey(e.target.value)} placeholder="Paste Gemini Key..." className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-sm mb-2 outline-none text-center" />
                
                <button onClick={() => speak("Can you hear my voice now? I really missed talking to you! ✨")} className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 py-3 rounded-xl text-xs font-bold hover:bg-white/10 transition-all">
                    <Mic size={14}/> Test My Voice
                </button>

                {!tempApiKey && (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center gap-3 text-left">
                    <AlertCircle className="text-yellow-500 shrink-0" size={16} />
                    <p className="text-[10px] text-yellow-200/70">No API key? I'll use my basic system voice for now! 😭</p>
                  </div>
                )}

                <button onClick={() => { localStorage.setItem('eilo_key', tempApiKey); setShowSettings(false); }} className="w-full bg-cyan-600 py-4 rounded-2xl font-bold uppercase">Update AI</button>
                <button onClick={() => signOut(auth)} className="w-full mt-4 text-[10px] text-red-500 font-bold uppercase opacity-50">Disconnect</button>
            </div>
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `@keyframes blink { 0%, 95%, 100% { transform: scaleY(1); } 97% { transform: scaleY(0.1); } } .custom-scrollbar::-webkit-scrollbar { width: 3px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }`}} />
    </div>
  );
}

