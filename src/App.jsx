import React, { useState, useEffect, useRef } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
import { doc, setDoc, onSnapshot, collection, addDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';
import { 
  Heart, Star, Sparkles, Moon, Volume2, VolumeX, 
  Send, Battery, Wifi, Cpu, Zap, MessageSquare, Settings, X, Key, Mail, LogOut
} from 'lucide-react';

const appId = "eilo-wholesome-pro-v1";

export default function App() {
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState('choice'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [mood, setMood] = useState('neutral');
  const [isMuted, setIsMuted] = useState(false);
  const [isAwake, setIsAwake] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(localStorage.getItem('eilo_key') || '');
  const chatEndRef = useRef(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
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

  const speak = async (text) => {
    if (isMuted || !tempApiKey) return;
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${tempApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Say in a cute, energetic robot voice: ${text}` }] }],
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
        const blob = new Blob([header, pcm], { type: 'audio/wav' });
        new Audio(URL.createObjectURL(blob)).play();
      }
    } catch (err) { console.error("Speech error:", err); }
  };

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
        let reply = "I'm vibing! ✨";
        if (tempApiKey) {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${tempApiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: userMsg }] }],
                    systemInstruction: { parts: [{ text: "You are Eilo, a sweet, energetic robot with cute blue eyes. Use emojis like ✨, 🎀, 🧸. NO skulls or crying." }] }
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
    } catch (err) { 
        setMood('neutral'); 
    } finally {
        setIsThinking(false);
        setTimeout(() => setMood('neutral'), 3000);
    }
  };

  const renderEyes = () => {
    const eyeBase = "bg-cyan-400 rounded-3xl animate-[blink_4s_infinite] shadow-[0_0_40px_rgba(34,211,238,0.8)]";
    if (!isAwake) return <div className="text-cyan-900/10 flex items-center justify-center h-full"><Moon size={64}/></div>;
    if (mood === 'thinking') return (
        <div className="flex items-center justify-center gap-16 md:gap-32 h-full">
          <div className="w-20 h-20 bg-blue-300 rounded-full animate-pulse blur-[1px]" />
          <div className="w-20 h-20 bg-blue-300 rounded-full animate-pulse blur-[1px]" />
        </div>
    );
    if (mood === 'happy') return (
        <div className="flex items-center justify-center gap-16 md:gap-32 h-full">
          <div className="w-24 h-16 bg-cyan-400 rounded-full animate-bounce flex items-center justify-center"><div className="w-8 h-8 bg-white/30 rounded-full" /></div>
          <div className="w-24 h-16 bg-cyan-400 rounded-full animate-bounce flex items-center justify-center"><div className="w-8 h-8 bg-white/30 rounded-full" /></div>
        </div>
    );
    return (
        <div className="flex items-center justify-center gap-16 md:gap-32 h-full">
          <div className={`w-24 h-24 ${eyeBase}`} />
          <div className={`w-24 h-24 ${eyeBase}`} />
        </div>
    );
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0c0c14] text-white flex flex-col items-center justify-center p-6 font-sans text-center">
        <div className="w-full max-w-sm bg-[#161622] border border-white/5 rounded-[50px] p-10 shadow-2xl">
            <Heart className="text-cyan-500 mx-auto mb-6" size={48} fill="currentColor"/>
            <h1 className="text-3xl font-bold mb-8 tracking-tight">Eilo OS</h1>
            <div className="space-y-4">
                <button onClick={() => signInWithPopup(auth, googleProvider)} className="w-full bg-white text-black py-4 rounded-2xl font-bold active:scale-95 transition-all">Google Sync ✨</button>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0c0c14] text-white font-sans flex flex-col items-center justify-center overflow-hidden">
      
      {/* FACE - UPDATED CENTERING LOGIC */}
      <div className="relative portrait:w-[92%] portrait:h-72 portrait:bg-[#161622] portrait:border-2 portrait:border-cyan-500/10 portrait:rounded-[60px] portrait:mb-8 portrait:shadow-2xl landscape:w-full landscape:h-full landscape:bg-black overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute top-8 px-12 w-full flex justify-between items-center opacity-30 text-[10px] portrait:flex landscape:hidden font-mono tracking-widest uppercase">
          <div className="flex items-center gap-2 text-cyan-400"><Heart size={10} fill="currentColor"/> EILO_OS</div>
          <div className="flex items-center gap-4"><Wifi size={10}/> ONLINE <Battery size={10}/> 100%</div>
        </div>
        
        {/* The Eyes Container - Forces perfect center */}
        <div className="w-full h-full flex items-center justify-center">
            {renderEyes()}
        </div>

        <button onClick={() => setShowSettings(true)} className="absolute bottom-6 right-10 p-2 opacity-20 hover:opacity-100 portrait:block landscape:hidden transition-opacity">
          <Settings size={20} />
        </button>
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
          <div className="mt-5 relative">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Message Eilo..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-sm outline-none focus:border-cyan-500/30 transition-all" />
            <button onClick={handleSend} className="absolute right-2 top-2 p-3 bg-cyan-600 rounded-xl shadow-lg active:scale-95 transition-all"><Send size={18}/></button>
          </div>
        </div>
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6 text-center">
          <div className="bg-[#1c1c28] w-full max-w-sm rounded-[45px] p-8 border border-white/10 relative shadow-2xl font-sans">
            <button onClick={() => setShowSettings(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"><X size={24}/></button>
            <h2 className="text-xl font-bold mb-6 flex items-center justify-center gap-2">Heart Core ✨</h2>
            <div className="space-y-4">
               <input type="password" value={tempApiKey} onChange={e => setTempApiKey(e.target.value)} placeholder="Paste Gemini Key..." className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-sm outline-none focus:border-cyan-500/50 transition-all text-center" />
               <button onClick={() => { localStorage.setItem('eilo_key', tempApiKey); setShowSettings(false); }} className="w-full bg-cyan-600 py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-all uppercase tracking-widest">Update AI</button>
               <button onClick={() => signOut(auth)} className="w-full text-[10px] text-red-500 font-black tracking-[0.2em] uppercase pt-4 opacity-50 hover:opacity-100 transition-opacity">Disconnect</button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `@keyframes blink { 0%, 95%, 100% { transform: scaleY(1); } 97% { transform: scaleY(0.1); } } .custom-scrollbar::-webkit-scrollbar { width: 3px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }`}} />
    </div>
  );
}

