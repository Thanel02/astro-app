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
    desc: 'Médium de naissance. Travaille sans support pour une consultation directe.', 
    style: 'Sincère et Directe', image: '/caroline-voyante-astropure.png', 
    hook: "Bonjour, j'ai une analyse importante pour vous...", 
    welcome: "Bonjour, je suis Caroline. Je suis à votre écoute pour répondre à vos questions. Par quoi souhaitez-vous commencer ?"
  },
  { 
    id: 'nathalie', name: 'Nathalie', 
    desc: 'Cartomancienne. Spécialiste du Grand Tarot de Marseille.', 
    style: 'Bienveillante et Précise', image: '/nathalie-voyante-astropure.png', 
    hook: "Votre tirage actuel indique un changement...", 
    welcome: "Bonjour, je suis Nathalie. Mes cartes sont prêtes pour votre tirage. Quel domaine vous préoccupe aujourd'hui ?"
  },
  { 
    id: 'pierre', name: 'Maître Pierre', 
    desc: 'Astrologue et Numérologue certifié. Plus de 30 ans d\'expertise.', 
    style: 'Analytique et Expert', image: '/pierre-voyant-astropure.png', 
    hook: "Votre ciel astral présente une configuration clé...", 
    welcome: "Bonjour, ici Pierre. Je viens de consulter vos transits actuels. Que puis-je préciser pour vous ?"
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

const LegalModal = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;
  const content = {
    mentions: {
      title: "Mentions Légales",
      text: (
        <div className="space-y-4 text-sm text-slate-600 text-left">
          <p>Le site AstroPure est édité par la société <strong>Altéo Consulting</strong>, SIRET <strong>993 353 473 00016</strong>.</p>
          <p>Siège social : 2 RUE NOTRE-DAME DES VICTOIRES, 75002 PARIS.</p>
          <p>Hébergeur : Vercel Inc., 340 S Lemon Ave #1135, Walnut, CA 91789, USA.</p>
          <p className="font-bold text-indigo-600">Contact SAV : {CONTACT_EMAIL}</p>
        </div>
      )
    },
    cgu: {
      title: "CGU & Confidentialité",
      text: (
        <div className="space-y-4 text-sm text-slate-600 text-left">
          <p><strong>Confidentialité :</strong> Collecte de l'e-mail pour le compte et historique chat. Paiements via Stripe. Droit de suppression sur {CONTACT_EMAIL}.</p>
          <p><strong>CGU :</strong> Prix : {PRICE_TEXT}. Divertissement uniquement. Pas de remboursement après déblocage.</p>
        </div>
      )
    }
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-6 border-b flex justify-between items-center"><h3 className="font-bold text-indigo-900">{content[type].title}</h3><button onClick={onClose}><X size={20}/></button></div>
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
        <div className="space-y-4 mt-6">
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border outline-none focus:border-indigo-500 text-[16px]"/>
          <input type="password" placeholder="Mot de passe" value={password} onChange={e=>setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border outline-none focus:border-indigo-500 text-[16px]"/>
          <Button onClick={handleAuth} disabled={loading} className="w-full">{loading ? <Loader2 className="animate-spin"/> : "Continuer"}</Button>
        </div>
        <button onClick={onSwitchToLogin} className="w-full mt-6 text-sm text-indigo-600 underline">{isLoginMode ? "Créer un compte" : 'Déjà inscrit ? Connexion'}</button>
      </div>
    </div>
  );
};

// --- CHAT SYSTEM (STABILISÉ ET ANTI-ZOOM) ---
const ChatView = ({ psychic, isPremium, onGoBack, onAction, session }) => {
  const [messages, setMessages] = useState([{ role: 'assistant', content: psychic.welcome }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [viewportHeight, setViewportHeight] = useState('100dvh');
  const scrollRef = useRef(null);

  useEffect(() => {
    const updateHeight = () => {
      if (window.visualViewport) {
        setViewportHeight(`${window.visualViewport.height}px`);
        setTimeout(() => {
          scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 150);
      }
    };
    window.visualViewport?.addEventListener('resize', updateHeight);
    window.visualViewport?.addEventListener('scroll', updateHeight);
    updateHeight();
    return () => {
      window.visualViewport?.removeEventListener('resize', updateHeight);
      window.visualViewport?.removeEventListener('scroll', updateHeight);
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading || limitReached) return;
    const userMsg = input;
    const userCount = messages.filter(m => m.role === 'user').length;
    if (!isPremium && userCount >= FREE_CHAT_LIMIT) { setLimitReached(true); return; }

    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(N8N_CHAT_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, voyanteId: psychic.id, userId: session?.user?.id || 'anonymous', isPremium })
      });
      const data = await response.json();
      if (data.error === 'LIMIT_REACHED') { setLimitReached(true); }
      else { setMessages(prev => [...prev, { role: 'assistant', content: data.text || "Pouvez-vous préciser ?" }]); }
    } catch (e) { setMessages(prev => [...prev, { role: 'assistant', content: "Problème de connexion." }]); }
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
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border text-slate-700 rounded-bl-none'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && <div className="flex justify-start"><Loader2 className="animate-spin text-indigo-400" size={18}/></div>}
        <div ref={scrollRef} className="h-2" />
        {limitReached && (
          <div className="bg-indigo-600 text-white p-6 rounded-2xl text-center space-y-3">
            <Sparkles className="mx-auto" />
            <p className="text-xs font-bold uppercase">Limite atteinte</p>
            <Button onClick={onAction} variant="secondary" className="w-full text-indigo-600 font-bold uppercase text-[10px]">Premium ({PRICE_TEXT})</Button>
          </div>
        )}
      </div>
      {!limitReached && (
        <div className="p-3 border-t bg-white flex gap-2 flex-shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <input 
            value={input} 
            onChange={e=>setInput(e.target.value)} 
            onKeyPress={e=>e.key==='Enter' && handleSend()} 
            onFocus={() => setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 300)} 
            placeholder="Écrivez..." 
            className="flex-1 bg-slate-50 rounded-xl px-4 py-3 text-[16px] outline-none" // Taille 16px pour éviter le zoom iOS
            enterKeyHint="send" 
          />
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

  useEffect(() => {
    // Sélection aléatoire de la voyante occupée
    const randomId = VOYANTES[Math.floor(Math.random() * VOYANTES.length)].id;
    setBusyPsychicId(randomId);

    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sess) => {
      setSession(sess);
      if (sess?.user) {
        supabase.from('profiles').select('is_premium').eq('id', sess.user.id).single().then(({data}) => {
          if (data?.is_premium) setIsPremium(true);
        });
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Helmet>
        <title>AstroPure | Horoscope & Voyance</title>
        {/* Balise pour empêcher le zoom utilisateur lors du focus input */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/> 
      </Helmet>
      
      <nav className="bg-white border-b h-16 flex items-center justify-between px-4 sticky top-0 z-50">
          <div className="font-serif font-bold text-xl text-indigo-900 cursor-pointer" onClick={() => { setViewState('list'); setSelectedSign(null); setSelectedPsychic(null); }}>AstroPure</div>
          {!session ? <button onClick={() => { setIsLoginMode(true); setViewState('auth'); }} className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full uppercase">Compte</button> : <button onClick={() => supabase.auth.signOut()} className="p-2 text-slate-400"><LogOut size={18}/></button>}
      </nav>
      
      <main className="flex-1 overflow-y-auto">
        {viewState === 'auth' ? <AuthView isLoginMode={isLoginMode} onAuthSuccess={() => setViewState('list')} onSwitchToLogin={() => setIsLoginMode(!isLoginMode)} onCancel={() => setViewState('list')} /> : (
          activeTab === 'horoscope' ? (
            selectedSign ? (
              <div className="max-w-2xl mx-auto p-4">
                <button onClick={() => setSelectedSign(null)} className="mb-4 flex items-center text-slate-400"><ArrowLeft size={18} className="mr-2"/>Retour</button>
                <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-6">
                  <h2 className="text-2xl font-serif font-bold">{selectedSign.icon} {selectedSign.name}</h2>
                  <div><h3 className="font-bold text-rose-600 border-b text-[10px] uppercase">Vie Sentimentale</h3><p className="text-sm mt-2 text-slate-600">Lecture des astres en cours...</p></div>
                  <div><h3 className="font-bold text-emerald-700 border-b text-[10px] uppercase">Vie Professionnelle</h3><p className="text-sm mt-2 text-slate-600">Lecture des astres en cours...</p></div>
                  {!isPremium && <div className="p-6 bg-slate-50 rounded-2xl text-center"><Lock className="mx-auto mb-2 text-slate-300"/><p className="text-xs mb-4">Débloquez vos sections <strong>Famille</strong> et <strong>Chance</strong></p><Button onClick={() => window.location.href = STRIPE_LINK} className="w-full text-[10px] uppercase font-bold">Débloquer ({PRICE_TEXT})</Button></div>}
                </div>
              </div>
            ) : (
              <div className="max-w-5xl mx-auto px-4 py-8 text-center animate-in fade-in duration-500">
                <h1 className="text-3xl font-serif text-slate-900 font-bold mb-10">Horoscope Hebdomadaire</h1>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-12">
                  {ZODIAC_SIGNS.map(s => <div key={s.id} onClick={() => setSelectedSign(s)} className="bg-white p-6 rounded-2xl shadow-sm text-center border cursor-pointer hover:border-indigo-300 transition-all"><div className="text-4xl mb-2">{s.icon}</div><div className="font-bold">{s.name}</div></div>)}
                </div>
              </div>
            )
          ) : (
            selectedPsychic ? <ChatView psychic={selectedPsychic} isPremium={isPremium} onGoBack={() => setSelectedPsychic(null)} onAction={() => window.location.href = STRIPE_LINK} session={session} /> : (
              <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="text-center mb-10"><h1 className="text-3xl font-serif font-bold">Voyance en Direct</h1></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12">
                  {VOYANTES.map(p => {
                    const isBusy = p.id === busyPsychicId; // Voyante occupée dynamique
                    return (
                      <div key={p.id} onClick={() => !isBusy && setSelectedPsychic(p)} className={`bg-white rounded-3xl p-6 text-center border shadow-sm ${isBusy ? 'opacity-80' : 'cursor-pointer hover:border-indigo-300'}`}>
                        <img src={p.image} className={`w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-white ${isBusy ? 'grayscale' : ''}`} />
                        <h3 className="font-bold text-lg">{p.name}</h3>
                        <p className="text-xs text-slate-400 italic mb-4">{p.style}</p>
                        <button className={`w-full mt-4 py-2.5 rounded-full text-[10px] font-bold uppercase ${isBusy ? 'bg-slate-50 text-slate-300' : 'bg-indigo-600 text-white'}`}>{isBusy ? 'Occupée' : 'Consulter'}</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )
        )}
      </main>

      {!selectedPsychic && (
        <footer className="bg-white border-t p-8 text-center text-[10px] text-slate-400 pb-32 flex-shrink-0">
          <div className="max-w-4xl mx-auto space-y-4">
            <p className="font-bold uppercase">Altéo Consulting</p>
            <div className="flex justify-center gap-4 underline">
              <button onClick={() => setModalType('mentions')}>Mentions Légales</button>
              <button onClick={() => setModalType('cgu')}>CGU & Confidentialité</button>
            </div>
            <p className="flex justify-center items-center gap-1 font-bold text-indigo-500 uppercase"><ShieldCheck size={14}/> Sécurisé par Stripe</p>
          </div>
        </footer>
      )}

      {!selectedPsychic && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t h-16 flex items-center justify-around z-50">
          <button onClick={() => { setActiveTab('horoscope'); setViewState('list'); setSelectedSign(null); }} className={`flex flex-col items-center gap-1 ${activeTab === 'horoscope' ? 'text-indigo-600' : 'text-slate-400'}`}><Moon size={22}/><span className="text-[9px] font-bold">HOROSCOPE</span></button>
          <button onClick={() => { setActiveTab('voyance'); setViewState('list'); setSelectedPsychic(null); }} className={`flex flex-col items-center gap-1 ${activeTab === 'voyance' ? 'text-indigo-600' : 'text-slate-400'}`}><MessageCircle size={22}/><span className="text-[9px] font-bold">VOYANCE</span></button>
        </div>
      )}

      <LegalModal isOpen={!!modalType} onClose={() => setModalType(null)} type={modalType} />
    </div>
  );
}