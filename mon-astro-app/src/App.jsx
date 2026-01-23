import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Star, Moon, Sun, Lock, ChevronRight, User, Check, Sparkles, 
  ArrowLeft, Menu, X, LogOut, Loader2, MessageCircle, Send,
  Bot, AlertTriangle, AlertCircle, LayoutGrid
} from 'lucide-react';

// --- CONFIGURATION ---
const STRIPE_LINK = "https://buy.stripe.com/test_28EaEW7n8gVEaXTa9o4AU00"; 
// REMPLACE CECI PAR TON NOUVEAU WEBHOOK N8N SPÉCIAL CHAT
const N8N_CHAT_WEBHOOK = "https://landingfactory.app.n8n.cloud/webhook-test/chat-voyance"; 

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// --- CONSTANTES ---
const ZODIAC_SIGNS = [
  { id: 'belier', name: 'Bélier', dates: '21 Mars - 19 Avril', element: 'Feu', icon: '♈' },
  { id: 'taureau', name: 'Taureau', dates: '20 Avril - 20 Mai', element: 'Terre', icon: '♉' },
  { id: 'gemeaux', name: 'Gémeaux', dates: '21 Mai - 20 Juin', element: 'Air', icon: '♊' },
  { id: 'cancer', name: 'Cancer', dates: '21 Juin - 22 Juillet', element: 'Eau', icon: '♋' },
  { id: 'lion', name: 'Lion', dates: '23 Juillet - 22 Août', element: 'Feu', icon: '♌' },
  { id: 'vierge', name: 'Vierge', dates: '23 Août - 22 Septembre', element: 'Terre', icon: '♍' },
  { id: 'balance', name: 'Balance', dates: '23 Septembre - 22 Octobre', element: 'Air', icon: '♎' },
  { id: 'scorpion', name: 'Scorpion', dates: '23 Octobre - 21 Novembre', element: 'Eau', icon: '♏' },
  { id: 'sagittaire', name: 'Sagittaire', dates: '22 Novembre - 21 Décembre', element: 'Feu', icon: '♐' },
  { id: 'capricorne', name: 'Capricorne', dates: '22 Décembre - 19 Janvier', element: 'Terre', icon: '♑' },
  { id: 'verseau', name: 'Verseau', dates: '20 Janvier - 18 Février', element: 'Air', icon: '♒' },
  { id: 'poissons', name: 'Poissons', dates: '19 Février - 20 Mars', element: 'Eau', icon: '♓' },
];

const VOYANTES = [
  { 
    id: 'alma', 
    name: 'Mère Alma', 
    desc: 'La sagesse ancestrale. Elle lit dans les racines de votre passé.', 
    style: 'Bienveillante, maternelle, utilise des métaphores naturelles.',
    image: '🌿' 
  },
  { 
    id: 'luna', 
    name: 'Luna Star', 
    desc: 'Astrologue moderne. Directe, précise et connectée aux cycles lunaires.', 
    style: 'Dynamique, précise, parle d\'alignement et d\'énergie.',
    image: '🔮' 
  },
  { 
    id: 'cosmos', 
    name: 'Oracle X', 
    desc: 'Une conscience quantique qui analyse les probabilités de votre futur.', 
    style: 'Mystérieux, un peu robotique mais profond, parle de destin.',
    image: '🌌' 
  }
];

// --- COMPOSANTS UI ---

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }) => {
  const baseStyle = "px-6 py-3 rounded-full font-medium transition-all duration-300 transform active:scale-95 shadow-sm flex items-center justify-center";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400",
    secondary: "bg-white text-indigo-900 border border-indigo-100 hover:border-indigo-300",
    outline: "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50",
    ghost: "text-slate-500 hover:text-indigo-600 hover:bg-slate-50"
  };

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Card = ({ children, className = '', onClick }) => (
  <div onClick={onClick} className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 ${className}`} >
    {children}
  </div>
);

// --- VUES HOROSCOPE (EXISTANTES) ---

const HomeView = ({ onSelectSign }) => (
  <div className="max-w-5xl mx-auto px-4 py-8 pb-24">
    <div className="text-center mb-10 space-y-2">
      <h1 className="text-3xl md:text-4xl font-serif text-slate-900">Horoscope Hebdo</h1>
      <p className="text-slate-500">Sélectionnez votre signe</p>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {ZODIAC_SIGNS.map((sign) => (
        <Card key={sign.id} onClick={() => onSelectSign(sign)} className="cursor-pointer group hover:border-indigo-200 flex flex-col items-center justify-center text-center py-6">
          <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{sign.icon}</div>
          <h3 className="font-medium text-slate-800">{sign.name}</h3>
        </Card>
      ))}
    </div>
  </div>
);

const ReadingView = ({ sign, session, isPremium, onGoBack, onAuthReq, onSubscribeReq }) => {
  const [horoscope, setHoroscope] = useState(null);
  const [loading, setLoading] = useState(true);
  const [debugError, setDebugError] = useState(null);

  useEffect(() => {
    const fetchHoroscope = async () => {
      setLoading(true);
      setDebugError(null);
      try {
        if (!supabase) throw new Error("Erreur config Supabase");
        const { data, error } = await supabase
          .from('weekly_horoscopes')
          .select('*')
          .eq('sign_id', sign.name) 
          .order('week_start_date', { ascending: false }) 
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') throw error; 
        setHoroscope(data);
      } catch (err) {
        setDebugError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHoroscope();
  }, [sign.name]);

  if (loading) return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={30} /></div>;
  
  if (!horoscope) return (
    <div className="p-8 text-center">
      <p className="text-slate-500 mb-4">Pas d'horoscope disponible.</p>
      <Button onClick={onGoBack} variant="secondary">Retour</Button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      <button onClick={onGoBack} className="flex items-center text-slate-400 hover:text-indigo-600 mb-6">
        <ArrowLeft size={18} className="mr-2" /> Retour
      </button>

      <div className="text-center mb-8">
        <div className="text-5xl mb-2">{sign.icon}</div>
        <h2 className="text-3xl font-serif text-slate-900">{sign.name}</h2>
        <p className="text-indigo-600 text-sm font-medium">Semaine du {new Date(horoscope.week_start_date).toLocaleDateString()}</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6">
          <p className="text-slate-700 leading-relaxed mb-6">{horoscope.intro}</p>
          <div className="space-y-6">
             <div><h3 className="font-bold text-rose-500 mb-1">♥ Amour</h3><p className="text-slate-600 text-sm">{horoscope.love}</p></div>
             <div><h3 className="font-bold text-emerald-600 mb-1">$ Travail</h3><p className="text-slate-600 text-sm">{horoscope.work}</p></div>
          </div>
        </div>

        {/* PREMIUM SECTION */}
        <div className="relative p-6 bg-slate-50 border-t border-slate-100">
           <div className={!isPremium ? "blur-sm opacity-50 select-none" : ""}>
              <h3 className="font-bold text-indigo-900 mb-3 flex items-center gap-2"><Lock size={14} className={isPremium ? "hidden" : "inline"}/> Secrets Astraux</h3>
              <div className="space-y-2 text-sm text-indigo-800">
                 <p><strong>Couleur :</strong> {horoscope.premium_data?.color}</p>
                 <p><strong>Numéros :</strong> {Array.isArray(horoscope.premium_data?.lucky_numbers) ? horoscope.premium_data?.lucky_numbers.join(', ') : "..."}</p>
              </div>
           </div>
           
           {!isPremium && (
             <div className="absolute inset-0 flex items-center justify-center p-4">
               <div className="bg-white/90 backdrop-blur rounded-xl p-5 shadow-lg text-center w-full max-w-xs">
                 <Lock className="mx-auto text-indigo-500 mb-2" size={20}/>
                 <p className="text-xs text-slate-500 mb-3">Débloquez vos numéros chance et la compatibilité.</p>
                 <Button onClick={session ? onSubscribeReq : onAuthReq} className="w-full text-xs py-2 h-auto">Débloquer Premium</Button>
               </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

// --- NOUVELLES VUES VOYANCE ---

const PsychicSelectionView = ({ onSelectPsychic }) => (
  <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
    <div className="text-center mb-10 space-y-2">
      <h1 className="text-3xl md:text-4xl font-serif text-slate-900">Le Salon des Voyantes</h1>
      <p className="text-slate-500">Choisissez votre guide spirituel</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {VOYANTES.map((p) => (
        <Card key={p.id} onClick={() => onSelectPsychic(p)} className="cursor-pointer hover:border-indigo-300 text-center relative overflow-hidden group">
          <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-500">{p.image}</div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">{p.name}</h3>
          <p className="text-sm text-slate-500 mb-4">{p.desc}</p>
          <div className="text-xs font-medium text-indigo-600 bg-indigo-50 py-1 px-3 rounded-full inline-block">
             {p.style}
          </div>
        </Card>
      ))}
    </div>
  </div>
);

const ChatView = ({ psychic, session, isPremium, onGoBack, onSubscribeReq, onAuthReq }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Bonjour, je suis ${psychic.name}. ${psychic.desc} Que souhaitez-vous savoir aujourd'hui ?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  // Compteur local pour l'UX immédiate (le vrai check se fait coté n8n/serveur)
  const [msgCount, setMsgCount] = useState(0); 
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Check limite locale
    if (!isPremium && msgCount >= 3) {
      // On ne bloque pas ici pour laisser l'UI afficher le paywall proprement via le state
      // Mais on peut afficher une alerte si on veut
    }

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      // Envoi au Webhook n8n
      const response = await fetch(N8N_CHAT_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          userId: session?.user?.id || 'anonymous',
          voyanteId: psychic.id,
          isPremium: isPremium
        })
      });

      const data = await response.json();

      if (data.error === "LIMIT_REACHED") {
        setMsgCount(3); // Force l'affichage du paywall
        setMessages(prev => [...prev, { role: 'system', content: "LIMIT_REACHED" }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response || data.output || "Les astres sont silencieux..." }]);
        if (!isPremium) setMsgCount(prev => prev + 1);
      }

    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'assistant', content: "Une perturbation cosmique empêche la connexion. Réessayez." }]);
    } finally {
      setLoading(false);
    }
  };

  const showPaywall = !isPremium && msgCount >= 3;

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-140px)] flex flex-col pt-4 px-2">
      {/* Header Chat */}
      <div className="flex items-center gap-4 border-b border-slate-100 pb-4 mb-4">
        <button onClick={onGoBack} className="p-2 hover:bg-slate-100 rounded-full"><ArrowLeft size={20}/></button>
        <div className="flex items-center gap-3">
          <div className="text-3xl bg-slate-50 p-2 rounded-full">{psychic.image}</div>
          <div>
            <h3 className="font-bold text-slate-800">{psychic.name}</h3>
            <div className="flex items-center gap-1 text-xs text-green-600"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> En ligne</div>
          </div>
        </div>
        <div className="ml-auto">
          {!isPremium && <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">{3 - msgCount} questions gratuites</span>}
        </div>
      </div>

      {/* Zone Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 px-2 pb-4">
        {messages.map((m, i) => {
          if (m.role === 'system' && m.content === "LIMIT_REACHED") return null; // Géré par le paywall overlay
          return (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                m.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-none' 
                  : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
              }`}>
                {m.content}
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-slate-50 p-3 rounded-2xl rounded-bl-none flex gap-1">
               <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
               <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
               <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area ou Paywall */}
      <div className="p-4 bg-white border-t border-slate-100">
        {showPaywall ? (
          <div className="text-center p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
            <Lock className="mx-auto text-indigo-600 mb-2" />
            <h3 className="font-bold text-indigo-900 mb-1">Limite atteinte</h3>
            <p className="text-sm text-indigo-700 mb-3">Pour continuer à discuter avec {psychic.name} en illimité, passez Premium.</p>
            {session ? (
               <Button onClick={onSubscribeReq} className="w-full py-2 text-sm">Débloquer (2.99€)</Button>
            ) : (
               <Button onClick={onAuthReq} className="w-full py-2 text-sm">Me connecter</Button>
            )}
          </div>
        ) : (
          <div className="flex gap-2">
            <input 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Posez votre question..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-5 py-3 outline-none focus:border-indigo-500 focus:bg-white transition-all"
            />
            <button 
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:scale-100 transform hover:scale-105 transition-all shadow-md"
            >
              <Send size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- AUTH VIEW (EXISTANT - LÉGÈREMENT MODIFIÉ POUR LE RETOUR) ---

const AuthView = ({ onAuthSuccess, onSwitchToLogin, isLoginMode, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAuth = async () => {
    setLoading(true); setError(null);
    try {
      if (!supabase) throw new Error("Erreur config Supabase");
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
        <h2 className="text-2xl font-bold text-center mb-6">{isLoginMode ? 'Connexion' : 'Inscription'}</h2>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded text-sm mb-4">{error}</div>}
        <div className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"/>
          <input type="password" placeholder="Mot de passe" value={password} onChange={e=>setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"/>
          <Button onClick={handleAuth} disabled={loading} className="w-full mt-4">{loading ? <Loader2 className="animate-spin"/> : (isLoginMode ? 'Valider' : "S'inscrire")}</Button>
        </div>
        <div className="mt-6 text-center text-sm"><button onClick={onSwitchToLogin} className="text-indigo-600 font-medium">{isLoginMode ? "Créer un compte" : 'Se connecter'}</button></div>
      </div>
    </div>
  );
};

// --- APP PRINCIPALE ---

export default function App() {
  const [activeTab, setActiveTab] = useState('horoscope'); // 'horoscope' | 'voyance'
  const [viewState, setViewState] = useState('list'); // 'list' | 'detail' | 'auth'
  
  const [selectedSign, setSelectedSign] = useState(null);
  const [selectedPsychic, setSelectedPsychic] = useState(null);
  
  const [session, setSession] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Gestion Session & Premium (Identique à avant)
  useEffect(() => {
    if (!supabase) return;
    const checkPremium = async (userId) => {
      const { data } = await supabase.from('profiles').select('is_premium').eq('id', userId).single();
      if (data?.is_premium) { setIsPremium(true); localStorage.setItem('astro_premium', 'true'); }
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, sess) => {
      setSession(sess);
      if (sess?.user) checkPremium(sess.user.id);
      else { setIsPremium(false); localStorage.removeItem('astro_premium'); }
    });
    const interval = setInterval(() => { if (session?.user && !isPremium) checkPremium(session.user.id); }, 4000);
    return () => { subscription.unsubscribe(); clearInterval(interval); };
  }, [session, isPremium]);

  const handleLogout = async () => { if (supabase) await supabase.auth.signOut(); setIsMenuOpen(false); };
  const handleSubscribe = () => window.location.href = session ? `${STRIPE_LINK}?client_reference_id=${session.user.id}` : STRIPE_LINK;

  // Navigation Logic
  const goToAuth = () => setViewState('auth');
  const goHome = () => { setViewState('list'); setSelectedSign(null); setSelectedPsychic(null); };

  const renderContent = () => {
    if (viewState === 'auth') {
      return <AuthView 
        isLoginMode={true} 
        onAuthSuccess={goHome} 
        onSwitchToLogin={() => {}} 
        onCancel={goHome}
      />;
    }

    if (activeTab === 'horoscope') {
      if (selectedSign) return <ReadingView sign={selectedSign} session={session} isPremium={isPremium} onGoBack={() => setSelectedSign(null)} onAuthReq={goToAuth} onSubscribeReq={handleSubscribe} />;
      return <HomeView onSelectSign={setSelectedSign} />;
    }

    if (activeTab === 'voyance') {
      if (selectedPsychic) return <ChatView psychic={selectedPsychic} session={session} isPremium={isPremium} onGoBack={() => setSelectedPsychic(null)} onAuthReq={goToAuth} onSubscribeReq={handleSubscribe} />;
      return <PsychicSelectionView onSelectPsychic={setSelectedPsychic} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      {/* Header Mobile simplifié */}
      <nav className="bg-white/80 backdrop-blur border-b border-slate-100 sticky top-0 z-50 h-16 flex items-center justify-between px-4">
         <div className="font-serif font-bold text-xl tracking-tight text-indigo-900">Astro<span className="text-indigo-600">Weekly</span></div>
         <div className="flex items-center gap-3">
            {isPremium && <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full border border-amber-200">PREMIUM</span>}
            {!session && <button onClick={goToAuth} className="text-sm font-medium text-indigo-600">Connexion</button>}
            {session && <button onClick={handleLogout}><LogOut size={18} className="text-slate-400"/></button>}
         </div>
      </nav>

      <main className="pt-4">
        {renderContent()}
      </main>

      {/* Tab Bar Navigation (Style Mobile App) */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 h-16 flex items-center justify-around z-50 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => { setActiveTab('horoscope'); setViewState('list'); }} 
          className={`flex flex-col items-center gap-1 ${activeTab === 'horoscope' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <Moon size={24} fill={activeTab === 'horoscope' ? "currentColor" : "none"} />
          <span className="text-[10px] font-medium">Horoscope</span>
        </button>
        
        <div className="w-px h-8 bg-slate-100"></div>

        <button 
          onClick={() => { setActiveTab('voyance'); setViewState('list'); }} 
          className={`flex flex-col items-center gap-1 ${activeTab === 'voyance' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <Sparkles size={24} fill={activeTab === 'voyance' ? "currentColor" : "none"} />
          <span className="text-[10px] font-medium">Voyance AI</span>
        </button>
      </div>
    </div>
  );
}