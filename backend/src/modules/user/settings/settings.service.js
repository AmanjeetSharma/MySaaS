import { ApiError } from "../../../utils/ApiError.js";
import { themeValidator, timezoneValidator, notificationValidator } from "./settings.validator.js";
import { getUserById, updateUserSettingsField } from "../user.repository.js";




const updateSettings = async (userId, updateObj) => {
    if (!userId) {
        throw new ApiError(401, "Unauthorized access");
    }

    const updatedUser = await updateUserSettingsField(userId, updateObj);
    if (!updatedUser) {
        throw new ApiError(404, "User not found or update failed");
    }

    return updatedUser.settings;
};



export const updateThemeService = async (userId, theme) => {
    const validation = themeValidator(theme);
    if (!validation.valid) {
        throw new ApiError(400, validation.errors.join(", "));
    }

    const settings = await updateSettings(userId, {
        "settings.theme": theme
    });

    console.log(`Theme updated for user ${userId}: ${settings.theme}`);

    return { theme: settings.theme };
};



export const updateTimezoneService = async (userId, timezone) => {
    const validation = timezoneValidator(timezone);
    if (!validation.valid) {
        throw new ApiError(400, validation.errors.join(", "));
    }

    const settings = await updateSettings(userId, {
        "settings.timezone": timezone
    });

    console.log(`Timezone updated for user ${userId}: ${settings.timezone}`);

    return { timezone: settings.timezone };
};



export const updateNotificationsService = async (userId, notifications) => {
    const validation = notificationValidator(notifications);
    if (!validation.valid) {
        throw new ApiError(400, validation.errors.join(", "));
    }

    const settings = await updateSettings(userId, {
        "settings.notifications.email": notifications.email,
        "settings.notifications.inApp": notifications.inApp
    });

    console.log(`Notification preferences updated for user ${userId}: Email - ${settings.notifications.email}, In-App - ${settings.notifications.inApp}`);

    return {
        notifications: settings.notifications
    };
};
