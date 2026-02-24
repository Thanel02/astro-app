import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Helmet } from 'react-helmet';
import ReactGA from "react-ga4";
import { 
  Star, Moon, Sun, Lock, ChevronRight, User, Check, Sparkles, 
  ArrowLeft, Menu, X, LogOut, Loader2, MessageCircle, Send,
  Bot, AlertTriangle, AlertCircle, LayoutGrid, Bell, Clock, ShieldCheck, Mail, Key, Settings
} from 'lucide-react';

// --- CONFIGURATION ---
const STRIPE_LINK = "https://buy.stripe.com/6oUdR8gX08J0cbO2q0dAk00"; 
const N8N_CHAT_WEBHOOK = "https://landingfactory.app.n8n.cloud/webhook/chat-voyance";
const CONTACT_EMAIL = "gestion@alteoconseil.fr";
const PRICE_TEXT = "2,99€/mois";
const FREE_CHAT_LIMIT = 3;
const GA_MEASUREMENT_ID = "GTM-5RQQPZGH"; 

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    })
  : null;

ReactGA.initialize(GA_MEASUREMENT_ID);

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
  { id: 'caroline', name: 'Caroline', desc: 'Médium de naissance.', style: 'Sincère et Directe', image: '/caroline-voyante-astropure.png', hook: "Analyse urgente...", welcome: "Bonjour, je suis Caroline. Je vous écoute." },
  { id: 'nathalie', name: 'Nathalie', desc: 'Cartomancienne.', style: 'Bienveillante', image: '/nathalie-voyante-astropure.png', hook: "Le tarot parle...", welcome: "Bonjour, je suis Nathalie. Quel domaine vous préoccupe ?" },
  { id: 'pierre', name: 'Maître Pierre', desc: 'Astrologue expert.', style: 'Analytique', image: '/pierre-voyant-astropure.png', hook: "Configuration clé...", welcome: "Bonjour, ici Pierre. Que puis-je préciser pour vous ?" }
];

// --- COMPOSANTS ---
const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }) => {
  const baseStyle = "px-6 py-3 rounded-full font-medium transition-all duration-300 transform active:scale-95 shadow-sm flex items-center justify-center text-sm";
  const variants = { primary: "bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-300", secondary: "bg-white text-indigo-900 border border-indigo-100" };
  return <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>{children}</button>;
};

const LegalModal = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-6 border-b flex justify-between items-center"><h3 className="font-bold text-indigo-900">{type === 'mentions' ? 'Mentions Légales' : 'CGU & Confidentialité'}</h3><button onClick={onClose}><X size={20}/></button></div>
        <div className="p-8 max-h-[60vh] overflow-y-auto text-sm text-slate-600 space-y-4 text-left">
          {type === 'mentions' ? (
            <>
              <p>Éditeur : <strong>Altéo Consulting</strong>, SIRET 993 353 473 00016.</p>
              <p>Siège social : 2 RUE NOTRE-DAME DES VICTOIRES, 75002 PARIS.</p>
              <p>Contact SAV : {CONTACT_EMAIL}</p>
            </>
          ) : (
            <>
              <p>Prix : {PRICE_TEXT}. Pour résilier votre abonnement, utilisez le lien "Gérer mon abonnement" en bas de page ou contactez-nous à {CONTACT_EMAIL}.</p>
              <p>Droit de suppression de vos données sur simple demande par email.</p>
            </>
          )}
        </div>
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
  const [resetMode, setResetMode] = useState(false);
  const [message, setMessage] = useState(null);

  const handleAuth = async () => {
    setLoading(true); setMessage(null);
    try {
      if (resetMode) {
        await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/?recovery=true` });
        setMessage("Lien envoyé par e-mail !");
      } else if (isLoginMode) {
        await supabase.auth.signInWithPassword({ email, password });
        onAuthSuccess();
      } else {
        const { data } = await supabase.auth.signUp({ email, password });
        if (data?.user) await supabase.from('profiles').insert([{ id: data.user.id, is_premium: false }]);
        onAuthSuccess();
      }
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="flex items-center justify-center min-h-[70dvh] px-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md relative">
        <button onClick={onCancel} className="absolute top-4 right-4 text-slate-400"><X size={20}/></button>
        <h2 className="text-2xl font-bold text-center font-serif text-indigo-900">{resetMode ? 'Récupération' : (isLoginMode ? 'Connexion' : 'Inscription')}</h2>
        <div className="space-y-4 mt-6">
          {message && <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-xs">{message}</div>}
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border outline-none text-[16px]"/>
          {!resetMode && <input type="password" placeholder="Mot de passe" value={password} onChange={e=>setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border outline-none text-[16px]"/>}
          <Button onClick={handleAuth} disabled={loading} className="w-full">{loading ? <Loader2 className="animate-spin"/> : (resetMode ? "Envoyer le lien" : "Continuer")}</Button>
        </div>
        <div className="mt-6 text-center space-y-2">
          {isLoginMode && !resetMode && <button onClick={()=>setResetMode(true)} className="text-xs text-slate-400">Mot de passe oublié ?</button>}
          {resetMode && <button onClick={()=>setResetMode(false)} className="text-xs text-indigo-600">Retour connexion</button>}
          <button onClick={onSwitchToLogin} className="block w-full text-sm text-indigo-600 underline">{isLoginMode ? "Créer un compte" : 'Déjà inscrit ? Connexion'}</button>
        </div>
      </div>
    </div>
  );
};

// --- CHAT SYSTEM ---
const ChatView = ({ psychic, isPremium, onGoBack, onAction, session }) => {
  const [messages, setMessages] = useState([{ role: 'assistant', content: psychic.welcome }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [viewportHeight, setViewportHeight] = useState('100dvh');
  const scrollRef = useRef(null);

  useEffect(() => {
    const up = () => { if (window.visualViewport) { setViewportHeight(`${window.visualViewport.height}px`); setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 150); } };
    window.visualViewport?.addEventListener('resize', up); up();
    return () => window.visualViewport?.removeEventListener('resize', up);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading || limitReached) return;
    const userCount = messages.filter(m => m.role === 'user').length;
    if (!isPremium && userCount >= FREE_CHAT_LIMIT) { setLimitReached(true); return; }
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput(''); setLoading(true);
    try {
      const res = await fetch(N8N_CHAT_WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: input, voyanteId: psychic.id, userId: session?.user?.id || 'anonymous', isPremium }) });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.text || "Précisez votre pensée..." }]);
    } catch (e) { setMessages(prev => [...prev, { role: 'assistant', content: "Erreur de connexion." }]); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col md:max-w-2xl md:mx-auto overflow-hidden" style={{ height: viewportHeight }}>
      <div className="flex items-center gap-4 py-3 px-4 border-b bg-white flex-shrink-0">
        <button onClick={onGoBack} className="p-1.5 bg-slate-50 rounded-full"><ArrowLeft size={20}/></button>
        <img src={psychic.image} className="w-10 h-10 rounded-full object-cover" />
        <h3 className="font-bold text-sm">{psychic.name}</h3>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50/30">
        {messages.map((m, i) => (<div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] p-3.5 rounded-2xl text-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border text-slate-700 rounded-bl-none'}`}>{m.content}</div></div>))}
        {loading && <div className="flex justify-start"><Loader2 className="animate-spin text-indigo-400" size={18}/></div>}
        <div ref={scrollRef} className="h-2" />
        {limitReached && <div className="bg-indigo-600 text-white p-6 rounded-2xl text-center space-y-3"><Sparkles className="mx-auto" /><p className="text-[10px] font-bold uppercase">Limite atteinte</p><Button onClick={onAction} variant="secondary" className="w-full text-indigo-600 text-[10px]">Premium ({PRICE_TEXT})</Button></div>}
      </div>
      {!limitReached && (
        <div className="p-3 border-t bg-white flex gap-2 flex-shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyPress={e=>e.key==='Enter' && handleSend()} placeholder="Écrivez..." className="flex-1 bg-slate-50 rounded-xl px-4 py-3 text-[16px] outline-none" enterKeyHint="send" />
          <button onClick={handleSend} className="p-3 bg-indigo-600 text-white rounded-xl"><Send size={20}/></button>
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
  const [busyPsychicId, setBusyPsychicId] = useState('');
  const [horoscope, setHoroscope] = useState(null);
  const [showChatNotif, setShowChatNotif] = useState(false);

  useEffect(() => {
    const randomId = VOYANTES[Math.floor(Math.random() * VOYANTES.length)].id;
    setBusyPsychicId(randomId);
    const timer = setTimeout(() => setShowChatNotif(true), 5000);
    const q = new URLSearchParams(window.location.search);
    if (q.get('recovery') === 'true') setViewState('recovery');

    supabase.auth.onAuthStateChange((event, sess) => {
      setSession(sess);
      if (sess?.user) supabase.from('profiles').select('is_premium').eq('id', sess.user.id).single().then(({data}) => setIsPremium(!!data?.is_premium));
      else setIsPremium(false);
    });
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (selectedSign) supabase.from('weekly_horoscopes').select('*').eq('sign_id', selectedSign.name).order('week_start_date', { ascending: false }).limit(1).single().then(({data}) => setHoroscope(data));
  }, [selectedSign]);

  const handleManageSubscription = () => {
    alert(`Pour résilier ou gérer votre abonnement, veuillez envoyer un email à ${CONTACT_EMAIL} avec votre adresse : ${session.user.email}. Traitement sous 24h.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Helmet><title>AstroPure | Horoscope & Voyance</title><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/></Helmet>
      
      <nav className="bg-white border-b h-16 flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="font-serif font-bold text-xl text-indigo-900 cursor-pointer" onClick={() => { setViewState('list'); setSelectedSign(null); setSelectedPsychic(null); setHoroscope(null); }}>AstroPure</div>
        {!session ? <button onClick={() => { setIsLoginMode(true); setViewState('auth'); }} className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full uppercase">Compte</button> : (
          <button onClick={() => supabase.auth.signOut()} className="p-2 text-slate-400"><LogOut size={18}/></button>
        )}
      </nav>
      
      <main className="flex-1 overflow-y-auto">
        {viewState === 'recovery' ? (
          <div className="max-w-md mx-auto p-8 bg-white mt-10 rounded-3xl shadow-xl">
            <h2 className="text-xl font-bold mb-4">Nouveau mot de passe</h2>
            <input type="password" id="new-pw" className="w-full p-3 border rounded-xl mb-4" placeholder="Mot de passe"/>
            <Button className="w-full" onClick={async () => { const p = document.getElementById('new-pw').value; await supabase.auth.updateUser({ password: p }); setViewState('list'); }}>Enregistrer</Button>
          </div>
        ) : viewState === 'auth' ? <AuthView isLoginMode={isLoginMode} onAuthSuccess={() => setViewState('list')} onSwitchToLogin={() => setIsLoginMode(!isLoginMode)} onCancel={() => setViewState('list')} /> : (
          activeTab === 'horoscope' ? (
            selectedSign ? (
              <div className="max-w-2xl mx-auto p-4">
                <button onClick={() => { setSelectedSign(null); setHoroscope(null); }} className="mb-4 flex items-center text-slate-400"><ArrowLeft size={18} className="mr-2"/>Retour</button>
                <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-6">
                  <h2 className="text-2xl font-serif font-bold">{selectedSign.icon} {selectedSign.name}</h2>
                  <p className="text-slate-700 italic text-lg">"{horoscope?.intro || "Les astres vous préparent un message..."}"</p>
                  <div><h3 className="font-bold text-rose-600 border-b text-[10px] uppercase">Vie Sentimentale</h3><p className="text-sm mt-2 text-slate-600">{horoscope?.love || "Analyse en cours..."}</p></div>
                  <div><h3 className="font-bold text-emerald-700 border-b text-[10px] uppercase">Vie Professionnelle</h3><p className="text-sm mt-2 text-slate-600">{horoscope?.work || "Analyse en cours..."}</p></div>
                  {!isPremium && <div className="p-6 bg-slate-50 rounded-2xl text-center"><Lock className="mx-auto mb-2 text-slate-300"/><p className="text-xs mb-4">Débloquez <strong>Famille</strong> et <strong>Chance</strong></p><Button onClick={() => window.location.href = STRIPE_LINK} className="w-full text-[10px] uppercase font-bold">Débloquer ({PRICE_TEXT})</Button></div>}
                  {isPremium && (
                    <>
                      <div className="animate-in fade-in"><h3 className="font-bold text-indigo-600 border-b text-[10px] uppercase">Vie de Famille</h3><p className="text-sm mt-2 text-slate-600">{horoscope?.family || "Chargement..."}</p></div>
                      <div className="animate-in fade-in"><h3 className="font-bold text-amber-600 border-b text-[10px] uppercase">Signaux de Chance</h3><p className="text-sm mt-2 text-slate-600">{horoscope?.luck || "Chargement..."}</p></div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="max-w-5xl mx-auto px-4 py-8 text-center grid grid-cols-2 md:grid-cols-4 gap-4">
                {ZODIAC_SIGNS.map(s => <div key={s.id} onClick={() => setSelectedSign(s)} className="bg-white p-6 rounded-2xl shadow-sm border cursor-pointer hover:border-indigo-300 transition-all"><div className="text-4xl mb-2">{s.icon}</div><div className="font-bold">{s.name}</div></div>)}
              </div>
            )
          ) : (
            selectedPsychic ? <ChatView psychic={selectedPsychic} isPremium={isPremium} onGoBack={() => setSelectedPsychic(null)} onAction={() => window.location.href = STRIPE_LINK} session={session} /> : (
              <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                {VOYANTES.map(p => {
                  const isBusy = p.id === busyPsychicId;
                  return (
                    <div key={p.id} onClick={() => !isBusy && setSelectedPsychic(p)} className={`bg-white rounded-3xl p-6 text-center border shadow-sm ${isBusy ? 'opacity-80' : 'cursor-pointer'}`}>
                      <img src={p.image} className={`w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-white ${isBusy ? 'grayscale' : ''}`} />
                      <h3 className="font-bold text-lg">{p.name}</h3>
                      <button className={`w-full mt-4 py-2.5 rounded-full text-[10px] font-bold uppercase ${isBusy ? 'bg-slate-50 text-slate-300' : 'bg-indigo-600 text-white'}`}>{isBusy ? 'Occupée' : 'Consulter'}</button>
                    </div>
                  );
                })}
              </div>
            )
          )
        )}
      </main>

      {viewState === 'list' && !selectedPsychic && (
        <footer className="bg-white border-t p-8 text-center text-[10px] text-slate-400 pb-32 flex-shrink-0">
          <div className="max-w-4xl mx-auto space-y-4">
            <p className="font-bold uppercase">Altéo Consulting</p>
            <div className="flex justify-center flex-wrap gap-4 underline">
              <button onClick={() => setModalType('mentions')}>Mentions Légales</button>
              <button onClick={() => setModalType('cgu')}>CGU & Confidentialité</button>
              {isPremium && (
                <button onClick={handleManageSubscription} className="text-indigo-600 font-bold">Gérer mon abonnement</button>
              )}
            </div>
            <p className="flex justify-center items-center gap-1 font-bold text-indigo-500 uppercase"><ShieldCheck size={14}/> Sécurisé par Stripe</p>
          </div>
        </footer>
      )}

      {viewState === 'list' && !selectedPsychic && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t h-16 flex items-center justify-around z-50">
          <button onClick={() => { setActiveTab('horoscope'); setSelectedSign(null); }} className={`flex flex-col items-center gap-1 ${activeTab === 'horoscope' ? 'text-indigo-600' : 'text-slate-400'}`}><Moon size={22}/><span className="text-[9px] font-bold uppercase">Horoscope</span></button>
          <button onClick={() => { setActiveTab('voyance'); setSelectedPsychic(null); }} className={`flex flex-col items-center gap-1 ${activeTab === 'voyance' ? 'text-indigo-600' : 'text-slate-400'}`}><MessageCircle size={22}/><span className="text-[9px] font-bold uppercase">Voyance</span></button>
        </div>
      )}

      {showChatNotif && activeTab === 'horoscope' && !selectedSign && viewState === 'list' && (
        <div className="fixed bottom-24 right-4 z-[45] flex items-end gap-2 animate-in slide-in-from-right-5 duration-700">
          <div className="relative bg-white shadow-2xl border border-slate-100 rounded-2xl p-3 max-w-[190px] mb-8">
            <p className="text-[10px] font-bold text-indigo-600 uppercase">{VOYANTES[0].name}</p>
            <p className="text-[11px] text-slate-700 italic">"{VOYANTES[0].hook}"</p>
          </div>
          <button onClick={() => { setActiveTab('voyance'); setSelectedPsychic(VOYANTES[0]); setShowChatNotif(false); }} className="relative w-14 h-14 bg-white rounded-full shadow-2xl border-2 border-indigo-600 overflow-hidden">
            <img src={VOYANTES[0].image} className="w-full h-full object-cover" />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">1</div>
          </button>
        </div>
      )}

      <LegalModal isOpen={!!modalType} onClose={() => setModalType(null)} type={modalType} />
    </div>
  );
}