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
          <p><strong>CONTACT :</strong> Pour toute question, contactez Altéo Consulting à l'adresse du siège social.</p>
        </div>
      )
    },
    cgu: {
      title: "CGU & Confidentialité",
      text: (
        <div className="space-y-4 text-sm text-slate-600">
          <h4 className="font-bold text-slate-900">1. Objet du service</h4>
          <p>AstroPure propose des services de divertissement liés aux arts divinatoires. Les réponses de l'IA ne remplacent pas un conseil médical ou juridique.</p>
          <h4 className="font-bold text-slate-900">2. Protection des données (RGPD)</h4>
          <p>Nous collectons votre email pour la gestion de votre compte. Vos paiements sont sécurisés et traités par Stripe. Vous disposez d'un droit d'accès et de suppression de vos données.</p>
          <h4 className="font-bold text-slate-900">3. Paiement</h4>
          <p>L'accès Premium est un service numérique à exécution immédiate. Aucun remboursement ne sera effectué après consommation du service.</p>
        </div>
      )
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
          <h3 className="font-serif font-bold text-xl text-indigo-900">{content[type].title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors"><X size={20}/></button>
        </div>
        <div className="p-8 max-h-[60vh] overflow-y-auto leading-relaxed">
          {content[type].text}
        </div>
        <div className="p-6 border-t border-slate-100 text-center">
          <Button onClick={onClose} className="w-full">J'ai compris</Button>
        </div>
      </div>
    </div>
  );
};

// --- VUES ---
const HomeView = ({ onSelectSign }) => (
  <div className="max-w-5xl mx-auto px-4 py-8">
    <div className="text-center mb-10 space-y-2">
      <h1 className="text-3xl md:text-4xl font-serif text-slate-900 font-bold tracking-tight">Horoscope Hebdomadaire</h1>
      <p className="text-slate-500 italic">Découvrez ce que les astres ont prévu pour vous</p>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {ZODIAC_SIGNS.map((sign) => (
        <div key={sign.id} onClick={() => onSelectSign(sign)} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer flex flex-col items-center py-6 group">
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
  if (!horoscope) return <div className="p-8 text-center"><p className="text-slate-500 mb-4">Prévisions indisponibles.</p><Button onClick={onGoBack} variant="secondary">Retour</Button></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <button onClick={onGoBack} className="flex items-center text-slate-400 hover:text-indigo-600 mb-6"><ArrowLeft size={18} className="mr-2" /> Retour</button>
      <div className="text-center mb-8">
        <div className="text-5xl mb-2">{sign.icon}</div>
        <h2 className="text-3xl font-serif text-slate-900 font-bold">{sign.name}</h2>
      </div>
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6">
          <p className="text-slate-700 leading-relaxed mb-6 italic text-lg">"{horoscope.intro}"</p>
          <div className="space-y-6 text-sm">
             <div><h3 className="font-bold text-rose-600 mb-1 border-b border-rose-100 pb-1 uppercase tracking-wider text-[10px]">Côté Cœur</h3><p className="text-slate-600 leading-relaxed">{horoscope.love}</p></div>
             <div><h3 className="font-bold text-emerald-700 mb-1 border-b border-emerald-100 pb-1 uppercase tracking-wider text-[10px]">Vie Pro</h3><p className="text-slate-600 leading-relaxed">{horoscope.work}</p></div>
          </div>
        </div>
        <div className="relative p-6 bg-slate-50 border-t border-slate-100">
           {!isPremium && (
             <div className="absolute inset-0 flex items-center justify-center p-4 bg-white/60 backdrop-blur-[2px] z-10">
               <div className="bg-white rounded-2xl p-5 shadow-xl text-center border border-indigo-100 scale-90">
                 <Lock className="mx-auto text-indigo-500 mb-2" size={20}/>
                 <p className="text-xs text-slate-500 mb-3 font-medium uppercase">Contenu Premium</p>
                 <Button onClick={session ? onSubscribeReq : onAuthReq} className="py-2 text-xs">Débloquer (2.99€)</Button>
               </div>
             </div>
           )}
           <div className={!isPremium ? "blur-md select-none" : ""}>
             <h3 className="font-bold text-indigo-900 mb-3 text-sm flex items-center gap-2 tracking-widest uppercase"><Sparkles size={14}/> Vos Chiffres de Chance</h3>
             <div className="space-y-2 text-sm text-indigo-800">
                 <p><strong>Couleur :</strong> {horoscope.premium_data?.color}</p>
                 <p><strong>Chiffres :</strong> {Array.isArray(horoscope.premium_data?.lucky_numbers) ? horoscope.premium_data?.lucky_numbers.join(', ') : "..."}</p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const PsychicSelectionView = ({ onSelectPsychic, busyId }) => (
  <div className="max-w-4xl mx-auto px-4 py-8">
    <div className="text-center mb-10 space-y-2">
      <h1 className="text-3xl md:text-4xl font-serif text-slate-900 font-bold tracking-tight">Consultation Privée</h1>
      <p className="text-slate-500 italic">Discutez en direct avec nos experts</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {VOYANTES.map((p) => {
        const isBusy = p.id === busyId;
        return (
          <div key={p.id} onClick={() => !isBusy && onSelectPsychic(p)} className={`bg-white rounded-2xl p-6 text-center border border-slate-100 shadow-sm relative overflow-hidden transition-all ${isBusy ? 'opacity-90' : 'cursor-pointer hover:border-indigo-300'}`}>
            <div className="relative inline-block mb-4">
              <img src={p.image} alt={`Portrait de ${p.name}, experte astropure`} className={`w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg mx-auto ${isBusy ? 'grayscale' : ''}`} />
              <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white ${isBusy ? 'bg-orange-500' : 'bg-green-500'}`}></div>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-1">{p.name}</h3>
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-4">{p.style}</p>
            <p className="text-xs text-slate-500 leading-relaxed mb-6 h-12">{p.desc}</p>
            <button disabled={isBusy} className={`w-full py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${isBusy ? 'bg-slate-50 text-slate-300 border-slate-100' : 'bg-indigo-600 text-white shadow-md active:scale-95'}`}>
              {isBusy ? 'En consultation' : 'Consulter en direct'}
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

      if (data.error === "LIMIT_REACHED") { setMsgCount(3); } 
      else {
        const reply = data.response || data.output || data.text || "Je ressens une interférence... Reposez votre question.";
        setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
        if (!isPremium) setMsgCount(prev => prev + 1);
      }
    } catch (e) { setMessages(prev => [...prev, { role: 'assistant', content: "Erreur de connexion lors de la séance." }]); } 
    finally { setLoading(false); }
  };

  const showPaywall = !isPremium && msgCount >= 3;

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-140px)] flex flex-col pt-4 px-2">
      <div className="flex items-center gap-4 border-b border-slate-100 pb-4 mb-4">
        <button onClick={onGoBack} className="p-2 hover:bg-slate-100 rounded-full"><ArrowLeft size={20}/></button>
        <div className="flex items-center gap-3">
          <img src={psychic.image} alt={psychic.name} className="w-12 h-12 rounded-full object-cover shadow-sm" />
          <div><h3 className="font-bold text-slate-800">{psychic.name}</h3><div className="text-[10px] text-green-500 font-bold flex items-center gap-1 uppercase">En ligne</div></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-4 px-2 pb-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'}`}>{m.content}</div>
          </div>
        ))}
        {loading && <div className="flex justify-start"><div className="bg-white border border-slate-100 p-3 rounded-2xl flex gap-1"><span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></span><span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-100"></span><span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-200"></span></div></div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-white border-t border-slate-100">
        {showPaywall ? (
          <div className="text-center p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
            <h3 className="font-bold text-indigo-900 mb-1">Poursuivre la séance</h3>
            <Button onClick={session ? onSubscribeReq : onAuthReq} className="w-full py-2 text-xs uppercase tracking-widest">Accès illimité</Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Écrivez votre question ici..." className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-5 py-3 outline-none focus:border-indigo-500 focus:bg-white transition-all text-sm" />
            <button onClick={handleSend} disabled={loading || !input.trim()} className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 shadow-md transition-all active:scale-90"><Send size={18} /></button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- APP PRINCIPALE ---
export default function App() {
  const [activeTab, setActiveTab] = useState('horoscope'); 
  const [viewState, setViewState] = useState('list'); 
  const [selectedSign, setSelectedSign] = useState(null);
  const [selectedPsychic, setSelectedPsychic] = useState(null);
  const [session, setSession] = useState(null);
  const [isPremium, setIsPremium] = useState(false);

  // LOGIQUE MODALES & NOTIFS
  const [modalType, setModalType] = useState(null);
  const [showChatNotif, setShowChatNotif] = useState(false);
  const [randomPsychic, setRandomPsychic] = useState(null);
  const [busyPsychicId, setBusyPsychicId] = useState(null);

  useEffect(() => {
    const busyOne = VOYANTES[Math.floor(Math.random() * VOYANTES.length)];
    setBusyPsychicId(busyOne.id);
    const availables = VOYANTES.filter(p => p.id !== busyOne.id);
    setRandomPsychic(availables[0] || VOYANTES[0]);
    const timer = setTimeout(() => setShowChatNotif(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sess) => {
      setSession(sess);
      if (sess?.user) {
        supabase.from('profiles').select('is_premium').eq('id', sess.user.id).single().then(({data}) => {
          if (data) setIsPremium(data.is_premium);
        });
        const chan = supabase.channel('profiles').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${sess.user.id}` }, (payload) => {
          if (payload.new) setIsPremium(payload.new.is_premium);
        }).subscribe();
        return () => supabase.removeChannel(chan);
      } else { setIsPremium(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubscribe = () => {
    const returnUrl = window.location.origin;
    window.location.href = session ? `${STRIPE_LINK}?client_reference_id=${session.user.id}&return_url=${encodeURIComponent(returnUrl)}` : STRIPE_LINK;
  };

  const renderContent = () => {
    if (activeTab === 'horoscope') {
      if (selectedSign) return <ReadingView sign={selectedSign} session={session} isPremium={isPremium} onGoBack={() => setSelectedSign(null)} onAuthReq={() => setViewState('auth')} onSubscribeReq={handleSubscribe} />;
      return <HomeView onSelectSign={setSelectedSign} />;
    }
    if (activeTab === 'voyance') {
      if (selectedPsychic) return <ChatView psychic={selectedPsychic} session={session} isPremium={isPremium} onGoBack={() => setSelectedPsychic(null)} onAuthReq={() => setViewState('auth')} onSubscribeReq={handleSubscribe} />;
      return <PsychicSelectionView onSelectPsychic={setSelectedPsychic} busyId={busyPsychicId} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <Helmet>
        <title>AstroPure | Horoscope Gratuit et Voyance en Direct</title>
        <meta name="description" content="Découvrez vos prévisions astrales hebdomadaires et consultez nos médiums experts en direct chez AstroPure." />
      </Helmet>

      <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 h-16 flex items-center justify-between px-4">
         <div className="font-serif font-bold text-xl tracking-tight text-indigo-900">Astro<span className="text-indigo-600">Pure</span></div>
         <div className="flex items-center gap-3">
            {isPremium && <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100 uppercase tracking-tighter shadow-sm">Client Premium</span>}
            {session && <button onClick={() => supabase.auth.signOut()} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"><LogOut size={18}/></button>}
         </div>
      </nav>
      
      <main className="flex-1 pb-24">{renderContent()}</main>

      {/* FOOTER LÉGAL (SEO & CONFIANCE) */}
      <footer className="bg-white border-t border-slate-100 p-8 text-center text-[10px] text-slate-400 pb-32">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="font-bold text-slate-800 tracking-[3px] uppercase">Altéo Consulting</div>
          <div className="flex justify-center gap-6 font-medium uppercase tracking-widest underline decoration-indigo-200 underline-offset-4">
            <button onClick={() => setModalType('mentions')}>Mentions Légales</button>
            <button onClick={() => setModalType('cgu')}>CGU & Confidentialité</button>
          </div>
          <p className="max-w-xs mx-auto leading-relaxed">
            Service de divertissement réservé aux majeurs. SIRET 99335347300016 - 2 RUE NOTRE-DAME DES VICTOIRES, 75002 PARIS.
          </p>
          <div className="flex justify-center items-center gap-2 font-bold text-indigo-600">
            <ShieldCheck size={14}/> PAIEMENTS SÉCURISÉS PAR STRIPE
          </div>
        </div>
      </footer>

      {/* NOTIFICATION CHAT */}
      {showChatNotif && activeTab === 'horoscope' && !selectedSign && randomPsychic && (
        <div className="fixed bottom-20 right-4 z-[60] flex items-end gap-2 animate-in slide-in-from-right-5 duration-700">
          <div className="relative bg-white shadow-2xl border border-slate-100 rounded-2xl rounded-br-none p-3 max-w-[200px] mb-8 ring-1 ring-black/5">
            <p className="text-[11px] font-bold text-indigo-600 mb-0.5 uppercase tracking-tighter">{randomPsychic.name}</p>
            <p className="text-[12px] text-slate-700 leading-tight italic font-medium">"{randomPsychic.hook}"</p>
            <div className="absolute bottom-[-8px] right-0 w-0 h-0 border-l-[10px] border-l-transparent border-t-[10px] border-t-white"></div>
          </div>
          <button onClick={() => { setActiveTab('voyance'); setSelectedPsychic(randomPsychic); setShowChatNotif(false); }} className="relative w-14 h-14 bg-white rounded-full shadow-2xl border-2 border-indigo-600 overflow-hidden active:scale-95 transition-all">
            <img src={randomPsychic.image} className="w-full h-full object-cover" alt={randomPsychic.name} />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">1</div>
          </button>
        </div>
      )}

      {/* NAVIGATION BASSE */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 h-16 flex items-center justify-around z-50 pb-safe">
        <button onClick={() => { setActiveTab('horoscope'); setSelectedSign(null); }} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'horoscope' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <Moon size={22} fill={activeTab === 'horoscope' ? "currentColor" : "none"} /><span className="text-[10px] font-bold uppercase tracking-widest">Horoscope</span>
        </button>
        <div className="w-px h-6 bg-slate-200"></div>
        <button onClick={() => { setActiveTab('voyance'); setSelectedPsychic(null); }} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'voyance' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <MessageCircle size={22} fill={activeTab === 'voyance' ? "currentColor" : "none"} /><span className="text-[10px] font-bold uppercase tracking-widest">Voyance</span>
        </button>
      </div>

      {/* MODALES */}
      <LegalModal isOpen={!!modalType} onClose={() => setModalType(null)} type={modalType} />
    </div>
  );
}