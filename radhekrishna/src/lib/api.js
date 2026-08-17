// ==========================================================
// AAORA Salon Tech - In-Memory & LocalStorage Demo Engine
// 100% Standalone Demo Data - Zero External Database Required
// ==========================================================

import {
  INITIAL_SALONS,
  INITIAL_BOOKINGS_DATA,
  INITIAL_NOTIFICATIONS,
  OFFERS_DATA,
  STYLE_LOOKS,
} from '../home/mockData';

// Storage keys
const KEY_TOKEN = 'aaora_token';
const KEY_USER = 'aaora_user';
const KEY_SALONS = 'aaora_salons_demo';
const KEY_BOOKINGS = 'aaora_bookings_demo';
const KEY_REVIEWS = 'aaora_reviews_demo';
const KEY_ADMIN_SETTINGS = 'aaora_admin_settings';
const KEY_USERS_LIST = 'aaora_users_list';

// Default Demo Users
const DEMO_USERS = [
  {
    id: 'usr-cust-1',
    name: 'Ajeet Lodhi',
    email: 'ajeetlodhii01@gmail.com',
    phone: '+91 98765 43210',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    status: 'active',
    hairType: 'Wavy / Medium Density',
    preferredTime: '11:00 AM - 02:00 PM',
    favoriteServices: ['Signature Haircut', 'Beard Sculpting'],
    joinedDate: 'Jan 2025',
    totalVisits: 14,
    token: 'jwt_demo_customer_token',
  },
  {
    id: 'usr-owner-1',
    name: 'Vikram Malhotra',
    email: 'owner@lookssalon.com',
    phone: '+91 98260 11223',
    role: 'owner',
    salonId: 'looks-salon',
    salonName: 'Looks Salon',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
    status: 'active',
    joinedDate: 'Nov 2024',
    token: 'jwt_demo_owner_token',
  },
  {
    id: 'usr-admin-1',
    name: 'Aaora Super Admin',
    email: 'admin@aaora.com',
    phone: '+91 80000 99999',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    status: 'active',
    joinedDate: 'Oct 2024',
    token: 'jwt_demo_admin_token',
  },
];

// Helper to simulate micro-latency for realistic UI experience
const delay = (ms = 40) => new Promise((resolve) => setTimeout(resolve, ms));

// Safe LocalStorage helpers
function getLocalData(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function setLocalData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`LocalStorage write error for ${key}:`, e);
  }
}

// Initialize seed data on first run
function ensureInitialized() {
  if (!localStorage.getItem(KEY_SALONS)) {
    setLocalData(KEY_SALONS, INITIAL_SALONS);
  }
  if (!localStorage.getItem(KEY_BOOKINGS)) {
    setLocalData(KEY_BOOKINGS, INITIAL_BOOKINGS_DATA);
  }
  if (!localStorage.getItem(KEY_USERS_LIST)) {
    setLocalData(KEY_USERS_LIST, DEMO_USERS);
  }
  if (!localStorage.getItem(KEY_ADMIN_SETTINGS)) {
    setLocalData(KEY_ADMIN_SETTINGS, {
      platformCommissionRate: 5,
      advanceBookingPercentage: 25,
      cancellationFeeFlat: 20,
      announcement: '✨ Festive Bonanza: 40% OFF with code AAORA40 across all verified salons!',
      autoConfirmBookings: true,
      remindersEnabled: true,
    });
  }
}

ensureInitialized();

// ------------------------------------
// AUTHENTICATION & SESSION
// ------------------------------------

export function getStoredToken() {
  return localStorage.getItem(KEY_TOKEN) || 'jwt_demo_customer_token';
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem(KEY_TOKEN, token);
  } else {
    localStorage.removeItem(KEY_TOKEN);
  }
}

export function getStoredUser() {
  const user = getLocalData(KEY_USER, null);
  if (user) return user;
  return DEMO_USERS[0]; // Default to Customer Ajeet Lodhi
}

export function setStoredUser(user) {
  if (user) {
    setLocalData(KEY_USER, user);
  } else {
    localStorage.removeItem(KEY_USER);
  }
}

export function logoutUser() {
  setStoredToken(null);
  setStoredUser(null);
}

export async function loginUser(email, password, requestedRole) {
  await delay(60);
  ensureInitialized();
  const users = getLocalData(KEY_USERS_LIST, DEMO_USERS);
  
  // Find matching user by email or fallback by role
  let found = users.find(
    (u) => u.email.toLowerCase() === (email || '').toLowerCase()
  );

  if (!found && requestedRole) {
    found = users.find((u) => u.role === requestedRole) || DEMO_USERS.find((u) => u.role === requestedRole);
  }

  if (!found) {
    // Create new customer profile on the fly
    found = {
      id: `usr-${Date.now()}`,
      name: email ? email.split('@')[0] : 'Aaora Customer',
      email: email || 'user@aaora.com',
      phone: '+91 98765 00000',
      role: requestedRole || 'customer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      status: 'active',
      token: `jwt_demo_${requestedRole || 'customer'}_${Date.now()}`,
    };
    users.push(found);
    setLocalData(KEY_USERS_LIST, users);
  }

  setStoredToken(found.token || `jwt_${found.role}_demo`);
  setStoredUser(found);

  return {
    success: true,
    token: found.token,
    user: found,
    message: `Welcome back, ${found.name}!`,
  };
}

export async function registerUser(userData) {
  await delay(60);
  ensureInitialized();
  const users = getLocalData(KEY_USERS_LIST, DEMO_USERS);

  const newUser = {
    id: `usr-${Date.now()}`,
    name: userData.name || 'Aaora Customer',
    email: userData.email || 'customer@aaora.com',
    phone: userData.phone || '+91 98765 43210',
    role: userData.role || 'customer',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    status: 'active',
    joinedDate: 'Just now',
    salonId: userData.role === 'owner' ? 'looks-salon' : undefined,
    token: `jwt_demo_${userData.role || 'customer'}_${Date.now()}`,
  };

  users.push(newUser);
  setLocalData(KEY_USERS_LIST, users);
  setStoredToken(newUser.token);
  setStoredUser(newUser);

  return {
    success: true,
    token: newUser.token,
    user: newUser,
    message: 'Account registered successfully!',
  };
}

export async function submitOnboarding(onboardingData) {
  await delay(40);
  const currentUser = getStoredUser();
  if (currentUser) {
    const updated = { ...currentUser, ...onboardingData, onboardingComplete: true };
    setStoredUser(updated);
    return { success: true, user: updated };
  }
  return { success: true };
}

export async function getUserProfile() {
  await delay(20);
  return { success: true, user: getStoredUser() };
}

// ------------------------------------
// SALON DISCOVERY & BARBERS
// ------------------------------------

export async function fetchSalons(params = {}) {
  await delay(40);
  ensureInitialized();
  let list = getLocalData(KEY_SALONS, INITIAL_SALONS);

  if (params.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim();
    list = list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.services?.some((srv) => srv.name.toLowerCase().includes(q))
    );
  }

  if (params.city && params.city !== 'all') {
    list = list.filter((s) => s.city?.toLowerCase() === params.city.toLowerCase());
  }

  if (params.gender && params.gender !== 'all') {
    list = list.filter((s) => s.gender === 'unisex' || s.gender === params.gender);
  }

  if (params.category && params.category !== 'all') {
    list = list.filter((s) =>
      s.services?.some((srv) => srv.category?.toLowerCase() === params.category.toLowerCase())
    );
  }

  return { success: true, salons: list };
}

export async function fetchSalonById(salonId) {
  await delay(30);
  ensureInitialized();
  const list = getLocalData(KEY_SALONS, INITIAL_SALONS);
  const salon = list.find((s) => s.id === salonId) || list[0];
  return { success: true, salon };
}

export async function checkSlotAvailability(salonId, dateKey, barberId, serviceDurationMins = 30) {
  await delay(40);
  ensureInitialized();
  const list = getLocalData(KEY_SALONS, INITIAL_SALONS);
  const salon = list.find((s) => s.id === salonId) || list[0];

  const targetBarber = salon.stylists?.find((b) => b.id === barberId);
  const allBarbers = salon.stylists || [];

  // Barber booked slots for date
  const bookedForBarber = targetBarber?.bookedSlots?.[dateKey] || ['10:00 AM', '03:30 PM'];

  // Identify alternative active barbers on duty
  const alternativeBarbers = allBarbers
    .filter((b) => b.id !== barberId && b.active)
    .map((b) => ({
      id: b.id,
      name: b.name,
      role: b.role,
      rating: b.rating,
      avatar: b.avatar,
      availableSlotsCount: 8,
    }));

  return {
    success: true,
    salonId,
    dateKey,
    barberId,
    bookedSlots: bookedForBarber,
    breaks: targetBarber?.breaks || ['01:00 PM - 02:00 PM'],
    alternativeBarbers,
  };
}

export async function fetchBookAgainData() {
  await delay(30);
  return {
    success: true,
    recentServices: [
      {
        id: 'rec-1',
        salonId: 'looks-salon',
        salonName: 'Looks Salon',
        serviceName: 'Signature Haircut & Wash',
        stylist: 'Aarav Sharma',
        price: 349,
        lastBooked: '12 days ago',
      },
      {
        id: 'rec-2',
        salonId: 'the-hair-craft',
        salonName: 'The Hair Craft',
        serviceName: 'Executive Beard Sculpt & Hot Towel',
        stylist: 'Rohan Mehta',
        price: 199,
        lastBooked: '3 weeks ago',
      },
    ],
  };
}

export async function fetchRegularSalon() {
  await delay(30);
  const salons = getLocalData(KEY_SALONS, INITIAL_SALONS);
  return {
    success: true,
    regularSalon: salons[0],
    favoriteBarber: salons[0].stylists[0],
    visitCount: 14,
  };
}

// ------------------------------------
// CUSTOMER BOOKINGS & DIGITAL PASS
// ------------------------------------

export async function fetchCustomerBookings() {
  await delay(30);
  ensureInitialized();
  const bookings = getLocalData(KEY_BOOKINGS, INITIAL_BOOKINGS_DATA);
  return { success: true, bookings };
}

export const fetchUserBookings = fetchCustomerBookings;

export async function fetchBookingPass(bookingId) {
  await delay(30);
  ensureInitialized();
  const bookings = getLocalData(KEY_BOOKINGS, INITIAL_BOOKINGS_DATA);
  const booking = bookings.find((b) => b.id === bookingId) || bookings[0];
  return { success: true, booking };
}

export async function createNewBooking(bookingPayload) {
  await delay(60);
  ensureInitialized();
  const bookings = getLocalData(KEY_BOOKINGS, INITIAL_BOOKINGS_DATA);

  const newId = `BK-${Math.floor(100000 + Math.random() * 900000)}`;
  const qrData = `${newId}-${bookingPayload.salonId || 'LOOKS'}-${Date.now()}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;

  const newBooking = {
    id: newId,
    salonId: bookingPayload.salonId || 'looks-salon',
    salonName: bookingPayload.salonName || 'Looks Salon',
    salonAddress: bookingPayload.salonAddress || 'Plot 14, Ring Road, Vijay Nagar, Indore',
    salonImage: bookingPayload.salonImage || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    salonPhone: bookingPayload.salonPhone || '+91 731 425 8890',
    serviceName: bookingPayload.serviceName || 'Signature Haircut & Wash',
    services: bookingPayload.services || [
      { name: bookingPayload.serviceName || 'Signature Haircut', price: bookingPayload.price || 349, duration: '40 mins' },
    ],
    totalDuration: bookingPayload.totalDuration || '45 mins',
    price: bookingPayload.price || 349,
    discount: bookingPayload.discount || 0,
    tax: bookingPayload.tax || 25,
    totalAmount: bookingPayload.totalAmount || 349,
    paymentMethod: bookingPayload.paymentMethod || 'Razorpay Online',
    paymentStatus: bookingPayload.paymentMethod === 'Pay at Salon' ? 'Pending at Venue' : 'Paid Full',
    advancePaid: bookingPayload.paymentMethod === 'Pay at Salon' ? 0 : (bookingPayload.totalAmount || 349),
    remainingAmount: bookingPayload.paymentMethod === 'Pay at Salon' ? (bookingPayload.totalAmount || 349) : 0,
    transactionId: `pay_rzp_${Math.random().toString(36).substring(2, 10)}`,
    date: bookingPayload.date || 'Tomorrow, 11:00 AM',
    rawDate: bookingPayload.rawDate || new Date().toISOString().split('T')[0],
    time: bookingPayload.time || '11:00 AM',
    endTime: bookingPayload.endTime || '11:45 AM',
    stylist: bookingPayload.stylist || 'Aarav Sharma (Master Stylist)',
    stylistAvatar: bookingPayload.stylistAvatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    status: 'Confirmed',
    qrCodeUrl: qrUrl,
    customerName: bookingPayload.customerName || 'Ajeet Lodhi',
    customerPhone: bookingPayload.customerPhone || '+91 98765 43210',
    customerEmail: bookingPayload.customerEmail || 'ajeetlodhii01@gmail.com',
    createdAt: new Date().toISOString(),
    isReviewed: false,
    remindersEnabled: true,
  };

  const updated = [newBooking, ...bookings];
  setLocalData(KEY_BOOKINGS, updated);

  return {
    success: true,
    booking: newBooking,
    message: 'Appointment booked & confirmed instantly!',
  };
}

export async function rescheduleBooking(bookingId, newDate, newTime) {
  await delay(40);
  ensureInitialized();
  const bookings = getLocalData(KEY_BOOKINGS, INITIAL_BOOKINGS_DATA);
  let updatedBooking = null;

  const updated = bookings.map((b) => {
    if (b.id === bookingId) {
      updatedBooking = {
        ...b,
        date: newDate,
        time: newTime,
        status: 'Confirmed',
        rescheduledAt: new Date().toISOString(),
      };
      return updatedBooking;
    }
    return b;
  });

  setLocalData(KEY_BOOKINGS, updated);
  return { success: true, booking: updatedBooking, message: 'Appointment rescheduled successfully!' };
}

export async function cancelBooking(bookingId) {
  await delay(40);
  ensureInitialized();
  const bookings = getLocalData(KEY_BOOKINGS, INITIAL_BOOKINGS_DATA);
  let updatedBooking = null;

  const updated = bookings.map((b) => {
    if (b.id === bookingId) {
      updatedBooking = {
        ...b,
        status: 'Cancelled',
        cancelledAt: new Date().toISOString(),
      };
      return updatedBooking;
    }
    return b;
  });

  setLocalData(KEY_BOOKINGS, updated);
  return { success: true, booking: updatedBooking, message: 'Booking cancelled. Refund processed to source.' };
}

export async function updateArrivalStatus(bookingId, statusType, delayMinutes = 0) {
  await delay(30);
  ensureInitialized();
  const bookings = getLocalData(KEY_BOOKINGS, INITIAL_BOOKINGS_DATA);

  const updated = bookings.map((b) => {
    if (b.id === bookingId) {
      return {
        ...b,
        arrivalStatus: statusType,
        arrivalDelayMinutes: delayMinutes,
        status: statusType === 'arrived' ? 'Customer Arrived' : b.status,
        arrivalNotifiedAt: new Date().toISOString(),
      };
    }
    return b;
  });

  setLocalData(KEY_BOOKINGS, updated);
  return { success: true, message: `Salon notified: ${statusType.replace('_', ' ')}` };
}

export async function submitBookingReview(bookingId, reviewData) {
  await delay(40);
  ensureInitialized();
  const bookings = getLocalData(KEY_BOOKINGS, INITIAL_BOOKINGS_DATA);

  const updated = bookings.map((b) => {
    if (b.id === bookingId) {
      return {
        ...b,
        isReviewed: true,
        userRating: reviewData.salonRating || 5,
        stylistRating: reviewData.stylistRating || 5,
        userReview: reviewData.reviewText || '',
        reviewedAt: new Date().toISOString(),
      };
    }
    return b;
  });

  setLocalData(KEY_BOOKINGS, updated);
  return { success: true, message: 'Thank you! Your verified review is published.' };
}

// ------------------------------------
// SALON OWNER PORTAL
// ------------------------------------

export async function fetchOwnerDashboard() {
  await delay(40);
  ensureInitialized();
  const bookings = getLocalData(KEY_BOOKINGS, INITIAL_BOOKINGS_DATA);
  const salons = getLocalData(KEY_SALONS, INITIAL_SALONS);
  const ownerSalon = salons[0]; // Looks Salon

  const salonBookings = bookings.filter((b) => b.salonId === 'looks-salon');
  const todayCount = salonBookings.filter((b) => b.status !== 'Cancelled').length;
  const completed = salonBookings.filter((b) => b.status === 'Completed');
  const totalRevenue = salonBookings
    .filter((b) => b.status === 'Completed' || b.status === 'Confirmed')
    .reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

  return {
    success: true,
    salon: ownerSalon,
    metrics: {
      todayAppointments: todayCount || 5,
      activeQueue: salonBookings.filter((b) => b.status === 'Confirmed' || b.status === 'Customer Arrived' || b.status === 'In Progress').length || 3,
      totalRevenue: totalRevenue || 12450,
      netPayout: Math.round(totalRevenue * 0.95) || 11827,
      completedToday: completed.length || 2,
      activeBarbers: ownerSalon.stylists.filter((s) => s.active).length || 3,
      rating: ownerSalon.rating || 4.7,
      reviewsCount: ownerSalon.reviewsCount || 1240,
    },
    upcomingBookings: salonBookings,
  };
}

export async function fetchOwnerAppointments() {
  await delay(30);
  ensureInitialized();
  const bookings = getLocalData(KEY_BOOKINGS, INITIAL_BOOKINGS_DATA);
  const salonBookings = bookings.filter((b) => b.salonId === 'looks-salon');
  return { success: true, appointments: salonBookings };
}

export async function updateOwnerBookingStatus(bookingId, status) {
  await delay(40);
  ensureInitialized();
  const bookings = getLocalData(KEY_BOOKINGS, INITIAL_BOOKINGS_DATA);

  const updated = bookings.map((b) => (b.id === bookingId ? { ...b, status } : b));
  setLocalData(KEY_BOOKINGS, updated);

  return { success: true, bookingId, status, message: `Appointment status updated to ${status}` };
}

export async function verifyOwnerQrCheckin(bookingId) {
  await delay(40);
  ensureInitialized();
  const bookings = getLocalData(KEY_BOOKINGS, INITIAL_BOOKINGS_DATA);
  const matched = bookings.find((b) => b.id.toLowerCase() === (bookingId || '').toLowerCase().trim());

  if (!matched) {
    // If ID not found directly, create verified pass for demo
    return {
      success: true,
      verified: true,
      booking: {
        id: bookingId,
        customerName: 'Ajeet Lodhi',
        serviceName: 'Signature Haircut & Wash',
        stylist: 'Aarav Sharma',
        time: '11:00 AM',
        status: 'Customer Arrived',
        verifiedAt: new Date().toLocaleTimeString(),
      },
      message: 'QR Pass Verified Successfully!',
    };
  }

  const updated = bookings.map((b) =>
    b.id === matched.id ? { ...b, status: 'Customer Arrived', verifiedAt: new Date().toISOString() } : b
  );
  setLocalData(KEY_BOOKINGS, updated);

  return {
    success: true,
    verified: true,
    booking: { ...matched, status: 'Customer Arrived' },
    message: `QR Verified! ${matched.customerName} is checked in.`,
  };
}

export async function fetchOwnerBarbers() {
  await delay(30);
  ensureInitialized();
  const salons = getLocalData(KEY_SALONS, INITIAL_SALONS);
  return { success: true, barbers: salons[0]?.stylists || [] };
}

export async function addOwnerBarber(barberData) {
  await delay(50);
  ensureInitialized();
  const salons = getLocalData(KEY_SALONS, INITIAL_SALONS);
  const newBarber = {
    id: `s-${Date.now()}`,
    name: barberData.name || 'New Stylist',
    role: barberData.role || 'Senior Stylist',
    specialization: barberData.specialization || 'Precision Cuts & Styling',
    experience: barberData.experience || '4 years',
    rating: 5.0,
    reviewsCount: 0,
    avatar: barberData.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    workingHours: barberData.workingHours || '09:00 AM - 08:00 PM',
    breaks: ['01:30 PM - 02:30 PM'],
    daysOff: barberData.daysOff || ['Tuesday'],
    active: true,
    bookedSlots: {},
  };

  salons[0].stylists.push(newBarber);
  setLocalData(KEY_SALONS, salons);

  return { success: true, barber: newBarber, message: `${newBarber.name} added to salon roster!` };
}

export async function updateOwnerBarber(barberId, updates) {
  await delay(40);
  ensureInitialized();
  const salons = getLocalData(KEY_SALONS, INITIAL_SALONS);

  salons[0].stylists = salons[0].stylists.map((b) => (b.id === barberId ? { ...b, ...updates } : b));
  setLocalData(KEY_SALONS, salons);

  return { success: true, message: 'Barber profile updated!' };
}

export async function fetchOwnerServices() {
  await delay(30);
  ensureInitialized();
  const salons = getLocalData(KEY_SALONS, INITIAL_SALONS);
  return { success: true, services: salons[0]?.services || [] };
}

export async function addOwnerService(serviceData) {
  await delay(40);
  ensureInitialized();
  const salons = getLocalData(KEY_SALONS, INITIAL_SALONS);
  const newService = {
    id: `srv-${Date.now()}`,
    name: serviceData.name || 'Special Treatment',
    category: serviceData.category || 'haircut',
    price: Number(serviceData.price) || 499,
    originalPrice: Number(serviceData.originalPrice) || 699,
    duration: serviceData.duration || '45 mins',
    popular: true,
    description: serviceData.description || 'Premium salon care with organic products.',
  };

  salons[0].services.push(newService);
  setLocalData(KEY_SALONS, salons);

  return { success: true, service: newService, message: 'Service added to salon menu!' };
}

// ------------------------------------
// SUPER ADMIN DASHBOARD
// ------------------------------------

export async function fetchAdminDashboard() {
  await delay(40);
  ensureInitialized();
  const bookings = getLocalData(KEY_BOOKINGS, INITIAL_BOOKINGS_DATA);
  const salons = getLocalData(KEY_SALONS, INITIAL_SALONS);
  const users = getLocalData(KEY_USERS_LIST, DEMO_USERS);

  const totalGMV = bookings.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
  const totalCommission = Math.round(totalGMV * 0.05);

  return {
    success: true,
    metrics: {
      totalGMV: totalGMV || 24500,
      totalCommissionRevenue: totalCommission || 1225,
      totalBookingsCount: bookings.length || 14,
      activeSalonsCount: salons.length || 4,
      registeredUsersCount: users.length || 6,
      completedAppointmentsCount: bookings.filter((b) => b.status === 'Completed').length || 8,
    },
  };
}

export async function fetchAdminUsers() {
  await delay(30);
  ensureInitialized();
  const users = getLocalData(KEY_USERS_LIST, DEMO_USERS);
  return { success: true, users };
}

export async function updateAdminUserStatus(userId, status) {
  await delay(30);
  ensureInitialized();
  const users = getLocalData(KEY_USERS_LIST, DEMO_USERS);
  const updated = users.map((u) => (u.id === userId ? { ...u, status } : u));
  setLocalData(KEY_USERS_LIST, updated);
  return { success: true, userId, status, message: `User status changed to ${status}` };
}

export async function fetchAdminSalons() {
  await delay(30);
  ensureInitialized();
  const salons = getLocalData(KEY_SALONS, INITIAL_SALONS);
  const mapped = salons.map((s) => ({
    ...s,
    status: s.status || 'verified',
    commissionRate: s.commissionRate || 5,
    ownerEmail: `${s.id}@aaora.com`,
  }));
  return { success: true, salons: mapped };
}

export async function updateAdminSalon(salonId, updates) {
  await delay(30);
  ensureInitialized();
  const salons = getLocalData(KEY_SALONS, INITIAL_SALONS);
  const updated = salons.map((s) => (s.id === salonId ? { ...s, ...updates } : s));
  setLocalData(KEY_SALONS, updated);
  return { success: true, salonId, updates, message: 'Salon configuration updated!' };
}

export async function fetchAdminBookings() {
  await delay(30);
  ensureInitialized();
  const bookings = getLocalData(KEY_BOOKINGS, INITIAL_BOOKINGS_DATA);
  return { success: true, bookings };
}

export async function fetchAdminPayments() {
  await delay(30);
  ensureInitialized();
  const bookings = getLocalData(KEY_BOOKINGS, INITIAL_BOOKINGS_DATA);
  const payments = bookings.map((b) => ({
    id: b.transactionId || `tx-${b.id}`,
    bookingId: b.id,
    customerName: b.customerName,
    salonName: b.salonName,
    amount: b.totalAmount,
    commissionCut: Math.round(b.totalAmount * 0.05),
    method: b.paymentMethod,
    status: b.paymentStatus === 'Paid Full' ? 'Settled' : 'Pending',
    date: b.date,
  }));
  return { success: true, payments };
}

export async function fetchAdminReviews() {
  await delay(30);
  ensureInitialized();
  const reviews = [
    {
      id: 'rev-1',
      salonName: 'Looks Salon',
      customerName: 'Ajeet Lodhi',
      rating: 5,
      comment: 'Top notch service and ultra clean instruments. Aarav is the best barber in Indore!',
      status: 'approved',
      date: 'Yesterday',
    },
    {
      id: 'rev-2',
      salonName: 'The Hair Craft',
      customerName: 'Riya Sharma',
      rating: 4,
      comment: 'Nice ambiance and courteous staff. Quick check-in with QR code.',
      status: 'approved',
      date: '3 days ago',
    },
    {
      id: 'rev-3',
      salonName: 'Style Studio',
      customerName: 'Priya Joshi',
      rating: 5,
      comment: 'The brightening facial worked wonders. Very satisfied with the service.',
      status: 'approved',
      date: '1 week ago',
    },
  ];
  return { success: true, reviews };
}

export async function updateAdminReviewStatus(reviewId, status) {
  await delay(30);
  return { success: true, reviewId, status, message: `Review marked as ${status}` };
}

export async function fetchAdminSettings() {
  await delay(30);
  ensureInitialized();
  const settings = getLocalData(KEY_ADMIN_SETTINGS, {
    platformCommissionRate: 5,
    advanceBookingPercentage: 25,
    cancellationFeeFlat: 20,
    announcement: '✨ Festive Bonanza: 40% OFF with code AAORA40 across all verified salons!',
  });
  return { success: true, settings };
}

export async function updateAdminSettings(settings) {
  await delay(40);
  ensureInitialized();
  setLocalData(KEY_ADMIN_SETTINGS, settings);
  return { success: true, settings, message: 'Platform system settings updated!' };
}
