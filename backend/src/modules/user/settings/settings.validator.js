export const themeValidator = (theme) => {
    const allowed = ["light", "dark"];
    if (!theme || !allowed.includes(theme)) {
        return { valid: false, errors: ["Invalid theme"] };
    }
    return { valid: true };
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