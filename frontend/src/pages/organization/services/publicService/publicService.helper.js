// src/pages/publicService.helper.js

const WEEKDAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

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
 * Gets a clean date string YYYY-MM-DD for a specific Date in a given timezone
 */
export const getDateKeyInTimezone = (date, timezone) => {
    const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    });
    return formatter.format(date); // outputs "YYYY-MM-DD"
};

// src/pages/publicService.helper.js

/**
 * Normalizes legacy or non-standard IANA timezone strings
 * e.g., "Asia/Calcutta" -> "Asia/Kolkata"
 */
export const normalizeTimezone = (tz) => {
    if (!tz) return "UTC";
    if (tz === "Asia/Calcutta") return "Asia/Kolkata";
    return tz;
};

/**
 * Auto-detects the client browser's timezone and normalizes aliases
 */
export const getUserBrowserTimezone = () => {
    try {
        const resolved = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return normalizeTimezone(resolved);
    } catch {
        return "UTC";
    }
};

/**
 * Upper constraint limit for booking window (Today + 1 Month)
 */
export const getMaxBookingDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 1);
    return maxDate;
};

/**
 * Converts a specific service date (YYYY-MM-DD) and minute offset (e.g. 540) 
 * in the service's IANA timezone into a concrete UTC Date object.
 */
export const createInstantFromServiceSlot = (dateString, totalMinutes, timezone = "UTC") => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const pad = (n) => String(n).padStart(2, "0");

    // Construct local ISO-like string
    const localIsoString = `${dateString}T${pad(hours)}:${pad(minutes)}:00`;

    // Calculate offset for the target timezone at that local time
    const tempDate = new Date(`${localIsoString}Z`);
    const tzString = tempDate.toLocaleString("en-US", { timeZone: timezone, timeZoneName: "shortOffset" });

    // Extract GMT offset e.g. "GMT+5:30" or "GMT-4"
    const match = tzString.match(/GMT([+-]\d{1,2})(?::(\d{2}))?/);
    let offsetMinutes = 0;
    if (match) {
        const sign = match[1].startsWith("-") ? -1 : 1;
        const offsetHours = parseInt(match[1].replace("+", "").replace("-", ""), 10);
        const offsetMins = match[2] ? parseInt(match[2], 10) : 0;
        offsetMinutes = sign * (offsetHours * 60 + offsetMins);
    }

    const utcTimestamp = new Date(`${localIsoString}Z`).getTime() - (offsetMinutes * 60 * 1000);
    return new Date(utcTimestamp);
};

/**
 * Formats a UTC Date instance to a 12-hour display string in the customer's selected timezone
 */
export const formatSlotTimeInTimezone = (utcDate, displayTimezone) => {
    return new Intl.DateTimeFormat("en-US", {
        timeZone: displayTimezone,
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    }).format(utcDate);
};

/**
 * Generates all bookable slot objects for a 35-day window, converted into UTC instants
 */
export const generateAllAvailableInstants = (availabilityData, durationInMinutes = 30) => {
    if (!availabilityData?.days) return [];

    const serviceTz = availabilityData.timezone || "UTC";
    const step = durationInMinutes > 0 ? durationInMinutes : 30;
    const allSlots = [];

    const now = new Date();
    const todayServiceStr = getDateKeyInTimezone(now, serviceTz);
    const [tYear, tMonth, tDay] = todayServiceStr.split("-").map(Number);

    // Scan the next 35 days in the service's calendar
    for (let dayOffset = 0; dayOffset <= 35; dayOffset++) {
        const refDate = new Date(Date.UTC(tYear, tMonth - 1, tDay + dayOffset));
        const dateKey = refDate.toISOString().split("T")[0];
        const dayOfWeekIndex = refDate.getUTCDay();
        const dayName = WEEKDAY_NAMES[dayOfWeekIndex];

        const daySchedule = availabilityData.days[dayName];
        if (!daySchedule?.enabled || !daySchedule.slots?.length) continue;

        daySchedule.slots.forEach((range) => {
            let current = range.startTime;
            while (current + step <= range.endTime) {
                const instant = createInstantFromServiceSlot(dateKey, current, serviceTz);
                // Exclude past times
                if (instant > now) {
                    allSlots.push({
                        utcDate: instant,
                        isoString: instant.toISOString(),
                        serviceDate: dateKey,
                        serviceMinutes: current
                    });
                }
                current += step;
            }
        });
    }

    return allSlots;
};

/**
 * Checks if a given display date has any available slots in the user's selected timezone
 */
export const isDayDisabledInDisplayTz = (viewDate, allSlotInstants, displayTimezone) => {
    const selectedDateKey = getDateKeyInTimezone(viewDate, displayTimezone);
    return !allSlotInstants.some((slot) => getDateKeyInTimezone(slot.utcDate, displayTimezone) === selectedDateKey);
};

/**
 * Dynamically loads external Razorpay checkout script if not present
 */
export const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};