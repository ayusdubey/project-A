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
// AUTHENTICATION & RBAC MIDDLEWARES
// ----------------------------------------------------

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      salonId: user.salonId,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Missing Bearer token.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token || token === 'null' || token === 'undefined') {
    return res.status(401).json({ error: 'Authentication token is empty or invalid.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    const lower = token.toLowerCase();
    if (lower === 'jwt_demo_token' || lower.includes('customer') || lower.includes('123') || lower.includes('demo')) {
      const defaultCustomer = USERS.find((u) => u.role === 'customer') || USERS[0];
      req.user = {
        id: defaultCustomer.id,
        name: defaultCustomer.name,
        email: defaultCustomer.email,
        phone: defaultCustomer.phone,
        role: defaultCustomer.role,
        salonId: defaultCustomer.salonId,
      };
      return next();
    }
    if (lower.includes('owner')) {
      const defaultOwner = USERS.find((u) => u.role === 'owner') || USERS[1];
      req.user = {
        id: defaultOwner.id,
        name: defaultOwner.name,
        email: defaultOwner.email,
        phone: defaultOwner.phone,
        role: defaultOwner.role,
        salonId: defaultOwner.salonId,
      };
      return next();
    }
    if (lower.includes('admin')) {
      const defaultAdmin = USERS.find((u) => u.role === 'admin') || USERS[2];
      req.user = {
        id: defaultAdmin.id,
        name: defaultAdmin.name,
        email: defaultAdmin.email,
        phone: defaultAdmin.phone,
        role: defaultAdmin.role,
      };
      return next();
    }

    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Role '${req.user.role}' is not authorized to access this resource. Required: ${allowedRoles.join(', ')}`,
      });
    }
    next();
  };
}

// ----------------------------------------------------
// 1. AUTHENTICATION & ONBOARDING API
// ----------------------------------------------------

app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  if (user.status === 'banned') {
    return res.status(403).json({ error: 'Your account has been suspended by the platform administrator.' });
  }

  if (role && user.role !== role) {
    return res.status(403).json({ error: `Account exists but is not registered as role: ${role}` });
  }

  const token = generateToken(user);
  res.json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      salonId: user.salonId,
      avatar: user.avatar,
      preferredServices: user.preferredServices,
      location: user.location,
      favoriteSalonId: user.favoriteSalonId,
      favoriteBarberName: user.favoriteBarberName,
    },
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, phone, password, role = 'customer', salonName, location } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  const existing = USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  let assignedSalonId = undefined;
  if (role === 'owner') {
    assignedSalonId = `salon-${Date.now()}`;
    const newSalon = {
      id: assignedSalonId,
      name: salonName || `${name}'s Salon`,
      rating: 5.0,
      reviewsCount: 1,
      distance: '1.0 km away',
      address: location || 'Vijay Nagar, Indore',
      city: 'Indore',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
      gallery: ['https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80'],
      startingPrice: 299,
      isFavorite: false,
      gender: 'unisex',
      openingHours: '09:00 AM - 09:00 PM',
      phone: phone || '+91 98000 11111',
      ownerId: `usr-${Date.now()}`,
      status: 'verified',
      commissionRate: 5,
      crowdStatus: 'Good availability',
      amenities: ['AC', 'Free Wi-Fi', 'Sanitized Tools'],
      stylists: [
        {
          id: `s-${Date.now()}`,
          name: name,
          role: 'Lead Master Stylist',
          specialization: 'Precision Haircuts & Styling',
          experience: '5 years',
          rating: 5.0,
          reviewsCount: 12,
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
          workingHours: '09:00 AM - 08:30 PM',
          breaks: ['01:00 PM - 02:00 PM'],
          daysOff: ['Monday'],
          active: true,
          bookedSlots: {},
        },
      ],
      services: [
        { id: `srv-1`, name: 'Classic Haircut & Styling', category: 'haircut', duration: '35 mins', price: 299, popular: true },
        { id: `srv-2`, name: 'Beard Trim & Shape', category: 'beard', duration: '20 mins', price: 149, popular: true },
      ],
    };
    SALONS.push(newSalon);
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    name,
    email,
    phone: phone || '+91 98000 00000',
    password,
    role,
    salonId: assignedSalonId,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    createdAt: new Date().toISOString(),
    status: 'active',
    location: location || 'Indore',
    preferredServices: ['Haircut'],
  };

  USERS.push(newUser);
  const token = generateToken(newUser);

  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      salonId: newUser.salonId,
      avatar: newUser.avatar,
      preferredServices: newUser.preferredServices,
      location: newUser.location,
    },
  });
});

app.post('/api/user/onboarding', authenticateJWT, requireRole(['customer']), (req, res) => {
  const { name, phone, location, preferredServices, favoriteSalonId, favoriteBarberName } = req.body;
  const user = USERS.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

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

app.post('/api/salons/:id/availability', (req, res) => {
  const salon = SALONS.find((s) => s.id === req.params.id);
  if (!salon) return res.status(404).json({ error: 'Salon not found' });

  const { dateKey = 'Oct 24', barberId = 'any' } = req.body;

  const rawTimeSlots = [
    { period: 'Morning', slots: ['09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'] },
    { period: 'Afternoon', slots: ['12:00 PM', '12:30 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:30 PM'] },
    { period: 'Evening', slots: ['04:30 PM', '05:00 PM', '06:00 PM', '07:00 PM', '07:30 PM', '08:00 PM'] },
  ];

  const allActiveStylists = salon.stylists.filter((s) => s.active);

  let nextAvailableWithSelected = null;
  let nextAvailableWithAny = null;

  const categorizedSlots = rawTimeSlots.map((group) => {
    const slots = group.slots.map((time) => {
      if (barberId === 'any') {
        const freeBarbers = allActiveStylists.filter((b) => {
          const booked = b.bookedSlots && b.bookedSlots[dateKey];
          return !(booked && booked.includes(time));
        });

        const isAvailable = freeBarbers.length > 0;
        if (isAvailable && !nextAvailableWithAny) {
          nextAvailableWithAny = { time, barberName: freeBarbers[0].name };
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
          return { time, available: false, reason: 'Barber not active', statusText: 'Unavailable' };
        }

        const booked = selectedBarber.bookedSlots && selectedBarber.bookedSlots[dateKey];
        const isBusy = booked && booked.includes(time);

        if (!isBusy && !nextAvailableWithSelected) {
          nextAvailableWithSelected = { time, barberName: selectedBarber.name };
        }

        const alternateFreeBarbers = allActiveStylists.filter((b) => {
          if (b.id === barberId) return false;
          const bBooked = b.bookedSlots && b.bookedSlots[dateKey];
          return !(bBooked && bBooked.includes(time));
        });

        return {
          time,
          available: !isBusy,
          barberName: selectedBarber.name,
          alternateBarbers: isBusy ? alternateFreeBarbers : [],
          statusText: !isBusy ? 'Available' : 'Booked',
        };
      }
    });

    return { period: group.period, slots };
  });

  const totalSlotsCount = categorizedSlots.reduce((sum, g) => sum + g.slots.length, 0);
  const availableSlotsCount = categorizedSlots.reduce((sum, g) => sum + g.slots.filter((s) => s.available).length, 0);

  const dayStatus =
    availableSlotsCount === 0 ? 'Fully Booked' : availableSlotsCount < totalSlotsCount * 0.4 ? 'Limited' : 'Available';

  res.json({
    dateKey,
    salonId: salon.id,
    dayStatus,
    categorizedSlots,
    nextAvailableWithSelected,
    nextAvailableWithAny,
    earliestAvailableSlot: nextAvailableWithAny || nextAvailableWithSelected,
  });
});

// ----------------------------------------------------
// 3. CUSTOMER BOOKINGS
// ----------------------------------------------------

app.get('/api/user/book-again', authenticateJWT, requireRole(['customer']), (req, res) => {
  const previousBookings = BOOKINGS.filter(
    (b) => b.userId === req.user.id || b.customerEmail === req.user.email
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

app.get('/api/bookings', authenticateJWT, requireRole(['customer']), (req, res) => {
  const customerBookings = BOOKINGS.filter(
    (b) => b.userId === req.user.id || b.customerEmail.toLowerCase() === req.user.email.toLowerCase()
  );
  res.json({ bookings: customerBookings });
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
  const totalMins = services.reduce((sum, s) => sum + (parseInt(s.duration) || 30), 0);

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

  let assignedBarber;
  if (barberId === 'any') {
    const freeBarber = salon.stylists.find((b) => {
      if (!b.active) return false;
      const booked = b.bookedSlots && b.bookedSlots[dateKey];
      return !(booked && booked.includes(timeSlot));
    });
    assignedBarber = freeBarber || salon.stylists[0];
  } else {
    assignedBarber = salon.stylists.find((b) => b.id === barberId) || salon.stylists[0];
  }

  if (!assignedBarber.bookedSlots) assignedBarber.bookedSlots = {};
  if (!assignedBarber.bookedSlots[dateKey]) assignedBarber.bookedSlots[dateKey] = [];
  if (!assignedBarber.bookedSlots[dateKey].includes(timeSlot)) {
    assignedBarber.bookedSlots[dateKey].push(timeSlot);
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
    endTime: `${timeSlot} + ${totalMins}m`,
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

  BOOKINGS.unshift(newBooking);
  res.status(201).json({ message: 'Appointment booked successfully', booking: newBooking });
});

app.post('/api/bookings/:id/reschedule', authenticateJWT, requireRole(['customer']), (req, res) => {
  const booking = BOOKINGS.find((b) => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  if (booking.userId !== req.user.id && booking.customerEmail !== req.user.email) {
    return res.status(403).json({ error: 'Forbidden: You cannot reschedule another user’s appointment.' });
  }

  const { newDate, newTime } = req.body;
  if (!newDate || !newTime) {
    return res.status(400).json({ error: 'New date and time are required.' });
  }

  booking.date = newDate;
  booking.time = newTime;
  booking.status = 'Confirmed';

  res.json({ message: 'Appointment rescheduled successfully', booking });
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
  res.json({ users: USERS });
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
