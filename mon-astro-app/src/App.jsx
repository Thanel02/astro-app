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
        
        {/* --- PARTIE GRATUITE (Augmentée) --- */}
        <div className="p-8 pb-0">
          
          {/* Intro */}
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-500 uppercase tracking-widest mb-4">
            <Sparkles size={14} /><span>Énergies</span>
          </div>
          <p className="text-slate-700 leading-relaxed text-lg mb-8">{horoscope.intro}</p>
          
          {/* Amour */}
          <h3 className="text-xl font-medium text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 text-sm">♥</span> Amour
          </h3>
          <p className="text-slate-600 leading-relaxed mb-8">{horoscope.love}</p>

          {/* Travail (Désormais GRATUIT) */}
          <h3 className="text-xl font-medium text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500 text-sm">$</span> Travail
          </h3>
          <p className="text-slate-600 leading-relaxed mb-8">{horoscope.work}</p>
        </div>

        {/* --- PARTIE VERROUILLÉE (Le "Guide Privé") --- */}
        <div className="relative p-8 pt-0">
            {/* Ce bloc contient les infos secrètes. 
                Si pas premium : on floute et on empêche la sélection. 
                Si premium : on affiche tout net. */}
            <div className={`bg-indigo-50 rounded-2xl p-6 border border-indigo-100 transition-all duration-500 ${!isPremium ? 'blur-md opacity-60 select-none' : ''}`}>
               <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
                 <Lock size={16} className={isPremium ? "hidden" : "inline"}/>
                 <span>Guide Privé & Secrets</span>
               </h3>
               
               {/* Même si flouté, on met du "faux texte" ou le vrai pour donner du volume visuel derrière le flou */}
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

            {/* Le cadenas par dessus le flou */}
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