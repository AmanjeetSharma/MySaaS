// theme.utils.js
import { themeProfiles } from '../config/theme.config.js';
import { THEME_IDS, THEME_MODES } from './theme.constant.js';

export const PUBLIC_THEME = {
    name: THEME_IDS.DEFAULT,
    mode: THEME_MODES.LIGHT
};

/**
 * Applies the theme to the document root based on backend response
 * @param {string} backendThemeId - e.g., "slate-orange"
 * @param {string} backendMode - e.g., "dark" or "light"
 */

export const applyUserTheme = (backendThemeId, backendMode) => {
    // 1. Direct Lookup with Fallback: 
    // If backendThemeId is null or invalid, it defaults to THEME_IDS.DEFAULT
    const selectedTheme = themeProfiles[backendThemeId] || themeProfiles[THEME_IDS.DEFAULT];

    // 2. Validate Mode with Fallback:
    // Ensure mode is either light or dark, fallback to light
    const validMode = [THEME_MODES.LIGHT, THEME_MODES.DARK].includes(backendMode)
        ? backendMode
        : THEME_MODES.LIGHT;

    // 3. Extract the actual CSS variables
    const cssVariables = selectedTheme.mode[validMode];

    // 4. Inject variables into the HTML :root
    const root = document.documentElement;

    Object.entries(cssVariables).forEach(([cssVar, hexValue]) => {
        root.style.setProperty(cssVar, hexValue);
    });
};

export const applyPublicTheme = () => {
    applyUserTheme(PUBLIC_THEME.name, PUBLIC_THEME.mode);
};
