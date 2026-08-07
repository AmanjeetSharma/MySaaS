import { THEME_IDS } from "../../../constants/theme.constants.js";
import { TIMEZONES } from "../../../constants/timezone.constants.js";

export const themeValidator = (theme) => {
    const errors = [];

    const allowedNames = Object.values(THEME_IDS);
    const allowedModes = ["light", "dark"];

    if (!theme || typeof theme !== "object") {
        return { valid: false, errors: ["Theme must be an object"] };
    }

    if (theme.name && !allowedNames.includes(theme.name)) {
        errors.push("Invalid theme name");
    }

    if (theme.mode && !allowedModes.includes(theme.mode)) {
        errors.push("Invalid theme mode");
    }

    return {
        valid: errors.length === 0,
        errors
    };
};


export const timezoneValidator = (timezone) => {
    if (typeof timezone !== "string") {
        return {
            valid: false,
            errors: ["Timezone must be a string"],
        };
    }

    if (timezone.trim() === "") {
        return {
            valid: false,
            errors: ["Timezone cannot be empty"],
        };
    }

    if (!TIMEZONES.includes(timezone)) {
        return {
            valid: false,
            errors: [`Timezone not supported: ${timezone}`],
        };
    }

    return {
        valid: true,
        errors: [],
    };
};

export const notificationValidator = (data) => {
    if (typeof data.email !== "boolean" || typeof data.inApp !== "boolean") {
        return {
            valid: false,
            errors: ["Notifications must be boolean"]
        };
    }
    return { valid: true };
};