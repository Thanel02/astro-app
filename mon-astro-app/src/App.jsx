import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Helmet } from 'react-helmet';
import ReactGA from "react-ga4";
import { 
  Star, Moon, Sun, Lock, ChevronRight, User, Check, Sparkles, 
  ArrowLeft, Menu, X, LogOut, Loader2, MessageCircle, Send,
  Bot, AlertTriangle, AlertCircle, LayoutGrid, Bell, Clock, ShieldCheck, Mail, Key, Settings,
  ThumbsUp, Users, Shield, creditCard
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

const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    })
  : null;

ReactGA.initialize(GA_MEASUREMENT_ID);

const ZODIAC_SIGNS = [
  { id: 'belier', name: 'Bélier', icon: '♈' },
  { id: 'taureau', name: 'Taureau', icon: '♉' },
  { id: 'gemeaux', name: 'Gémeaux', icon: '♊' },
  { id: 'cancer', name: 'Cancer', icon: '♋' },
  { id: 'lion', name: 'Lion', icon: '♌' },
  { id: 'vierge', name: 'Vierge', icon: '♍' },
  { id: 'balance', name: 'Balance', icon: '♎' },
  { id: 'scorpion', name: 'Scorpion', icon: '♏' },
  { id: 'sagittaire', name: 'Sagittaire', icon: '♐' },
  { id: 'capricorne', name: 'Capricorne', icon: '♑' },
  { id: 'verseau', name: 'Verseau', icon: '♒' },
  { id: 'poissons', name: 'Poissons', icon: '♓' },
];

const VOYANTES = [
  { 
    id: 'caroline', 
    name: 'Caroline', 
    desc: 'Médium pur de naissance. Consultation directe sans support.', 
    style: 'Sincère et Directe', 
    image: '/caroline-voyante-astropure.png', 
    hook: "Analyse urgente...", 
    welcome: "Bonjour, je suis Caroline. Posez-moi votre question, je vous écoute.",
    rating: 4.9,
    reviews: 1248,
    isTop: true
  },
  { 
    id: 'nathalie', 
    name: 'Nathalie', 
    desc: 'Cartomancienne. Spécialiste du Grand Tarot de Marseille.', 
    style: 'Bienveillante et Précise', 
    image: '/nathalie-voyante-astropure.png', 
    hook: "Le tarot parle...", 
    welcome: "Bonjour, je suis Nathalie. Quel domaine vous préoccupe aujourd'hui ?",
    rating: 4.8,
    reviews: 892,
    isTop: false
  },
  { 
    id: 'pierre', 
    name: 'Maître Pierre', 
    desc: 'Astrologue et Numérologue certifié. 30 ans d\'expertise.', 
    style: 'Analytique et Expert', 
    image: '/pierre-voyant-astropure.png', 
    hook: "Configuration clé...", 
    welcome: "Bonjour, ici Pierre. Donnez-moi votre prénom pour commencer.",
    rating: 4.9,
    reviews: 2105,
    isTop: false
  }
];

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }) => {
  const baseStyle = "px-6 py-4 rounded-full font-bold transition-all duration-300 transform active:scale-95 shadow-sm flex items-center justify-center text-base";
  const variants = { primary: "bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-300", secondary: "bg-white text-indigo-900 border border-indigo-100" };
  return <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>{children}</button>;
};

const LegalModal = ({ isOpen, onClose, type, isPremium, onManage }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-6 border-b flex justify-between items-center"><h3 className="font-bold text-indigo-900">{type === 'mentions' ? 'Mentions Légales' : 'CGU & Politique de Confidentialité'}</h3><button onClick={onClose}><X size={20}/></button></div>
        <div className="p-8 max-h-[60vh] overflow-y-auto text-sm text-slate-600 space-y-4 text-left">
          {type === 'mentions' ? (
            <>
              <p>Éditeur : <strong>Altéo Consulting</strong>, SIRET 993 353 473 00016.</p>
              <p>Siège social : 2 RUE NOTRE-DAME DES VICTOIRES, 75002 PARIS.</p>
              <p>Contact SAV : {CONTACT_EMAIL}</p>
            </>
          ) : (
            <>
              <p>Prix de l'abonnement : {PRICE_TEXT}.</p>
              <p>Le service AstroPure est un service de divertissement. Aucun remboursement ne sera effectué après déblocage des contenus.</p>
              {isPremium && (
                <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 mt-4">
                  <p className="font-bold text-indigo-900 mb-2">Gestion de l'abonnement</p>
                  <p className="text-xs mb-4">Vous pouvez demander la résiliation de votre abonnement à tout moment.</p>
                  <Button onClick={onManage} className="w-full text-xs py-2">Résilier mon abonnement</Button>
                </div>
              )}
              <p className="pt-4 italic text-[10px]">Droit de suppression de vos données sur simple demande par email à {CONTACT_EMAIL}.</p>
            </>
          )}
        </div>
        <div className="p-6 border-t"><Button onClick={onClose} className="w-full">Fermer</Button></div>
      </div>
    </div>
  );
};

const AuthView = ({ onAuthSuccess, onSwitchToLogin, isLoginMode, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [message, setMessage] = useState(null);

  const handleAuth = async () => {
    setLoading(true); setMessage(null);
    try {
      if (resetMode) {
        await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/?recovery=true` });
        setMessage("Lien envoyé par e-mail !");
      } else if (isLoginMode) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuthSuccess();
      } else {
        const { error, data } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data?.user) await supabase.from('profiles').insert([{ id: data.user.id, is_premium: false }]);
        onAuthSuccess();
      }
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="flex items-center justify-center min-h-[70dvh] px-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md relative border text-center">
        <button onClick={onCancel} className="absolute top-4 right-4 text-slate-400"><X size={20}/></button>
        <div className="mb-6 inline-flex p-3 bg-indigo-50 rounded-full text-indigo-600"><Lock size={24}/></div>
        <h2 className="text-2xl font-bold font-serif text-indigo-900">{resetMode ? 'Récupération' : (isLoginMode ? 'Bon retour' : 'Créer un compte')}</h2>
        <p className="text-xs text-slate-500 mt-2 mb-6">Pour continuer votre consultation en toute sécurité.</p>
        <div className="space-y-4">
          {message && <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-xs">{message}</div>}
          <input type="email" placeholder="Votre email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border outline-none text-[16px]"/>
          {!resetMode && <input type="password" placeholder="Mot de passe" value={password} onChange={e=>setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border outline-none text-[16px]"/>}
          <Button onClick={handleAuth} disabled={loading} className="w-full">{loading ? <Loader2 className="animate-spin"/> : (resetMode ? "Envoyer le lien" : "Accéder au service")}</Button>
        </div>
        <div className="mt-6 text-center space-y-4">
          {isLoginMode && !resetMode && <button onClick={()=>setResetMode(true)} className="text-xs text-slate-400">Mot de passe oublié ?</button>}
          {resetMode && <button onClick={()=>setResetMode(false)} className="text-xs text-indigo-600">Retour connexion</button>}
          <button onClick={onSwitchToLogin} className="block w-full text-sm text-indigo-600 font-medium underline">{isLoginMode ? "Pas de compte ? S'inscrire" : 'Déjà inscrit ? Connexion'}</button>
        </div>
      </div>
    </div>
  );
};

const ChatView = ({ psychic, isPremium, onGoBack, onAction, session }) => {
  const historyKey = `astro_hist_${psychic.id}_${session?.user?.id || 'anon'}`;
  const globalCountKey = `astro_global_count_${session?.user?.id || 'anon'}`;

  const [messages, setMessages] = useState(() => {
    const savedLocal = localStorage.getItem(historyKey);
    if (savedLocal) return JSON.parse(savedLocal);
    if (session?.user?.id) {
      const anonHist = localStorage.getItem(`astro_hist_${psychic.id}_anon`);
      if (anonHist) return JSON.parse(anonHist);
    }
    return [{ role: 'assistant', content: psychic.welcome }];
  });
  
  const [globalUsage, setGlobalUsage] = useState(() => {
    const currentVal = localStorage.getItem(globalCountKey);
    return currentVal ? parseInt(currentVal) : 0;
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typingStatus, setTypingStatus] = useState("");
  const [limitReached, setLimitReached] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  useEffect(() => {
    localStorage.setItem(historyKey, JSON.stringify(messages));
    localStorage.setItem(globalCountKey, globalUsage.toString());
    if (!isPremium && globalUsage >= FREE_CHAT_LIMIT) setLimitReached(true);
    else setLimitReached(false);
  }, [messages, globalUsage, isPremium, historyKey, globalCountKey]);

  const handleSend = async () => {
    if (!input.trim() || loading || limitReached) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setGlobalUsage(prev => prev + 1);
    setInput('');
    setLoading(true);

    // Simulateur de réflexion
    const statuses = [
      `${psychic.name} se connecte...`,
      "Analyse de vos vibrations...",
      "Consultation des guides...",
      "Rédaction de la vision..."
    ];
    let step = 0;
    const interval = setInterval(() => {
      setTypingStatus(statuses[step % statuses.length]);
      step++;
    }, 1500);

    try {
      const response = await fetch(N8N_CHAT_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, voyanteId: psychic.id, userId: session?.user?.id || 'anonymous', isPremium })
      });
      const data = await response.json();
      clearInterval(interval);
      setMessages(prev => [...prev, { role: 'assistant', content: data.text || "Je reçois une image floue..." }]);
    } catch (e) { 
      setMessages(prev => [...prev, { role: 'assistant', content: "La connexion spirituelle a été coupée. Réessayez." }]); 
    } finally { 
      setLoading(false); 
      setTypingStatus("");
    }
  };

  const reversedMessages = [...messages].reverse();

  return (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col md:max-w-2xl md:mx-auto shadow-2xl overflow-hidden overscroll-none">
      <div className="flex items-center gap-4 py-3 px-4 border-b bg-white flex-shrink-0 z-10">
        <button onClick={onGoBack} className="p-1.5 bg-slate-50 rounded-full active:scale-90 transition-transform"><ArrowLeft size={20}/></button>
        <div className="relative">
          <img src={psychic.image} className="w-10 h-10 rounded-full object-cover border" />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
        </div>
        <div>
          <h3 className="font-bold text-sm leading-none">{psychic.name}</h3>
          <p className="text-[10px] text-emerald-600 font-medium">En ligne</p>
        </div>
      </div>
      
      {!isPremium && (
        <div className="bg-indigo-50 px-4 py-1 text-[10px] text-indigo-700 text-center font-bold border-b border-indigo-100 flex-shrink-0 uppercase tracking-widest">
           Salon de voyance privée
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col-reverse bg-slate-50/30">
        <div className="h-2 flex-shrink-0" />

        {limitReached && (
          <div className="bg-white border-2 border-indigo-600 p-8 rounded-[2rem] text-center space-y-6 shadow-2xl my-4 animate-in zoom-in-95 duration-500">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto animate-bounce"><Sparkles size={32} /></div>
            <div>
              <p className="text-xl font-black text-indigo-900 leading-tight">Flash en cours...</p>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                Je m'arrête un instant... Ce que je vois dans la suite de votre tirage est très précis. 
                Je dois canaliser toute mon énergie pour vous transmettre cette vision sans erreur.
              </p>
            </div>
            <div className="space-y-3">
                <Button onClick={onAction} className="w-full text-base font-black uppercase py-5 shadow-xl bg-indigo-600 hover:bg-indigo-700">
                    DÉCOUVRIR MA VOYANCE ({PRICE_TEXT})
                </Button>
                <div className="flex flex-col items-center gap-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                        <ShieldCheck size={14} className="text-emerald-500"/> PAIEMENT 100% SÉCURISÉ & DISCRET
                    </div>
                    <div className="flex gap-4 opacity-40 grayscale h-4">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" />
                    </div>
                </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex justify-start mb-4 animate-in fade-in duration-300">
            <div className="bg-white border border-indigo-100 p-4 rounded-2xl rounded-bl-none shadow-sm flex flex-col gap-2">
              <span className="text-[10px] font-bold text-indigo-400 italic uppercase tracking-tighter">{typingStatus}</span>
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}

        {reversedMessages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} mb-4 animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-[16px] font-medium leading-snug shadow-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none'}`}>
              {m.content}
            </div>
          </div>
        ))}
      </div>
      
      {!limitReached && (
        <div className="p-3 border-t bg-white flex gap-2 flex-shrink-0">
          <input 
            value={input} 
            onChange={e=>setInput(e.target.value)} 
            onKeyPress={e=>e.key==='Enter' && handleSend()} 
            placeholder="Écrivez votre message ici..." 
            className="flex-1 bg-slate-50 rounded-2xl px-4 py-3 text-[16px] outline-none border border-transparent focus:border-indigo-100" 
            enterKeyHint="send" 
          />
          <button onClick={handleSend} className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg active:scale-90 transition-transform"><Send size={20}/></button>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('voyance'); 
  const [viewState, setViewState] = useState('list'); 
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [selectedSign, setSelectedSign] = useState(null);
  const [selectedPsychic, setSelectedPsychic] = useState(null);
  const [session, setSession] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [busyPsychicId, setBusyPsychicId] = useState('');
  const [horoscope, setHoroscope] = useState(null);
  const [showChatNotif, setShowChatNotif] = useState(false);

  useEffect(() => {
    const randomId = VOYANTES[Math.floor(Math.random() * VOYANTES.length)].id;
    setBusyPsychicId(randomId);
    const timer = setTimeout(() => setShowChatNotif(true), 5000);
    const q = new URLSearchParams(window.location.search);
    if (q.get('recovery') === 'true') setViewState('recovery');

    if (!supabase) return;
    supabase.auth.onAuthStateChange((event, sess) => {
      setSession(sess);
      if (sess?.user) {
        supabase.from('profiles').select('is_premium').eq('id', sess.user.id).single().then(({data}) => setIsPremium(!!data?.is_premium));
      } else {
        setIsPremium(false);
      }
    });
    return () => { clearTimeout(timer); };
  }, []);

  useEffect(() => {
    if (selectedSign && supabase) {
      supabase.from('weekly_horoscopes').select('*').eq('sign_id', selectedSign.name).order('week_start_date', { ascending: false }).limit(1).single()
        .then(({data}) => setHoroscope(data));
      ReactGA.send({ hitType: "pageview", page: `/horoscope/${selectedSign.id}` });
    }
  }, [selectedSign]);

  const handleUnlock = () => {
    ReactGA.event({ category: "Conversion", action: "Click Payment Button" });
    if (!session) { 
      setViewState('auth'); 
      setIsLoginMode(false); 
    } else { 
      window.location.href = `${STRIPE_LINK}?client_reference_id=${session.user.id}`; 
    }
  };

  const handleManageSubscription = () => {
    alert(`Pour résilier, envoyez un email à ${CONTACT_EMAIL}. Résiliation traitée sous 24h.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Helmet>
        <title>AstroPure | Consultation de Voyance Privée</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/> 
      </Helmet>

      <nav className="bg-white border-b h-16 flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="font-serif font-bold text-xl text-indigo-900 cursor-pointer flex items-center gap-2" onClick={() => { setViewState('list'); setSelectedSign(null); setSelectedPsychic(null); setHoroscope(null); }}>
          <Moon className="text-indigo-600" size={24} fill="currentColor"/> AstroPure
        </div>
        {!session ? (
          <button onClick={() => { setIsLoginMode(true); setViewState('auth'); }} className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full uppercase border border-indigo-100">Connexion</button>
        ) : (
          <button onClick={() => supabase.auth.signOut()} className="p-2 text-slate-400 flex items-center gap-2 text-xs">
            <LogOut size={18}/>
          </button>
        )}
      </nav>
      
      <main className="flex-1 overflow-y-auto">
        {viewState === 'recovery' ? (
          <div className="max-w-md mx-auto p-8 bg-white mt-10 rounded-3xl shadow-xl border text-center">
            <h2 className="text-xl font-bold mb-4">Récupération de compte</h2>
            <input type="password" id="new-pw" className="w-full p-3 border rounded-xl mb-4" placeholder="Nouveau mot de passe"/>
            <Button className="w-full" onClick={async () => { const p = document.getElementById('new-pw').value; await supabase.auth.updateUser({ password: p }); setViewState('list'); }}>Mettre à jour</Button>
          </div>
        ) : viewState === 'auth' ? <AuthView isLoginMode={isLoginMode} onAuthSuccess={() => setViewState('list')} onSwitchToLogin={() => setIsLoginMode(!isLoginMode)} onCancel={() => setViewState('list')} /> : (
          activeTab === 'horoscope' ? (
            selectedSign ? (
              <div className="max-w-2xl mx-auto p-4 animate-in fade-in">
                <button onClick={() => { setSelectedSign(null); setHoroscope(null); }} className="mb-4 flex items-center text-slate-400 text-sm"><ArrowLeft size={18} className="mr-2"/>Retour aux signes</button>
                <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-6">
                  <h2 className="text-2xl font-serif font-bold text-indigo-900">{selectedSign.icon} Horoscope {selectedSign.name}</h2>
                  <p className="text-slate-700 leading-relaxed italic text-lg border-l-4 border-indigo-100 pl-4">"{horoscope?.intro || "Les alignements planétaires révèlent une configuration rare..."}"</p>
                  <div className="grid gap-6">
                    <div className="bg-rose-50/50 p-4 rounded-2xl"><h3 className="font-bold text-rose-600 border-b border-rose-100 text-[10px] uppercase mb-2">Cœur & Sentiments</h3><p className="text-sm text-slate-600">{horoscope?.love || "Le climat astral se stabilise..."}</p></div>
                    <div className="bg-emerald-50/50 p-4 rounded-2xl"><h3 className="font-bold text-emerald-700 border-b border-emerald-100 text-[10px] uppercase mb-2">Carrière & Projets</h3><p className="text-sm text-slate-600">{horoscope?.work || "Une opportunité se dessine..."}</p></div>
                  </div>
                  {!isPremium && <div className="p-6 bg-indigo-900 text-white rounded-3xl text-center shadow-xl"><Lock size={32} className="mx-auto mb-3 text-indigo-300"/><h4 className="font-bold mb-1">Rapport Complet Verrouillé</h4><p className="text-xs mb-4 text-indigo-200">Accédez à vos prévisions <strong>Famille</strong> et <strong>Chance</strong>.</p><Button onClick={handleUnlock} variant="secondary" className="w-full text-indigo-900 font-bold">DÉBLOQUER POUR {PRICE_TEXT}</Button></div>}
                  {isPremium && (
                    <div className="space-y-6">
                      <div className="bg-amber-50/50 p-4 rounded-2xl"><h3 className="font-bold text-amber-700 border-b border-amber-100 text-[10px] uppercase mb-2">Famille & Entourage</h3><p className="text-sm text-slate-600">{horoscope?.family}</p></div>
                      <div className="bg-indigo-50/50 p-4 rounded-2xl"><h3 className="font-bold text-indigo-700 border-b border-indigo-100 text-[10px] uppercase mb-2">Chance & Opportunités</h3><p className="text-sm text-slate-600">{horoscope?.luck}</p></div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-serif font-bold text-indigo-900">Horoscope Hebdomadaire</h1>
                  <p className="text-sm text-slate-500">Sélectionnez votre signe.</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in">
                  {ZODIAC_SIGNS.map(s => <div key={s.id} onClick={() => setSelectedSign(s)} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 cursor-pointer hover:border-indigo-300 transition-all text-center group"><div className="text-4xl mb-2 group-hover:scale-110 transition-transform">{s.icon}</div><div className="font-bold text-indigo-900">{s.name}</div></div>)}
                </div>
              </div>
            )
          ) : (
            selectedPsychic ? <ChatView psychic={selectedPsychic} isPremium={isPremium} onGoBack={() => setSelectedPsychic(null)} onAction={handleUnlock} session={session} /> : (
              <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-serif font-bold text-indigo-900 leading-tight">Consultation Immédiate</h1>
                  <p className="text-sm text-slate-500 mt-2">Réponse en direct par chat privé.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
                  {VOYANTES.map(p => {
                    const isBusy = p.id === busyPsychicId;
                    return (
                      <div key={p.id} onClick={() => !isBusy && setSelectedPsychic(p)} className={`bg-white rounded-[2.5rem] p-6 text-center border shadow-sm relative transition-all ${isBusy ? 'opacity-80' : 'cursor-pointer hover:border-indigo-300 hover:shadow-lg'}`}>
                        {p.isTop && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 text-[9px] font-black px-4 py-1.5 rounded-full uppercase shadow-sm z-10 whitespace-nowrap">
                            Expert Coup de Cœur
                          </div>
                        )}
                        {!isBusy && <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-600 text-[8px] font-bold px-2 py-1 rounded-full uppercase flex items-center gap-1"><div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping"></div>En ligne</div>}
                        <img src={p.image} className="w-28 h-28 rounded-full object-cover mx-auto mb-4 border-4 border-white shadow-md" />
                        <div className="flex flex-col items-center gap-1 mb-4">
                          <div className="flex items-center gap-1 text-amber-500">
                            {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                            <span className="text-xs font-bold ml-1 text-slate-700">{p.rating}</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-400 text-[10px]"><Users size={12}/><span>{p.reviews.toLocaleString()} consultations</span></div>
                        </div>
                        <h3 className="font-bold text-xl text-indigo-900 leading-tight">{p.name}</h3>
                        <p className="text-indigo-600 text-[10px] font-bold uppercase mb-3 tracking-wider">{p.style}</p>
                        <p className="text-xs text-slate-500 leading-relaxed mb-6 h-12 overflow-hidden italic">"{p.desc}"</p>
                        <button className="w-full py-4 rounded-2xl text-xs font-bold uppercase bg-indigo-600 text-white shadow-lg">Démarrer le chat gratuit</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )
        )}
      </main>

      {viewState === 'list' && !selectedPsychic && (
        <footer className="bg-white border-t p-10 text-center text-[10px] text-slate-400 pb-32">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-center items-center gap-2 text-indigo-900 font-serif font-bold text-lg opacity-30"><Moon size={20}/> AstroPure</div>
            <p className="max-w-xs mx-auto">Service édité par Altéo Consulting. Débit bancaire discret.</p>
            <div className="flex justify-center flex-wrap gap-6 font-medium text-slate-500">
              <button onClick={() => setModalType('mentions')}>Mentions Légales</button>
              <button onClick={() => setModalType('cgu')}>CGU & Confidentialité</button>
            </div>
          </div>
        </footer>
      )}

      {viewState === 'list' && !selectedPsychic && (
        <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t h-20 flex items-center justify-around z-50 px-6 shadow-xl">
          <button onClick={() => { setActiveTab('voyance'); setSelectedPsychic(null); }} className={`flex flex-col items-center gap-1.5 ${activeTab === 'voyance' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <MessageCircle size={24}/><span className="text-[10px] font-bold uppercase">Voyance</span>
          </button>
          <button onClick={() => { setActiveTab('horoscope'); setSelectedSign(null); }} className={`flex flex-col items-center gap-1.5 ${activeTab === 'horoscope' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <Moon size={24}/><span className="text-[10px] font-bold uppercase">Horoscope</span>
          </button>
        </div>
      )}

      <LegalModal isOpen={!!modalType} onClose={() => setModalType(null)} type={modalType} isPremium={isPremium} onManage={handleManageSubscription} />
    </div>
  );
}