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
  return localStorage.getItem(KEY_TOKEN) || null;
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem(KEY_TOKEN, token);
  } else {
    localStorage.removeItem(KEY_TOKEN);
  }
}

export function getStoredUser() {
  return getLocalData(KEY_USER, null);
}

export function setStoredUser(user) {
  if (user) {
    setLocalData(KEY_USER, user);
  } else {
    localStorage.removeItem(KEY_USER);
  }
}

export async function logoutUser() {
  const token = getStoredToken();
  setStoredToken(null);
  setStoredUser(null);
  if (token) {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (e) {
      // Ignore network errors on logout
    }
  }
}

export async function loginUser(email, password, requestedRole) {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role: requestedRole }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Authentication failed. Please check credentials.');
    }
    setStoredToken(data.token);
    setStoredUser(data.user);
    return {
      success: true,
      token: data.token,
      user: data.user,
      message: data.message || `Welcome back, ${data.user.name}!`,
    };
  } catch (err) {
    // If network error occurred, rethrow
    throw err;
  }
}

export async function registerUser(userData) {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed.');
    }
    setStoredToken(data.token);
    setStoredUser(data.user);
    return {
      success: true,
      token: data.token,
      user: data.user,
      message: data.message || 'Account registered successfully!',
    };
  } catch (err) {
    throw err;
  }
}

export async function submitOnboarding(onboardingData) {
  try {
    const token = getStoredToken();
    const res = await fetch('/api/user/onboarding', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(onboardingData),
    });
    const data = await res.json();
    if (res.ok && data.user) {
      setStoredUser(data.user);
      return { success: true, user: data.user };
    }
  } catch {}

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
  try {
    const token = getStoredToken();
    if (token) {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setStoredUser(data.user);
          return { success: true, user: data.user };
        }
      }
    }
  } catch {}
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
  const token = getStoredToken();
  if (!token) {
    throw new Error('Authentication required: Please log in as a salon owner.');
  }

  const res = await fetch('/api/owner/dashboard', {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to load owner dashboard. Access denied.');
  }

  return {
    success: true,
    salon: data.salon,
    metrics: data.metrics,
    upcomingBookings: data.recentBookings || [],
  };
}

export async function fetchOwnerAppointments() {
  const token = getStoredToken();
  if (!token) throw new Error('Authentication required.');

  const res = await fetch('/api/owner/appointments', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load salon appointments.');
  return { success: true, appointments: data.bookings || [] };
}

export async function updateOwnerBookingStatus(bookingId, status) {
  const token = getStoredToken();
  if (!token) throw new Error('Authentication required.');

  const res = await fetch(`/api/owner/appointments/${bookingId}/status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update booking status.');
  return { success: true, bookingId, status, booking: data.booking, message: data.message };
}

export async function verifyOwnerQrCheckin(bookingId) {
  const token = getStoredToken();
  if (!token) throw new Error('Authentication required.');

  const res = await fetch('/api/owner/qr-checkin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ bookingId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to verify QR code.');
  return {
    success: true,
    verified: true,
    booking: data.booking,
    message: data.message || 'QR Verified successfully!',
  };
}

export async function fetchOwnerBarbers() {
  const token = getStoredToken();
  if (!token) throw new Error('Authentication required.');

  const res = await fetch('/api/owner/barbers', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch barbers.');
  return { success: true, barbers: data.barbers || [] };
}

export async function addOwnerBarber(barberData) {
  const token = getStoredToken();
  if (!token) throw new Error('Authentication required.');

  const res = await fetch('/api/owner/barbers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(barberData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to add barber.');
  return { success: true, barber: data.barber, message: data.message };
}

export async function updateOwnerBarber(barberId, updates) {
  const token = getStoredToken();
  if (!token) throw new Error('Authentication required.');

  const res = await fetch(`/api/owner/barbers/${barberId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update barber.');
  return { success: true, barber: data.barber, message: data.message };
}

export async function fetchOwnerServices() {
  const token = getStoredToken();
  if (!token) throw new Error('Authentication required.');

  const res = await fetch('/api/owner/services', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch services.');
  return { success: true, services: data.services || [] };
}

export async function addOwnerService(serviceData) {
  const token = getStoredToken();
  if (!token) throw new Error('Authentication required.');

  const res = await fetch('/api/owner/services', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(serviceData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to add service.');
  return { success: true, service: data.service, message: data.message };
}

// ------------------------------------
// SUPER ADMIN DASHBOARD
// ------------------------------------

export async function fetchAdminDashboard() {
  const token = getStoredToken();
  if (!token) {
    throw new Error('Authentication required: Administrator access only.');
  }

  const res = await fetch('/api/admin/dashboard', {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Access Denied: Administrator role required.');
  }

  return {
    success: true,
    metrics: data.metrics,
  };
}

export async function fetchAdminUsers() {
  const token = getStoredToken();
  if (!token) throw new Error('Admin authentication required.');

  const res = await fetch('/api/admin/users', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch admin users.');
  return { success: true, users: data.users || [] };
}

export async function updateAdminUserStatus(userId, status) {
  const token = getStoredToken();
  if (!token) throw new Error('Admin authentication required.');

  const res = await fetch(`/api/admin/users/${userId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update user status.');
  return { success: true, userId, status, message: data.message };
}

export async function fetchAdminSalons() {
  const token = getStoredToken();
  if (!token) throw new Error('Admin authentication required.');

  const res = await fetch('/api/admin/salons', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch salons.');
  return { success: true, salons: data.salons || [] };
}

export async function updateAdminSalon(salonId, updates) {
  const token = getStoredToken();
  if (!token) throw new Error('Admin authentication required.');

  const res = await fetch(`/api/admin/salons/${salonId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update salon.');
  return { success: true, salonId, updates, message: data.message };
}

export async function fetchAdminBookings() {
  const token = getStoredToken();
  if (!token) throw new Error('Admin authentication required.');

  const res = await fetch('/api/admin/bookings', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch bookings.');
  return { success: true, bookings: data.bookings || [] };
}

export async function fetchAdminPayments() {
  const token = getStoredToken();
  if (!token) throw new Error('Admin authentication required.');

  const res = await fetch('/api/admin/payments', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch payments.');
  return { success: true, payments: data.payments || [] };
}

export async function fetchAdminReviews() {
  const token = getStoredToken();
  if (!token) throw new Error('Admin authentication required.');

  const res = await fetch('/api/admin/reviews', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch reviews.');
  return { success: true, reviews: data.reviews || [] };
}

export async function updateAdminReviewStatus(reviewId, status) {
  const token = getStoredToken();
  if (!token) throw new Error('Admin authentication required.');

  const res = await fetch(`/api/admin/reviews/${reviewId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update review status.');
  return { success: true, reviewId, status, message: data.message };
}

export async function fetchAdminSettings() {
  const token = getStoredToken();
  if (!token) throw new Error('Admin authentication required.');

  const res = await fetch('/api/admin/settings', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch admin settings.');
  return { success: true, settings: data.settings || {} };
}

export async function updateAdminSettings(settings) {
  const token = getStoredToken();
  if (!token) throw new Error('Admin authentication required.');

  const res = await fetch('/api/admin/settings', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(settings),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update admin settings.');
  return { success: true, settings: data.settings, message: data.message };
}

// ----------------------------------------------------
// SLOTS MANAGEMENT API (Custom, Auto, Blocking)
// ----------------------------------------------------

const KEY_SLOTS = 'aaora_slots_v1';

export async function fetchSlots({ salonId, date, employeeId, status } = {}) {
  try {
    const params = new URLSearchParams();
    if (salonId) params.append('salonId', salonId);
    if (date) params.append('date', date);
    if (employeeId) params.append('employeeId', employeeId);
    if (status) params.append('status', status);

    const token = localStorage.getItem('aaora_token');
    const res = await fetch(`/api/slots?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, slots: data.slots || [] };
    }
  } catch {
    // Fallback to local
  }

  await delay(30);
  ensureInitialized();
  let slots = getLocalData(KEY_SLOTS, []);
  if (salonId) slots = slots.filter((s) => s.salonId === salonId);
  if (date) slots = slots.filter((s) => s.date === date);
  if (employeeId && employeeId !== 'all') slots = slots.filter((s) => s.employeeId === employeeId);
  if (status && status !== 'all') slots = slots.filter((s) => s.status === status);

  return { success: true, slots };
}

export async function generateAutoSlots(payload) {
  try {
    const token = localStorage.getItem('aaora_token');
    const res = await fetch('/api/slots/generate-auto', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to auto-generate slots');
    return { success: true, ...data };
  } catch (err) {
    // Local fallback
    await delay(50);
    ensureInitialized();
    const { salonId, date, slotIntervalMins = 30, employeeId = 'all' } = payload;
    const salons = getLocalData(KEY_SALONS, INITIAL_SALONS);
    const salon = salons.find((s) => s.id === salonId) || salons[0];
    const employees = employeeId === 'all' ? salon.stylists : salon.stylists.filter((e) => e.id === employeeId);

    const timePoints = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM'];
    
    let existingSlots = getLocalData(KEY_SLOTS, []);
    let addedCount = 0;

    employees.forEach((emp) => {
      timePoints.forEach((tp, idx) => {
        const nextTp = timePoints[idx + 1] || '08:30 PM';
        const newSlot = {
          id: `slot-auto-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          salonId: salon.id,
          employeeId: emp.id,
          employeeName: emp.name,
          date,
          startTime: tp,
          endTime: nextTp,
          durationMinutes: slotIntervalMins,
          slotType: 'automatic',
          status: 'AVAILABLE',
          blockReason: null,
        };
        existingSlots.push(newSlot);
        addedCount++;
      });
    });

    setLocalData(KEY_SLOTS, existingSlots);
    return {
      success: true,
      message: `Generated ${addedCount} slots for ${date}`,
      slotsGeneratedCount: addedCount,
    };
  }
}

export async function createCustomSlot(payload) {
  try {
    const token = localStorage.getItem('aaora_token');
    const res = await fetch('/api/slots/custom', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Validation error while creating custom slot');
    return { success: true, slot: data.slot, message: data.message };
  } catch (err) {
    if (err.message && err.message.includes('overlap')) {
      throw err;
    }
    // Fallback
    await delay(30);
    const newSlot = {
      id: `slot-custom-${Date.now()}`,
      ...payload,
      slotType: 'custom',
      status: payload.status || 'AVAILABLE',
    };
    const slots = getLocalData(KEY_SLOTS, []);
    slots.push(newSlot);
    setLocalData(KEY_SLOTS, slots);
    return { success: true, slot: newSlot, message: 'Custom slot created!' };
  }
}

export async function updateSlot(slotId, updates) {
  try {
    const token = localStorage.getItem('aaora_token');
    const res = await fetch(`/api/slots/${slotId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update slot');
    return { success: true, slot: data.slot, message: data.message };
  } catch (err) {
    await delay(30);
    const slots = getLocalData(KEY_SLOTS, []);
    const updated = slots.map((s) => (s.id === slotId ? { ...s, ...updates } : s));
    setLocalData(KEY_SLOTS, updated);
    return { success: true, message: 'Slot updated successfully' };
  }
}

export async function deleteSlot(slotId) {
  try {
    const token = localStorage.getItem('aaora_token');
    const res = await fetch(`/api/slots/${slotId}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete slot');
    return { success: true, message: data.message };
  } catch (err) {
    await delay(30);
    const slots = getLocalData(KEY_SLOTS, []);
    const filtered = slots.filter((s) => s.id !== slotId);
    setLocalData(KEY_SLOTS, filtered);
    return { success: true, message: 'Slot deleted successfully' };
  }
}

export async function blockSlot(slotId, reason = 'Blocked by salon owner') {
  try {
    const token = localStorage.getItem('aaora_token');
    const res = await fetch(`/api/slots/${slotId}/block`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ reason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to block slot');
    return { success: true, slot: data.slot, message: data.message };
  } catch (err) {
    return updateSlot(slotId, { status: 'BLOCKED', blockReason: reason });
  }
}

export async function unblockSlot(slotId) {
  try {
    const token = localStorage.getItem('aaora_token');
    const res = await fetch(`/api/slots/${slotId}/unblock`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to unblock slot');
    return { success: true, slot: data.slot, message: data.message };
  } catch (err) {
    return updateSlot(slotId, { status: 'AVAILABLE', blockReason: null });
  }
}

// ----------------------------------------------------
// STAFF / STYLIST PORTAL API
// ----------------------------------------------------

export async function fetchStaffSchedule(params = {}) {
  try {
    const token = localStorage.getItem('aaora_token');
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/staff/schedule${query ? `?${query}` : ''}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback
  }

  await delay(30);
  ensureInitialized();
  const bookings = getLocalData(KEY_BOOKINGS, INITIAL_BOOKINGS_DATA);
  const activeBookings = bookings.filter((b) => b.status !== 'Cancelled');
  return {
    employee: {
      id: 's1',
      name: 'Aarav Sharma',
      role: 'Master Barber & Hair Stylist',
      rating: 4.9,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      workingHours: '09:30 AM - 08:30 PM',
      breaks: ['01:30 PM - 02:30 PM'],
    },
    salonName: 'Looks Salon & Spa',
    metrics: {
      totalAssigned: bookings.length,
      todayAppointments: activeBookings.length,
      completedAppointments: bookings.filter((b) => b.status === 'Completed').length,
      rating: 4.9,
    },
    inProgressBooking: bookings.find((b) => b.status === 'In Progress') || null,
    upcomingBookings: bookings,
  };
}

export async function updateStaffAppointmentStatus(bookingId, status) {
  try {
    const token = localStorage.getItem('aaora_token');
    const res = await fetch(`/api/staff/appointments/${bookingId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update appointment status');
    return { success: true, booking: data.booking, message: data.message };
  } catch (err) {
    await delay(30);
    const bookings = getLocalData(KEY_BOOKINGS, INITIAL_BOOKINGS_DATA);
    const updated = bookings.map((b) => (b.id === bookingId ? { ...b, status } : b));
    setLocalData(KEY_BOOKINGS, updated);
    return { success: true, message: `Status updated to ${status}` };
  }
}

// ----------------------------------------------------
// OWNER CUSTOMER CRM & PROFILE
// ----------------------------------------------------

export async function fetchOwnerCustomers() {
  try {
    const token = localStorage.getItem('aaora_token');
    const res = await fetch('/api/owner/customers', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback
  }

  await delay(30);
  ensureInitialized();
  const bookings = getLocalData(KEY_BOOKINGS, INITIAL_BOOKINGS_DATA);
  const map = {};
  bookings.forEach((b) => {
    const key = b.customerEmail || b.userId || 'guest';
    if (!map[key]) {
      map[key] = {
        id: b.userId || 'usr-1',
        name: b.customerName || 'Customer',
        email: b.customerEmail || 'user@example.com',
        phone: b.customerPhone || '+91 98765 43210',
        totalVisits: 0,
        totalSpend: 0,
        lastVisitDate: b.date || 'Oct 24',
        preferredStylist: (b.stylist || 'Aarav').split('(')[0].trim(),
        servicesTaken: [],
      };
    }
    map[key].totalVisits += 1;
    map[key].totalSpend += b.totalAmount || 0;
    if (b.serviceName && !map[key].servicesTaken.includes(b.serviceName)) {
      map[key].servicesTaken.push(b.serviceName);
    }
  });

  return { customers: Object.values(map), totalCount: Object.keys(map).length };
}

export async function updateOwnerSalonProfile(profileData) {
  try {
    const token = localStorage.getItem('aaora_token');
    const res = await fetch('/api/owner/salon-profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(profileData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update salon profile');
    return { success: true, salon: data.salon, message: data.message };
  } catch (err) {
    await delay(30);
    return { success: true, message: 'Salon profile updated successfully!' };
  }
}

// ----------------------------------------------------
// PAYMENT SANDBOX
// ----------------------------------------------------

export async function createPaymentOrder(amount, notes = {}) {
  try {
    const token = localStorage.getItem('aaora_token');
    const res = await fetch('/api/payments/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ amount, notes }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback
  }

  return {
    id: `order_${Math.random().toString(36).substring(2, 10)}`,
    amount: Math.round(Number(amount) * 100),
    currency: 'INR',
    status: 'created',
  };
}

export async function verifyPayment(paymentDetails) {
  try {
    const token = localStorage.getItem('aaora_token');
    const res = await fetch('/api/payments/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(paymentDetails),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback
  }

  return {
    success: true,
    transactionId: paymentDetails.razorpay_payment_id || `pay_${Math.random().toString(36).substring(2, 12)}`,
    message: 'Payment verified successfully.',
  };
}

