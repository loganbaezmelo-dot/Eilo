import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection, addDoc } from 'firebase/firestore';
import { 
  Heart, Star, Sparkles, Moon, Volume2, VolumeX, 
  Send, Battery, Wifi, Cpu, Zap, MessageSquare, Coffee 
} from 'lucide-react';

// Using the exact names for Vercel Environment Variables
const firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG || "{}");
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "eilo-wholesome-v1";

export default function App() {
  const [user, setUser] = useState(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [mood, setMood] = useState('neutral');
  const [isMuted, setIsMuted] = useState(false);
  const [isAwake, setIsAwake] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [battery, setBattery] = useState(100);
  const chatEndRef = useRef(null);

  // --- AUTH ---
  useEffect(() => {
    signInAnonymously(auth).catch(console.error);
    return onAuthStateChanged(auth, setUser);
  }, []);

  // --- DATA SYNC ---
  useEffect(() => {
    if (!user) return;

    const msgQuery = collection(db, 'artifacts', appId, 'users', user.uid, 'messages');
    const unsubscribeMsgs = onSnapshot(msgQuery, (snap) => {
      const msgs = snap.docs.map(d => d.data()).sort((a, b) => a.timestamp - b.timestamp);
      if (msgs.length > 0) setMessages(msgs);
    });

    const settingsDoc = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'core');
    const unsubscribeSettings = onSnapshot(settingsDoc, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setMood(data.mood || 'neutral');
        setIsAwake(data.isAwake ?? true);
        setIsMuted(data.isMuted ?? false);
      }
    });

    return () => {
      unsubscribeMsgs();
      unsubscribeSettings();
    };
  }, [user]);

  const saveState = async (updates) => {
    if (!user) return;
    const settingsDoc = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'core');
    await setDoc(settingsDoc, updates, { merge: true });
  };

  // --- AUDIO (TTS) ---
  const speak = async (text) => {
    if (isMuted) return;
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Say in a sweet, robotic, and cute tone: ${text}` }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } } }
          }
        })
      });
      const data = await response.json();
      const pcmData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (pcmData) {
        const pcm = Uint8Array.from(atob(pcmData), c => c.charCodeAt(0));
        const header = new ArrayBuffer(44);
        const d = new DataView(header);
        const s = (o, str) => { for (let i = 0; i < str.length; i++) d.setUint8(o + i, str.charCodeAt(i)); };
        s(0, 'RIFF'); d.setUint32(4, 36 + pcm.length, true); s(8, 'WAVE'); s(12, 'fmt ');
        d.setUint32(16, 16, true); d.setUint16(20, 1, true); d.setUint16(22, 1, true);
        d.setUint32(24, 24000, true); d.setUint32(28, 48000, true); d.setUint16(32, 2, true);
        d.setUint16(34, 16, true); s(36, 'data'); d.setUint32(40, pcm.length, true);
        new Audio(URL.createObjectURL(new Blob([header, pcm], { type: 'audio/wav' }))).play();
      }
    } catch (err) { console.error(err); }
  };

  // --- BRAIN ---
  const handleSend = async () => {
    if (!input.trim() || isThinking || !user) return;
    const userMsg = input.trim();
    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'messages'), {
      role: 'user', text: userMsg, timestamp: Date.now()
    });

    setInput('');
    setIsThinking(true);
    setMood('thinking');

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userMsg }] }],
          systemInstruction: { 
            parts: [{ text: "You are Eilo, a sweet and cute desktop robot. You love your owner. Use cute emojis like ✨, 🎀, 🧸, 🍭, and 🌈. NEVER use skulls or crying emojis. Keep responses short and upbeat." }] 
          }
        })
      });
      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm so happy! ✨";
      
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'messages'), {
        role: 'eilo', text: reply, timestamp: Date.now()
      });
      
      setMood('happy');
      speak(reply);
      await saveState({ mood: 'happy' });
    } catch (err) {
      setMood('neutral');
    } finally {
      setIsThinking(false);
      setTimeout(() => { setMood('neutral'); saveState({ mood: 'neutral' }); }, 3000);
    }
  };

  const renderEyes = () => {
    const eyeBase = "bg-pink-400 rounded-3xl animate-[blink_4s_infinite] shadow-[0_0_35px_rgba(244,114,182,0.6)]";
    switch (mood) {
      case 'happy':
        return (
          <div className="flex gap-16 md:gap-32">
            <div className="w-24 h-16 bg-pink-400 rounded-full animate-bounce flex items-center justify-center"><div className="w-6 h-6 bg-white/20 rounded-full" /></div>
            <div className="w-24 h-16 bg-pink-400 rounded-full animate-bounce flex items-center justify-center"><div className="w-6 h-6 bg-white/20 rounded-full" /></div>
          </div>
        );
      case 'thinking':
        return (
          <div className="flex gap-16 md:gap-32">
            <div className="w-20 h-20 bg-cyan-300 rounded-full animate-pulse blur-[1px]" />
            <div className="w-20 h-20 bg-cyan-300 rounded-full animate-pulse blur-[1px]" />
          </div>
        );
      case 'sleeping':
        return (
          <div className="flex gap-16 md:gap-32 opacity-20">
            <div className="w-24 h-3 bg-indigo-400 rounded-full" />
            <div className="w-24 h-3 bg-indigo-400 rounded-full" />
          </div>
        );
      default:
        return (
          <div className="flex gap-16 md:gap-32">
            <div className={`w-24 h-24 ${eyeBase}`} />
            <div className={`w-24 h-24 ${eyeBase}`} />
          </div>
        );
    }
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  return (
    <div className="fixed inset-0 bg-[#0c0c14] text-[#eee] font-sans flex flex-col items-center justify-center overflow-hidden">
      <div className={`relative transition-all duration-700 ease-in-out flex items-center justify-center portrait:w-[92%] portrait:h-64 portrait:bg-[#161622] portrait:border-2 portrait:border-pink-500/10 portrait:rounded-[60px] portrait:mb-8 portrait:shadow-2xl landscape:w-full landscape:h-full landscape:bg-black`}>
        <div className="absolute top-8 px-12 w-full flex justify-between items-center opacity-30 text-[10px] portrait:flex landscape:hidden font-mono tracking-widest">
          <div className="flex items-center gap-2 text-pink-400"><Heart size={10} fill="currentColor"/> EILO_HEART</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1"><Wifi size={10}/> {user ? 'SYNCED' : '...'}</div>
            <div className="flex items-center gap-1"><Battery size={10}/> {battery}%</div>
          </div>
        </div>
        <div className="flex items-center justify-center w-full h-full">
          {isAwake ? renderEyes() : <div className="text-pink-900/10 flex flex-col items-center gap-2"><Moon size={48}/></div>}
        </div>
      </div>
      <div className="w-full max-w-xl px-4 flex flex-col gap-4 h-[440px] portrait:flex landscape:hidden">
        <div className="flex-1 bg-[#161622] rounded-[40px] border border-white/5 p-6 flex flex-col overflow-hidden shadow-2xl">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center opacity-10 text-center p-8">
                <Coffee size={48} className="mb-4" />
                <p className="text-xs italic font-mono">"Waiting for you... ✨"</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-5 py-3 rounded-3xl text-xs leading-relaxed max-w-[85%] ${m.role === 'user' ? 'bg-pink-600/10 text-pink-100 border border-pink-500/10' : 'bg-white/5 text-slate-300'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="mt-5 relative">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Message Eilo..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-sm focus:outline-none focus:border-pink-500/30 transition-all" />
            <button onClick={handleSend} className="absolute right-2 top-2 p-3 bg-pink-600 text-white rounded-xl active:scale-95 transition-all"><Send size={18}/></button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 pb-4">
          <button onClick={() => { setIsMuted(!isMuted); saveState({ isMuted: !isMuted }); }} className={`p-5 rounded-[35px] border border-white/5 flex flex-col items-center gap-1 ${isMuted ? 'text-red-400 bg-red-400/5' : 'bg-white/5 text-pink-200'}`}>
            {isMuted ? <VolumeX size={22}/> : <Volume2 size={22}/>}
            <span className="text-[10px] font-black tracking-widest uppercase">Audio</span>
          </button>
          <button onClick={() => { setIsAwake(!isAwake); setMood(isAwake ? 'sleeping' : 'neutral'); saveState({ isAwake: !isAwake, mood: isAwake ? 'sleeping' : 'neutral' }); }} className="p-5 rounded-[35px] border border-white/5 bg-white/5 flex flex-col items-center gap-1 text-pink-200">
            <Zap size={22} className={isAwake ? 'text-yellow-400 fill-yellow-400/20' : 'text-slate-600'}/>
            <span className="text-[10px] font-black tracking-widest uppercase">Power</span>
          </button>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `@keyframes blink { 0%, 95%, 100% { transform: scaleY(1); } 97% { transform: scaleY(0.1); } } .custom-scrollbar::-webkit-scrollbar { width: 3px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }`}} />
    </div>
  );
}

