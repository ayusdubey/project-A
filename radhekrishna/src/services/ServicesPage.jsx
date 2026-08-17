import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  Scissors,
  Sparkles,
  Palette,
  Flame,
  LayoutGrid,
  Clock,
  Star,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Filter,
  ArrowRight,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { ALL_SERVICES_EXTENDED, INITIAL_SALONS } from '../home/mockData';

// Extended catalog with curated specific services
const DETAILED_SERVICES_CATALOG = [
  {
    id: 'haircut-men',
    category: 'haircut',
    name: 'Classic Fade & Precision Haircut',
    gender: 'men',
    duration: '35 mins',
    price: 249,
    originalPrice: 350,
    rating: 4.8,
    reviewsCount: 1420,
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
    description: 'Customized precision fade cut, hair wash, scalp massage & texturizing styling with matte pomade.',
    included: ['Consultation & face shape matching', 'Shampoo & conditioning wash', 'Razor edge lineup', 'Styling product application'],
    popular: true,
  },
  {
    id: 'haircut-women',
    category: 'haircut',
    name: 'Advanced Layer Cut & Blowdry',
    gender: 'women',
    duration: '50 mins',
    price: 499,
    originalPrice: 799,
    rating: 4.9,
    reviewsCount: 2310,
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
    description: 'Feather/Korean/Butterfly layers tailored to hair density with luxury wash, serum and blow-dry bounce.',
    included: ['Hair health evaluation', 'Deep conditioning shampoo', 'Layer styling & split-end removal', 'Heat protectant & bounce blowout'],
    popular: true,
  },
  {
    id: 'beard-grooming',
    category: 'beard',
    name: 'Beard Sculpting & Hot Towel Steam',
    gender: 'men',
    duration: '30 mins',
    price: 199,
    originalPrice: 299,
    rating: 4.8,
    reviewsCount: 980,
    image: 'https://images.unsplash.com/photo-1622288432450-277d0fef5ed6?auto=format&fit=crop&w=600&q=80',
    description: 'Sharp scissor trimming, beard line razor shaping, herbal hot towel steam & nourishing argan oil massage.',
    included: ['Length & symmetry shaping', 'Herbal hot towel steam wrap', 'Cheek & neckline razor finish', 'Organic beard butter massage'],
    popular: true,
  },
  {
    id: 'facial-o3',
    category: 'facial',
    name: 'O3+ Instant Glow & Whitening Facial',
    gender: 'unisex',
    duration: '60 mins',
    price: 1199,
    originalPrice: 1699,
    rating: 4.9,
    reviewsCount: 1840,
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80',
    description: 'Dermatologically formulated 6-step deep facial to treat tanning, uneven skin tone, pigmentation and boost radiance.',
    included: ['Derma cleansing & micro-exfoliation', 'Pore steam & blackhead extraction', 'Bio-active brightening serum', 'Algae peel-off rubber mask'],
    popular: true,
  },
  {
    id: 'facial-charcoal',
    category: 'facial',
    name: 'Deep Cleansing Activated Charcoal Facial',
    gender: 'men',
    duration: '45 mins',
    price: 699,
    originalPrice: 999,
    rating: 4.7,
    reviewsCount: 750,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    description: 'Detoxifying treatment for pollution removal, excess oil control, clogged pores and refreshing skin tone.',
    included: ['Charcoal foam cleanse', 'Walnut scrub exfoliation', 'Pore detox pack', 'Hydrating gel finish'],
    popular: false,
  },
  {
    id: 'hair-color-global',
    category: 'hair-color',
    name: 'L’Oréal Majirel Global Hair Color',
    gender: 'unisex',
    duration: '90 mins',
    price: 1499,
    originalPrice: 2199,
    rating: 4.8,
    reviewsCount: 1120,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    description: 'Rich, ammonia-safe global root-to-tip coloring with high shine reflection and 100% gray coverage.',
    included: ['Skin sensitivity patch test', 'Color selection & consultation', 'Even brush application', 'Color lock shampoo & mask'],
    popular: true,
  },
  {
    id: 'hair-color-balayage',
    category: 'hair-color',
    name: 'Luxury Balayage / Ombre Highlights',
    gender: 'women',
    duration: '150 mins',
    price: 2499,
    originalPrice: 3499,
    rating: 4.9,
    reviewsCount: 890,
    image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=600&q=80',
    description: 'Hand-painted dimensional caramel, honey, or ash tones seamlessly blended without harsh regrowth lines.',
    included: ['Bond multiplier treatment (Olaplex)', 'Custom hand-painted sections', 'Toning gloss bath', 'Nutritive blowout styling'],
    popular: true,
  },
  {
    id: 'waxing-rica',
    category: 'waxing',
    name: 'Rica Brazilian / Liposoluble Full Wax',
    gender: 'women',
    duration: '45 mins',
    price: 799,
    originalPrice: 1199,
    rating: 4.7,
    reviewsCount: 1650,
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80',
    description: 'Italian Rica white chocolate wax formulated for sensitive skin — 98% colophony free, painless and smooth finish.',
    included: ['Pre-wax soothing gel', 'Full arms + Full legs + Underarms', 'Post-wax calming lotion', 'Sanitized single-use strips'],
    popular: true,
  },
  {
    id: 'spa-keratin',
    category: 'spa',
    name: 'Keratin Deep Nourish Hair Spa',
    gender: 'unisex',
    duration: '60 mins',
    price: 899,
    originalPrice: 1399,
    rating: 4.8,
    reviewsCount: 1320,
    image: 'https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?auto=format&fit=crop&w=600&q=80',
    description: 'Intense moisture infusion with pure botanical keratin cream, ultrasonic steam and 15-min relaxing pressure point head massage.',
    included: ['Scalp diagnosis', 'Clarifying hair wash', 'Keratin mask application', 'Warm steam penetration & back massage'],
    popular: true,
  },
  {
    id: 'mani-pedi-deluxe',
    category: 'manicure-pedicure',
    name: 'Aroma Rose Luxury Pedicure & Manicure',
    gender: 'unisex',
    duration: '65 mins',
    price: 699,
    originalPrice: 999,
    rating: 4.8,
    reviewsCount: 780,
    image: 'https://images.unsplash.com/photo-1629731602701-44aa0a202758?auto=format&fit=crop&w=600&q=80',
    description: 'Dead sea salt soak, cuticle shaping, volcanic scrub exfoliation, heel crack buffing and hydrating paraffin wrap.',
    included: ['Herbal warm water soak', 'Nail shaping & cuticle trim', 'Dead skin filing & scrub', 'Rose petal massage cream'],
    popular: false,
  },
];

export default function ServicesPage({
  initialCategory = 'all',
  onNavigate,
  onBookService,
}) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedGender, setSelectedGender] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All Services', icon: LayoutGrid },
    { id: 'haircut', name: 'Haircut & Styling', icon: Scissors },
    { id: 'beard', name: 'Beard Grooming', icon: Scissors },
    { id: 'facial', name: 'Facials & Cleanup', icon: Sparkles },
    { id: 'hair-color', name: 'Hair Color', icon: Palette },
    { id: 'waxing', name: 'Waxing & Threading', icon: Flame },
    { id: 'spa', name: 'Hair & Head Spa', icon: Sparkles },
    { id: 'manicure-pedicure', name: 'Mani & Pedi', icon: Sparkles },
  ];

  const filteredServices = useMemo(() => {
    return DETAILED_SERVICES_CATALOG.filter((service) => {
      // Category filter
      if (selectedCategory !== 'all' && service.category !== selectedCategory) {
        return false;
      }
      // Gender filter
      if (selectedGender !== 'all') {
        if (service.gender !== 'unisex' && service.gender !== selectedGender) {
          return false;
        }
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = service.name.toLowerCase().includes(q);
        const matchesDesc = service.description.toLowerCase().includes(q);
        const matchesCat = service.category.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }
      return true;
    });
  }, [selectedCategory, selectedGender, searchQuery]);

  const handleSelectServiceToBook = (service) => {
    // Pick the most relevant salon for this service
    const matchedSalon = INITIAL_SALONS[0];
    if (onBookService) {
      onBookService(matchedSalon, service);
    } else {
      onNavigate('salon-detail', {
        salonId: matchedSalon.id,
        preselectedService: service,
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 antialiased selection:bg-blue-600 selection:text-white">
      
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              id="btn-back-from-services"
              onClick={() => onNavigate('home')}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95 transition-all"
              aria-label="Back to home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Our Services Catalog
              </h1>
              <p className="text-xs text-slate-500">Pick a service to book verified specialists</p>
            </div>
          </div>

          {/* Gender Filter Chips */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold text-slate-600">
            <button
              onClick={() => setSelectedGender('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                selectedGender === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedGender('men')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                selectedGender === 'men' ? 'bg-blue-600 text-white shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Men
            </button>
            <button
              onClick={() => setSelectedGender('women')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                selectedGender === 'women' ? 'bg-pink-600 text-white shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Women
            </button>
          </div>
        </div>
      </header>

      {/* Main Services Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 space-y-5">
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by service (e.g. Keratin, Layer cut, Charcoal facial, Rica waxing)..."
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-xs sm:text-sm outline-none transition-all placeholder:text-slate-400 shadow-xs"
          />
        </div>

        {/* Category Horizontal Scroll Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-500'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>Showing <strong className="text-slate-900">{filteredServices.length}</strong> specialized services</span>
          <span className="flex items-center gap-1 text-emerald-600 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            100% Sanitized Tools & Organic Brands
          </span>
        </div>

        {/* Services List Grid */}
        {filteredServices.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center my-6">
            <Scissors className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">No Services Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              We couldn't find any services matching your filters. Try resetting the category or search query.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedGender('all');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-xs"
            >
              Show All Services
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                id={`service-item-${service.id}`}
                className="bg-white rounded-3xl border border-slate-200/90 hover:border-blue-300 shadow-xs hover:shadow-md transition-all p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-5 group"
              >
                {/* Left Portrait Image */}
                <div className="relative w-full sm:w-44 h-40 sm:h-auto rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {service.popular && (
                    <span className="absolute top-2.5 left-2.5 bg-amber-400 text-slate-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xs">
                      Popular
                    </span>
                  )}
                  <span className="absolute bottom-2.5 left-2.5 bg-black/50 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-300" />
                    {service.duration}
                  </span>
                </div>

                {/* Right Details & Action */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                            service.gender === 'women'
                              ? 'bg-pink-100 text-pink-700'
                              : service.gender === 'men'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            For {service.gender}
                          </span>
                          <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{service.rating}</span>
                            <span className="text-[10px] text-slate-400">({service.reviewsCount})</span>
                          </div>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {service.name}
                        </h3>
                      </div>

                      {/* Pricing */}
                      <div className="text-right">
                        <span className="text-base sm:text-lg font-black text-blue-700 block">
                          ₹{service.price}
                        </span>
                        {service.originalPrice && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{service.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {service.description}
                    </p>

                    {/* Included Steps list */}
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {service.included.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                          <span className="truncate">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Salon Match & Book Action */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-500" />
                      <span>Available at <strong>Looks Salon, Style Studio & 3 others</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSelectServiceToBook(service)}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>Select Salon & Book</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
