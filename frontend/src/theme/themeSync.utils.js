import { THEME_IDS, THEME_MODES } from '../theme/theme.constant.js';
import { applyUserTheme } from './theme.utils.js';

const STORAGE_KEYS = {
    THEME_NAME: 'app_theme_name',
    THEME_MODE: 'app_theme_mode'
};

export const saveThemeToLocalStorage = (themeName, themeMode) => {
    localStorage.setItem(STORAGE_KEYS.THEME_NAME, themeName);
    localStorage.setItem(STORAGE_KEYS.THEME_MODE, themeMode);
};

export const getThemeFromLocalStorage = () => {
    const name = localStorage.getItem(STORAGE_KEYS.THEME_NAME);
    const mode = localStorage.getItem(STORAGE_KEYS.THEME_MODE);

    return {
        name: name || THEME_IDS.DEFAULT,
        mode: mode || THEME_MODES.DARK
    };
};

export const clearThemeFromLocalStorage = () => {
    localStorage.removeItem(STORAGE_KEYS.THEME_NAME);
    localStorage.removeItem(STORAGE_KEYS.THEME_MODE);
};

export const syncThemeWithBackend = (backendThemeName, backendThemeMode) => {
    applyUserTheme(backendThemeName, backendThemeMode);

    saveThemeToLocalStorage(
        backendThemeName,
        backendThemeMode
    );
};