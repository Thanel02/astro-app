import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Helmet } from 'react-helmet';
import ReactGA from "react-ga4";
import { 
  Star, Moon, Lock, Check, Sparkles, ArrowLeft, X, LogOut, Loader2, 
  MessageCircle, Send, ShieldCheck, Mail, CreditCard, Info, Heart, Users, Shield, Zap
} from 'lucide-react';

// --- CONFIGURATION ---
const STRIPE_LINK = "https://buy.stripe.com/6oUdR8gX08J0cbO2q0dAk00"; 
const N8N_CHAT_WEBHOOK = "https://landingfactory.app.n8n.cloud/webhook/chat-voyance";
const CONTACT_EMAIL = "gestion@alteoconseil.fr";
const PRICE_TEXT = "2,99€/mois";
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
  { id: 'nathalie', name: 'Nathalie', desc: 'Experte reconnue en relations amoureuses.', style: 'Analytique & Intuitive', image: '/nathalie-voyante-astropure.png', welcome: "Bonjour, je suis Nathalie. Quel est le prénom de la personne qui occupe vos pensées ?", rating: 4.8, reviews: 892, isTop: true },
  { id: 'caroline', name: 'Caroline', desc: 'Médium pur de naissance. Flashs directs.', style: 'Sincère et Directe', image: '/caroline-voyante-astropure.png', welcome: "Bonjour, je suis Caroline. Posez-moi votre question.", rating: 4.9, reviews: 1248, isTop: false },
  { id: 'pierre', name: 'Maître Pierre', desc: 'Astrologue certifié. Expert cycles de vie.', style: 'Analytique et Expert', image: '/pierre-voyant-astropure.png', welcome: "Bonjour, ici Pierre. Donnez-moi votre prénom pour commencer.", rating: 4.9, reviews: 2105, isTop: false }
];

// --- UI COMPONENTS ---
const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }) => {
  const baseStyle = "px-6 py-4 rounded-full font-bold transition-all duration-300 transform active:scale-95 shadow-md flex items-center justify-center text-base cursor-pointer";
  const variants = { 
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-300", 
    secondary: "bg-white text-indigo-900 border border-indigo-100",
    danger: "bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100"
  };
  return <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>{children}</button>;
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-indigo-950/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b flex items-center justify-between bg-slate-50">
          <h3 className="font-black text-indigo-950 uppercase tracking-tight text-sm">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors"><X size={20}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 text-sm text-slate-600 leading-relaxed space-y-4">{children}</div>
      </div>
    </div>
  );
};

// --- VIEWS ---
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
        if (data?.user) await supabase.from('profiles').upsert([{ id: data.user.id, is_premium: false }]);
      }
      onAuthSuccess();
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="flex items-center justify-center min-h-[70dvh] px-4">
      <div className="bg-white p-8 rounded-[3rem] shadow-2xl w-full max-w-md border border-slate-50 text-center relative">
        <button onClick={onCancel} className="absolute top-6 right-6 text-slate-300 hover:text-slate-500"><X size={24}/></button>
        <div className="mb-6 inline-flex p-4 bg-indigo-50 rounded-full text-indigo-600"><Lock size={28}/></div>
        <h2 className="text-2xl font-black font-serif text-indigo-950 mb-2">{isLoginMode ? 'Bon retour' : 'Dernière étape'}</h2>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed">Identifiez-vous pour débloquer votre analyse privée.</p>
        <div className="space-y-4">
          <input type="email" placeholder="Votre email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-100 transition-all"/>
          <input type="password" placeholder="Mot de passe" value={password} onChange={e=>setPassword(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-100 transition-all"/>
          <Button onClick={handleAuth} disabled={loading} className="w-full py-5 text-lg">{loading ? <Loader2 className="animate-spin mx-auto"/> : (isLoginMode ? "Se connecter" : "Accéder à ma réponse")}</Button>
        </div>
        <button onClick={onSwitchToLogin} className="mt-8 block w-full text-sm text-indigo-600 font-bold underline">
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

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollContainerRef = useRef(null);

  // Correction du scroll : Utilisation d'un effet qui surveille la taille du contenu
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
    const key = `astro_hist_${psychic.id}_${session?.user?.id || 'anon'}`;
    localStorage.setItem(key, JSON.stringify(messages));
  }, [messages, loading]);

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
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: data.text || "La vibration est confuse, essayez de reformuler." }]);
        setLoading(false);
      }, 2500);
    } catch (e) { 
        setMessages(prev => [...prev, { role: 'assistant', content: "Connexion instable..." }]);
        setLoading(false);
    }
  };

  const showPaywall = !isPremium && messages.filter(m => m.role === 'user').length >= 1;

  return (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col md:max-w-2xl md:mx-auto shadow-2xl overflow-hidden overscroll-none">
      {/* Header */}
      <div className="flex items-center gap-4 py-4 px-5 border-b bg-white/95 backdrop-blur-md sticky top-0 z-20">
        <button onClick={onGoBack} className="p-2 bg-slate-50 rounded-full"><ArrowLeft size={20}/></button>
        <div className="relative">
          <img src={psychic.image} className="w-12 h-12 rounded-full object-cover border-2 border-indigo-50" alt={psychic.name} />
          <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
        </div>
        <div className="flex-1">
            <h3 className="font-black text-[15px] text-indigo-950">{psychic.name}</h3>
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">En ligne • Consultation Privée</p>
        </div>
      </div>

      {/* Message Area */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 bg-slate-50/50 flex flex-col gap-6 scroll-smooth"
      >
        {messages.map((m, i) => {
          const isBlured = showPaywall && m.role === 'assistant' && i === messages.length - 1;
          return (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-5 rounded-[1.75rem] text-[16px] leading-relaxed shadow-sm ${
                m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none'
              } ${isBlured ? 'max-h-24 overflow-hidden relative' : ''}`}>
                {isBlured ? (
                  <div className="blur-[10px] select-none opacity-40">
                    Cette réponse est cruciale pour votre avenir. Voici ce que je vois : Une rencontre imminente va bouleverser vos projets actuels. Il est essentiel d'être prêt à...
                  </div>
                ) : m.content}
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm flex items-center gap-1.5">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {showPaywall ? (
        <div className="px-4 py-8 bg-white border-t z-30 shadow-[0_-20px_40px_rgba(0,0,0,0.08)]">
          <div className="max-w-md mx-auto text-center space-y-5 animate-in slide-in-from-bottom-6">
            <h4 className="text-xl font-black text-indigo-950 tracking-tight">Révélation complète en attente</h4>
            <p className="text-sm text-slate-500">Pour lire l'analyse de {psychic.name} et poser vos questions en illimité, activez votre accès.</p>
            <button 
              onClick={onAction}
              className="w-full bg-gradient-to-b from-amber-400 to-amber-600 text-white py-5 rounded-2xl font-black text-lg shadow-[0_5px_0_0_#b45309] active:translate-y-1 active:shadow-none transition-all cursor-pointer flex flex-col items-center"
            >
              RÉVÉLER MA RÉPONSE
              <span className="text-[11px] opacity-90 font-bold tracking-widest">({PRICE_TEXT})</span>
            </button>
            <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <span className="flex items-center gap-1"><ShieldCheck size={14} className="text-emerald-500"/> Discret</span>
                <span className="flex items-center gap-1"><Zap size={14} className="text-amber-500"/> Immédiat</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 border-t bg-white flex gap-3 pb-10 md:pb-4 shadow-inner">
          <input 
            value={input} 
            onChange={e=>setInput(e.target.value)} 
            onKeyPress={e=>e.key==='Enter' && handleSend()} 
            placeholder="Écrivez votre question..." 
            className="flex-1 bg-slate-50 rounded-2xl px-6 py-4 outline-none border-2 border-transparent focus:border-indigo-100" 
          />
          <button onClick={handleSend} className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg active:scale-90 transition-transform"><Send size={24}/></button>
        </div>
      )}
    </div>
  );
};

// --- MAIN APP ---
export default function App() {
  const [activeTab, setActiveTab] = useState('voyance'); 
  const [viewState, setViewState] = useState('list'); 
  const [selectedPsychic, setSelectedPsychic] = useState(null);
  const [session, setSession] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [selectedSign, setSelectedSign] = useState(null);
  const [horoscope, setHoroscope] = useState(null);
  const [modalType, setModalType] = useState(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));
    return () => subscription.unsubscribe();
  }, []);

  // Logique de déblocage après Connexion/Inscription
  useEffect(() => {
    if (session?.user) {
      supabase.from('profiles').select('is_premium').eq('id', session.user.id).single()
        .then(({data}) => {
            const premiumStatus = !!data?.is_premium;
            setIsPremium(premiumStatus);
            if (viewState === 'auth') {
                if (premiumStatus) {
                  setViewState('list'); // Déjà payé, on revient
                } else {
                  // Pas encore payé, on envoie vers Stripe
                  window.location.href = `${STRIPE_LINK}?client_reference_id=${session.user.id}`;
                }
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
    if (!session) {
        setIsLoginMode(false); // On force l'inscription d'abord
        setViewState('auth');
    } else {
        window.location.href = `${STRIPE_LINK}?client_reference_id=${session.user.id}`;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      <Helmet><title>AstroPure | Voyance & Astrologie Privée</title></Helmet>

      {/* Nav */}
      <nav className="bg-white/90 backdrop-blur-md border-b h-16 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="font-serif font-black text-2xl text-indigo-950 flex items-center gap-2 cursor-pointer" onClick={() => {setViewState('list'); setSelectedPsychic(null); setSelectedSign(null); setActiveTab('voyance');}}>
          <Moon className="text-indigo-600" size={28} fill="currentColor"/> AstroPure
        </div>
        <div className="flex items-center gap-3">
            {isPremium && <button onClick={() => setModalType('account')} className="p-2 bg-indigo-50 text-indigo-600 rounded-full"><Users size={20} /></button>}
            {session ? (
                <button onClick={() => supabase.auth.signOut()} className="text-slate-400 p-2"><LogOut size={22}/></button>
            ) : (
                <button onClick={() => {setIsLoginMode(true); setViewState('auth');}} className="text-[11px] font-black text-indigo-600 bg-indigo-50/50 px-5 py-2.5 rounded-full uppercase border border-indigo-100 tracking-tight">Accès Client</button>
            )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-32">
        {viewState === 'auth' ? (
            <AuthView isLoginMode={isLoginMode} onAuthSuccess={() => {}} onCancel={() => setViewState('list')} onSwitchToLogin={() => setIsLoginMode(!isLoginMode)}/>
        ) : (
          activeTab === 'horoscope' ? (
            selectedSign ? (
              <div className="max-w-2xl mx-auto p-4 animate-in fade-in">
                <button onClick={() => setSelectedSign(null)} className="mb-6 flex items-center text-slate-400 font-bold text-sm"><ArrowLeft size={20} className="mr-2"/>Retour</button>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-xl space-y-8">
                  <h2 className="text-3xl font-serif font-black text-indigo-950 flex items-center gap-3">{selectedSign.icon} Horoscope {selectedSign.name}</h2>
                  <p className="text-slate-700 italic text-lg border-l-4 border-indigo-100 pl-6 py-2">"{horoscope?.intro || "Les astres révèlent une configuration rare..."}"</p>
                  <div className="grid gap-8">
                    <div className="bg-rose-50/30 p-6 rounded-3xl"><h3 className="font-black text-rose-600 text-xs uppercase mb-3 tracking-widest flex items-center gap-2"><Heart size={16}/> Cœur & Sentiments</h3><p className="text-[15px] text-slate-600">{horoscope?.love || "Stabilité à venir..."}</p></div>
                    <div className="bg-emerald-50/30 p-6 rounded-3xl"><h3 className="font-black text-emerald-700 text-xs uppercase mb-3 tracking-widest flex items-center gap-2"><Sparkles size={16}/> Carrière & Projets</h3><p className="text-[15px] text-slate-600">{horoscope?.work || "Changements positifs..."}</p></div>
                  </div>
                  {!isPremium && <div className="p-8 bg-indigo-950 text-white rounded-[2rem] text-center shadow-2xl relative">
                      <Lock size={40} className="mx-auto mb-4 text-indigo-300"/>
                      <h4 className="text-xl font-black mb-4 uppercase">Rapport Complet Verrouillé</h4>
                      <Button onClick={handleAction} variant="secondary" className="w-full py-5 text-indigo-950">DÉBLOQUER ({PRICE_TEXT})</Button>
                  </div>}
                </div>
              </div>
            ) : (
              <div className="max-w-5xl mx-auto px-6 py-12">
                <div className="text-center mb-16"><h1 className="text-4xl font-serif font-black text-indigo-950">Horoscope Hebdomadaire</h1></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {ZODIAC_SIGNS.map(s => <div key={s.id} onClick={() => setSelectedSign(s)} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 cursor-pointer hover:border-indigo-300 hover:shadow-xl transition-all text-center group"><div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{s.icon}</div><div className="font-black text-indigo-950 text-lg uppercase">{s.name}</div></div>)}
                </div>
              </div>
            )
          ) : (
            selectedPsychic ? (
                <ChatView psychic={selectedPsychic} isPremium={isPremium} onGoBack={() => setSelectedPsychic(null)} onAction={handleAction} session={session} />
            ) : (
                <div className="max-w-4xl mx-auto px-6 py-12">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl font-serif font-black text-indigo-900 leading-tight">Cabinet de Voyance Privée</h1>
                        <p className="text-slate-500 text-base mt-4 max-w-sm mx-auto">Consultez nos experts en direct pour une réponse immédiate et confidentielle.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {VOYANTES.map(p => (
                            <div key={p.id} onClick={() => setSelectedPsychic(p)} className="bg-white rounded-[3rem] p-8 text-center border border-slate-100 shadow-xl hover:border-indigo-200 transition-all group relative cursor-pointer">
                                {p.isTop && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 text-[10px] font-black px-6 py-2 rounded-full uppercase shadow-lg">Expert Recommandé</div>}
                                <img src={p.image} className="w-32 h-32 rounded-full object-cover mx-auto mb-6 border-4 border-white shadow-xl" />
                                <h3 className="font-black text-2xl text-indigo-950 mb-1">{p.name}</h3>
                                <p className="text-indigo-600 text-[11px] font-black uppercase mb-4 tracking-[0.2em]">{p.style}</p>
                                <p className="text-sm text-slate-500 italic mb-8 h-auto min-h-[60px]">"{p.desc}"</p>
                                <button className="w-full bg-indigo-900 text-white py-5 rounded-[1.5rem] font-black text-xs uppercase shadow-xl group-hover:bg-indigo-950">Consulter</button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 space-y-12">
                        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 text-center shadow-sm">
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Paiement 100% Sécurisé & Débit Discret</p>
                            <div className="flex justify-center flex-wrap gap-6 text-[10px] text-slate-400 font-bold border-t border-slate-50 pt-6">
                                <button onClick={() => setModalType('cgv')} className="hover:text-indigo-600 uppercase">CGV / CGU</button>
                                <button onClick={() => setModalType('privacy')} className="hover:text-indigo-600 uppercase">Confidentialité</button>
                                <button onClick={() => setModalType('mentions')} className="hover:text-indigo-600 uppercase">Mentions Légales</button>
                            </div>
                        </div>
                    </div>
                </div>
            )
          )
        )}
      </main>

      {/* Tabs */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/90 backdrop-blur-xl border border-white/20 h-20 rounded-[2.5rem] flex items-center justify-around z-50 px-8 shadow-[0_15px_50px_rgba(0,0,0,0.15)]">
        <button onClick={() => { setActiveTab('voyance'); setSelectedPsychic(null); setSelectedSign(null); }} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'voyance' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
          <MessageCircle size={26} fill={activeTab === 'voyance' ? "currentColor" : "none"}/><span className="text-[10px] uppercase font-black tracking-widest">Voyance</span>
        </button>
        <button onClick={() => { setActiveTab('horoscope'); setSelectedSign(null); setSelectedPsychic(null); }} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'horoscope' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
          <Moon size={26} fill={activeTab === 'horoscope' ? "currentColor" : "none"}/><span className="text-[10px] uppercase font-black tracking-widest">Horoscope</span>
        </button>
      </div>

      {/* Modales */}
      <Modal isOpen={modalType === 'cgv'} onClose={() => setModalType(null)} title="CGV / CGU">
        <h4 className="font-bold text-indigo-950">Abonnement</h4>
        <p>Tarif : {PRICE_TEXT} par mois. Sans engagement. Résiliation possible par simple email à {CONTACT_EMAIL}.</p>
        <h4 className="font-bold text-indigo-950">Nature du Service</h4>
        <p>AstroPure est un service de divertissement par chat et astrologie. Les réponses sont fournies à titre indicatif.</p>
      </Modal>

      <Modal isOpen={modalType === 'privacy'} onClose={() => setModalType(null)} title="Politique de Confidentialité">
        <h4 className="font-bold text-indigo-950">Données Personnelles</h4>
        <p>Nous collectons votre adresse e-mail pour la gestion de votre abonnement et l'historique de vos conversations.</p>
        <h4 className="font-bold text-indigo-950">Confidentialité du Chat</h4>
        <p>Vos conversations sont strictement privées et cryptées. Elles ne sont jamais partagées avec des tiers.</p>
        <h4 className="font-bold text-indigo-950">Sécurité des paiements</h4>
        <p>Le traitement des paiements est assuré par Stripe (leader mondial sécurisé). Aucune coordonnée bancaire ne transite sur nos serveurs.</p>
      </Modal>

      <Modal isOpen={modalType === 'mentions'} onClose={() => setModalType(null)} title="Mentions Légales">
        <p><strong>Editeur :</strong> ALTEO CONSULTING</p>
        <p><strong>Adresse :</strong> 2 RUE NOTRE-DAME DES VICTOIRES, 75002 PARIS</p>
        <p><strong>SIRET :</strong> 99335347300016</p>
        <p><strong>Capital social :</strong> 5 000,00 €</p>
        <p><strong>Contact :</strong> {CONTACT_EMAIL}</p>
      </Modal>

      <Modal isOpen={modalType === 'account'} onClose={() => setModalType(null)} title="Mon Compte Premium">
        <div className="space-y-6">
            <div className="bg-indigo-50 p-6 rounded-3xl flex items-center justify-between">
                <div><p className="text-[10px] font-black uppercase text-indigo-400">Statut</p><p className="text-indigo-950 font-black text-lg">Abonnement Actif</p></div>
                <div className="bg-emerald-500 text-white p-2 rounded-full"><Check size={20}/></div>
            </div>
            <p className="text-sm text-slate-600">Email : {session?.user?.email}</p>
            <Button variant="danger" className="w-full text-sm" onClick={() => window.location.href = `mailto:${CONTACT_EMAIL}?subject=Resiliation - ${session?.user?.email}`}>Résilier mon abonnement</Button>
        </div>
      </Modal>
    </div>
  );
}