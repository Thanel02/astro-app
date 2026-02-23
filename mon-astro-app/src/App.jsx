import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Helmet } from 'react-helmet';
import { 
  Star, Moon, Sun, Lock, ChevronRight, User, Check, Sparkles, 
  ArrowLeft, Menu, X, LogOut, Loader2, MessageCircle, Send,
  Bot, AlertTriangle, AlertCircle, LayoutGrid, Bell, Clock, ShieldCheck, Mail
} from 'lucide-react';

// --- CONFIGURATION ---
const STRIPE_LINK = "https://buy.stripe.com/test_28EaEW7n8gVEaXTa9o4AU00"; 
const N8N_CHAT_WEBHOOK = "https://landingfactory.app.n8n.cloud/webhook/chat-voyance";
const CONTACT_EMAIL = "gestion@alteoconseil.fr";
const PRICE_TEXT = "2,99€/mois";
const FREE_CHAT_LIMIT = 3;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
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
    id: 'caroline', name: 'Caroline', 
    desc: 'Médium pur de naissance.', 
    style: 'Sincère et Directe', image: '/caroline-voyante-astropure.png', 
    hook: "J'ai un flash urgent vous concernant...", 
    welcome: "Bonjour, je suis Caroline. Je ressens une interrogation profonde en vous. Je vous écoute." 
  },
  { 
    id: 'nathalie', name: 'Nathalie', 
    desc: 'Cartomancienne de 60 ans.', 
    style: 'Chaleureuse et Précise', image: '/nathalie-voyante-astropure.png', 
    hook: "Votre tirage de cartes révèle un tournant...", 
    welcome: "Bienvenue mon enfant. Mes cartes sont prêtes à éclairer votre chemin." 
  },
  { 
    id: 'pierre', name: 'Maître Pierre', 
    desc: 'Astrologue et Numérologue certifié.', 
    style: 'Analytique et Expert', image: '/pierre-voyant-astropure.png', 
    hook: "Un transit planétaire majeur impacte votre ciel...", 
    welcome: "Bonjour. L'étude de vos astres révèle une période charnière." 
  }
];

// --- COMPOSANTS UI ---
const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }) => {
  const baseStyle = "px-6 py-3 rounded-full font-medium transition-all duration-300 transform active:scale-95 shadow-sm flex items-center justify-center text-sm";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-300",
    secondary: "bg-white text-indigo-900 border border-indigo-100",
  };
  return <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>{children}</button>;
};

// --- MODALE LÉGALE ---
const LegalModal = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;
  const content = {
    mentions: {
      title: "Mentions Légales",
      text: (
        <div className="space-y-4 text-sm text-slate-600 text-left">
          <section>
            <h4 className="font-bold text-indigo-900 uppercase text-[10px] mb-2">Éditeur du site</h4>
            <p>Le site AstroPure est édité par la société <strong>Altéo Consulting</strong>, immatriculée au RCS sous le numéro <strong>SIRET 993 353 473 00016</strong>.</p>
            <p>Siège social : 2 RUE NOTRE-DAME DES VICTOIRES, 75002 PARIS.</p>
          </section>
          <section>
            <h4 className="font-bold text-indigo-900 uppercase text-[10px] mb-2">Hébergeur</h4>
            <p>Vercel Inc., 340 S Lemon Ave #1135, Walnut, CA 91789, USA.</p>
          </section>
          <section className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <h4 className="font-bold text-indigo-900 uppercase text-[10px] mb-1">Contact SAV</h4>
            <p className="flex items-center gap-2 font-medium text-indigo-600"><Mail size={14}/> {CONTACT_EMAIL}</p>
          </section>
        </div>
      )
    },
    cgu: {
      title: "CGU & Confidentialité",
      text: (
        <div className="space-y-4 text-sm text-slate-600 text-left">
          <h4 className="font-bold text-indigo-900 border-b pb-1">Politique RGPD</h4>
          <p><strong>Données :</strong> E-mail, statut Premium, historique de chat. Traitement bancaire exclusif par <strong>Stripe</strong>.</p>
          <h4 className="font-bold text-indigo-900 border-b pb-1 mt-4">Conditions Générales</h4>
          <p><strong>Prix :</strong> {PRICE_TEXT}. Divertissement uniquement. Pas de remboursement après exécution. Réservé aux majeurs.</p>
        </div>
      )
    }
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center"><h3 className="font-bold text-indigo-900">{content[type].title}</h3><button onClick={onClose}><X size={20}/></button></div>
        <div className="p-8 max-h-[60vh] overflow-y-auto">{content[type].text}</div>
        <div className="p-6 border-t"><Button onClick={onClose} className="w-full">Fermer</Button></div>
      </div>
    </div>
  );
};

// --- AUTHENTIFICATION ---
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
    <div className="flex items-center justify-center min-h-[70dvh] px-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100 relative">
        <button onClick={onCancel} className="absolute top-4 right-4 text-slate-400"><X size={20}/></button>
        <h2 className="text-2xl font-bold text-center mb-2 font-serif text-indigo-900">{isLoginMode ? 'Connexion' : 'Créer un compte'}</h2>
        <p className="text-center text-xs text-slate-400 mb-6">{isLoginMode ? 'Heureuse de vous revoir' : `Inscrivez-vous pour votre accès complet (${PRICE_TEXT})`}</p>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded text-xs mb-4">{error}</div>}
        <div className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"/>
          <input type="password" placeholder="Mot de passe" value={password} onChange={e=>setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"/>
          <Button onClick={handleAuth} disabled={loading} className="w-full">{loading ? <Loader2 className="animate-spin"/> : (isLoginMode ? 'Se connecter' : "Continuer")}</Button>
        </div>
        <div className="mt-6 text-center text-sm font-medium"><button onClick={onSwitchToLogin} className="text-indigo-600 underline">{isLoginMode ? "S'inscrire" : 'Déjà membre ? Se connecter'}</button></div>
      </div>
    </div>
  );
};

// --- VUES D'INTERFACE ---
const HomeView = ({ onSelectSign }) => (
  <div className="max-w-5xl mx-auto px-4 py-8 text-center">
    <h1 className="text-3xl font-serif text-slate-900 font-bold mb-10">Horoscope Hebdomadaire</h1>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-12">
      {ZODIAC_SIGNS.map((s) => (
        <div key={s.id} onClick={() => onSelectSign(s)} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center cursor-pointer transition-all active:scale-95">
          <div className="text-4xl mb-2">{s.icon}</div>
          <h3 className="font-semibold text-slate-800">{s.name}</h3>
        </div>
      ))}
    </div>
  </div>
);

const ReadingView = ({ sign, isPremium, onGoBack, onAction }) => {
  const [horoscope, setHoroscope] = useState(null);
  useEffect(() => {
    if (!supabase) return;
    supabase.from('weekly_horoscopes').select('*').eq('sign_id', sign.name).order('week_start_date', { ascending: false }).limit(1).single()
      .then(({data}) => setHoroscope(data));
  }, [sign]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <button onClick={onGoBack} className="flex items-center text-slate-400 mb-6 font-medium"><ArrowLeft size={18} className="mr-2" /> Retour</button>
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 relative">
        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">{sign.icon} {sign.name}</h2>
        <p className="text-slate-700 leading-relaxed mb-6 italic text-lg">"{horoscope?.intro || "Les astres vous préparent une surprise..."}"</p>
        
        <div className="space-y-6">
          {/* SECTIONS GRATUITES */}
          <div><h3 className="font-bold text-rose-600 mb-1 border-b border-rose-100 pb-1 uppercase tracking-widest text-[10px]">Cœur</h3><p className="text-sm text-slate-600 leading-relaxed">{horoscope?.love || "Chargement..."}</p></div>
          <div><h3 className="font-bold text-emerald-700 mb-1 border-b border-emerald-100 pb-1 uppercase tracking-widest text-[10px]">Travail</h3><p className="text-sm text-slate-600 leading-relaxed">{horoscope?.work || "Chargement..."}</p></div>

          {/* SECTIONS PAYANTES */}
          {!isPremium ? (
            <div className="p-6 bg-slate-50 rounded-2xl border border-indigo-100 text-center relative mt-6">
              <Lock className="mx-auto text-indigo-400 mb-2" size={24}/>
              <p className="text-sm font-medium text-slate-600 mb-4 uppercase tracking-tighter">Débloquez vos prévisions <strong>Famille</strong> et <strong>Chance</strong></p>
              <Button onClick={onAction} className="w-full uppercase tracking-widest text-[10px] font-bold">Accès Premium ({PRICE_TEXT})</Button>
            </div>
          ) : (
            <>
              <div className="animate-in fade-in duration-700"><h3 className="font-bold text-indigo-600 mb-1 border-b border-indigo-100 pb-1 uppercase tracking-widest text-[10px]">Famille</h3><p className="text-sm text-slate-600 leading-relaxed">{horoscope?.family || "L'équilibre familial sera au centre de vos préoccupations cette semaine."}</p></div>
              <div className="p-4 bg-amber-50 rounded-xl animate-in zoom-in-95 duration-700"><h3 className="font-bold text-amber-900 text-[10px] uppercase mb-2">Chiffres de Chance</h3><p className="text-sm text-amber-800 font-bold">Numéros : {Array.isArray(horoscope?.premium_data?.lucky_numbers) ? horoscope.premium_data.lucky_numbers.join(', ') : "7, 14, 23, 44"}</p></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const PsychicSelectionView = ({ onSelectPsychic, busyId }) => (
  <div className="max-w-4xl mx-auto px-4 py-8 text-center">
    <h1 className="text-3xl font-serif font-bold text-slate-900 mb-10">Voyance en Direct</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12">
      {VOYANTES.map((p) => {
        const isBusy = p.id === busyId;
        return (
          <div key={p.id} onClick={() => !isBusy && onSelectPsychic(p)} className={`bg-white rounded-3xl p-6 border shadow-sm transition-all ${isBusy ? 'opacity-80' : 'cursor-pointer hover:border-indigo-300'}`}>
            <img src={p.image} className={`w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-white shadow-md ${isBusy ? 'grayscale' : ''}`} />
            <h3 className="font-bold text-slate-800 text-lg">{p.name}</h3>
            <p className="text-[10px] text-slate-400 italic mb-4">{p.style}</p>
            <button className={`w-full py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${isBusy ? 'bg-slate-50 text-slate-300' : 'bg-indigo-600 text-white'}`}>{isBusy ? 'Occupée' : 'Consulter'}</button>
          </div>
        )
      })}
    </div>
  </div>
);

const ChatView = ({ psychic, isPremium, onGoBack, onAction }) => {
  const [messages, setMessages] = useState([{ role: 'assistant', content: psychic.welcome }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Filtrer les messages envoyés par l'utilisateur pour le compteur
  const userMessageCount = messages.filter(m => m.role === 'user').length;
  const isLimitReached = !isPremium && userMessageCount >= FREE_CHAT_LIMIT;

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLimitReached || loading) return;
    
    const newMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setLoading(true);

    try {
      // Logique webhook n8n simplifiée pour l'exemple
      const response = await fetch(N8N_CHAT_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, psychic: psychic.name, history: messages })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.output || "Je ressens une connexion..." }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Les astres sont brouillés, réessayez dans un instant." }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 top-16 bottom-16 bg-white z-[40] flex flex-col md:max-w-2xl md:mx-auto shadow-xl">
      <div className="flex items-center gap-4 py-3 px-4 border-b bg-white/80 backdrop-blur-md">
        <button onClick={onGoBack} className="p-1.5 bg-slate-50 rounded-full"><ArrowLeft size={20}/></button>
        <img src={psychic.image} className="w-10 h-10 rounded-full object-cover" />
        <h3 className="font-bold text-sm">{psychic.name}</h3>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50/30">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm shadow-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && <div className="flex justify-start"><div className="bg-white p-3 rounded-2xl border border-slate-100"><Loader2 className="animate-spin text-indigo-400" size={18}/></div></div>}
        <div ref={scrollRef} />

        {isLimitReached && (
          <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-xl text-center space-y-3 animate-in fade-in slide-in-from-bottom-4">
            <Sparkles className="mx-auto" />
            <h4 className="font-bold italic">"Votre destin se précise..."</h4>
            <p className="text-xs opacity-90 leading-relaxed">Vous avez utilisé vos {FREE_CHAT_LIMIT} messages gratuits. Débloquez l'accès illimité pour continuer votre séance.</p>
            <Button onClick={onAction} variant="secondary" className="w-full text-indigo-600 border-none font-bold uppercase text-[10px]">Passer en Premium ({PRICE_TEXT})</Button>
          </div>
        )}
      </div>

      {!isLimitReached && (
        <div className="p-4 border-t bg-white flex gap-2">
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyPress={e=>e.key==='Enter' && handleSend()} placeholder="Posez votre question..." className="flex-1 bg-slate-50 border-none rounded-xl px-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          <button onClick={handleSend} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"><Send size={18}/></button>
        </div>
      )}
    </div>
  );
};

// --- APP PRINCIPALE ---
export default function App() {
  const [activeTab, setActiveTab] = useState('horoscope'); 
  const [viewState, setViewState] = useState('list'); 
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [selectedSign, setSelectedSign] = useState(null);
  const [selectedPsychic, setSelectedPsychic] = useState(null);
  const [session, setSession] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [showChatNotif, setShowChatNotif] = useState(false);
  const [randomPsychic, setRandomPsychic] = useState(null);
  const [busyPsychicId, setBusyPsychicId] = useState('pierre');

  useEffect(() => {
    setRandomPsychic(VOYANTES[0]);
    const timer = setTimeout(() => setShowChatNotif(true), 5000);

    const savedContext = localStorage.getItem('astro_context');
    if (savedContext) {
      const ctx = JSON.parse(savedContext);
      if (ctx.tab) setActiveTab(ctx.tab);
      if (ctx.sign) setSelectedSign(ZODIAC_SIGNS.find(s => s.id === ctx.sign));
      if (ctx.psychic) setSelectedPsychic(VOYANTES.find(v => v.id === ctx.psychic));
      localStorage.removeItem('astro_context');
    }

    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sess) => {
      setSession(sess);
      if (sess?.user) {
        supabase.from('profiles').select('is_premium').eq('id', sess.user.id).single().then(({data}) => {
          if (data?.is_premium) {
            setIsPremium(true);
            setViewState('list');
          } else {
            const pending = localStorage.getItem('pending_intent');
            if (pending === 'stripe') {
              localStorage.removeItem('pending_intent');
              redirectToStripe(sess.user.id);
            }
          }
        });
      } else { setIsPremium(false); }
    });
    return () => { subscription.unsubscribe(); clearTimeout(timer); };
  }, []);

  const redirectToStripe = (userId) => {
    localStorage.setItem('astro_context', JSON.stringify({
      tab: activeTab, sign: selectedSign?.id || null, psychic: selectedPsychic?.id || null
    }));
    window.location.href = `${STRIPE_LINK}?client_reference_id=${userId}&return_url=${encodeURIComponent(window.location.origin)}`;
  };

  const handleUnlockAction = () => {
    if (!session) {
      localStorage.setItem('pending_intent', 'stripe');
      setIsLoginMode(false);
      setViewState('auth');
    } else if (!isPremium) {
      redirectToStripe(session.user.id);
    }
  };

  const renderContent = () => {
    if (viewState === 'auth') return <AuthView isLoginMode={isLoginMode} onAuthSuccess={() => setViewState('list')} onSwitchToLogin={() => setIsLoginMode(!isLoginMode)} onCancel={() => setViewState('list')} />;
    if (activeTab === 'horoscope') {
      if (selectedSign) return <ReadingView sign={selectedSign} isPremium={isPremium} onGoBack={() => setSelectedSign(null)} onAction={handleUnlockAction} />;
      return <HomeView onSelectSign={setSelectedSign} />;
    }
    if (activeTab === 'voyance') {
      if (selectedPsychic) return <ChatView psychic={selectedPsychic} isPremium={isPremium} onGoBack={() => setSelectedPsychic(null)} onAction={handleUnlockAction} />;
      return <PsychicSelectionView onSelectPsychic={setSelectedPsychic} busyId={busyPsychicId} />;
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-900 font-sans flex flex-col">
      <Helmet><title>AstroPure | Horoscope et Voyance</title></Helmet>

      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50 h-16 flex items-center justify-between px-4">
          <div className="font-serif font-bold text-xl text-indigo-900 tracking-tighter cursor-pointer" onClick={() => { setViewState('list'); setSelectedSign(null); setSelectedPsychic(null); }}>AstroPure</div>
          {!session ? (
            <button onClick={() => { setIsLoginMode(true); setViewState('auth'); }} className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 uppercase tracking-widest">Compte</button>
          ) : (
            <div className="flex items-center gap-3">
              {isPremium && <span className="text-[9px] bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full border border-amber-100 font-bold uppercase">Abonné</span>}
              <button onClick={() => supabase.auth.signOut()} className="p-2 text-slate-400"><LogOut size={18}/></button>
            </div>
          )}
      </nav>
      
      <main className="flex-1 pb-24 overflow-y-auto">{renderContent()}</main>

      <footer className="bg-white border-t p-8 text-center text-[10px] text-slate-400 pb-32">
        <div className="max-w-4xl mx-auto space-y-4">
          <p className="font-bold tracking-widest uppercase">Altéo Consulting</p>
          <div className="flex justify-center gap-4 underline">
            <button onClick={() => setModalType('mentions')}>Mentions Légales</button>
            <button onClick={() => setModalType('cgu')}>CGU & Confidentialité</button>
          </div>
          <p className="text-[9px]">SAV : {CONTACT_EMAIL}</p>
          <div className="flex justify-center items-center gap-1 font-bold text-indigo-500 uppercase tracking-tighter"><ShieldCheck size={14}/> Sécurisé par Stripe</div>
        </div>
      </footer>

      {showChatNotif && activeTab === 'horoscope' && !selectedSign && viewState === 'list' && randomPsychic && (
        <div className="fixed bottom-24 right-4 z-[45] flex items-end gap-2 animate-in slide-in-from-right-5">
          <div className="relative bg-white shadow-2xl border border-slate-100 rounded-2xl rounded-br-none p-3 max-w-[190px] mb-8">
            <p className="text-[10px] font-bold text-indigo-600 mb-0.5 uppercase">{randomPsychic.name}</p>
            <p className="text-[11px] text-slate-700 leading-tight italic">"{randomPsychic.hook}"</p>
          </div>
          <button onClick={() => { setActiveTab('voyance'); setSelectedPsychic(randomPsychic); setShowChatNotif(false); }} className="relative w-14 h-14 bg-white rounded-full shadow-2xl border-2 border-indigo-600 overflow-hidden active:scale-95 transition-all">
            <img src={randomPsychic.image} className="w-full h-full object-cover" />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-bold animate-pulse">1</div>
          </button>
        </div>
      )}

      <div className="fixed bottom-0 left-0 w-full bg-white border-t h-16 flex items-center justify-around z-50 pb-safe shadow-lg">
        <button onClick={() => { setActiveTab('horoscope'); setSelectedSign(null); setViewState('list'); }} className={`flex flex-col items-center gap-1 ${activeTab === 'horoscope' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <Moon size={22} fill={activeTab === 'horoscope' ? "currentColor" : "none"}/><span className="text-[9px] font-bold uppercase">Horoscope</span>
        </button>
        <button onClick={() => { setActiveTab('voyance'); setSelectedPsychic(null); setViewState('list'); }} className={`flex flex-col items-center gap-1 ${activeTab === 'voyance' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <MessageCircle size={22} fill={activeTab === 'voyance' ? "currentColor" : "none"}/><span className="text-[9px] font-bold uppercase">Voyance</span>
        </button>
      </div>

      <LegalModal isOpen={!!modalType} onClose={() => setModalType(null)} type={modalType} />
    </div>
  );
}