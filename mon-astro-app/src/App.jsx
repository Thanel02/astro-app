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
    id: 'alma', name: 'Mère Alma', 
    desc: 'Guide spirituelle maternelle et enveloppante.', 
    style: 'Bienveillante et Douce', image: '/caroline-voyante-astropure.png', 
    hook: "Je sens une ombre sur votre cœur...", 
    welcome: "Bonjour mon enfant. Je sens que quelque chose te tracasse... Je suis là pour t'accompagner." 
  },
  { 
    id: 'luna', name: 'Luna', 
    desc: 'Astrologue moderne, franche et complice.', 
    style: 'Analytique et Directe', image: '/nathalie-voyante-astropure.png', 
    hook: "Vos astres sont en plein mouvement...", 
    welcome: "Salut ! Je capte une énergie particulière aujourd'hui. C'est lié à ton passé ou c'est nouveau ?" 
  },
  { 
    id: 'oracle', name: 'Oracle X', 
    desc: 'Conscience analytique supérieure.', 
    style: 'Lucide et Impartial', image: '/pierre-voyant-astropure.png', 
    hook: "Votre trajectoire présente une dissonance...", 
    welcome: "Analyse en cours. Il y a une dissonance dans votre parcours actuel. Je vous écoute." 
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
            <p>Le site AstroPure est édité par <strong>Altéo Consulting</strong>, SIRET 99335347300016.</p>
            <p>Siège : 2 RUE NOTRE-DAME DES VICTOIRES, 75002 PARIS.</p>
          </section>
          <section>
            <h4 className="font-bold text-indigo-900 uppercase text-[10px] mb-2">Hébergeur</h4>
            <p>Vercel Inc., 340 S Lemon Ave #1135, Walnut, CA 91789, USA.</p>
          </section>
          <section className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
            <h4 className="font-bold text-indigo-900 uppercase text-[10px] mb-1">Contact SAV</h4>
            <p className="font-medium text-indigo-600">{CONTACT_EMAIL}</p>
          </section>
        </div>
      )
    },
    cgu: {
      title: "CGU & Confidentialité",
      text: (
        <div className="space-y-4 text-sm text-slate-600 text-left">
          <h4 className="font-bold text-indigo-900 border-b pb-1">Confidentialité (RGPD)</h4>
          <p>Collecte : E-mail, statut Premium, historique chat. Données traitées via Supabase et Stripe. Droit de suppression sur simple demande.</p>
          <h4 className="font-bold text-indigo-900 border-b pb-1 mt-4">Conditions (CGU)</h4>
          <p>Prix : <strong>{PRICE_TEXT}</strong>. Service de divertissement pur. Pas de remboursement après exécution.</p>
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

// --- AUTH ---
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
        <p className="text-center text-xs text-slate-400 mb-6">{isLoginMode ? 'Accédez à votre espace' : `Débloquez l'accès pour ${PRICE_TEXT}`}</p>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded text-xs mb-4">{error}</div>}
        <div className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border outline-none focus:border-indigo-500"/>
          <input type="password" placeholder="Mot de passe" value={password} onChange={e=>setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border outline-none focus:border-indigo-500"/>
          <Button onClick={handleAuth} disabled={loading} className="w-full">{loading ? <Loader2 className="animate-spin"/> : "Valider"}</Button>
        </div>
        <div className="mt-6 text-center text-sm font-medium"><button onClick={onSwitchToLogin} className="text-indigo-600 underline">{isLoginMode ? "Créer un compte" : 'Déjà inscrit ? Connexion'}</button></div>
      </div>
    </div>
  );
};

// --- CHAT ---
const ChatView = ({ psychic, isPremium, onGoBack, onAction, session }) => {
  const [messages, setMessages] = useState([{ role: 'assistant', content: psychic.welcome }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || limitReached || loading) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      // ENVOI AVEC TOUTES LES INFOS REQUISES PAR TON WORKFLOW N8N
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

      // GESTION DE LA LIMITE N8N
      if (data.error === 'LIMIT_REACHED') {
        setLimitReached(true);
        setMessages(prev => [...prev, { role: 'assistant', content: "Le voile se referme... Pour continuer, rejoignez nos membres Premium." }]);
      } else {
        // ON UTILISE LE CHAMP 'TEXT' COMME DÉFINI DANS TON RESPOND TO WEBHOOK1
        setMessages(prev => [...prev, { role: 'assistant', content: data.text || "Les astres sont mystérieux..." }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Les astres sont silencieux. Vérifiez votre connexion." }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 top-16 bottom-16 bg-white z-[40] flex flex-col md:max-w-2xl md:mx-auto shadow-xl">
      <div className="flex items-center gap-4 py-3 px-4 border-b">
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
        {limitReached && (
          <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-xl text-center space-y-3 animate-in fade-in slide-in-from-bottom-4">
            <Sparkles className="mx-auto" />
            <p className="text-xs font-bold uppercase tracking-widest">Limite de 3 messages atteinte</p>
            <Button onClick={onAction} variant="secondary" className="w-full text-indigo-600 font-bold uppercase text-[10px]">Passer en Premium ({PRICE_TEXT})</Button>
          </div>
        )}
      </div>
      {!limitReached && (
        <div className="p-4 border-t bg-white flex gap-2">
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyPress={e=>e.key==='Enter' && handleSend()} placeholder="Écrivez ici..." className="flex-1 bg-slate-50 rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
          <button onClick={handleSend} className="p-3 bg-indigo-600 text-white rounded-xl active:scale-90"><Send size={18}/></button>
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

  useEffect(() => {
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
    <div className="min-h-[100dvh] bg-slate-50 text-slate-900 flex flex-col">
      <Helmet><title>AstroPure | Horoscope & Voyance</title></Helmet>
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50 h-16 flex items-center justify-between px-4">
          <div className="font-serif font-bold text-xl text-indigo-900 cursor-pointer" onClick={() => { setViewState('list'); setSelectedSign(null); setSelectedPsychic(null); }}>AstroPure</div>
          {!session ? <button onClick={() => { setIsLoginMode(true); setViewState('auth'); }} className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 uppercase tracking-widest">Compte</button> : <button onClick={() => supabase.auth.signOut()} className="p-2 text-slate-400"><LogOut size={18}/></button>}
      </nav>
      
      <main className="flex-1 pb-24 overflow-y-auto">
        {viewState === 'auth' ? <AuthView isLoginMode={isLoginMode} onAuthSuccess={() => setViewState('list')} onSwitchToLogin={() => setIsLoginMode(!isLoginMode)} onCancel={() => setViewState('list')} /> : (
          activeTab === 'horoscope' ? (
            selectedSign ? (
              <div className="max-w-2xl mx-auto p-4 animate-in fade-in">
                <button onClick={() => setSelectedSign(null)} className="mb-4 flex items-center text-slate-400"><ArrowLeft size={18} className="mr-2"/>Retour</button>
                <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
                  <h2 className="text-2xl font-serif font-bold">{selectedSign.icon} {selectedSign.name}</h2>
                  <div className="space-y-4">
                    <p className="text-sm font-bold text-rose-600 border-b border-rose-100 uppercase tracking-widest text-[10px]">Cœur</p>
                    <p className="text-sm text-slate-600">Les astres favorisent vos rencontres cette semaine.</p>
                    <p className="text-sm font-bold text-emerald-700 border-b border-emerald-100 uppercase tracking-widest text-[10px]">Travail</p>
                    <p className="text-sm text-slate-600">Une opportunité professionnelle se dessine dès mardi.</p>
                    {!isPremium && <div className="p-4 bg-slate-50 rounded-2xl text-center"><Lock className="mx-auto mb-2 text-slate-300"/><p className="text-xs mb-4">Accédez à votre horoscope <strong>Famille</strong> et <strong>Chance</strong></p><Button onClick={handleUnlock} className="w-full text-[10px] uppercase font-bold">Débloquer ({PRICE_TEXT})</Button></div>}
                  </div>
                </div>
              </div>
            ) : <div className="p-4 grid grid-cols-2 gap-4 max-w-4xl mx-auto">{ZODIAC_SIGNS.map(s => <div key={s.id} onClick={() => setSelectedSign(s)} className="bg-white p-6 rounded-2xl shadow-sm text-center border cursor-pointer hover:border-indigo-300"><div className="text-4xl mb-2">{s.icon}</div><div className="font-bold">{s.name}</div></div>)}</div>
          ) : (
            selectedPsychic ? <ChatView psychic={selectedPsychic} isPremium={isPremium} onGoBack={() => setSelectedPsychic(null)} onAction={handleUnlock} session={session} /> : <div className="p-4 grid gap-4 max-w-2xl mx-auto">{VOYANTES.map(v => <div key={v.id} onClick={() => setSelectedPsychic(v)} className="bg-white p-6 rounded-3xl border flex items-center gap-4 cursor-pointer hover:shadow-md transition-all"><img src={v.image} className="w-16 h-16 rounded-full object-cover" /><div><div className="font-bold">{v.name}</div><div className="text-xs text-slate-400">{v.style}</div></div></div>)}</div>
          )
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