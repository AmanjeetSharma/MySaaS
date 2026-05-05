export const themeValidator = (theme) => {
    const errors = [];

    const allowedNames = ["default", "modern", "minimal", "darkPro"];
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

    if (!theme.name && !theme.mode) {
        errors.push("At least one of theme.name or theme.mode is required");
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

export const timezoneValidator = (timezone) => {
    if (!timezone || typeof timezone !== "string") {
        return { valid: false, errors: ["Invalid timezone"] };
    }
    return { valid: true };
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