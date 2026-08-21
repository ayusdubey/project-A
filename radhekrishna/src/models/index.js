// ==========================================================
// Mongoose Models for MongoDB Atlas Free Tier
// Salon Discovery, Booking & Slot Management Platform
// ==========================================================

import mongoose from 'mongoose';

// ----------------------------------------------------
// 1. USER SCHEMA
// ----------------------------------------------------
export const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, trim: true },
    role: {
      type: String,
      enum: ['customer', 'owner', 'staff', 'admin'],
      default: 'customer',
      required: true,
    },
    salonId: { type: String, ref: 'Salon' },
    employeeId: { type: String },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    },
    status: { type: String, enum: ['active', 'banned'], default: 'active' },
    location: { type: String, default: 'Indore' },
    preferredServices: [{ type: String }],
    favoriteSalonId: { type: String },
    favoriteBarberName: { type: String },
  },
  { timestamps: true }
);

// ----------------------------------------------------
// 2. SALON SCHEMA
// ----------------------------------------------------
export const SalonSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    ownerId: { type: String, required: true, ref: 'User' },
    description: { type: String },
    rating: { type: Number, default: 4.8 },
    reviewsCount: { type: Number, default: 0 },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, default: 'MP' },
    pincode: { type: String },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    image: { type: String, required: true },
    gallery: [{ type: String }],
    startingPrice: { type: Number, default: 199 },
    gender: { type: String, enum: ['men', 'women', 'unisex'], default: 'unisex' },
    openingHours: { type: String, default: '09:00 AM - 09:30 PM' },
    openingTime: { type: String, default: '09:00 AM' },
    closingTime: { type: String, default: '09:30 PM' },
    slotIntervalMins: { type: Number, default: 30 },
    holidays: [{ type: String }], // e.g. ['2026-10-25', 'Monday']
    phone: { type: String },
    status: { type: String, enum: ['pending', 'verified', 'rejected', 'suspended'], default: 'verified' },
    commissionRate: { type: Number, default: 5 },
    crowdStatus: { type: String, default: 'Good availability' },
    amenities: [{ type: String }],
  },
  { timestamps: true }
);

// ----------------------------------------------------
// 3. EMPLOYEE / STYLIST SCHEMA
// ----------------------------------------------------
export const EmployeeSchema = new mongoose.Schema(
  {
    salonId: { type: String, required: true, ref: 'Salon' },
    userId: { type: String, ref: 'User' }, // Associated staff user account
    name: { type: String, required: true, trim: true },
    role: { type: String, default: 'Master Stylist' },
    specialization: { type: String, default: 'Precision Haircuts & Beard Grooming' },
    phone: { type: String },
    email: { type: String },
    avatar: { type: String },
    experience: { type: String, default: '4+ years' },
    rating: { type: Number, default: 4.9 },
    reviewsCount: { type: Number, default: 0 },
    workingHoursStart: { type: String, default: '09:00 AM' },
    workingHoursEnd: { type: String, default: '08:30 PM' },
    breaks: [{ start: String, end: String, label: String }], // e.g. [{ start: '01:00 PM', end: '02:00 PM', label: 'Lunch Break' }]
    daysOff: [{ type: String }], // e.g. ['Monday']
    leaveDates: [{ type: String }], // e.g. ['2026-10-28']
    assignedServices: [{ type: String }], // service IDs
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ----------------------------------------------------
// 4. SERVICE SCHEMA
// ----------------------------------------------------
export const ServiceSchema = new mongoose.Schema(
  {
    salonId: { type: String, required: true, ref: 'Salon' },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    duration: { type: String, default: '30 mins' },
    durationMinutes: { type: Number, default: 30 },
    category: {
      type: String,
      enum: ['haircut', 'beard', 'facial', 'hair-color', 'waxing', 'spa', 'more'],
      default: 'haircut',
    },
    image: { type: String },
    popular: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    assignedEmployees: [{ type: String }], // Employee IDs
  },
  { timestamps: true }
);

// ----------------------------------------------------
// 5. SLOT SCHEMA (CORE BUSINESS OBJECT)
// ----------------------------------------------------
export const SlotSchema = new mongoose.Schema(
  {
    salonId: { type: String, required: true, ref: 'Salon' },
    employeeId: { type: String, required: true, ref: 'Employee' },
    employeeName: { type: String },
    date: { type: String, required: true }, // 'YYYY-MM-DD' or 'Oct 24'
    startTime: { type: String, required: true }, // e.g. '10:20 AM'
    endTime: { type: String, required: true }, // e.g. '10:35 AM'
    durationMinutes: { type: Number, required: true },
    slotType: { type: String, enum: ['automatic', 'custom'], default: 'automatic' },
    status: {
      type: String,
      enum: ['AVAILABLE', 'BOOKED', 'BLOCKED', 'CANCELLED', 'EXPIRED'],
      default: 'AVAILABLE',
      required: true,
    },
    blockReason: { type: String },
    assignedServiceId: { type: String },
    bookingId: { type: String, ref: 'Booking' },
  },
  { timestamps: true }
);

// ----------------------------------------------------
// 6. BOOKING SCHEMA
// ----------------------------------------------------
export const BookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true },
    customerId: { type: String, required: true, ref: 'User' },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String },
    salonId: { type: String, required: true, ref: 'Salon' },
    salonName: { type: String, required: true },
    salonAddress: { type: String },
    salonImage: { type: String },
    employeeId: { type: String, required: true, ref: 'Employee' },
    stylist: { type: String, required: true },
    services: [
      {
        id: String,
        name: String,
        price: Number,
        duration: String,
      },
    ],
    serviceName: { type: String, required: true },
    totalDuration: { type: String, default: '30 mins' },
    date: { type: String, required: true }, // e.g. 'Oct 24, 2026'
    rawDate: { type: String, required: true }, // '2026-10-24'
    time: { type: String, required: true }, // '11:30 AM'
    endTime: { type: String },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    advancePaid: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: 0 },
    paymentMethod: { type: String, default: 'Pay at Salon' },
    paymentStatus: {
      type: String,
      enum: ['Pending at Venue', 'Paid Full', 'Advance Paid', 'Refunded', 'Failed'],
      default: 'Pending at Venue',
    },
    transactionId: { type: String },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Customer Arrived', 'In Progress', 'Completed', 'Cancelled', 'No Show', 'Rejected'],
      default: 'Confirmed',
      required: true,
    },
    qrCodeUrl: { type: String },
    isReviewed: { type: Boolean, default: false },
    userRating: { type: Number },
    userReview: { type: String },
  },
  { timestamps: true }
);

// ----------------------------------------------------
// 7. PAYMENT SCHEMA
// ----------------------------------------------------
export const PaymentSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, ref: 'Booking' },
    customerId: { type: String, required: true, ref: 'User' },
    salonId: { type: String, required: true, ref: 'Salon' },
    amount: { type: Number, required: true },
    provider: { type: String, default: 'Razorpay Sandbox' },
    orderId: { type: String },
    transactionId: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    status: { type: String, enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'], default: 'PAID' },
    refundDetails: {
      amount: Number,
      fee: Number,
      refundedAt: Date,
    },
  },
  { timestamps: true }
);

// ----------------------------------------------------
// 8. REVIEW SCHEMA
// ----------------------------------------------------
export const ReviewSchema = new mongoose.Schema(
  {
    salonId: { type: String, required: true, ref: 'Salon' },
    salonName: { type: String },
    bookingId: { type: String, required: true, ref: 'Booking' },
    userId: { type: String, required: true, ref: 'User' },
    userName: { type: String, required: true },
    userAvatar: { type: String },
    barberName: { type: String },
    salonRating: { type: Number, min: 1, max: 5, required: true },
    barberRating: { type: Number, min: 1, max: 5, default: 5 },
    comment: { type: String, trim: true },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] },
    status: { type: String, enum: ['approved', 'flagged'], default: 'approved' },
  },
  { timestamps: true }
);

// ----------------------------------------------------
// 9. NOTIFICATION SCHEMA
// ----------------------------------------------------
export const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, ref: 'User' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['booking_created', 'booking_confirmed', 'booking_cancelled', 'booking_rescheduled', 'payment_success', 'reminder', 'completed', 'general'],
      default: 'general',
    },
    bookingId: { type: String },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);
