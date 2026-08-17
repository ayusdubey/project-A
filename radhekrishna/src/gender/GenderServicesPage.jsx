import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Scissors,
  Sparkles,
  CheckCircle2,
  Plus,
  Check,
  Clock,
  Star,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  Filter,
  Tag,
  UserCheck
} from 'lucide-react';
import { INITIAL_SALONS } from '../home/mockData';

const MENS_SERVICES = [
  {
    id: 'm-1',
    category: 'Haircut & Styling',
    name: 'Executive Fade & Textured Haircut',
    duration: '35 mins',
    price: 249,
    originalPrice: 350,
    rating: 4.9,
    description: 'Precision clipper fade, scissor texturizing, deep head wash & matte clay finish.',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=500&q=80',
    popular: true,
  },
  {
    id: 'm-2',
    category: 'Beard Grooming',
    name: 'Royal Beard Sculpt & Hot Towel Steam',
    duration: '25 mins',
    price: 199,
    originalPrice: 280,
    rating: 4.8,
    description: 'Sharp razor lines, symmetrical length trimming, steam infused with eucalyptus oils & beard balm.',
    image: 'https://images.unsplash.com/photo-1622288432450-277d0fef5ed6?auto=format&fit=crop&w=500&q=80',
    popular: true,
  },
  {
    id: 'm-3',
    category: 'Facial & Skin',
    name: 'Activated Charcoal Pollution Detox Facial',
    duration: '45 mins',
    price: 699,
    originalPrice: 999,
    rating: 4.7,
    description: 'Pore decongestion, blackhead suction, walnut scrub & hydrating aloe-vera cooling pack.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80',
    popular: false,
  },
  {
    id: 'm-4',
    category: 'Hair Color',
    name: 'Grey Coverage / Muted Moustache & Beard Color',
    duration: '30 mins',
    price: 349,
    originalPrice: 499,
    rating: 4.8,
    description: 'Ammonia-free organic color blend for 100% natural-looking coverage without staining skin.',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=80',
    popular: false,
  },
  {
    id: 'm-5',
    category: 'Hair Spa',
    name: 'Anti-Dandruff Tea Tree Scalp Therapy & Massage',
    duration: '45 mins',
    price: 599,
    originalPrice: 850,
    rating: 4.9,
    description: 'Scalp micro-exfoliation, tea tree cooling mask, high frequency treatment & neck pressure point therapy.',
    image: 'https://images.unsplash.com/photo-1517832606589-7629c3397143?auto=format&fit=crop&w=500&q=80',
    popular: true,
  },
  {
    id: 'm-pkg-1',
    category: 'Combos & Packages',
    name: 'The Gentleman’s Executive Combo (Cut + Beard + Head Spa)',
    duration: '75 mins',
    price: 899,
    originalPrice: 1400,
    rating: 5.0,
    description: 'Our #1 combo for men. Includes Haircut, Beard Trim with Hot Steam & Relaxing Scalp Massage.',
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=500&q=80',
    popular: true,
    isCombo: true,
  }
];

const WOMENS_SERVICES = [
  {
    id: 'w-1',
    category: 'Haircut & Styling',
    name: 'Korean Butterfly Layer Cut & Blowdry',
    duration: '50 mins',
    price: 499,
    originalPrice: 799,
    rating: 4.9,
    description: 'Dimensional face-framing layers, luxury shampoo wash, split-end trimming & volumizing blowout.',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=500&q=80',
    popular: true,
  },
  {
    id: 'w-2',
    category: 'Facial & Skin',
    name: 'O3+ Instant Glow & Pigmentation Facial',
    duration: '60 mins',
    price: 1199,
    originalPrice: 1699,
    rating: 4.9,
    description: 'Multi-step derma glow treatment to lift tan, diminish dark spots and infuse skin with bioactive oxygen.',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=500&q=80',
    popular: true,
  },
  {
    id: 'w-3',
    category: 'Hair Color',
    name: 'Balayage / Caramel Ombre Highlights',
    duration: '150 mins',
    price: 2499,
    originalPrice: 3499,
    rating: 4.8,
    description: 'Seamless hand-painted dimension with Olaplex bond repair infusion and custom gloss toner.',
    image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=500&q=80',
    popular: true,
  },
  {
    id: 'w-4',
    category: 'Waxing & Threading',
    name: 'Rica Italian White Chocolate Waxing (Full Body)',
    duration: '60 mins',
    price: 1299,
    originalPrice: 1899,
    rating: 4.8,
    description: 'Painless liposoluble wax with soothing pre-gel, nourishing oils and zero redness guarantee.',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=500&q=80',
    popular: true,
  },
  {
    id: 'w-5',
    category: 'Mani-Pedi & Nails',
    name: 'Aroma Rose Petal Pedicure + Gel Polish',
    duration: '50 mins',
    price: 599,
    originalPrice: 899,
    rating: 4.8,
    description: 'Warm rose milk soak, dead skin buffing, cuticle nourishment & long-lasting chip-free gel polish.',
    image: 'https://images.unsplash.com/photo-1629731602701-44aa0a202758?auto=format&fit=crop&w=500&q=80',
    popular: false,
  },
  {
    id: 'w-pkg-1',
    category: 'Combos & Packages',
    name: 'Weekend Goddess Glow Package (Cut + O3+ Facial + Rica Wax)',
    duration: '120 mins',
    price: 1899,
    originalPrice: 3200,
    rating: 5.0,
    description: 'Complete head-to-toe makeover: Haircut & Blowdry, O3+ Radiant Facial, and Full Arms Rica Wax.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=500&q=80',
    popular: true,
    isCombo: true,
  }
];

export default function GenderServicesPage({
  initialGender = 'men',
  onNavigate,
  onStartBooking,
}) {
  const [activeGender, setActiveGender] = useState(initialGender);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItems, setSelectedItems] = useState([]);

  const servicesList = activeGender === 'men' ? MENS_SERVICES : WOMENS_SERVICES;

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set(servicesList.map((s) => s.category));
    return ['all', ...Array.from(set)];
  }, [servicesList]);

  const filteredServices = useMemo(() => {
    if (selectedCategory === 'all') return servicesList;
    return servicesList.filter((s) => s.category === selectedCategory);
  }, [servicesList, selectedCategory]);

  const toggleItemSelection = (service) => {
    if (selectedItems.some((item) => item.id === service.id)) {
      setSelectedItems(selectedItems.filter((item) => item.id !== service.id));
    } else {
      setSelectedItems([...selectedItems, service]);
    }
  };

  const totalPrice = selectedItems.reduce((acc, item) => acc + item.price, 0);

  const handleProceedToBook = () => {
    const targetSalon = INITIAL_SALONS[0];
    if (onStartBooking) {
      onStartBooking(targetSalon, selectedItems[0] || null);
    } else {
      onNavigate('salon-detail', {
        salonId: targetSalon.id,
        preselectedServices: selectedItems,
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 antialiased selection:bg-blue-600 selection:text-white">
      
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              id="btn-back-from-gender"
              onClick={() => onNavigate('home')}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95 transition-all"
              aria-label="Back to home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                {activeGender === 'men' ? 'Men’s Grooming & Salon' : 'Women’s Beauty & Salon'}
              </h1>
              <p className="text-xs text-slate-500">
                Select your preferred services and book at top verified salons
              </p>
            </div>
          </div>

          {/* Gender Switcher in Header */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => {
                setActiveGender('men');
                setSelectedCategory('all');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeGender === 'men'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              For Men
            </button>
            <button
              onClick={() => {
                setActiveGender('women');
                setSelectedCategory('all');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeGender === 'women'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              For Women
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-5 space-y-6">
        
        {/* Banner */}
        <div className={`p-6 sm:p-7 rounded-3xl text-white relative overflow-hidden shadow-lg ${
          activeGender === 'men'
            ? 'bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900'
            : 'bg-gradient-to-r from-purple-900 via-pink-800 to-rose-700'
        }`}>
          <div className="relative z-10 max-w-md">
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest bg-white/20 backdrop-blur-md px-3 py-1 rounded-full mb-2">
              <Sparkles className="w-3 h-3 text-amber-300" />
              {activeGender === 'men' ? 'Tailored Men’s Salon Care' : 'Luxury Beauty & Styling'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              {activeGender === 'men'
                ? 'Sharp Cuts, Smooth Beards & Relaxing Spas'
                : 'Flawless Haircuts, Radiant Facials & Makeover'}
            </h2>
            <p className="text-xs text-slate-200 mt-1.5 leading-relaxed">
              Choose from individual services or save big with bundled executive combos.
            </p>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap capitalize transition-all ${
                selectedCategory === cat
                  ? activeGender === 'men'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-pink-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Services' : cat}
            </button>
          ))}
        </div>

        {/* Services List */}
        <div className="space-y-3.5">
          {filteredServices.map((service) => {
            const isSelected = selectedItems.some((i) => i.id === service.id);

            return (
              <div
                key={service.id}
                id={`gender-service-${service.id}`}
                className={`bg-white rounded-3xl border p-4 sm:p-5 transition-all flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center ${
                  isSelected
                    ? activeGender === 'men'
                      ? 'border-blue-600 bg-blue-50/20 shadow-md ring-1 ring-blue-500'
                      : 'border-pink-600 bg-pink-50/20 shadow-md ring-1 ring-pink-500'
                    : 'border-slate-200/90 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex gap-3.5 items-start">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover flex-shrink-0 bg-slate-100"
                    loading="lazy"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {service.category}
                      </span>
                      {service.popular && (
                        <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                          Top Choice
                        </span>
                      )}
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{service.rating}</span>
                      </div>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {service.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-lg leading-relaxed">
                      {service.description}
                    </p>

                    <div className="mt-2 flex items-center gap-3 text-xs">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {service.duration}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side: Price & Toggle Add */}
                <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="sm:text-right">
                    <span className="text-base sm:text-lg font-black text-slate-900 block">
                      ₹{service.price}
                    </span>
                    {service.originalPrice && (
                      <span className="text-xs text-slate-400 line-through">
                        ₹{service.originalPrice}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => toggleItemSelection(service)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? activeGender === 'men'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-pink-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Selected</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Book</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </main>

      {/* Floating Bottom Bar when items are selected */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-4 left-0 right-0 z-40 px-4">
          <div className="max-w-xl mx-auto bg-slate-900 text-white rounded-3xl p-4 shadow-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  {selectedItems.length} {selectedItems.length === 1 ? 'service' : 'services'}
                </span>
                <span className="text-xs text-slate-300">Total payable:</span>
              </div>
              <span className="text-lg font-black text-white">₹{totalPrice}</span>
            </div>

            <button
              onClick={handleProceedToBook}
              className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm text-white flex items-center gap-2 active:scale-95 shadow-md transition-all ${
                activeGender === 'men' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-pink-600 hover:bg-pink-700'
              }`}
            >
              <span>Select Salon & Slot</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
