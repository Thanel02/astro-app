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
            <p>Le site AstroPure est édité par la société <strong>Altéo Consulting</strong>, SIRET <strong>993 353 473 00016</strong>.</p>
            <p>Siège : 2 RUE NOTRE-DAME DES VICTOIRES, 75002 PARIS.</p>
          </section>
          <section>
            <h4 className="font-bold text-indigo-900 uppercase text-[10px] mb-2">Hébergeur</h4>
            <p>Vercel Inc., 340 S Lemon Ave #1135, Walnut, CA 91789, USA.</p>
          </section>
          <section className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <h4 className="font-bold text-indigo-900 uppercase text-[10px] mb-1">SAV & Contact</h4>
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
          <p>Collecte de l'e-mail pour le compte et historique chat. Paiements gérés par Stripe. Droit de suppression via {CONTACT_EMAIL}.</p>
          <h4 className="font-bold text-indigo-900 border-b pb-1 mt-4">Conditions (CGU)</h4>
          <p>Prix : <strong>{PRICE_TEXT}</strong>. Service de divertissement. Aucun remboursement après déblocage. Majeurs uniquement.</p>
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
        <p className="text-center text-xs text-slate-400 mb-6">{isLoginMode ? 'Ravie de vous revoir' : `Rejoignez-nous pour ${PRICE_TEXT}`}</p>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded text-xs mb-4">{error}</div>}
        <div className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"/>
          <input type="password" placeholder="Mot de passe" value={password} onChange={e=>setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"/>
          <Button onClick={handleAuth} disabled={loading} className="w-full">{loading ? <Loader2 className="animate-spin"/> : "Continuer"}</Button>
        </div>
        <div className="mt-6 text-center text-sm font-medium"><button onClick={onSwitchToLogin} className="text-indigo-600 underline">{isLoginMode ? "S'inscrire" : 'Déjà membre ? Se connecter'}</button></div>
      </div>
    </div>
  );
};

// --- HOROSCOPE READING ---
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
          <div><h3 className="font-bold text-rose-600 mb-1 border-b border-rose-100 pb-1 uppercase tracking-widest text-[10px]">Cœur</h3><p className="text-sm text-slate-600 leading-relaxed">{horoscope?.love || "Chargement..."}</p></div>
          <div><h3 className="font-bold text-emerald-700 mb-1 border-b border-emerald-100 pb-1 uppercase tracking-widest text-[10px]">Travail</h3><p className="text-sm text-slate-600 leading-relaxed">{horoscope?.work || "Chargement..."}</p></div>

          {!isPremium ? (
            <div className="p-6 bg-slate-50 rounded-2xl border border-indigo-100 text-center relative mt-6 animate-in fade-in">
              <Lock className="mx-auto text-indigo-400 mb-2" size={24}/>
              <p className="text-sm font-medium text-slate-600 mb-4">Débloquez vos prévisions <strong>Famille</strong> et <strong>Chance</strong> pour cette semaine.</p>
              <Button onClick={onAction} className="w-full uppercase tracking-widest text-[10px] font-bold">Débloquer ({PRICE_TEXT})</Button>
            </div>
          ) : (
            <>
              <div className="animate-in fade-in duration-700"><h3 className="font-bold text-indigo-600 mb-1 border-b border-indigo-100 pb-1 uppercase tracking-widest text-[10px]">Vie de Famille</h3><p className="text-sm text-slate-600 leading-relaxed">{horoscope?.family || "L'harmonie régnera sur votre foyer cette semaine."}</p></div>
              <div className="animate-in fade-in duration-1000"><h3 className="font-bold text-amber-600 mb-1 border-b border-amber-100 pb-1 uppercase tracking-widest text-[10px]">Signaux de Chance</h3><p className="text-sm text-slate-600 leading-relaxed">{horoscope?.luck || "Une belle synchronicité va vous ouvrir des portes inattendues."}</p></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// --- CHAT SYSTEM ---
const ChatView = ({ psychic, isPremium, onGoBack, onAction }) => {
  const [messages, setMessages] = useState([{ role: 'assistant', content: psychic.welcome }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const userCount = messages.filter(m => m.role === 'user').length;
  const isLimitReached = !isPremium && userCount >= FREE_CHAT_LIMIT;

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLimitReached || loading) return;
    const newMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(N8N_CHAT_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, psychic: psychic.name, history: messages })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.output || "Je ressens une vibration..." }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Le ciel est brouillé, réessayez dans un instant." }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 top-16 bottom-16 bg-white z-[40] flex flex-col md:max-w-2xl md:mx-auto shadow-xl">
      <div className="flex items-center gap-4 py-3 px-4 border-b bg-white">
        <button onClick={onGoBack} className="p-1.5 bg-slate-50 rounded-full"><ArrowLeft size={20}/></button>
        <img src={psychic.image} className="w-10 h-10 rounded-full object-cover" />
        <h3 className="font-bold text-sm">{psychic.name}</h3>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50/30">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm shadow-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border text-slate-700 rounded-bl-none'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && <div className="flex justify-start"><div className="bg-white p-3 rounded-2xl border"><Loader2 className="animate-spin text-indigo-400" size={18}/></div></div>}
        <div ref={scrollRef} />
        {isLimitReached && (
          <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-xl text-center space-y-3 animate-in fade-in slide-in-from-bottom-4">
            <Sparkles className="mx-auto" />
            <p className="text-xs opacity-90 leading-relaxed font-medium italic">"Votre destin mérite une attention particulière..."</p>
            <p className="text-[10px] opacity-80">Vous avez atteint vos {FREE_CHAT_LIMIT} messages offerts.</p>
            <Button onClick={onAction} variant="secondary" className="w-full text-indigo-600 border-none font-bold uppercase text-[10px]">Passer en Premium ({PRICE_TEXT})</Button>
          </div>
        )}
      </div>
      {!isLimitReached && (
        <div className="p-4 border-t bg-white flex gap-2">
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyPress={e=>e.key==='Enter' && handleSend()} placeholder="Posez votre question..." className="flex-1 bg-slate-50 rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
          <button onClick={handleSend} className="p-3 bg-indigo-600 text-white rounded-xl active:scale-90 transition-transform"><Send size={18}/></button>
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
      }
    });
    return () => { subscription.unsubscribe(); clearTimeout(timer); };
  }, []);

  const handleUnlock = () => {
    if (!session) { setViewState('auth'); setIsLoginMode(false); }
    else { window.location.href = STRIPE_LINK; }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-900 font-sans flex flex-col">
      <Helmet><title>AstroPure | Horoscope & Voyance</title></Helmet>
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50 h-16 flex items-center justify-between px-4">
          <div className="font-serif font-bold text-xl text-indigo-900 cursor-pointer" onClick={() => { setViewState('list'); setSelectedSign(null); setSelectedPsychic(null); }}>AstroPure</div>
          {!session ? <button onClick={() => { setIsLoginMode(true); setViewState('auth'); }} className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 uppercase tracking-widest">Compte</button> : <button onClick={() => supabase.auth.signOut()} className="p-2 text-slate-400"><LogOut size={18}/></button>}
      </nav>
      
      <main className="flex-1 pb-24 overflow-y-auto">
        {viewState === 'auth' ? <AuthView isLoginMode={isLoginMode} onAuthSuccess={() => setViewState('list')} onSwitchToLogin={() => setIsLoginMode(!isLoginMode)} onCancel={() => setViewState('list')} /> : (
          activeTab === 'horoscope' ? (selectedSign ? <ReadingView sign={selectedSign} isPremium={isPremium} onGoBack={() => setSelectedSign(null)} onAction={handleUnlock} /> : <div className="p-4 grid grid-cols-2 gap-4 max-w-4xl mx-auto">{ZODIAC_SIGNS.map(s => <div key={s.id} onClick={() => setSelectedSign(s)} className="bg-white p-6 rounded-2xl shadow-sm text-center cursor-pointer border hover:border-indigo-300 transition-all"><div className="text-4xl mb-2">{s.icon}</div><div className="font-bold">{s.name}</div></div>)}</div>) : (selectedPsychic ? <ChatView psychic={selectedPsychic} isPremium={isPremium} onGoBack={() => setSelectedPsychic(null)} onAction={handleUnlock} /> : <div className="p-4 grid gap-4 max-w-2xl mx-auto">{VOYANTES.map(v => <div key={v.id} onClick={() => setSelectedPsychic(v)} className="bg-white p-6 rounded-3xl border flex items-center gap-4 cursor-pointer hover:shadow-md transition-all"><img src={v.image} className="w-16 h-16 rounded-full object-cover" /><div><div className="font-bold">{v.name}</div><div className="text-xs text-slate-400">{v.style}</div></div></div>)}</div>)
        )}
      </main>

      <footer className="bg-white border-t p-8 text-center text-[10px] text-slate-400 pb-32">
        <div className="max-w-4xl mx-auto space-y-4">
          <p className="font-bold tracking-widest uppercase">Altéo Consulting</p>
          <div className="flex justify-center gap-4 underline">
            <button onClick={() => setModalType('mentions')}>Mentions Légales</button>
            <button onClick={() => setModalType('cgu')}>CGU & Confidentialité</button>
          </div>
          <p>SAV : {CONTACT_EMAIL}</p>
          <div className="flex justify-center items-center gap-1 font-bold text-indigo-500 uppercase"><ShieldCheck size={14}/> Paiements Stripe</div>
        </div>
      </footer>

      <div className="fixed bottom-0 left-0 w-full bg-white border-t h-16 flex items-center justify-around z-50">
        <button onClick={() => { setActiveTab('horoscope'); setViewState('list'); }} className={`flex flex-col items-center gap-1 ${activeTab === 'horoscope' ? 'text-indigo-600' : 'text-slate-400'}`}><Moon size={22}/><span className="text-[9px] font-bold">HOROSCOPE</span></button>
        <button onClick={() => { setActiveTab('voyance'); setViewState('list'); }} className={`flex flex-col items-center gap-1 ${activeTab === 'voyance' ? 'text-indigo-600' : 'text-slate-400'}`}><MessageCircle size={22}/><span className="text-[9px] font-bold">VOYANCE</span></button>
      </div>

      <LegalModal isOpen={!!modalType} onClose={() => setModalType(null)} type={modalType} />
    </div>
  );
}