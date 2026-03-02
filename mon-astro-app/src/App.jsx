import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Helmet } from 'react-helmet';
import ReactGA from "react-ga4";
import { 
  Star, Moon, Sun, Lock, ChevronRight, User, Check, Sparkles, 
  ArrowLeft, Menu, X, LogOut, Loader2, MessageCircle, Send,
  Bot, AlertTriangle, AlertCircle, LayoutGrid, Bell, Clock, ShieldCheck, Mail, Key, Settings,
  ThumbsUp, Users, Shield, Heart
} from 'lucide-react';

// --- CONFIGURATION ---
const STRIPE_LINK = "https://buy.stripe.com/6oUdR8gX08J0cbO2q0dAk00"; 
const N8N_CHAT_WEBHOOK = "https://landingfactory.app.n8n.cloud/webhook/chat-voyance";
const CONTACT_EMAIL = "gestion@alteoconseil.fr";
const PRICE_TEXT = "2,99€/mois";
const FREE_CHAT_LIMIT = 2; // Limite à 2 pour autoriser : 1 Question Client + 1 Réponse Voyante.
const GA_MEASUREMENT_ID = "G-V5V2VV84LG"; 

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

ReactGA.initialize(GA_MEASUREMENT_ID);

const VOYANTES = [
  { 
    id: 'nathalie', 
    name: 'Nathalie', 
    desc: 'Experte certifiée en relations amoureuses et psychologie du couple. Spécialisée dans l\'analyse des intentions cachées et le déblocage des crises sentimentales.', 
    style: 'Analytique & Intuitive', 
    image: '/nathalie-voyante-astropure.png', 
    hook: "Je ressens ses intentions...", 
    welcome: "Bonjour, je suis Nathalie. Je me spécialise exclusivement dans les relations de cœur et l'analyse des sentiments. Quel est le prénom de la personne qui occupe vos pensées ?",
    rating: 4.8, reviews: 892, isTop: true, label: "Spécialiste Couple"
  },
  { 
    id: 'caroline', 
    name: 'Caroline', 
    desc: 'Médium pur de naissance. Ses flashs sont directs et sans complaisance pour une voyance sans détour sur votre destin global.', 
    style: 'Sincère et Directe', 
    image: '/caroline-voyante-astropure.png', 
    hook: "Analyse urgente...", 
    welcome: "Bonjour, je suis Caroline. Posez-moi votre question, je vous écoute.",
    rating: 4.9, reviews: 1248, isTop: false, label: "Médium Pur"
  },
  { 
    id: 'pierre', 
    name: 'Maître Pierre', 
    desc: 'Astrologue et Numérologue certifié. Expert dans les cycles de vie et la détermination des périodes propices aux changements.', 
    style: 'Analytique et Expert', 
    image: '/pierre-voyant-astropure.png', 
    hook: "Votre ciel bouge...", 
    welcome: "Bonjour, ici Pierre. Donnez-moi votre prénom pour commencer l'étude de votre configuration astrale.",
    rating: 4.9, reviews: 2105, isTop: false, label: "Astrologue"
  }
];

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }) => {
  const baseStyle = "px-6 py-4 rounded-full font-bold transition-all duration-300 transform active:scale-95 shadow-sm flex items-center justify-center text-base";
  const variants = { primary: "bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-300", secondary: "bg-white text-indigo-900 border border-indigo-100" };
  return <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>{children}</button>;
};

const AuthView = ({ onAuthSuccess, isLoginMode, onCancel, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    try {
      if (isLoginMode) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error, data } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data?.user) await supabase.from('profiles').insert([{ id: data.user.id, is_premium: false }]);
      }
      onAuthSuccess();
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="flex items-center justify-center min-h-[70dvh] px-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border text-center relative border-indigo-50">
        <button onClick={onCancel} className="absolute top-4 right-4 text-slate-400"><X size={20}/></button>
        <div className="mb-6 inline-flex p-3 bg-indigo-50 rounded-full text-indigo-600"><Lock size={24}/></div>
        <h2 className="text-2xl font-bold font-serif text-indigo-900">{isLoginMode ? 'Connexion' : 'Finaliser mon profil'}</h2>
        <p className="text-xs text-slate-500 mt-2 mb-6">Créez votre accès sécurisé pour débuter votre consultation privée.</p>
        <div className="space-y-4">
          <input type="email" placeholder="Votre email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border outline-none text-[16px]"/>
          <input type="password" placeholder="Mot de passe" value={password} onChange={e=>setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border outline-none text-[16px]"/>
          <Button onClick={handleAuth} disabled={loading} className="w-full">{loading ? <Loader2 className="animate-spin mx-auto"/> : "Passer au paiement sécurisé"}</Button>
        </div>
        <button onClick={onSwitchToLogin} className="mt-6 block w-full text-sm text-indigo-600 font-medium underline">
            {isLoginMode ? "Pas de compte ? S'inscrire" : "Déjà inscrit ? Se connecter"}
        </button>
      </div>
    </div>
  );
};

const ChatView = ({ psychic, isPremium, onGoBack, onAction, session }) => {
  const [messages, setMessages] = useState(() => {
    const key = `astro_hist_${psychic.id}_${session?.user?.id || 'anon'}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [{ role: 'assistant', content: psychic.welcome }];
  });
  const [globalUsage, setGlobalUsage] = useState(() => parseInt(localStorage.getItem(`astro_usage_${session?.user?.id || 'anon'}`) || "0"));
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typingStatus, setTypingStatus] = useState("");

  useEffect(() => {
    const key = `astro_hist_${psychic.id}_${session?.user?.id || 'anon'}`;
    localStorage.setItem(key, JSON.stringify(messages));
    localStorage.setItem(`astro_usage_${session?.user?.id || 'anon'}`, globalUsage.toString());
  }, [messages, globalUsage]);

  const handleSend = async () => {
    if (!input.trim() || loading || (!isPremium && globalUsage >= FREE_CHAT_LIMIT)) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);
    setGlobalUsage(prev => prev + 1);

    const statuses = [`${psychic.name} se connecte...`, "Analyse de votre énergie...", "Canalisation en cours..."];
    let step = 0;
    const interval = setInterval(() => { setTypingStatus(statuses[step % statuses.length]); step++; }, 1500);

    try {
      const response = await fetch(N8N_CHAT_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, voyanteId: psychic.id, userId: session?.user?.id || 'anonymous', isPremium })
      });
      const data = await response.json();
      clearInterval(interval);
      setMessages(prev => [...prev, { role: 'assistant', content: data.text || "Je reçois une vibration floue..." }]);
    } catch (e) { setMessages(prev => [...prev, { role: 'assistant', content: "La connexion est instable..." }]); }
    finally { setLoading(false); setTypingStatus(""); }
  };

  const isLimitReached = !isPremium && globalUsage >= FREE_CHAT_LIMIT;

  return (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col md:max-w-2xl md:mx-auto shadow-2xl overflow-hidden overscroll-none">
      <div className="flex items-center gap-4 py-3 px-4 border-b bg-white flex-shrink-0 z-10 shadow-sm">
        <button onClick={onGoBack} className="p-1.5 bg-slate-50 rounded-full"><ArrowLeft size={20}/></button>
        <div className="relative">
          <img src={psychic.image} className="w-10 h-10 rounded-full object-cover border" />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
        </div>
        <div className="flex-1">
            <h3 className="font-bold text-sm leading-none">{psychic.name}</h3>
            <p className="text-[9px] text-emerald-600 font-bold tracking-widest uppercase">Consultation Privée Active</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col-reverse bg-slate-50/30">
        <div className="h-4 flex-shrink-0" />
        {isLimitReached && (
          <div className="bg-white border-2 border-indigo-600 p-8 rounded-[2rem] text-center space-y-6 shadow-2xl my-4 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto"><Sparkles size={32} /></div>
            <div>
              <p className="text-xl font-black text-indigo-900 leading-tight">Analyse en cours...</p>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed italic">"Je viens de percevoir une vibration très précise concernant votre avenir. Pour que je puisse vous livrer l'intégralité de ma vision et vous donner les clés de votre situation, rejoignez mon salon privé."</p>
            </div>
            <Button onClick={onAction} className="w-full text-base font-black uppercase py-5 shadow-xl bg-indigo-600 hover:bg-indigo-700">DÉBLOQUER MA RÉPONSE ({PRICE_TEXT})</Button>
            <div className="flex flex-col items-center gap-2 pt-2 border-t border-slate-100 opacity-70">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400"><ShieldCheck size={14} className="text-emerald-500"/> PAIEMENT 100% SÉCURISÉ & DISCRET</div>
                <div className="flex gap-4 h-3 grayscale">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" />
                </div>
                <p className="text-[9px] text-slate-400">Libellé bancaire discret : Altéo Conseil</p>
            </div>
          </div>
        )}
        {loading && <div className="flex justify-start mb-4"><div className="bg-white border p-4 rounded-2xl rounded-bl-none shadow-sm italic text-[11px] text-indigo-400 font-bold uppercase tracking-tighter">{typingStatus}</div></div>}
        {[...messages].reverse().map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-[16px] shadow-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none'}`}>{m.content}</div>
          </div>
        ))}
      </div>
      {!isLimitReached && (
        <div className="p-3 border-t bg-white flex gap-2 flex-shrink-0">
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyPress={e=>e.key==='Enter' && handleSend()} placeholder="Posez votre question ici..." className="flex-1 bg-slate-50 rounded-2xl px-4 py-3 text-[16px] outline-none border border-transparent focus:border-indigo-100" />
          <button onClick={handleSend} className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg active:scale-90 transition-transform"><Send size={20}/></button>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('voyance'); 
  const [viewState, setViewState] = useState('list'); 
  const [selectedSign, setSelectedSign] = useState(null);
  const [selectedPsychic, setSelectedPsychic] = useState(null);
  const [session, setSession] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [horoscope, setHoroscope] = useState(null);

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
            setIsPremium(!!data?.is_premium);
            if (viewState === 'auth' && !data?.is_premium) {
                window.location.href = `${STRIPE_LINK}?client_reference_id=${session.user.id}`;
            }
        });
    }
  }, [session, viewState]);

  useEffect(() => {
    if (selectedSign && supabase) {
      supabase.from('weekly_horoscopes').select('*').eq('sign_id', selectedSign.name).order('week_start_date', { ascending: false }).limit(1).single()
        .then(({data}) => setHoroscope(data));
      ReactGA.send({ hitType: "pageview", page: `/horoscope/${selectedSign.id}` });
    }
  }, [selectedSign]);

  const handleAction = () => {
    if (!session) setViewState('auth');
    else window.location.href = `${STRIPE_LINK}?client_reference_id=${session.user.id}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Helmet>
        <title>AstroPure | Cabinet de Voyance Spécialisée</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/> 
      </Helmet>

      {/* BANDEAU RASSURANCE EXPERTISE */}
      {viewState === 'list' && !selectedPsychic && (
        <div className="bg-indigo-900 text-white text-[9px] py-2.5 text-center font-black flex items-center justify-center gap-3 uppercase tracking-widest z-[60]">
          <Shield size={12} className="text-indigo-400" />
          Cabinet Privé - Experts en Relations de Couple et Destinée
          <Shield size={12} className="text-indigo-400" />
        </div>
      )}

      <nav className="bg-white border-b h-16 flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="font-serif font-bold text-xl text-indigo-900 flex items-center gap-2 cursor-pointer" onClick={() => {setViewState('list'); setSelectedPsychic(null); setSelectedSign(null);}}>
          <Moon className="text-indigo-600" size={24} fill="currentColor"/> AstroPure
        </div>
        {session ? (
            <button onClick={() => supabase.auth.signOut()} className="text-slate-400"><LogOut size={20}/></button>
        ) : (
            <button onClick={() => {setIsLoginMode(true); setViewState('auth');}} className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full uppercase border border-indigo-100">Accès Client</button>
        )}
      </nav>

      <main className="flex-1 overflow-y-auto">
        {viewState === 'auth' ? (
            <AuthView 
              isLoginMode={isLoginMode} 
              onAuthSuccess={() => {}} 
              onCancel={() => setViewState('list')}
              onSwitchToLogin={() => setIsLoginMode(!isLoginMode)}
            />
        ) : (
          activeTab === 'horoscope' ? (
            // SECTION HOROSCOPE (Inchangée)
            selectedSign ? (
                <div className="max-w-2xl mx-auto p-4 animate-in fade-in">
                  <button onClick={() => { setSelectedSign(null); setHoroscope(null); }} className="mb-4 flex items-center text-slate-400 text-sm"><ArrowLeft size={18} className="mr-2"/>Retour</button>
                  <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-6">
                    <h2 className="text-2xl font-serif font-bold text-indigo-900">{selectedSign.icon} Horoscope {selectedSign.name}</h2>
                    <p className="text-slate-700 leading-relaxed italic text-lg border-l-4 border-indigo-100 pl-4">"{horoscope?.intro || "Les astres révèlent une configuration rare..."}"</p>
                    <div className="grid gap-6">
                      <div className="bg-rose-50/50 p-4 rounded-2xl"><h3 className="font-bold text-rose-600 border-b border-rose-100 text-[10px] uppercase mb-2">Cœur & Sentiments</h3><p className="text-sm text-slate-600">{horoscope?.love || "Le climat astral se stabilise..."}</p></div>
                      <div className="bg-emerald-50/50 p-4 rounded-2xl"><h3 className="font-bold text-emerald-700 border-b border-emerald-100 text-[10px] uppercase mb-2">Carrière & Projets</h3><p className="text-sm text-slate-600">{horoscope?.work || "Une opportunité se dessine..."}</p></div>
                    </div>
                    {!isPremium && <div className="p-6 bg-indigo-900 text-white rounded-3xl text-center shadow-xl"><Lock size={32} className="mx-auto mb-3 text-indigo-300"/><h4 className="font-bold mb-1">Rapport Complet Verrouillé</h4><p className="text-xs mb-4 text-indigo-200">Accédez à vos prévisions <strong>Famille</strong> et <strong>Chance</strong>.</p><Button onClick={handleAction} variant="secondary" className="w-full text-indigo-900 font-bold">DÉBLOQUER POUR {PRICE_TEXT}</Button></div>}
                  </div>
                </div>
              ) : (
                <div className="max-w-5xl mx-auto px-4 py-8">
                  <div className="text-center mb-10">
                    <h1 className="text-3xl font-serif font-black text-indigo-900">Horoscope Hebdomadaire</h1>
                    <p className="text-slate-500 text-sm mt-2">Messages des astres pour votre signe.</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {ZODIAC_SIGNS.map(s => <div key={s.id} onClick={() => setSelectedSign(s)} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 cursor-pointer hover:border-indigo-300 transition-all text-center group"><div className="text-4xl mb-2 group-hover:scale-110 transition-transform">{s.icon}</div><div className="font-bold text-indigo-900">{s.name}</div></div>)}
                  </div>
                </div>
              )
          ) : (
            selectedPsychic ? (
                <ChatView psychic={selectedPsychic} isPremium={isPremium} onGoBack={() => setSelectedPsychic(null)} onAction={handleAction} session={session} />
            ) : (
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-serif font-black text-indigo-900 leading-tight">Consultation de Voyance Privée</h1>
                        <p className="text-slate-500 text-sm mt-3 max-w-xs mx-auto">Posez votre question et recevez une réponse immédiate de nos experts par chat privé.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {VOYANTES.map(p => (
                            <div key={p.id} onClick={() => setSelectedPsychic(p)} className="bg-white rounded-[2.5rem] p-6 text-center border shadow-xl shadow-slate-200/50 cursor-pointer hover:border-indigo-300 transition-all group relative">
                                {p.isTop && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 text-[9px] font-black px-4 py-1.5 rounded-full uppercase shadow-sm whitespace-nowrap">Expert Recommandé</div>}
                                <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-600 text-[8px] font-bold px-2 py-1 rounded-full uppercase flex items-center gap-1"><div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping"></div>En ligne</div>
                                <img src={p.image} className="w-28 h-28 rounded-full object-cover mx-auto mb-4 border-4 border-white shadow-md group-hover:scale-105 transition-transform" />
                                <div className="flex flex-col items-center gap-1 mb-3">
                                  <div className="flex justify-center gap-1 text-amber-500">
                                      {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                                      <span className="text-xs font-bold text-slate-700 ml-1">{p.rating}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-slate-400 text-[10px] uppercase font-bold tracking-tighter">
                                      <Users size={12}/> <span>{p.reviews.toLocaleString()} consultations</span>
                                  </div>
                                </div>
                                <h3 className="font-bold text-xl text-indigo-900">{p.name}</h3>
                                <p className="text-indigo-600 text-[10px] font-black uppercase mb-3 tracking-widest">{p.style}</p>
                                <p className="text-xs text-slate-500 leading-relaxed mb-6 h-auto min-h-[48px] italic">"{p.desc}"</p>
                                <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-xs uppercase shadow-lg shadow-indigo-100 group-hover:bg-indigo-700 transition-colors">Consulter {p.name}</button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 bg-white p-8 rounded-[2rem] border border-slate-100 text-center space-y-4">
                        <div className="flex justify-center gap-8 opacity-40 h-5 grayscale">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" />
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paiement 100% Sécurisé & Discret (Libellé : Altéo Conseil)</p>
                    </div>
                </div>
            )
          )
        )}
      </main>

      {/* NAV BASSE */}
      {viewState === 'list' && !selectedPsychic && (
        <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t h-20 flex items-center justify-around z-50 px-6 shadow-2xl">
          <button onClick={() => { setActiveTab('voyance'); setSelectedPsychic(null); }} className={`flex flex-col items-center gap-1.5 ${activeTab === 'voyance' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <MessageCircle size={24} fill={activeTab === 'voyance' ? "currentColor" : "none"}/>
            <span className="text-[10px] uppercase font-black tracking-tighter">Voyance</span>
          </button>
          <button onClick={() => { setActiveTab('horoscope'); setSelectedSign(null); }} className={`flex flex-col items-center gap-1.5 ${activeTab === 'horoscope' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <Moon size={24} fill={activeTab === 'horoscope' ? "currentColor" : "none"}/>
            <span className="text-[10px] uppercase font-black tracking-tighter">Horoscope</span>
          </button>
        </div>
      )}

      {viewState === 'list' && !selectedPsychic && (
        <footer className="text-center py-10 text-slate-400 text-[10px] pb-32">
            <p>© 2026 AstroPure - Mentions Légales - CGV</p>
            <p className="max-w-xs mx-auto mt-2 italic">Service de divertissement réservé aux personnes majeures.</p>
        </footer>
      )}
    </div>
  );
}