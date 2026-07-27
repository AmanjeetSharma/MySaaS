export const serviceNameValidator = (name) => {
    const errors = [];

    if (typeof name !== "string") {
        errors.push("Service name must be a string");
        return { valid: false, errors };
    }

    const trimmed = name.trim();

    if (trimmed.length < 3 || trimmed.length > 120) {
        errors.push("Service name must be between 3 to 120 characters");
    }

    if (!/^[A-Za-z]/.test(trimmed)) {
        errors.push("Service name must start with a letter");
    }

    if (!/^[A-Za-z0-9\s\-&_().]+$/.test(trimmed)) {
        errors.push("Service name contains invalid characters");
    }

    return {
        valid: errors.length === 0,
        errors,
    };
};





export const serviceDescriptionValidator = (description) => {
    const errors = [];

    if (description === undefined || description === null) {
        return {
            valid: true,
            errors,
        };
    }

    if (typeof description !== "string") {
        errors.push("Description must be a string");
        return { valid: false, errors };
    }

    const trimmed = description.trim();

    if (trimmed.length > 1000) {
        errors.push("Description must not exceed 1000 characters");
    }

    return {
        valid: errors.length === 0,
        errors,
    };
};





export const serviceModeValidator = (mode) => {
    const errors = [];

    const allowedModes = ["ONLINE", "OFFLINE"];

    if (typeof mode !== "string") {
        errors.push("Mode must be a string");
        return { valid: false, errors };
    }

    if (!allowedModes.includes(mode)) {
        errors.push("Invalid service mode");
    }

    return {
        valid: errors.length === 0,
        errors,
    };
};





export const serviceDurationValidator = (duration) => {
    const errors = [];

    if (typeof duration !== "number" || Number.isNaN(duration)) {
        errors.push("Duration must be a valid number");
        return { valid: false, errors };
    }

    if (duration < 15) {
        errors.push("Duration must be at least 15 minutes");
    }

    if (duration > 999999) {
        errors.push("Duration exceeds maximum allowed limit");
    }

    return {
        valid: errors.length === 0,
        errors,
    };
};





export const servicePriceValidator = (price) => {
    const errors = [];

    if (typeof price !== "number" || Number.isNaN(price)) {
        errors.push("Price must be a valid number");
        return { valid: false, errors };
    }

    if (price < 0) {
        errors.push("Price cannot be negative");
    }

    return {
        valid: errors.length === 0,
        errors,
    };
};





export const serviceCurrencyValidator = (currency) => {
    const errors = [];

    const allowedCurrencies = ["INR", "USD", "EUR"];

    if (typeof currency !== "string") {
        errors.push("Currency must be a string");
        return { valid: false, errors };
    }

    if (!allowedCurrencies.includes(currency)) {
        errors.push("Invalid currency");
    }

    return {
        valid: errors.length === 0,
        errors,
    };
};





export const serviceAddressValidator = (address) => {
    const errors = [];

    if (!address || typeof address !== "object") {
        errors.push("Address must be a valid object");
        return { valid: false, errors };
    }

    const requiredFields = ["street", "city", "country"];

    for (const field of requiredFields) {
        if (typeof address[field] !== "string" || !address[field].trim()) {
            errors.push(`${field} is required in address`);
        }
    }

    if (address.zipCode && typeof address.zipCode !== "string") {
        errors.push("Zip code must be a string");
    }

    return {
        valid: errors.length === 0,
        errors,
    };
};






export const serviceOnlineMeetingProviderValidator = (provider) => {
    const errors = [];

    const allowedProviders = ["GOOGLE_MEET", "ZOOM", "MICROSOFT_TEAMS", "WHATSAPP"];

    if (typeof provider !== "string") {
        errors.push("Online meeting provider must be a string");
        return { valid: false, errors };
    }

    if (!allowedProviders.includes(provider)) {
        errors.push("Invalid Meeting provider. Allowed values are: " + allowedProviders.join(", "));
    }

    return {
        valid: errors.length === 0,
        errors,
    };
};
