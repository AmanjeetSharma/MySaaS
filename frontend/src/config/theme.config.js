// theme.config.js
import { THEME_IDS } from '../theme/theme.constant.js';

export const themeProfiles = {
    [THEME_IDS.DEFAULT]: {
        name: "Default",
        tier: "free",
        mode: {
            light: {
                "--background": "#ffffff",
                "--foreground": "#09090b",
                "--card": "#ffffff",
                "--card-foreground": "#09090b",
                "--popover": "#ffffff",
                "--popover-foreground": "#09090b",
                "--primary": "#18181b",
                "--primary-foreground": "#fafafa",
                "--secondary": "#f4f4f5",
                "--secondary-foreground": "#18181b",
                "--muted": "#f4f4f5",
                "--muted-foreground": "#71717a",
                "--accent": "#f4f4f5",
                "--accent-foreground": "#18181b",
                "--destructive": "#ef4444",
                "--success": "#22c55e",
                "--warning": "#f59e0b",
                "--border": "#e4e4e7",
                "--input": "#e4e4e7",
                "--ring": "#18181b",
                "--radius": "0.5rem",
                "--sidebar": "#ffffff",
                "--sidebar-foreground": "#18181b",
                "--sidebar-primary": "#18181b",
                "--sidebar-primary-foreground": "#fafafa",
                "--sidebar-accent": "#f4f4f5",
                "--sidebar-accent-foreground": "#18181b",
                "--sidebar-border": "#e4e4e7",
                "--sidebar-ring": "#18181b",
            },
            dark: {
                "--background": "#000000",
                "--foreground": "#fafafa",

                "--card": "#050505",
                "--card-foreground": "#fafafa",

                "--popover": "#050505",
                "--popover-foreground": "#fafafa",

                "--primary": "#ffffff",
                "--primary-foreground": "#000000",

                "--secondary": "#0f0f10",
                "--secondary-foreground": "#fafafa",

                "--muted": "#111111",
                "--muted-foreground": "#8b8b93",

                "--accent": "#141414",
                "--accent-foreground": "#ffffff",

                "--destructive": "#dc2626",
                "--success": "#15803d",
                "--warning": "#a16207",

                "--border": "#1a1a1a",
                "--input": "#121212",
                "--ring": "#52525b",

                "--radius": "0.5rem",

                "--sidebar": "#000000",
                "--sidebar-foreground": "#fafafa",

                "--sidebar-primary": "#ffffff",
                "--sidebar-primary-foreground": "#000000",

                "--sidebar-accent": "#111111",
                "--sidebar-accent-foreground": "#ffffff",

                "--sidebar-border": "#1a1a1a",
                "--sidebar-ring": "#52525b",
            }
        }
    },
    [THEME_IDS.OCEAN_TEAL]: {
        name: "Ocean Teal",
        tier: "pro",
        mode: {
            light: {
                "--background": "#f2fffd",
                "--foreground": "#102a2a",

                "--card": "#ffffff",
                "--card-foreground": "#102a2a",

                "--popover": "#ffffff",
                "--popover-foreground": "#102a2a",

                "--primary": "#0f766e",
                "--primary-foreground": "#ffffff",

                "--secondary": "#d7f5f1",
                "--secondary-foreground": "#134e4a",

                "--muted": "#ecfdfb",
                "--muted-foreground": "#5b8f8a",

                "--accent": "#14b8a6",
                "--accent-foreground": "#ffffff",

                "--destructive": "#dc2626",
                "--success": "#059669",
                "--warning": "#d97706",

                "--border": "#c7ebe6",
                "--input": "#dff7f3",
                "--ring": "#14b8a6",

                "--radius": "0.75rem",

                "--sidebar": "#fcfffe",
                "--sidebar-foreground": "#102a2a",

                "--sidebar-primary": "#0f766e",
                "--sidebar-primary-foreground": "#ffffff",

                "--sidebar-accent": "#e6faf7",
                "--sidebar-accent-foreground": "#134e4a",

                "--sidebar-border": "#c7ebe6",
                "--sidebar-ring": "#14b8a6",
            },

            dark: {
                "--background": "#000000",
                "--foreground": "#ecfeff",

                /* Layered surfaces */
                "--card": "#071010",
                "--card-foreground": "#ecfeff",

                "--popover": "#0a1414",
                "--popover-foreground": "#ecfeff",

                /* Brand identity */
                "--primary": "#2dd4bf",
                "--primary-foreground": "#001312",

                "--secondary": "#0f1b1b",
                "--secondary-foreground": "#d7fffb",

                "--muted": "#132121",
                "--muted-foreground": "#7db5af",

                "--accent": "#103232",
                "--accent-foreground": "#ccfbf1",

                "--destructive": "#dc2626",
                "--success": "#059669",
                "--warning": "#d97706",

                /* Subtle teal borders */
                "--border": "#183838",
                "--input": "#112525",

                "--ring": "#2dd4bf",

                "--radius": "0.75rem",

                /* Sidebar */
                "--sidebar": "#040808",
                "--sidebar-foreground": "#ecfeff",

                "--sidebar-primary": "#2dd4bf",
                "--sidebar-primary-foreground": "#001312",

                "--sidebar-accent": "#0f1f1f",
                "--sidebar-accent-foreground": "#d7fffb",

                "--sidebar-border": "#163232",
                "--sidebar-ring": "#2dd4bf",
            }
        }
    },
    [THEME_IDS.MIDNIGHT_VIOLET]: {
        name: "Midnight Violet",
        tier: "pro",
        mode: {
            light: {
                "--background": "#faf9ff",
                "--foreground": "#160b2e",
                "--card": "#ffffff",
                "--card-foreground": "#160b2e",
                "--popover": "#ffffff",
                "--popover-foreground": "#160b2e",
                "--primary": "#6d28d9",
                "--primary-foreground": "#ffffff",
                "--secondary": "#ede9fe",
                "--secondary-foreground": "#160b2e",
                "--muted": "#f5f3ff",
                "--muted-foreground": "#7c7c8a",
                "--accent": "#8b5cf6",
                "--accent-foreground": "#ffffff",
                "--destructive": "#ef4444",
                "--success": "#10b981",
                "--warning": "#f59e0b",
                "--border": "#e4e4e7",
                "--input": "#e4e4e7",
                "--ring": "#6d28d9",
                "--radius": "0.75rem",
                "--sidebar": "#ffffff",
                "--sidebar-foreground": "#160b2e",
                "--sidebar-primary": "#6d28d9",
                "--sidebar-primary-foreground": "#ffffff",
                "--sidebar-accent": "#f5f3ff",
                "--sidebar-accent-foreground": "#160b2e",
                "--sidebar-border": "#e4e4e7",
                "--sidebar-ring": "#6d28d9",
            },
            dark: {
                "--background": "#020008",
                "--foreground": "#f5f3ff",

                /* Surface hierarchy */
                "--card": "#0a0414",
                "--card-foreground": "#f5f3ff",

                "--popover": "#10071d",
                "--popover-foreground": "#f5f3ff",

                /* Brand */
                "--primary": "#8b5cf6",
                "--primary-foreground": "#050011",

                /* Layered surfaces */
                "--secondary": "#181028",
                "--secondary-foreground": "#ede9fe",

                "--muted": "#120c20",
                "--muted-foreground": "#a8a0bd",

                /* Hover/accent */
                "--accent": "#5b21b6",
                "--accent-foreground": "#f5f3ff",

                "--destructive": "#dc2626",
                "--success": "#15803d",
                "--warning": "#ca8a04",

                /* Softer premium borders */
                "--border": "#24163f",
                "--input": "#1a122e",

                "--ring": "#8b5cf6",

                "--radius": "0.75rem",

                /* Sidebar */
                "--sidebar": "#06020f",
                "--sidebar-foreground": "#f5f3ff",

                "--sidebar-primary": "#8b5cf6",
                "--sidebar-primary-foreground": "#050011",

                "--sidebar-accent": "#140d24",
                "--sidebar-accent-foreground": "#ede9fe",

                "--sidebar-border": "#24163f",
                "--sidebar-ring": "#8b5cf6",
            }
        }
    },
    [THEME_IDS.FOREST_AMBER]: {
        name: "Forest Amber",
        tier: "pro",
        mode: {
            light: {
                "--background": "#f7f9f2",
                "--foreground": "#1a2416",
                "--card": "#ffffff",
                "--card-foreground": "#1a2416",
                "--popover": "#ffffff",
                "--popover-foreground": "#1a2416",
                "--primary": "#4a7c2e",
                "--primary-foreground": "#ffffff",
                "--secondary": "#e8f0e0",
                "--secondary-foreground": "#1a2416",
                "--muted": "#edf3e6",
                "--muted-foreground": "#5e7052",
                "--accent": "#d97706",
                "--accent-foreground": "#ffffff",
                "--destructive": "#ef4444",
                "--success": "#22c55e",
                "--warning": "#eab308",
                "--border": "#dce5d0",
                "--input": "#dce5d0",
                "--ring": "#4a7c2e",
                "--radius": "0.5rem",
                "--sidebar": "#ffffff",
                "--sidebar-foreground": "#1a2416",
                "--sidebar-primary": "#4a7c2e",
                "--sidebar-primary-foreground": "#ffffff",
                "--sidebar-accent": "#f0f5e8",
                "--sidebar-accent-foreground": "#1a2416",
                "--sidebar-border": "#dce5d0",
                "--sidebar-ring": "#4a7c2e",
            },
            dark: {
                "--background": "#060904",
                "--foreground": "#edf7e7",

                /* Layered forest surfaces */
                "--card": "#0d1409",
                "--card-foreground": "#edf7e7",

                "--popover": "#11180d",
                "--popover-foreground": "#edf7e7",

                /* Brand */
                "--primary": "#84cc16",
                "--primary-foreground": "#081005",

                /* Elevated surfaces */
                "--secondary": "#182313",
                "--secondary-foreground": "#edf7e7",

                "--muted": "#131b10",
                "--muted-foreground": "#91a38a",

                /* Accent */
                "--accent": "#ca8a04",
                "--accent-foreground": "#081005",

                "--destructive": "#dc2626",
                "--success": "#15803d",
                "--warning": "#a16207",

                /* Organic borders */
                "--border": "#24301d",
                "--input": "#1a2415",

                "--ring": "#84cc16",

                "--radius": "0.5rem",

                /* Sidebar */
                "--sidebar": "#0a0f07",
                "--sidebar-foreground": "#edf7e7",

                "--sidebar-primary": "#84cc16",
                "--sidebar-primary-foreground": "#081005",

                "--sidebar-accent": "#151f11",
                "--sidebar-accent-foreground": "#edf7e7",

                "--sidebar-border": "#24301d",
                "--sidebar-ring": "#84cc16",
            }
        }
    },
    [THEME_IDS.DUSTY_ROSE]: {
        name: "Dusty Rose",
        tier: "pro",
        mode: {
            light: {
                "--background": "#fafaf9", /* Stone 50 */
                "--foreground": "#1c1917", /* Stone 900 */

                "--card": "#ffffff",
                "--card-foreground": "#1c1917",

                "--popover": "#ffffff",
                "--popover-foreground": "#1c1917",

                "--primary": "#e11d48", /* Rose 600 (Darker for light mode visibility) */
                "--primary-foreground": "#ffffff",

                "--secondary": "#f5f5f4", /* Stone 100 */
                "--secondary-foreground": "#1c1917",

                "--muted": "#f5f5f4",
                "--muted-foreground": "#78716c", /* Stone 500 */

                "--accent": "#e7e5e4", /* Stone 200 */
                "--accent-foreground": "#1c1917",

                "--destructive": "#dc2626",
                "--success": "#16a34a",
                "--warning": "#d97706",

                "--border": "#e7e5e4",
                "--input": "#e7e5e4",
                "--ring": "#e11d48",

                "--radius": "1rem",

                "--sidebar": "#f5f5f4",
                "--sidebar-foreground": "#1c1917",
                "--sidebar-primary": "#e11d48",
                "--sidebar-primary-foreground": "#ffffff",
                "--sidebar-accent": "#e7e5e4",
                "--sidebar-accent-foreground": "#1c1917",
                "--sidebar-border": "#d6d3d1",
                "--sidebar-ring": "#e11d48",
            },
            dark: {
                "--background": "#1c1917",
                "--foreground": "#fafaf9",

                "--card": "#292524",
                "--card-foreground": "#fafaf9",

                "--popover": "#352f2d",
                "--popover-foreground": "#fafaf9",

                "--primary": "#f43f5e", /* Rose 500 */
                "--primary-foreground": "#ffffff",

                "--secondary": "#44403c",
                "--secondary-foreground": "#fafaf9",

                "--muted": "#352f2d",
                "--muted-foreground": "#a8a29e",

                "--accent": "#57534e",
                "--accent-foreground": "#ffffff",

                "--destructive": "#ef4444",
                "--success": "#10b981",
                "--warning": "#f59e0b",

                "--border": "#4a4441",
                "--input": "#44403c",

                "--ring": "#f43f5e",

                "--radius": "1rem",

                "--sidebar": "#161412",
                "--sidebar-foreground": "#fafaf9",
                "--sidebar-primary": "#f43f5e",
                "--sidebar-primary-foreground": "#ffffff",
                "--sidebar-accent": "#44403c",
                "--sidebar-accent-foreground": "#fafaf9",
                "--sidebar-border": "#4a4441",
                "--sidebar-ring": "#f43f5e",
            }
        }
    },
    [THEME_IDS.COFFEE]: {
        name: "Coffee",
        tier: "pro",
        mode: {
            light: {
                "--background": "#fdf8f0",
                "--foreground": "#3b2a1f",
                "--card": "#ffffff",
                "--card-foreground": "#3b2a1f",
                "--popover": "#ffffff",
                "--popover-foreground": "#3b2a1f",
                "--primary": "#8b5a2b",
                "--primary-foreground": "#ffffff",
                "--secondary": "#f5e6d3",
                "--secondary-foreground": "#3b2a1f",
                "--muted": "#faf0e6",
                "--muted-foreground": "#8a6e4b",
                "--accent": "#c77d3e",
                "--accent-foreground": "#ffffff",
                "--destructive": "#ef4444",
                "--success": "#10b981",
                "--warning": "#f59e0b",
                "--border": "#e6d5c0",
                "--input": "#e6d5c0",
                "--ring": "#8b5a2b",
                "--radius": "0.5rem",
                "--sidebar": "#ffffff",
                "--sidebar-foreground": "#3b2a1f",
                "--sidebar-primary": "#8b5a2b",
                "--sidebar-primary-foreground": "#ffffff",
                "--sidebar-accent": "#fdf8f0",
                "--sidebar-accent-foreground": "#3b2a1f",
                "--sidebar-border": "#e6d5c0",
                "--sidebar-ring": "#8b5a2b",
            },
            dark: {
                "--background": "#0f0905",
                "--foreground": "#fff7ed",

                "--card": "#170e08",
                "--card-foreground": "#fff7ed",

                "--popover": "#1f130b",
                "--popover-foreground": "#fff7ed",

                "--primary": "#fb923c", /* Orange 400 */
                "--primary-foreground": "#0f0905",

                "--secondary": "#2b1a10",
                "--secondary-foreground": "#fff7ed",

                "--muted": "#1f130b",
                "--muted-foreground": "#fdba74",

                "--accent": "#432817",
                "--accent-foreground": "#ffffff",

                "--destructive": "#ef4444",
                "--success": "#4ade80",
                "--warning": "#fcd34d",

                "--border": "#3b2416",
                "--input": "#2b1a10",

                "--ring": "#fb923c",

                "--radius": "1rem",

                "--sidebar": "#120a06",
                "--sidebar-foreground": "#fff7ed",

                "--sidebar-primary": "#fb923c",
                "--sidebar-primary-foreground": "#0f0905",

                "--sidebar-accent": "#2b1a10",
                "--sidebar-accent-foreground": "#fff7ed",

                "--sidebar-border": "#3b2416",
                "--sidebar-ring": "#fb923c",
            }
        }
    },
    [THEME_IDS.SAKURA]: {
        name: "Sakura",
        tier: "pro",
        mode: {
            light: {
                "--background": "#fff5f9",
                "--foreground": "#4a2c3a",
                "--card": "#ffffff",
                "--card-foreground": "#4a2c3a",
                "--popover": "#ffffff",
                "--popover-foreground": "#4a2c3a",
                "--primary": "#f48fb1",
                "--primary-foreground": "#4a2c3a",
                "--secondary": "#ffe0e8",
                "--secondary-foreground": "#4a2c3a",
                "--muted": "#fff0f5",
                "--muted-foreground": "#8a6e7a",
                "--accent": "#f06292",
                "--accent-foreground": "#ffffff",
                "--destructive": "#ef4444",
                "--success": "#10b981",
                "--warning": "#f59e0b",
                "--border": "#fce4ec",
                "--input": "#fce4ec",
                "--ring": "#f48fb1",
                "--radius": "1rem",
                "--sidebar": "#ffffff",
                "--sidebar-foreground": "#4a2c3a",
                "--sidebar-primary": "#f48fb1",
                "--sidebar-primary-foreground": "#4a2c3a",
                "--sidebar-accent": "#fff5f9",
                "--sidebar-accent-foreground": "#4a2c3a",
                "--sidebar-border": "#fce4ec",
                "--sidebar-ring": "#f48fb1",
            },
            dark: {
                "--background": "#140c10",
                "--foreground": "#ffe0e8",

                /* Layered surfaces */
                "--card": "#22121b",
                "--card-foreground": "#ffe0e8",

                "--popover": "#2a1620",
                "--popover-foreground": "#ffe0e8",

                /* Brand */
                "--primary": "#ff80ab",
                "--primary-foreground": "#140c10",

                /* UI layers */
                "--secondary": "#3b2230",
                "--secondary-foreground": "#ffe0e8",

                "--muted": "#2a1620",
                "--muted-foreground": "#d1a1b1",

                /* Controlled accent */
                "--accent": "#ff4d8d",
                "--accent-foreground": "#140c10",

                "--destructive": "#7f1d1d",
                "--success": "#14532d",
                "--warning": "#a16207",

                /* Better separation */
                "--border": "#3f2432",
                "--input": "#2f1a26",

                "--ring": "#ff80ab",

                "--radius": "1rem",

                /* Sidebar depth */
                "--sidebar": "#1a0f14",
                "--sidebar-foreground": "#ffe0e8",

                "--sidebar-primary": "#ff80ab",
                "--sidebar-primary-foreground": "#140c10",

                "--sidebar-accent": "#2f1a26",
                "--sidebar-accent-foreground": "#ffe0e8",

                "--sidebar-border": "#3f2432",
                "--sidebar-ring": "#ff80ab",
            }
        }
    },
    [THEME_IDS.PLATINUM]: {
        name: "Platinum",
        tier: "pro",
        mode: {
            light: {
                "--background": "#f5f7fa",
                "--foreground": "#1a202c",
                "--card": "#ffffff",
                "--card-foreground": "#1a202c",
                "--popover": "#ffffff",
                "--popover-foreground": "#1a202c",
                "--primary": "#4a5568",
                "--primary-foreground": "#ffffff",
                "--secondary": "#e2e8f0",
                "--secondary-foreground": "#1a202c",
                "--muted": "#edf2f7",
                "--muted-foreground": "#718096",
                "--accent": "#6b7280",
                "--accent-foreground": "#ffffff",
                "--destructive": "#ef4444",
                "--success": "#10b981",
                "--warning": "#f59e0b",
                "--border": "#cbd5e0",
                "--input": "#cbd5e0",
                "--ring": "#4a5568",
                "--radius": "0.375rem",
                "--sidebar": "#ffffff",
                "--sidebar-foreground": "#1a202c",
                "--sidebar-primary": "#4a5568",
                "--sidebar-primary-foreground": "#ffffff",
                "--sidebar-accent": "#f5f7fa",
                "--sidebar-accent-foreground": "#1a202c",
                "--sidebar-border": "#cbd5e0",
                "--sidebar-ring": "#4a5568",
            },
            dark: {
                /* Base */
                "--background": "#0b0f14",
                "--foreground": "#f1f5f9", /* Brightened slightly for better reading contrast */

                /* Surface hierarchy (Perfectly stepped lightness) */
                "--card": "#11161d",
                "--card-foreground": "#f1f5f9",

                "--popover": "#151b23",
                "--popover-foreground": "#f1f5f9",

                /* Brand */
                "--primary": "#a5b4fc", /* Your original beautiful indigo */
                "--primary-foreground": "#0b0f14",

                /* Layers & Interactive */
                "--secondary": "#171f2a", /* Tinted blue-slate to match background */
                "--secondary-foreground": "#f1f5f9",

                "--muted": "#151b23",
                "--muted-foreground": "#8b96a5", /* Smoothed out */

                /* Subtle hover accent */
                "--accent": "#1c2532", /* Darkened for perfect row/menu hover states */
                "--accent-foreground": "#f1f5f9",

                /* Status (Adjusted to neon/pastel for dark mode pop) */
                "--destructive": "#f87171",
                "--success": "#4ade80",
                "--warning": "#fbbf24",

                /* Separation & Input */
                "--border": "#212b36",
                "--input": "#171f2a",
                "--ring": "#a5b4fc",

                "--radius": "0.375rem",

                /* Sidebar */
                "--sidebar": "#090c10", /* Darker than base for depth */
                "--sidebar-foreground": "#f1f5f9",
                "--sidebar-primary": "#a5b4fc",
                "--sidebar-primary-foreground": "#0b0f14",
                "--sidebar-accent": "#151b23",
                "--sidebar-accent-foreground": "#f1f5f9",
                "--sidebar-border": "#212b36",
                "--sidebar-ring": "#a5b4fc",
            }
        }
    },
    [THEME_IDS.AZURE_BLUE]: {
        name: "Azure Blue",
        tier: "pro",
        mode: {
            light: {
                "--background": "#f5f9ff",
                "--foreground": "#0b1220",

                /* Surfaces */
                "--card": "#ffffff",
                "--card-foreground": "#0b1220",

                "--popover": "#ffffff",
                "--popover-foreground": "#0b1220",

                /* Primary brand blue (same identity as dark) */
                "--primary": "#3b82f6",
                "--primary-foreground": "#ffffff",

                /* UI layers */
                "--secondary": "#eaf2ff",
                "--secondary-foreground": "#0b1220",

                "--muted": "#f1f6ff",
                "--muted-foreground": "#5b6b86",

                /* Accent */
                "--accent": "#60a5fa",
                "--accent-foreground": "#ffffff",

                /* States */
                "--destructive": "#ef4444",
                "--success": "#22c55e",
                "--warning": "#f59e0b",

                /* Borders & inputs */
                "--border": "#d6e4f5",
                "--input": "#d6e4f5",

                /* Focus ring */
                "--ring": "#3b82f6",

                "--radius": "0.5rem",

                /* Sidebar */
                "--sidebar": "#ffffff",
                "--sidebar-foreground": "#0b1220",

                "--sidebar-primary": "#3b82f6",
                "--sidebar-primary-foreground": "#ffffff",

                "--sidebar-accent": "#f1f6ff",
                "--sidebar-accent-foreground": "#0b1220",

                "--sidebar-border": "#d6e4f5",
                "--sidebar-ring": "#3b82f6",
            },
            dark: {
                "--background": "#0b1220",
                "--foreground": "#e6f0ff",

                /* Surfaces */
                "--card": "#111a2e",
                "--card-foreground": "#e6f0ff",

                "--popover": "#141f38",
                "--popover-foreground": "#e6f0ff",

                /* Primary brand blue */
                "--primary": "#3b82f6",
                "--primary-foreground": "#0b1220",

                /* UI layers */
                "--secondary": "#1a2740",
                "--secondary-foreground": "#e6f0ff",

                "--muted": "#162033",
                "--muted-foreground": "#93a4bf",

                /* Accent (slightly brighter electric blue) */
                "--accent": "#60a5fa",
                "--accent-foreground": "#0b1220",

                /* States */
                "--destructive": "#ef4444",
                "--success": "#22c55e",
                "--warning": "#f59e0b",

                /* Borders & inputs */
                "--border": "#22314d",
                "--input": "#1a2740",

                /* Focus ring */
                "--ring": "#3b82f6",

                "--radius": "0.5rem",

                /* Sidebar */
                "--sidebar": "#0b1220",
                "--sidebar-foreground": "#e6f0ff",

                "--sidebar-primary": "#3b82f6",
                "--sidebar-primary-foreground": "#0b1220",

                "--sidebar-accent": "#162033",
                "--sidebar-accent-foreground": "#e6f0ff",

                "--sidebar-border": "#22314d",
                "--sidebar-ring": "#3b82f6",
            }
        }
    },
    [THEME_IDS.GRAPHITE_GOLD]: {
        name: "Graphite Gold",
        tier: "pro",
        mode: {
            light: {
                "--background": "#ffffff",
                "--foreground": "#121212",

                "--card": "#ffffff",
                "--card-foreground": "#121212",

                "--popover": "#ffffff",
                "--popover-foreground": "#121212",

                "--primary": "#f59e0b", /* Amber 500 */
                "--primary-foreground": "#121212", /* Dark text on gold buttons */

                "--secondary": "#f4f4f5", /* Zinc 100 */
                "--secondary-foreground": "#18181b",

                "--muted": "#f4f4f5",
                "--muted-foreground": "#71717a", /* Zinc 500 */

                "--accent": "#e4e4e7", /* Zinc 200 */
                "--accent-foreground": "#18181b",

                "--destructive": "#dc2626",
                "--success": "#16a34a",
                "--warning": "#d97706",

                "--border": "#e4e4e7",
                "--input": "#e4e4e7",
                "--ring": "#f59e0b",

                "--radius": "1rem",

                "--sidebar": "#fafafa", /* Very light gray sidebar */
                "--sidebar-foreground": "#121212",
                "--sidebar-primary": "#f59e0b",
                "--sidebar-primary-foreground": "#121212",
                "--sidebar-accent": "#f4f4f5",
                "--sidebar-accent-foreground": "#18181b",
                "--sidebar-border": "#e4e4e7",
                "--sidebar-ring": "#f59e0b",
            },
            dark: {
                "--background": "#121212",
                "--foreground": "#f4f4f5",

                "--card": "#18181b",
                "--card-foreground": "#f4f4f5",

                "--popover": "#1f1f22",
                "--popover-foreground": "#f4f4f5",

                "--primary": "#fbbf24", /* Amber/Gold 400 */
                "--primary-foreground": "#121212",

                "--secondary": "#27272a",
                "--secondary-foreground": "#f4f4f5",

                "--muted": "#1f1f22",
                "--muted-foreground": "#a1a1aa",

                "--accent": "#3f3f46",
                "--accent-foreground": "#ffffff",

                "--destructive": "#ef4444",
                "--success": "#22c55e",
                "--warning": "#f59e0b",

                "--border": "#333338",
                "--input": "#27272a",

                "--ring": "#fbbf24",

                "--radius": "1rem",

                "--sidebar": "#0a0a0a",
                "--sidebar-foreground": "#f4f4f5",
                "--sidebar-primary": "#fbbf24",
                "--sidebar-primary-foreground": "#121212",
                "--sidebar-accent": "#27272a",
                "--sidebar-accent-foreground": "#f4f4f5",
                "--sidebar-border": "#333338",
                "--sidebar-ring": "#fbbf24",
            }
        }
    }
};