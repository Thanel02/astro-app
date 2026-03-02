import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Helmet } from 'react-helmet';
import ReactGA from "react-ga4";
import { 
  Star, Moon, Sun, Lock, ChevronRight, User, Check, Sparkles, 
  ArrowLeft, Menu, X, LogOut, Loader2, MessageCircle, Send,
  Bot, AlertTriangle, AlertCircle, LayoutGrid, Bell, Clock, ShieldCheck, Mail, Key, Settings,
  ThumbsUp, Users, Shield
} from 'lucide-react';

// --- CONFIGURATION ---
const STRIPE_LINK = "https://buy.stripe.com/6oUdR8gX08J0cbO2q0dAk00"; 
const N8N_CHAT_WEBHOOK = "https://landingfactory.app.n8n.cloud/webhook/chat-voyance";
const CONTACT_EMAIL = "gestion@alteoconseil.fr";
const PRICE_TEXT = "2,99€/mois";
const FREE_CHAT_LIMIT = 3;
const GA_MEASUREMENT_ID = "G-V5V2VV84LG"; 

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

ReactGA.initialize(GA_MEASUREMENT_ID);

const VOYANTES = [
  { 
    id: 'nathalie', 
    name: 'Nathalie', 
    desc: 'Experte en relations amoureuses et psychologie du couple. Elle analyse les non-dits et les intentions profondes.', 
    style: 'Analytique & Intuitive', 
    image: '/nathalie-voyante-astropure.png', 
    hook: "Je ressens ses intentions...", 
    welcome: "Bonjour, je suis Nathalie. Je me spécialise dans les relations de cœur et l'analyse des sentiments. Quel est le prénom de la personne qui occupe vos pensées aujourd'hui ?",
    rating: 4.8, reviews: 892, isTop: true 
  },
  { 
    id: 'caroline', 
    name: 'Caroline', 
    desc: 'Médium pur de naissance. Ses flashs sont directs et sans complaisance.', 
    style: 'Sincère et Directe', 
    image: '/caroline-voyante-astropure.png', 
    hook: "Analyse urgente...", 
    welcome: "Bonjour, je suis Caroline. Posez-moi votre question, je vous écoute.",
    rating: 4.9, reviews: 1248, isTop: false
  },
  { 
    id: 'pierre', 
    name: 'Maître Pierre', 
    desc: 'Astrologue et Numérologue certifié. 30 ans d\'expertise sur les dates clés.', 
    style: 'Analytique et Expert', 
    image: '/pierre-voyant-astropure.png', 
    hook: "Configuration clé...", 
    welcome: "Bonjour, ici Pierre. Donnez-moi votre prénom pour commencer l'étude de votre ciel.",
    rating: 4.9, reviews: 2105, isTop: false
  }
];

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }) => {
  const baseStyle = "px-6 py-4 rounded-full font-bold transition-all duration-300 transform active:scale-95 shadow-sm flex items-center justify-center text-base";
  const variants = { primary: "bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-300", secondary: "bg-white text-indigo-900 border border-indigo-100" };
  return <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>{children}</button>;
};

const AuthView = ({ onAuthSuccess, isLoginMode, onCancel, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    try {
      if (isLoginMode) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error, data } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data?.user) await supabase.from('profiles').insert([{ id: data.user.id, is_premium: false }]);
      }
      onAuthSuccess();
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="flex items-center justify-center min-h-[70dvh] px-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border text-center relative">
        <button onClick={onCancel} className="absolute top-4 right-4 text-slate-400"><X size={20}/></button>
        <div className="mb-6 inline-flex p-3 bg-indigo-50 rounded-full text-indigo-600"><Lock size={24}/></div>
        <h2 className="text-2xl font-bold font-serif text-indigo-900">{isLoginMode ? 'Connexion' : 'Dernière étape'}</h2>
        <p className="text-xs text-slate-500 mt-2 mb-6">Créez votre compte pour sécuriser votre consultation et accéder au paiement.</p>
        <div className="space-y-4">
          <input type="email" placeholder="Votre email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border outline-none text-[16px]"/>
          <input type="password" placeholder="Mot de passe" value={password} onChange={e=>setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border outline-none text-[16px]"/>
          <Button onClick={handleAuth} disabled={loading} className="w-full">{loading ? <Loader2 className="animate-spin mx-auto"/> : "Continuer vers le paiement"}</Button>
        </div>
        <button onClick={onSwitchToLogin} className="mt-6 block w-full text-sm text-indigo-600 font-medium underline">
            {isLoginMode ? "Pas de compte ? S'inscrire" : "Déjà inscrit ? Se connecter"}
        </button>
      </div>
    </div>
  );
};

const ChatView = ({ psychic, isPremium, onGoBack, onAction, session }) => {
  const [messages, setMessages] = useState(() => {
    const key = `astro_hist_${psychic.id}_${session?.user?.id || 'anon'}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [{ role: 'assistant', content: psychic.welcome }];
  });
  const [globalUsage, setGlobalUsage] = useState(() => parseInt(localStorage.getItem(`astro_usage_${session?.user?.id || 'anon'}`) || "0"));
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typingStatus, setTypingStatus] = useState("");

  useEffect(() => {
    const key = `astro_hist_${psychic.id}_${session?.user?.id || 'anon'}`;
    localStorage.setItem(key, JSON.stringify(messages));
    localStorage.setItem(`astro_usage_${session?.user?.id || 'anon'}`, globalUsage.toString());
  }, [messages, globalUsage]);

  const handleSend = async () => {
    if (!input.trim() || loading || (!isPremium && globalUsage >= FREE_CHAT_LIMIT)) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);
    setGlobalUsage(prev => prev + 1);

    const statuses = [`${psychic.name} analyse vos vibrations...`, "Interprétation des signes...", "Rédaction de la vision..."];
    let step = 0;
    const interval = setInterval(() => { setTypingStatus(statuses[step % statuses.length]); step++; }, 1500);

    try {
      const response = await fetch(N8N_CHAT_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, voyanteId: psychic.id, userId: session?.user?.id || 'anonymous', isPremium })
      });
      const data = await response.json();
      clearInterval(interval);
      setMessages(prev => [...prev, { role: 'assistant', content: data.text || "La vision est floue pour le moment..." }]);
    } catch (e) { setMessages(prev => [...prev, { role: 'assistant', content: "La connexion spirituelle est instable..." }]); }
    finally { setLoading(false); setTypingStatus(""); }
  };

  const isLimitReached = !isPremium && globalUsage >= FREE_CHAT_LIMIT;

  return (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col md:max-w-2xl md:mx-auto shadow-2xl overflow-hidden overscroll-none">
      <div className="flex items-center gap-4 py-3 px-4 border-b bg-white flex-shrink-0 z-10">
        <button onClick={onGoBack} className="p-1.5 bg-slate-50 rounded-full"><ArrowLeft size={20}/></button>
        <div className="relative">
          <img src={psychic.image} className="w-10 h-10 rounded-full object-cover border" />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
        </div>
        <div><h3 className="font-bold text-sm leading-none">{psychic.name}</h3><p className="text-[10px] text-emerald-600 font-medium tracking-widest uppercase">Consultation en direct</p></div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col-reverse bg-slate-50/30">
        <div className="h-4 flex-shrink-0" />
        {isLimitReached && (
          <div className="bg-white border-2 border-indigo-600 p-8 rounded-[2rem] text-center space-y-6 shadow-2xl my-4 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto"><Sparkles size={32} /></div>
            <div>
              <p className="text-xl font-black text-indigo-900 leading-tight">Flash en cours...</p>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed italic">"Je m'arrête un instant... Ce que je vois dans la suite de votre tirage est très précis. Je dois canaliser toute mon énergie pour vous transmettre cette vision sans erreur."</p>
            </div>
            <Button onClick={onAction} className="w-full text-base font-black uppercase py-5 shadow-xl bg-indigo-600 hover:bg-indigo-700">CONTINUER MA CONSULTATION ({PRICE_TEXT})</Button>
            <div className="flex flex-col items-center gap-2 pt-2 border-t border-slate-100 opacity-70">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400"><ShieldCheck size={14} className="text-emerald-500"/> PAIEMENT 100% SÉCURISÉ & DISCRET</div>
                <div className="flex gap-4 h-3 grayscale">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" />
                </div>
            </div>
          </div>
        )}
        {loading && <div className="flex justify-start mb-4"><div className="bg-white border p-4 rounded-2xl rounded-bl-none shadow-sm italic text-[11px] text-indigo-400 font-bold uppercase tracking-tighter">{typingStatus}</div></div>}
        {[...messages].reverse().map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-[16px] shadow-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none'}`}>{m.content}</div>
          </div>
        ))}
      </div>
      {!isLimitReached && (
        <div className="p-3 border-t bg-white flex gap-2 flex-shrink-0">
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyPress={e=>e.key==='Enter' && handleSend()} placeholder="Écrivez votre message..." className="flex-1 bg-slate-50 rounded-2xl px-4 py-3 text-[16px] outline-none border border-transparent focus:border-indigo-100" />
          <button onClick={handleSend} className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg active:scale-90 transition-transform"><Send size={20}/></button>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [viewState, setViewState] = useState('list'); 
  const [selectedPsychic, setSelectedPsychic] = useState(null);
  const [session, setSession] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user) {
      supabase.from('profiles').select('is_premium').eq('id', session.user.id).single()
        .then(({data}) => {
            setIsPremium(!!data?.is_premium);
            // REDIRECTION STRIPE AUTOMATIQUE APRÈS INSCRIPTION/CONNEXION
            if (viewState === 'auth' && !data?.is_premium) {
                window.location.href = `${STRIPE_LINK}?client_reference_id=${session.user.id}`;
            }
        });
    }
  }, [session, viewState]);

  const handleAction = () => {
    if (!session) {
      setViewState('auth'); // Inscription -> Redirection auto vers Stripe via useEffect
    } else {
      window.location.href = `${STRIPE_LINK}?client_reference_id=${session.user.id}`;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Helmet>
        <title>AstroPure | Votre Consultation de Voyance Privée</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/> 
      </Helmet>

      {/* BANDEAU PROMO / URGENCE */}
      {viewState === 'list' && !selectedPsychic && (
        <div className="bg-indigo-600 text-white text-[10px] py-2.5 text-center font-black flex items-center justify-center gap-3 uppercase tracking-[0.2em] z-[60]">
          <Sparkles size={14} className="animate-pulse" />
          OFFRE LIMITÉE : VOS 3 PREMIERS MESSAGES OFFERTS
          <Sparkles size={14} className="animate-pulse" />
        </div>
      )}

      <nav className="bg-white border-b h-16 flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="font-serif font-bold text-xl text-indigo-900 flex items-center gap-2 cursor-pointer" onClick={() => {setViewState('list'); setSelectedPsychic(null);}}>
          <Moon className="text-indigo-600" size={24} fill="currentColor"/> AstroPure
        </div>
        {session ? (
            <button onClick={() => supabase.auth.signOut()} className="text-slate-400"><LogOut size={20}/></button>
        ) : (
            <button onClick={() => {setIsLoginMode(true); setViewState('auth');}} className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full uppercase border border-indigo-100">Connexion</button>
        )}
      </nav>

      <main className="flex-1 overflow-y-auto">
        {viewState === 'auth' ? (
            <AuthView 
              isLoginMode={isLoginMode} 
              onAuthSuccess={() => {}} 
              onCancel={() => setViewState('list')}
              onSwitchToLogin={() => setIsLoginMode(!isLoginMode)}
            />
        ) : (
            selectedPsychic ? (
                <ChatView psychic={selectedPsychic} isPremium={isPremium} onGoBack={() => setSelectedPsychic(null)} onAction={handleAction} session={session} />
            ) : (
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-serif font-black text-indigo-900 leading-tight">Posez votre question en direct</h1>
                        <p className="text-slate-500 text-sm mt-3 max-w-xs mx-auto">Recevez une guidance immédiate par chat privé avec nos médiums experts.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {VOYANTES.map(p => (
                            <div key={p.id} onClick={() => setSelectedPsychic(p)} className="bg-white rounded-[2.5rem] p-6 text-center border shadow-xl shadow-slate-200/50 cursor-pointer hover:border-indigo-300 transition-all group relative">
                                {p.isTop && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 text-[9px] font-black px-4 py-1.5 rounded-full uppercase shadow-sm whitespace-nowrap">Expert Coup de Cœur</div>}
                                <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-600 text-[8px] font-bold px-2 py-1 rounded-full uppercase flex items-center gap-1"><div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping"></div>En ligne</div>
                                <img src={p.image} className="w-28 h-28 rounded-full object-cover mx-auto mb-4 border-4 border-white shadow-md group-hover:scale-105 transition-transform" />
                                <div className="flex justify-center gap-1 text-amber-500 mb-2">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                                    <span className="text-xs font-bold text-slate-700 ml-1">{p.rating}</span>
                                </div>
                                <h3 className="font-bold text-xl text-indigo-900">{p.name}</h3>
                                <p className="text-indigo-600 text-[10px] font-black uppercase mb-3 tracking-widest">{p.style}</p>
                                <p className="text-xs text-slate-500 leading-relaxed mb-6 h-12 overflow-hidden italic">"{p.desc}"</p>
                                <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-xs uppercase shadow-lg shadow-indigo-100 group-hover:bg-indigo-700">Démarrer le chat gratuit</button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 bg-white p-8 rounded-[2rem] border border-slate-100 text-center space-y-4">
                        <div className="flex justify-center gap-8 opacity-40 h-5 grayscale">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" />
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paiement Sécurisé - Débit Bancaire Discret (Altéo Conseil)</p>
                    </div>
                </div>
            )
        )}
      </main>

      {viewState === 'list' && !selectedPsychic && (
        <footer className="text-center py-10 text-slate-400 text-[10px] pb-32">
            <p>© 2026 AstroPure - Mentions Légales - CGV</p>
            <p className="max-w-xs mx-auto mt-2 italic">Service de divertissement réservé aux personnes majeures.</p>
        </footer>
      )}

      {viewState === 'list' && !selectedPsychic && (
        <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t h-20 flex items-center justify-around z-50 px-6 shadow-2xl">
          <button onClick={() => setSelectedPsychic(null)} className="flex flex-col items-center gap-1.5 text-indigo-600 font-bold">
            <MessageCircle size={24}/><span className="text-[10px] uppercase">Voyance</span>
          </button>
          <div className="flex flex-col items-center gap-1.5 text-slate-300">
            <Moon size={24}/><span className="text-[10px] uppercase">Horoscope</span>
          </div>
        </div>
      )}
    </div>
  );
}