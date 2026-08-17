import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Scissors,
  Flame,
  Star,
  Check,
  ChevronRight,
  Filter,
  Eye,
  Calendar,
  Layers,
  Heart,
  SlidersHorizontal,
  Zap,
  Info
} from 'lucide-react';
import { STYLE_TRENDS } from '../home/mockData';

export default function ExploreStylesPage({ onNavigate, onBookStyle }) {
  const [selectedGender, setSelectedGender] = useState('all'); // 'all' | 'men' | 'women'
  const [selectedFaceShape, setSelectedFaceShape] = useState('all'); // 'all' | 'Oval' | 'Square' | 'Round' | 'Heart'
  const [selectedHairType, setSelectedHairType] = useState('all'); // 'all' | 'Straight' | 'Wavy' | 'Curly'
  const [aiMatchModal, setAiMatchModal] = useState(false);
  const [analyzingAi, setAnalyzingAi] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState(null);

  // Filters logic
  const filteredStyles = useMemo(() => {
    return STYLE_TRENDS.filter((style) => {
      if (selectedGender !== 'all' && style.gender !== selectedGender) return false;
      if (selectedFaceShape !== 'all' && !style.faceShape.includes(selectedFaceShape) && !style.faceShape.includes('All Face Shapes')) {
        return false;
      }
      if (selectedHairType !== 'all' && !style.hairType.includes(selectedHairType)) {
        return false;
      }
      return true;
    });
  }, [selectedGender, selectedFaceShape, selectedHairType]);

  const handleRunAiRecommendation = () => {
    setAnalyzingAi(true);
    setTimeout(() => {
      setAnalyzingAi(false);
      setAiRecommendation(STYLE_TRENDS[0]);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 antialiased">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              id="btn-back-from-styles"
              onClick={() => onNavigate('home')}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95 transition-all"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">Explore 2025 Style Trends</h1>
                <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-600 fill-amber-500" /> Hot Looks
                </span>
              </div>
              <p className="text-xs text-slate-500">Trending haircuts, beard styling & hair coloring lookbook</p>
            </div>
          </div>

          <button
            onClick={() => setAiMatchModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Style Matcher</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-5">
        
        {/* Banner Section */}
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 sm:p-8 mb-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="relative z-10 max-w-lg">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-300 bg-white/10 px-2.5 py-1 rounded-full mb-3 border border-white/20">
              <Sparkles className="w-3 h-3" /> Lookbook Studio
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              Find Your Signature Look
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 font-normal mb-4">
              Browse top trending hairstyles for Indian face shapes, curated by celebrity master stylists in your city.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setAiMatchModal(true)}
                className="px-4 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-blue-50 shadow-md active:scale-95 transition-all"
              >
                Match By Face Shape
              </button>
              <button
                onClick={() => {
                  setSelectedGender('men');
                }}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20"
              >
                Men's Fades & Crops
              </button>
              <button
                onClick={() => {
                  setSelectedGender('women');
                }}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20"
              >
                Women's Layers & Balayage
              </button>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 mb-6 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            
            {/* Gender Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              {['all', 'men', 'women'].map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGender(g)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                    selectedGender === g
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {g === 'all' ? 'All Styles' : g === 'men' ? 'Men Only' : 'Women Only'}
                </button>
              ))}
            </div>

            {/* Quick Count */}
            <span className="text-xs text-slate-500 font-medium">
              Showing <strong>{filteredStyles.length}</strong> styles
            </span>
          </div>

          {/* Secondary Attribute Filters */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Face Shape:
            </span>
            {['all', 'Oval', 'Square', 'Round', 'Heart'].map((shape) => (
              <button
                key={shape}
                onClick={() => setSelectedFaceShape(shape)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  selectedFaceShape === shape
                    ? 'bg-blue-100 text-blue-800 font-bold'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {shape === 'all' ? 'Any Shape' : shape}
              </button>
            ))}
          </div>
        </div>

        {/* Styles Lookbook Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {filteredStyles.map((style) => (
            <div
              key={style.id}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
            >
              {/* Photo */}
              <div className="h-52 w-full overflow-hidden bg-slate-100 relative">
                <img
                  src={style.image}
                  alt={style.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                  {style.tags.map((t) => (
                    <span key={t} className="text-[10px] font-bold bg-black/50 backdrop-blur-md text-white px-2 py-0.5 rounded-md border border-white/20">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-xs">
                  <span className="font-bold">₹{style.price}</span>
                  <span className="text-[11px] opacity-90">{style.duration}</span>
                </div>
              </div>

              {/* Details */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 mb-1">
                    <Scissors className="w-3 h-3" />
                    <span>{style.category}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                    {style.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {style.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1 text-[10px]">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      Best on: {style.faceShape.join(', ')}
                    </span>
                  </div>
                </div>

                {/* Book This Look CTA */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-500">
                    Recommended: <strong className="text-slate-800">{style.recommendedBarber}</strong>
                  </div>
                  <button
                    onClick={() => {
                      onNavigate('book-appointment', {
                        initialSalonId: style.recommendedSalonId || 'looks-salon',
                        preselectedService: {
                          id: style.id,
                          name: style.name,
                          price: style.price,
                          duration: style.duration,
                          category: style.category.toLowerCase(),
                        },
                      });
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
                  >
                    <span>Book Look</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>

      </main>

      {/* AI Face Shape Matcher Modal */}
      {aiMatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2 text-indigo-600">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">AI Face Shape & Style Matcher</h3>
              </div>
              <button
                onClick={() => {
                  setAiMatchModal(false);
                  setAiRecommendation(null);
                }}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {!aiRecommendation ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-600">
                  Select your facial structure to let our AI engine recommend the most flattering haircuts and beard styles:
                </p>

                {/* Face Shape Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Select Your Face Shape</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'Oval', label: 'Oval (Balanced, versatile)' },
                      { id: 'Square', label: 'Square (Sharp jawline)' },
                      { id: 'Round', label: 'Round (Soft curves)' },
                      { id: 'Heart', label: 'Heart (Wider forehead)' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setSelectedFaceShape(f.id)}
                        className={`p-3 rounded-xl border text-xs text-left transition-all ${
                          selectedFaceShape === f.id
                            ? 'bg-blue-50 border-blue-500 font-bold text-blue-900 ring-1 ring-blue-400'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span>{f.id}</span>
                        <span className="block text-[10px] font-normal text-slate-500">{f.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleRunAiRecommendation}
                  disabled={analyzingAi}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {analyzingAi ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Analyzing Facial Geometry...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Find My Perfect Style</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center animate-in fade-in duration-200">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-black text-slate-900">Recommended Match for {selectedFaceShape} Face:</h4>
                <p className="text-base font-extrabold text-blue-600 mt-1 mb-2">{aiRecommendation.name}</p>
                <div className="w-36 h-36 rounded-2xl overflow-hidden mx-auto mb-3 border-2 border-indigo-200 shadow-md">
                  <img src={aiRecommendation.image} alt={aiRecommendation.name} className="w-full h-full object-cover" />
                </div>
                <p className="text-xs text-slate-600 mb-4">{aiRecommendation.description}</p>
                <button
                  onClick={() => {
                    setAiMatchModal(false);
                    onNavigate('book-appointment', {
                      initialSalonId: aiRecommendation.recommendedSalonId,
                      preselectedService: {
                        id: aiRecommendation.id,
                        name: aiRecommendation.name,
                        price: aiRecommendation.price,
                        duration: aiRecommendation.duration,
                      },
                    });
                  }}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                >
                  Book This Recommended Look (₹{aiRecommendation.price})
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
