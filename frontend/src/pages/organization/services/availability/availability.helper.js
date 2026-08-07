export const DAYS = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
];

export const PRESETS = [
    { key: 'morning', label: 'Morning', startTime: '10:00', endTime: '12:00' },
    { key: 'afternoon', label: 'Afternoon', startTime: '13:00', endTime: '16:00' },
    { key: 'evening', label: 'Evening', startTime: '17:00', endTime: '20:00' },
    { key: 'night', label: 'Night', startTime: '20:00', endTime: '22:00' },
];

// --- Time Conversion Helpers ---

/** Converts "HH:mm" -> minutes integer (e.g. "14:30" -> 870) */
export const timeToMinutes = (timeStr) => {
    if (typeof timeStr === 'number') return timeStr;
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

/** Converts minutes integer -> "HH:mm" (e.g. 870 -> "14:30") */
export const minutesToTime = (minutesNum) => {
    if (typeof minutesNum === 'string') return minutesNum;
    if (typeof minutesNum !== 'number' || isNaN(minutesNum)) return '09:00';
    const hours = String(Math.floor(minutesNum / 60)).padStart(2, '0');
    const mins = String(minutesNum % 60).padStart(2, '0');
    return `${hours}:${mins}`;
};

/** Formats "HH:mm" or minutes to 12-hour AM/PM string */
export const formatTime = (time) => {
    if (!time && time !== 0) return '';
    const timeStr = typeof time === 'number' ? minutesToTime(time) : time;
    const [hours, minutes] = timeStr.split(':').map(Number);
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const normalizedHour = hours % 12 || 12;
    return `${normalizedHour}:${String(minutes || 0).padStart(2, '0')} ${suffix}`;
};

export const formatSlot = (slot) => `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`;

export const formatServiceMeta = (service) => {
    if (!service) return 'Service availability';
    const duration = service.durationInMinutes ? `${service.durationInMinutes} min` : null;
    const mode = service.mode || null;
    return [duration, mode].filter(Boolean).join(' - ') || 'Service availability';
};

// Generate 15-minute intervals for UI select options
export const TIME_OPTIONS = Array.from({ length: 24 * 4 }, (_, i) => ({
    value: minutesToTime(i * 15),
    minutes: i * 15,
}));

// --- Form & Schema Helpers ---

export const createEmptyDay = () => ({
    enabled: false,
    slots: [],
});

export const createDefaultForm = () => ({
    timezone: 'UTC',
    days: {
        monday: createEmptyDay(),
        tuesday: createEmptyDay(),
        wednesday: createEmptyDay(),
        thursday: createEmptyDay(),
        friday: createEmptyDay(),
        saturday: createEmptyDay(),
        sunday: createEmptyDay(),
    },
});

export const normalizeDay = (day) => ({
    enabled: !!day?.enabled,
    slots: Array.isArray(day?.slots)
        ? day.slots.map((slot) => ({
            startTime: minutesToTime(slot.startTime),
            endTime: minutesToTime(slot.endTime),
        }))
        : [],
});

export const toForm = (availability) => {
    const form = createDefaultForm();
    if (!availability) return form;
    form.timezone = availability.timezone || 'UTC';

    DAYS.forEach(({ key }) => {
        form.days[key] = normalizeDay(availability.days?.[key]);
    });

    return form;
};

export const toPayload = (form) => ({
    timezone: form.timezone,
    days: DAYS.reduce((acc, { key }) => {
        const day = form.days[key];
        acc[key] = {
            enabled: day.enabled,
            slots: day.enabled
                ? day.slots.map((slot) => ({
                    startTime: timeToMinutes(slot.startTime),
                    endTime: timeToMinutes(slot.endTime),
                }))
                : [],
        };
        return acc;
    }, {}),
});

export const stringifyPayload = (form) => JSON.stringify(toPayload(form));

// --- Statistics & Calculations ---

export const getActiveDaysCount = (form) =>
    DAYS.filter(({ key }) => form.days[key]?.enabled).length;

export const getTotalSlotsCount = (form) =>
    DAYS.reduce((count, { key }) => count + (form.days[key]?.slots?.length || 0), 0);

/** Sorts array of slots chronologically by start time */
export const sortSlots = (slots = []) =>
    [...slots].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

// --- Validation Helpers ---

export const checkSlotOverlap = (existingSlots, newStartMins, newEndMins, excludeIndex = null) => {
    return existingSlots.some((slot, index) => {
        if (excludeIndex !== null && index === excludeIndex) return false;
        const slotStart = timeToMinutes(slot.startTime);
        const slotEnd = timeToMinutes(slot.endTime);
        return newStartMins < slotEnd && newEndMins > slotStart;
    });
};

export const validateForm = (form) => {
    for (const { key, label } of DAYS) {
        const day = form.days[key];

        if (day.enabled && day.slots.length === 0) {
            return `${label} needs at least one time slot`;
        }

        const sortedSlots = sortSlots(day.slots);

        for (let i = 0; i < sortedSlots.length; i++) {
            const start = timeToMinutes(sortedSlots[i].startTime);
            const end = timeToMinutes(sortedSlots[i].endTime);

            if (end <= start) {
                return `${label} has a slot where end time must be after start time`;
            }

            if (i > 0 && start < timeToMinutes(sortedSlots[i - 1].endTime)) {
                return `${label} has overlapping time slots`;
            }
        }
    }

    return null;
};