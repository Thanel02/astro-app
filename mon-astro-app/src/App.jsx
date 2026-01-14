import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Star, Moon, Sun, Lock, ChevronRight, User, Check, Sparkles, 
  ArrowLeft, Menu, X, LogOut, Loader2, CreditCard, AlertCircle, AlertTriangle, Settings 
} from 'lucide-react';

// --- CONFIGURATION ---

// 1. Ton lien de PAIEMENT (Celui qui commence par buy.stripe.com...)
const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/test_28EaEW7n8gVEaXTa9o4AU00"; 

// 2. Ton lien de PORTAIL CLIENT (Celui qui commence par billing.stripe.com...)
const STRIPE_PORTAL_LINK = "https://billing.stripe.com/p/login/test_28EaEW7n8gVEaXTa9o4AU00";

// Récupération des clés depuis le fichier .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialisation du client Supabase
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

// --- COMPOSANTS UI ---

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }) => {
  const baseStyle = "px-6 py-3 rounded-full font-medium transition-all duration-300 transform active:scale-95 shadow-sm flex items-center justify-center";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400",
    secondary: "bg-white text-indigo-900 border border-indigo-100 hover:border-indigo-300",
    outline: "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50",
    ghost: "text-slate-500 hover:text-indigo-600 hover:bg-slate-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
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

// --- VUES ---

const HomeView = ({ onSelectSign }) => (
  <div className="max-w-5xl mx-auto px-4 py-12">
    <div className="text-center mb-16 space-y-4">
      <h1 className="text-4xl md:text-5xl font-serif text-slate-900 tracking-tight">
        Astro<span className="text-indigo-600">Weekly</span>
      </h1>
      <p className="text-slate-500 text-lg max-w-xl mx-auto">Votre guidance hebdomadaire connectée.</p>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {ZODIAC_SIGNS.map((sign) => (
        <Card key={sign.id} onClick={() => onSelectSign(sign)} className="cursor-pointer group hover:-translate-y-1 flex flex-col items-center justify-center text-center py-8">
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300 text-indigo-900">{sign.icon}</div>
          <h3 className="text-xl font-medium text-slate-800">{sign.name}</h3>
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
        if (!supabase) throw new Error("CLÉS MANQUANTES : Le fichier .env est mal configuré ou introuvable.");

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
        console.error("Erreur fetch:", err);
        setDebugError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHoroscope();
  }, [sign.name]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-indigo-600">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p>Connexion aux astres...</p>
      </div>
    );
  }

  if (debugError) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center p-8 bg-red-50 rounded-3xl border border-red-100">
        <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-red-900 mb-2">Erreur Technique</h3>
        <p className="text-red-700 mb-4 text-sm font-mono bg-red-100 p-2 rounded">{debugError}</p>
        <Button onClick={onGoBack} variant="secondary">Retour</Button>
      </div>
    );
  }

  if (!horoscope) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center p-8 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <AlertCircle size={48} className="mx-auto text-indigo-300 mb-4" />
        <h3 className="text-xl font-bold text-slate-800 mb-2">Patience...</h3>
        <p className="text-slate-500 mb-6">L'horoscope arrive bientôt pour le {sign.name}.</p>
        <Button onClick={onGoBack} variant="secondary">Choisir un autre signe</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={onGoBack} className="flex items-center text-slate-400 hover:text-indigo-600 mb-8 transition-colors">
        <ArrowLeft size={18} className="mr-2" /> Retour
      </button>

      <div className="text-center mb-10">
        <div className="text-6xl mb-4 text-indigo-900">{sign.icon}</div>
        <h2 className="text-3xl font-serif text-slate-900 mb-2">{sign.name}</h2>
        <p className="text-indigo-600 font-medium">Semaine du {new Date(horoscope.week_start_date).toLocaleDateString()}</p>
        {isPremium && <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold mt-2"><Star size={10}/> MEMBRE PREMIUM</span>}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        
        {/* --- PARTIE GRATUITE --- */}
        <div className="p-8 pb-0">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-500 uppercase tracking-widest mb-4">
            <Sparkles size={14} /><span>Énergies</span>
          </div>
          <p className="text-slate-700 leading-relaxed text-lg mb-8">{horoscope.intro}</p>
          
          <h3 className="text-xl font-medium text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 text-sm">♥</span> Amour
          </h3>
          <p className="text-slate-600 leading-relaxed mb-8">{horoscope.love}</p>

          <h3 className="text-xl font-medium text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500 text-sm">$</span> Travail
          </h3>
          <p className="text-slate-600 leading-relaxed mb-8">{horoscope.work}</p>
        </div>

        {/* --- PARTIE VERROUILLÉE --- */}
        <div className="relative p-8 pt-0">
            <div className={`bg-indigo-50 rounded-2xl p-6 border border-indigo-100 transition-all duration-500 ${!isPremium ? 'blur-md opacity-60 select-none' : ''}`}>
               <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
                 <Lock size={16} className={isPremium ? "hidden" : "inline"}/>
                 <span>Guide Privé & Secrets</span>
               </h3>
               
               <div className="space-y-4 text-indigo-800">
                  <p><strong>Couleur de pouvoir :</strong> {horoscope.premium_data?.color || "..."}</p>
                  <p><strong>Compatibilité secrète :</strong> {horoscope.premium_data?.compatibility || "..."}</p>
                  <p><strong>Vos Numéros Chance :</strong> {
                    Array.isArray(horoscope.premium_data?.lucky_numbers) 
                      ? horoscope.premium_data?.lucky_numbers.join(', ') 
                      : (horoscope.premium_data?.lucky_numbers || "...")
                  }</p>
                  <p className="italic text-sm opacity-80 mt-4">
                    "Une opportunité unique se présentera jeudi, soyez attentif aux signes..."
                  </p>
               </div>
            </div>

            {!isPremium && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-transparent">
                <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-indigo-50 max-w-xs text-center mx-4">
                  <Lock size={24} className="mx-auto mb-3 text-indigo-600"/>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Débloquez vos secrets</h3>
                  <p className="text-slate-500 text-sm mb-4">Vos numéros chance, couleur de la semaine et compatibilité amoureuse sont masqués.</p>
                  
                  {session ? (
                     <Button onClick={onSubscribeReq} className="w-full text-sm py-2">
                        Débloquer (2.99€)
                     </Button>
                  ) : (
                     <Button onClick={onAuthReq} className="w-full text-sm py-2">Me connecter</Button>
                  )}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

// --- VUE PROFIL (Corrigée avec l'icône standard) ---
const ProfileView = ({ session, isPremium, onLogout, onHome, onManageSub }) => {
  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <button onClick={onHome} className="flex items-center text-slate-400 hover:text-indigo-600 mb-8 transition-colors">
        <ArrowLeft size={18} className="mr-2" /> Retour
      </button>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center">
        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600">
          <User size={40} />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Mon Compte</h2>
        <p className="text-slate-500 mb-6">{session?.user?.email}</p>

        <div className="inline-block px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 mb-8">
           <span className="text-sm font-medium text-slate-600">Statut : </span>
           {isPremium ? (
             <span className="text-sm font-bold text-amber-600 flex items-center gap-1 inline-flex ml-2">
               <Star size={14} fill="currentColor"/> PREMIUM ACTIF
             </span>
           ) : (
             <span className="text-sm font-bold text-slate-500 ml-2">GRATUIT</span>
           )}
        </div>

        <div className="space-y-4">
          {isPremium ? (
             <Button onClick={onManageSub} variant="outline" className="w-full gap-2">
               <Settings size={18}/> Gérer mon abonnement
             </Button>
          ) : (
             <Button onClick={() => window.location.href = STRIPE_PAYMENT_LINK} className="w-full gap-2">
               <Star size={18}/> Passer Premium
             </Button>
          )}
          
          <Button onClick={onLogout} variant="danger" className="w-full gap-2">
             <LogOut size={18}/> Se déconnecter
          </Button>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-50 text-xs text-slate-400">
          <p>Besoin d'aide ? Répondez simplement à cet email.</p>
          <p className="mt-2">ID: {session?.user?.id.slice(0, 8)}...</p>
        </div>
      </div>
    </div>
  );
};

const AuthView = ({ onAuthSuccess, onSwitchToLogin, isLoginMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAuth = async () => {
    if (!supabase) {
      setError("Erreur : Clés Supabase manquantes dans le fichier .env");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (isLoginMode) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error: signUpError, data } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        
        if (data?.user) {
             const { error: profileError } = await supabase.from('profiles').insert([{ id: data.user.id, is_premium: false }]);
             if (profileError && profileError.code !== '23505') console.error(profileError);
        }
      }
      onAuthSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl w-full max-w-md border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-6">{isLoginMode ? 'Connexion' : 'Inscription'}</h2>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}
        <div className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"/>
          <input type="password" placeholder="Mot de passe" value={password} onChange={e=>setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"/>
          <Button onClick={handleAuth} disabled={loading} className="w-full mt-4">{loading ? <Loader2 className="animate-spin"/> : (isLoginMode ? 'Se connecter' : "S'inscrire")}</Button>
        </div>
        <div className="mt-6 text-center text-sm"><button onClick={onSwitchToLogin} className="text-indigo-600 font-medium hover:underline">{isLoginMode ? "Créer un compte" : 'Se connecter'}</button></div>
      </div>
    </div>
  );
};

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedSign, setSelectedSign] = useState(null);
  const [session, setSession] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    // Vérifie le statut Premium
    const checkPremium = async (userId) => {
      const { data } = await supabase.from('profiles').select('is_premium').eq('id', userId).single();
      if (data && data.is_premium) {
        setIsPremium(true);
        localStorage.setItem('astro_premium', 'true');
      }
    };

    // Gestion de la session (Connexion / Déconnexion)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        checkPremium(session.user.id);
      } else {
        setIsPremium(false);
        localStorage.removeItem('astro_premium');
      }
    });

    // Auto-refresh pour débloquer le contenu après paiement (toutes les 4 sec)
    const interval = setInterval(() => {
      if (session?.user && !isPremium) {
        checkPremium(session.user.id);
      }
    }, 4000); 

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [session, isPremium]);

  const handleSelectSign = (sign) => {
    setSelectedSign(sign);
    setCurrentView('read');
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setCurrentView('home'); 
    setIsMenuOpen(false);
    setIsPremium(false);
    localStorage.removeItem('astro_premium');
  };

  const handleManageSubscription = () => {
    if (session?.user?.email) {
       window.location.href = `${STRIPE_PORTAL_LINK}?prefilled_email=${encodeURIComponent(session.user.email)}`;
    } else {
       window.location.href = STRIPE_PORTAL_LINK;
    }
  };

  const handleSubscribe = () => {
    const finalLink = session ? `${STRIPE_PAYMENT_LINK}?client_reference_id=${session.user.id}` : STRIPE_PAYMENT_LINK;
    window.location.href = finalLink; 
  };

  const Header = () => (
    <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div onClick={() => setCurrentView('home')} className="flex items-center gap-2 cursor-pointer">
          <Moon className="text-indigo-600 fill-indigo-600" size={20} />
          <span className="font-serif font-bold text-xl tracking-tight">AstroWeekly</span>
        </div>
        <div className="hidden md:flex items-center gap-4">
          {!session ? (
            <button onClick={() => setCurrentView('login')} className="text-indigo-600 font-medium text-sm">Connexion</button>
          ) : (
            <div className="flex items-center gap-3">
              {isPremium && <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full flex items-center gap-1"><Star size={10} fill="currentColor"/> PRO</span>}
              <button onClick={() => setCurrentView('profile')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-indigo-600 transition-colors">
                <User size={20}/>
              </button>
            </div>
          )}
        </div>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-slate-600">{isMenuOpen ? <X/> : <Menu/>}</button>
      </div>
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-100 p-4 shadow-lg">
          {!session ? (
            <Button onClick={() => { setCurrentView('login'); setIsMenuOpen(false); }} className="w-full">Connexion</Button>
          ) : (
            <>
             <Button onClick={() => { setCurrentView('profile'); setIsMenuOpen(false); }} variant="outline" className="w-full mb-2">Mon Profil</Button>
             <Button onClick={handleLogout} variant="ghost" className="w-full">Se déconnecter</Button>
            </>
          )}
        </div>
      )}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Header />
      <main>
        {currentView === 'home' && <HomeView onSelectSign={handleSelectSign} />}
        
        {currentView === 'read' && selectedSign && (
          <ReadingView 
            sign={selectedSign} 
            session={session} 
            isPremium={isPremium}
            onGoBack={() => setCurrentView('home')}
            onAuthReq={() => setCurrentView('login')}
            onSubscribeReq={handleSubscribe}
          />
        )}

        {currentView === 'profile' && (
          <ProfileView 
             session={session}
             isPremium={isPremium}
             onLogout={handleLogout}
             onHome={() => setCurrentView('home')}
             onManageSub={handleManageSubscription}
          />
        )}

        {(currentView === 'login' || currentView === 'signup') && (
          <AuthView 
            isLoginMode={currentView === 'login'}
            onAuthSuccess={() => setCurrentView('home')}
            onSwitchToLogin={() => setCurrentView(currentView === 'login' ? 'signup' : 'login')}
          />
        )}
      </main>
    </div>
  );
}