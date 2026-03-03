import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Helmet } from 'react-helmet';
import ReactGA from "react-ga4";
import { 
  Star, Moon, Sun, Lock, ChevronRight, User, Check, Sparkles, 
  ArrowLeft, Menu, X, LogOut, Loader2, MessageCircle, Send,
  Bot, AlertTriangle, AlertCircle, LayoutGrid, Bell, Clock, ShieldCheck, Mail, Key, Settings,
  ThumbsUp, Users, Shield, Heart, Eye
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

// --- CONSTANTES ---
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
    hook: "Je ressens ses intentions...", 
    welcome: "Bonjour, je suis Nathalie. Je me spécialise dans les relations de cœur. Quel est le prénom de la personne qui occupe vos pensées ?",
    rating: 4.8, reviews: 892, isTop: true 
  },
  { 
    id: 'caroline', 
    name: 'Caroline', 
    desc: 'Médium pur de naissance. Ses flashs sont directs et sans complaisance pour une voyance sans détour.', 
    style: 'Sincère et Directe', 
    image: '/caroline-voyante-astropure.png', 
    hook: "Analyse urgente...", 
    welcome: "Bonjour, je suis Caroline. Posez-moi votre question, je vous écoute.",
    rating: 4.9, reviews: 1248, isTop: false
  },
  { 
    id: 'pierre', 
    name: 'Maître Pierre', 
    desc: 'Astrologue certifié. Expert dans les cycles de vie et la détermination des périodes propices.', 
    style: 'Analytique et Expert', 
    image: '/pierre-voyant-astropure.png', 
    hook: "Votre ciel bouge...", 
    welcome: "Bonjour, ici Pierre. Donnez-moi votre prénom pour commencer l'étude de votre ciel.",
    rating: 4.9, reviews: 2105, isTop: false
  }
];

// --- COMPOSANTS ---
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
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border text-center relative border-indigo-50">
        <button onClick={onCancel} className="absolute top-4 right-4 text-slate-400"><X size={20}/></button>
        <div className="mb-6 inline-flex p-3 bg-indigo-50 rounded-full text-indigo-600"><Lock size={24}/></div>
        <h2 className="text-2xl font-bold font-serif text-indigo-900">{isLoginMode ? 'Connexion' : 'Accéder à ma réponse'}</h2>
        <p className="text-xs text-slate-500 mt-2 mb-6">{isLoginMode ? 'Identifiez-vous pour continuer votre chat.' : 'Créez votre accès pour découvrir ce que la voyante a révélé.'}</p>
        <div className="space-y-4">
          <input type="email" placeholder="Votre email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border outline-none text-[16px]"/>
          <input type="password" placeholder="Mot de passe" value={password} onChange={e=>setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border outline-none text-[16px]"/>
          <Button onClick={handleAuth} disabled={loading} className="w-full">{loading ? <Loader2 className="animate-spin mx-auto"/> : (isLoginMode ? "Se connecter" : "Continuer")}</Button>
        </div>
        <button onClick={onSwitchToLogin} className="mt-6 block w-full text-sm text-indigo-600 font-medium underline">
            {isLoginMode ? "Pas de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
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
        body: JSON.stringify({ 
            message: userMsg, 
            voyanteId: psychic.id, 
            userId: session?.user?.id || 'anonymous', 
            isPremium,
            history: messages.slice(-5)
        })
      });
      const data = await response.json();
      
      // Délai aléatoire pour simuler la rédaction humaine
      const delay = Math.floor(Math.random() * (4000 - 2000 + 1)) + 2000;
      
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: data.text || "Je reçois une vibration floue, pouvez-vous reformuler ?" }]);
        setLoading(false);
      }, delay);
      
    } catch (e) { 
        setMessages(prev => [...prev, { role: 'assistant', content: "La connexion est instable. Je dois me reconcentrer." }]);
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col md:max-w-2xl md:mx-auto shadow-2xl overflow-hidden overscroll-none text-slate-900">
      <div className="flex items-center gap-4 py-3 px-4 border-b bg-white flex-shrink-0 z-10 shadow-sm">
        <button onClick={onGoBack} className="p-1.5 bg-slate-50 rounded-full"><ArrowLeft size={20}/></button>
        <div className="relative">
          <img src={psychic.image} className="w-10 h-10 rounded-full object-cover border" alt={psychic.name} />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
        </div>
        <div className="flex-1">
            <h3 className="font-bold text-sm leading-none">{psychic.name}</h3>
            <p className="text-[9px] text-emerald-600 font-bold tracking-widest uppercase">Consultation Privée</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col-reverse bg-[#fcfdff]">
        <div className="h-10 flex-shrink-0" />
        
        {loading && (
            <div className="flex justify-start mb-6">
                <div className="bg-white border-2 border-indigo-50 p-4 rounded-2xl rounded-bl-none shadow-sm flex flex-col gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce"></div>
                    </div>
                </div>
            </div>
        )}
        
        {[...messages].reverse().map((m, i) => {
          // Logique de flou pour TOUS les voyants après la première réponse
          const isBlurry = !isPremium && m.role === 'assistant' && messages.filter(msg => msg.role === 'user').length >= 1 && i === 0;
          
          const splitPoint = 60; 
          const visiblePart = isBlurry ? m.content.substring(0, splitPoint) : m.content;
          const blurryPart = isBlurry ? m.content.substring(splitPoint) : "";

          return (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} mb-4 relative`}>
              <div className={`max-w-[88%] p-4 rounded-2xl text-[16px] shadow-sm leading-relaxed transition-all ${
                m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none'
              }`}>
                {visiblePart}
                {isBlurry && (
                    <span className="filter blur-[14px] select-none opacity-40 block mt-2 leading-[1.6]">
                        {blurryPart || "Voici l'analyse complète que j'ai reçue pour vous. Les énergies indiquent un changement majeur qui va impacter votre situation très rapidement. Il est impératif d'anticiper cet événement pour ne pas être prise au dépourvu. Cette personne cache quelque chose."}
                    </span>
                )}
              </div>

              {isBlurry && (
                <div className="absolute inset-0 flex flex-col items-center justify-end z-20 pb-4">
                    <div className="bg-white/95 p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-2 border-indigo-50 text-center animate-in slide-in-from-bottom-10 w-[92%] mx-auto backdrop-blur-md">
                        <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Sparkles size={24} className="text-indigo-600 animate-pulse" />
                        </div>
                        <p className="text-[14px] font-black text-indigo-950 leading-tight mb-4 uppercase tracking-tight">
                            L'analyse de {psychic.name} est prête.<br/>
                            <span className="text-indigo-600">Découvrez votre vérité.</span>
                        </p>
                        <button onClick={onAction} className="bg-indigo-600 text-white text-[13px] font-black px-8 py-4 rounded-full uppercase shadow-xl hover:bg-indigo-700 transition-all w-full mb-3">
                            RÉVÉLER MA RÉPONSE ({PRICE_TEXT})
                        </button>
                        <div className="space-y-1">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight flex items-center justify-center gap-1">
                                <ShieldCheck size={12} className="text-emerald-500" /> Libellé discret : "Altéo Conseil"
                            </p>
                        </div>
                    </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!( !isPremium && messages.filter(m => m.role === 'user').length >= 1 ) && (
        <div className="p-4 border-t bg-white flex gap-3 flex-shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyPress={e=>e.key==='Enter' && handleSend()} placeholder="Posez votre question ici..." className="flex-1 bg-slate-50 rounded-2xl px-5 py-4 text-[16px] outline-none border-2 border-transparent focus:border-indigo-100 transition-all" />
          <button onClick={handleSend} className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg active:scale-90 transition-transform"><Send size={24}/></button>
        </div>
      )}
    </div>
  );
};

// --- APP ---
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
    }
  }, [selectedSign]);

  const handleAction = () => {
    if (!session) setViewState('auth');
    else window.location.href = `${STRIPE_LINK}?client_reference_id=${session.user.id}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Helmet><title>AstroPure | Cabinet de Voyance Spécialisée</title></Helmet>

      {viewState === 'list' && !selectedPsychic && !selectedSign && (
        <div className="bg-indigo-900 text-white text-[9px] py-2.5 text-center font-black flex items-center justify-center gap-3 uppercase tracking-widest z-[60]">
          <Shield size={12} className="text-indigo-400" /> Cabinet Privé - Experts en Relations de Couple <Shield size={12} className="text-indigo-400" />
        </div>
      )}

      <nav className="bg-white border-b h-16 flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="font-serif font-bold text-xl text-indigo-900 flex items-center gap-2 cursor-pointer" onClick={() => {setViewState('list'); setSelectedPsychic(null); setSelectedSign(null); setActiveTab('voyance');}}>
          <Moon className="text-indigo-600" size={24} fill="currentColor"/> AstroPure
        </div>
        {session ? (
            <button onClick={() => supabase.auth.signOut()} className="text-slate-400"><LogOut size={20}/></button>
        ) : (
            <button onClick={() => {setIsLoginMode(true); setViewState('auth');}} className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full uppercase border border-indigo-100">Accès Client</button>
        )}
      </nav>

      <main className="flex-1 overflow-y-auto">
        {viewState === 'auth' ? (
            <AuthView isLoginMode={isLoginMode} onAuthSuccess={() => {}} onCancel={() => setViewState('list')} onSwitchToLogin={() => setIsLoginMode(!isLoginMode)}/>
        ) : (
          activeTab === 'horoscope' ? (
            selectedSign ? (
                <div className="max-w-2xl mx-auto p-4 animate-in fade-in">
                  <button onClick={() => { setSelectedSign(null); setHoroscope(null); }} className="mb-4 flex items-center text-slate-400 text-sm"><ArrowLeft size={18} className="mr-2"/>Retour</button>
                  <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-6">
                    <h2 className="text-2xl font-serif font-bold text-indigo-900">{selectedSign.icon} Horoscope {selectedSign.name}</h2>
                    <p className="text-slate-700 leading-relaxed italic text-lg border-l-4 border-indigo-100 pl-4">"{horoscope?.intro || "Les astres révèlent une configuration rare..."}"</p>
                    <div className="grid gap-6">
                      <div className="bg-rose-50/50 p-4 rounded-2xl"><h3 className="font-bold text-rose-600 border-b border-rose-100 text-[10px] uppercase mb-2">Cœur & Sentiments</h3><p className="text-sm text-slate-600">{horoscope?.love || "Stabilité à venir..."}</p></div>
                      <div className="bg-emerald-50/50 p-4 rounded-2xl"><h3 className="font-bold text-emerald-700 border-b border-emerald-100 text-[10px] uppercase mb-2">Carrière & Projets</h3><p className="text-sm text-slate-600">{horoscope?.work || "Changements positifs..."}</p></div>
                    </div>
                    {!isPremium && <div className="p-6 bg-indigo-900 text-white rounded-3xl text-center shadow-xl"><Lock size={32} className="mx-auto mb-3 text-indigo-300"/><h4 className="font-bold mb-1">Rapport Complet Verrouillé</h4><p className="text-xs mb-4 text-indigo-200">Accédez à vos prévisions <strong>Famille</strong> et <strong>Chance</strong>.</p><Button onClick={handleAction} variant="secondary" className="w-full text-indigo-900 font-bold">DÉBLOQUER POUR {PRICE_TEXT}</Button></div>}
                  </div>
                </div>
              ) : (
                <div className="max-w-5xl mx-auto px-4 py-8">
                  <div className="text-center mb-10"><h1 className="text-3xl font-serif font-black text-indigo-900">Horoscope Hebdomadaire</h1></div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {ZODIAC_SIGNS.map(s => <div key={s.id} onClick={() => setSelectedSign(s)} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 cursor-pointer hover:border-indigo-300 transition-all text-center"><div className="text-4xl mb-2">{s.icon}</div><div className="font-bold text-indigo-900">{s.name}</div></div>)}
                  </div>
                </div>
              )
          ) : (
            selectedPsychic ? (
                <ChatView psychic={selectedPsychic} isPremium={isPremium} onGoBack={() => setSelectedPsychic(null)} onAction={handleAction} session={session} />
            ) : (
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-serif font-black text-indigo-900 leading-tight">Consultation de Voyance Privée</h1>
                        <p className="text-slate-500 text-sm mt-3 max-w-xs mx-auto text-center font-medium">Réponse immédiate par chat sécurisé avec nos experts.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-32">
                        {VOYANTES.map(p => (
                            <div key={p.id} onClick={() => setSelectedPsychic(p)} className="bg-white rounded-[2.5rem] p-6 text-center border shadow-xl shadow-slate-200/50 cursor-pointer hover:border-indigo-300 transition-all group relative">
                                {p.isTop && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 text-[9px] font-black px-4 py-1.5 rounded-full uppercase shadow-sm">Expert Recommandé</div>}
                                <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-600 text-[8px] font-bold px-2 py-1 rounded-full uppercase flex items-center gap-1"><div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping"></div>En ligne</div>
                                <img src={p.image} className="w-28 h-28 rounded-full object-cover mx-auto mb-4 border-4 border-white shadow-md group-hover:scale-105 transition-transform" />
                                
                                <div className="flex flex-col items-center gap-1 mb-3">
                                  <div className="flex items-center justify-center gap-1">
                                      <div className="flex text-amber-500">
                                        {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                                      </div>
                                      <span className="text-xs font-bold text-slate-700 ml-1">{p.rating}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-slate-400 text-[10px] uppercase font-bold tracking-tighter">
                                      <Users size={12}/> <span>{p.reviews.toLocaleString()} consultations</span>
                                  </div>
                                </div>

                                <h3 className="font-bold text-xl text-indigo-900">{p.name}</h3>
                                <p className="text-indigo-600 text-[10px] font-black uppercase mb-3 tracking-widest">{p.style}</p>
                                <p className="text-xs text-slate-500 leading-relaxed mb-6 h-auto min-h-[48px] italic">"{p.desc}"</p>
                                <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-xs uppercase shadow-lg shadow-indigo-100">Consulter {p.name}</button>
                            </div>
                        ))}
                    </div>
                    <div className="mt-12 bg-white p-8 rounded-[2rem] border border-slate-100 text-center space-y-5">
                        <div className="flex justify-center gap-8 opacity-60">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" alt="Visa" />
                          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4" alt="Mastercard" />
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Paiement 100% Sécurisé & Discret - Débit "Altéo Conseil"</p>
                    </div>
                </div>
            )
          )
        )}
      </main>

      <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t h-20 flex items-center justify-around z-50 px-6 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <button onClick={() => { setActiveTab('voyance'); setSelectedPsychic(null); setSelectedSign(null); setHoroscope(null); }} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'voyance' ? 'text-indigo-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}>
          <MessageCircle size={24} fill={activeTab === 'voyance' ? "currentColor" : "none"}/><span className="text-[10px] uppercase font-black">Voyance</span>
        </button>
        <button onClick={() => { setActiveTab('horoscope'); setSelectedSign(null); setSelectedPsychic(null); }} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'horoscope' ? 'text-indigo-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}>
          <Moon size={24} fill={activeTab === 'horoscope' ? "currentColor" : "none"}/><span className="text-[10px] uppercase font-black">Horoscope</span>
        </button>
      </div>
    </div>
  );
}