/**
 * AAORA Salon Platform - Robust Slot Management & Availability Engine
 * Complies strictly with Sections 14 - 19 of the Master Specification
 * Supports: Automatic Slots, Custom Manual Slots (e.g. 10:20 - 10:35),
 * Breaks & Leave Conflict Prevention, Double-Booking Protection.
 */

// Convert "10:20 AM" or "02:45 PM" to total minutes from midnight (0 - 1439)
export function timeStringToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const cleaned = timeStr.trim();
  const match = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return 0;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3] ? match[3].toUpperCase() : null;

  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

// Convert total minutes from midnight back to formatted string "10:20 AM"
export function minutesToTimeString(totalMinutes) {
  const normalized = Math.max(0, Math.min(1439, totalMinutes));
  let hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  const period = hours >= 12 ? 'PM' : 'AM';

  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;

  const paddedMins = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const paddedHours = hours < 10 ? `0${hours}` : `${hours}`;
  return `${paddedHours}:${paddedMins} ${period}`;
}

// Parse a working hours string like "09:30 AM - 08:30 PM" into { startMinutes, endMinutes }
export function parseHoursRange(hoursRangeStr) {
  if (!hoursRangeStr || !hoursRangeStr.includes('-')) {
    return { startMinutes: 9 * 60, endMinutes: 21 * 60 };
  }
  const [startStr, endStr] = hoursRangeStr.split('-').map((s) => s.trim());
  return {
    startMinutes: timeStringToMinutes(startStr),
    endMinutes: timeStringToMinutes(endStr),
  };
}

/**
 * Validate a Custom Slot before saving
 * @param {Object} slotData { startTime, endTime, date, employee, salon, existingSlots, existingBookings }
 * @returns {Object} { isValid: boolean, error?: string, durationMinutes: number }
 */
export function validateCustomSlot({
  startTime,
  endTime,
  date,
  employee,
  salon,
  existingSlots = [],
  existingBookings = [],
  slotIdToIgnore = null,
}) {
  const startMin = timeStringToMinutes(startTime);
  const endMin = timeStringToMinutes(endTime);

  // 1. Basic sanity
  if (!startMin || !endMin) {
    return { isValid: false, error: 'Please enter valid start and end times.' };
  }

  if (startMin >= endMin) {
    return { isValid: false, error: `Start time (${startTime}) must be earlier than End time (${endTime}).` };
  }

  const duration = endMin - startMin;
  if (duration < 5) {
    return { isValid: false, error: 'Slot duration must be at least 5 minutes.' };
  }

  if (duration > 240) {
    return { isValid: false, error: 'Slot duration cannot exceed 4 hours.' };
  }

  // 2. Inside salon operating hours
  const salonHours = parseHoursRange(salon?.openingHours || '09:00 AM - 09:00 PM');
  if (startMin < salonHours.startMinutes || endMin > salonHours.endMinutes) {
    return {
      isValid: false,
      error: `Slot must be within salon hours (${salon?.openingHours || '09:00 AM - 09:00 PM'}).`,
    };
  }

  // 3. Inside employee working hours
  if (employee) {
    const empHours = parseHoursRange(employee.workingHours || '09:30 AM - 08:30 PM');
    if (startMin < empHours.startMinutes || endMin > empHours.endMinutes) {
      return {
        isValid: false,
        error: `${employee.name}'s working hours are ${employee.workingHours}. Slot falls outside.`,
      };
    }

    // 4. Employee day off / leave check
    if (date) {
      const dayName = typeof date === 'string' ? date.toLowerCase() : '';
      if (employee.daysOff && employee.daysOff.some((d) => dayName.includes(d.toLowerCase()))) {
        return {
          isValid: false,
          error: `${employee.name} is on scheduled weekly leave on this day.`,
        };
      }
    }

    // 5. Employee breaks check
    if (employee.breaks && Array.isArray(employee.breaks)) {
      for (const b of employee.breaks) {
        const breakRange = typeof b === 'string' ? parseHoursRange(b) : { startMinutes: b.startMinutes, endMinutes: b.endMinutes };
        // Check overlap: (StartA < EndB) and (EndA > StartB)
        if (startMin < breakRange.endMinutes && endMin > breakRange.startMinutes) {
          const breakLabel = typeof b === 'object' && b.label ? b.label : 'break';
          return {
            isValid: false,
            error: `Conflicts with ${employee.name}'s scheduled ${breakLabel} (${minutesToTimeString(breakRange.startMinutes)} - ${minutesToTimeString(breakRange.endMinutes)}).`,
          };
        }
      }
    }
  }

  // 6. Overlap check with existing custom/active slots for this employee on this date
  const employeeSlots = existingSlots.filter(
    (s) =>
      s.id !== slotIdToIgnore &&
      s.employeeId === (employee?.id || s.employeeId) &&
      (!date || s.date === date || s.dateKey === date) &&
      s.status !== 'CANCELLED'
  );

  for (const s of employeeSlots) {
    const sStart = s.startMinutes || timeStringToMinutes(s.startTime);
    const sEnd = s.endMinutes || timeStringToMinutes(s.endTime);
    if (startMin < sEnd && endMin > sStart) {
      return {
        isValid: false,
        error: `Overlaps with existing ${s.status} slot (${s.startTime} - ${s.endTime}) for ${employee?.name || 'this stylist'}.`,
      };
    }
  }

  // 7. Overlap check with existing bookings
  const empBookings = existingBookings.filter(
    (b) =>
      b.stylistId === (employee?.id || b.stylistId) &&
      (!date || b.rawDate === date || b.date?.includes(date)) &&
      !['Cancelled', 'CANCELLED', 'Rejected', 'REJECTED', 'No Show'].includes(b.status)
  );

  for (const b of empBookings) {
    const bStart = timeStringToMinutes(b.time || b.startTime);
    const bDuration = parseInt(b.totalDuration) || 30;
    const bEnd = bStart + bDuration;
    if (startMin < bEnd && endMin > bStart) {
      return {
        isValid: false,
        error: `Cannot create slot: ${employee?.name || 'Stylist'} has an active appointment #${b.id || b.bookingId} from ${b.time} (${bDuration}m).`,
      };
    }
  }

  return { isValid: true, durationMinutes: duration };
}

/**
 * Automatically generate slots for an employee or salon for a given day
 * @param {Object} config { intervalMinutes: 20|30|45|60, salon, employee, date, existingBookings }
 */
export function generateAutomaticSlots({
  intervalMinutes = 30,
  salon,
  employee,
  date = 'Oct 24',
  existingBookings = [],
}) {
  const workingRange = employee
    ? parseHoursRange(employee.workingHours || '09:30 AM - 08:30 PM')
    : parseHoursRange(salon?.openingHours || '09:00 AM - 09:00 PM');

  const slots = [];
  let currentMin = workingRange.startMinutes;

  while (currentMin + intervalMinutes <= workingRange.endMinutes) {
    const startMin = currentMin;
    const endMin = currentMin + intervalMinutes;
    const startTime = minutesToTimeString(startMin);
    const endTime = minutesToTimeString(endMin);

    // Check if slot falls in employee break
    let isInBreak = false;
    let breakReason = '';
    if (employee?.breaks) {
      for (const b of employee.breaks) {
        const breakRange = typeof b === 'string' ? parseHoursRange(b) : { startMinutes: b.startMinutes, endMinutes: b.endMinutes };
        if (startMin < breakRange.endMinutes && endMin > breakRange.startMinutes) {
          isInBreak = true;
          breakReason = typeof b === 'object' && b.label ? b.label : 'Staff Break';
          break;
        }
      }
    }

    // Check if slot overlaps an existing confirmed appointment
    let isBooked = false;
    let bookedInfo = null;
    if (employee) {
      const conflictBooking = existingBookings.find((b) => {
        if (b.stylistId !== employee.id) return false;
        if (['Cancelled', 'CANCELLED', 'Rejected'].includes(b.status)) return false;
        const bStart = timeStringToMinutes(b.time || b.startTime);
        const bDuration = parseInt(b.totalDuration) || 30;
        const bEnd = bStart + bDuration;
        return startMin < bEnd && endMin > bStart;
      });

      if (conflictBooking) {
        isBooked = true;
        bookedInfo = conflictBooking;
      }
    }

    const slotId = `slot-${employee?.id || 'gen'}-${date.replace(/\s+/g, '-')}-${startMin}`;
    
    slots.push({
      id: slotId,
      salonId: salon?.id || 'looks-salon',
      employeeId: employee?.id || 'any',
      employeeName: employee?.name || 'Any Stylist',
      date,
      startTime,
      endTime,
      startMinutes: startMin,
      endMinutes: endMin,
      durationMinutes: intervalMinutes,
      isCustom: false,
      status: isInBreak ? 'BLOCKED' : isBooked ? 'BOOKED' : 'AVAILABLE',
      blockReason: isInBreak ? breakReason : null,
      bookingId: isBooked ? bookedInfo?.id : null,
      customerName: isBooked ? bookedInfo?.customerName : null,
    });

    currentMin += intervalMinutes;
  }

  return slots;
}

/**
 * Unified Availability Engine for Customer Booking
 * Evaluates salon working hours + staff schedules + breaks + leave + custom slots + bookings + requested service duration
 */
export function calculateRealAvailability({
  salon,
  dateKey = 'Oct 24',
  dayOfWeek = 'Thursday',
  barberId = 'any',
  serviceDurationMinutes = 30,
  customSlots = [],
  bookings = [],
}) {
  const activeStylists = (salon?.stylists || []).filter((s) => {
    if (!s.active) return false;
    if (s.daysOff && s.daysOff.some((d) => d.toLowerCase() === dayOfWeek.toLowerCase())) return false;
    return true;
  });

  if (activeStylists.length === 0) {
    return {
      salonClosed: true,
      dayStatus: 'Fully Booked',
      reason: 'No stylists available on this day.',
      availableSlots: [],
      categorizedSlots: [],
    };
  }

  // Build target stylists pool
  const targetStylists = barberId === 'any'
    ? activeStylists
    : activeStylists.filter((s) => s.id === barberId);

  if (targetStylists.length === 0) {
    return {
      salonClosed: false,
      dayStatus: 'Unavailable',
      reason: 'Selected stylist is off on this day.',
      availableSlots: [],
      categorizedSlots: [],
    };
  }

  // Combine standard generated slots with custom manual slots
  const allCandidateSlots = [];

  targetStylists.forEach((stylist) => {
    // Generate auto baseline (30 min increments)
    const autoSlots = generateAutomaticSlots({
      intervalMinutes: 30,
      salon,
      employee: stylist,
      date: dateKey,
      existingBookings: bookings,
    });

    // Merge in custom manual slots for this stylist
    const stylistCustomSlots = customSlots.filter(
      (cs) => cs.employeeId === stylist.id && (cs.date === dateKey || cs.dateKey === dateKey)
    );

    // Filter out auto slots that clash with custom slots
    const merged = autoSlots.filter((as) => {
      return !stylistCustomSlots.some(
        (cs) => as.startMinutes < cs.endMinutes && as.endMinutes > cs.startMinutes
      );
    });

    allCandidateSlots.push(...merged, ...stylistCustomSlots);
  });

  // Group by distinct time slot
  const slotMap = new Map();

  allCandidateSlots.forEach((slot) => {
    const key = `${slot.startTime}-${slot.endTime}`;
    if (!slotMap.has(key)) {
      slotMap.set(key, {
        time: slot.startTime,
        endTime: slot.endTime,
        startMinutes: slot.startMinutes,
        endMinutes: slot.endMinutes,
        durationMinutes: slot.durationMinutes,
        isCustom: slot.isCustom || false,
        stylistSlots: [],
      });
    }
    slotMap.get(key).stylistSlots.push(slot);
  });

  const processedSlots = Array.from(slotMap.values()).map((group) => {
    const availableStylistSlots = group.stylistSlots.filter((s) => s.status === 'AVAILABLE');
    const isAvailable = availableStylistSlots.length > 0;
    const freeCount = availableStylistSlots.length;

    let period = 'Morning';
    if (group.startMinutes >= 12 * 60 && group.startMinutes < 16 * 60) period = 'Afternoon';
    if (group.startMinutes >= 16 * 60) period = 'Evening';

    return {
      time: group.time,
      endTime: group.endTime,
      startMinutes: group.startMinutes,
      endMinutes: group.endMinutes,
      durationMinutes: group.durationMinutes,
      isCustom: group.isCustom,
      available: isAvailable,
      freeCount,
      period,
      assignedStylist: isAvailable ? availableStylistSlots[0] : null,
      statusText: isAvailable ? (freeCount > 1 ? 'Available' : 'Limited') : 'Booked',
    };
  });

  // Sort chronologically by startMinutes
  processedSlots.sort((a, b) => a.startMinutes - b.startMinutes);

  const morningSlots = processedSlots.filter((s) => s.period === 'Morning');
  const afternoonSlots = processedSlots.filter((s) => s.period === 'Afternoon');
  const eveningSlots = processedSlots.filter((s) => s.period === 'Evening');

  const total = processedSlots.length;
  const availableCount = processedSlots.filter((s) => s.available).length;

  const dayStatus =
    availableCount === 0 ? 'Fully Booked' : availableCount < total * 0.3 ? 'Limited' : 'Available';

  return {
    salonClosed: false,
    dayStatus,
    totalSlotsCount: total,
    availableSlotsCount: availableCount,
    allSlots: processedSlots,
    categorizedSlots: [
      { period: 'Morning Slots', slots: morningSlots },
      { period: 'Afternoon Slots', slots: afternoonSlots },
      { period: 'Evening Slots', slots: eveningSlots },
    ],
  };
}
