// src/pages/publicService.helper.js

/**
 * Normalizes a date to 00:00:00 for accurate day comparison
 */
export const getTodayMidnight = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

/**
 * Upper constraint limit for booking window (Today + 1 Month)
 */
export const getMaxBookingDate = () => {
    const maxDate = getTodayMidnight();
    maxDate.setMonth(maxDate.getMonth() + 1);
    return maxDate;
};

/**
 * Format currency with ISO code fallback
 */
export const formatCurrency = (amount, currency = "INR") => {
    if (amount === 0 || amount === "0") return "Free";
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: currency,
        maximumFractionDigits: 0,
    }).format(amount);
};

/**
 * Convert minutes from midnight to a formatted 12-hour string (e.g. 540 -> "09:00 AM")
 */
export const convertMinutesTo12HrTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${String(formattedHours).padStart(2, "0")}:${formattedMinutes} ${period}`;
};

/**
 * Extracts day name from JavaScript Date object
 */
export const getDayNameFromDate = (date) => {
    return date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
};

/**
 * Checks if a calendar date is disabled based on 1-month window or organization schedule
 */
export const isDateDisabled = (date, availabilityData) => {
    const today = getTodayMidnight();
    const maxDate = getMaxBookingDate();

    if (date < today || date > maxDate) {
        return true;
    }

    if (!availabilityData || !availabilityData.days) {
        return true;
    }

    const dayName = getDayNameFromDate(date);
    const daySchedule = availabilityData.days[dayName];

    return !daySchedule || !daySchedule.enabled || !daySchedule.slots?.length;
};

/**
 * Dynamically breaks down start/end time ranges into discrete bookable slots
 * based on the service duration (e.g. 30 mins)
 */
export const generateBookableSlotsForDate = (date, availabilityData, durationInMinutes = 30) => {
    if (!date || !availabilityData || !availabilityData.days) return [];

    const dayName = getDayNameFromDate(date);
    const daySchedule = availabilityData.days[dayName];

    if (!daySchedule || !daySchedule.enabled || !daySchedule.slots?.length) {
        return [];
    }

    const slots = [];
    const step = durationInMinutes > 0 ? durationInMinutes : 30;

    daySchedule.slots.forEach((range) => {
        let current = range.startTime;
        while (current + step <= range.endTime) {
            slots.push(convertMinutesTo12HrTime(current));
            current += step;
        }
    });

    return slots;
};