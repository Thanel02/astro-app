import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Helmet } from 'react-helmet';
import { 
  Star, Moon, Sun, Lock, ChevronRight, User, Check, Sparkles, 
  ArrowLeft, Menu, X, LogOut, Loader2, MessageCircle, Send,
  Bot, AlertTriangle, AlertCircle, LayoutGrid, Bell, Clock, ShieldCheck
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
    id: 'caroline', 
    name: 'Caroline', 
    desc: 'Médium pur de naissance. Travaille sans support pour une voyance directe.', 
    style: 'Sincère et Directe', 
    image: '/caroline-voyante-astropure.png', 
    hook: "J'ai un flash urgent vous concernant...", 
    welcome: "Bonjour, je suis Caroline. Je ressens une interrogation profonde en vous. Je vous écoute." 
  },
  { 
    id: 'nathalie', 
    name: 'Nathalie', 
    desc: 'Cartomancienne de 60 ans. Spécialiste du Grand Tarot de Marseille.', 
    style: 'Chaleureuse et Précise', 
    image: '/nathalie-voyante-astropure.png', 
    hook: "Votre tirage de cartes révèle un tournant...", 
    welcome: "Bienvenue mon enfant. Mes cartes sont prêtes à éclairer votre chemin." 
  },
  { 
    id: 'pierre', 
    name: 'Maître Pierre', 
    desc: 'Astrologue et Numérologue certifié. Plus de 30 ans d\'expertise.', 
    style: 'Analytique et Expert', 
    image: '/pierre-voyant-astropure.png', 
    hook: "Un transit planétaire majeur impacte votre ciel...", 
    welcome: "Bonjour. L'étude de vos astres révèle une période charnière." 
  }
];

// --- COMPOSANTS UI ---
const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }) => {
  const baseStyle = "px-6 py-3 rounded-full font-medium transition-all duration-300 transform active:scale-95 shadow-sm flex items-center justify-center";
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
        <div className="space-y-4 text-sm text-slate-600">
          <p><strong>ÉDITEUR DU SITE :</strong> Le site AstroPure est édité par la société <strong>Altéo Consulting</strong>, SIRET 99335347300016.</p>
          <p><strong>SIÈGE SOCIAL :</strong> 2 RUE NOTRE-DAME DES VICTOIRES, 75002 PARIS.</p>
          <p><strong>HÉBERGEUR :</strong> Vercel Inc., 340 S Lemon Ave #1135, Walnut, CA 91789, USA.</p>
        </div>
      )
    },
    cgu: {
      title: "CGU & Confidentialité",
      text: (
        <div className="space-y-4 text-sm text-slate-600">
          <h4 className="font-bold text-slate-900">1. Objet</h4>
          <p>AstroPure propose des services de divertissement liés aux arts divinatoires. Service réservé aux majeurs.</p>
          <h4 className="font-bold text-slate-900">2. Données</h4>
          <p>Nous collectons votre email pour votre compte. Paiements sécurisés via Stripe.</p>
        </div>
      )
    }
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-serif font-bold text-xl text-indigo-900">{content[type].title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X size={20}/></button>
        </div>
        <div className="p-8 max-h-[50vh] overflow-y-auto">{content[type].text}</div>
        <div className="p-6 border-t border-slate-100"><Button onClick={onClose} className="w-full">Fermer</Button></div>
      </div>
    </div>
  );
};

// --- VUE AUTHENTIFICATION ---
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
        <button onClick={onCancel} className="absolute top-4 right-4 text-slate-400"><X size={20}/></button>
        <h2 className="text-2xl font-bold text-center mb-6 font-serif">{isLoginMode ? 'Connexion' : 'Inscription'}</h2>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded text-sm mb-4">{error}</div>}
        <div className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"/>
          <input type="password" placeholder="Mot de passe" value={password} onChange={e=>setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"/>
          <Button onClick={handleAuth} disabled={loading} className="w-full">{loading ? <Loader2 className="animate-spin"/> : (isLoginMode ? 'Se connecter' : "Créer mon compte")}</Button>
        </div>
        <div className="mt-6 text-center text-sm"><button onClick={onSwitchToLogin} className="text-indigo-600 font-medium underline">{isLoginMode ? "Pas de compte ? S'inscrire" : 'Déjà membre ? Se connecter'}</button></div>
      </div>
    </div>
  );
};

// --- VUES PRINCIPALES ---
const HomeView = ({ onSelectSign }) => (
  <div className="max-w-5xl mx-auto px-4 py-8">
    <div className="text-center mb-10"><h1 className="text-3xl md:text-4xl font-serif text-slate-900 font-bold">Horoscope Hebdomadaire</h1><p className="text-slate-500 italic">Prévoyez votre avenir</p></div>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {ZODIAC_SIGNS.map((sign) => (
        <div key={sign.id} onClick={() => onSelectSign(sign)} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md cursor-pointer flex flex-col items-center group">
          <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{sign.icon}</div>
          <h3 className="font-semibold text-slate-800">{sign.name}</h3>
        </div>
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
  
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <button onClick={onGoBack} className="flex items-center text-slate-400 hover:text-indigo-600 mb-6"><ArrowLeft size={18} className="mr-2" /> Retour</button>
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">{sign.icon} {sign.name}</h2>
          <p className="text-slate-700 italic mb-6">"{horoscope?.intro}"</p>
          <div className="space-y-4 text-sm">
             <div><h3 className="font-bold text-rose-600 border-b border-rose-100 mb-1">Cœur</h3><p className="text-slate-600">{horoscope?.love}</p></div>
             <div><h3 className="font-bold text-emerald-700 border-b border-emerald-100 mb-1">Travail</h3><p className="text-slate-600">{horoscope?.work}</p></div>
          </div>
        </div>
        <div className="p-6 bg-slate-50 border-t border-slate-100 relative">
           {!isPremium && (
             <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center p-4 z-10">
               <div className="bg-white p-4 rounded-xl shadow-lg border border-indigo-50 text-center">
                 <Lock className="mx-auto text-indigo-400 mb-2" size={20}/>
                 <Button onClick={session ? onSubscribeReq : onAuthReq} className="py-2 text-xs">Débloquer</Button>
               </div>
             </div>
           )}
           <div className={!isPremium ? "blur-md select-none" : ""}>
             <h3 className="font-bold text-indigo-900 text-sm mb-2 uppercase">Chiffres de Chance</h3>
             <p className="text-sm text-indigo-800">Couleur : {horoscope?.premium_data?.color}</p>
             <p className="text-sm text-indigo-800">Numéros : {Array.isArray(horoscope?.premium_data?.lucky_numbers) ? horoscope.premium_data.lucky_numbers.join(', ') : "..."}</p>
           </div>
        </div>
      </div>
    </div>
  );
};

const PsychicSelectionView = ({ onSelectPsychic, busyId }) => (
  <div className="max-w-4xl mx-auto px-4 py-8">
    <div className="text-center mb-10"><h1 className="text-3xl md:text-4xl font-serif text-slate-900 font-bold">Voyance en Direct</h1></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {VOYANTES.map((p) => {
        const isBusy = p.id === busyId;
        return (
          <div key={p.id} onClick={() => !isBusy && onSelectPsychic(p)} className={`bg-white rounded-2xl p-6 text-center border border-slate-100 shadow-sm relative ${isBusy ? 'opacity-80' : 'cursor-pointer hover:border-indigo-300'}`}>
            <img src={p.image} alt={p.name} className={`w-20 h-20 rounded-full object-cover mx-auto mb-4 border-2 border-indigo-100 ${isBusy ? 'grayscale' : ''}`} />
            <h3 className="font-bold text-slate-800">{p.name}</h3>
            <p className="text-[10px] text-indigo-600 uppercase font-bold mb-4">{p.style}</p>
            <button className={`w-full py-2 rounded-full text-[10px] font-bold uppercase tracking-widest ${isBusy ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 text-white'}`}>
              {isBusy ? 'Occupée' : 'Consulter'}
            </button>
          </div>
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
    const userMsg = input; setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    try {
      const response = await fetch(N8N_CHAT_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, userId: session?.user?.id || 'anonymous', voyanteId: psychic.id, isPremium })
      });
      const data = await response.json();
      const reply = data.response || data.text || "La connexion est instable...";
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      if (!isPremium) setMsgCount(prev => prev + 1);
    } catch (e) { setMessages(prev => [...prev, { role: 'assistant', content: "Erreur..." }]); } 
    finally { setLoading(false); }
  };

  const showPaywall = !isPremium && msgCount >= 3;

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-140px)] flex flex-col px-2">
      <div className="flex items-center gap-4 py-4 border-b border-slate-100">
        <button onClick={onGoBack} className="p-2"><ArrowLeft size={20}/></button>
        <img src={psychic.image} className="w-10 h-10 rounded-full object-cover" />
        <h3 className="font-bold">{psychic.name}</h3>
      </div>
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border text-slate-700 rounded-bl-none'}`}>{m.content}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-white">
        {showPaywall ? (
          <Button onClick={session ? onSubscribeReq : onAuthReq} className="w-full text-xs">Continuer la séance (Premium)</Button>
        ) : (
          <div className="flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSend()} className="flex-1 bg-slate-50 border rounded-full px-5 py-3 outline-none" placeholder="Votre message..." />
            <button onClick={handleSend} className="bg-indigo-600 text-white p-3 rounded-full"><Send size={18}/></button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- APP ---
export default function App() {
  const [activeTab, setActiveTab] = useState('horoscope'); 
  const [viewState, setViewState] = useState('list'); 
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [selectedSign, setSelectedSign] = useState(null);
  const [selectedPsychic, setSelectedPsychic] = useState(null);
  const [session, setSession] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [busyPsychicId, setBusyPsychicId] = useState(null);

  useEffect(() => {
    setBusyPsychicId(VOYANTES[Math.floor(Math.random() * VOYANTES.length)].id);
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sess) => {
      setSession(sess);
      if (sess?.user) {
        supabase.from('profiles').select('is_premium').eq('id', sess.user.id).single().then(({data}) => {
          if (data) setIsPremium(data.is_premium);
        });
      } else { setIsPremium(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubscribe = () => {
    const returnUrl = window.location.origin;
    window.location.href = session ? `${STRIPE_LINK}?client_reference_id=${session.user.id}&return_url=${encodeURIComponent(returnUrl)}` : STRIPE_LINK;
  };

  const renderContent = () => {
    if (viewState === 'auth') return <AuthView isLoginMode={isLoginMode} onAuthSuccess={() => setViewState('list')} onSwitchToLogin={() => setIsLoginMode(!isLoginMode)} onCancel={() => setViewState('list')} />;
    if (activeTab === 'horoscope') {
      if (selectedSign) return <ReadingView sign={selectedSign} session={session} isPremium={isPremium} onGoBack={() => setSelectedSign(null)} onAuthReq={() => { setIsLoginMode(true); setViewState('auth'); }} onSubscribeReq={handleSubscribe} />;
      return <HomeView onSelectSign={setSelectedSign} />;
    }
    if (activeTab === 'voyance') {
      if (selectedPsychic) return <ChatView psychic={selectedPsychic} session={session} isPremium={isPremium} onGoBack={() => setSelectedPsychic(null)} onAuthReq={() => { setIsLoginMode(true); setViewState('auth'); }} onSubscribeReq={handleSubscribe} />;
      return <PsychicSelectionView onSelectPsychic={setSelectedPsychic} busyId={busyPsychicId} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <Helmet>
        <title>AstroPure | Horoscope et Voyance</title>
        <meta name="description" content="Découvrez votre avenir avec AstroPure." />
      </Helmet>

      <nav className="bg-white border-b sticky top-0 z-50 h-16 flex items-center justify-between px-4">
         <div className="font-serif font-bold text-xl text-indigo-900">AstroPure</div>
         {!session ? (
           <button onClick={() => { setIsLoginMode(true); setViewState('auth'); }} className="text-sm font-bold text-indigo-600 underline">Espace Membre</button>
         ) : (
           <div className="flex items-center gap-3">
             {isPremium && <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full border border-indigo-100 font-bold">PREMIUM</span>}
             <button onClick={() => supabase.auth.signOut()} className="p-2 bg-slate-50 rounded-full"><LogOut size={16}/></button>
           </div>
         )}
      </nav>
      
      <main className="flex-1 pb-24">{renderContent()}</main>

      <footer className="bg-white border-t p-8 text-center text-[10px] text-slate-400 pb-32">
        <div className="max-w-4xl mx-auto space-y-2">
          <p className="font-bold">ALTÉO CONSULTING</p>
          <div className="flex justify-center gap-4 underline">
            <button onClick={() => setModalType('mentions')}>Mentions Légales</button>
            <button onClick={() => setModalType('cgu')}>CGU & Confidentialité</button>
          </div>
          <p>2 RUE NOTRE-DAME DES VICTOIRES, 75002 PARIS</p>
          <div className="flex justify-center items-center gap-1 font-bold text-indigo-500 mt-2"><ShieldCheck size={12}/> PAIEMENTS SÉCURISÉS STRIPE</div>
        </div>
      </footer>

      <div className="fixed bottom-0 left-0 w-full bg-white border-t h-16 flex items-center justify-around z-50">
        <button onClick={() => { setActiveTab('horoscope'); setSelectedSign(null); setViewState('list'); }} className={`flex flex-col items-center gap-1 ${activeTab === 'horoscope' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <Moon size={22}/><span className="text-[10px] font-bold">Horoscope</span>
        </button>
        <button onClick={() => { setActiveTab('voyance'); setSelectedPsychic(null); setViewState('list'); }} className={`flex flex-col items-center gap-1 ${activeTab === 'voyance' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <MessageCircle size={22}/><span className="text-[10px] font-bold">Voyance</span>
        </button>
      </div>

      <LegalModal isOpen={!!modalType} onClose={() => setModalType(null)} type={modalType} />
    </div>
  );
}