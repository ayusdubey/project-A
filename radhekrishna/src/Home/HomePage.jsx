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

export default function HomePage() {
  // Global / Home States
  const [salons, setSalons] = useState(INITIAL_SALONS);
  const [selectedCity, setSelectedCity] = useState('Indore');
  const [selectedArea, setSelectedArea] = useState('Vijay Nagar');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const [activeNavTab, setActiveNavTab] = useState('home');

  // Bookings state
  const [userBookings, setUserBookings] = useState([
    {
      id: 'BK-892140',
      salonId: 'looks-salon',
      salonName: 'Looks Salon',
      salonAddress: 'Plot 14, Ring Road, Vijay Nagar',
      salonImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
      serviceName: 'Signature Haircut & Wash',
      servicePrice: 349,
      date: 'Tomorrow (16 Aug)',
      time: '11:00 AM',
      stylistName: 'Aarav Sharma',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    },
  ]);

  // Notifications State
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  // Modals and Drawers visibility states
  const [selectedSalonForBooking, setSelectedSalonForBooking] = useState(null);
  const [preselectedService, setPreselectedService] = useState(null);
  const [selectedSalonDetail, setSelectedSalonDetail] = useState(null);
  const [isOffersOpen, setIsOffersOpen] = useState(false);
  const [isBookingsDrawerOpen, setIsBookingsDrawerOpen] = useState(false);
  const [isFavoritesDrawerOpen, setIsFavoritesDrawerOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAllServicesOpen, setIsAllServicesOpen] = useState(false);

  // Toggle favorite status for salons
  const handleToggleFavorite = (salonId) => {
    setSalons((prev) =>
      prev.map((s) => (s.id === salonId ? { ...s, isFavorite: !s.isFavorite } : s))
    );
  };

  // Quick book trigger
  const handleQuickBook = (salon, service = null) => {
    setSelectedSalonForBooking(salon);
    setPreselectedService(service);
  };

  // Confirm booking handler
  const handleConfirmBooking = (newBooking) => {
    setUserBookings((prev) => [newBooking, ...prev]);
  };

  // Cancel booking handler
  const handleCancelBooking = (bookingId) => {
    setUserBookings((prev) => prev.filter((b) => b.id !== bookingId));
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
      // Search matching (salon name, address, or service names)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = salon.name.toLowerCase().includes(q);
        const matchesAddress = salon.address.toLowerCase().includes(q);
        const matchesService = salon.services?.some((s) => s.name.toLowerCase().includes(q));
        if (!matchesName && !matchesAddress && !matchesService) return false;
      }

      // Category matching
      if (selectedCategory !== 'all') {
        const hasServiceInCategory = salon.services?.some(
          (s) => s.category.toLowerCase() === selectedCategory.toLowerCase()
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
    if (tabId === 'bookings') {
      setIsBookingsDrawerOpen(true);
    } else if (tabId === 'favorites') {
      setIsFavoritesDrawerOpen(true);
    } else if (tabId === 'offers') {
      setIsOffersOpen(true);
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
        onFilterGender={setSelectedGender}
      />

      {/* Main Home Page Body */}
      <main className="flex-1 w-full">
        
        {/* 1. Hero Royal Blue Banner with Model Photo & CTA */}
        <HeroBanner
          onBookAppointment={() => handleQuickBook(salons[0])}
        />

        {/* 2. Special Offers Floating Banner */}
        <OffersBanner
          onOpenOffers={() => setIsOffersOpen(true)}
        />

        {/* 3. Our Services 6-Grid Category Selector */}
        <ServicesGrid
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onViewAllServices={() => setIsAllServicesOpen(true)}
        />

        {/* 4. For Men & For Women Dual Banners */}
        <GenderBanners
          activeGender={selectedGender}
          onSelectGender={(g) => setSelectedGender(g === selectedGender ? 'all' : g)}
        />

        {/* 5. Popular Salons Near You Grid & Heart Favorites */}
        <PopularSalons
          salons={filteredSalons}
          onToggleFavorite={handleToggleFavorite}
          onSelectSalon={(s) => setSelectedSalonDetail(s)}
          onQuickBook={(s) => handleQuickBook(s)}
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

      {/* --- Modals & Drawers --- */}

      {/* Booking Appointment Modal */}
      {selectedSalonForBooking && (
        <BookingModal
          salon={selectedSalonForBooking}
          initialService={preselectedService}
          onClose={() => {
            setSelectedSalonForBooking(null);
            setPreselectedService(null);
          }}
          onConfirmBooking={handleConfirmBooking}
        />
      )}

      {/* Salon Details Modal */}
      {selectedSalonDetail && (
        <SalonDetailModal
          salon={selectedSalonDetail}
          onClose={() => setSelectedSalonDetail(null)}
          onBookService={(salon, service) => {
            setSelectedSalonDetail(null);
            handleQuickBook(salon, service);
          }}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {/* Special Offers / Coupons Modal */}
      {isOffersOpen && (
        <OffersModal
          onClose={() => {
            setIsOffersOpen(false);
            setActiveNavTab('home');
          }}
          onApplyOffer={(code) => {
            setIsOffersOpen(false);
            handleQuickBook(salons[0]);
          }}
        />
      )}

      {/* Bookings Drawer */}
      <BookingsDrawer
        isOpen={isBookingsDrawerOpen}
        onClose={() => {
          setIsBookingsDrawerOpen(false);
          setActiveNavTab('home');
        }}
        bookings={userBookings}
        onCancelBooking={handleCancelBooking}
      />

      {/* Favorites Drawer */}
      <FavoritesDrawer
        isOpen={isFavoritesDrawerOpen}
        onClose={() => {
          setIsFavoritesDrawerOpen(false);
          setActiveNavTab('home');
        }}
        favoriteSalons={favoriteSalons}
        onSelectSalon={(s) => setSelectedSalonDetail(s)}
        onRemoveFavorite={handleToggleFavorite}
      />

      {/* Profile Drawer */}
      <ProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={() => {
          setIsProfileDrawerOpen(false);
          setActiveNavTab('home');
        }}
        onOpenOffers={() => setIsOffersOpen(true)}
        onOpenBookings={() => setIsBookingsDrawerOpen(true)}
      />

      {/* Side Menu Drawer */}
      <SideMenuDrawer
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
        onOpenOffers={() => setIsOffersOpen(true)}
        onOpenBookings={() => setIsBookingsDrawerOpen(true)}
      />

      {/* Notifications Modal */}
      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllNotificationsRead}
      />

      {/* All Services Extended Modal */}
      <AllServicesModal
        isOpen={isAllServicesOpen}
        onClose={() => setIsAllServicesOpen(false)}
        onSelectCategory={(catId) => setSelectedCategory(catId)}
      />

    </div>
  );
}
