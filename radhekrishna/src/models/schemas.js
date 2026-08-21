/**
 * MongoDB / Mongoose Database Schemas & Models
 * Designed for MongoDB Atlas Free Tier & Scalable Production
 * AAORA Salon Management & Appointment Booking Platform
 */

export const UserSchemaDefinition = {
  name: { type: 'String', required: true, trim: true },
  email: { type: 'String', required: true, unique: true, lowercase: true, trim: true },
  password: { type: 'String', required: true }, // bcrypt hashed
  phone: { type: 'String', required: true },
  role: { 
    type: 'String', 
    enum: ['customer', 'owner', 'staff', 'admin'], 
    default: 'customer' 
  },
  avatar: { type: 'String', default: '' },
  salonId: { type: 'String', ref: 'Salon' }, // for owner and staff
  employeeId: { type: 'String', ref: 'Employee' }, // for staff members
  status: { type: 'String', enum: ['active', 'suspended', 'banned'], default: 'active' },
  preferredServices: [{ type: 'String' }],
  location: { type: 'String', default: 'Indore' },
  favoriteSalonId: { type: 'String', ref: 'Salon' },
  favoriteBarberName: { type: 'String' },
  createdAt: { type: 'Date', default: 'Date.now' },
  updatedAt: { type: 'Date', default: 'Date.now' }
};

export const SalonSchemaDefinition = {
  name: { type: 'String', required: true, trim: true },
  ownerId: { type: 'String', required: true, ref: 'User' },
  description: { type: 'String', default: '' },
  address: { type: 'String', required: true },
  city: { type: 'String', required: true },
  state: { type: 'String', default: 'Madhya Pradesh' },
  pincode: { type: 'String', default: '452010' },
  lat: { type: 'Number', required: true },
  lng: { type: 'Number', required: true },
  phone: { type: 'String', required: true },
  email: { type: 'String' },
  image: { type: 'String', required: true },
  gallery: [{ type: 'String' }],
  gender: { type: 'String', enum: ['men', 'women', 'unisex'], default: 'unisex' },
  openingHours: { type: 'String', default: '09:00 AM - 09:00 PM' },
  openingTimeMinutes: { type: 'Number', default: 540 }, // 09:00 AM (9*60)
  closingTimeMinutes: { type: 'Number', default: 1260 }, // 09:00 PM (21*60)
  startingPrice: { type: 'Number', default: 299 },
  rating: { type: 'Number', default: 4.8 },
  reviewsCount: { type: 'Number', default: 0 },
  status: { 
    type: 'String', 
    enum: ['pending', 'verified', 'rejected', 'suspended'], 
    default: 'verified' 
  },
  commissionRate: { type: 'Number', default: 5 }, // 5% platform fee
  crowdStatus: { type: 'String', default: 'Good availability' },
  amenities: [{ type: 'String' }],
  holidays: [{ type: 'String' }], // Array of 'YYYY-MM-DD' dates
  autoSlotDurationMinutes: { type: 'Number', default: 30 },
  createdAt: { type: 'Date', default: 'Date.now' }
};

export const EmployeeSchemaDefinition = {
  salonId: { type: 'String', required: true, ref: 'Salon' },
  userId: { type: 'String', ref: 'User' }, // Optional linked user account for staff login
  name: { type: 'String', required: true, trim: true },
  phone: { type: 'String' },
  email: { type: 'String' },
  role: { type: 'String', default: 'Senior Hair Stylist' },
  specialization: { type: 'String', default: 'Precision Haircuts & Styling' },
  experience: { type: 'String', default: '5 years' },
  avatar: { type: 'String', default: '' },
  rating: { type: 'Number', default: 5.0 },
  reviewsCount: { type: 'Number', default: 0 },
  workingHours: { type: 'String', default: '09:30 AM - 08:30 PM' },
  startMinutes: { type: 'Number', default: 570 }, // 09:30 AM
  endMinutes: { type: 'Number', default: 1230 }, // 08:30 PM
  breaks: [
    {
      start: { type: 'String', default: '01:00 PM' },
      end: { type: 'String', default: '02:00 PM' },
      startMinutes: { type: 'Number', default: 780 },
      endMinutes: { type: 'Number', default: 840 },
      label: { type: 'String', default: 'Lunch Break' }
    }
  ],
  daysOff: [{ type: 'String' }], // e.g. ['Monday', 'Wednesday']
  assignedServices: [{ type: 'String' }], // Service IDs
  active: { type: 'Boolean', default: true },
  createdAt: { type: 'Date', default: 'Date.now' }
};

export const ServiceSchemaDefinition = {
  salonId: { type: 'String', required: true, ref: 'Salon' },
  name: { type: 'String', required: true, trim: true },
  description: { type: 'String', default: '' },
  category: { 
    type: 'String', 
    enum: ['haircut', 'beard', 'facial', 'hair-color', 'spa', 'massage', 'waxing', 'bridal', 'other'], 
    default: 'haircut' 
  },
  price: { type: 'Number', required: true },
  originalPrice: { type: 'Number' },
  duration: { type: 'String', default: '30 mins' },
  durationMinutes: { type: 'Number', required: true, default: 30 },
  image: { type: 'String', default: '' },
  popular: { type: 'Boolean', default: false },
  active: { type: 'Boolean', default: true },
  assignedEmployeeIds: [{ type: 'String' }],
  createdAt: { type: 'Date', default: 'Date.now' }
};

export const SlotSchemaDefinition = {
  salonId: { type: 'String', required: true, ref: 'Salon' },
  employeeId: { type: 'String', required: true, ref: 'Employee' },
  date: { type: 'String', required: true }, // Format: 'YYYY-MM-DD' or 'Oct 24'
  startTime: { type: 'String', required: true }, // e.g. '10:20 AM'
  endTime: { type: 'String', required: true }, // e.g. '10:35 AM'
  startMinutes: { type: 'Number', required: true },
  endMinutes: { type: 'Number', required: true },
  durationMinutes: { type: 'Number', required: true }, // e.g. 15, 20, 30, 45
  isCustom: { type: 'Boolean', default: false },
  status: { 
    type: 'String', 
    enum: ['AVAILABLE', 'BOOKED', 'BLOCKED', 'CANCELLED', 'EXPIRED'], 
    default: 'AVAILABLE' 
  },
  bookingId: { type: 'String', ref: 'Booking' },
  blockReason: { type: 'String' },
  createdAt: { type: 'Date', default: 'Date.now' }
};

export const BookingSchemaDefinition = {
  bookingId: { type: 'String', required: true, unique: true },
  userId: { type: 'String', required: true, ref: 'User' },
  customerName: { type: 'String', required: true },
  customerPhone: { type: 'String', required: true },
  customerEmail: { type: 'String', required: true },
  salonId: { type: 'String', required: true, ref: 'Salon' },
  salonName: { type: 'String', required: true },
  salonAddress: { type: 'String', required: true },
  salonPhone: { type: 'String' },
  salonImage: { type: 'String' },
  employeeId: { type: 'String', required: true, ref: 'Employee' },
  stylistName: { type: 'String', required: true },
  stylistRole: { type: 'String' },
  stylistAvatar: { type: 'String' },
  services: [
    {
      id: { type: 'String' },
      name: { type: 'String', required: true },
      price: { type: 'Number', required: true },
      duration: { type: 'String', default: '30 mins' },
      durationMinutes: { type: 'Number', default: 30 }
    }
  ],
  totalDurationMinutes: { type: 'Number', required: true },
  totalDuration: { type: 'String', default: '30 mins' },
  date: { type: 'String', required: true }, // 'Today, Oct 24' or 'Oct 24, 2026'
  rawDate: { type: 'String', required: true }, // 'YYYY-MM-DD'
  startTime: { type: 'String', required: true }, // '10:20 AM'
  endTime: { type: 'String', required: true }, // '10:55 AM'
  startMinutes: { type: 'Number' },
  endMinutes: { type: 'Number' },
  slotId: { type: 'String', ref: 'Slot' },
  subtotal: { type: 'Number', required: true },
  discount: { type: 'Number', default: 0 },
  tax: { type: 'Number', default: 0 },
  totalAmount: { type: 'Number', required: true },
  paymentMethod: { 
    type: 'String', 
    enum: ['Razorpay Online', 'Advance 25% (UPI)', 'Pay at Salon', 'Card', 'UPI'], 
    default: 'Razorpay Online' 
  },
  paymentStatus: { 
    type: 'String', 
    enum: ['Paid Full', 'Advance Paid', 'Pending at Venue', 'Refunded', 'Failed'], 
    default: 'Paid Full' 
  },
  advancePaid: { type: 'Number', default: 0 },
  remainingAmount: { type: 'Number', default: 0 },
  transactionId: { type: 'String' },
  status: { 
    type: 'String', 
    enum: ['PENDING', 'CONFIRMED', 'CUSTOMER_ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED', 'NO_SHOW'], 
    default: 'CONFIRMED' 
  },
  qrCodeUrl: { type: 'String' },
  arrivalNote: { type: 'String' },
  isReviewed: { type: 'Boolean', default: false },
  userRating: { type: 'Number' },
  userReview: { type: 'String' },
  cancellationRefund: {
    advancePaid: { type: 'Number' },
    refund: { type: 'Number' },
    fee: { type: 'Number' },
    cancelledAt: { type: 'Date' }
  },
  createdAt: { type: 'Date', default: 'Date.now' },
  updatedAt: { type: 'Date', default: 'Date.now' }
};

export const PaymentSchemaDefinition = {
  transactionId: { type: 'String', required: true, unique: true },
  bookingId: { type: 'String', required: true, ref: 'Booking' },
  customerId: { type: 'String', required: true, ref: 'User' },
  salonId: { type: 'String', required: true, ref: 'Salon' },
  amount: { type: 'Number', required: true },
  currency: { type: 'String', default: 'INR' },
  provider: { type: 'String', default: 'Razorpay Sandbox' },
  orderId: { type: 'String' },
  paymentMethod: { type: 'String', default: 'UPI' },
  status: { 
    type: 'String', 
    enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'], 
    default: 'PAID' 
  },
  refundDetails: {
    amount: { type: 'Number' },
    reason: { type: 'String' },
    refundId: { type: 'String' },
    refundedAt: { type: 'Date' }
  },
  createdAt: { type: 'Date', default: 'Date.now' }
};

export const ReviewSchemaDefinition = {
  salonId: { type: 'String', required: true, ref: 'Salon' },
  salonName: { type: 'String', required: true },
  bookingId: { type: 'String', required: true, ref: 'Booking', unique: true },
  userId: { type: 'String', required: true, ref: 'User' },
  userName: { type: 'String', required: true },
  userAvatar: { type: 'String' },
  barberName: { type: 'String' },
  barberRating: { type: 'Number', min: 1, max: 5, default: 5 },
  salonRating: { type: 'Number', min: 1, max: 5, required: true },
  comment: { type: 'String', required: true },
  date: { type: 'String', required: true },
  status: { type: 'String', enum: ['approved', 'flagged', 'pending'], default: 'approved' },
  createdAt: { type: 'Date', default: 'Date.now' }
};

export const NotificationSchemaDefinition = {
  userId: { type: 'String', required: true, ref: 'User' },
  type: { 
    type: 'String', 
    enum: ['booking_created', 'booking_confirmed', 'booking_cancelled', 'booking_rescheduled', 'payment_success', 'reminder', 'appointment_completed', 'owner_alert'], 
    default: 'booking_confirmed' 
  },
  title: { type: 'String', required: true },
  message: { type: 'String', required: true },
  bookingId: { type: 'String', ref: 'Booking' },
  read: { type: 'Boolean', default: false },
  createdAt: { type: 'Date', default: 'Date.now' }
};
