import React, { useState, useMemo } from 'react';
import Navbar from './Navbar';
import HeroBanner from './HeroBanner';
import OffersBanner from './OffersBanner';
import ServicesGrid from './ServicesGrid';
import GenderBanners from './GenderBanners';
import PopularSalons from './PopularSalons';
import BottomNav from './BottomNav';
import BookingModal from './BookingModal';
import OffersModal from './OffersModal';
import SalonDetailModal from './SalonDetailModal';
import BookingsDrawer from './BookingsDrawer';
import FavoritesDrawer from './FavoritesDrawer';
import ProfileDrawer from './ProfileDrawer';
import SideMenuDrawer from './SideMenuDrawer';
import NotificationModal from './NotificationModal';
import AllServicesModal from './AllServicesModal';
import { INITIAL_SALONS, INITIAL_NOTIFICATIONS } from './mockData';

export default function HomePage({
  onNavigate,
  userBookings = [],
  onCancelBooking,
  salons = INITIAL_SALONS,
  onToggleFavorite,
  currentUser,
  onOpenAuth,
}) {
  // Global / Home States
  const [selectedCity, setSelectedCity] = useState('Indore');
  const [selectedArea, setSelectedArea] = useState('Vijay Nagar');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const [activeNavTab, setActiveNavTab] = useState('home');

  // Notifications State
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  // Modals and Drawers visibility states
  const [isFavoritesDrawerOpen, setIsFavoritesDrawerOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Quick book trigger -> navigates to book appointment page
  const handleQuickBook = (salon, service = null) => {
    if (onNavigate) {
      onNavigate('book-appointment', {
        initialSalonId: salon.id,
        preselectedService: service,
      });
    }
  };

  const handleSelectSalonDetail = (salon) => {
    if (onNavigate) {
      onNavigate('salon-detail', {
        salonId: salon.id,
      });
    }
  };

  // Notifications Mark All Read
  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedGender('all');
    setSearchQuery('');
  };

  // Filter salons logic
  const filteredSalons = useMemo(() => {
    return salons.filter((salon) => {
      // Search matching
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = salon.name.toLowerCase().includes(q);
        const matchesAddress = salon.address?.toLowerCase().includes(q) || salon.location?.toLowerCase().includes(q);
        const matchesService = salon.services?.some((s) => s.name.toLowerCase().includes(q));
        if (!matchesName && !matchesAddress && !matchesService) return false;
      }

      // Category matching
      if (selectedCategory !== 'all') {
        const hasServiceInCategory = salon.services?.some(
          (s) => s.category?.toLowerCase() === selectedCategory.toLowerCase()
        );
        if (!hasServiceInCategory) return false;
      }

      // Gender filter
      if (selectedGender !== 'all') {
        if (salon.gender !== 'unisex' && salon.gender !== selectedGender) return false;
      }

      return true;
    });
  }, [salons, searchQuery, selectedCategory, selectedGender]);

  // Favorite salons count
  const favoriteSalons = salons.filter((s) => s.isFavorite);
  const unreadNotifsCount = notifications.filter((n) => n.unread).length;

  // Handle Tab navigation
  const handleTabChange = (tabId) => {
    setActiveNavTab(tabId);
    if (tabId === 'offers') {
      if (onNavigate) onNavigate('offers');
    } else if (tabId === 'bookings') {
      if (onNavigate) onNavigate('my-bookings');
    } else if (tabId === 'favorites') {
      setIsFavoritesDrawerOpen(true);
    } else if (tabId === 'profile') {
      setIsProfileDrawerOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased selection:bg-blue-600 selection:text-white">
      
      {/* Top Navigation Bar */}
      <Navbar
        selectedCity={selectedCity}
        selectedArea={selectedArea}
        onSelectCity={setSelectedCity}
        onSelectArea={setSelectedArea}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        unreadNotifsCount={unreadNotifsCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenSideMenu={() => setIsSideMenuOpen(true)}
        onOpenProfile={() => setIsProfileDrawerOpen(true)}
        activeFilterGender={selectedGender}
        onFilterGender={(gender) => {
          if (gender === 'men' || gender === 'women') {
            if (onNavigate) onNavigate('gender-services', { gender });
          } else {
            setSelectedGender(gender);
          }
        }}
      />

      {/* Main Home Page Body */}
      <main className="flex-1 w-full">
        
        {/* 1. Hero Royal Blue Banner with Model Photo & Dynamic Slides CTA */}
        <HeroBanner
          onNavigate={onNavigate}
        />

        {/* 2. Special Offers Banner -> Navigates to Offers Page */}
        <OffersBanner
          onOpenOffers={() => {
            if (onNavigate) onNavigate('offers');
          }}
        />

        {/* 3. Our Services 6-Grid -> Navigates to Services Page */}
        <ServicesGrid
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            if (onNavigate) {
              onNavigate('services', { category: cat });
            } else {
              setSelectedCategory(cat);
            }
          }}
          onViewAllServices={(cat) => {
            if (onNavigate) {
              onNavigate('services', { category: cat || 'all' });
            }
          }}
        />

        {/* 4. For Men & For Women Dual Banners -> Navigates to Gender Services Page */}
        <GenderBanners
          activeGender={selectedGender}
          onExploreGender={(gender) => {
            if (onNavigate) {
              onNavigate('gender-services', { gender });
            } else {
              setSelectedGender(gender);
            }
          }}
        />

        {/* 5. Popular Salons Near You Grid & Heart Favorites -> Navigates to Salon Page */}
        <PopularSalons
          salons={filteredSalons}
          onToggleFavorite={onToggleFavorite}
          onSelectSalon={handleSelectSalonDetail}
          onQuickBook={handleQuickBook}
          filterCategory={selectedCategory}
          filterGender={selectedGender}
          searchQuery={searchQuery}
          onResetFilters={handleResetFilters}
        />

      </main>

      {/* Fixed Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeNavTab}
        onTabChange={handleTabChange}
        favoritesCount={favoriteSalons.length}
        bookingsCount={userBookings.length}
      />

      {/* --- Drawers & Overlays --- */}

      {/* Favorites Drawer */}
      <FavoritesDrawer
        isOpen={isFavoritesDrawerOpen}
        onClose={() => {
          setIsFavoritesDrawerOpen(false);
          setActiveNavTab('home');
        }}
        favoriteSalons={favoriteSalons}
        onRemoveFavorite={onToggleFavorite}
        onBookSalon={(salon) => {
          setIsFavoritesDrawerOpen(false);
          handleQuickBook(salon);
        }}
      />

      {/* Profile Drawer */}
      <ProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={() => {
          setIsProfileDrawerOpen(false);
          setActiveNavTab('home');
        }}
        bookingsCount={userBookings.length}
        favoritesCount={favoriteSalons.length}
        onOpenBookings={() => {
          setIsProfileDrawerOpen(false);
          if (onNavigate) onNavigate('my-bookings');
        }}
        onOpenFavorites={() => {
          setIsProfileDrawerOpen(false);
          setIsFavoritesDrawerOpen(true);
        }}
        onOpenOffers={() => {
          setIsProfileDrawerOpen(false);
          if (onNavigate) onNavigate('offers');
        }}
        onOpenOwnerDashboard={() => {
          setIsProfileDrawerOpen(false);
          if (onNavigate) onNavigate('owner-dashboard');
        }}
        onOpenAuth={() => {
          setIsProfileDrawerOpen(false);
          if (onOpenAuth) onOpenAuth('login');
        }}
      />

      {/* Side Menu Drawer */}
      <SideMenuDrawer
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
        onNavigate={onNavigate}
        currentUser={currentUser}
        onOpenAuth={onOpenAuth}
        onOpenOffers={() => {
          setIsSideMenuOpen(false);
          if (onNavigate) onNavigate('offers');
        }}
        onOpenBookings={() => {
          setIsSideMenuOpen(false);
          if (onNavigate) onNavigate('my-bookings');
        }}
      />

      {/* Notifications Modal */}
      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
        onNavigateNotification={(item) => {
          setIsNotificationsOpen(false);
          if (item.type === 'offer' && onNavigate) {
            onNavigate('offers');
          } else if (item.type === 'booking' && onNavigate) {
            onNavigate('my-bookings');
          }
        }}
      />

    </div>
  );
}
