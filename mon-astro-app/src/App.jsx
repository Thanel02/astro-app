import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Helmet } from 'react-helmet';
import ReactGA from "react-ga4";
import { 
  Star, Moon, Sun, Lock, ChevronRight, User, Check, Sparkles, 
  ArrowLeft, Menu, X, LogOut, Loader2, MessageCircle, Send,
  Bot, AlertTriangle, AlertCircle, LayoutGrid, Bell, Clock, ShieldCheck, Mail, Key, Settings,
  ThumbsUp, Users, Shield, Heart, Eye, Zap, Info
} from 'lucide-react';

// --- CONFIGURATION ---
const STRIPE_LINK = "https://buy.stripe.com/6oUdR8gX08J0cbO2q0dAk00"; 
const N8N_CHAT_WEBHOOK = "https://landingfactory.app.n8n.cloud/webhook/chat-voyance";
const CONTACT_EMAIL = "gestion@alteoconseil.fr";
const PRICE_TEXT = "2,99€/mois";
const GA_MEASUREMENT_ID = "G-V5V2VV84LG"; 

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

ReactGA.initialize(GA_MEASUREMENT_ID);

// --- COMPOSANT MODALE LEGALE ---
const LegalModal = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl max-h-[80dvh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b flex items-center justify-between bg-slate-50">
          <h3 className="font-black text-indigo-950 uppercase tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={24}/></button>
        </div>
        <div className="p-8 overflow-y-auto text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
        <div className="p-6 border-t bg-slate-50 text-center">
          <button onClick={onClose} className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold">Fermer</button>
        </div>
      </div>
    </div>
  );
};

// --- DONNÉES ---
const VOYANTES = [
  { id: 'nathalie', name: 'Nathalie', desc: 'Experte reconnue en relations amoureuses et psychologie du couple.', style: 'Analytique & Intuitive', image: '/nathalie-voyante-astropure.png', welcome: "Bonjour, je suis Nathalie. Quel est le prénom de la personne qui occupe vos pensées ?", rating: 4.8, reviews: 892, isTop: true },
  { id: 'caroline', name: 'Caroline', desc: 'Médium pur de naissance. Ses flashs sont directs et sans complaisance.', style: 'Sincère et Directe', image: '/caroline-voyante-astropure.png', welcome: "Bonjour, je suis Caroline. Posez-moi votre question, je vous écoute.", rating: 4.9, reviews: 1248, isTop: false },
  { id: 'pierre', name: 'Maître Pierre', desc: 'Astrologue certifié. Expert dans les cycles de vie et les périodes propices.', style: 'Analytique et Expert', image: '/pierre-voyant-astropure.png', welcome: "Bonjour, ici Pierre. Donnez-moi votre prénom pour commencer l'étude de votre ciel.", rating: 4.9, reviews: 2105, isTop: false }
];

const ZODIAC_SIGNS = [
  { id: 'belier', name: 'Bélier', icon: '♈' }, { id: 'taureau', name: 'Taureau', icon: '♉' },
  { id: 'gemeaux', name: 'Gémeaux', icon: '♊' }, { id: 'cancer', name: 'Cancer', icon: '♋' },
  { id: 'lion', name: 'Lion', icon: '♌' }, { id: 'vierge', name: 'Vierge', icon: '♍' },
  { id: 'balance', name: 'Balance', icon: '♎' }, { id: 'scorpion', name: 'Scorpion', icon: '♏' },
  { id: 'sagittaire', name: 'Sagittaire', icon: '♐' }, { id: 'capricorne', name: 'Capricorne', icon: '♑' },
  { id: 'verseau', name: 'Verseau', icon: '♒' }, { id: 'poissons', name: 'Poissons', icon: '♓' },
];

// --- VUE CHAT ---
const ChatView = ({ psychic, isPremium, onGoBack, onAction, session }) => {
  const [messages, setMessages] = useState(() => {
    const key = `astro_hist_${psychic.id}_${session?.user?.id || 'anon'}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [{ role: 'assistant', content: psychic.welcome }];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const key = `astro_hist_${psychic.id}_${session?.user?.id || 'anon'}`;
    localStorage.setItem(key, JSON.stringify(messages));
  }, [messages, session, psychic.id]);

  const handleSend = async () => {
    const userMsgCount = messages.filter(m => m.role === 'user').length;
    if (!input.trim() || loading || (!isPremium && userMsgCount >= 1)) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(N8N_CHAT_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, voyanteId: psychic.id, userId: session?.user?.id || 'anonymous', isPremium, history: messages.slice(-5)})
      });
      const data = await response.json();
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: data.text || "La vision est trouble..." }]);
        setLoading(false);
      }, 2500);
    } catch (e) { 
        setMessages(prev => [...prev, { role: 'assistant', content: "Erreur de connexion." }]);
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col md:max-w-2xl md:mx-auto shadow-2xl">
      <div className="flex items-center gap-4 py-4 px-5 border-b bg-white/90 backdrop-blur-md sticky top-0 z-20">
        <button onClick={onGoBack} className="p-2 bg-slate-50 rounded-full"><ArrowLeft size={20}/></button>
        <img src={psychic.image} className="w-11 h-11 rounded-full object-cover border-2 border-indigo-50" />
        <div className="flex-1 text-left">
            <h3 className="font-black text-[15px] text-indigo-950">{psychic.name}</h3>
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">En ligne • Privé</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col bg-[#fcfdff]">
        {messages.map((m, i) => {
          const isBlurry = !isPremium && m.role === 'assistant' && messages.filter(msg => msg.role === 'user').length >= 1 && i === messages.length - 1;
          return (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} mb-6 relative`}>
              <div className={`max-w-[90%] p-5 rounded-[1.75rem] text-[16px] leading-relaxed shadow-sm ${
                m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none'
              }`}>
                {isBlurry ? (
                  <div className="relative">
                    <span>{m.content.substring(0, 60)}</span>
                    <span className="filter blur-[15px] opacity-25 select-none block mt-2">{m.content.substring(60) || "Voici l'analyse complète que j'ai reçue pour vous. Les énergies indiquent un changement majeur qui va impacter votre situation."}</span>
                    <div className="mt-8 bg-white p-7 rounded-[2.5rem] shadow-2xl border border-slate-100 text-center">
                        <p className="text-[17px] font-black text-indigo-950 mb-6 uppercase tracking-tight">Ma vision est complète</p>
                        <button onClick={onAction} className="w-full bg-gradient-to-b from-amber-400 to-amber-600 text-white text-[16px] font-black py-6 rounded-2xl shadow-[0_8px_0_0_#b45309,0_15px_30px_rgba(0,0,0,0.3)] transition-all transform active:translate-y-1">
                            RÉVÉLER MA RÉPONSE <span className="text-xs opacity-80 font-bold">({PRICE_TEXT})</span>
                        </button>
                        <p className="text-[10px] text-slate-400 font-bold mt-6 uppercase tracking-widest flex items-center justify-center gap-2">
                           <ShieldCheck size={14} className="text-emerald-500"/> Libellé discret : Altéo Conseil
                        </p>
                    </div>
                  </div>
                ) : m.content}
              </div>
            </div>
          );
        })}
        {loading && <div className="flex justify-start mb-6"><div className="bg-white border p-4 rounded-full px-8 animate-pulse text-indigo-400 font-bold text-xs uppercase tracking-tighter">Réflexion en cours...</div></div>}
      </div>

      {(!(!isPremium && messages.filter(m => m.role === 'user').length >= 1)) && (
        <div className="p-4 border-t bg-white flex gap-3 pb-10 md:pb-4">
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyPress={e=>e.key==='Enter' && handleSend()} placeholder="Posez votre question..." className="flex-1 bg-slate-50 rounded-2xl px-5 py-4 outline-none border-2 border-transparent focus:border-indigo-100" />
          <button onClick={handleSend} className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg"><Send size={24}/></button>
        </div>
      )}
    </div>
  );
};

// --- COMPOSANT PRINCIPAL ---
export default function App() {
  const [activeTab, setActiveTab] = useState('voyance'); 
  const [viewState, setViewState] = useState('list'); 
  const [selectedPsychic, setSelectedPsychic] = useState(null);
  const [session, setSession] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [selectedSign, setSelectedSign] = useState(null);
  const [modalContent, setModalContent] = useState({ open: false, title: '', text: '' });

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user) {
      supabase.from('profiles').select('is_premium').eq('id', session.user.id).single()
        .then(({data}) => {
            const premiumStatus = !!data?.is_premium;
            setIsPremium(premiumStatus);
            if (viewState === 'auth' && premiumStatus) setViewState('list');
        });
    }
  }, [session, viewState]);

  const handleAction = () => {
    ReactGA.event({ category: "Conversion", action: "Click Payment Button" });
    if (!session) setViewState('auth');
    else window.location.href = `${STRIPE_LINK}?client_reference_id=${session.user.id}`;
  };

  const openLegal = (type) => {
    const contents = {
      cgv: { title: "CGV", text: "Le service AstroPure est un abonnement mensuel de 2,99€ TTC débité sous le libellé 'Altéo Conseil'. Réservé aux personnes majeures." },
      conf: { title: "Confidentialité", text: "Vos données sont protégées et ne sont jamais revendues. Vous avez un droit de suppression via gestion@alteoconseil.fr." },
      abo: { title: "Gestion de l'abonnement", text: `Désabonnement simple par email à ${CONTACT_EMAIL}. Traitement sous 24h ouvrées.` }
    };
    setModalContent({ open: true, ...contents[type] });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      <Helmet><title>AstroPure | Voyance Privée</title></Helmet>
      <LegalModal isOpen={modalContent.open} title={modalContent.title} content={modalContent.text} onClose={() => setModalContent({ ...modalContent, open: false })} />

      {viewState === 'list' && !selectedPsychic && !selectedSign && (
        <div className="bg-indigo-950 text-white text-[9px] py-3 text-center font-black flex items-center justify-center gap-4 uppercase tracking-[0.2em] z-[60]">
          <Shield size={14} className="text-indigo-400" /> Cabinet de Voyance Privé <Shield size={14} className="text-indigo-400" />
        </div>
      )}

      <nav className="bg-white border-b h-16 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="font-serif font-black text-2xl text-indigo-950 flex items-center gap-2 cursor-pointer" onClick={() => {setViewState('list'); setSelectedPsychic(null); setSelectedSign(null);}}>
          <Moon className="text-indigo-600" size={28} fill="currentColor"/> AstroPure
        </div>
        {session ? (
            <button onClick={() => supabase.auth.signOut()} className="text-slate-400"><LogOut size={22}/></button>
        ) : (
            <button onClick={() => setViewState('auth')} className="text-[11px] font-black text-indigo-600 bg-indigo-50/50 px-5 py-2.5 rounded-full uppercase border border-indigo-100 tracking-tight">Accès Client</button>
        )}
      </nav>

      <main className="flex-1 overflow-y-auto pb-32">
        {viewState === 'auth' ? (
            <div className="flex items-center justify-center min-h-[70dvh] px-4">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md text-center border">
                    <div className="mb-6 inline-flex p-4 bg-indigo-50 rounded-full text-indigo-600"><Lock size={28}/></div>
                    <h2 className="text-2xl font-black font-serif text-indigo-950 mb-4">Dernière étape</h2>
                    <p className="text-sm text-slate-500 mb-8 leading-relaxed italic">Veuillez patienter pendant que nous configurons votre accès privé vers Stripe...</p>
                    <button onClick={handleAction} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold shadow-xl">Continuer vers mon offre</button>
                </div>
            </div>
        ) : (
          activeTab === 'horoscope' ? (
            <div className="max-w-5xl mx-auto px-6 py-12">
                <div className="text-center mb-16"><h1 className="text-4xl font-serif font-black text-indigo-950">Horoscope Hebdomadaire</h1></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {ZODIAC_SIGNS.map(s => <div key={s.id} onClick={() => openLegal('cgv')} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 cursor-pointer text-center"><div className="text-5xl mb-4">{s.icon}</div><div className="font-black text-indigo-950 uppercase tracking-tight">{s.name}</div></div>)}
                </div>
            </div>
          ) : (
            selectedPsychic ? (
                <ChatView psychic={selectedPsychic} isPremium={isPremium} onGoBack={() => setSelectedPsychic(null)} onAction={handleAction} session={session} />
            ) : (
                <div className="max-w-4xl mx-auto px-6 py-12">
                    <div className="text-center mb-16 px-4">
                        <h1 className="text-4xl font-serif font-black text-indigo-950 leading-tight">Consultation de Voyance Privée</h1>
                        <p className="text-slate-500 text-base mt-4 max-w-sm mx-auto font-medium">Experts certifiés disponibles par chat sécurisé.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {VOYANTES.map(p => (
                            <div key={p.id} onClick={() => setSelectedPsychic(p)} className="bg-white rounded-[3rem] p-8 text-center border border-slate-100 shadow-xl hover:border-indigo-200 transition-all cursor-pointer group">
                                <img src={p.image} className="w-32 h-32 rounded-full object-cover mx-auto mb-6 border-4 border-white shadow-xl" />
                                <h3 className="font-black text-2xl text-indigo-950 mb-1">{p.name}</h3>
                                <p className="text-indigo-600 text-[11px] font-black uppercase mb-4 tracking-[0.2em]">{p.style}</p>
                                <button className="w-full bg-indigo-900 text-white py-5 rounded-[1.5rem] font-black text-xs uppercase shadow-xl group-hover:bg-indigo-950 transition-all">Consulter {p.name}</button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-24 space-y-12">
                        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 text-center shadow-sm">
                            <div className="flex justify-center gap-12 opacity-50 mb-8 grayscale"><img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-5" /><img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-5" /></div>
                            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-[11px] text-slate-500 font-black border-t pt-8 uppercase">
                                <button onClick={() => openLegal('cgv')}>CGV</button>
                                <button onClick={() => openLegal('conf')}>Confidentialité</button>
                                <button onClick={() => openLegal('abo')} className="text-amber-600">Gérer mon abonnement</button>
                            </div>
                        </div>
                        <footer className="text-center opacity-40 text-[10px] pb-12 font-medium">© 2026 AstroPure • {CONTACT_EMAIL}</footer>
                    </div>
                </div>
            )
          )
        )}
      </main>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/90 backdrop-blur-xl border h-20 rounded-[2.5rem] flex items-center justify-around z-50 px-8 shadow-[0_15px_50px_rgba(0,0,0,0.15)]">
        <button onClick={() => { setActiveTab('voyance'); setSelectedPsychic(null); }} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'voyance' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <MessageCircle size={26} fill={activeTab === 'voyance' ? "currentColor" : "none"}/><span className="text-[10px] uppercase font-black tracking-widest">Voyance</span>
        </button>
        <button onClick={() => { setActiveTab('horoscope'); setSelectedPsychic(null); }} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'horoscope' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <Moon size={26} fill={activeTab === 'horoscope' ? "currentColor" : "none"}/><span className="text-[10px] uppercase font-black tracking-widest">Horoscope</span>
        </button>
      </div>
    </div>
  );
}