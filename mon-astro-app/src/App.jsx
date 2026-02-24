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
    desc: 'Médium pur de naissance. Travaille sans support pour une voyance directe.', 
    style: 'Sincère et Directe', image: '/caroline-voyante-astropure.png', 
    hook: "J'ai un flash urgent vous concernant...", 
    welcome: "Bonjour, je suis Caroline. Je ressens une interrogation profonde en vous. Je vous écoute." 
  },
  { 
    id: 'nathalie', name: 'Nathalie', 
    desc: 'Cartomancienne de 60 ans. Spécialiste du Grand Tarot de Marseille.', 
    style: 'Chaleureuse et Précise', image: '/nathalie-voyante-astropure.png', 
    hook: "Votre tirage de cartes révèle un tournant...", 
    welcome: "Bienvenue mon enfant. Mes cartes sont prêtes à éclairer votre chemin." 
  },
  { 
    id: 'pierre', name: 'Maître Pierre', 
    desc: 'Astrologue et Numérologue certifié. Plus de 30 ans d\'expertise.', 
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
            <p>Le site AstroPure est édité par la société <strong>Altéo Consulting</strong>, SIRET <strong>993 353 473 00016</strong>.</p>
            <p>Siège : 2 RUE NOTRE-DAME DES VICTOIRES, 75002 PARIS.</p>
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
          <h4 className="font-bold text-indigo-900 border-b pb-1">Confidentialité (RGPD)</h4>
          <p>Collecte : E-mail, statut Premium, historique chat. Paiements via Stripe. Droit de suppression via {CONTACT_EMAIL}.</p>
          <h4 className="font-bold text-indigo-900 border-b pb-1 mt-4">Conditions (CGU)</h4>
          <p>Prix : <strong>{PRICE_TEXT}</strong>. Service de divertissement. Aucun remboursement après déblocage.</p>
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
        <h2 className="text-2xl font-bold text-center mb-2 font-serif text-indigo-900">{isLoginMode ? 'Connexion' : 'Inscription'}</h2>
        <p className="text-center text-xs text-slate-400 mb-6">{isLoginMode ? 'Accédez à votre compte' : `Rejoignez-nous pour ${PRICE_TEXT}`}</p>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded text-xs mb-4">{error}</div>}
        <div className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"/>
          <input type="password" placeholder="Mot de passe" value={password} onChange={e=>setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"/>
          <Button onClick={handleAuth} disabled={loading} className="w-full">{loading ? <Loader2 className="animate-spin"/> : "Valider"}</Button>
        </div>
        <div className="mt-6 text-center text-sm font-medium"><button onClick={onSwitchToLogin} className="text-indigo-600 underline">{isLoginMode ? "Créer un compte" : 'Déjà inscrit ? Connexion'}</button></div>
      </div>
    </div>
  );
};

// --- HOROSCOPE ---
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
        <p className="text-slate-700 leading-relaxed mb-6 italic text-lg">"{horoscope?.intro || "Les astres vous préparent un message..."}"</p>
        <div className="space-y-6">
          <div><h3 className="font-bold text-rose-600 mb-1 border-b border-rose-100 pb-1 uppercase tracking-widest text-[10px]">Cœur</h3><p className="text-sm text-slate-600 leading-relaxed">{horoscope?.love || "Analyse en cours..."}</p></div>
          <div><h3 className="font-bold text-emerald-700 mb-1 border-b border-emerald-100 pb-1 uppercase tracking-widest text-[10px]">Travail</h3><p className="text-sm text-slate-600 leading-relaxed">{horoscope?.work || "Analyse en cours..."}</p></div>
          {!isPremium ? (
            <div className="p-6 bg-slate-50 rounded-2xl border border-indigo-100 text-center relative mt-6 animate-in fade-in">
              <Lock className="mx-auto text-indigo-400 mb-2" size={24}/>
              <p className="text-sm font-medium text-slate-600 mb-4 uppercase">Débloquez vos prévisions <strong>Famille</strong> et <strong>Chance</strong></p>
              <Button onClick={onAction} className="w-full uppercase tracking-widest text-[10px] font-bold">Débloquer ({PRICE_TEXT})</Button>
            </div>
          ) : (
            <>
              <div className="animate-in fade-in duration-700"><h3 className="font-bold text-indigo-600 mb-1 border-b border-indigo-100 pb-1 uppercase tracking-widest text-[10px]">Vie de Famille</h3><p className="text-sm text-slate-600 leading-relaxed">{horoscope?.family || "L'harmonie régnera sur votre foyer."}</p></div>
              <div className="animate-in fade-in duration-1000"><h3 className="font-bold text-amber-600 mb-1 border-b border-amber-100 pb-1 uppercase tracking-widest text-[10px]">Signaux de Chance</h3><p className="text-sm text-slate-600 leading-relaxed">{horoscope?.luck || "Une belle synchronicité arrive."}</p></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// --- SELECTION VOYANTE ---
const PsychicSelectionView = ({ onSelectPsychic, busyId }) => (
  <div className="max-w-4xl mx-auto px-4 py-8">
    <div className="text-center mb-10"><h1 className="text-3xl font-serif font-bold text-slate-900">Voyance en Direct</h1></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12">
      {VOYANTES.map((p) => {
        const isBusy = p.id === busyId;
        return (
          <div key={p.id} onClick={() => !isBusy && onSelectPsychic(p)} className={`bg-white rounded-3xl p-6 text-center border shadow-sm transition-all ${isBusy ? 'opacity-80' : 'cursor-pointer hover:border-indigo-300'}`}>
            <img src={p.image} className={`w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-white shadow-md ${isBusy ? 'grayscale' : ''}`} />
            <h3 className="font-bold text-slate-800 text-lg">{p.name}</h3>
            <p className="text-xs text-slate-400 italic mb-4">{p.style}</p>
            <button className={`w-full mt-4 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${isBusy ? 'bg-slate-50 text-slate-300' : 'bg-indigo-600 text-white'}`}>
              {isBusy ? 'Occupée' : 'Consulter'}
            </button>
          </div>
        )
      })}
    </div>
  </div>
);

// --- CHAT SYSTEM (OPTIMISÉ ANTI-SAUT) ---
const ChatView = ({ psychic, isPremium, onGoBack, onAction, session }) => {
  const [messages, setMessages] = useState([{ role: 'assistant', content: psychic.welcome }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const scrollRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Auto-scroll intelligent
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, loading]);

  // Correction pour le clavier mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        const viewportHeight = window.visualViewport.height;
        document.documentElement.style.setProperty('--vh', `${viewportHeight}px`);
      }
    };
    window.visualViewport?.addEventListener('resize', handleResize);
    handleResize();
    return () => window.visualViewport?.removeEventListener('resize', handleResize);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading || limitReached) return;
    
    const userMsg = input;
    const userCount = messages.filter(m => m.role === 'user').length;
    
    if (!isPremium && userCount >= FREE_CHAT_LIMIT) {
      setLimitReached(true);
      return;
    }

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
          isPremium: isPremium
        })
      });
      const data = await response.json();
      
      if (data.error === 'LIMIT_REACHED') {
        setLimitReached(true);
        setMessages(prev => [...prev, { role: 'assistant', content: "Le voile se referme... Pour continuer la séance, passez en Premium." }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.text || "Les astres sont mystérieux..." }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Connexion interrompue. Réessayez." }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-white z-[40] flex flex-col md:max-w-2xl md:mx-auto shadow-xl overflow-hidden" style={{ height: 'var(--vh, 100vh)' }}>
      {/* Header fixe */}
      <div className="flex items-center gap-4 py-3 px-4 border-b bg-white flex-shrink-0">
        <button onClick={onGoBack} className="p-1.5 bg-slate-50 rounded-full"><ArrowLeft size={20}/></button>
        <img src={psychic.image} className="w-10 h-10 rounded-full object-cover" />
        <h3 className="font-bold text-sm">{psychic.name}</h3>
      </div>

      {/* Zone de messages scrollable */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50/30"
        style={{ overflowAnchor: 'auto', scrollPaddingBottom: '20px' }}
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm shadow-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border text-slate-700 rounded-bl-none'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && <div className="flex justify-start animate-pulse"><div className="bg-white p-3 rounded-2xl border"><Loader2 className="animate-spin text-indigo-400" size={18}/></div></div>}
        <div ref={scrollRef} className="h-4" />
        
        {(limitReached) && (
          <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-xl text-center space-y-3 animate-in fade-in slide-in-from-bottom-4">
            <Sparkles className="mx-auto" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Limite de messages atteinte</p>
            <Button onClick={onAction} variant="secondary" className="w-full text-indigo-600 font-bold uppercase text-[10px]">Passer en Premium ({PRICE_TEXT})</Button>
          </div>
        )}
      </div>

      {/* Zone de saisie fixe en bas */}
      {!limitReached && (
        <div className="p-3 border-t bg-white flex gap-2 flex-shrink-0">
          <input 
            value={input} 
            onChange={e=>setInput(e.target.value)} 
            onKeyPress={e=>e.key==='Enter' && handleSend()} 
            placeholder="Écrivez ici..." 
            className="flex-1 bg-slate-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500" 
            enterKeyHint="send"
          />
          <button onClick={handleSend} className="p-3 bg-indigo-600 text-white rounded-xl active:scale-90 transition-transform"><Send size={20}/></button>
        </div>
      )}
    </div>
  );
};

// --- APP ---
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

  useEffect(() => {
    const timer = setTimeout(() => setShowChatNotif(true), 5000);
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sess) => {
      setSession(sess);
      if (sess?.user) {
        supabase.from('profiles').select('is_premium').eq('id', sess.user.id).single().then(({data}) => {
          if (data?.is_premium) setIsPremium(true);
        });
      } else { setIsPremium(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleUnlock = () => {
    if (!session) { setViewState('auth'); setIsLoginMode(false); }
    else { window.location.href = STRIPE_LINK; }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Helmet><title>AstroPure | Horoscope & Voyance</title></Helmet>
      
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50 h-16 flex items-center justify-between px-4 flex-shrink-0">
          <div className="font-serif font-bold text-xl text-indigo-900 cursor-pointer" onClick={() => { setViewState('list'); setSelectedSign(null); setSelectedPsychic(null); }}>AstroPure</div>
          {!session ? <button onClick={() => { setIsLoginMode(true); setViewState('auth'); }} className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 uppercase tracking-widest">Compte</button> : <button onClick={() => supabase.auth.signOut()} className="p-2 text-slate-400"><LogOut size={18}/></button>}
      </nav>
      
      <main className="flex-1 overflow-y-auto">
        {viewState === 'auth' ? <AuthView isLoginMode={isLoginMode} onAuthSuccess={() => setViewState('list')} onSwitchToLogin={() => setIsLoginMode(!isLoginMode)} onCancel={() => setViewState('list')} /> : (
          activeTab === 'horoscope' ? (
            selectedSign ? <ReadingView sign={selectedSign} isPremium={isPremium} onGoBack={() => setSelectedSign(null)} onAction={handleUnlock} /> : (
              <div className="max-w-5xl mx-auto px-4 py-8 text-center animate-in fade-in duration-500">
                <h1 className="text-3xl font-serif text-slate-900 font-bold mb-10">Horoscope Hebdomadaire</h1>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-12">
                  {ZODIAC_SIGNS.map(s => <div key={s.id} onClick={() => setSelectedSign(s)} className="bg-white p-6 rounded-2xl shadow-sm text-center border cursor-pointer hover:border-indigo-300 transition-all"><div className="text-4xl mb-2">{s.icon}</div><div className="font-bold">{s.name}</div></div>)}
                </div>
              </div>
            )
          ) : (
            selectedPsychic ? <ChatView psychic={selectedPsychic} isPremium={isPremium} onGoBack={() => setSelectedPsychic(null)} onAction={handleUnlock} session={session} /> : <PsychicSelectionView onSelectPsychic={setSelectedPsychic} busyId="pierre" />
          )
        )}
      </main>

      {/* Footer masqué si chat ouvert sur mobile */}
      {!selectedPsychic && (
        <footer className="bg-white border-t p-8 text-center text-[10px] text-slate-400 pb-32 flex-shrink-0">
          <div className="max-w-4xl mx-auto space-y-4">
            <p className="font-bold tracking-widest uppercase">Altéo Consulting</p>
            <div className="flex justify-center gap-4 underline">
              <button onClick={() => setModalType('mentions')}>Mentions Légales</button>
              <button onClick={() => setModalType('cgu')}>CGU & Confidentialité</button>
            </div>
            <p>SAV : {CONTACT_EMAIL}</p>
            <div className="flex justify-center items-center gap-1 font-bold text-indigo-500 uppercase"><ShieldCheck size={14}/> Sécurisé par Stripe</div>
          </div>
        </footer>
      )}

      {/* Nav basse masquée si chat ouvert */}
      {!selectedPsychic && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t h-16 flex items-center justify-around z-50 shadow-lg">
          <button onClick={() => { setActiveTab('horoscope'); setViewState('list'); setSelectedSign(null); }} className={`flex flex-col items-center gap-1 ${activeTab === 'horoscope' ? 'text-indigo-600' : 'text-slate-400'}`}><Moon size={22}/><span className="text-[9px] font-bold uppercase">Horoscope</span></button>
          <button onClick={() => { setActiveTab('voyance'); setViewState('list'); setSelectedPsychic(null); }} className={`flex flex-col items-center gap-1 ${activeTab === 'voyance' ? 'text-indigo-600' : 'text-slate-400'}`}><MessageCircle size={22}/><span className="text-[9px] font-bold uppercase">Voyance</span></button>
        </div>
      )}

      {showChatNotif && activeTab === 'horoscope' && !selectedSign && viewState === 'list' && (
        <div className="fixed bottom-24 right-4 z-[45] flex items-end gap-2 animate-in slide-in-from-right-5 duration-700">
          <div className="relative bg-white shadow-2xl border border-slate-100 rounded-2xl rounded-br-none p-3 max-w-[190px] mb-8">
            <p className="text-[10px] font-bold text-indigo-600 mb-0.5 uppercase">{VOYANTES[0].name}</p>
            <p className="text-[11px] text-slate-700 leading-tight italic">"{VOYANTES[0].hook}"</p>
            <div className="absolute bottom-[-8px] right-0 w-0 h-0 border-l-[10px] border-l-transparent border-t-[10px] border-t-white"></div>
          </div>
          <button onClick={() => { setActiveTab('voyance'); setSelectedPsychic(VOYANTES[0]); setShowChatNotif(false); }} className="relative w-14 h-14 bg-white rounded-full shadow-2xl border-2 border-indigo-600 overflow-hidden active:scale-95 transition-all">
            <img src={VOYANTES[0].image} className="w-full h-full object-cover" />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-bold animate-pulse">1</div>
          </button>
        </div>
      )}

      <LegalModal isOpen={!!modalType} onClose={() => setModalType(null)} type={modalType} />
    </div>
  );
}