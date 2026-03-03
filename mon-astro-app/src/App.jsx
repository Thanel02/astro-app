import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Helmet } from 'react-helmet';
import ReactGA from "react-ga4";
import { 
  Star, Moon, Sun, Lock, ChevronRight, User, Check, Sparkles, 
  ArrowLeft, Menu, X, LogOut, Loader2, MessageCircle, Send,
  Bot, AlertTriangle, AlertCircle, LayoutGrid, Bell, Clock, ShieldCheck, Mail, Key, Settings,
  ThumbsUp, Users, Shield, Heart, Eye, Zap, Info, FileText
} from 'lucide-react';

// --- CONFIGURATION ---
const STRIPE_LINK = "https://buy.stripe.com/6oUdR8gX08J0cbO2q0dAk00"; 
const N8N_CHAT_WEBHOOK = "https://landingfactory.app.n8n.cloud/webhook/chat-voyance";
const CONTACT_EMAIL = "gestion@alteoconseil.fr";
const PRICE_TEXT = "2,99€/mois";
const FREE_CHAT_LIMIT = 2; 
const GA_MEASUREMENT_ID = "G-V5V2VV84LG"; 

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

ReactGA.initialize(GA_MEASUREMENT_ID);

const ZODIAC_SIGNS = [
  { id: 'belier', name: 'Bélier', icon: '♈' }, { id: 'taureau', name: 'Taureau', icon: '♉' },
  { id: 'gemeaux', name: 'Gémeaux', icon: '♊' }, { id: 'cancer', name: 'Cancer', icon: '♋' },
  { id: 'lion', name: 'Lion', icon: '♌' }, { id: 'vierge', name: 'Vierge', icon: '♍' },
  { id: 'balance', name: 'Balance', icon: '♎' }, { id: 'scorpion', name: 'Scorpion', icon: '♏' },
  { id: 'sagittaire', name: 'Sagittaire', icon: '♐' }, { id: 'capricorne', name: 'Capricorne', icon: '♑' },
  { id: 'verseau', name: 'Verseau', icon: '♒' }, { id: 'poissons', name: 'Poissons', icon: '♓' },
];

const VOYANTES = [
  { 
    id: 'nathalie', 
    name: 'Nathalie', 
    desc: 'Experte reconnue en relations amoureuses et psychologie du couple. Elle analyse les non-dits et les intentions profondes.', 
    style: 'Analytique & Intuitive', 
    image: '/nathalie-voyante-astropure.png', 
    welcome: "Bonjour, je suis Nathalie. Je me spécialise dans les relations de cœur. Quel est le prénom de la personne qui occupe vos pensées ?",
    rating: 4.8, reviews: 892, isTop: true 
  },
  { 
    id: 'caroline', 
    name: 'Caroline', 
    desc: 'Médium pur de naissance. Ses flashs sont directs et sans complaisance pour une voyance sans détour.', 
    style: 'Sincère et Directe', 
    image: '/caroline-voyante-astropure.png', 
    welcome: "Bonjour, je suis Caroline. Posez-moi votre question, je vous écoute.",
    rating: 4.9, reviews: 1248, isTop: false
  },
  { 
    id: 'pierre', 
    name: 'Maître Pierre', 
    desc: 'Astrologue certifié. Expert dans les cycles de vie et la détermination des périodes propices.', 
    style: 'Analytique et Expert', 
    image: '/pierre-voyant-astropure.png', 
    welcome: "Bonjour, ici Pierre. Donnez-moi votre prénom pour commencer l'étude de votre ciel.",
    rating: 4.9, reviews: 2105, isTop: false
  }
];

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }) => {
  const baseStyle = "px-6 py-4 rounded-full font-bold transition-all duration-300 transform active:scale-95 shadow-md flex items-center justify-center text-base";
  const variants = { primary: "bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-300", secondary: "bg-white text-indigo-900 border border-indigo-100" };
  return <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>{children}</button>;
};

const AuthView = ({ onAuthSuccess, isLoginMode, onCancel, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    ReactGA.event({ category: "Conversion", action: isLoginMode ? "Login_Attempt" : "Sign_Up_Start" });
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
      <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-slate-50 text-center relative">
        <button onClick={onCancel} className="absolute top-6 right-6 text-slate-300 hover:text-slate-500"><X size={24}/></button>
        <div className="mb-6 inline-flex p-4 bg-indigo-50 rounded-full text-indigo-600"><Lock size={28}/></div>
        <h2 className="text-2xl font-black font-serif text-indigo-950 mb-2">{isLoginMode ? 'Bon retour' : 'Dernière étape'}</h2>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed">Identifiez-vous pour débloquer votre analyse privée.</p>
        <div className="space-y-4">
          <input type="email" placeholder="Votre email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-100 transition-all"/>
          <input type="password" placeholder="Mot de passe" value={password} onChange={e=>setPassword(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-100 transition-all"/>
          <Button onClick={handleAuth} disabled={loading} className="w-full py-5 text-lg">{loading ? <Loader2 className="animate-spin mx-auto"/> : "Accéder à ma réponse"}</Button>
        </div>
        <button onClick={onSwitchToLogin} className="mt-8 block w-full text-sm text-indigo-600 font-bold underline">
            {isLoginMode ? "Pas de compte ? Créer mon profil" : "Déjà inscrit ? Me connecter"}
        </button>
      </div>
    </div>
  );
};

const ChatView = ({ psychic, isPremium, onGoBack, onAction, session }) => {
  const [messages, setMessages] = useState(() => {
    const key = `astro_hist_${psychic.id}_${session?.user?.id || 'anon'}`;
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
    if (session?.user?.id) {
        const anonSaved = localStorage.getItem(`astro_hist_${psychic.id}_anon`);
        if (anonSaved) return JSON.parse(anonSaved);
    }
    return [{ role: 'assistant', content: psychic.welcome }];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const key = `astro_hist_${psychic.id}_${session?.user?.id || 'anon'}`;
    localStorage.setItem(key, JSON.stringify(messages));
  }, [messages, session, psychic.id]);

  const handleSend = async () => {
    const userMsgCount = messages.filter(m => m.role === 'user').length;
    if (!input.trim() || loading || (!isPremium && userMsgCount >= 1)) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(N8N_CHAT_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, voyanteId: psychic.id, userId: session?.user?.id || 'anonymous', isPremium, history: messages.slice(-5)})
      });
      const data = await response.json();
      const delay = Math.floor(Math.random() * (3500 - 2000 + 1)) + 2000;
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: data.text || "Je reçois une vibration floue..." }]);
        setLoading(false);
      }, delay);
    } catch (e) { 
        setMessages(prev => [...prev, { role: 'assistant', content: "La connexion est instable." }]);
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col md:max-w-2xl md:mx-auto shadow-2xl overflow-hidden overscroll-none text-slate-900 font-sans">
      <div className="flex items-center gap-4 py-4 px-5 border-b bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <button onClick={onGoBack} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"><ArrowLeft size={20}/></button>
        <div className="relative">
          <img src={psychic.image} className="w-12 h-12 rounded-full object-cover border-2 border-indigo-50 shadow-sm" alt={psychic.name} />
          <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
        </div>
        <div className="flex-1">
            <h3 className="font-black text-[15px] text-indigo-950">{psychic.name}</h3>
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">En ligne • Privé</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col-reverse bg-slate-50/50">
        <div className="h-12 flex-shrink-0" />
        
        {loading && (
            <div className="flex justify-start mb-6">
                <div className="bg-white border border-slate-100 p-5 rounded-3xl rounded-bl-none shadow-sm flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce"></div>
                </div>
            </div>
        )}
        
        {[...messages].reverse().map((m, i) => {
          const isBlurry = !isPremium && m.role === 'assistant' && messages.filter(msg => msg.role === 'user').length >= 1 && i === 0;
          const splitPoint = 60; 
          const visiblePart = isBlurry ? m.content.substring(0, splitPoint) : m.content;
          const blurryPart = isBlurry ? m.content.substring(splitPoint) : "";

          return (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} mb-6 relative`}>
              <div className={`max-w-[92%] p-5 rounded-[1.75rem] text-[16px] leading-relaxed shadow-sm transition-all ${
                m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none'
              }`}>
                {visiblePart}
                {isBlurry && (
                    <div className="relative mt-2">
                        <span className="filter blur-[20px] opacity-25 select-none block leading-7">
                            {blurryPart || "Voici l'analyse complète que j'ai reçue pour vous. Les énergies indiquent un changement majeur qui va impacter votre situation très rapidement. Il est impératif d'anticiper cet événement pour ne pas être surprise. Cette personne cache quelque chose qui sera révélé bientôt."}
                        </span>
                        
                        <div className="absolute inset-x-0 -bottom-2 pt-14 pb-2 flex flex-col items-center justify-end z-20">
                            <div className="bg-white/98 p-8 rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.25)] border border-slate-100 text-center animate-in slide-in-from-bottom-12 w-full backdrop-blur-xl">
                                <p className="text-[17px] font-black text-indigo-950 leading-tight mb-8">
                                    Ma vision est complète.<br/>
                                    <span className="text-amber-600 uppercase text-xs tracking-widest">Accédez à votre vérité</span>
                                </p>

                                <button 
                                    onClick={onAction} 
                                    className="relative w-full bg-gradient-to-b from-amber-400 to-amber-600 text-white text-[18px] font-black py-6 rounded-2xl flex items-center justify-center gap-1.5 transition-all transform hover:scale-[1.02] active:translate-y-1 border-t border-amber-300 shadow-[0_8px_0_0_#b45309,0_15px_30px_rgba(0,0,0,0.3)]"
                                >
                                    RÉVÉLER MA RÉPONSE 
                                    <span className="text-[13px] font-bold opacity-90 ml-1">({PRICE_TEXT})</span>
                                </button>

                                <div className="space-y-3 mt-10">
                                    <p className="text-[11px] text-slate-600 font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                        <ShieldCheck size={16} className="text-emerald-500" /> Libellé discret : "Altéo Conseil"
                                    </p>
                                    <div className="flex flex-col gap-1 border-t border-slate-100 pt-4 opacity-70">
                                        <p className="text-[10px] text-slate-400">Accès immédiat • Désabonnement simple par email</p>
                                        <p className="text-[9px] text-slate-400 font-medium">En cliquant, vous acceptez les CGV et notre Politique de Confidentialité.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!( !isPremium && messages.filter(m => m.role === 'user').length >= 1 ) && (
        <div className="p-4 border-t bg-white flex gap-3 flex-shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] pb-10 md:pb-4">
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyPress={e=>e.key==='Enter' && handleSend()} placeholder="Posez votre question ici..." className="flex-1 bg-slate-50 rounded-2xl px-6 py-4 text-[16px] outline-none border-2 border-transparent focus:border-indigo-100 transition-all shadow-inner" />
          <button onClick={handleSend} className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg transition-transform active:scale-90"><Send size={24}/></button>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('voyance'); 
  const [viewState, setViewState] = useState('list'); 
  const [selectedPsychic, setSelectedPsychic] = useState(null);
  const [session, setSession] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [selectedSign, setSelectedSign] = useState(null);
  const [horoscope, setHoroscope] = useState(null);

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
            const premiumStatus = !!data?.is_premium;
            setIsPremium(premiumStatus);
            if (viewState === 'auth') {
                if (premiumStatus) setViewState('list');
                else window.location.href = `${STRIPE_LINK}?client_reference_id=${session.user.id}`;
            }
        });
    }
  }, [session, viewState]);

  useEffect(() => {
    if (selectedSign && supabase) {
      supabase.from('weekly_horoscopes').select('*').eq('sign_id', selectedSign.name).order('week_start_date', { ascending: false }).limit(1).single()
        .then(({data}) => setHoroscope(data));
      ReactGA.send({ hitType: "pageview", page: `/horoscope/${selectedSign.id}` });
    }
  }, [selectedSign]);

  const handleAction = () => {
    ReactGA.event({ category: "Conversion", action: "Click Payment Button", label: selectedPsychic?.name || "General" });
    if (!session) setViewState('auth');
    else window.location.href = `${STRIPE_LINK}?client_reference_id=${session.user.id}`;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      <Helmet><title>AstroPure | Cabinet de Voyance Spécialisée</title></Helmet>

      {viewState === 'list' && !selectedPsychic && !selectedSign && (
        <div className="bg-indigo-950 text-white text-[9px] py-3 text-center font-black flex items-center justify-center gap-4 uppercase tracking-[0.2em] z-[60]">
          <Shield size={14} className="text-indigo-400" /> Cabinet de Voyance Privé <Shield size={14} className="text-indigo-400" />
        </div>
      )}

      <nav className="bg-white/80 backdrop-blur-md border-b h-16 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="font-serif font-black text-2xl text-indigo-950 flex items-center gap-2 cursor-pointer" onClick={() => {setViewState('list'); setSelectedPsychic(null); setSelectedSign(null); setActiveTab('voyance');}}>
          <Moon className="text-indigo-600" size={28} fill="currentColor"/> AstroPure
        </div>
        {session ? (
            <button onClick={() => supabase.auth.signOut()} className="text-slate-400 p-2 hover:bg-slate-50 rounded-full transition-colors"><LogOut size={22}/></button>
        ) : (
            <button onClick={() => {setIsLoginMode(true); setViewState('auth');}} className="text-[11px] font-black text-indigo-600 bg-indigo-50/50 px-5 py-2.5 rounded-full uppercase border border-indigo-100 tracking-tight">Accès Client</button>
        )}
      </nav>

      <main className="flex-1 overflow-y-auto pb-32">
        {viewState === 'auth' ? (
            <AuthView isLoginMode={isLoginMode} onAuthSuccess={() => {}} onCancel={() => setViewState('list')} onSwitchToLogin={() => setIsLoginMode(!isLoginMode)}/>
        ) : (
          activeTab === 'horoscope' ? (
            selectedSign ? (
                <div className="max-w-2xl mx-auto p-4 animate-in fade-in">
                  <button onClick={() => { setSelectedSign(null); setHoroscope(null); }} className="mb-6 flex items-center text-slate-400 font-bold text-sm"><ArrowLeft size={20} className="mr-2"/>Retour</button>
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-xl space-y-8">
                    <h2 className="text-3xl font-serif font-black text-indigo-950 flex items-center gap-3">{selectedSign.icon} Horoscope {selectedSign.name}</h2>
                    <p className="text-slate-700 leading-relaxed italic text-lg border-l-4 border-indigo-100 pl-6 py-2">"{horoscope?.intro || "Les astres révèlent une configuration rare..."}"</p>
                    <div className="grid gap-8">
                      <div className="bg-rose-50/30 p-6 rounded-3xl border border-rose-50"><h3 className="font-black text-rose-600 text-xs uppercase mb-3 tracking-widest flex items-center gap-2"><Heart size={16}/> Cœur & Sentiments</h3><p className="text-[15px] text-slate-600 leading-relaxed">{horoscope?.love || "Stabilité à venir..."}</p></div>
                      <div className="bg-emerald-50/30 p-6 rounded-3xl border border-emerald-50"><h3 className="font-black text-emerald-700 text-xs uppercase mb-3 tracking-widest flex items-center gap-2"><Sparkles size={16}/> Carrière & Projets</h3><p className="text-[15px] text-slate-600 leading-relaxed">{horoscope?.work || "Changements positifs..."}</p></div>
                    </div>
                    {!isPremium && <div className="p-8 bg-indigo-950 text-white rounded-[2rem] text-center shadow-2xl relative overflow-hidden">
                        <Lock size={40} className="mx-auto mb-4 text-indigo-300"/>
                        <h4 className="text-xl font-black mb-2 uppercase tracking-tighter">Rapport Complet Verrouillé</h4>
                        <Button onClick={handleAction} variant="secondary" className="w-full py-5 text-indigo-950 font-black shadow-xl">DÉBLOQUER ({PRICE_TEXT})</Button>
                    </div>}
                  </div>
                </div>
              ) : (
                <div className="max-w-5xl mx-auto px-6 py-12">
                  <div className="text-center mb-16"><h1 className="text-4xl font-serif font-black text-indigo-950">Horoscope Hebdomadaire</h1></div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {ZODIAC_SIGNS.map(s => <div key={s.id} onClick={() => setSelectedSign(s)} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 cursor-pointer hover:border-indigo-300 hover:shadow-xl transition-all text-center group"><div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{s.icon}</div><div className="font-black text-indigo-950 text-lg uppercase tracking-tight">{s.name}</div></div>)}
                  </div>
                </div>
              )
          ) : (
            selectedPsychic ? (
                <ChatView psychic={selectedPsychic} isPremium={isPremium} onGoBack={() => setSelectedPsychic(null)} onAction={handleAction} session={session} />
            ) : (
                <div className="max-w-4xl mx-auto px-6 py-12">
                    <div className="text-center mb-16 px-4">
                        <h1 className="text-4xl font-serif font-black text-indigo-900 leading-tight">Cabinet de Voyance Privée</h1>
                        <p className="text-slate-500 text-base mt-4 max-w-sm mx-auto text-center font-medium">Réponse immédiate par chat sécurisé avec nos experts.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {VOYANTES.map(p => (
                            <div key={p.id} onClick={() => setSelectedPsychic(p)} className="bg-white rounded-[3rem] p-8 text-center border border-slate-100 shadow-xl hover:border-indigo-200 transition-all group relative">
                                {p.isTop && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 text-[10px] font-black px-6 py-2 rounded-full uppercase shadow-lg whitespace-nowrap">Expert Recommandé</div>}
                                <div className="absolute top-6 right-8 bg-emerald-100 text-emerald-600 text-[8px] font-bold px-2 py-1 rounded-full uppercase flex items-center gap-1 border border-emerald-100"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></div>En ligne</div>
                                <img src={p.image} className="w-32 h-32 rounded-full object-cover mx-auto mb-6 border-4 border-white shadow-xl group-hover:scale-105 transition-transform" />
                                
                                <div className="flex flex-col items-center gap-2 mb-4">
                                  <div className="flex items-center justify-center gap-1.5">
                                      <div className="flex text-amber-400">{[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}</div>
                                      <span className="text-sm font-black text-slate-800 ml-1">{p.rating}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-slate-400 text-[11px] uppercase font-bold tracking-widest"><Users size={14}/> <span>{p.reviews.toLocaleString()} consultations</span></div>
                                </div>

                                <h3 className="font-black text-2xl text-indigo-950 mb-1">{p.name}</h3>
                                <p className="text-indigo-600 text-[11px] font-black uppercase mb-4 tracking-[0.2em]">{p.style}</p>
                                <p className="text-sm text-slate-500 leading-relaxed mb-8 h-auto min-h-[60px] italic">"{p.desc}"</p>
                                <button className="w-full bg-indigo-900 text-white py-5 rounded-[1.5rem] font-black text-xs uppercase shadow-xl group-hover:bg-indigo-950 transition-all">Consulter {p.name}</button>
                            </div>
                        ))}
                    </div>

                    {/* SECTION LEGALE & RASSURANCE */}
                    <div className="mt-20 space-y-12">
                        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 text-center shadow-sm">
                            <div className="flex justify-center gap-12 opacity-50 mb-8 grayscale">
                              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-5" alt="Visa" />
                              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-5" alt="Mastercard" />
                            </div>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Paiement 100% Sécurisé & Débit Discret (Libellé : Altéo Conseil)</p>
                            <div className="flex justify-center gap-6 text-[10px] text-slate-400 font-bold border-t border-slate-50 pt-6">
                                <button className="hover:text-indigo-600 transition-colors uppercase">CGV</button>
                                <button className="hover:text-indigo-600 transition-colors uppercase">Politique de Confidentialité</button>
                                <button className="hover:text-indigo-600 transition-colors uppercase">Mentions Légales</button>
                            </div>
                        </div>

                        <div className="bg-indigo-50/50 p-8 rounded-[2rem] border border-indigo-100">
                            <div className="flex items-start gap-4">
                                <Info className="text-indigo-400 shrink-0 mt-1" size={20} />
                                <div className="space-y-3">
                                    <h5 className="font-black text-indigo-950 text-sm uppercase tracking-tight">Gestion de votre abonnement</h5>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        Notre service est proposé sous forme d'abonnement sans engagement à {PRICE_TEXT}. 
                                        Vous pouvez demander l'arrêt de votre abonnement à tout moment et sans motif par simple email à <strong>{CONTACT_EMAIL}</strong>. 
                                        Votre demande sera traitée sous 24h ouvrées.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <footer className="text-center pb-12">
                            <p className="text-[10px] text-slate-400 font-medium">© 2026 AstroPure • Service de divertissement réservé aux personnes majeures</p>
                        </footer>
                    </div>
                </div>
            )
          )
        )}
      </main>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/90 backdrop-blur-xl border border-white/20 h-20 rounded-[2.5rem] flex items-center justify-around z-50 px-8 shadow-[0_15px_50px_rgba(0,0,0,0.15)]">
        <button onClick={() => { setActiveTab('voyance'); setSelectedPsychic(null); setSelectedSign(null); setHoroscope(null); }} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'voyance' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
          <MessageCircle size={26} fill={activeTab === 'voyance' ? "currentColor" : "none"}/><span className="text-[10px] uppercase font-black tracking-widest">Voyance</span>
        </button>
        <button onClick={() => { setActiveTab('horoscope'); setSelectedSign(null); setSelectedPsychic(null); setHoroscope(null); }} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'horoscope' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
          <Moon size={26} fill={activeTab === 'horoscope' ? "currentColor" : "none"}/><span className="text-[10px] uppercase font-black tracking-widest">Horoscope</span>
        </button>
      </div>
    </div>
  );
}