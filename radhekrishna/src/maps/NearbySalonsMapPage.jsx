import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
  useMapsLibrary,
  useAdvancedMarkerRef,
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
  KeyRound
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

    // Clear previous polylines
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    // Map UI mode to Routes API travelMode
    const modeMapping = {
      DRIVING: 'DRIVING',
      TWO_WHEELER: 'DRIVING', // Routes API uses DRIVING or BICYCLING
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
        console.warn('Routes API computeRoutes error or quota limit:', err);
        // Fallback calculations for smooth UX
        const fallbackDist = getDistanceFromLatLngInKm(
          origin.lat,
          origin.lng,
          destination.lat,
          destination.lng
        );
        if (fallbackDist !== null && onRouteCalculated) {
          const speedKmH = travelMode === 'WALKING' ? 4.5 : travelMode === 'TWO_WHEELER' ? 30 : 25;
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
// Component: Places API Dynamic Search & Markers
// -------------------------------------------------------------------
function PlacesLiveSearch({ searchQuery, mapCenter, onPlacesFound }) {
  const placesLib = useMapsLibrary('places');
  const map = useMap();

  useEffect(() => {
    if (!placesLib || !searchQuery || searchQuery.trim().length < 2) return;

    const fullQuery = searchQuery.toLowerCase().includes('salon') || searchQuery.toLowerCase().includes('barber')
      ? searchQuery
      : `${searchQuery} salon spa`;

    placesLib.Place.searchByText({
      textQuery: fullQuery,
      fields: [
        'displayName',
        'location',
        'formattedAddress',
        'rating',
        'userRatingCount',
        'regularOpeningHours',
        'photos',
      ],
      locationBias: map?.getCenter() || mapCenter || DEFAULT_CENTER,
      maxResultCount: 8,
    })
      .then(({ places }) => {
        if (places && places.length > 0) {
          const mappedPlaces = places.map((p, idx) => ({
            id: `gplace-${p.id || idx}`,
            name: p.displayName || 'Google Verified Salon',
            rating: p.rating || 4.5,
            reviewsCount: p.userRatingCount || 120,
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
          }));
          onPlacesFound(mappedPlaces);
        }
      })
      .catch((err) => {
        console.warn('Places API searchByText notice:', err);
      });
  }, [placesLib, searchQuery, mapCenter]);

  return null;
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
  // 0. API Key State (from environment or local entry)
  const [activeApiKey, setActiveApiKey] = useState(() => getInitialApiKey());
  const [keyInputVal, setKeyInputVal] = useState('');
  const [keyError, setKeyError] = useState('');

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
  const [locationPermissionStatus, setLocationPermissionStatus] = useState('prompt'); // 'prompt' | 'granted' | 'denied' | 'locating'
  const [locationBannerDismissed, setLocationBannerDismissed] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Indore');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [maxDistanceFilter, setMaxDistanceFilter] = useState(15); // km
  const [onlyTopRated, setOnlyTopRated] = useState(false);
  const [mobileViewTab, setMobileViewTab] = useState('split'); // 'list' | 'map' | 'split'

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

  // 2. Request Geolocation Function
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
        console.warn('Geolocation access declined or unavailable:', err.message);
        setLocationPermissionStatus('denied');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Initial Geolocation check on mount
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
          // If denied, fallback to default city coordinates gracefully
          setLocationPermissionStatus('prompt');
        },
        { timeout: 5000 }
      );
    }
  }, [initialLat]);

  // If initial salon passed, highlight it and center map
  useEffect(() => {
    if (initialSalonId) {
      const match = INITIAL_SALONS.find((s) => s.id === initialSalonId);
      if (match) {
        setSelectedSalon(match);
        if (match.lat && match.lng) {
          setMapCenter({ lat: match.lat, lng: match.lng });
          setMapZoom(14);
        }
      }
    }
  }, [initialSalonId]);

  // Recalculate straight line distances for all salons based on user's active location
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

  // Filter salons by search query, category, distance, and rating
  const filteredSalons = useMemo(() => {
    return combinedSalons.filter((salon) => {
      // City match
      if (selectedCity && salon.city && salon.city.toLowerCase() !== selectedCity.toLowerCase()) {
        // Only exclude if explicitly in different city
      }

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = salon.name.toLowerCase().includes(q);
        const matchesAddress = salon.address?.toLowerCase().includes(q);
        const matchesServices = salon.services?.some((s) => s.name.toLowerCase().includes(q));
        if (!matchesName && !matchesAddress && !matchesServices) return false;
      }

      // Category match
      if (selectedCategory !== 'all') {
        const hasCategory = salon.services?.some(
          (s) => s.category?.toLowerCase() === selectedCategory.toLowerCase()
        );
        if (!hasCategory && !salon.isGooglePlace) return false;
      }

      // Top rated filter
      if (onlyTopRated && salon.rating < 4.7) {
        return false;
      }

      // Distance filter
      if (salon.calculatedDistanceKm && salon.calculatedDistanceKm > maxDistanceFilter) {
        return false;
      }

      return true;
    });
  }, [combinedSalons, selectedCity, searchQuery, selectedCategory, onlyTopRated, maxDistanceFilter]);

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
  };

  // Switch City center
  const handleCityChange = (cityName) => {
    setSelectedCity(cityName);
    const cityObj = CITIES.find((c) => c.name.toLowerCase() === cityName.toLowerCase());
    if (cityObj && cityObj.lat && cityObj.lng) {
      setMapCenter({ lat: cityObj.lat, lng: cityObj.lng });
      setMapZoom(13);
      if (!userLocation.isRealUserGps) {
        setUserLocation((prev) => ({ ...prev, lat: cityObj.lat, lng: cityObj.lng }));
      }
    }
  };

  // -----------------------------------------------------------------
  // Fallback Splash Screen if API Key is not set
  // -----------------------------------------------------------------
  if (!hasValidKey) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* Header Icon */}
          <div className="w-14 h-14 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-5 ring-8 ring-blue-500/10">
            <KeyRound className="w-7 h-7" />
          </div>

          <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">
            Google Maps Platform Integration
          </span>

          <h2 className="text-xl sm:text-2xl font-black mt-3 mb-2 text-white">
            Connect Your Google Maps API Key
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mb-5 leading-relaxed">
            Enter your key below to activate the live interactive map, Google Places live salon discovery, and real-time turn-by-turn route directions.
          </p>

          {/* Quick Direct Key Activation Input */}
          <form onSubmit={handleApplyDirectKey} className="bg-slate-800/90 rounded-2xl p-4 border border-blue-500/30 mb-6 shadow-inner">
            <label className="block text-xs font-bold text-blue-300 mb-1.5 flex items-center justify-between">
              <span>Paste Google Maps API Key Here:</span>
              <span className="text-[10px] text-slate-400 font-normal">Starts with AIzaSy...</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={keyInputVal}
                onChange={(e) => {
                  setKeyInputVal(e.target.value);
                  if (keyError) setKeyError('');
                }}
                placeholder="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                className="flex-1 bg-slate-950 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none font-mono"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Activate Map</span>
              </button>
            </div>
            {keyError && (
              <p className="text-rose-400 text-[11px] font-medium mt-2 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{keyError}</span>
              </p>
            )}
          </form>

          {/* Step by step instructions */}
          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/60 mb-6 space-y-2.5 text-xs">
            <div className="flex items-start gap-2.5 text-slate-300">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                1
              </span>
              <div>
                <strong>Get an API Key:</strong>{' '}
                <a
                  href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline font-medium inline-flex items-center gap-1"
                >
                  Google Cloud Console <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-slate-300">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                2
              </span>
              <div>
                <strong>Required APIs:</strong> Enable <em>Maps JavaScript API</em>, <em>Places API</em>, and <em>Routes API</em> in Google Cloud Console.
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-slate-300">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                3
              </span>
              <div>
                <strong>For Local VS Code:</strong> You can also put <code className="bg-slate-950 text-blue-300 px-1.5 py-0.5 rounded font-mono">GOOGLE_MAPS_PLATFORM_KEY=AIzaSy...</code> in your <code className="bg-slate-950 text-blue-300 px-1.5 py-0.5 rounded font-mono">.env</code> file.
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
            >
              ← Back to Salons Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------
  // Main Interactive Map View (Google Maps Platform Enabled)
  // -----------------------------------------------------------------
  return (
    <APIProvider apiKey={activeApiKey} version="weekly">
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        
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
                    Salon Locator & Directions
                  </h1>
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Google Maps Platform
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate hidden sm:block">
                  Live GPS tracking, Places discovery & Routes travel time calculation
                </p>
              </div>
            </div>

            {/* City Selector & Geolocation Trigger */}
            <div className="flex items-center gap-2">
              <select
                id="select-map-city"
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                  locationPermissionStatus === 'granted'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                    : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                }`}
                title="Detect My Location"
              >
                <Crosshair className={`w-3.5 h-3.5 ${locationPermissionStatus === 'locating' ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">
                  {locationPermissionStatus === 'granted' ? 'GPS Active' : 'My Location'}
                </span>
              </button>

              {/* Quick Key Manager Button */}
              <button
                onClick={handleClearKey}
                className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors border border-slate-200"
                title="Change or reset Google Maps API Key"
              >
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                <span>Change Key</span>
              </button>
            </div>
          </div>

          {/* Search Bar & Category Chips Row */}
          <div className="bg-slate-50/80 border-t border-slate-200/80 px-4 sm:px-6 py-2.5">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-3 justify-between">
              
              {/* Search Input */}
              <div className="relative w-full md:max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search salons, stylists, beard, facial or address..."
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

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
                {[
                  { id: 'all', label: 'All Salons' },
                  { id: 'haircut', label: 'Haircut & Style' },
                  { id: 'beard', label: 'Beard Grooming' },
                  { id: 'facial', label: 'Facial & Skin' },
                  { id: 'spa', label: 'Head Spa' },
                  { id: 'waxing', label: 'Waxing' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
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
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                    onlyTopRated
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Star className="w-3 h-3 fill-current" /> 4.7+ Rating
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
          </div>
        </header>

        {/* Location Permission Notification Banner */}
        {locationPermissionStatus === 'denied' && !locationBannerDismissed && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-900 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                <strong>Location access is disabled:</strong> Showing salons centered around {selectedCity}. Enable browser GPS permissions anytime for exact travel directions.
              </span>
            </div>
            <button
              onClick={() => setLocationBannerDismissed(true)}
              className="text-amber-700 hover:text-amber-900 p-1 font-bold"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* MAIN WORKSPACE GRID: Split View Desktop, Toggle View Mobile */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* LEFT COLUMN: Salons List / Directions Panel (5 Cols) */}
          <div
            className={`lg:col-span-5 flex flex-col gap-4 overflow-hidden ${
              mobileViewTab === 'map' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* ACTIVE DIRECTIONS BOX (If Directions is Active) */}
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
                    className="p-1 rounded-lg hover:bg-white/10 text-blue-100"
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
                        onClick={() => setTravelMode(mode.id)}
                        className={`flex flex-col items-center justify-center py-1.5 rounded-lg text-[10px] font-bold transition-all ${
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
                      Estimated Duration
                    </span>
                    <span className="text-xl font-black">
                      {routeInfo?.durationText || 'Calculating...'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-blue-200 block uppercase font-bold tracking-wider">
                      Trip Distance
                    </span>
                    <span className="text-base font-bold">
                      {routeInfo?.distanceKm || selectedSalon.formattedDistance || '1.2 km'}
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
                    <ExternalLink className="w-3.5 h-3.5" /> Open Google Maps App
                  </a>
                  <button
                    onClick={() => {
                      onNavigate('book-appointment', {
                        initialSalonId: selectedSalon.id,
                      });
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-xs"
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
                  {filteredSalons.length} Salons Found
                </span>
                <span className="text-[11px] text-slate-500">
                  around {selectedCity}
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
                  <h4 className="text-sm font-bold text-slate-800">No salons found in this radius</h4>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    Try searching for another neighborhood or clear your active category filters.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setOnlyTopRated(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
                  >
                    Reset Search Filters
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
                                Google Place
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
                            className="flex-1 py-1.5 px-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
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
                            className="py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-2xs transition-all"
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

          {/* RIGHT COLUMN: Interactive Google Map (7 Cols) */}
          <div
            className={`lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative min-h-[480px] lg:min-h-[620px] ${
              mobileViewTab === 'list' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* Interactive Map Component */}
            <div className="w-full h-full min-h-[460px] lg:min-h-[600px] relative flex-1">
              <Map
                center={mapCenter}
                zoom={mapZoom}
                mapId="DEMO_MAP_ID"
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                style={{ width: '100%', height: '100%', minHeight: '460px' }}
                gestureHandling="greedy"
                disableDefaultUI={false}
              >
                {/* 1. User Live GPS Marker */}
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

                {/* 2. Salon Location Markers */}
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

                {/* 3. Google Routes API Direction Polyline */}
                {isDirectionsActive && selectedSalon?.lat && userLocation?.lat && (
                  <DirectionsRouteRenderer
                    origin={{ lat: userLocation.lat, lng: userLocation.lng }}
                    destination={{ lat: selectedSalon.lat, lng: selectedSalon.lng }}
                    travelMode={travelMode}
                    onRouteCalculated={(info) => setRouteInfo(info)}
                  />
                )}

                {/* 4. Live Places API Search Helper */}
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

              {/* Floating Map Controls & Info Card */}
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
                        <span>{selectedSalon.openingHours || 'Open Today'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions in floating card */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-100">
                    <button
                      onClick={() => handleStartDirections(selectedSalon)}
                      className="py-1.5 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
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
                      className="py-1.5 px-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-all shadow-xs"
                    >
                      <Calendar className="w-3 h-3" /> Book Now
                    </button>
                  </div>
                </div>
              )}

              {/* Recenter & Map Legend Tooltip */}
              <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                <button
                  onClick={requestUserLocation}
                  className="p-2.5 rounded-xl bg-white/95 backdrop-blur-md shadow-md text-slate-700 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition-all"
                  title="Center on my location"
                >
                  <Crosshair className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setMapZoom((z) => Math.min(z + 1, 18));
                  }}
                  className="p-2.5 rounded-xl bg-white/95 backdrop-blur-md shadow-md text-slate-700 hover:text-slate-900 border border-slate-200 transition-all font-bold text-xs"
                  title="Zoom In"
                >
                  +
                </button>
                <button
                  onClick={() => {
                    setMapZoom((z) => Math.max(z - 1, 9));
                  }}
                  className="p-2.5 rounded-xl bg-white/95 backdrop-blur-md shadow-md text-slate-700 hover:text-slate-900 border border-slate-200 transition-all font-bold text-xs"
                  title="Zoom Out"
                >
                  -
                </button>
              </div>

            </div>
          </div>

        </main>
      </div>
    </APIProvider>
  );
}
