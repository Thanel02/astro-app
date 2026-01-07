import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js'; // Import direct de la librairie
import { 
  Star, Moon, Sun, Lock, ChevronRight, User, Check, Sparkles, 
  ArrowLeft, Menu, X, LogOut, Loader2 
} from 'lucide-react';

// --- CONFIGURATION SUPABASE ---
// On initialise la connexion ici pour simplifier.
// Assurez-vous d'avoir bien créé votre fichier .env à la racine du projet avec vos clés.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// On crée le client. Si les clés manquent (ex: dans la prévisualisation), on gère l'erreur calmement.
const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// --- DONNÉES TEMPORAIRES (En attendant la Phase 4) ---
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

const MOCK_HOROSCOPE = {
  intro: "Cette semaine marque un tournant décisif. Les énergies planétaires s'alignent pour offrir une clarté nouvelle sur vos projets personnels.",
  love: "Côté cœur, Vénus adoucit les tensions. Si vous êtes en couple, privilégiez le dialogue mardi soir. Célibataire ? Une rencontre inattendue se profile.",
  work: "Au travail, la patience sera votre meilleure alliée. Une opportunité financière se dessine vers jeudi, restez attentif aux détails.",
  premium_content: {
    advice: "Prenez le temps de méditer sur vos racines. L'ancrage est essentiel cette semaine.",
    lucky_numbers: "7, 12, 24, 33",
    detailed_forecast: "La rétrogradation de Mercure influence votre secteur de la communication intime. Dites ce que vous avez sur le cœur."
  }
};

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
  <div onClick={onClick} className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 ${className}`}>
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

const ReadingView = ({ sign, session, onGoBack, onSubscribeClick }) => {
  const isPremium = !!session; 

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={onGoBack} className="flex items-center text-slate-400 hover:text-indigo-600 mb-8 transition-colors">
        <ArrowLeft size={18} className="mr-2" /> Retour
      </button>

      <div className="text-center mb-10">
        <div className="text-6xl mb-4 text-indigo-900">{sign.icon}</div>
        <h2 className="text-3xl font-serif text-slate-900 mb-2">{sign.name}</h2>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-500 uppercase tracking-widest mb-4">
            <Sparkles size={14} /><span>Énergies</span>
          </div>
          <p className="text-slate-700 leading-relaxed text-lg mb-6">{MOCK_HOROSCOPE.intro}</p>
          <h3 className="text-xl font-medium text-slate-900 mb-3 mt-8 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 text-xs">♥</span> Amour
          </h3>
          <p className="text-slate-600 leading-relaxed">{MOCK_HOROSCOPE.love}</p>
        </div>

        <div className="relative">
          <div className={`p-8 pt-0 transition-all duration-500 ${!isPremium ? 'opacity-30 blur-[2px] select-none h-32 overflow-hidden' : ''}`}>
             <h3 className="text-xl font-medium text-slate-900 mb-3 mt-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500 text-xs">$</span> Travail
            </h3>
            <p className="text-slate-600 leading-relaxed mb-6">{MOCK_HOROSCOPE.work}</p>

            <div className="bg-indigo-50 rounded-xl p-6 mt-8 border border-indigo-100">
               <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
                 <Lock size={16} className={isPremium ? "hidden" : "inline"}/>
                 <span className={!isPremium ? "blur-sm" : ""}>Guide Privé</span>
               </h3>
               <div className="space-y-4 text-indigo-800">
                  <p><strong>Conseil :</strong> {MOCK_HOROSCOPE.premium_content.advice}</p>
                  <p><strong>Numéros :</strong> {MOCK_HOROSCOPE.premium_content.lucky_numbers}</p>
               </div>
            </div>
          </div>

          {!isPremium && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-8 bg-gradient-to-t from-white via-white/90 to-transparent">
              <div className="text-center p-6 max-w-sm mx-auto animate-fade-in-up">
                <Lock size={20} className="mx-auto mb-4 text-indigo-600"/>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Débloquez votre destinée</h3>
                <Button onClick={onSubscribeClick} className="w-full">Connexion requise</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// VUE AUTHENTIFICATION RÉELLE AVEC SUPABASE
const AuthView = ({ onAuthSuccess, onSwitchToLogin, isLoginMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAuth = async () => {
    if (!supabase) {
      setError("Erreur de configuration : Les clés Supabase sont manquantes dans le fichier .env");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (isLoginMode) {
        // CONNEXION
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        // INSCRIPTION
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        else alert("Compte créé !");
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
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-6">
          {isLoginMode ? 'Connexion' : 'Inscription'}
        </h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none" 
            />
          </div>
          
          <Button onClick={handleAuth} disabled={loading} className="w-full mt-4">
            {loading ? <Loader2 className="animate-spin" /> : (isLoginMode ? 'Se connecter' : "S'inscrire")}
          </Button>
        </div>

        <div className="mt-6 text-center text-sm text-slate-500">
          <button onClick={onSwitchToLogin} className="text-indigo-600 font-medium hover:underline">
            {isLoginMode ? "Pas de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- APP PRINCIPALE ---

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedSign, setSelectedSign] = useState(null);
  const [session, setSession] = useState(null); // VRAIE SESSION SUPABASE
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Vérifier la session au chargement
  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSelectSign = (sign) => {
    setSelectedSign(sign);
    setCurrentView('read');
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setIsMenuOpen(false);
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
              <span className="text-sm text-slate-600">{session.user.email}</span>
              <button onClick={handleLogout} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><LogOut size={16}/></button>
            </div>
          )}
        </div>
        
        {/* Mobile Menu Toggle */}
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-slate-600">
          {isMenuOpen ? <X/> : <Menu/>}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-100 p-4 shadow-lg">
          {!session ? (
            <Button onClick={() => { setCurrentView('login'); setIsMenuOpen(false); }} className="w-full">Connexion</Button>
          ) : (
             <Button onClick={handleLogout} variant="ghost" className="w-full">Se déconnecter</Button>
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
            onGoBack={() => setCurrentView('home')}
            onSubscribeClick={() => setCurrentView('login')}
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