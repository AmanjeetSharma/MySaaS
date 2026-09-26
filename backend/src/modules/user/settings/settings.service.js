import { ApiError } from "../../../utils/ApiError.js";
import { themeValidator, timezoneValidator, notificationValidator } from "./settings.validator.js";
import { getUserById, updateUserSettingsField } from "../user.repository.js";
import { THEME_IDS } from '../../../constants/theme.constants.js';
import logger from "#/config/logger.js";
import { invalidateUserProfileCache } from "../user.cache.js";


// helper func
const updateSettings = async (userId, updateObj) => {
    const updatedUser = await updateUserSettingsField(userId, updateObj);
    if (!updatedUser) {
        throw new ApiError(404, "User not found or update failed");
    }

    return {
        settings: updatedUser.settings,
        updatedAt: updatedUser.updatedAt
    };
};






export const updateThemeService = async (userId, themeName, themeMode) => {
    const validation = themeValidator({ name: themeName, mode: themeMode });
    if (!validation.valid) {
        throw new ApiError(400, validation.errors.join(", "));
    }

    const user = await getUserById(userId);
    if (user.settings.theme.name === themeName && user.settings.theme.mode === themeMode) {
        throw new ApiError(400, "You are already using this setting");
    }

    if (user.settings.theme.tier === "free" && themeName !== THEME_IDS.DEFAULT) {
        throw new ApiError(403, "Upgrade to pro to unlock this theme");
    }

    const result = await updateSettings(userId, {
        "settings.theme.name": themeName,
        "settings.theme.mode": themeMode
    });

    await invalidateUserProfileCache(userId);

    logger.info(
        {
            userId,
            theme: {
                name: result.settings.theme.name,
                mode: result.settings.theme.mode,
                tier: result.settings.theme.tier,
            },
        },
        "user.theme_updated"
    );

    return {
        theme: result.settings.theme,
        message: `Theme updated to ${result.settings.theme.name} (mode: ${result.settings.theme.mode})`,
        updatedAt: result.updatedAt
    };
};






export const updateTimezoneService = async (userId, timezone) => {
    const validation = timezoneValidator(timezone);
    if (!validation.valid) {
        throw new ApiError(400, validation.errors.join(", "));
    }

    const result = await updateSettings(userId, {
        "settings.timezone": timezone
    });

    await invalidateUserProfileCache(userId);

    logger.info(
        {
            userId,
            timezone: result.settings.timezone,
        },
        "user.timezone_updated"
    );

    return {
        timezone: result.settings.timezone,
        message: `Timezone updated to ${result.settings.timezone}`,
        updatedAt: result.updatedAt
    };
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

    await invalidateUserProfileCache(userId);

    logger.info(
        {
            userId,
            notifications: settings.notifications,
        },
        "user.notifications_updated"
    );

    return {
        notifications: settings.notifications,
        message: `Notification preferences updated`
    };
};








export const getSettingsService = async (userId) => {
    const user = await getUserById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const settings = user.settings || {
        theme: { name: "default", mode: "dark", tier: "free" },
        timezone: "Asia/Kolkata",
        notifications: { email: false, inApp: true }
    };
    const themesAvailable = settings.theme.tier === "free" ? [THEME_IDS.DEFAULT] : Object.values(THEME_IDS);

    logger.info(
        {
            userId,
            theme: settings.theme.name,
            themeMode: settings.theme.mode,
            themeTier: settings.theme.tier,
            timezone: settings.timezone,
            emailNotifications: settings.notifications.email,
            inAppNotifications: settings.notifications.inApp,
        },
        "user.settings_retrieved"
    );

    return {
        settings,
        themesAvailable,
        message: "User settings retrieved successfully"
    };
};
