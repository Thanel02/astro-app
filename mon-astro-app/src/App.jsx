import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Moon, 
  Sun, 
  Lock, 
  ChevronRight, 
  User, 
  Check, 
  Sparkles, 
  ArrowLeft,
  Menu,
  X
} from 'lucide-react';

// --- DONNÉES SIMULÉES (Ce que n8n + Gemini généreraient dans votre BDD) ---
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
  intro: "Cette semaine marque un tournant décisif. Les énergies planétaires s'alignent pour offrir une clarté nouvelle sur vos projets personnels. Mars vous donne l'impulsion nécessaire pour commencer ce que vous repoussez depuis des mois.",
  love: "Côté cœur, Vénus adoucit les tensions. Si vous êtes en couple, privilégiez le dialogue mardi soir, moment propice aux confidences. Célibataire ? Une rencontre inattendue dans un cadre professionnel pourrait bien bousculer vos certitudes.",
  work: "Au travail, la patience sera votre meilleure alliée. Ne cherchez pas à forcer les portes fermées. Une opportunité financière se dessine vers jeudi, restez attentif aux détails des contrats.",
  premium_content: {
    advice: "Conseil spirituel : Prenez le temps de méditer sur vos racines. L'ancrage est essentiel cette semaine pour ne pas vous disperser.",
    lucky_numbers: "7, 12, 24, 33",
    compatibility: "Meilleure entente avec : Balance et Verseau. Évitez les conflits avec le Capricorne.",
    detailed_forecast: "En profondeur : La rétrogradation de Mercure influence votre secteur de la communication intime. C'est le moment de dire ce que vous avez sur le cœur, mais avec diplomatie. Votre énergie vitale remonte en flèche dès vendredi, profitez-en pour reprendre une activité physique."
  }
};

// --- COMPOSANTS UI ---

const Button = ({ children, onClick, variant = 'primary', className = '' }) => {
  const baseStyle = "px-6 py-3 rounded-full font-medium transition-all duration-300 transform active:scale-95 shadow-sm";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 hover:shadow-lg",
    secondary: "bg-white text-indigo-900 border border-indigo-100 hover:border-indigo-300",
    outline: "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50",
    ghost: "text-slate-500 hover:text-indigo-600 hover:bg-slate-50"
  };

  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Card = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 ${className}`}
  >
    {children}
  </div>
);

// --- VUES PRINCIPALES ---

// 1. Vue Accueil (Grille des signes)
const HomeView = ({ onSelectSign }) => (
  <div className="max-w-5xl mx-auto px-4 py-12">
    <div className="text-center mb-16 space-y-4">
      <h1 className="text-4xl md:text-5xl font-serif text-slate-900 tracking-tight">
        Astro<span className="text-indigo-600">Weekly</span>
      </h1>
      <p className="text-slate-500 text-lg max-w-xl mx-auto">
        Votre guidance hebdomadaire, générée par l'intelligence artificielle, alignée avec les astres.
      </p>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {ZODIAC_SIGNS.map((sign) => (
        <Card 
          key={sign.id} 
          onClick={() => onSelectSign(sign)}
          className="cursor-pointer group hover:-translate-y-1 flex flex-col items-center justify-center text-center py-8"
        >
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300 text-indigo-900">
            {sign.icon}
          </div>
          <h3 className="text-xl font-medium text-slate-800">{sign.name}</h3>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">{sign.dates}</p>
        </Card>
      ))}
    </div>
  </div>
);

// 2. Vue Lecture (Avec le Paywall partiel)
const ReadingView = ({ sign, isPremium, onGoBack, onSubscribeClick }) => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button 
        onClick={onGoBack}
        className="flex items-center text-slate-400 hover:text-indigo-600 mb-8 transition-colors"
      >
        <ArrowLeft size={18} className="mr-2" /> Retour aux signes
      </button>

      <div className="text-center mb-10">
        <div className="text-6xl mb-4 text-indigo-900">{sign.icon}</div>
        <h2 className="text-3xl font-serif text-slate-900 mb-2">{sign.name}</h2>
        <p className="text-indigo-600 font-medium">Horoscope de la semaine</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* En-tête de l'article */}
        <div className="p-8 pb-4">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-500 uppercase tracking-widest mb-4">
            <Sparkles size={14} />
            <span>Énergies Générales</span>
          </div>
          <p className="text-slate-700 leading-relaxed text-lg mb-6">
            {MOCK_HOROSCOPE.intro}
          </p>

          <h3 className="text-xl font-medium text-slate-900 mb-3 mt-8 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 text-xs">♥</span>
            Amour & Relations
          </h3>
          <p className="text-slate-600 leading-relaxed">
            {MOCK_HOROSCOPE.love}
          </p>
        </div>

        {/* SECTION PAYWALL / CONTENU FLOU */}
        <div className="relative">
          {/* Contenu visible ou flouté */}
          <div className={`p-8 pt-0 transition-all duration-500 ${!isPremium ? 'opacity-30 blur-[2px] select-none h-32 overflow-hidden' : ''}`}>
             <h3 className="text-xl font-medium text-slate-900 mb-3 mt-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500 text-xs">$</span>
              Travail & Argent
            </h3>
            <p className="text-slate-600 leading-relaxed mb-6">
              {MOCK_HOROSCOPE.work}
            </p>

            {/* Contenu Premium uniquement */}
            <div className="bg-indigo-50 rounded-xl p-6 mt-8 border border-indigo-100">
               <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
                 <Lock size={16} className={isPremium ? "hidden" : "inline"}/>
                 <span className={!isPremium ? "blur-sm" : ""}>Guide Astral Privé</span>
               </h3>
               <div className="space-y-4 text-indigo-800">
                  <p><strong>Conseil :</strong> {MOCK_HOROSCOPE.premium_content.advice}</p>
                  <p><strong>Détails :</strong> {MOCK_HOROSCOPE.premium_content.detailed_forecast}</p>
                  <p><strong>Numéros :</strong> {MOCK_HOROSCOPE.premium_content.lucky_numbers}</p>
               </div>
            </div>
          </div>

          {/* OVERLAY D'INCITATION (Si pas premium) */}
          {!isPremium && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-8 bg-gradient-to-t from-white via-white/90 to-transparent">
              <div className="text-center p-6 max-w-sm mx-auto animate-fade-in-up">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-indigo-200">
                  <Lock size={20} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Débloquez votre destinée</h3>
                <p className="text-slate-500 mb-6 text-sm">
                  Accédez à vos prévisions complètes, vos numéros chance et les conseils personnalisés.
                </p>
                <Button onClick={onSubscribeClick} className="w-full">
                  Lire la suite
                </Button>
                <p className="mt-3 text-xs text-slate-400">À partir de 2.99€ / mois</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 3. Vue Authentification (Connexion/Inscription)
const AuthView = ({ onAuthSuccess, onSwitchToLogin, isLoginMode }) => (
  <div className="flex items-center justify-center min-h-[60vh] px-4">
    <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl w-full max-w-md border border-slate-100">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">
          {isLoginMode ? 'Bon retour parmi nous' : 'Créez votre compte'}
        </h2>
        <p className="text-slate-500 mt-2">
          {isLoginMode ? 'Connectez-vous pour voir vos astres.' : 'Pour sauvegarder votre profil astral.'}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input type="email" placeholder="votre@email.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
          <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all" />
        </div>
        
        <Button onClick={onAuthSuccess} className="w-full mt-4">
          {isLoginMode ? 'Se connecter' : "S'inscrire gratuitement"}
        </Button>
      </div>

      <div className="mt-6 text-center text-sm text-slate-500">
        {isLoginMode ? 'Pas encore de compte ?' : 'Déjà un compte ?'}{' '}
        <button onClick={onSwitchToLogin} className="text-indigo-600 font-medium hover:underline">
          {isLoginMode ? "S'inscrire" : 'Se connecter'}
        </button>
      </div>
    </div>
  </div>
);

// 4. Vue Abonnement (Pricing)
const SubscribeView = ({ onSubscribe, onSkip }) => (
  <div className="max-w-4xl mx-auto px-4 py-12">
    <div className="text-center mb-12">
      <span className="text-indigo-600 font-bold tracking-wider text-sm uppercase">Premium</span>
      <h2 className="text-3xl md:text-4xl font-serif text-slate-900 mt-2 mb-4">Illuminez votre chemin</h2>
      <p className="text-slate-500 max-w-lg mx-auto">
        Obtenez des prévisions détaillées chaque semaine, générées spécifiquement pour vous par notre IA astrologique.
      </p>
    </div>

    <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
      {/* Plan Gratuit (Rappel) */}
      <div className="p-8 rounded-3xl border border-slate-200 bg-slate-50 opacity-70">
        <h3 className="text-xl font-bold text-slate-900 mb-2">Explorateur</h3>
        <div className="text-3xl font-serif mb-6">Gratuit</div>
        <ul className="space-y-3 mb-8 text-slate-600">
          <li className="flex items-center gap-2"><Check size={18} /> Aperçu de la semaine</li>
          <li className="flex items-center gap-2"><Check size={18} /> Profil astral de base</li>
          <li className="flex items-center gap-2 text-slate-400"><X size={18} /> Prévisions détaillées</li>
        </ul>
        <Button variant="secondary" onClick={onSkip} className="w-full">
          Continuer en gratuit
        </Button>
      </div>

      {/* Plan Premium */}
      <div className="p-8 rounded-3xl border-2 border-indigo-600 bg-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAIRE</div>
        <h3 className="text-xl font-bold text-indigo-900 mb-2">Initié</h3>
        <div className="text-3xl font-serif mb-1">2.99€ <span className="text-sm text-slate-400 font-sans">/mois</span></div>
        <p className="text-xs text-indigo-500 font-medium mb-6">Annulable à tout moment</p>
        
        <ul className="space-y-3 mb-8 text-slate-700">
          <li className="flex items-center gap-2 font-medium"><Check size={18} className="text-indigo-600"/> Horoscope complet</li>
          <li className="flex items-center gap-2 font-medium"><Check size={18} className="text-indigo-600"/> Conseils personnalisés</li>
          <li className="flex items-center gap-2 font-medium"><Check size={18} className="text-indigo-600"/> Compatibilité amoureuse</li>
        </ul>
        <Button onClick={onSubscribe} className="w-full">
          Commencer l'essai gratuit
        </Button>
      </div>
    </div>
  </div>
);

// --- APP COMPONENT ---

export default function App() {
  // Gestion d'état
  const [currentView, setCurrentView] = useState('home'); // 'home', 'read', 'login', 'signup', 'subscribe'
  const [selectedSign, setSelectedSign] = useState(null);
  const [userStatus, setUserStatus] = useState({ loggedIn: false, premium: false });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Navigation handlers
  const handleSelectSign = (sign) => {
    setSelectedSign(sign);
    setCurrentView('read');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribeClick = () => {
    if (userStatus.loggedIn) {
      setCurrentView('subscribe');
    } else {
      setCurrentView('signup');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = () => {
    setUserStatus(prev => ({ ...prev, loggedIn: true }));
    setCurrentView('subscribe'); // Après connexion/inscription, on pousse l'abonnement
  };

  const handleSubscriptionSuccess = () => {
    setUserStatus(prev => ({ ...prev, premium: true }));
    setCurrentView('read'); // Retour à la lecture, maintenant débloquée
  };

  const handleLogoClick = () => {
    setCurrentView('home');
    setSelectedSign(null);
    setIsMenuOpen(false);
  };

  // Header Component
  const Header = () => (
    <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div onClick={handleLogoClick} className="flex items-center gap-2 cursor-pointer">
          <Moon className="text-indigo-600 fill-indigo-600" size={20} />
          <span className="font-serif font-bold text-xl tracking-tight">AstroWeekly</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-4">
          {!userStatus.loggedIn ? (
            <>
              <button 
                onClick={() => setCurrentView('login')}
                className="text-slate-600 hover:text-indigo-600 font-medium text-sm px-3 py-2"
              >
                Connexion
              </button>
              <Button onClick={() => setCurrentView('signup')} className="px-5 py-2 text-sm">
                S'abonner
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              {userStatus.premium && (
                <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full border border-amber-200 flex items-center gap-1">
                  <Star size={10} fill="currentColor"/> PREMIUM
                </span>
              )}
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                <User size={16} />
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-slate-600">
          {isMenuOpen ? <X size={24}/> : <Menu size={24}/>}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-100 p-4 flex flex-col gap-4 shadow-lg">
          {!userStatus.loggedIn ? (
            <>
              <Button variant="secondary" onClick={() => { setCurrentView('login'); setIsMenuOpen(false); }} className="w-full">
                Connexion
              </Button>
              <Button onClick={() => { setCurrentView('signup'); setIsMenuOpen(false); }} className="w-full">
                S'abonner
              </Button>
            </>
          ) : (
            <div className="text-center py-4 text-slate-600 font-medium border-t border-slate-50">
              Connecté en tant que membre {userStatus.premium ? 'Premium' : 'Gratuit'}
            </div>
          )}
        </div>
      )}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Header />

      <main>
        {currentView === 'home' && (
          <HomeView onSelectSign={handleSelectSign} />
        )}
        
        {currentView === 'read' && selectedSign && (
          <ReadingView 
            sign={selectedSign} 
            isPremium={userStatus.premium} 
            onGoBack={() => setCurrentView('home')}
            onSubscribeClick={handleSubscribeClick}
          />
        )}

        {(currentView === 'login' || currentView === 'signup') && (
          <AuthView 
            isLoginMode={currentView === 'login'}
            onAuthSuccess={handleAuthSuccess}
            onSwitchToLogin={() => setCurrentView(currentView === 'login' ? 'signup' : 'login')}
          />
        )}

        {currentView === 'subscribe' && (
          <SubscribeView 
            onSubscribe={handleSubscriptionSuccess}
            onSkip={() => {
              // Si on skip, on retourne à la lecture mais toujours en mode non-premium
              setCurrentView(selectedSign ? 'read' : 'home');
            }}
          />
        )}
      </main>

      {/* Footer minimaliste */}
      <footer className="py-8 text-center text-slate-400 text-sm">
        <p>&copy; 2024 AstroWeekly. Fait avec les étoiles.</p>
        <div className="flex justify-center gap-4 mt-2">
          <span className="hover:text-slate-600 cursor-pointer">Conditions</span>
          <span className="hover:text-slate-600 cursor-pointer">Confidentialité</span>
        </div>
      </footer>
    </div>
  );
}