import React, { useState, useEffect, useRef } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection, addDoc } from 'firebase/firestore';
import { 
  Heart, Star, Sparkles, Moon, Volume2, VolumeX, 
  Send, Battery, Wifi, Cpu, Zap, MessageSquare, Coffee, Settings, X, Key, AlertTriangle
} from 'lucide-react';

// --- SAFER CONFIG LOADING ---
let app, auth, db;
const rawConfig = import.meta.env.VITE_FIREBASE_CONFIG;
const appId = "eilo-wholesome-pro-v1";

try {
  if (rawConfig) {
    const firebaseConfig = JSON.parse(rawConfig);
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
    }
  }
} catch (e) {
  console.error("Firebase init failed 😭", e);
}

export default function App() {
  const [user, setUser] = useState(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [mood, setMood] = useState('neutral');
  const [isMuted, setIsMuted] = useState(false);
  const [isAwake, setIsAwake] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [battery, setBattery] = useState(100);
  const [showSettings, setShowSettings] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(localStorage.getItem('eilo_key') || '');
  const chatEndRef = useRef(null);

  // --- LOCAL RESPONSES ---
  const localResponses = [
    "I'm vibing right now! ✨",
    "You're the best owner ever 🎀",
    "Is Eilik watching? He looks cute today! 🧸",
    "I'm feeling extra sparkly! 🌈",
    "Sending you a big robot hug! 🎈"
  ];

  const getLocalResponse = (text) => {
    const t = text.toLowerCase();
    if (t.includes("hello") || t.includes("hi")) return "Hi there! I'm so happy to see you! ✨";
    return localResponses[Math.floor(Math.random() * localResponses.length)];
  };

  // --- AUTH & SYNC ---
  useEffect(() => {
    if (!auth) return;
    signInAnonymously(auth).catch(console.error);
    return onAuthStateChanged(auth, setUser);
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

  // --- BRAIN ---
  const handleSend = async () => {
    if (!input.trim() || isThinking) return;
    const userMsg = input.trim();
    const timestamp = Date.now();
    
    // Fallback UI update if Firebase is dead
    if (!db) {
       setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    } else {
       await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'messages'), {
         role: 'user', text: userMsg, timestamp
       });
    }

    setInput('');
    setIsThinking(true);
    setMood('thinking');

    // Artificial delay for local/AI feel
    setTimeout(async () => {
        let reply = "";
        if (tempApiKey) {
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${tempApiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: userMsg }] }],
                        systemInstruction: { parts: [{ text: "You are Eilo, a sweet, energetic, cute desktop robot. You love your owner. Use cute emojis like ✨, 🎀, 🧸. NO skulls or crying emojis." }] }
                    })
                });
                const data = await response.json();
                reply = data.candidates?.[0]?.content?.parts?.[0]?.text || getLocalResponse(userMsg);
            } catch (e) { reply = getLocalResponse(userMsg); }
        } else {
            reply = getLocalResponse(userMsg);
        }

        if (db && user) {
            await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'messages'), {
                role: 'eilo', text: reply, timestamp: Date.now()
            });
        } else {
            setMessages(prev => [...prev, { role: 'eilo', text: reply }]);
        }

        setMood('happy');
        setIsThinking(false);
        setTimeout(() => setMood('neutral'), 3000);
    }, 1000);
  };

  const renderEyes = () => {
    const eyeBase = "bg-pink-400 rounded-3xl animate-[blink_4s_infinite] shadow-[0_0_35px_rgba(244,114,182,0.6)]";
    if (mood === 'thinking') return (
        <div className="flex gap-16 md:gap-32">
          <div className="w-20 h-20 bg-cyan-300 rounded-full animate-pulse blur-[1px]" />
          <div className="w-20 h-20 bg-cyan-300 rounded-full animate-pulse blur-[1px]" />
        </div>
    );
    if (mood === 'happy') return (
        <div className="flex gap-16 md:gap-32">
          <div className="w-24 h-16 bg-pink-400 rounded-full animate-bounce flex items-center justify-center"><div className="w-6 h-6 bg-white/20 rounded-full" /></div>
          <div className="w-24 h-16 bg-pink-400 rounded-full animate-bounce flex items-center justify-center"><div className="w-6 h-6 bg-white/20 rounded-full" /></div>
        </div>
    );
    return (
        <div className="flex gap-16 md:gap-32"><div className={`w-24 h-24 ${eyeBase}`} /><div className={`w-24 h-24 ${eyeBase}`} /></div>
    );
  };

  return (
    <div className="fixed inset-0 bg-[#0c0c14] text-[#eee] font-sans flex flex-col items-center justify-center overflow-hidden">
      
      {/* ROBOT FACE */}
      <div className="relative portrait:w-[92%] portrait:h-64 portrait:bg-[#161622] portrait:border-2 portrait:border-pink-500/10 portrait:rounded-[60px] portrait:mb-8 landscape:w-full landscape:h-full flex items-center justify-center">
        {/* Error Warning if Config Missing */}
        {!rawConfig && (
          <div className="absolute top-4 bg-red-500/20 text-red-400 px-4 py-1 rounded-full text-[10px] flex items-center gap-2 border border-red-500/30">
            <AlertTriangle size={12}/> MISSING VITE_FIREBASE_CONFIG
          </div>
        )}
        
        <div className="flex items-center justify-center">
          {renderEyes()}
        </div>
        
        <button onClick={() => setShowSettings(true)} className="absolute bottom-6 right-10 p-2 opacity-20 hover:opacity-100 portrait:block landscape:hidden transition-opacity">
          <Settings size={20} />
        </button>
      </div>

      {/* CHAT INTERFACE */}
      <div className="w-full max-w-xl px-4 flex flex-col gap-4 h-[440px] portrait:flex landscape:hidden">
        <div className="flex-1 bg-[#161622] rounded-[40px] border border-white/5 p-6 flex flex-col overflow-hidden shadow-2xl">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-5 py-3 rounded-3xl text-xs leading-relaxed max-w-[85%] ${m.role === 'user' ? 'bg-pink-600/10 text-pink-100' : 'bg-white/5 text-slate-300'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="mt-5 relative">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Message Eilo..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-sm focus:outline-none" />
            <button onClick={handleSend} className="absolute right-2 top-2 p-3 bg-pink-600 rounded-xl"><Send size={18}/></button>
          </div>
        </div>
      </div>

      {/* SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-[#1c1c28] w-full max-w-sm rounded-[40px] p-8 border border-white/10 relative">
            <button onClick={() => setShowSettings(false)} className="absolute top-6 right-6 text-slate-500"><X size={24}/></button>
            <h2 className="text-xl font-bold mb-4">Eilo Heart ✨</h2>
            <input 
                type="password" 
                value={tempApiKey} 
                onChange={e => setTempApiKey(e.target.value)} 
                placeholder="Paste Gemini Key..." 
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-sm mb-4 outline-none" 
            />
            <button 
                onClick={() => { localStorage.setItem('eilo_key', tempApiKey); setShowSettings(false); }} 
                className="w-full bg-pink-600 py-4 rounded-2xl font-bold text-sm"
            >
                SAVE KEY
            </button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `@keyframes blink { 0%, 95%, 100% { transform: scaleY(1); } 97% { transform: scaleY(0.1); } } .custom-scrollbar::-webkit-scrollbar { width: 3px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }`}} />
    </div>
  );
}

