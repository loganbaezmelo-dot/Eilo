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
  Send, Battery, Wifi, Cpu, Zap, MessageSquare, Settings, X, Key, Mail, LogOut, ChevronRight
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
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
  }, []);

  useEffect(() => {
    if (!user || !db) return;

    // Strict Path Rule: /artifacts/{appId}/users/{userId}/{collectionName}
    const msgQuery = collection(db, 'artifacts', appId, 'users', user.uid, 'messages');
    const unsubscribeMsgs = onSnapshot(msgQuery, (snap) => {
      const msgs = snap.docs.map(d => d.data()).sort((a, b) => a.timestamp - b.timestamp);
      if (msgs.length > 0) setMessages(msgs);
    }, (err) => {
      console.error("Firestore Error 💀: Check your rules!", err);
    });

    return () => unsubscribeMsgs();
  }, [user]);

  const handleGoogleLogin = async () => {
    try { await signInWithPopup(auth, googleProvider); } 
    catch (e) { setAuthError("Google Sign-in Failed 😭"); }
  };

  const handleEmailAuth = async (type) => {
    setAuthError('');
    try {
      if (type === 'signup') await createUserWithEmailAndPassword(auth, email, password);
      else await signInWithEmailAndPassword(auth, email, password);
    } catch (e) { setAuthError(e.message); }
  };

  const handleSend = async () => {
    if (!input.trim() || isThinking || !user) return;
    const userMsg = input.trim();
    
    // Log user message to Firestore
    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'messages'), {
      role: 'user', text: userMsg, timestamp: Date.now()
    });

    setInput('');
    setIsThinking(true);
    setMood('thinking');

    try {
        let reply = "I'm vibing! Paste your key in settings to talk! ✨";
        
        if (tempApiKey) {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${tempApiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: userMsg }] }],
                    systemInstruction: { parts: [{ text: "You are Eilo, a sweet, energetic robot. You love your owner. Use cute emojis like ✨, 🎀, 🧸. NEVER use skulls or crying emojis." }] }
                })
            });
            const data = await response.json();
            reply = data.candidates?.[0]?.content?.parts?.[0]?.text || reply;
        }

        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'messages'), {
            role: 'eilo', text: reply, timestamp: Date.now()
        });
        setMood('happy');
    } catch (err) { 
      setMood('neutral'); 
    } finally {
      setIsThinking(false);
      setTimeout(() => setMood('neutral'), 3000);
    }
  };

  const renderEyes = () => {
    const base = "bg-pink-400 rounded-3xl animate-[blink_4s_infinite] shadow-[0_0_35px_rgba(244,114,182,0.6)]";
    if (mood === 'thinking') return <div className="flex gap-16 md:gap-32"><div className="w-20 h-20 bg-cyan-300 rounded-full animate-pulse blur-[1px]" /><div className="w-20 h-20 bg-cyan-300 rounded-full animate-pulse blur-[1px]" /></div>;
    if (mood === 'happy') return <div className="flex gap-16 md:gap-32"><div className="w-24 h-16 bg-pink-400 rounded-full animate-bounce flex items-center justify-center"><div className="w-8 h-8 bg-white/20 rounded-full" /></div><div className="w-24 h-16 bg-pink-400 rounded-full animate-bounce flex items-center justify-center"><div className="w-8 h-8 bg-white/20 rounded-full" /></div></div>;
    if (!isAwake) return <div className="text-pink-900/10"><Moon size={48}/></div>;
    return <div className="flex gap-16 md:gap-32"><div className={`w-24 h-24 ${base}`} /><div className={`w-24 h-24 ${base}`} /></div>;
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Auth Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0c0c14] text-white flex flex-col items-center justify-center p-6 font-sans text-center">
        <div className="w-full max-w-sm bg-[#161622] border border-white/5 rounded-[50px] p-10 shadow-2xl">
            <Heart className="text-pink-500 mx-auto mb-6" size={48} fill="currentColor"/>
            <h1 className="text-3xl font-bold mb-8 tracking-tight">Eilo OS</h1>
            
            {authView === 'choice' ? (
              <div className="space-y-4">
                <button onClick={handleGoogleLogin} className="w-full bg-white text-black py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95">Google Login</button>
                <button onClick={() => setAuthView('email-login')} className="w-full bg-white/5 border border-white/10 py-4 rounded-2xl font-bold active:scale-95 transition-all">Email & Password</button>
              </div>
            ) : (
              <div className="space-y-4">
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-pink-500/50" />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-pink-500/50" />
                <button onClick={() => handleEmailAuth(authView === 'email-signup' ? 'signup' : 'login')} className="w-full bg-pink-600 py-4 rounded-xl font-bold active:scale-95 transition-all">
                  {authView === 'email-signup' ? 'Create Account' : 'Login'}
                </button>
                <p onClick={() => setAuthView(authView === 'email-login' ? 'email-signup' : 'email-login')} className="text-xs text-slate-500 cursor-pointer pt-2">{authView === 'email-login' ? "New? Sign up" : "Have account? Login"}</p>
                <p onClick={() => setAuthView('choice')} className="text-xs text-slate-600 cursor-pointer pt-1">Back</p>
                {authError && <p className="text-red-400 text-[10px] pt-2">{authError}</p>}
              </div>
            )}
        </div>
      </div>
    );
  }

  // Robot Screen
  return (
    <div className="fixed inset-0 bg-[#0c0c14] text-white font-sans flex flex-col items-center justify-center overflow-hidden">
      
      {/* FACE */}
      <div className={`relative transition-all duration-700 flex items-center justify-center portrait:w-[92%] portrait:h-64 portrait:bg-[#161622] portrait:border-2 portrait:border-pink-500/10 portrait:rounded-[60px] portrait:mb-8 portrait:shadow-2xl landscape:w-full landscape:h-full landscape:bg-black`}>
        <div className="absolute top-8 px-12 w-full flex justify-between items-center opacity-30 text-[10px] portrait:flex landscape:hidden font-mono tracking-widest uppercase">
          <div className="flex items-center gap-2 text-pink-400"><Heart size={10} fill="currentColor"/> {user.email?.split('@')[0]}'s Eilo</div>
          <div className="flex items-center gap-4"><Wifi size={10}/> SYNCED <Battery size={10}/> 100%</div>
        </div>
        {renderEyes()}
        <button onClick={() => setShowSettings(true)} className="absolute bottom-6 right-10 p-2 opacity-20 hover:opacity-100 portrait:block landscape:hidden transition-opacity">
          <Settings size={20} />
        </button>
      </div>

      {/* CHAT UI */}
      <div className="w-full max-w-xl px-4 flex flex-col gap-4 h-[440px] portrait:flex landscape:hidden">
        <div className="flex-1 bg-[#161622] rounded-[40px] border border-white/5 p-6 flex flex-col overflow-hidden shadow-2xl">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-5 py-3 rounded-3xl text-xs max-w-[85%] ${m.role === 'user' ? 'bg-pink-600/10 text-pink-100 border border-pink-500/10' : 'bg-white/5 text-slate-300'}`}>{m.text}</div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="mt-5 relative">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Message Eilo..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-sm outline-none focus:border-pink-500/30 transition-all" />
            <button onClick={handleSend} className="absolute right-2 top-2 p-3 bg-pink-600 rounded-xl shadow-lg active:scale-95 transition-all"><Send size={18}/></button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 pb-4">
          <button onClick={() => setIsAwake(!isAwake)} className={`p-5 rounded-[35px] border border-white/5 flex flex-col items-center gap-1 transition-all ${isAwake ? 'bg-white/5 text-pink-200' : 'bg-indigo-500/5 text-indigo-400 border-indigo-500/10'}`}>
            <Zap size={22} className={isAwake ? 'text-yellow-400 fill-yellow-400/20' : ''}/>
            <span className="text-[10px] font-black tracking-widest uppercase">Power</span>
          </button>
          <button onClick={() => setIsMuted(!isMuted)} className={`p-5 rounded-[35px] border border-white/5 flex flex-col items-center gap-1 transition-all ${isMuted ? 'text-red-400 bg-red-400/5' : 'bg-white/5 text-pink-200'}`}>
            {isMuted ? <VolumeX size={22}/> : <Volume2 size={22}/>}
            <span className="text-[10px] font-black tracking-widest uppercase">Audio</span>
          </button>
        </div>
      </div>

      {/* SETTINGS BOX */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6 text-center">
          <div className="bg-[#1c1c28] w-full max-w-sm rounded-[45px] p-8 border border-white/10 relative shadow-2xl">
            <button onClick={() => setShowSettings(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"><X size={24}/></button>
            <div className="w-16 h-16 bg-pink-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6"><Sparkles className="text-pink-400" size={32}/></div>
            <h2 className="text-xl font-bold mb-2">Eilo Heart Settings ✨</h2>
            <p className="text-xs text-slate-400 mb-8 leading-relaxed px-4">Paste your free Gemini API key below to wake up Eilo's artificial brain! 🧸🎀</p>
            <div className="space-y-4">
               <input type="password" value={tempApiKey} onChange={e => setTempApiKey(e.target.value)} placeholder="Paste Gemini Key..." className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-sm outline-none focus:border-pink-500/50 transition-all" />
               <button onClick={() => { localStorage.setItem('eilo_key', tempApiKey); setShowSettings(false); }} className="w-full bg-pink-600 py-4 rounded-2xl font-bold shadow-lg shadow-pink-900/20 active:scale-95 transition-all">SAVE BRAIN CORE</button>
               <button onClick={() => signOut(auth)} className="w-full text-[10px] text-red-500 font-black tracking-[0.2em] uppercase pt-4 opacity-50 hover:opacity-100 transition-opacity">Reset Connection</button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `@keyframes blink { 0%, 95%, 100% { transform: scaleY(1); } 97% { transform: scaleY(0.1); } } .custom-scrollbar::-webkit-scrollbar { width: 3px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }`}} />
    </div>
  );
}

