import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import {
  ArrowLeft,
  Search,
  Navigation,
  MapPin,
  Star,
  Clock,
  Phone,
  Compass,
  Car,
  Bike,
  Footprints,
  Bus,
  Layers,
  Sparkles,
  ChevronRight,
  SlidersHorizontal,
  X,
  ExternalLink,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  RotateCcw,
  List,
  Map as MapIcon,
  Crosshair,
  CheckCircle2,
  Share2,
  KeyRound,
  Filter,
  Check
} from 'lucide-react';
import { CITIES, INITIAL_SALONS } from '../home/mockData';

// Google Maps API Key resolution helper
function getInitialApiKey() {
  const envKey =
    process.env.GOOGLE_MAPS_PLATFORM_KEY ||
    (import.meta).env?.VITE_GOOGLE_MAPS_API_KEY ||
    (globalThis).GOOGLE_MAPS_PLATFORM_KEY ||
    '';
  if (envKey && envKey !== 'YOUR_API_KEY') return envKey;
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem('AAORA_GMAPS_KEY');
    if (local && local.trim()) return local.trim();
  }
  return '';
}

// Default Center Coordinates (Indore - Central Hub)
const DEFAULT_CENTER = { lat: 22.7533, lng: 75.8937 };

// Helper function to calculate straight line distance in km (Haversine formula)
function getDistanceFromLatLngInKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

// -------------------------------------------------------------------
// Component: Routes Polyline & Bounds Renderer (Google Routes API)
// -------------------------------------------------------------------
function DirectionsRouteRenderer({ origin, destination, travelMode, onRouteCalculated }) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef([]);

  useEffect(() => {
    if (!routesLib || !map || !origin || !destination) return;

    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    const modeMapping = {
      DRIVING: 'DRIVING',
      TWO_WHEELER: 'DRIVING',
      WALKING: 'WALKING',
      TRANSIT: 'TRANSIT',
    };

    const targetMode = modeMapping[travelMode] || 'DRIVING';

    routesLib.Route.computeRoutes({
      origin: { lat: origin.lat, lng: origin.lng },
      destination: { lat: destination.lat, lng: destination.lng },
      travelMode: targetMode,
      fields: ['path', 'distanceMeters', 'durationMillis', 'viewport', 'legs'],
    })
      .then(({ routes }) => {
        if (routes && routes.length > 0) {
          const route = routes[0];
          const newPolylines = route.createPolylines({
            strokeColor: '#2563eb',
            strokeWeight: 5,
            strokeOpacity: 0.85,
          });

          newPolylines.forEach((p) => p.setMap(map));
          polylinesRef.current = newPolylines;

          if (route.viewport) {
            map.fitBounds(route.viewport, {
              top: 80,
              bottom: 80,
              left: 80,
              right: 80,
            });
          }

          if (onRouteCalculated) {
            const distanceKm = (route.distanceMeters / 1000).toFixed(1);
            const durationMins = Math.round(route.durationMillis / 60000);
            onRouteCalculated({
              distanceMeters: route.distanceMeters,
              durationMillis: route.durationMillis,
              distanceKm: `${distanceKm} km`,
              durationText: `${durationMins} mins`,
              success: true,
            });
          }
        }
      })
      .catch((err) => {
        console.warn('Routes API computeRoutes fallback:', err);
        const fallbackDist = getDistanceFromLatLngInKm(
          origin.lat,
          origin.lng,
          destination.lat,
          destination.lng
        );
        if (fallbackDist !== null && onRouteCalculated) {
          const speedKmH = travelMode === 'WALKING' ? 4.5 : travelMode === 'TWO_WHEELER' ? 32 : 26;
          const estMinutes = Math.max(2, Math.round((fallbackDist / speedKmH) * 60));
          onRouteCalculated({
            distanceKm: `${fallbackDist.toFixed(1)} km`,
            durationText: `${estMinutes} mins`,
            isFallback: true,
            success: true,
          });
        }
      });

    return () => {
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
    };
  }, [routesLib, map, origin, destination, travelMode]);

  return null;
}

// -------------------------------------------------------------------
// Component: Places API Dynamic Search - STRICTLY FOR SALONS & SPAS
// -------------------------------------------------------------------
function PlacesLiveSearch({ searchQuery, mapCenter, onPlacesFound }) {
  const placesLib = useMapsLibrary('places');
  const map = useMap();

  useEffect(() => {
    if (!placesLib || !searchQuery || searchQuery.trim().length < 2) return;

    // Strictly enforce salon and spa search to prevent unrelated businesses
    const cleanQ = searchQuery.trim().toLowerCase();
    const isAlreadySalonKeyword =
      cleanQ.includes('salon') ||
      cleanQ.includes('parlour') ||
      cleanQ.includes('parlor') ||
      cleanQ.includes('barber') ||
      cleanQ.includes('spa') ||
      cleanQ.includes('hair') ||
      cleanQ.includes('beauty');

    const textQuery = isAlreadySalonKeyword
      ? `${searchQuery} salon`
      : `${searchQuery} beauty salon hair spa barber`;

    placesLib.Place.searchByText({
      textQuery,
      fields: [
        'displayName',
        'location',
        'formattedAddress',
        'rating',
        'userRatingCount',
        'regularOpeningHours',
        'photos',
        'types',
      ],
      locationBias: map?.getCenter() || mapCenter || DEFAULT_CENTER,
      maxResultCount: 8,
    })
      .then(({ places }) => {
        if (places && places.length > 0) {
          // Filter strictly for salon & beauty related places
          const salonPlaces = places.filter((p) => {
            const name = (p.displayName || '').toLowerCase();
            const types = p.types || [];
            const isSalonType =
              types.includes('hair_care') ||
              types.includes('beauty_salon') ||
              types.includes('spa') ||
              types.includes('health');
            const hasSalonName =
              name.includes('salon') ||
              name.includes('parlour') ||
              name.includes('parlor') ||
              name.includes('barber') ||
              name.includes('hair') ||
              name.includes('beauty') ||
              name.includes('spa') ||
              name.includes('makeup') ||
              name.includes('studio') ||
              name.includes('looks') ||
              name.includes('habib');
            return isSalonType || hasSalonName;
          });

          const mappedPlaces = salonPlaces.map((p, idx) => ({
            id: `gplace-${p.id || idx}`,
            name: p.displayName || 'Verified Salon Partner',
            rating: p.rating || 4.6,
            reviewsCount: p.userRatingCount || 128,
            address: p.formattedAddress || 'Nearby Address',
            lat: p.location?.lat(),
            lng: p.location?.lng(),
            image:
              p.photos && p.photos.length > 0 && typeof p.photos[0].getURI === 'function'
                ? p.photos[0].getURI({ maxWidth: 400 })
                : 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
            openingHours: p.regularOpeningHours?.weekdayDescriptions?.[0] || '09:30 AM - 09:30 PM',
            isGooglePlace: true,
            startingPrice: 299,
            amenities: ['AC', 'Sanitized Tools', 'Beverages', 'Instant Booking'],
            services: [
              { id: 's1', name: 'Signature Haircut', price: 299, duration: '30 mins' },
              { id: 's2', name: 'Beard Grooming', price: 199, duration: '20 mins' },
            ],
          }));

          onPlacesFound(mappedPlaces);
        }
      })
      .catch((err) => {
        console.warn('Places API search notice:', err);
      });
  }, [placesLib, searchQuery, mapCenter]);

  return null;
}

// -------------------------------------------------------------------
// Component: Interactive Vector Map Canvas (Fallback / High Performance)
// -------------------------------------------------------------------
function InteractiveVectorMap({
  salons,
  selectedSalon,
  onSelectSalon,
  userLocation,
  isDirectionsActive,
  travelMode,
  selectedCity,
  onRecenter,
}) {
  const containerRef = useRef(null);

  // Compute bounding box
  const bounds = useMemo(() => {
    const lats = salons.map((s) => s.lat).filter(Boolean);
    const lngs = salons.map((s) => s.lng).filter(Boolean);
    if (userLocation.lat) lats.push(userLocation.lat);
    if (userLocation.lng) lngs.push(userLocation.lng);

    if (lats.length === 0) {
      return { minLat: 22.70, maxLat: 22.80, minLng: 75.80, maxLng: 75.95 };
    }

    const minLat = Math.min(...lats) - 0.02;
    const maxLat = Math.max(...lats) + 0.02;
    const minLng = Math.min(...lngs) - 0.02;
    const maxLng = Math.max(...lngs) + 0.02;
    return { minLat, maxLat, minLng, maxLng };
  }, [salons, userLocation]);

  // Convert lat/lng to percentage in SVG viewBox
  const projectCoords = (lat, lng) => {
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng || 0.1)) * 800 + 50;
    const y = 550 - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat || 0.1)) * 500;
    return { x: Math.max(30, Math.min(870, x)), y: Math.max(30, Math.min(570, y)) };
  };

  const userPoint = userLocation.lat && userLocation.lng ? projectCoords(userLocation.lat, userLocation.lng) : null;
  const selectedPoint = selectedSalon?.lat && selectedSalon?.lng ? projectCoords(selectedSalon.lat, selectedSalon.lng) : null;

  return (
    <div ref={containerRef} className="w-full h-full min-h-[460px] lg:min-h-[600px] relative bg-slate-900 overflow-hidden select-none">
      {/* SVG Canvas Map Grid & Roads */}
      <svg className="w-full h-full absolute inset-0" viewBox="0 0 900 600" preserveAspectRatio="none">
        <defs>
          <pattern id="map-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#1e293b" strokeWidth="1" />
          </pattern>
          <radialGradient id="city-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="route-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
        </defs>

        {/* Base Grid */}
        <rect width="100%" height="100%" fill="#090d16" />
        <rect width="100%" height="100%" fill="url(#map-grid)" />
        <circle cx="450" cy="300" r="320" fill="url(#city-glow)" />

        {/* Major Arterial Roads / Ring Road Simulation */}
        <g stroke="#1e293b" strokeWidth="6" strokeLinecap="round" opacity="0.6">
          <line x1="50" y1="300" x2="850" y2="300" stroke="#334155" strokeWidth="5" />
          <line x1="450" y1="40" x2="450" y2="560" stroke="#334155" strokeWidth="5" />
          <line x1="120" y1="100" x2="780" y2="500" stroke="#26334d" strokeWidth="4" />
          <line x1="120" y1="500" x2="780" y2="100" stroke="#26334d" strokeWidth="4" />
          <circle cx="450" cy="300" r="180" fill="none" stroke="#26334d" strokeWidth="3" strokeDasharray="8 6" />
        </g>

        {/* Street Name Labels */}
        <text x="70" y="290" fill="#475569" fontSize="11" fontWeight="bold" fontFamily="sans-serif">AB ROAD EXPRESSWAY</text>
        <text x="460" y="60" fill="#475569" fontSize="11" fontWeight="bold" fontFamily="sans-serif">RING ROAD HUB</text>
        <text x="460" y="540" fill="#334155" fontSize="10" fontFamily="sans-serif">BYPASS CORRIDOR</text>

        {/* Distance Range Rings from User */}
        {userPoint && (
          <g>
            <circle cx={userPoint.x} cy={userPoint.y} r="70" fill="none" stroke="#2563eb" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
            <circle cx={userPoint.x} cy={userPoint.y} r="140" fill="none" stroke="#2563eb" strokeWidth="1" strokeDasharray="4 4" opacity="0.25" />
            <text x={userPoint.x + 75} y={userPoint.y - 5} fill="#60a5fa" fontSize="9" fontWeight="bold">2 KM</text>
            <text x={userPoint.x + 145} y={userPoint.y - 5} fill="#3b82f6" fontSize="9" fontWeight="bold">5 KM</text>
          </g>
        )}

        {/* Active Route Line */}
        {isDirectionsActive && userPoint && selectedPoint && (
          <g>
            <path
              d={`M ${userPoint.x} ${userPoint.y} Q ${(userPoint.x + selectedPoint.x) / 2 + 30} ${(userPoint.y + selectedPoint.y) / 2 - 20} ${selectedPoint.x} ${selectedPoint.y}`}
              fill="none"
              stroke="#2563eb"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="10 6"
              className="animate-pulse"
            />
            <path
              d={`M ${userPoint.x} ${userPoint.y} Q ${(userPoint.x + selectedPoint.x) / 2 + 30} ${(userPoint.y + selectedPoint.y) / 2 - 20} ${selectedPoint.x} ${selectedPoint.y}`}
              fill="none"
              stroke="#93c5fd"
              strokeWidth="2"
            />
          </g>
        )}
      </svg>

      {/* Interactive HTML Markers Layer */}
      <div className="absolute inset-0 pointer-events-none">
        {/* User GPS Location Marker */}
        {userPoint && (
          <div
            style={{ left: `${(userPoint.x / 900) * 100}%`, top: `${(userPoint.y / 600) * 100}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-20"
          >
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-blue-400 opacity-60" />
              <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-white">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-900/90 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap border border-blue-500/40 shadow-sm backdrop-blur-xs">
                You Are Here
              </div>
            </div>
          </div>
        )}

        {/* Salon Location Markers */}
        {salons.map((salon) => {
          if (!salon.lat || !salon.lng) return null;
          const pos = projectCoords(salon.lat, salon.lng);
          const isSelected = selectedSalon?.id === salon.id;

          return (
            <div
              key={salon.id}
              style={{ left: `${(pos.x / 900) * 100}%`, top: `${(pos.y / 600) * 100}%` }}
              className="absolute -translate-x-1/2 -translate-y-full pointer-events-auto z-10"
            >
              <button
                id={`marker-${salon.id}`}
                onClick={() => onSelectSalon(salon)}
                className={`group flex flex-col items-center transition-all duration-200 cursor-pointer ${
                  isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-10'
                }`}
              >
                {/* Floating Rating Pill above marker */}
                <div
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-0.5 shadow-md mb-0.5 transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white ring-2 ring-white scale-105'
                      : 'bg-white/95 text-slate-900 group-hover:bg-blue-50'
                  }`}
                >
                  <Star className={`w-2.5 h-2.5 ${isSelected ? 'fill-white text-white' : 'fill-amber-400 text-amber-400'}`} />
                  <span>{salon.rating}</span>
                </div>

                {/* Custom Salon Pin Icon */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2 transition-all ${
                    isSelected
                      ? 'bg-blue-600 border-white text-white ring-4 ring-blue-500/30'
                      : 'bg-slate-900 border-slate-700 text-slate-200 group-hover:border-blue-400 group-hover:text-blue-300'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                
                {/* Name Label */}
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5 whitespace-nowrap shadow-xs transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-950/80 text-slate-300 group-hover:text-white'
                  }`}
                >
                  {salon.name.length > 14 ? `${salon.name.slice(0, 14)}...` : salon.name}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -------------------------------------------------------------------
// Main Nearby Salons Map Page Component
// -------------------------------------------------------------------
export default function NearbySalonsMapPage({
  onNavigate,
  initialSalonId = null,
  initialLat = null,
  initialLng = null,
  autoGetDirections = false,
}) {
  // 0. API Key State
  const [activeApiKey, setActiveApiKey] = useState(() => getInitialApiKey());
  const [keyInputVal, setKeyInputVal] = useState('');
  const [keyError, setKeyError] = useState('');
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  const hasValidKey = Boolean(activeApiKey) && activeApiKey !== 'YOUR_API_KEY';

  const handleApplyDirectKey = (e) => {
    e?.preventDefault();
    const cleanKey = keyInputVal.trim();
    if (!cleanKey || cleanKey.length < 10) {
      setKeyError('Please enter a valid Google Maps Platform API key (starts with AIzaSy...)');
      return;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('AAORA_GMAPS_KEY', cleanKey);
    }
    setActiveApiKey(cleanKey);
    setKeyError('');
    setIsKeyModalOpen(false);
  };

  const handleClearKey = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('AAORA_GMAPS_KEY');
    }
    setActiveApiKey('');
    setKeyInputVal('');
  };

  // 1. Core State
  const [salonsList, setSalonsList] = useState(INITIAL_SALONS);
  const [googlePlacesList, setGooglePlacesList] = useState([]);
  const [selectedSalon, setSelectedSalon] = useState(() => {
    if (initialSalonId) {
      return INITIAL_SALONS.find((s) => s.id === initialSalonId) || INITIAL_SALONS[0];
    }
    return INITIAL_SALONS[0];
  });

  // User Geolocation State
  const [userLocation, setUserLocation] = useState({
    lat: initialLat || 22.7500,
    lng: initialLng || 75.8900,
    accuracy: null,
    isRealUserGps: false,
  });
  const [locationPermissionStatus, setLocationPermissionStatus] = useState('prompt');
  const [locationBannerDismissed, setLocationBannerDismissed] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Indore');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all'); // 'all' | 'unisex' | 'men' | 'women'
  const [maxDistanceFilter, setMaxDistanceFilter] = useState(20); // km
  const [onlyTopRated, setOnlyTopRated] = useState(false);
  const [onlyOpenNow, setOnlyOpenNow] = useState(false);
  const [mobileViewTab, setMobileViewTab] = useState('split'); // 'list' | 'map' | 'split'
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Directions & Navigation Mode State
  const [isDirectionsActive, setIsDirectionsActive] = useState(autoGetDirections);
  const [travelMode, setTravelMode] = useState('DRIVING'); // 'DRIVING' | 'TWO_WHEELER' | 'TRANSIT' | 'WALKING'
  const [routeInfo, setRouteInfo] = useState(null);

  // Map Viewport Settings
  const [mapCenter, setMapCenter] = useState(() => {
    if (initialLat && initialLng) return { lat: initialLat, lng: initialLng };
    if (selectedSalon?.lat && selectedSalon?.lng) return { lat: selectedSalon.lat, lng: selectedSalon.lng };
    return DEFAULT_CENTER;
  });
  const [mapZoom, setMapZoom] = useState(13);

  // Current City Object
  const currentCityObj = useMemo(() => {
    return CITIES.find((c) => c.name.toLowerCase() === selectedCity.toLowerCase()) || CITIES[0];
  }, [selectedCity]);

  // Request Geolocation
  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationPermissionStatus('denied');
      return;
    }

    setLocationPermissionStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          isRealUserGps: true,
        };
        setUserLocation(coords);
        setLocationPermissionStatus('granted');
        setMapCenter({ lat: coords.lat, lng: coords.lng });
        setMapZoom(14);
      },
      (err) => {
        console.warn('Geolocation access declined:', err.message);
        setLocationPermissionStatus('denied');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  useEffect(() => {
    if (navigator.geolocation && !initialLat) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            isRealUserGps: true,
          });
          setLocationPermissionStatus('granted');
        },
        () => {
          setLocationPermissionStatus('prompt');
        },
        { timeout: 5000 }
      );
    }
  }, [initialLat]);

  // Recalculate straight line distances for all salons
  const combinedSalons = useMemo(() => {
    const all = [...salonsList, ...googlePlacesList];
    return all.map((salon) => {
      const distanceVal = getDistanceFromLatLngInKm(
        userLocation.lat,
        userLocation.lng,
        salon.lat,
        salon.lng
      );
      return {
        ...salon,
        calculatedDistanceKm: distanceVal,
        formattedDistance: distanceVal !== null ? `${distanceVal.toFixed(1)} km away` : salon.distance,
      };
    });
  }, [salonsList, googlePlacesList, userLocation]);

  // Strictly filter salons by search query, neighborhood, category, distance, and rating
  const filteredSalons = useMemo(() => {
    return combinedSalons.filter((salon) => {
      // 1. Search query match (Name, address, services, stylists, specialties)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = salon.name.toLowerCase().includes(q);
        const matchesAddress = salon.address?.toLowerCase().includes(q);
        const matchesCity = salon.city?.toLowerCase().includes(q);
        const matchesServices = salon.services?.some((s) => s.name.toLowerCase().includes(q));
        const matchesStylists = salon.stylists?.some((st) => st.name.toLowerCase().includes(q) || st.specialty?.toLowerCase().includes(q));
        const matchesAmenities = salon.amenities?.some((a) => a.toLowerCase().includes(q));

        if (!matchesName && !matchesAddress && !matchesCity && !matchesServices && !matchesStylists && !matchesAmenities) {
          return false;
        }
      }

      // 2. Neighborhood filter
      if (selectedNeighborhood !== 'all') {
        const matchesArea = salon.address?.toLowerCase().includes(selectedNeighborhood.toLowerCase());
        if (!matchesArea) return false;
      }

      // 3. Category match
      if (selectedCategory !== 'all') {
        const hasCategory = salon.services?.some(
          (s) => s.category?.toLowerCase() === selectedCategory.toLowerCase() || s.name.toLowerCase().includes(selectedCategory.toLowerCase())
        );
        if (!hasCategory && !salon.isGooglePlace) return false;
      }

      // 4. Gender match
      if (selectedGender !== 'all') {
        if (selectedGender === 'women' && salon.name.toLowerCase().includes('men only')) return false;
        if (selectedGender === 'men' && salon.name.toLowerCase().includes('women only')) return false;
      }

      // 5. Top rated filter
      if (onlyTopRated && salon.rating < 4.7) {
        return false;
      }

      // 6. Distance filter
      if (salon.calculatedDistanceKm && salon.calculatedDistanceKm > maxDistanceFilter) {
        return false;
      }

      return true;
    });
  }, [combinedSalons, searchQuery, selectedNeighborhood, selectedCategory, selectedGender, onlyTopRated, maxDistanceFilter]);

  // Handle Salon Click from Map Marker or List Card
  const handleSelectSalon = (salon) => {
    setSelectedSalon(salon);
    if (salon.lat && salon.lng) {
      setMapCenter({ lat: salon.lat, lng: salon.lng });
    }
  };

  // Trigger Directions to Salon
  const handleStartDirections = (salon) => {
    setSelectedSalon(salon);
    setIsDirectionsActive(true);
    if (salon.lat && salon.lng) {
      setMapCenter({ lat: salon.lat, lng: salon.lng });
    }

    // Compute route info fallback immediately
    const dist = getDistanceFromLatLngInKm(userLocation.lat, userLocation.lng, salon.lat, salon.lng);
    if (dist !== null) {
      const speedKmH = travelMode === 'WALKING' ? 4.5 : travelMode === 'TWO_WHEELER' ? 32 : 26;
      const estMinutes = Math.max(2, Math.round((dist / speedKmH) * 60));
      setRouteInfo({
        distanceKm: `${dist.toFixed(1)} km`,
        durationText: `${estMinutes} mins`,
        success: true,
      });
    }
  };

  // Switch City center
  const handleCityChange = (cityName) => {
    setSelectedCity(cityName);
    setSelectedNeighborhood('all');
    const cityObj = CITIES.find((c) => c.name.toLowerCase() === cityName.toLowerCase());
    if (cityObj && cityObj.lat && cityObj.lng) {
      setMapCenter({ lat: cityObj.lat, lng: cityObj.lng });
      setMapZoom(13);
      if (!userLocation.isRealUserGps) {
        setUserLocation((prev) => ({ ...prev, lat: cityObj.lat, lng: cityObj.lng }));
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      
      {/* TOP NAVIGATION HEADER */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          
          {/* Back Button & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              id="btn-map-back"
              onClick={() => onNavigate('home')}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:scale-95 transition-all flex-shrink-0"
              title="Back to Storefront"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Salon Map & GPS Routes
                </h1>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {hasValidKey ? 'Google Maps Live' : 'Interactive Map'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate hidden sm:block">
                Verified salons, live distance tracking, and instant appointment booking
              </p>
            </div>
          </div>

          {/* City Selector, GPS Recenter & API Key Toggle */}
          <div className="flex items-center gap-2">
            <select
              id="select-map-city"
              value={selectedCity}
              onChange={(e) => handleCityChange(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {CITIES.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            <button
              id="btn-recenter-gps"
              onClick={requestUserLocation}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                locationPermissionStatus === 'granted'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                  : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
              }`}
              title="Detect My GPS Location"
            >
              <Crosshair className={`w-3.5 h-3.5 ${locationPermissionStatus === 'locating' ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {locationPermissionStatus === 'granted' ? 'GPS Active' : 'My Location'}
              </span>
            </button>

            {/* Google Maps API Key Modal Trigger */}
            <button
              onClick={() => setIsKeyModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer"
              title="Google Maps Platform API Key"
            >
              <KeyRound className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden md:inline">{hasValidKey ? 'API Key Active' : 'Connect GMaps'}</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Neighborhood Chips Row */}
        <div className="bg-slate-50/90 border-t border-slate-200/80 px-4 sm:px-6 py-2.5">
          <div className="max-w-7xl mx-auto flex flex-col gap-2.5">
            
            <div className="flex flex-col md:flex-row items-center gap-3 justify-between">
              {/* Search Input - Strict Salon & Service Search */}
              <div className="relative w-full md:max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search salons by name, haircut, beard, facial, spa, or area..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-2xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
                {[
                  { id: 'all', label: 'All Salons' },
                  { id: 'haircut', label: 'Haircuts' },
                  { id: 'beard', label: 'Beard Grooming' },
                  { id: 'facial', label: 'Facial & Skin' },
                  { id: 'spa', label: 'Hair Spa' },
                  { id: 'hair-color', label: 'Hair Color' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}

                <button
                  onClick={() => setOnlyTopRated(!onlyTopRated)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                    onlyTopRated
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Star className="w-3 h-3 fill-current" /> 4.7+
                </button>

                <button
                  onClick={() => setIsFilterDrawerOpen(true)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  <span>Filters</span>
                </button>
              </div>

              {/* Mobile View Toggle Buttons */}
              <div className="flex md:hidden items-center bg-slate-200 p-1 rounded-xl w-full justify-center gap-1">
                <button
                  onClick={() => setMobileViewTab('list')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    mobileViewTab === 'list' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  <List className="w-3.5 h-3.5" /> Salons List ({filteredSalons.length})
                </button>
                <button
                  onClick={() => setMobileViewTab('map')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    mobileViewTab === 'map' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5" /> Live Map
                </button>
              </div>
            </div>

            {/* Neighborhood / Area Selector Chips */}
            {currentCityObj.areas && currentCityObj.areas.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none pt-1">
                <span className="text-slate-400 font-medium whitespace-nowrap flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" /> Area:
                </span>
                <button
                  onClick={() => setSelectedNeighborhood('all')}
                  className={`px-2 py-0.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                    selectedNeighborhood === 'all'
                      ? 'bg-slate-900 text-white font-bold'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  All Areas
                </button>
                {currentCityObj.areas.map((area) => (
                  <button
                    key={area}
                    onClick={() => setSelectedNeighborhood(area)}
                    className={`px-2 py-0.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                      selectedNeighborhood === area
                        ? 'bg-blue-600 text-white font-bold shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            )}

          </div>
        </div>
      </header>

      {/* Location Permission Notification Banner */}
      {locationPermissionStatus === 'denied' && !locationBannerDismissed && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Showing salons around {selectedCity}:</strong> Allow browser location anytime for exact live distance and turn-by-turn routes.
            </span>
          </div>
          <button
            onClick={() => setLocationBannerDismissed(true)}
            className="text-amber-700 hover:text-amber-900 p-1 font-bold cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MAIN WORKSPACE GRID: Split View Desktop, Toggle View Mobile */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT COLUMN: Salons List / Active Directions Panel (5 Cols) */}
        <div
          className={`lg:col-span-5 flex flex-col gap-4 overflow-hidden ${
            mobileViewTab === 'map' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* ACTIVE DIRECTIONS BOX */}
          {isDirectionsActive && selectedSalon && (
            <div className="bg-blue-600 text-white rounded-2xl p-4 shadow-lg animate-in fade-in slide-in-from-top duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold leading-tight">Route to {selectedSalon.name}</h4>
                    <p className="text-[11px] text-blue-100">{selectedSalon.address}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsDirectionsActive(false);
                    setRouteInfo(null);
                  }}
                  className="p-1 rounded-lg hover:bg-white/10 text-blue-100 cursor-pointer"
                  title="Close Route"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Travel Mode Pills */}
              <div className="grid grid-cols-4 gap-1.5 bg-blue-700/60 p-1 rounded-xl mb-3">
                {[
                  { id: 'DRIVING', label: 'Drive', icon: Car },
                  { id: 'TWO_WHEELER', label: 'Bike', icon: Bike },
                  { id: 'TRANSIT', label: 'Transit', icon: Bus },
                  { id: 'WALKING', label: 'Walk', icon: Footprints },
                ].map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = travelMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => {
                        setTravelMode(mode.id);
                        if (selectedSalon) handleStartDirections(selectedSalon);
                      }}
                      className={`flex flex-col items-center justify-center py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        isSelected ? 'bg-white text-blue-700 shadow-xs' : 'text-blue-200 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 mb-0.5" />
                      {mode.label}
                    </button>
                  );
                })}
              </div>

              {/* Computed Distance & Time Stats */}
              <div className="flex items-center justify-between bg-white/10 rounded-xl p-3 backdrop-blur-xs">
                <div>
                  <span className="text-[10px] text-blue-200 block uppercase font-bold tracking-wider">
                    Estimated Time
                  </span>
                  <span className="text-xl font-black">
                    {routeInfo?.durationText || 'Calculating...'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-blue-200 block uppercase font-bold tracking-wider">
                    Distance
                  </span>
                  <span className="text-base font-bold">
                    {routeInfo?.distanceKm || selectedSalon.formattedDistance || '1.5 km'}
                  </span>
                </div>
              </div>

              {/* Open in Google Maps Native App CTA */}
              <div className="mt-3 flex items-center gap-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedSalon.lat},${selectedSalon.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 rounded-xl bg-white text-blue-700 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-blue-50 transition-all shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Maps App
                </a>
                <button
                  onClick={() => {
                    onNavigate('book-appointment', {
                      initialSalonId: selectedSalon.id,
                    });
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" /> Book Slot Now
                </button>
              </div>
            </div>
          )}

          {/* SALON RESULTS LIST HEADER */}
          <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                {filteredSalons.length} {filteredSalons.length === 1 ? 'Salon' : 'Salons'} Found
              </span>
              <span className="text-[11px] text-slate-500">
                in {selectedCity} {selectedNeighborhood !== 'all' ? `• ${selectedNeighborhood}` : ''}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <Compass className="w-3.5 h-3.5 text-blue-600" /> Sorted by distance
            </div>
          </div>

          {/* SALONS SCROLLABLE LIST */}
          <div className="flex-1 overflow-y-auto max-h-[calc(100vh-280px)] space-y-3 pr-1">
            {filteredSalons.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800">No salons found matching this search</h4>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Try searching for haircuts, beard trim, spa or reset active filters.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedNeighborhood('all');
                    setOnlyTopRated(false);
                    setMaxDistanceFilter(20);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 cursor-pointer shadow-xs"
                >
                  Show All Salons
                </button>
              </div>
            ) : (
              filteredSalons.map((salon) => {
                const isSelected = selectedSalon?.id === salon.id;
                return (
                  <div
                    key={salon.id}
                    id={`salon-list-item-${salon.id}`}
                    onClick={() => handleSelectSalon(salon)}
                    className={`bg-white rounded-2xl border transition-all duration-200 p-3.5 cursor-pointer flex gap-3 group ${
                      isSelected
                        ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md bg-blue-50/20'
                        : 'border-slate-200/90 hover:border-blue-300 hover:shadow-xs'
                    }`}
                  >
                    {/* Salon Thumbnail */}
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                      <img
                        src={salon.image}
                        alt={salon.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute top-1.5 left-1.5 bg-white/95 backdrop-blur-xs px-1.5 py-0.5 rounded-md text-[10px] font-bold text-slate-900 flex items-center gap-0.5 shadow-2xs">
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        {salon.rating}
                      </div>
                    </div>

                    {/* Salon Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                            {salon.name}
                          </h3>
                          {salon.isGooglePlace && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[9px] font-bold border border-emerald-200 flex-shrink-0">
                              Verified
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          {salon.address}
                        </p>

                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-600">
                          <span className="flex items-center gap-0.5 font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                            <Navigation className="w-2.5 h-2.5" />
                            {salon.formattedDistance}
                          </span>
                          <span className="flex items-center gap-0.5 text-slate-500">
                            <Clock className="w-2.5 h-2.5" />
                            {salon.openingHours || '09:00 AM - 09:30 PM'}
                          </span>
                        </div>
                      </div>

                      {/* Card CTAs */}
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartDirections(salon);
                          }}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                        >
                          <Navigation className="w-3 h-3" /> Get Directions
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onNavigate) {
                              onNavigate('book-appointment', {
                                initialSalonId: salon.id,
                              });
                            }
                          }}
                          className="py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-2xs transition-all cursor-pointer"
                        >
                          Book <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Google Map / Vector Map View (7 Cols) */}
        <div
          className={`lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative min-h-[480px] lg:min-h-[620px] ${
            mobileViewTab === 'list' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Interactive Map Component Container */}
          <div className="w-full h-full min-h-[460px] lg:min-h-[600px] relative flex-1">
            {hasValidKey ? (
              <APIProvider apiKey={activeApiKey} version="weekly">
                <Map
                  center={mapCenter}
                  zoom={mapZoom}
                  mapId="DEMO_MAP_ID"
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  style={{ width: '100%', height: '100%', minHeight: '460px' }}
                  gestureHandling="greedy"
                  disableDefaultUI={false}
                >
                  {/* User GPS Marker */}
                  {userLocation.lat && userLocation.lng && (
                    <AdvancedMarker position={{ lat: userLocation.lat, lng: userLocation.lng }} title="Your Location">
                      <div className="relative flex items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-blue-400 opacity-75" />
                        <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-white">
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                      </div>
                    </AdvancedMarker>
                  )}

                  {/* Salon Markers */}
                  {filteredSalons.map((salon) => {
                    if (!salon.lat || !salon.lng) return null;
                    const isSelected = selectedSalon?.id === salon.id;

                    return (
                      <AdvancedMarker
                        key={salon.id}
                        position={{ lat: salon.lat, lng: salon.lng }}
                        title={salon.name}
                        onClick={() => handleSelectSalon(salon)}
                      >
                        <div
                          className={`transition-transform duration-200 cursor-pointer ${
                            isSelected ? 'scale-125 z-20' : 'hover:scale-110 z-10'
                          }`}
                        >
                          <Pin
                            background={isSelected ? '#2563eb' : '#1e293b'}
                            glyphColor="#ffffff"
                            borderColor={isSelected ? '#ffffff' : '#334155'}
                            scale={isSelected ? 1.2 : 1.0}
                          />
                        </div>
                      </AdvancedMarker>
                    );
                  })}

                  {/* Google Routes API Direction Polyline */}
                  {isDirectionsActive && selectedSalon?.lat && userLocation?.lat && (
                    <DirectionsRouteRenderer
                      origin={{ lat: userLocation.lat, lng: userLocation.lng }}
                      destination={{ lat: selectedSalon.lat, lng: selectedSalon.lng }}
                      travelMode={travelMode}
                      onRouteCalculated={(info) => setRouteInfo(info)}
                    />
                  )}

                  {/* Places API Strict Salon Search */}
                  {searchQuery.trim().length > 2 && (
                    <PlacesLiveSearch
                      searchQuery={searchQuery}
                      mapCenter={mapCenter}
                      onPlacesFound={(places) => {
                        setGooglePlacesList(places);
                      }}
                    />
                  )}
                </Map>
              </APIProvider>
            ) : (
              /* Fallback Interactive Vector Map with Rich Visuals */
              <InteractiveVectorMap
                salons={filteredSalons}
                selectedSalon={selectedSalon}
                onSelectSalon={handleSelectSalon}
                userLocation={userLocation}
                isDirectionsActive={isDirectionsActive}
                travelMode={travelMode}
                selectedCity={selectedCity}
                onRecenter={requestUserLocation}
              />
            )}

            {/* Floating Salon Info Card over Map */}
            {selectedSalon && (
              <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-84 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 p-4 shadow-xl z-20 animate-in fade-in slide-in-from-bottom duration-200">
                <div className="flex items-start gap-3">
                  <img
                    src={selectedSalon.image}
                    alt={selectedSalon.name}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-slate-100"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {selectedSalon.name}
                      </h4>
                      <div className="flex items-center gap-0.5 text-amber-500 text-[10px] font-bold">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        {selectedSalon.rating}
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      {selectedSalon.address}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-600">
                      <span className="font-semibold text-blue-600">{selectedSalon.formattedDistance}</span>
                      <span>•</span>
                      <span>Starts ₹{selectedSalon.startingPrice || 249}</span>
                    </div>
                  </div>
                </div>

                {/* Actions in floating card */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-100">
                  <button
                    onClick={() => handleStartDirections(selectedSalon)}
                    className="py-1.5 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <Navigation className="w-3 h-3" /> Directions
                  </button>
                  <button
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate('book-appointment', {
                          initialSalonId: selectedSalon.id,
                        });
                      }
                    }}
                    className="py-1.5 px-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer"
                  >
                    <Calendar className="w-3 h-3" /> Book Now
                  </button>
                </div>
              </div>
            )}

            {/* Recenter & Map Zoom Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
              <button
                onClick={requestUserLocation}
                className="p-2.5 rounded-xl bg-white/95 backdrop-blur-md shadow-md text-slate-700 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition-all cursor-pointer"
                title="Center on my GPS location"
              >
                <Crosshair className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMapZoom((z) => Math.min(z + 1, 18))}
                className="p-2.5 rounded-xl bg-white/95 backdrop-blur-md shadow-md text-slate-700 hover:text-slate-900 border border-slate-200 transition-all font-bold text-xs cursor-pointer"
                title="Zoom In"
              >
                +
              </button>
              <button
                onClick={() => setMapZoom((z) => Math.max(z - 1, 9))}
                className="p-2.5 rounded-xl bg-white/95 backdrop-blur-md shadow-md text-slate-700 hover:text-slate-900 border border-slate-200 transition-all font-bold text-xs cursor-pointer"
                title="Zoom Out"
              >
                -
              </button>
            </div>

          </div>
        </div>

      </main>

      {/* FILTER DRAWER / MODAL */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Map & Salon Filters</h3>
              </div>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              {/* Max Distance Radius */}
              <div>
                <div className="flex items-center justify-between font-bold text-slate-700 mb-1.5">
                  <span>Search Radius Distance</span>
                  <span className="text-blue-600">{maxDistanceFilter} km</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="35"
                  step="1"
                  value={maxDistanceFilter}
                  onChange={(e) => setMaxDistanceFilter(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>2 km</span>
                  <span>15 km</span>
                  <span>35 km</span>
                </div>
              </div>

              {/* Gender Preference */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Gender Focus</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'all', label: 'All Salons' },
                    { id: 'men', label: 'Men / Grooming' },
                    { id: 'women', label: 'Women / Beauty' },
                  ].map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGender(g.id)}
                      className={`py-2 rounded-xl text-center font-bold border transition-all ${
                        selectedGender === g.id
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minimum Rating */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Rating Requirement</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: false, label: 'Any Rating' },
                    { val: true, label: '4.7+ Top Tier' },
                  ].map((r, i) => (
                    <button
                      key={i}
                      onClick={() => setOnlyTopRated(r.val)}
                      className={`py-2 rounded-xl text-center font-bold border transition-all ${
                        onlyTopRated === r.val
                          ? 'bg-amber-50 border-amber-500 text-amber-800'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedNeighborhood('all');
                  setSelectedGender('all');
                  setOnlyTopRated(false);
                  setMaxDistanceFilter(20);
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
              >
                Reset All
              </button>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-xs"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GOOGLE MAPS API KEY MODAL */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Google Maps Platform Key</h3>
              </div>
              <button
                onClick={() => setIsKeyModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 my-3 leading-relaxed">
              Connect your Google Maps Platform API key to unlock live Google Maps satellite tiles, Places API salon search, and official Routes API travel directions.
            </p>

            <form onSubmit={handleApplyDirectKey} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Enter API Key (starts with AIzaSy...):</label>
                <input
                  type="text"
                  value={keyInputVal}
                  onChange={(e) => {
                    setKeyInputVal(e.target.value);
                    if (keyError) setKeyError('');
                  }}
                  placeholder="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {keyError && (
                  <p className="text-rose-500 text-[11px] font-medium mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{keyError}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                {hasValidKey && (
                  <button
                    type="button"
                    onClick={handleClearKey}
                    className="py-2.5 px-3 rounded-xl border border-rose-200 text-rose-600 text-xs font-bold hover:bg-rose-50"
                  >
                    Clear Key
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Activate Live Google Map</span>
                </button>
              </div>
            </form>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Need a key? Get one from Google Cloud:</span>
              <a
                href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 font-bold hover:underline inline-flex items-center gap-0.5"
              >
                Get Key <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
