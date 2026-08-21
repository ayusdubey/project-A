import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'aaora_super_secret_jwt_key_2026';

app.use(express.json());

// ----------------------------------------------------
// IN-MEMORY DATABASE STATE (PRODUCTION-MOCKED IN MEMORY)
// ----------------------------------------------------

let USERS = [
  {
    id: 'usr-customer-1',
    name: 'Ajeet Lodhi',
    email: 'ajeetlodhii01@gmail.com',
    phone: '+91 98765 43210',
    password: 'password123',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    createdAt: '2026-01-10T10:00:00Z',
    status: 'active',
    preferredServices: ['Haircut', 'Beard'],
    location: 'Vijay Nagar, Indore',
    favoriteSalonId: 'looks-salon',
    favoriteBarberName: 'Aarav Sharma',
  },
  {
    id: 'usr-owner-1',
    name: 'Rohit Verma',
    email: 'owner@lookssalon.com',
    phone: '+91 98222 11223',
    password: 'password123',
    role: 'owner',
    salonId: 'looks-salon',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    createdAt: '2026-01-05T09:00:00Z',
    status: 'active',
    location: 'Vijay Nagar, Indore',
  },
  {
    id: 'usr-staff-1',
    name: 'Aarav Sharma',
    email: 'staff@lookssalon.com',
    phone: '+91 98111 22334',
    password: 'password123',
    role: 'staff',
    salonId: 'looks-salon',
    employeeId: 's1',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    createdAt: '2026-01-08T09:00:00Z',
    status: 'active',
    location: 'Vijay Nagar, Indore',
  },
  {
    id: 'usr-admin-1',
    name: 'Platform Admin',
    email: 'admin@aaora.com',
    phone: '+91 99999 00000',
    password: 'admin123',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
    createdAt: '2026-01-01T00:00:00Z',
    status: 'active',
    location: 'Headquarters, Indore',
  },
];

let SALONS = [
  {
    id: 'looks-salon',
    name: 'Looks Salon',
    rating: 4.8,
    reviewsCount: 1240,
    distance: '0.8 km away',
    address: 'Plot 14, Ring Road, Vijay Nagar',
    city: 'Indore',
    lat: 22.7533,
    lng: 75.8937,
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80',
    ],
    startingPrice: 299,
    isFavorite: true,
    gender: 'unisex',
    openingHours: '09:00 AM - 09:30 PM',
    phone: '+91 731 425 8890',
    ownerId: 'usr-owner-1',
    status: 'verified',
    commissionRate: 5,
    crowdStatus: 'Good availability',
    amenities: ['AC Waiting Lounge', 'Complimentary Beverage', 'Free Wi-Fi', 'Card & UPI', 'Sanitized Tools'],
    stylists: [
      {
        id: 's1',
        name: 'Aarav Sharma',
        role: 'Master Hair Stylist',
        specialization: 'Fade Cuts, Texture & Layering',
        experience: '8+ years',
        rating: 4.9,
        reviewsCount: 380,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        workingHours: '09:00 AM - 08:30 PM',
        breaks: ['01:00 PM - 02:00 PM', '05:00 PM - 05:30 PM'],
        daysOff: ['Tuesday'],
        active: true,
        bookedSlots: {
          'Oct 24': ['10:00 AM', '11:00 AM', '03:30 PM', '06:00 PM'],
          'Oct 25': ['10:30 AM', '02:00 PM', '04:30 PM'],
          'Oct 26': ['11:00 AM', '01:00 PM', '05:00 PM'],
        },
      },
      {
        id: 's2',
        name: 'Sneha Verma',
        role: 'Senior Colorist & Stylist',
        specialization: 'Balayage, Keratin, O3+ Facials',
        experience: '6 years',
        rating: 4.8,
        reviewsCount: 290,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        workingHours: '10:00 AM - 09:00 PM',
        breaks: ['01:30 PM - 02:30 PM'],
        daysOff: ['Wednesday'],
        active: true,
        bookedSlots: {
          'Oct 24': ['11:30 AM', '02:30 PM', '04:00 PM'],
          'Oct 25': ['10:00 AM', '01:30 PM'],
          'Oct 26': ['12:30 PM', '03:30 PM'],
        },
      },
      {
        id: 's3',
        name: 'Vikram Mehta',
        role: 'Beard & Precision Barber',
        specialization: 'Beard Sculpting, Razor Fades & Head Spa',
        experience: '5 years',
        rating: 4.85,
        reviewsCount: 215,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        workingHours: '09:30 AM - 09:00 PM',
        breaks: ['02:00 PM - 03:00 PM'],
        daysOff: ['Monday'],
        active: true,
        bookedSlots: {
          'Oct 24': ['09:30 AM', '01:30 PM', '07:00 PM'],
          'Oct 25': ['11:00 AM', '03:00 PM'],
          'Oct 26': ['10:00 AM', '02:00 PM'],
        },
      },
      {
        id: 's4',
        name: 'Priya Patel',
        role: 'Skin & Bridal Specialist',
        specialization: 'Hydra Facials, Organic Waxing & Makeup',
        experience: '7 years',
        rating: 4.92,
        reviewsCount: 310,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        workingHours: '10:00 AM - 08:00 PM',
        breaks: ['01:00 PM - 02:00 PM'],
        daysOff: ['Thursday'],
        active: true,
        bookedSlots: {
          'Oct 24': ['10:30 AM', '12:30 PM', '04:30 PM'],
          'Oct 25': ['11:30 AM', '03:30 PM'],
          'Oct 26': ['01:30 PM', '05:30 PM'],
        },
      },
    ],
    services: [
      { id: 'ls-1', name: 'Signature Haircut & Wash', category: 'haircut', duration: '40 mins', price: 349, originalPrice: 499, popular: true },
      { id: 'ls-2', name: 'Beard Sculpting & Hot Towel', category: 'beard', duration: '25 mins', price: 199, originalPrice: 250, popular: true },
      { id: 'ls-3', name: 'Deep Cleansing Charcoal Facial', category: 'facial', duration: '50 mins', price: 799, originalPrice: 1200 },
      { id: 'ls-4', name: 'L’Oréal Global Hair Color', category: 'hair-color', duration: '90 mins', price: 1499, originalPrice: 1999 },
    ],
  },
  {
    id: 'style-studio',
    name: 'Style Studio',
    rating: 4.6,
    reviewsCount: 850,
    distance: '1.2 km away',
    address: '5th Floor, Treasure Island Mall, Palasia',
    city: 'Indore',
    lat: 22.7244,
    lng: 75.8839,
    image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1622288432450-277d0fef5ed6?auto=format&fit=crop&w=800&q=80',
    ],
    startingPrice: 399,
    isFavorite: false,
    gender: 'unisex',
    openingHours: '10:00 AM - 10:00 PM',
    phone: '+91 731 408 1122',
    ownerId: 'usr-owner-2',
    status: 'verified',
    commissionRate: 5,
    crowdStatus: 'Limited availability',
    amenities: ['Mall Parking', 'AC', 'Coffee Bar', 'Luxury Wash Station', 'Digital Payments'],
    stylists: [
      {
        id: 's5',
        name: 'Vikram Singh',
        role: 'Creative Director',
        specialization: 'Precision Scissor Cuts',
        experience: '9 years',
        rating: 4.9,
        reviewsCount: 410,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        workingHours: '10:00 AM - 09:00 PM',
        breaks: ['02:00 PM - 03:00 PM'],
        daysOff: ['Tuesday'],
        active: true,
        bookedSlots: { 'Oct 24': ['11:00 AM', '03:00 PM'] },
      },
      {
        id: 's6',
        name: 'Pooja Kulkarni',
        role: 'Skin Specialist',
        specialization: 'O3+ Facials & Spa',
        experience: '6 years',
        rating: 4.7,
        reviewsCount: 300,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        workingHours: '10:00 AM - 08:30 PM',
        breaks: ['01:30 PM - 02:30 PM'],
        daysOff: ['Monday'],
        active: true,
        bookedSlots: { 'Oct 24': ['01:00 PM', '05:00 PM'] },
      },
    ],
    services: [
      { id: 'ss-1', name: 'Advanced Layer Haircut + Blowdry', category: 'haircut', duration: '45 mins', price: 499, originalPrice: 700, popular: true },
      { id: 'ss-2', name: 'O3+ Brightening Glow Facial', category: 'facial', duration: '60 mins', price: 1199, originalPrice: 1599, popular: true },
      { id: 'ss-3', name: 'Keratin Hair Spa & Mask', category: 'spa', duration: '60 mins', price: 999, originalPrice: 1400 },
    ],
  },
  {
    id: 'the-hair-craft',
    name: 'The Hair Craft',
    rating: 4.9,
    reviewsCount: 2130,
    distance: '1.5 km away',
    address: 'Near C21 Mall, Scheme 54',
    city: 'Indore',
    lat: 22.7480,
    lng: 75.8975,
    image: 'https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
    ],
    startingPrice: 449,
    isFavorite: false,
    gender: 'unisex',
    openingHours: '09:30 AM - 09:00 PM',
    phone: '+91 731 498 7765',
    ownerId: 'usr-owner-3',
    status: 'verified',
    commissionRate: 5,
    crowdStatus: 'Good availability',
    amenities: ['Premium Organic Products', 'Air Purified', 'Private Grooming Pods', 'Espresso Lounge'],
    stylists: [
      {
        id: 's7',
        name: 'Rohan Mehta',
        role: 'Senior Stylist & Barber',
        specialization: 'Fade Cuts & Beard Sculpting',
        experience: '7 years',
        rating: 4.9,
        reviewsCount: 520,
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
        workingHours: '09:30 AM - 08:30 PM',
        breaks: ['01:30 PM - 02:30 PM'],
        daysOff: ['Wednesday'],
        active: true,
        bookedSlots: { 'Oct 24': ['10:30 AM', '04:00 PM'] },
      },
    ],
    services: [
      { id: 'thc-1', name: 'Executive Grooming Package', category: 'haircut', duration: '75 mins', price: 799, originalPrice: 1100, popular: true },
      { id: 'thc-2', name: 'Beard Trimming & Conditioning', category: 'beard', duration: '30 mins', price: 249, originalPrice: 350 },
      { id: 'thc-3', name: 'Highlights & Ombre Streaks', category: 'hair-color', duration: '120 mins', price: 1899, originalPrice: 2500, popular: true },
    ],
  },
];

let BOOKINGS = [
  {
    id: 'BK-892140',
    userId: 'usr-customer-1',
    salonId: 'looks-salon',
    salonName: 'Looks Salon',
    salonAddress: 'Plot 14, Ring Road, Vijay Nagar, Indore',
    salonImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    salonPhone: '+91 731 425 8890',
    serviceName: 'Signature Haircut & Wash',
    services: [
      { name: 'Signature Haircut & Wash', price: 349, duration: '40 mins' },
      { name: 'Beard Sculpting & Hot Towel', price: 199, duration: '25 mins' },
    ],
    totalDuration: '65 mins',
    price: 548,
    discount: 55,
    tax: 25,
    totalAmount: 518,
    paymentMethod: 'Razorpay Online',
    paymentStatus: 'Paid Full',
    advancePaid: 518,
    remainingAmount: 0,
    transactionId: 'pay_rzp_98a76b5c4d3e',
    date: 'Tomorrow, Oct 25',
    rawDate: '2026-10-25',
    time: '11:00 AM',
    endTime: '12:05 PM',
    stylist: 'Aarav Sharma (Master Stylist)',
    stylistId: 's1',
    stylistAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    status: 'Confirmed',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=BK-892140-LOOKS-AARAV',
    customerName: 'Ajeet Lodhi',
    customerPhone: '+91 98765 43210',
    customerEmail: 'ajeetlodhii01@gmail.com',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    isReviewed: false,
  },
  {
    id: 'BK-552109',
    userId: 'usr-customer-1',
    salonId: 'style-studio',
    salonName: 'Style Studio',
    salonAddress: '5th Floor, Treasure Island Mall, Palasia, Indore',
    salonImage: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80',
    salonPhone: '+91 731 408 1122',
    serviceName: 'O3+ Brightening Glow Facial',
    services: [
      { name: 'O3+ Brightening Glow Facial', price: 1199, duration: '60 mins' },
    ],
    totalDuration: '60 mins',
    price: 1199,
    discount: 250,
    tax: 48,
    totalAmount: 997,
    paymentMethod: 'Advance 25% (UPI)',
    paymentStatus: 'Advance Paid',
    advancePaid: 250,
    remainingAmount: 747,
    transactionId: 'pay_adv_552109',
    date: 'Oct 18, 2026',
    rawDate: '2026-10-18',
    time: '02:00 PM',
    endTime: '03:00 PM',
    stylist: 'Pooja Kulkarni (Skin Specialist)',
    stylistId: 's6',
    stylistAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    status: 'Completed',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=BK-552109-STYLESTUDIO',
    customerName: 'Ajeet Lodhi',
    customerPhone: '+91 98765 43210',
    customerEmail: 'ajeetlodhii01@gmail.com',
    createdAt: new Date(Date.now() - 3600000 * 180).toISOString(),
    isReviewed: true,
    userRating: 5,
    userReview: 'Amazing brightening facial! Skin felt very fresh and radiant. Pooja is very professional.',
  },
];

let REVIEWS = [
  {
    id: 'rev-1',
    salonId: 'style-studio',
    salonName: 'Style Studio',
    bookingId: 'BK-552109',
    userId: 'usr-customer-1',
    userName: 'Ajeet Lodhi',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    barberName: 'Pooja Kulkarni',
    barberRating: 5,
    salonRating: 5,
    comment: 'Amazing brightening facial! Skin felt very fresh and radiant. Pooja is very professional.',
    date: '2026-10-18',
    status: 'approved',
  },
];

let SYSTEM_SETTINGS = {
  platformCommissionRate: 5, // 5%
  advanceBookingPercentage: 25, // 25%
  cancellationFeeFlat: 20, // Rs 20
  announcement: '✨ Festive Bonanza: 40% OFF with code AAORA40 across all verified salons!',
  allowInstantBookings: true,
};

// ----------------------------------------------------
// 0. SLOTS STORE & AVAILABILITY ENGINE HELPERS
// ----------------------------------------------------

let SLOTS = [
  // Looks Salon - Initial Custom and Pre-generated Slots
  {
    id: 'slot-looks-1',
    salonId: 'looks-salon',
    employeeId: 's1',
    employeeName: 'Aarav Sharma',
    date: '2026-10-24',
    startTime: '10:00 AM',
    endTime: '10:20 AM',
    durationMinutes: 20,
    slotType: 'custom',
    status: 'BOOKED',
    bookingId: 'BK-991204',
  },
  {
    id: 'slot-looks-2',
    salonId: 'looks-salon',
    employeeId: 's1',
    employeeName: 'Aarav Sharma',
    date: '2026-10-24',
    startTime: '10:20 AM',
    endTime: '10:35 AM',
    durationMinutes: 15,
    slotType: 'custom',
    status: 'AVAILABLE',
    blockReason: null,
  },
  {
    id: 'slot-looks-3',
    salonId: 'looks-salon',
    employeeId: 's1',
    employeeName: 'Aarav Sharma',
    date: '2026-10-24',
    startTime: '10:35 AM',
    endTime: '11:00 AM',
    durationMinutes: 25,
    slotType: 'custom',
    status: 'AVAILABLE',
    blockReason: null,
  },
  {
    id: 'slot-looks-4',
    salonId: 'looks-salon',
    employeeId: 's1',
    employeeName: 'Aarav Sharma',
    date: '2026-10-24',
    startTime: '11:00 AM',
    endTime: '11:30 AM',
    durationMinutes: 30,
    slotType: 'custom',
    status: 'BLOCKED',
    blockReason: 'Equipment sanitization & sharpening',
  },
  {
    id: 'slot-looks-5',
    salonId: 'looks-salon',
    employeeId: 's1',
    employeeName: 'Aarav Sharma',
    date: '2026-10-24',
    startTime: '11:30 AM',
    endTime: '12:10 PM',
    durationMinutes: 40,
    slotType: 'custom',
    status: 'AVAILABLE',
    blockReason: null,
  },
  {
    id: 'slot-looks-6',
    salonId: 'looks-salon',
    employeeId: 's2',
    employeeName: 'Sneha Verma',
    date: '2026-10-24',
    startTime: '11:00 AM',
    endTime: '11:45 AM',
    durationMinutes: 45,
    slotType: 'custom',
    status: 'AVAILABLE',
    blockReason: null,
  },
];

// Time calculation utilities
function parseTimeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const cleaned = timeStr.trim();
  const match = cleaned.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridian = (match[3] || '').toUpperCase();
  if (meridian === 'PM' && hours < 12) hours += 12;
  if (meridian === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function formatMinutesToTime(mins) {
  let h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const meridian = h >= 12 ? 'PM' : 'AM';
  let displayH = h % 12;
  if (displayH === 0) displayH = 12;
  const displayM = m < 10 ? `0${m}` : m;
  const displayHStr = displayH < 10 ? `0${displayH}` : displayH;
  return `${displayHStr}:${displayM} ${meridian}`;
}

function checkIntervalsOverlap(startA, endA, startB, endB) {
  return Math.max(startA, startB) < Math.min(endA, endB);
}

function validateCustomSlot({
  salon,
  employee,
  date,
  startTime,
  endTime,
  existingSlots = [],
  existingBookings = [],
  excludeSlotId = null,
}) {
  const startMins = parseTimeToMinutes(startTime);
  const endMins = parseTimeToMinutes(endTime);

  if (startMins >= endMins) {
    return { valid: false, error: 'Start time must be earlier than end time.' };
  }

  const duration = endMins - startMins;
  if (duration < 10) {
    return { valid: false, error: 'Slot duration must be at least 10 minutes.' };
  }

  // 1. Inside salon opening and closing hours
  const salonOpenMins = parseTimeToMinutes(salon.openingTime || '09:00 AM');
  const salonCloseMins = parseTimeToMinutes(salon.closingTime || '09:30 PM');
  if (startMins < salonOpenMins || endMins > salonCloseMins) {
    return {
      valid: false,
      error: `Slot is outside salon working hours (${salon.openingTime || '09:00 AM'} - ${salon.closingTime || '09:30 PM'}).`,
    };
  }

  // Check salon holidays
  if (salon.holidays && salon.holidays.includes(date)) {
    return { valid: false, error: `The salon is closed on ${date} (Salon Holiday).` };
  }

  // 2. Inside employee working hours
  if (employee) {
    const empStartMins = parseTimeToMinutes(employee.workingHoursStart || '09:00 AM');
    const empEndMins = parseTimeToMinutes(employee.workingHoursEnd || '08:30 PM');
    if (startMins < empStartMins || endMins > empEndMins) {
      return {
        valid: false,
        error: `Slot is outside ${employee.name}'s working hours (${employee.workingHoursStart || '09:00 AM'} - ${employee.workingHoursEnd || '08:30 PM'}).`,
      };
    }

    // Check employee leave / day off
    if (employee.leaveDates && employee.leaveDates.includes(date)) {
      return { valid: false, error: `${employee.name} is on leave on ${date}.` };
    }

    // Check employee break times
    if (employee.breaks && Array.isArray(employee.breaks)) {
      for (const brk of employee.breaks) {
        let bStart = 0;
        let bEnd = 0;
        if (typeof brk === 'string') {
          const parts = brk.split('-').map((s) => s.trim());
          bStart = parseTimeToMinutes(parts[0]);
          bEnd = parseTimeToMinutes(parts[1]);
        } else if (brk && brk.start && brk.end) {
          bStart = parseTimeToMinutes(brk.start);
          bEnd = parseTimeToMinutes(brk.end);
        }

        if (checkIntervalsOverlap(startMins, endMins, bStart, bEnd)) {
          return {
            valid: false,
            error: `Cannot create slot: overlaps with ${employee.name}'s scheduled break (${formatMinutesToTime(bStart)} - ${formatMinutesToTime(bEnd)}).`,
          };
        }
      }
    }

    // Check overlap with other active custom or automatic slots for this employee on this date
    const conflictingSlot = existingSlots.find((s) => {
      if (s.id === excludeSlotId) return false;
      if (s.employeeId !== employee.id || s.date !== date) return false;
      if (s.status === 'CANCELLED') return false;
      const sStart = parseTimeToMinutes(s.startTime);
      const sEnd = parseTimeToMinutes(s.endTime);
      return checkIntervalsOverlap(startMins, endMins, sStart, sEnd);
    });

    if (conflictingSlot) {
      return {
        valid: false,
        error: `Cannot create slot: overlaps with existing slot (${conflictingSlot.startTime} - ${conflictingSlot.endTime}, Status: ${conflictingSlot.status}).`,
      };
    }

    // Check overlap with existing active bookings
    const conflictingBooking = existingBookings.find((b) => {
      if (b.salonId !== salon.id || (b.stylistId && b.stylistId !== employee.id)) return false;
      if (b.status === 'Cancelled' || b.status === 'Rejected') return false;
      if (b.rawDate !== date && b.date !== date) return false;
      const bStart = parseTimeToMinutes(b.time);
      const bDuration = parseInt(b.totalDuration) || 30;
      const bEnd = bStart + bDuration;
      return checkIntervalsOverlap(startMins, endMins, bStart, bEnd);
    });

    if (conflictingBooking) {
      return {
        valid: false,
        error: `Cannot create slot: ${employee.name} already has a booking (${conflictingBooking.id} at ${conflictingBooking.time}).`,
      };
    }
  }

  return { valid: true };
}

// Automatic Slot Generator Engine
function generateAutoSlotsForDate({ salon, employee, date, slotIntervalMins = 30, existingBookings = [] }) {
  const generated = [];
  const salonOpenMins = parseTimeToMinutes(salon.openingTime || '09:00 AM');
  const salonCloseMins = parseTimeToMinutes(salon.closingTime || '09:30 PM');

  const empStartMins = parseTimeToMinutes(employee.workingHoursStart || '09:00 AM');
  const empEndMins = parseTimeToMinutes(employee.workingHoursEnd || '08:30 PM');

  const actualStart = Math.max(salonOpenMins, empStartMins);
  const actualEnd = Math.min(salonCloseMins, empEndMins);

  let current = actualStart;
  while (current + slotIntervalMins <= actualEnd) {
    const sStart = current;
    const sEnd = current + slotIntervalMins;
    const startTimeStr = formatMinutesToTime(sStart);
    const endTimeStr = formatMinutesToTime(sEnd);

    // Check break time
    let inBreak = false;
    let breakReason = null;
    if (employee.breaks) {
      for (const brk of employee.breaks) {
        let bStart = 0;
        let bEnd = 0;
        if (typeof brk === 'string') {
          const parts = brk.split('-').map((s) => s.trim());
          bStart = parseTimeToMinutes(parts[0]);
          bEnd = parseTimeToMinutes(parts[1]);
        } else if (brk && brk.start && brk.end) {
          bStart = parseTimeToMinutes(brk.start);
          bEnd = parseTimeToMinutes(brk.end);
        }
        if (checkIntervalsOverlap(sStart, sEnd, bStart, bEnd)) {
          inBreak = true;
          breakReason = `Break (${formatMinutesToTime(bStart)} - ${formatMinutesToTime(bEnd)})`;
          break;
        }
      }
    }

    // Check booked status
    const isBooked = existingBookings.some((b) => {
      if (b.salonId !== salon.id || (b.stylistId && b.stylistId !== employee.id)) return false;
      if (b.status === 'Cancelled' || b.status === 'Rejected') return false;
      if (b.rawDate !== date && b.date !== date) return false;
      const bStart = parseTimeToMinutes(b.time);
      const bDuration = parseInt(b.totalDuration) || 30;
      const bEnd = bStart + bDuration;
      return checkIntervalsOverlap(sStart, sEnd, bStart, bEnd);
    });

    generated.push({
      id: `slot-${salon.id}-${employee.id}-${date}-${sStart}`,
      salonId: salon.id,
      employeeId: employee.id,
      employeeName: employee.name,
      date,
      startTime: startTimeStr,
      endTime: endTimeStr,
      durationMinutes: slotIntervalMins,
      slotType: 'automatic',
      status: inBreak ? 'BLOCKED' : isBooked ? 'BOOKED' : 'AVAILABLE',
      blockReason: inBreak ? breakReason : isBooked ? 'Booked appointment' : null,
    });

    current += slotIntervalMins;
  }

  return generated;
}

// ----------------------------------------------------
// AUTHENTICATION & RBAC MIDDLEWARES
// ----------------------------------------------------

// Server-side invalidated token blacklist (for instant global logout termination)
const REVOKED_TOKENS = new Set();
// Password reset tokens: Map<token, { email, expiresAt, used }>
const RESET_TOKENS = new Map();

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function sanitizeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role, // Determined exclusively by database
    salonId: user.salonId,
    employeeId: user.employeeId,
    status: user.status || 'active',
    avatar: user.avatar,
    preferredServices: user.preferredServices || [],
    location: user.location,
    favoriteSalonId: user.favoriteSalonId,
    favoriteBarberName: user.favoriteBarberName,
    createdAt: user.createdAt,
  };
}

function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token || token === 'null' || token === 'undefined') {
    return res.status(401).json({ error: 'Unauthorized: Authentication token is empty or invalid.' });
  }

  if (REVOKED_TOKENS.has(token)) {
    return res.status(401).json({ error: 'Unauthorized: Session has been logged out and invalidated. Please sign in again.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const dbUser = USERS.find((u) => u.id === decoded.id || u.email?.toLowerCase() === decoded.email?.toLowerCase());

    if (!dbUser) {
      return res.status(401).json({ error: 'Unauthorized: User account not found in database.' });
    }

    if (dbUser.status === 'banned') {
      return res.status(403).json({ error: 'Forbidden: Your account has been suspended by the platform administrator.' });
    }

    // Attach authoritative database user (never trust client payload role)
    req.user = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      phone: dbUser.phone,
      role: dbUser.role, // Database record is absolute source of truth
      salonId: dbUser.salonId,
      employeeId: dbUser.employeeId,
      status: dbUser.status,
    };
    req.token = token;

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token. Please log in again.' });
  }
}

function normalizeRole(role) {
  if (!role) return 'customer';
  const r = role.toLowerCase();
  if (r === 'owner' || r === 'salon_owner') return 'owner';
  if (r === 'admin' || r === 'superadmin') return 'admin';
  if (r === 'staff' || r === 'stylist' || r === 'barber') return 'staff';
  return 'customer';
}

function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
    }
    const userRole = normalizeRole(req.user.role);
    const normalizedAllowed = allowedRoles.map(normalizeRole);

    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        error: `Forbidden: Access denied. Role '${req.user.role}' is not authorized to access this resource. Required: ${allowedRoles.join(', ')}`,
      });
    }
    next();
  };
}

function requireSalonOwnership(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
  }
  const userRole = normalizeRole(req.user.role);
  if (userRole === 'admin') {
    return next(); // Admins have platform-wide access
  }
  if (userRole !== 'owner') {
    return res.status(403).json({ error: 'Forbidden: Only verified salon owners can access this resource.' });
  }

  const targetSalonId = req.params.salonId || req.params.id || req.body.salonId || req.query.salonId;
  if (targetSalonId && req.user.salonId && req.user.salonId !== targetSalonId) {
    return res.status(403).json({
      error: `Forbidden: Resource belongs to salon '${targetSalonId}'. You only have access to '${req.user.salonId}'.`,
    });
  }
  next();
}

// ----------------------------------------------------
// 1. AUTHENTICATION & ONBOARDING API
// ----------------------------------------------------

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  
  // Safe generic invalid credentials response (never disclose whether email exists)
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  if (user.status === 'banned') {
    return res.status(403).json({ error: 'Account has been suspended. Please contact platform support.' });
  }

  // NOTE: Any requested role from client body is strictly ignored.
  // The role is retrieved directly from the verified database record: user.role
  const token = generateToken(user);
  res.json({
    message: 'Login successful',
    token,
    user: sanitizeUser(user),
  });
});

app.post('/api/auth/logout', (req, res) => {
  // If authorization token is provided, blacklist it on the server
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token) {
      REVOKED_TOKENS.add(token);
    }
  }
  res.json({ success: true, message: 'Session terminated and token invalidated successfully.' });
});

app.get('/api/auth/me', authenticateJWT, (req, res) => {
  const user = USERS.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({
    user: sanitizeUser(user),
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters in length.' });
  }

  const existing = USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  // SECURITY RULE: Public signup ALWAYS creates role="customer" (user).
  // Any role passed in request body is intentionally discarded.
  const newUser = {
    id: `usr-${Date.now()}`,
    name: name.trim(),
    email: email.trim(),
    phone: phone ? phone.trim() : '+91 98000 00000',
    password,
    role: 'customer', // Immutable default for public registration
    createdAt: new Date().toISOString(),
    status: 'active',
    location: 'Indore',
    preferredServices: ['Haircut'],
  };

  USERS.push(newUser);
  const token = generateToken(newUser);

  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: sanitizeUser(newUser),
  });
});

// Forgot Password: generate single-use temporary token
app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  const user = USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  // Always return safe success message to prevent user enumeration
  if (!user) {
    return res.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been dispatched.',
    });
  }

  const resetToken = `rst_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  RESET_TOKENS.set(resetToken, {
    email: user.email.toLowerCase(),
    expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes validity
    used: false,
  });

  res.json({
    success: true,
    message: 'If an account exists with this email, a password reset link has been dispatched.',
    resetToken, // Returned for dev preview demo workflow
  });
});

// Reset Password with single-use token
app.post('/api/auth/reset-password', (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ error: 'Reset token and new password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters.' });
  }

  const resetRecord = RESET_TOKENS.get(token);
  if (!resetRecord) {
    return res.status(400).json({ error: 'Invalid or expired password reset token.' });
  }

  if (resetRecord.used || Date.now() > resetRecord.expiresAt) {
    RESET_TOKENS.delete(token);
    return res.status(400).json({ error: 'Password reset token has expired or already been used.' });
  }

  const user = USERS.find((u) => u.email.toLowerCase() === resetRecord.email);
  if (!user) {
    return res.status(404).json({ error: 'User account not found.' });
  }

  // Update password and mark token as used
  user.password = password;
  resetRecord.used = true;
  RESET_TOKENS.delete(token);

  res.json({ success: true, message: 'Password has been updated successfully. Please log in with your new credentials.' });
});

app.post('/api/user/onboarding', authenticateJWT, requireRole(['customer']), (req, res) => {
  const { name, phone, location, preferredServices, favoriteSalonId, favoriteBarberName } = req.body;
  const user = USERS.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Whitelist update fields
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (location) user.location = location;
  if (preferredServices) user.preferredServices = preferredServices;
  if (favoriteSalonId) user.favoriteSalonId = favoriteSalonId;
  if (favoriteBarberName) user.favoriteBarberName = favoriteBarberName;

  res.json({ message: 'Onboarding preferences updated successfully', user });
});

app.get('/api/user/profile', authenticateJWT, (req, res) => {
  const user = USERS.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

// Update user profile with strict mass-assignment protection
app.put('/api/users/:id', authenticateJWT, (req, res) => {
  const targetUser = USERS.find((u) => u.id === req.params.id);
  if (!targetUser) return res.status(404).json({ error: 'User not found.' });

  // Ownership check: Users can only edit their own profile unless platform admin
  if (req.user.role !== 'admin' && req.user.id !== targetUser.id) {
    return res.status(403).json({ error: 'Forbidden: You cannot modify another user’s profile.' });
  }

  const { name, phone, avatar, location, preferredServices, favoriteSalonId, favoriteBarberName } = req.body;
  
  // Whitelist safe editable fields
  if (name !== undefined) targetUser.name = name;
  if (phone !== undefined) targetUser.phone = phone;
  if (avatar !== undefined) targetUser.avatar = avatar;
  if (location !== undefined) targetUser.location = location;
  if (preferredServices !== undefined) targetUser.preferredServices = preferredServices;
  if (favoriteSalonId !== undefined) targetUser.favoriteSalonId = favoriteSalonId;
  if (favoriteBarberName !== undefined) targetUser.favoriteBarberName = favoriteBarberName;

  // Protected fields: ONLY admin can change role or status
  if (req.user.role === 'admin') {
    if (req.body.status) targetUser.status = req.body.status;
    if (req.body.role && ['customer', 'owner', 'salon_owner', 'admin'].includes(req.body.role)) {
      targetUser.role = req.body.role;
    }
  }

  res.json({ message: 'User profile updated successfully', user: targetUser });
});

// ----------------------------------------------------
// 2. SMART SALON & AVAILABILITY ENGINE
// ----------------------------------------------------

app.get('/api/salons', (req, res) => {
  const { search, city, gender, category } = req.query;

  let results = SALONS.filter((s) => s.status !== 'suspended');

  if (city && typeof city === 'string' && city !== 'all') {
    results = results.filter((s) => s.city.toLowerCase() === city.toLowerCase());
  }

  if (gender && typeof gender === 'string' && gender !== 'all') {
    results = results.filter((s) => s.gender === 'unisex' || s.gender === gender);
  }

  if (category && typeof category === 'string' && category !== 'all') {
    results = results.filter((s) => s.services.some((srv) => srv.category.toLowerCase() === category.toLowerCase()));
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.services.some((srv) => srv.name.toLowerCase().includes(q))
    );
  }

  res.json({ salons: results });
});

app.get('/api/salons/:id', (req, res) => {
  const salon = SALONS.find((s) => s.id === req.params.id);
  if (!salon) return res.status(404).json({ error: 'Salon not found' });
  res.json({ salon });
});

// ----------------------------------------------------
// 2. SLOTS MANAGEMENT & AVAILABILITY ENGINE API
// ----------------------------------------------------

// Get all slots with filters
app.get('/api/slots', (req, res) => {
  const { salonId, date, employeeId, status } = req.query;
  let results = [...SLOTS];

  if (salonId) {
    results = results.filter((s) => s.salonId === salonId);
  }
  if (date) {
    results = results.filter((s) => s.date === date);
  }
  if (employeeId && employeeId !== 'all') {
    results = results.filter((s) => s.employeeId === employeeId);
  }
  if (status && status !== 'all') {
    results = results.filter((s) => s.status === status);
  }

  // Sort slots chronologically
  results.sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));

  res.json({ slots: results, count: results.length });
});

// Generate Automatic Slots for a date or date range
app.post('/api/slots/generate-auto', authenticateJWT, requireRole(['owner', 'admin']), (req, res) => {
  const { salonId, date, slotIntervalMins = 30, employeeId = 'all' } = req.body;

  const targetSalonId = req.user.role === 'owner' ? req.user.salonId : salonId;
  const salon = SALONS.find((s) => s.id === targetSalonId);
  if (!salon) return res.status(404).json({ error: 'Salon not found.' });

  if (!date) return res.status(400).json({ error: 'Date (YYYY-MM-DD or format) is required.' });

  const interval = parseInt(slotIntervalMins, 10) || 30;
  let targetEmployees = salon.stylists.filter((e) => e.active);
  if (employeeId && employeeId !== 'all') {
    targetEmployees = targetEmployees.filter((e) => e.id === employeeId);
  }

  if (targetEmployees.length === 0) {
    return res.status(400).json({ error: 'No active employees found to generate slots for.' });
  }

  let totalNewSlots = 0;
  const existingSalonBookings = BOOKINGS.filter((b) => b.salonId === salon.id);

  targetEmployees.forEach((emp) => {
    // Generate auto slots
    const generated = generateAutoSlotsForDate({
      salon,
      employee: emp,
      date,
      slotIntervalMins: interval,
      existingBookings: existingSalonBookings,
    });

    // Add or replace existing auto slots that are NOT booked
    generated.forEach((newSlot) => {
      const existingIdx = SLOTS.findIndex(
        (s) =>
          s.salonId === salon.id &&
          s.employeeId === emp.id &&
          s.date === date &&
          s.startTime === newSlot.startTime
      );

      if (existingIdx >= 0) {
        // Only update if not currently booked or custom
        if (SLOTS[existingIdx].slotType === 'automatic' && SLOTS[existingIdx].status !== 'BOOKED') {
          SLOTS[existingIdx] = newSlot;
          totalNewSlots++;
        }
      } else {
        SLOTS.push(newSlot);
        totalNewSlots++;
      }
    });
  });

  const allDateSlots = SLOTS.filter((s) => s.salonId === salon.id && s.date === date);
  res.json({
    message: `Successfully generated ${totalNewSlots} slot(s) with ${interval}-minute intervals for ${date}.`,
    slotsGeneratedCount: totalNewSlots,
    totalDateSlots: allDateSlots.length,
    slots: allDateSlots,
  });
});

// Create Custom Manual Slot
app.post('/api/slots/custom', authenticateJWT, requireRole(['owner', 'admin']), (req, res) => {
  const targetSalonId = req.user.role === 'owner' ? req.user.salonId : req.body.salonId;
  const salon = SALONS.find((s) => s.id === targetSalonId);
  if (!salon) return res.status(404).json({ error: 'Salon not found.' });

  const { employeeId, date, startTime, endTime, status = 'AVAILABLE', blockReason, assignedServiceId } = req.body;

  if (!employeeId || !date || !startTime || !endTime) {
    return res.status(400).json({ error: 'Employee ID, date, start time, and end time are required.' });
  }

  const employee = salon.stylists.find((s) => s.id === employeeId);
  if (!employee) return res.status(404).json({ error: 'Stylist/Employee not found in this salon.' });

  // Run Custom Slot Validation Engine
  const validation = validateCustomSlot({
    salon,
    employee,
    date,
    startTime,
    endTime,
    existingSlots: SLOTS,
    existingBookings: BOOKINGS,
  });

  if (!validation.valid) {
    return res.status(400).json({
      error: validation.error,
      validationFailed: true,
    });
  }

  const startMins = parseTimeToMinutes(startTime);
  const endMins = parseTimeToMinutes(endTime);
  const durationMinutes = endMins - startMins;

  const newSlot = {
    id: `slot-custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    salonId: salon.id,
    employeeId: employee.id,
    employeeName: employee.name,
    date,
    startTime,
    endTime,
    durationMinutes,
    slotType: 'custom',
    status: status || 'AVAILABLE',
    blockReason: status === 'BLOCKED' ? blockReason || 'Manual block by salon owner' : null,
    assignedServiceId: assignedServiceId || null,
  };

  SLOTS.push(newSlot);
  res.status(201).json({
    message: 'Custom manual slot created successfully!',
    slot: newSlot,
  });
});

// Update slot
app.put('/api/slots/:id', authenticateJWT, requireRole(['owner', 'admin']), (req, res) => {
  const slot = SLOTS.find((s) => s.id === req.params.id);
  if (!slot) return res.status(404).json({ error: 'Slot not found.' });

  if (req.user.role === 'owner' && req.user.salonId !== slot.salonId) {
    return res.status(403).json({ error: 'Forbidden: You cannot modify slots for another salon.' });
  }

  const { startTime, endTime, status, blockReason, assignedServiceId, employeeId } = req.body;

  if (startTime && endTime) {
    const salon = SALONS.find((s) => s.id === slot.salonId);
    const employee = salon?.stylists.find((s) => s.id === (employeeId || slot.employeeId));
    if (salon && employee) {
      const validation = validateCustomSlot({
        salon,
        employee,
        date: slot.date,
        startTime,
        endTime,
        existingSlots: SLOTS,
        existingBookings: BOOKINGS,
        excludeSlotId: slot.id,
      });

      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }

      slot.startTime = startTime;
      slot.endTime = endTime;
      slot.durationMinutes = parseTimeToMinutes(endTime) - parseTimeToMinutes(startTime);
    }
  }

  if (status) slot.status = status;
  if (blockReason !== undefined) slot.blockReason = blockReason;
  if (assignedServiceId !== undefined) slot.assignedServiceId = assignedServiceId;
  if (employeeId) {
    const salon = SALONS.find((s) => s.id === slot.salonId);
    const emp = salon?.stylists.find((s) => s.id === employeeId);
    if (emp) {
      slot.employeeId = emp.id;
      slot.employeeName = emp.name;
    }
  }

  res.json({ message: 'Slot updated successfully', slot });
});

// Delete slot
app.delete('/api/slots/:id', authenticateJWT, requireRole(['owner', 'admin']), (req, res) => {
  const slotIndex = SLOTS.findIndex((s) => s.id === req.params.id);
  if (slotIndex === -1) return res.status(404).json({ error: 'Slot not found.' });

  const slot = SLOTS[slotIndex];
  if (req.user.role === 'owner' && req.user.salonId !== slot.salonId) {
    return res.status(403).json({ error: 'Forbidden: You cannot delete slots for another salon.' });
  }

  if (slot.status === 'BOOKED') {
    return res.status(400).json({ error: 'Cannot delete an active booked slot. Cancel the booking first.' });
  }

  SLOTS.splice(slotIndex, 1);
  res.json({ message: 'Slot deleted successfully.' });
});

// Quick block a slot
app.post('/api/slots/:id/block', authenticateJWT, requireRole(['owner', 'admin']), (req, res) => {
  const slot = SLOTS.find((s) => s.id === req.params.id);
  if (!slot) return res.status(404).json({ error: 'Slot not found.' });

  if (req.user.role === 'owner' && req.user.salonId !== slot.salonId) {
    return res.status(403).json({ error: 'Forbidden: You cannot modify slots for another salon.' });
  }

  if (slot.status === 'BOOKED') {
    return res.status(400).json({ error: 'Cannot block an already booked slot.' });
  }

  const { reason = 'Blocked by salon owner' } = req.body;
  slot.status = 'BLOCKED';
  slot.blockReason = reason;

  res.json({ message: 'Slot blocked successfully.', slot });
});

// Quick unblock a slot
app.post('/api/slots/:id/unblock', authenticateJWT, requireRole(['owner', 'admin']), (req, res) => {
  const slot = SLOTS.find((s) => s.id === req.params.id);
  if (!slot) return res.status(404).json({ error: 'Slot not found.' });

  if (req.user.role === 'owner' && req.user.salonId !== slot.salonId) {
    return res.status(403).json({ error: 'Forbidden: You cannot modify slots for another salon.' });
  }

  slot.status = 'AVAILABLE';
  slot.blockReason = null;

  res.json({ message: 'Slot unblocked and marked available.', slot });
});

// Unified Availability Engine: GET & POST supported
function handleAvailabilityCalculation(req, res) {
  const salonId = req.params?.id || req.query?.salonId || req.body?.salonId;
  const salon = SALONS.find((s) => s.id === salonId);
  if (!salon) return res.status(404).json({ error: 'Salon not found' });

  const dateKey = req.body?.dateKey || req.query?.dateKey || req.body?.date || req.query?.date || 'Oct 24';
  const rawDate = req.body?.rawDate || req.query?.rawDate || (dateKey.includes('-') ? dateKey : '2026-10-24');
  const barberId = req.body?.barberId || req.query?.barberId || 'any';
  const serviceDurationMins = parseInt(req.body?.serviceDurationMins || req.query?.serviceDurationMins || 30, 10);

  // Check if date is salon holiday
  if (salon.holidays && salon.holidays.includes(rawDate)) {
    return res.json({
      dateKey,
      rawDate,
      salonId: salon.id,
      dayStatus: 'Salon Closed (Holiday)',
      isHoliday: true,
      categorizedSlots: [],
      availableSlotsCount: 0,
      totalSlotsCount: 0,
      message: 'The salon is closed on this date.',
    });
  }

  // Base slot periods
  const standardPeriods = [
    { period: 'Morning', slots: ['09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'] },
    { period: 'Afternoon', slots: ['12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM'] },
    { period: 'Evening', slots: ['04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM'] },
  ];

  // Retrieve explicit custom/auto slots for this date in store
  const storeSlots = SLOTS.filter((s) => s.salonId === salon.id && (s.date === rawDate || s.date === dateKey));
  const allActiveStylists = salon.stylists.filter((s) => s.active);

  let nextAvailableWithSelected = null;
  let nextAvailableWithAny = null;

  // Build unified slot matrix
  const categorizedSlots = standardPeriods.map((group) => {
    // Merge standard times with any custom slot start times in this period
    const timesInGroup = [...group.slots];
    storeSlots.forEach((st) => {
      const mins = parseTimeToMinutes(st.startTime);
      const isMorning = mins < 720;
      const isAfternoon = mins >= 720 && mins < 960;
      const isEvening = mins >= 960;
      if (
        (group.period === 'Morning' && isMorning) ||
        (group.period === 'Afternoon' && isAfternoon) ||
        (group.period === 'Evening' && isEvening)
      ) {
        if (!timesInGroup.includes(st.startTime)) {
          timesInGroup.push(st.startTime);
        }
      }
    });

    // Sort times within period
    timesInGroup.sort((a, b) => parseTimeToMinutes(a) - parseTimeToMinutes(b));

    const slots = timesInGroup.map((time) => {
      const slotMins = parseTimeToMinutes(time);
      const slotEndMins = slotMins + serviceDurationMins;

      if (barberId === 'any') {
        const freeBarbers = allActiveStylists.filter((b) => {
          // 1. Check leave
          if (b.leaveDates && (b.leaveDates.includes(rawDate) || b.leaveDates.includes(dateKey))) return false;

          // 2. Check breaks
          if (b.breaks) {
            for (const brk of b.breaks) {
              let bStart = 0;
              let bEnd = 0;
              if (typeof brk === 'string') {
                const parts = brk.split('-').map((s) => s.trim());
                bStart = parseTimeToMinutes(parts[0]);
                bEnd = parseTimeToMinutes(parts[1]);
              } else if (brk?.start && brk?.end) {
                bStart = parseTimeToMinutes(brk.start);
                bEnd = parseTimeToMinutes(brk.end);
              }
              if (checkIntervalsOverlap(slotMins, slotEndMins, bStart, bEnd)) return false;
            }
          }

          // 3. Check explicit blocked custom slots
          const customSlot = storeSlots.find(
            (s) => s.employeeId === b.id && s.startTime === time
          );
          if (customSlot && (customSlot.status === 'BLOCKED' || customSlot.status === 'CANCELLED' || customSlot.status === 'BOOKED')) {
            return false;
          }

          // 4. Check existing bookings
          const hasBooking = BOOKINGS.some((bk) => {
            if (bk.salonId !== salon.id || (bk.stylistId && bk.stylistId !== b.id)) return false;
            if (bk.status === 'Cancelled' || bk.status === 'Rejected') return false;
            if (bk.rawDate !== rawDate && bk.date !== dateKey) return false;
            const bStart = parseTimeToMinutes(bk.time);
            const bDuration = parseInt(bk.totalDuration, 10) || 30;
            const bEnd = bStart + bDuration;
            return checkIntervalsOverlap(slotMins, slotEndMins, bStart, bEnd);
          });

          if (hasBooking) return false;

          // 5. Check bookedSlots dictionary
          const bookedTimes = b.bookedSlots?.[dateKey] || b.bookedSlots?.[rawDate];
          if (bookedTimes && bookedTimes.includes(time)) return false;

          return true;
        });

        const isAvailable = freeBarbers.length > 0;
        if (isAvailable && !nextAvailableWithAny) {
          nextAvailableWithAny = { time, barberName: freeBarbers[0].name, barberId: freeBarbers[0].id };
        }

        return {
          time,
          available: isAvailable,
          freeBarbersCount: freeBarbers.length,
          recommendedBarber: freeBarbers.length > 0 ? freeBarbers[0] : null,
          statusText: isAvailable ? (freeBarbers.length > 1 ? 'Available' : 'Limited') : 'Fully Booked',
        };
      } else {
        const selectedBarber = allActiveStylists.find((b) => b.id === barberId);
        if (!selectedBarber) {
          return { time, available: false, reason: 'Stylist not active', statusText: 'Unavailable' };
        }

        // Check if barber on leave
        if (selectedBarber.leaveDates && (selectedBarber.leaveDates.includes(rawDate) || selectedBarber.leaveDates.includes(dateKey))) {
          return { time, available: false, reason: 'Stylist on leave', statusText: 'On Leave' };
        }

        // Check break
        let inBreak = false;
        if (selectedBarber.breaks) {
          for (const brk of selectedBarber.breaks) {
            let bStart = 0;
            let bEnd = 0;
            if (typeof brk === 'string') {
              const parts = brk.split('-').map((s) => s.trim());
              bStart = parseTimeToMinutes(parts[0]);
              bEnd = parseTimeToMinutes(parts[1]);
            } else if (brk?.start && brk?.end) {
              bStart = parseTimeToMinutes(brk.start);
              bEnd = parseTimeToMinutes(brk.end);
            }
            if (checkIntervalsOverlap(slotMins, slotEndMins, bStart, bEnd)) {
              inBreak = true;
              break;
            }
          }
        }

        // Check custom slots
        const customSlot = storeSlots.find(
          (s) => s.employeeId === selectedBarber.id && s.startTime === time
        );
        const isBlocked = customSlot && customSlot.status === 'BLOCKED';

        // Check existing bookings
        const isBooked =
          (selectedBarber.bookedSlots?.[dateKey] && selectedBarber.bookedSlots[dateKey].includes(time)) ||
          BOOKINGS.some((bk) => {
            if (bk.salonId !== salon.id || (bk.stylistId && bk.stylistId !== selectedBarber.id)) return false;
            if (bk.status === 'Cancelled' || bk.status === 'Rejected') return false;
            if (bk.rawDate !== rawDate && bk.date !== dateKey) return false;
            const bStart = parseTimeToMinutes(bk.time);
            const bDuration = parseInt(bk.totalDuration, 10) || 30;
            const bEnd = bStart + bDuration;
            return checkIntervalsOverlap(slotMins, slotEndMins, bStart, bEnd);
          });

        const isAvailable = !inBreak && !isBlocked && !isBooked;

        if (isAvailable && !nextAvailableWithSelected) {
          nextAvailableWithSelected = { time, barberName: selectedBarber.name, barberId: selectedBarber.id };
        }

        const alternateFreeBarbers = allActiveStylists.filter((b) => {
          if (b.id === barberId) return false;
          const bBooked = b.bookedSlots?.[dateKey];
          return !(bBooked && bBooked.includes(time));
        });

        return {
          time,
          available: isAvailable,
          barberName: selectedBarber.name,
          alternateBarbers: !isAvailable ? alternateFreeBarbers : [],
          statusText: isAvailable ? 'Available' : inBreak ? 'Break Time' : isBlocked ? 'Blocked' : 'Booked',
        };
      }
    });

    return { period: group.period, slots };
  });

  const totalSlotsCount = categorizedSlots.reduce((sum, g) => sum + g.slots.length, 0);
  const availableSlotsCount = categorizedSlots.reduce((sum, g) => sum + g.slots.filter((s) => s.available).length, 0);

  const dayStatus =
    availableSlotsCount === 0 ? 'Fully Booked' : availableSlotsCount < totalSlotsCount * 0.35 ? 'Limited' : 'Available';

  res.json({
    dateKey,
    rawDate,
    salonId: salon.id,
    dayStatus,
    categorizedSlots,
    totalSlotsCount,
    availableSlotsCount,
    nextAvailableWithSelected,
    nextAvailableWithAny,
    earliestAvailableSlot: nextAvailableWithAny || nextAvailableWithSelected,
  });
}

app.post('/api/salons/:id/availability', handleAvailabilityCalculation);
app.get('/api/availability', handleAvailabilityCalculation);
app.post('/api/availability', handleAvailabilityCalculation);

// ----------------------------------------------------
// 3. CUSTOMER BOOKINGS & DOUBLE-BOOKING PREVENTION
// ----------------------------------------------------

app.get('/api/user/book-again', authenticateJWT, requireRole(['customer']), (req, res) => {
  const previousBookings = BOOKINGS.filter(
    (b) => b.userId === req.user.id || b.customerEmail.toLowerCase() === req.user.email.toLowerCase()
  );

  if (previousBookings.length === 0) {
    return res.json({ hasPreviousBooking: false });
  }

  const latest = previousBookings[0];
  const salon = SALONS.find((s) => s.id === latest.salonId) || SALONS[0];

  res.json({
    hasPreviousBooking: true,
    lastBooking: {
      salonId: latest.salonId,
      salonName: latest.salonName,
      salonImage: latest.salonImage,
      barberName: latest.stylist.split('(')[0].trim(),
      barberId: latest.stylistId || 's1',
      services: latest.services,
      serviceName: latest.serviceName,
      totalDuration: latest.totalDuration,
      price: latest.price,
    },
  });
});

app.get('/api/user/regular-salon', authenticateJWT, requireRole(['customer']), (req, res) => {
  const user = USERS.find((u) => u.id === req.user.id);
  const salonId = user?.favoriteSalonId || 'looks-salon';
  const salon = SALONS.find((s) => s.id === salonId) || SALONS[0];

  res.json({
    regularSalon: {
      id: salon.id,
      name: salon.name,
      distance: salon.distance,
      rating: salon.rating,
      image: salon.image,
      address: salon.address,
      favoriteBarber: user?.favoriteBarberName || salon.stylists[0].name,
      nextAvailableSlot: 'Today, 05:30 PM',
    },
  });
});

app.get('/api/bookings', authenticateJWT, (req, res) => {
  if (req.user.role === 'customer') {
    const customerBookings = BOOKINGS.filter(
      (b) => b.userId === req.user.id || b.customerEmail.toLowerCase() === req.user.email.toLowerCase()
    );
    return res.json({ bookings: customerBookings });
  }
  if (req.user.role === 'owner') {
    const ownerBookings = BOOKINGS.filter((b) => b.salonId === req.user.salonId);
    return res.json({ bookings: ownerBookings });
  }
  if (req.user.role === 'staff') {
    const staffBookings = BOOKINGS.filter(
      (b) => b.salonId === req.user.salonId && (b.stylistId === req.user.employeeId || b.stylist.includes(req.user.name))
    );
    return res.json({ bookings: staffBookings });
  }
  if (req.user.role === 'admin') {
    return res.json({ bookings: BOOKINGS });
  }

  res.json({ bookings: [] });
});

app.get('/api/bookings/:id', authenticateJWT, (req, res) => {
  const booking = BOOKINGS.find((b) => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  if (req.user.role === 'customer' && booking.userId !== req.user.id && booking.customerEmail !== req.user.email) {
    return res.status(403).json({ error: 'Forbidden: You cannot access another customer’s booking.' });
  }

  if (req.user.role === 'owner' && req.user.salonId !== booking.salonId) {
    return res.status(403).json({ error: 'Forbidden: You cannot view bookings from another salon.' });
  }

  res.json({ booking });
});

// CREATE BOOKING (WITH ATOMIC DOUBLE-BOOKING CHECK)
app.post('/api/bookings', authenticateJWT, requireRole(['customer']), (req, res) => {
  const {
    salonId,
    services,
    barberId = 'any',
    dateLabel = 'Today, Oct 24',
    rawDate = '2026-10-24',
    dateKey = 'Oct 24',
    timeSlot = '11:30 AM',
    paymentMethod = 'Razorpay Online',
    couponCode,
  } = req.body;

  const salon = SALONS.find((s) => s.id === salonId);
  if (!salon) return res.status(404).json({ error: 'Salon not found' });

  if (!services || services.length === 0) {
    return res.status(400).json({ error: 'At least one service must be selected.' });
  }

  const subtotal = services.reduce((sum, s) => sum + Number(s.price || 0), 0);
  const totalMins = services.reduce((sum, s) => sum + (parseInt(s.duration, 10) || 30), 0);
  const startMins = parseTimeToMinutes(timeSlot);
  const endMins = startMins + totalMins;

  // 1. Double Booking Check & Barber Assignment
  let assignedBarber = null;

  if (barberId === 'any') {
    // Find first free active stylist who has no overlap
    const freeBarber = salon.stylists.find((b) => {
      if (!b.active) return false;
      if (b.leaveDates && (b.leaveDates.includes(rawDate) || b.leaveDates.includes(dateKey))) return false;

      // Check break overlap
      if (b.breaks) {
        for (const brk of b.breaks) {
          let bStart = 0;
          let bEnd = 0;
          if (typeof brk === 'string') {
            const parts = brk.split('-').map((s) => s.trim());
            bStart = parseTimeToMinutes(parts[0]);
            bEnd = parseTimeToMinutes(parts[1]);
          } else if (brk?.start && brk?.end) {
            bStart = parseTimeToMinutes(brk.start);
            bEnd = parseTimeToMinutes(brk.end);
          }
          if (checkIntervalsOverlap(startMins, endMins, bStart, bEnd)) return false;
        }
      }

      // Check existing booking overlap
      const hasConflict = BOOKINGS.some((bk) => {
        if (bk.salonId !== salon.id || (bk.stylistId && bk.stylistId !== b.id)) return false;
        if (bk.status === 'Cancelled' || bk.status === 'Rejected') return false;
        if (bk.rawDate !== rawDate && bk.date !== dateKey) return false;
        const bStart = parseTimeToMinutes(bk.time);
        const bDuration = parseInt(bk.totalDuration, 10) || 30;
        const bEnd = bStart + bDuration;
        return checkIntervalsOverlap(startMins, endMins, bStart, bEnd);
      });

      return !hasConflict;
    });

    if (!freeBarber) {
      return res.status(409).json({
        error: 'Double-booking conflict: No stylists are available at this selected time. Please choose another slot.',
        code: 'SLOT_UNAVAILABLE',
      });
    }
    assignedBarber = freeBarber;
  } else {
    assignedBarber = salon.stylists.find((b) => b.id === barberId);
    if (!assignedBarber) return res.status(404).json({ error: 'Selected stylist not found.' });

    // Validate if the selected stylist is already booked
    const conflictBooking = BOOKINGS.find((bk) => {
      if (bk.salonId !== salon.id || (bk.stylistId && bk.stylistId !== assignedBarber.id)) return false;
      if (bk.status === 'Cancelled' || bk.status === 'Rejected') return false;
      if (bk.rawDate !== rawDate && bk.date !== dateKey) return false;
      const bStart = parseTimeToMinutes(bk.time);
      const bDuration = parseInt(bk.totalDuration, 10) || 30;
      const bEnd = bStart + bDuration;
      return checkIntervalsOverlap(startMins, endMins, bStart, bEnd);
    });

    if (conflictBooking) {
      return res.status(409).json({
        error: `Double-booking conflict: ${assignedBarber.name} is already booked from ${conflictBooking.time} to ${conflictBooking.endTime || 'end'}. Please choose a different time slot.`,
        code: 'DOUBLE_BOOKING_PREVENTED',
      });
    }
  }

  // 2. Price calculation
  const discount = couponCode === 'AAORA40' ? Math.round(subtotal * 0.4) : 0;
  const tax = Math.round((subtotal - discount) * 0.05);
  const totalAmount = Math.max(0, subtotal - discount + tax);

  let advancePaid = 0;
  let remainingAmount = totalAmount;
  let paymentStatus = 'Pending at Venue';

  if (paymentMethod === 'Razorpay Online') {
    advancePaid = totalAmount;
    remainingAmount = 0;
    paymentStatus = 'Paid Full';
  } else if (paymentMethod.includes('Advance')) {
    advancePaid = Math.round(totalAmount * 0.25);
    remainingAmount = totalAmount - advancePaid;
    paymentStatus = 'Advance Paid';
  }

  const bookingId = `BK-${Math.floor(100000 + Math.random() * 900000)}`;

  const newBooking = {
    id: bookingId,
    userId: req.user.id,
    salonId: salon.id,
    salonName: salon.name,
    salonAddress: salon.address,
    salonImage: salon.image,
    salonPhone: salon.phone,
    serviceName: services.map((s) => s.name).join(' + '),
    services: services.map((s) => ({ name: s.name, price: s.price, duration: s.duration })),
    totalDuration: `${totalMins} mins`,
    price: subtotal,
    discount,
    tax,
    totalAmount,
    paymentMethod,
    paymentStatus,
    advancePaid,
    remainingAmount,
    transactionId: `txn_${Math.random().toString(36).substring(2, 14)}`,
    date: dateLabel,
    rawDate,
    time: timeSlot,
    endTime: formatMinutesToTime(endMins),
    stylist: `${assignedBarber.name} (${assignedBarber.role})`,
    stylistId: assignedBarber.id,
    stylistAvatar: assignedBarber.avatar,
    status: 'Confirmed',
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${bookingId}-${salon.id}-${assignedBarber.id}`,
    customerName: req.user.name,
    customerPhone: req.user.phone,
    customerEmail: req.user.email,
    createdAt: new Date().toISOString(),
    isReviewed: false,
  };

  // Mark slot as booked in SLOTS store
  const matchingSlot = SLOTS.find(
    (s) => s.salonId === salon.id && s.employeeId === assignedBarber.id && (s.date === rawDate || s.date === dateKey) && s.startTime === timeSlot
  );
  if (matchingSlot) {
    matchingSlot.status = 'BOOKED';
    matchingSlot.bookingId = bookingId;
  } else {
    // Create new booked slot entry
    SLOTS.push({
      id: `slot-${bookingId}`,
      salonId: salon.id,
      employeeId: assignedBarber.id,
      employeeName: assignedBarber.name,
      date: rawDate,
      startTime: timeSlot,
      endTime: formatMinutesToTime(endMins),
      durationMinutes: totalMins,
      slotType: 'automatic',
      status: 'BOOKED',
      bookingId,
    });
  }

  // Update legacy bookedSlots array
  if (!assignedBarber.bookedSlots) assignedBarber.bookedSlots = {};
  if (!assignedBarber.bookedSlots[dateKey]) assignedBarber.bookedSlots[dateKey] = [];
  if (!assignedBarber.bookedSlots[dateKey].includes(timeSlot)) {
    assignedBarber.bookedSlots[dateKey].push(timeSlot);
  }

  BOOKINGS.unshift(newBooking);
  res.status(201).json({ message: 'Appointment booked successfully', booking: newBooking });
});

// RESCHEDULE (WITH AVAILABILITY VALIDATION)
app.post('/api/bookings/:id/reschedule', authenticateJWT, requireRole(['customer', 'owner', 'admin']), (req, res) => {
  const booking = BOOKINGS.find((b) => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  if (req.user.role === 'customer' && booking.userId !== req.user.id && booking.customerEmail !== req.user.email) {
    return res.status(403).json({ error: 'Forbidden: You cannot reschedule another user’s appointment.' });
  }

  const { newDate, newTime, rawDate } = req.body;
  if (!newDate || !newTime) {
    return res.status(400).json({ error: 'New date and time are required.' });
  }

  // Check double-booking for the stylist at the new slot
  const newStartMins = parseTimeToMinutes(newTime);
  const totalMins = parseInt(booking.totalDuration, 10) || 30;
  const newEndMins = newStartMins + totalMins;

  const hasConflict = BOOKINGS.some((bk) => {
    if (bk.id === booking.id) return false;
    if (bk.salonId !== booking.salonId || (bk.stylistId && bk.stylistId !== booking.stylistId)) return false;
    if (bk.status === 'Cancelled' || bk.status === 'Rejected') return false;
    if (bk.rawDate !== (rawDate || newDate) && bk.date !== newDate) return false;
    const bStart = parseTimeToMinutes(bk.time);
    const bDuration = parseInt(bk.totalDuration, 10) || 30;
    const bEnd = bStart + bDuration;
    return checkIntervalsOverlap(newStartMins, newEndMins, bStart, bEnd);
  });

  if (hasConflict) {
    return res.status(409).json({
      error: 'Cannot reschedule: The requested stylist is already booked at that new time slot.',
      code: 'RESCHEDULE_CONFLICT',
    });
  }

  booking.date = newDate;
  booking.rawDate = rawDate || newDate;
  booking.time = newTime;
  booking.endTime = formatMinutesToTime(newEndMins);
  booking.status = 'Confirmed';

  res.json({ message: 'Appointment rescheduled successfully!', booking });
});

// ----------------------------------------------------
// 4. STAFF / STYLIST / BARBER PORTAL API
// ----------------------------------------------------

app.get('/api/staff/schedule', authenticateJWT, requireRole(['staff', 'owner', 'admin']), (req, res) => {
  const staffEmployeeId = req.user.role === 'staff' ? req.user.employeeId || 's1' : req.query.employeeId || 's1';
  const salonId = req.user.salonId || 'looks-salon';

  const salon = SALONS.find((s) => s.id === salonId);
  const employee = salon?.stylists.find((s) => s.id === staffEmployeeId);

  if (!employee) {
    return res.status(404).json({ error: 'Stylist profile not found.' });
  }

  const assignedBookings = BOOKINGS.filter(
    (b) => b.salonId === salonId && (b.stylistId === employee.id || b.stylist.includes(employee.name))
  );

  const todayBookings = assignedBookings.filter((b) => b.status !== 'Cancelled');
  const completedCount = assignedBookings.filter((b) => b.status === 'Completed').length;
  const inProgressBooking = assignedBookings.find((b) => b.status === 'In Progress');

  res.json({
    employee,
    salonName: salon?.name,
    metrics: {
      totalAssigned: assignedBookings.length,
      todayAppointments: todayBookings.length,
      completedAppointments: completedCount,
      rating: employee.rating,
    },
    inProgressBooking: inProgressBooking || null,
    upcomingBookings: assignedBookings,
  });
});

app.put('/api/staff/appointments/:id/status', authenticateJWT, requireRole(['staff', 'owner', 'admin']), (req, res) => {
  const booking = BOOKINGS.find((b) => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found.' });

  const { status } = req.body;
  if (!['In Progress', 'Completed', 'No Show', 'Customer Arrived', 'Confirmed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status update.' });
  }

  booking.status = status;
  if (status === 'Completed') {
    booking.completedAt = new Date().toISOString();
  }

  res.json({ message: `Appointment status updated to '${status}'`, booking });
});

// ----------------------------------------------------
// 5. SALON OWNER ENHANCEMENTS (CRM & PROFILE)
// ----------------------------------------------------

app.get('/api/owner/customers', authenticateJWT, requireRole(['owner', 'admin']), (req, res) => {
  const salonId = req.user.salonId;
  const salonBookings = BOOKINGS.filter((b) => b.salonId === salonId);

  // Group by customer email
  const customerMap = {};
  salonBookings.forEach((b) => {
    const key = b.customerEmail || b.userId;
    if (!customerMap[key]) {
      customerMap[key] = {
        id: b.userId,
        name: b.customerName,
        email: b.customerEmail,
        phone: b.customerPhone,
        totalVisits: 0,
        totalSpend: 0,
        lastVisitDate: b.date,
        preferredStylist: b.stylist.split('(')[0].trim(),
        servicesTaken: [],
      };
    }
    customerMap[key].totalVisits += 1;
    customerMap[key].totalSpend += b.totalAmount || 0;
    if (b.serviceName && !customerMap[key].servicesTaken.includes(b.serviceName)) {
      customerMap[key].servicesTaken.push(b.serviceName);
    }
  });

  const customers = Object.values(customerMap);
  res.json({ customers, totalCount: customers.length });
});

app.put('/api/owner/salon-profile', authenticateJWT, requireRole(['owner', 'admin']), (req, res) => {
  const salonId = req.user.salonId;
  const salon = SALONS.find((s) => s.id === salonId);
  if (!salon) return res.status(404).json({ error: 'Salon not found.' });

  const { name, description, address, city, phone, openingTime, closingTime, holidays, amenities, crowdStatus } = req.body;
  if (name) salon.name = name;
  if (description) salon.description = description;
  if (address) salon.address = address;
  if (city) salon.city = city;
  if (phone) salon.phone = phone;
  if (openingTime) salon.openingTime = openingTime;
  if (closingTime) salon.closingTime = closingTime;
  if (openingTime && closingTime) salon.openingHours = `${openingTime} - ${closingTime}`;
  if (holidays) salon.holidays = holidays;
  if (amenities) salon.amenities = amenities;
  if (crowdStatus) salon.crowdStatus = crowdStatus;

  res.json({ message: 'Salon profile updated successfully', salon });
});

app.post('/api/bookings/:id/cancel', authenticateJWT, requireRole(['customer']), (req, res) => {
  const booking = BOOKINGS.find((b) => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  if (booking.userId !== req.user.id && booking.customerEmail !== req.user.email) {
    return res.status(403).json({ error: 'Forbidden: You cannot cancel another user’s appointment.' });
  }

  const cancellationFee = booking.advancePaid > 0 ? SYSTEM_SETTINGS.cancellationFeeFlat : 0;
  const refundAmount = Math.max(0, booking.advancePaid - cancellationFee);

  booking.status = 'Cancelled';
  booking.paymentStatus = 'Refunded';
  booking.cancellationRefund = {
    advancePaid: booking.advancePaid,
    refund: refundAmount,
    fee: cancellationFee,
    cancelledAt: new Date().toISOString(),
  };

  res.json({
    message: 'Booking cancelled successfully',
    cancellationSummary: booking.cancellationRefund,
    booking,
  });
});

app.post('/api/bookings/:id/arrival-status', authenticateJWT, requireRole(['customer']), (req, res) => {
  const booking = BOOKINGS.find((b) => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  const { statusType, delayMinutes } = req.body;

  if (statusType === 'on_the_way') {
    booking.arrivalNote = `${req.user.name} is on the way! (ETA ~10 mins)`;
  } else if (statusType === 'running_late') {
    booking.arrivalNote = `${req.user.name} reported running late by ${delayMinutes || 10} minutes.`;
  }

  res.json({ message: 'Arrival update notified to salon owner', booking });
});

app.post('/api/bookings/:id/review', authenticateJWT, requireRole(['customer']), (req, res) => {
  const booking = BOOKINGS.find((b) => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  if (booking.userId !== req.user.id && booking.customerEmail !== req.user.email) {
    return res.status(403).json({ error: 'Forbidden: You can only review your own appointments.' });
  }

  if (booking.status !== 'Completed') {
    return res.status(400).json({ error: 'Reviews can only be submitted for completed appointments.' });
  }

  if (booking.isReviewed) {
    return res.status(400).json({ error: 'A review has already been submitted for this booking.' });
  }

  const { salonRating = 5, barberRating = 5, comment = '' } = req.body;

  booking.isReviewed = true;
  booking.userRating = salonRating;
  booking.userReview = comment;

  const newReview = {
    id: `rev-${Date.now()}`,
    salonId: booking.salonId,
    salonName: booking.salonName,
    bookingId: booking.id,
    userId: req.user.id,
    userName: req.user.name,
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    barberName: booking.stylist.split('(')[0].trim(),
    barberRating,
    salonRating,
    comment,
    date: new Date().toISOString().split('T')[0],
    status: 'approved',
  };

  REVIEWS.push(newReview);
  res.status(201).json({ message: 'Review submitted successfully', review: newReview, booking });
});

// ----------------------------------------------------
// 4. SALON OWNER PORTAL API
// ----------------------------------------------------

app.get('/api/owner/dashboard', authenticateJWT, requireRole(['owner']), (req, res) => {
  const salonId = req.user.salonId;
  if (!salonId) return res.status(400).json({ error: 'No salon associated with this owner account.' });

  const salon = SALONS.find((s) => s.id === salonId);
  if (!salon) return res.status(404).json({ error: 'Owner salon not found.' });

  const salonBookings = BOOKINGS.filter((b) => b.salonId === salonId);
  const totalRevenue = salonBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const commission = Math.round((totalRevenue * salon.commissionRate) / 100);
  const netPayout = totalRevenue - commission;

  res.json({
    salon,
    metrics: {
      totalBookings: salonBookings.length,
      todayRevenue: totalRevenue,
      platformCommission: commission,
      netPayout,
      activeBarbersCount: salon.stylists.filter((b) => b.active).length,
      rating: salon.rating,
      reviewsCount: salon.reviewsCount,
    },
    recentBookings: salonBookings.slice(0, 10),
  });
});

app.get('/api/owner/appointments', authenticateJWT, requireRole(['owner']), (req, res) => {
  const salonId = req.user.salonId;
  const salonBookings = BOOKINGS.filter((b) => b.salonId === salonId);
  res.json({ bookings: salonBookings });
});

app.post('/api/owner/appointments/:id/status', authenticateJWT, requireRole(['owner']), (req, res) => {
  const booking = BOOKINGS.find((b) => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  if (booking.salonId !== req.user.salonId) {
    return res.status(403).json({ error: 'Forbidden: You cannot modify bookings for another salon.' });
  }

  const { status } = req.body;
  if (!['Pending', 'Confirmed', 'Customer Arrived', 'In Progress', 'Completed', 'Cancelled', 'No Show'].includes(status)) {
    return res.status(400).json({ error: 'Invalid booking status.' });
  }

  booking.status = status;
  res.json({ message: `Booking status updated to ${status}`, booking });
});

app.post('/api/owner/qr-checkin', authenticateJWT, requireRole(['owner']), (req, res) => {
  const { bookingId } = req.body;
  if (!bookingId) return res.status(400).json({ error: 'Booking ID is required.' });

  const booking = BOOKINGS.find((b) => b.id === bookingId || b.id === bookingId.trim().toUpperCase());
  if (!booking) return res.status(404).json({ error: 'No matching booking found for this QR code.' });

  if (booking.salonId !== req.user.salonId) {
    return res.status(403).json({ error: 'This booking belongs to another salon!' });
  }

  booking.status = 'Customer Arrived';
  res.json({ message: 'Customer successfully checked in!', booking });
});

app.get('/api/owner/barbers', authenticateJWT, requireRole(['owner']), (req, res) => {
  const salon = SALONS.find((s) => s.id === req.user.salonId);
  if (!salon) return res.status(404).json({ error: 'Salon not found.' });
  res.json({ barbers: salon.stylists });
});

app.post('/api/owner/barbers', authenticateJWT, requireRole(['owner']), (req, res) => {
  const salon = SALONS.find((s) => s.id === req.user.salonId);
  if (!salon) return res.status(404).json({ error: 'Salon not found.' });

  const { name, role, specialization, workingHours, breaks, daysOff } = req.body;
  if (!name) return res.status(400).json({ error: 'Barber name is required.' });

  const newBarber = {
    id: `b-${Date.now()}`,
    name,
    role: role || 'Senior Hair Stylist',
    specialization: specialization || 'Precision Cuts',
    experience: '4+ years',
    rating: 5.0,
    reviewsCount: 0,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    workingHours: workingHours || '09:00 AM - 08:30 PM',
    breaks: breaks || ['01:00 PM - 02:00 PM'],
    daysOff: daysOff || ['Monday'],
    active: true,
    bookedSlots: {},
  };

  salon.stylists.push(newBarber);
  res.status(201).json({ message: 'Barber added successfully', barber: newBarber });
});

app.put('/api/owner/barbers/:id', authenticateJWT, requireRole(['owner']), (req, res) => {
  const salon = SALONS.find((s) => s.id === req.user.salonId);
  if (!salon) return res.status(404).json({ error: 'Salon not found.' });

  const barber = salon.stylists.find((b) => b.id === req.params.id);
  if (!barber) return res.status(404).json({ error: 'Barber not found.' });

  const { active, workingHours, breaks, daysOff, specialization } = req.body;
  if (active !== undefined) barber.active = active;
  if (workingHours) barber.workingHours = workingHours;
  if (breaks) barber.breaks = breaks;
  if (daysOff) barber.daysOff = daysOff;
  if (specialization) barber.specialization = specialization;

  res.json({ message: 'Barber updated successfully', barber });
});

app.get('/api/owner/services', authenticateJWT, requireRole(['owner']), (req, res) => {
  const salon = SALONS.find((s) => s.id === req.user.salonId);
  if (!salon) return res.status(404).json({ error: 'Salon not found.' });
  res.json({ services: salon.services });
});

app.post('/api/owner/services', authenticateJWT, requireRole(['owner']), (req, res) => {
  const salon = SALONS.find((s) => s.id === req.user.salonId);
  if (!salon) return res.status(404).json({ error: 'Salon not found.' });

  const { name, price, duration, category, originalPrice } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'Service name and price are required.' });

  const newService = {
    id: `srv-${Date.now()}`,
    name,
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : undefined,
    duration: duration || '30 mins',
    category: category || 'haircut',
    popular: false,
  };

  salon.services.push(newService);
  res.status(201).json({ message: 'Service added successfully', service: newService });
});

// ----------------------------------------------------
// STANDARD RESTFUL SERVICES & EMPLOYEES ENDPOINTS (SECTION 51)
// ----------------------------------------------------

// Services
app.get('/api/services/salon/:salonId', (req, res) => {
  const salon = SALONS.find((s) => s.id === req.params.salonId);
  if (!salon) return res.status(404).json({ error: 'Salon not found.' });
  res.json({ services: salon.services || [] });
});

app.post('/api/services', authenticateJWT, requireSalonOwnership, (req, res) => {
  const targetSalonId = req.user.role === 'admin' ? req.body.salonId : req.user.salonId;
  const salon = SALONS.find((s) => s.id === targetSalonId);
  if (!salon) return res.status(404).json({ error: 'Salon not found.' });

  const { name, price, duration, category, originalPrice, description, popular = false } = req.body;
  if (!name || price === undefined) return res.status(400).json({ error: 'Service name and price are required.' });

  const newService = {
    id: `srv-${Date.now()}`,
    name,
    description: description || '',
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : undefined,
    duration: duration || '30 mins',
    category: category || 'haircut',
    popular: Boolean(popular),
    active: true,
  };

  if (!salon.services) salon.services = [];
  salon.services.push(newService);
  res.status(201).json({ message: 'Service created successfully', service: newService });
});

app.put('/api/services/:id', authenticateJWT, (req, res) => {
  let matchedSalon = null;
  let matchedService = null;

  for (const s of SALONS) {
    const found = s.services?.find((srv) => srv.id === req.params.id);
    if (found) {
      matchedSalon = s;
      matchedService = found;
      break;
    }
  }

  if (!matchedSalon || !matchedService) {
    return res.status(404).json({ error: 'Service not found.' });
  }

  // Verify ownership
  if (req.user.role !== 'admin' && req.user.salonId !== matchedSalon.id) {
    return res.status(403).json({ error: 'Forbidden: You do not have permission to edit this service.' });
  }

  const { name, price, duration, category, originalPrice, description, popular, active } = req.body;
  if (name !== undefined) matchedService.name = name;
  if (price !== undefined) matchedService.price = Number(price);
  if (duration !== undefined) matchedService.duration = duration;
  if (category !== undefined) matchedService.category = category;
  if (originalPrice !== undefined) matchedService.originalPrice = Number(originalPrice);
  if (description !== undefined) matchedService.description = description;
  if (popular !== undefined) matchedService.popular = popular;
  if (active !== undefined) matchedService.active = active;

  res.json({ message: 'Service updated successfully', service: matchedService });
});

app.delete('/api/services/:id', authenticateJWT, (req, res) => {
  let matchedSalon = null;
  let serviceIdx = -1;

  for (const s of SALONS) {
    const idx = s.services?.findIndex((srv) => srv.id === req.params.id);
    if (idx !== -1 && idx !== undefined) {
      matchedSalon = s;
      serviceIdx = idx;
      break;
    }
  }

  if (!matchedSalon || serviceIdx === -1) {
    return res.status(404).json({ error: 'Service not found.' });
  }

  if (req.user.role !== 'admin' && req.user.salonId !== matchedSalon.id) {
    return res.status(403).json({ error: 'Forbidden: You do not have permission to delete this service.' });
  }

  matchedSalon.services.splice(serviceIdx, 1);
  res.json({ message: 'Service deleted successfully.' });
});

// Employees
app.get('/api/employees/salon/:salonId', (req, res) => {
  const salon = SALONS.find((s) => s.id === req.params.salonId);
  if (!salon) return res.status(404).json({ error: 'Salon not found.' });
  res.json({ employees: salon.stylists || [] });
});

app.post('/api/employees', authenticateJWT, requireSalonOwnership, (req, res) => {
  const targetSalonId = req.user.role === 'admin' ? req.body.salonId : req.user.salonId;
  const salon = SALONS.find((s) => s.id === targetSalonId);
  if (!salon) return res.status(404).json({ error: 'Salon not found.' });

  const { name, role, specialization, experience, workingHours, breaks, daysOff, email, phone, avatar } = req.body;
  if (!name) return res.status(400).json({ error: 'Employee name is required.' });

  const newEmployee = {
    id: `emp-${Date.now()}`,
    name,
    role: role || 'Senior Hair Stylist',
    specialization: specialization || 'General Styling',
    experience: experience || '3+ years',
    rating: 5.0,
    reviewsCount: 0,
    email: email || '',
    phone: phone || '',
    avatar: avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    workingHours: workingHours || '09:00 AM - 08:30 PM',
    breaks: breaks || ['01:00 PM - 02:00 PM'],
    daysOff: daysOff || ['Monday'],
    active: true,
    bookedSlots: {},
  };

  if (!salon.stylists) salon.stylists = [];
  salon.stylists.push(newEmployee);
  res.status(201).json({ message: 'Employee created successfully', employee: newEmployee });
});

app.put('/api/employees/:id', authenticateJWT, (req, res) => {
  let matchedSalon = null;
  let matchedEmployee = null;

  for (const s of SALONS) {
    const found = s.stylists?.find((st) => st.id === req.params.id);
    if (found) {
      matchedSalon = s;
      matchedEmployee = found;
      break;
    }
  }

  if (!matchedSalon || !matchedEmployee) {
    return res.status(404).json({ error: 'Employee not found.' });
  }

  if (req.user.role !== 'admin' && req.user.salonId !== matchedSalon.id) {
    return res.status(403).json({ error: 'Forbidden: You do not have permission to edit this employee.' });
  }

  const { name, role, specialization, workingHours, breaks, daysOff, active, email, phone, leaveDates } = req.body;
  if (name !== undefined) matchedEmployee.name = name;
  if (role !== undefined) matchedEmployee.role = role;
  if (specialization !== undefined) matchedEmployee.specialization = specialization;
  if (workingHours !== undefined) matchedEmployee.workingHours = workingHours;
  if (breaks !== undefined) matchedEmployee.breaks = breaks;
  if (daysOff !== undefined) matchedEmployee.daysOff = daysOff;
  if (active !== undefined) matchedEmployee.active = active;
  if (email !== undefined) matchedEmployee.email = email;
  if (phone !== undefined) matchedEmployee.phone = phone;
  if (leaveDates !== undefined) matchedEmployee.leaveDates = leaveDates;

  res.json({ message: 'Employee updated successfully', employee: matchedEmployee });
});

app.delete('/api/employees/:id', authenticateJWT, (req, res) => {
  let matchedSalon = null;
  let empIdx = -1;

  for (const s of SALONS) {
    const idx = s.stylists?.findIndex((st) => st.id === req.params.id);
    if (idx !== -1 && idx !== undefined) {
      matchedSalon = s;
      empIdx = idx;
      break;
    }
  }

  if (!matchedSalon || empIdx === -1) {
    return res.status(404).json({ error: 'Employee not found.' });
  }

  if (req.user.role !== 'admin' && req.user.salonId !== matchedSalon.id) {
    return res.status(403).json({ error: 'Forbidden: You do not have permission to delete this employee.' });
  }

  matchedSalon.stylists.splice(empIdx, 1);
  res.json({ message: 'Employee deleted successfully.' });
});

// Reviews for Salon
app.get('/api/reviews/salon/:salonId', (req, res) => {
  const salonReviews = REVIEWS.filter((r) => r.salonId === req.params.salonId && r.status !== 'flagged');
  res.json({ reviews: salonReviews, count: salonReviews.length });
});

// Standard Review Creation (Section 51 & 41)
app.post('/api/reviews', authenticateJWT, requireRole(['customer']), (req, res) => {
  const { bookingId, salonId, salonRating = 5, barberRating = 5, comment = '' } = req.body;
  if (!bookingId) {
    return res.status(400).json({ error: 'bookingId is required to submit a review.' });
  }

  const booking = BOOKINGS.find((b) => b.id === bookingId);
  if (!booking) return res.status(404).json({ error: 'Booking not found.' });

  if (booking.userId !== req.user.id && booking.customerEmail !== req.user.email) {
    return res.status(403).json({ error: 'Forbidden: You can only review your own appointments.' });
  }

  if (booking.status !== 'Completed') {
    return res.status(400).json({ error: 'Reviews can only be submitted for completed appointments.' });
  }

  if (booking.isReviewed) {
    return res.status(400).json({ error: 'A review has already been submitted for this booking.' });
  }

  booking.isReviewed = true;
  booking.userRating = salonRating;
  booking.userReview = comment;

  const newReview = {
    id: `rev-${Date.now()}`,
    salonId: booking.salonId || salonId,
    salonName: booking.salonName,
    bookingId: booking.id,
    userId: req.user.id,
    userName: req.user.name,
    userAvatar: req.user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    barberName: booking.stylist?.split('(')[0]?.trim() || 'Staff Stylist',
    barberRating,
    salonRating,
    comment,
    date: new Date().toISOString().split('T')[0],
    status: 'approved',
  };

  REVIEWS.push(newReview);
  res.status(201).json({ message: 'Review submitted successfully', review: newReview });
});

// My Bookings (Standard REST route)
app.get('/api/bookings/my', authenticateJWT, requireRole(['customer']), (req, res) => {
  const customerBookings = BOOKINGS.filter(
    (b) => b.userId === req.user.id || b.customerEmail.toLowerCase() === req.user.email.toLowerCase()
  );
  res.json({ bookings: customerBookings });
});

// Standard REST Booking Status / Cancel / Reschedule PUT aliases
app.put('/api/bookings/:id/cancel', authenticateJWT, requireRole(['customer', 'owner', 'admin']), (req, res) => {
  const booking = BOOKINGS.find((b) => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  if (req.user.role === 'customer' && booking.userId !== req.user.id && booking.customerEmail !== req.user.email) {
    return res.status(403).json({ error: 'Forbidden: You cannot cancel another user’s appointment.' });
  }
  if (req.user.role === 'owner' && req.user.salonId !== booking.salonId) {
    return res.status(403).json({ error: 'Forbidden: You cannot cancel appointments for another salon.' });
  }

  booking.status = 'Cancelled';
  booking.paymentStatus = booking.advancePaid > 0 ? 'Refunded' : booking.paymentStatus;
  res.json({ message: 'Booking cancelled successfully', booking });
});

app.put('/api/bookings/:id/reschedule', authenticateJWT, requireRole(['customer', 'owner', 'admin']), (req, res) => {
  const booking = BOOKINGS.find((b) => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  if (req.user.role === 'customer' && booking.userId !== req.user.id && booking.customerEmail !== req.user.email) {
    return res.status(403).json({ error: 'Forbidden: You cannot reschedule another user’s appointment.' });
  }

  const { newDate, newTime, rawDate } = req.body;
  if (!newDate || !newTime) {
    return res.status(400).json({ error: 'New date and time are required.' });
  }

  booking.date = newDate;
  booking.rawDate = rawDate || newDate;
  booking.time = newTime;
  booking.status = 'Confirmed';

  res.json({ message: 'Appointment rescheduled successfully!', booking });
});

app.put('/api/bookings/:id/status', authenticateJWT, requireRole(['owner', 'staff', 'admin']), (req, res) => {
  const booking = BOOKINGS.find((b) => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  if (req.user.role === 'owner' && req.user.salonId !== booking.salonId) {
    return res.status(403).json({ error: 'Forbidden: You cannot modify bookings for another salon.' });
  }

  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required.' });

  booking.status = status;
  if (status === 'Completed') {
    booking.completedAt = new Date().toISOString();
  }
  res.json({ message: `Booking status updated to ${status}`, booking });
});

// Payment lookup by ID
app.get('/api/payments/:id', authenticateJWT, (req, res) => {
  const payment = BOOKINGS.find((b) => b.transactionId === req.params.id || b.id === req.params.id);
  if (!payment) return res.status(404).json({ error: 'Payment record not found.' });

  if (req.user.role === 'customer' && payment.userId !== req.user.id && payment.customerEmail !== req.user.email) {
    return res.status(403).json({ error: 'Forbidden: You cannot access another user’s payment record.' });
  }

  res.json({
    payment: {
      transactionId: payment.transactionId,
      bookingId: payment.id,
      customerName: payment.customerName,
      salonName: payment.salonName,
      amount: payment.totalAmount,
      advancePaid: payment.advancePaid,
      remainingAmount: payment.remainingAmount,
      method: payment.paymentMethod,
      status: payment.paymentStatus,
      date: payment.createdAt,
    },
  });
});

// Salon Creation (Section 51 & 18)
app.post('/api/salons', authenticateJWT, (req, res) => {
  const { name, address, city, phone, openingHours, services = [], amenities = [] } = req.body;
  if (!name) return res.status(400).json({ error: 'Salon name is required.' });

  const salonId = `salon-${Date.now()}`;
  const newSalon = {
    id: salonId,
    name,
    rating: 5.0,
    reviewsCount: 0,
    distance: '1.0 km away',
    address: address || 'Main Road',
    city: city || 'Indore',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80'],
    startingPrice: 199,
    isFavorite: false,
    gender: 'unisex',
    openingHours: openingHours || '09:00 AM - 09:00 PM',
    phone: phone || req.user.phone || '+91 98000 11111',
    ownerId: req.user.id,
    status: req.user.role === 'admin' ? 'verified' : 'pending',
    commissionRate: 5,
    crowdStatus: 'Good availability',
    amenities: amenities.length ? amenities : ['AC', 'Free Wi-Fi', 'Sanitized Tools'],
    stylists: [
      {
        id: `s-${Date.now()}`,
        name: req.user.name,
        role: 'Salon Manager & Stylist',
        specialization: 'Hair & Grooming',
        experience: '4+ years',
        rating: 5.0,
        reviewsCount: 0,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        workingHours: '09:00 AM - 08:30 PM',
        breaks: ['01:00 PM - 02:00 PM'],
        daysOff: ['Monday'],
        active: true,
        bookedSlots: {},
      },
    ],
    services: services.length ? services : [
      { id: `srv-1`, name: 'Classic Haircut', category: 'haircut', duration: '30 mins', price: 199, popular: true },
    ],
  };

  SALONS.push(newSalon);

  // Link salon to owner
  const user = USERS.find((u) => u.id === req.user.id);
  if (user) {
    user.salonId = salonId;
    if (user.role === 'customer') {
      user.role = 'owner';
    }
  }

  res.status(201).json({ message: 'Salon registered successfully.', salon: newSalon });
});

app.put('/api/salons/:id', authenticateJWT, requireSalonOwnership, (req, res) => {
  const salon = SALONS.find((s) => s.id === req.params.id);
  if (!salon) return res.status(404).json({ error: 'Salon not found.' });

  const { name, description, address, city, phone, openingHours, amenities, crowdStatus, image, gallery } = req.body;
  if (name) salon.name = name;
  if (description) salon.description = description;
  if (address) salon.address = address;
  if (city) salon.city = city;
  if (phone) salon.phone = phone;
  if (openingHours) salon.openingHours = openingHours;
  if (amenities) salon.amenities = amenities;
  if (crowdStatus) salon.crowdStatus = crowdStatus;
  if (image) salon.image = image;
  if (gallery) salon.gallery = gallery;

  res.json({ message: 'Salon updated successfully', salon });
});

app.delete('/api/salons/:id', authenticateJWT, requireRole(['admin']), (req, res) => {
  const idx = SALONS.findIndex((s) => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Salon not found.' });
  SALONS.splice(idx, 1);
  res.json({ message: 'Salon deleted by administrator.' });
});

// ----------------------------------------------------
// 5. ADMIN PORTAL API
// ----------------------------------------------------

app.get('/api/admin/dashboard', authenticateJWT, requireRole(['admin']), (req, res) => {
  const totalGMV = BOOKINGS.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalCommissionRevenue = Math.round(totalGMV * (SYSTEM_SETTINGS.platformCommissionRate / 100));

  res.json({
    metrics: {
      totalGMV,
      totalCommissionRevenue,
      totalBookingsCount: BOOKINGS.length,
      activeSalonsCount: SALONS.filter((s) => s.status === 'verified').length,
      registeredUsersCount: USERS.length,
      completedAppointmentsCount: BOOKINGS.filter((b) => b.status === 'Completed').length,
    },
    systemSettings: SYSTEM_SETTINGS,
  });
});

app.get('/api/admin/users', authenticateJWT, requireRole(['admin']), (req, res) => {
  res.json({ users: USERS.map(sanitizeUser) });
});

app.put('/api/admin/users/:id/status', authenticateJWT, requireRole(['admin']), (req, res) => {
  const user = USERS.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  const { status } = req.body;
  if (!['active', 'banned'].includes(status)) return res.status(400).json({ error: 'Invalid status.' });

  user.status = status;
  res.json({ message: `User status changed to ${status}`, user });
});

app.get('/api/admin/salons', authenticateJWT, requireRole(['admin']), (req, res) => {
  res.json({ salons: SALONS });
});

app.put('/api/admin/salons/:id', authenticateJWT, requireRole(['admin']), (req, res) => {
  const salon = SALONS.find((s) => s.id === req.params.id);
  if (!salon) return res.status(404).json({ error: 'Salon not found.' });

  const { status, commissionRate, crowdStatus } = req.body;
  if (status) salon.status = status;
  if (commissionRate !== undefined) salon.commissionRate = Number(commissionRate);
  if (crowdStatus) salon.crowdStatus = crowdStatus;

  res.json({ message: 'Salon updated by admin', salon });
});

app.get('/api/admin/bookings', authenticateJWT, requireRole(['admin']), (req, res) => {
  res.json({ bookings: BOOKINGS });
});

app.get('/api/admin/payments', authenticateJWT, requireRole(['admin']), (req, res) => {
  const payments = BOOKINGS.map((b) => ({
    transactionId: b.transactionId,
    bookingId: b.id,
    customerName: b.customerName,
    salonName: b.salonName,
    amount: b.totalAmount,
    advancePaid: b.advancePaid,
    remainingAmount: b.remainingAmount,
    method: b.paymentMethod,
    status: b.paymentStatus,
    date: b.createdAt,
  }));
  res.json({ payments });
});

app.get('/api/admin/reviews', authenticateJWT, requireRole(['admin']), (req, res) => {
  res.json({ reviews: REVIEWS });
});

app.put('/api/admin/reviews/:id/status', authenticateJWT, requireRole(['admin']), (req, res) => {
  const review = REVIEWS.find((r) => r.id === req.params.id);
  if (!review) return res.status(404).json({ error: 'Review not found.' });

  const { status } = req.body;
  if (!['approved', 'flagged'].includes(status)) return res.status(400).json({ error: 'Invalid status.' });

  review.status = status;
  res.json({ message: `Review status set to ${status}`, review });
});

app.get('/api/admin/settings', authenticateJWT, requireRole(['admin']), (req, res) => {
  res.json({ settings: SYSTEM_SETTINGS });
});

app.put('/api/admin/settings', authenticateJWT, requireRole(['admin']), (req, res) => {
  const { platformCommissionRate, advanceBookingPercentage, cancellationFeeFlat, announcement } = req.body;
  if (platformCommissionRate !== undefined) SYSTEM_SETTINGS.platformCommissionRate = platformCommissionRate;
  if (advanceBookingPercentage !== undefined) SYSTEM_SETTINGS.advanceBookingPercentage = advanceBookingPercentage;
  if (cancellationFeeFlat !== undefined) SYSTEM_SETTINGS.cancellationFeeFlat = cancellationFeeFlat;
  if (announcement !== undefined) SYSTEM_SETTINGS.announcement = announcement;

  res.json({ message: 'Platform settings updated', settings: SYSTEM_SETTINGS });
});

// ----------------------------------------------------
// 6. PAYMENT SANDBOX API
// ----------------------------------------------------

app.post('/api/payments/create-order', authenticateJWT, (req, res) => {
  const { amount, currency = 'INR', receipt, notes } = req.body;
  if (!amount) return res.status(400).json({ error: 'Amount is required.' });

  const orderId = `order_${Math.random().toString(36).substring(2, 12)}`;
  res.json({
    id: orderId,
    amount: Math.round(Number(amount) * 100), // in paise
    currency,
    receipt: receipt || `rcpt_${Date.now()}`,
    status: 'created',
    notes: notes || { description: 'Salon booking payment' },
  });
});

app.post('/api/payments/verify', authenticateJWT, (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;
  const transactionId = razorpay_payment_id || `pay_${Math.random().toString(36).substring(2, 14)}`;

  if (bookingId) {
    const booking = BOOKINGS.find((b) => b.id === bookingId);
    if (booking) {
      booking.paymentStatus = 'Paid Full';
      booking.transactionId = transactionId;
    }
  }

  res.json({
    success: true,
    message: 'Payment verified successfully.',
    transactionId,
    orderId: razorpay_order_id,
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ----------------------------------------------------
// VITE MIDDLEWARE & SERVER STARTUP
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Salon Booking Platform Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
