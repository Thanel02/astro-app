import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Star, Moon, Sun, Lock, ChevronRight, User, Check, Sparkles, 
  ArrowLeft, Menu, X, LogOut, Loader2, MessageCircle, Send,
  Bot, AlertTriangle, AlertCircle, LayoutGrid, Bell, Clock
} from 'lucide-react';

// --- CONFIGURATION ---
const STRIPE_LINK = "https://buy.stripe.com/test_28EaEW7n8gVEaXTa9o4AU00"; 
const N8N_CHAT_WEBHOOK = "https://landingfactory.app.n8n.cloud/webhook/chat-voyance";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

// --- CONSTANTES ---
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
    id: 'francoise', 
    name: 'Françoise', 
    desc: 'Médium pur de naissance. Travaille sans support pour une voyance directe.', 
    style: 'Sincère, sans complaisance.', 
    image: 'https://images.unsplash.com/photo-1552699611-e2c2a8e56044?auto=format&fit=crop&q=80&w=300&h=300', 
    hook: "J'ai un flash vous concernant...", 
    welcome: "Bonjour, je suis Françoise. Je ressens une interrogation profonde en vous. Je vous écoute." 
  },
  { 
    id: 'nathalie', 
    name: 'Nathalie', 
    desc: 'Cartomancienne. Spécialiste du Grand Tarot de Marseille et de la vie affective.', 
    style: 'Chaleureuse et précise.', 
    image: 'https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?auto=format&fit=crop&q=80&w=300&h=300', 
    hook: "Votre tirage semble indiquer un changement...", 
    welcome: "Bienvenue. Mes cartes sont prêtes à répondre à vos doutes. Que voulez-vous savoir ?" 
  },
  { 
    id: 'pierre', 
    name: 'Maître Pierre', 
    desc: 'Astrologue et Numérologue. Plus de 30 ans d\'expérience en cabinet.', 
    style: 'Analytique et pédagogue.', 
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300&h=300', 
    hook: "Un transit planétaire vous impacte...", 
    welcome: "Bonjour. L'étude de vos astres révèle une période charnière. Posons les chiffres." 
  }
];

// --- COMPOSANTS UI ---
const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }) => {
  const baseStyle = "px-6 py-3 rounded-full font-medium transition-all duration-300 transform active:scale-95 shadow-sm flex items-center justify-center";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed",
    secondary: "bg-white text-indigo-900 border border-indigo-100 hover:border-indigo-300",
  };
  return <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>{children}</button>;
};

const Card = ({ children, className = '', onClick }) => (
  <div onClick={onClick} className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 ${className}`} >
    {children}
  </div>
);

// --- VUES ---
const HomeView = ({ onSelectSign }) => (
  <div className="max-w-5xl mx-auto px-4 py-8 pb-24">
    <div className="text-center mb-10 space-y-2">
      <h1 className="text-3xl md:text-4xl font-serif text-slate-900 font-bold">Horoscope Hebdomadaire</h1>
      <p className="text-slate-500 italic">Découvrez vos prévisions personnalisées</p>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {ZODIAC_SIGNS.map((sign) => (
        <Card key={sign.id} onClick={() => onSelectSign(sign)} className="cursor-pointer group hover:border-indigo-200 flex flex-col items-center justify-center text-center py-6">
          <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{sign.icon}</div>
          <h3 className="font-semibold text-slate-800">{sign.name}</h3>
        </Card>
      ))}
    </div>
  </div>
);

const ReadingView = ({ sign, session, isPremium, onGoBack, onAuthReq, onSubscribeReq }) => {
  const [horoscope, setHoroscope] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHoroscope = async () => {
      setLoading(true);
      try {
        if (!supabase) return;
        const { data, error } = await supabase.from('weekly_horoscopes').select('*').eq('sign_id', sign.name).order('week_start_date', { ascending: false }).limit(1).single();
        if (!error) setHoroscope(data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchHoroscope();
  }, [sign.name]);

  if (loading) return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={30} /></div>;
  if (!horoscope) return <div className="p-8 text-center"><p className="text-slate-500 mb-4">Prévisions momentanément indisponibles.</p><Button onClick={onGoBack} variant="secondary">Retour</Button></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      <button onClick={onGoBack} className="flex items-center text-slate-400 hover:text-indigo-600 mb-6"><ArrowLeft size={18} className="mr-2" /> Retour</button>
      <div className="text-center mb-8">
        <div className="text-5xl mb-2">{sign.icon}</div>
        <h2 className="text-3xl font-serif text-slate-900 font-bold">{sign.name}</h2>
        <p className="text-indigo-600 text-sm font-medium">Semaine du {new Date(horoscope.week_start_date).toLocaleDateString()}</p>
      </div>
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6">
          <p className="text-slate-700 leading-relaxed mb-6 italic text-lg">"{horoscope.intro}"</p>
          <div className="space-y-6">
             <div><h3 className="font-bold text-rose-600 mb-1 border-b border-rose-100 pb-1">Climat Sentimental</h3><p className="text-slate-600 text-sm leading-relaxed">{horoscope.love}</p></div>
             <div><h3 className="font-bold text-emerald-700 mb-1 border-b border-emerald-100 pb-1">Vie Professionnelle</h3><p className="text-slate-600 text-sm leading-relaxed">{horoscope.work}</p></div>
          </div>
        </div>
        <div className="relative p-6 bg-slate-50 border-t border-slate-100">
           <div className={!isPremium ? "blur-sm opacity-50 select-none" : ""}>
             <h3 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">Numérologie & Chance</h3>
             <div className="space-y-2 text-sm text-indigo-800">
                 <p><strong>Couleur vibratoire :</strong> {horoscope.premium_data?.color}</p>
                 <p><strong>Chiffres clés :</strong> {Array.isArray(horoscope.premium_data?.lucky_numbers) ? horoscope.premium_data?.lucky_numbers.join(', ') : "..."}</p>
             </div>
           </div>
           {!isPremium && (
             <div className="absolute inset-0 flex items-center justify-center p-4">
               <div className="bg-white/90 backdrop-blur rounded-xl p-5 shadow-lg text-center w-full max-w-xs border border-indigo-100">
                 <Lock className="mx-auto text-indigo-500 mb-2" size={20}/>
                 <p className="text-xs text-slate-500 mb-3 font-medium">Débloquez vos conseils personnalisés et vos chiffres de chance.</p>
                 <Button onClick={session ? onSubscribeReq : onAuthReq} className="w-full text-xs py-2 h-auto">Débloquer mon accès</Button>
               </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

const PsychicSelectionView = ({ onSelectPsychic, busyId }) => (
  <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
    <div className="text-center mb-10 space-y-2">
      <h1 className="text-3xl md:text-4xl font-serif text-slate-900 font-bold">Consultation Privée</h1>
      <p className="text-slate-500">Choisissez votre expert pour une séance en direct</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {VOYANTES.map((p) => {
        const isBusy = p.id === busyId;
        return (
          <Card 
            key={p.id} 
            onClick={() => !isBusy && onSelectPsychic(p)} 
            className={`text-center relative overflow-hidden transition-all ${isBusy ? 'opacity-80 cursor-not-allowed grayscale-[30%]' : 'cursor-pointer hover:border-indigo-300'}`}
          >
            <div className="relative inline-block mb-4">
              <img src={p.image} alt={p.name} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg mx-auto" />
              <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white ${isBusy ? 'bg-orange-500' : 'bg-green-500'}`}></div>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-1">{p.name}</h3>
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-3">{p.style}</p>
            <p className="text-sm text-slate-500 leading-relaxed mb-6 h-12">{p.desc}</p>
            
            <button 
              disabled={isBusy}
              className={`w-full py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${isBusy ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100'}`}
            >
              {isBusy ? 'Occupé(e)' : 'Consulter'}
            </button>
          </Card>
        );
      })}
    </div>
  </div>
);

const ChatView = ({ psychic, session, isPremium, onGoBack, onSubscribeReq, onAuthReq }) => {
  const [messages, setMessages] = useState([{ role: 'assistant', content: psychic.welcome }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [msgCount, setMsgCount] = useState(0); 
  const messagesEndRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || (!isPremium && msgCount >= 3)) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const response = await fetch(N8N_CHAT_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, userId: session?.user?.id || 'anonymous', voyanteId: psychic.id, isPremium })
      });
      const textData = await response.text();
      let data = {};
      try { data = JSON.parse(textData); } catch { data = { text: textData }; }

      if (data.error === "LIMIT_REACHED") {
        setMsgCount(3);
      } else {
        const reply = data.response || data.output || data.text || "Je n'arrive pas à capter vos énergies pour le moment. Réessayez.";
        setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
        if (!isPremium) setMsgCount(prev => prev + 1);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Une erreur est survenue lors de la consultation." }]);
    } finally { setLoading(false); }
  };

  const showPaywall = !isPremium && msgCount >= 3;

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-140px)] flex flex-col pt-4 px-2">
      <div className="flex items-center gap-4 border-b border-slate-100 pb-4 mb-4">
        <button onClick={onGoBack} className="p-2 hover:bg-slate-100 rounded-full"><ArrowLeft size={20}/></button>
        <div className="flex items-center gap-3">
          <img src={psychic.image} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
          <div><h3 className="font-bold text-slate-800">{psychic.name}</h3><div className="text-[10px] text-green-500 font-bold flex items-center gap-1 uppercase"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> En ligne</div></div>
        </div>
        <div className="ml-auto">{!isPremium && <span className="text-[10px] bg-slate-100 px-2 py-1 rounded font-bold text-slate-400 uppercase">{3 - msgCount} q. gratuites</span>}</div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-4 px-2 pb-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'}`}>{m.content}</div>
          </div>
        ))}
        {loading && <div className="flex justify-start"><div className="bg-white border border-slate-100 p-3 rounded-2xl flex gap-1 shadow-sm"><span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></span><span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-100"></span><span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-200"></span></div></div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-white border-t border-slate-100">
        {showPaywall ? (
          <div className="text-center p-4 bg-indigo-50 rounded-2xl border border-indigo-100 animate-in zoom-in">
            <h3 className="font-bold text-indigo-900 mb-1">Poursuivez cette consultation</h3>
            <p className="text-xs text-slate-500 mb-3">Vos 3 questions gratuites ont été épuisées.</p>
            <Button onClick={session ? onSubscribeReq : onAuthReq} className="w-full py-2 text-sm uppercase tracking-wide">Accès illimité</Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Ecrivez votre message ici..." className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-5 py-3 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner" />
            <button onClick={handleSend} disabled={loading || !input.trim()} className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 shadow-md transition-transform active:scale-90"><Send size={20} /></button>
          </div>
        )}
      </div>
    </div>
  );
};

const AuthView = ({ onAuthSuccess, onSwitchToLogin, isLoginMode, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAuth = async () => {
    setLoading(true); setError(null);
    try {
      if (!supabase) return;
      if (isLoginMode) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error, data } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data?.user) await supabase.from('profiles').insert([{ id: data.user.id, is_premium: false }]);
      }
      onAuthSuccess();
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100 relative">
        <button onClick={onCancel} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20}/></button>
        <h2 className="text-2xl font-bold text-center mb-6 font-serif">{isLoginMode ? 'Espace Membre' : 'Inscription'}</h2>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded text-sm mb-4">{error}</div>}
        <div className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 shadow-sm"/>
          <input type="password" placeholder="Mot de passe" value={password} onChange={e=>setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 shadow-sm"/>
          <Button onClick={handleAuth} disabled={loading} className="w-full mt-4 uppercase tracking-wider">{loading ? <Loader2 className="animate-spin"/> : (isLoginMode ? 'Se connecter' : "Valider")}</Button>
        </div>
        <div className="mt-6 text-center text-sm"><button onClick={onSwitchToLogin} className="text-indigo-600 font-medium underline">{isLoginMode ? "Créer un compte" : 'Déjà inscrit ?'}</button></div>
      </div>
    </div>
  );
};

// --- APP PRINCIPALE ---
export default function App() {
  const [activeTab, setActiveTab] = useState('horoscope'); 
  const [viewState, setViewState] = useState('list'); 
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [selectedSign, setSelectedSign] = useState(null);
  const [selectedPsychic, setSelectedPsychic] = useState(null);
  const [session, setSession] = useState(null);
  const [isPremium, setIsPremium] = useState(false);

  // LOGIQUE CHAT NOTIF & DISPONIBILITÉ
  const [showChatNotif, setShowChatNotif] = useState(false);
  const [randomPsychic, setRandomPsychic] = useState(null);
  const [busyPsychicId, setBusyPsychicId] = useState(null);

  useEffect(() => {
    // 1. Définir qui est occupé au hasard
    const busyOne = VOYANTES[Math.floor(Math.random() * VOYANTES.length)];
    setBusyPsychicId(busyOne.id);

    // 2. Choisir une voyante DISPONIBLE pour envoyer la notif
    const availablePsychics = VOYANTES.filter(p => p.id !== busyOne.id);
    const notifOne = availablePsychics[Math.floor(Math.random() * availablePsychics.length)];
    setRandomPsychic(notifOne);

    const timer = setTimeout(() => setShowChatNotif(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    const fetchPremiumStatus = async (userId) => {
      const { data } = await supabase.from('profiles').select('is_premium').eq('id', userId).single();
      if (data) setIsPremium(data.is_premium);
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, sess) => {
      setSession(sess);
      if (sess?.user) {
        await fetchPremiumStatus(sess.user.id);
        const channel = supabase.channel('schema-db-changes').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${sess.user.id}` }, (payload) => {
          if (payload.new) setIsPremium(payload.new.is_premium);
        }).subscribe();
        return () => { supabase.removeChannel(channel); };
      } else { setIsPremium(false); }
    });
    return () => { subscription.unsubscribe(); };
  }, []);

  const handleLogout = async () => { if (supabase) await supabase.auth.signOut(); };
  const handleSubscribe = () => {
    const returnUrl = window.location.origin;
    window.location.href = session ? `${STRIPE_LINK}?client_reference_id=${session.user.id}&return_url=${encodeURIComponent(returnUrl)}` : STRIPE_LINK;
  };

  const goToAuth = (loginMode = true) => { setIsLoginMode(loginMode); setViewState('auth'); };
  const goHome = () => { setViewState('list'); setSelectedSign(null); setSelectedPsychic(null); };

  const renderContent = () => {
    if (viewState === 'auth') return <AuthView isLoginMode={isLoginMode} onAuthSuccess={goHome} onSwitchToLogin={() => setIsLoginMode(!isLoginMode)} onCancel={goHome} />;
    if (activeTab === 'horoscope') {
      if (selectedSign) return <ReadingView sign={selectedSign} session={session} isPremium={isPremium} onGoBack={() => setSelectedSign(null)} onAuthReq={() => goToAuth(true)} onSubscribeReq={handleSubscribe} />;
      return <HomeView onSelectSign={setSelectedSign} />;
    }
    if (activeTab === 'voyance') {
      if (selectedPsychic) return <ChatView psychic={selectedPsychic} session={session} isPremium={isPremium} onGoBack={() => setSelectedPsychic(null)} onAuthReq={() => goToAuth(true)} onSubscribeReq={handleSubscribe} />;
      return <PsychicSelectionView onSelectPsychic={setSelectedPsychic} busyId={busyPsychicId} />;
    }
  };

  const canShowNotif = showChatNotif && activeTab === 'horoscope' && !selectedSign && viewState === 'list';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 h-16 flex items-center justify-between px-4">
         <div className="font-serif font-bold text-xl tracking-tight text-indigo-900">Astro<span className="text-indigo-600">Pure</span></div>
         <div className="flex items-center gap-3">
            {isPremium && <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100 uppercase tracking-tighter shadow-sm">Client Premium</span>}
            {!session && <button onClick={() => goToAuth(true)} className="text-sm font-semibold text-indigo-600 underline">Espace Membre</button>}
            {session && <button onClick={handleLogout} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"><LogOut size={18}/></button>}
         </div>
      </nav>
      
      <main className="pt-2">{renderContent()}</main>

      {/* BULLE DE CHAT NOTIFICATION CLASSIQUE */}
      {canShowNotif && (
        <div className="fixed bottom-20 right-4 z-[60] flex items-end gap-2 animate-in slide-in-from-bottom-5 duration-700">
          <div className="relative bg-white shadow-2xl border border-slate-100 rounded-2xl rounded-br-none p-3 max-w-[200px] mb-8">
            <p className="text-[11px] font-bold text-indigo-600 mb-0.5 uppercase tracking-tighter">{randomPsychic?.name}</p>
            <p className="text-[12px] text-slate-700 leading-tight italic font-medium">"{randomPsychic?.hook}"</p>
            <div className="absolute bottom-[-8px] right-0 w-0 h-0 border-l-[10px] border-l-transparent border-t-[10px] border-t-white"></div>
          </div>

          <button 
            onClick={() => { setActiveTab('voyance'); setSelectedPsychic(randomPsychic); setShowChatNotif(false); }}
            className="relative w-14 h-14 bg-white rounded-full shadow-2xl border-2 border-indigo-600 overflow-hidden hover:scale-110 transition-transform active:scale-95"
          >
            <img src={randomPsychic?.image} className="w-full h-full object-cover" alt={randomPsychic?.name} />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-[10px] text-white font-bold">1</span>
            </div>
          </button>
        </div>
      )}

      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 h-16 flex items-center justify-around z-50 pb-safe">
        <button onClick={() => { setActiveTab('horoscope'); setViewState('list'); }} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'horoscope' ? 'text-indigo-600 scale-105' : 'text-slate-400'}`}>
          <Moon size={22} fill={activeTab === 'horoscope' ? "currentColor" : "none"} /><span className="text-[10px] font-bold uppercase tracking-widest">Horoscope</span>
        </button>
        <div className="w-px h-6 bg-slate-200"></div>
        <button onClick={() => { setActiveTab('voyance'); setViewState('list'); }} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'voyance' ? 'text-indigo-600 scale-105' : 'text-slate-400'}`}>
          <MessageCircle size={22} fill={activeTab === 'voyance' ? "currentColor" : "none"} /><span className="text-[10px] font-bold uppercase tracking-widest">Voyance</span>
        </button>
      </div>
    </div>
  );
}