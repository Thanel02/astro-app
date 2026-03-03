import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Helmet } from 'react-helmet';
import ReactGA from "react-ga4";
import { 
  Star, Moon, Sun, Lock, ChevronRight, User, Check, Sparkles, 
  ArrowLeft, Menu, X, LogOut, Loader2, MessageCircle, Send,
  Bot, AlertTriangle, AlertCircle, LayoutGrid, Bell, Clock, ShieldCheck, Mail, Key, Settings,
  ThumbsUp, Users, Shield, Heart, Eye, Zap, Info, FileText
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

export default function App() {
  const [activeTab, setActiveTab] = useState('voyance'); 
  const [viewState, setViewState] = useState('list'); 
  const [selectedPsychic, setSelectedPsychic] = useState(null);
  const [session, setSession] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [selectedSign, setSelectedSign] = useState(null);
  const [horoscope, setHoroscope] = useState(null);
  
  // États pour les modales
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
            if (viewState === 'auth') {
                if (premiumStatus) setViewState('list');
                else window.location.href = `${STRIPE_LINK}?client_reference_id=${session.user.id}`;
            }
        });
    }
  }, [session, viewState]);

  const handleAction = () => {
    ReactGA.event({ category: "Conversion", action: "Click Payment Button", label: selectedPsychic?.name || "General" });
    if (!session) setViewState('auth');
    else window.location.href = `${STRIPE_LINK}?client_reference_id=${session.user.id}`;
  };

  const openLegal = (type) => {
    const contents = {
      cgv: { title: "Conditions Générales de Vente", text: "Le service AstroPure est un service de divertissement par abonnement au tarif de 2,99€ TTC par mois. L'accès est immédiat après validation du paiement. Le débit sur votre compte apparaîtra sous le libellé 'Altéo Conseil'. Le service est réservé aux personnes majeures." },
      conf: { title: "Politique de Confidentialité", text: "Nous collectons votre email pour la création de votre compte et le suivi de vos échanges. Vos données ne sont jamais revendues à des tiers. Conformément au RGPD, vous disposez d'un droit d'accès et de suppression de vos données sur simple demande par email." },
      abo: { title: "Gestion de l'abonnement", text: `Votre abonnement à AstroPure est sans engagement de durée. \n\nCOMMENT SE DÉSABONNER ? \nIl vous suffit d'envoyer un email à : ${CONTACT_EMAIL} avec pour objet 'Désabonnement' et l'adresse email de votre compte. \n\nVotre demande sera traitée manuellement par notre équipe sous 24h ouvrées. Vous recevrez une confirmation dès que l'arrêt de l'abonnement sera effectif.` }
    };
    setModalContent({ open: true, ...contents[type] });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      <Helmet><title>AstroPure | Cabinet de Voyance Privée</title></Helmet>
      
      <LegalModal isOpen={modalContent.open} title={modalContent.title} content={modalContent.text} onClose={() => setModalContent({ ...modalContent, open: false })} />

      {viewState === 'list' && !selectedPsychic && !selectedSign && (
        <div className="bg-indigo-950 text-white text-[9px] py-3 text-center font-black flex items-center justify-center gap-4 uppercase tracking-[0.2em] z-[60]">
          <Shield size={14} className="text-indigo-400" /> Cabinet de Voyance Privé <Shield size={14} className="text-indigo-400" />
        </div>
      )}

      <nav className="bg-white/80 backdrop-blur-md border-b h-16 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="font-serif font-black text-2xl text-indigo-950 flex items-center gap-2 cursor-pointer" onClick={() => {setViewState('list'); setSelectedPsychic(null); setSelectedSign(null); setActiveTab('voyance');}}>
          <Moon className="text-indigo-600" size={28} fill="currentColor"/> AstroPure
        </div>
        {session ? (
            <button onClick={() => supabase.auth.signOut()} className="text-slate-400 p-2 rounded-full transition-colors"><LogOut size={22}/></button>
        ) : (
            <button onClick={() => {setIsLoginMode(true); setViewState('auth');}} className="text-[11px] font-black text-indigo-600 bg-indigo-50/50 px-5 py-2.5 rounded-full uppercase border border-indigo-100 tracking-tight">Accès Client</button>
        )}
      </nav>

      <main className="flex-1 overflow-y-auto pb-32">
        {viewState === 'auth' ? (
            <div className="flex items-center justify-center min-h-[70dvh] px-4">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-slate-50 text-center relative">
                    <button onClick={() => setViewState('list')} className="absolute top-6 right-6 text-slate-300"><X size={24}/></button>
                    <div className="mb-6 inline-flex p-4 bg-indigo-50 rounded-full text-indigo-600"><Lock size={28}/></div>
                    <h2 className="text-2xl font-black font-serif text-indigo-950 mb-2">{isLoginMode ? 'Bon retour' : 'Dernière étape'}</h2>
                    <p className="text-sm text-slate-500 mb-8 leading-relaxed">Identifiez-vous pour débloquer votre analyse privée.</p>
                    <button onClick={handleAction} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold">Accéder à ma réponse</button>
                    <button onClick={() => setIsLoginMode(!isLoginMode)} className="mt-8 block w-full text-sm text-indigo-600 font-bold underline">
                        {isLoginMode ? "Pas de compte ? S'inscrire" : "Déjà inscrit ? Me connecter"}
                    </button>
                </div>
            </div>
        ) : (
          activeTab === 'horoscope' ? (
            selectedSign ? (
                <div className="max-w-2xl mx-auto p-4 animate-in fade-in">
                    <button onClick={() => setSelectedSign(null)} className="mb-6 flex items-center text-slate-400 font-bold text-sm"><ArrowLeft size={20} className="mr-2"/>Retour</button>
                    <div className="bg-white p-8 rounded-[2.5rem] border shadow-xl space-y-8">
                        <h2 className="text-3xl font-serif font-black text-indigo-950 flex items-center gap-3">{selectedSign.icon} Horoscope {selectedSign.name}</h2>
                        {!isPremium && <div className="p-8 bg-indigo-950 text-white rounded-[2rem] text-center shadow-2xl">
                            <Lock size={40} className="mx-auto mb-4 text-indigo-300"/>
                            <h4 className="text-xl font-black mb-2 uppercase tracking-tighter">Rapport Complet Verrouillé</h4>
                            <button onClick={handleAction} className="w-full bg-white text-indigo-950 py-5 rounded-full font-black shadow-xl">DÉBLOQUER ({PRICE_TEXT})</button>
                        </div>}
                    </div>
                </div>
            ) : (
                <div className="max-w-5xl mx-auto px-6 py-12">
                    <div className="text-center mb-16"><h1 className="text-4xl font-serif font-black text-indigo-950">Horoscope Hebdomadaire</h1></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {ZODIAC_SIGNS.map(s => <div key={s.id} onClick={() => setSelectedSign(s)} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 cursor-pointer hover:border-indigo-300 transition-all text-center group"><div className="text-5xl mb-4">{s.icon}</div><div className="font-black text-indigo-950 uppercase tracking-tight">{s.name}</div></div>)}
                    </div>
                </div>
            )
          ) : (
            selectedPsychic ? (
                <div className="fixed inset-0 bg-white z-[60] flex flex-col md:max-w-2xl md:mx-auto shadow-2xl overflow-hidden">
                    <div className="flex items-center gap-4 py-4 px-5 border-b bg-white/80 backdrop-blur-md sticky top-0 z-20">
                        <button onClick={() => setSelectedPsychic(null)} className="p-2 bg-slate-50 rounded-full"><ArrowLeft size={20}/></button>
                        <div className="relative">
                            <img src={psychic.image} className="w-12 h-12 rounded-full object-cover border-2 border-indigo-50 shadow-sm" alt={psychic.name} />
                            <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-black text-[15px] text-indigo-950">{psychic.name}</h3>
                            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">En ligne • Privé</p>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col-reverse bg-slate-50/50">
                        {!isPremium && (
                            <div className="absolute inset-x-0 bottom-4 pb-2 flex flex-col items-center justify-end z-20 px-4">
                                <div className="bg-white/98 p-8 rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.25)] border border-slate-100 text-center w-full backdrop-blur-xl animate-in slide-in-from-bottom-12">
                                    <p className="text-[17px] font-black text-indigo-950 mb-8">Ma vision est complète.<br/><span className="text-amber-600 uppercase text-xs tracking-widest">Accédez à votre vérité</span></p>
                                    <button onClick={handleAction} className="relative w-full bg-gradient-to-b from-amber-400 to-amber-600 text-white text-[17px] font-black py-6 rounded-2xl border-t border-amber-300 shadow-[0_8px_0_0_#b45309,0_15px_30px_rgba(0,0,0,0.3)] transition-all transform active:translate-y-1">
                                        RÉVÉLER MA RÉPONSE ({PRICE_TEXT})
                                    </button>
                                    <div className="mt-10 pt-4 border-t border-slate-50">
                                        <p className="text-[11px] text-slate-600 font-black uppercase tracking-widest flex items-center justify-center gap-2 mb-2"><ShieldCheck size={16} className="text-emerald-500" /> Libellé discret : "Altéo Conseil"</p>
                                        <button onClick={() => openLegal('abo')} className="text-[10px] text-indigo-600 font-bold underline">Arrêter l'abonnement ?</button>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="h-64 flex-shrink-0" />
                        <div className="bg-white border p-5 rounded-3xl rounded-bl-none shadow-sm max-w-[90%]">{psychic.welcome}</div>
                    </div>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto px-6 py-12">
                    <div className="text-center mb-16 px-4">
                        <h1 className="text-4xl font-serif font-black text-indigo-950 leading-tight">Cabinet de Voyance Privée</h1>
                        <p className="text-slate-500 text-base mt-4 max-w-sm mx-auto font-medium text-center">Réponse immédiate par chat sécurisé avec nos experts.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {VOYANTES.map(p => (
                            <div key={p.id} onClick={() => setSelectedPsychic(p)} className="bg-white rounded-[3rem] p-8 text-center border border-slate-100 shadow-xl hover:border-indigo-200 transition-all group relative">
                                {p.isTop && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 text-[10px] font-black px-6 py-2 rounded-full uppercase shadow-lg">Expert Recommandé</div>}
                                <img src={p.image} className="w-32 h-32 rounded-full object-cover mx-auto mb-6 border-4 border-white shadow-xl" />
                                <h3 className="font-black text-2xl text-indigo-950 mb-1">{p.name}</h3>
                                <p className="text-indigo-600 text-[11px] font-black uppercase mb-4 tracking-[0.2em]">{p.style}</p>
                                <button className="w-full bg-indigo-900 text-white py-5 rounded-[1.5rem] font-black text-xs uppercase shadow-xl transition-all">Consulter {p.name}</button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-24 space-y-12">
                        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 text-center shadow-sm">
                            <div className="flex justify-center gap-12 opacity-50 mb-10 grayscale">
                              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-5" />
                              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-5" />
                            </div>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 font-bold">Paiement 100% Sécurisé - Débit "Altéo Conseil"</p>
                            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-[11px] text-slate-500 font-black border-t border-slate-50 pt-8 uppercase tracking-tighter">
                                <button onClick={() => openLegal('cgv')} className="hover:text-indigo-600 transition-colors">CGV</button>
                                <button onClick={() => openLegal('conf')} className="hover:text-indigo-600 transition-colors">Confidentialité</button>
                                <button onClick={() => openLegal('abo')} className="hover:text-indigo-600 transition-colors text-amber-600">Gérer mon abonnement</button>
                            </div>
                        </div>
                        <footer className="text-center pb-20 opacity-40 text-[10px] font-medium px-4">
                            <p>© 2026 AstroPure • Cabinet de Voyance Altéo Conseil • {CONTACT_EMAIL}</p>
                            <p className="mt-2 uppercase tracking-widest">Le service est réservé aux personnes majeures</p>
                        </footer>
                    </div>
                </div>
            )
          )
        )}
      </main>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/90 backdrop-blur-xl border h-20 rounded-[2.5rem] flex items-center justify-around z-50 px-8 shadow-[0_15px_50px_rgba(0,0,0,0.15)]">
        <button onClick={() => { setActiveTab('voyance'); setSelectedPsychic(null); setSelectedSign(null); }} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'voyance' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
          <MessageCircle size={26} fill={activeTab === 'voyance' ? "currentColor" : "none"}/><span className="text-[10px] uppercase font-black tracking-widest">Voyance</span>
        </button>
        <button onClick={() => { setActiveTab('horoscope'); setSelectedSign(null); setSelectedPsychic(null); }} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'horoscope' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
          <Moon size={26} fill={activeTab === 'horoscope' ? "currentColor" : "none"}/><span className="text-[10px] uppercase font-black tracking-widest">Horoscope</span>
        </button>
      </div>
    </div>
  );
}