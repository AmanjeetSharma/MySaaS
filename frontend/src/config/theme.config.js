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

                "--surface": "#fafafa",
                "--surface-foreground": "#18181b",

                "--surface-elevated": "#ffffff",
                "--surface-elevated-foreground": "#09090b",

                "--surface-sunken": "#f2f2f3",
                "--surface-sunken-foreground": "#27272a",

                "--card": "#ffffff",
                "--card-foreground": "#09090b",

                "--popover": "#ffffff",
                "--popover-foreground": "#09090b",

                "--primary": "#18181b",
                "--primary-foreground": "#ffffff",

                "--secondary": "#f3f3f4",
                "--secondary-foreground": "#18181b",

                "--muted": "#f4f4f5",
                "--muted-foreground": "#71717a",

                "--accent": "#ffffff",
                "--accent-foreground": "#000000",

                "--destructive": "#dc2626",
                "--success": "#16a34a",
                "--warning": "#d97706",

                "--border-subtle": "#eeeeef",
                "--border": "#e1e1e3",
                "--border-strong": "#cfcfd2",

                "--input": "#e1e1e3",
                "--ring": "#18181b",

                "--subtle-foreground": "#52525b",

                "--hover": "#f0f0f1",
                "--hover-foreground": "#18181b",

                "--active": "#e2e2e4",
                "--active-foreground": "#09090b",

                "--selected": "#dcdcdf",
                "--selected-foreground": "#09090b",

                "--overlay": "rgba(9, 9, 11, 0.45)",

                "--radius": "0.5rem",

                "--sidebar": "#ffffff",
                "--sidebar-foreground": "#18181b",

                "--sidebar-primary": "#18181b",
                "--sidebar-primary-foreground": "#ffffff",

                "--sidebar-accent": "#ffffff",
                "--sidebar-accent-foreground": "#18181b",

                "--sidebar-border": "#e1e1e3",
                "--sidebar-ring": "#18181b",
            },

            dark: {
                "--background": "#000000",
                "--foreground": "#ffffff",

                "--surface": "#040404",
                "--surface-foreground": "#f5f5f5",

                "--surface-elevated": "#0c0c0d",
                "--surface-elevated-foreground": "#ffffff",

                "--surface-sunken": "#000000",
                "--surface-sunken-foreground": "#99999f",

                "--card": "#070707",
                "--card-foreground": "#ffffff",

                "--popover": "#0c0c0d",
                "--popover-foreground": "#ffffff",

                "--primary": "#ffffff",
                "--primary-foreground": "#000000",

                "--secondary": "#111112",
                "--secondary-foreground": "#ffffff",

                "--muted": "#151516",
                "--muted-foreground": "#a1a1a6",

                "--accent": "#ffffff",
                "--accent-foreground": "#000000",

                "--destructive": "#ef4444",
                "--success": "#22c55e",
                "--warning": "#f59e0b",

                "--border-subtle": "#0d0d0e",
                "--border": "#1b1b1d",
                "--border-strong": "#2d2d30",

                "--input": "#131314",
                "--ring": "#ffffff",

                "--subtle-foreground": "#d4d4d8",

                "--hover": "#121213",
                "--hover-foreground": "#ffffff",

                "--active": "#1b1b1d",
                "--active-foreground": "#ffffff",

                "--selected": "#242426",
                "--selected-foreground": "#ffffff",

                "--overlay": "rgba(0, 0, 0, 0.68)",

                "--radius": "0.5rem",

                "--sidebar": "#040404",
                "--sidebar-foreground": "#ffffff",

                "--sidebar-primary": "#ffffff",
                "--sidebar-primary-foreground": "#000000",

                "--sidebar-accent": "#111112",
                "--sidebar-accent-foreground": "#ffffff",

                "--sidebar-border": "#1b1b1d",
                "--sidebar-ring": "#ffffff",
            }
        }
    },
    [THEME_IDS.OCEAN_TEAL]: {
        name: "Ocean Teal",
        tier: "pro",
        mode: {
            light: {
                "--background": "#f6fffd",
                "--foreground": "#102a2a",

                "--surface": "#effaf8",
                "--surface-foreground": "#173b39",

                "--surface-elevated": "#ffffff",
                "--surface-elevated-foreground": "#102a2a",

                "--surface-sunken": "#e5f5f2",
                "--surface-sunken-foreground": "#315b57",

                "--card": "#ffffff",
                "--card-foreground": "#102a2a",

                "--popover": "#ffffff",
                "--popover-foreground": "#102a2a",

                "--primary": "#0f766e",
                "--primary-foreground": "#ffffff",

                "--secondary": "#dff4f0",
                "--secondary-foreground": "#145c56",

                "--muted": "#eaf8f5",
                "--muted-foreground": "#668783",

                "--accent": "#14b8a6",
                "--accent-foreground": "#ffffff",

                "--destructive": "#dc2626",
                "--success": "#059669",
                "--warning": "#d97706",

                "--border-subtle": "#e5f2ef",
                "--border": "#c8e2dd",
                "--border-strong": "#9bcac2",

                "--input": "#d8ebe7",
                "--ring": "#0f766e",

                "--subtle-foreground": "#4f716d",

                "--hover": "#e3f5f1",
                "--hover-foreground": "#145c56",

                "--active": "#d5ece7",
                "--active-foreground": "#0f514c",

                "--selected": "#c7e5df",
                "--selected-foreground": "#0a4f4a",

                "--overlay": "rgba(16, 42, 42, 0.45)",

                "--radius": "0.5rem",

                "--sidebar": "#fafffe",
                "--sidebar-foreground": "#102a2a",

                "--sidebar-primary": "#0f766e",
                "--sidebar-primary-foreground": "#ffffff",

                "--sidebar-accent": "#e8f7f4",
                "--sidebar-accent-foreground": "#0f766e",

                "--sidebar-border": "#c8e2dd",
                "--sidebar-ring": "#0f766e",
            },

            dark: {
                "--background": "#020707",
                "--foreground": "#ecfeff",

                "--surface": "#040c0c",
                "--surface-foreground": "#dff8f5",

                "--surface-elevated": "#081414",
                "--surface-elevated-foreground": "#ecfeff",

                "--surface-sunken": "#000000",
                "--surface-sunken-foreground": "#789d99",

                "--card": "#061010",
                "--card-foreground": "#ecfeff",

                "--popover": "#0a1717",
                "--popover-foreground": "#ecfeff",

                "--primary": "#2dd4bf",
                "--primary-foreground": "#001312",

                "--secondary": "#0d1c1c",
                "--secondary-foreground": "#d7faf6",

                "--muted": "#112121",
                "--muted-foreground": "#7da49f",

                "--accent": "#0d9488",
                "--accent-foreground": "#f0fdfa",

                "--destructive": "#ef4444",
                "--success": "#22c55e",
                "--warning": "#f59e0b",

                "--border-subtle": "#0a1818",
                "--border": "#173535",
                "--border-strong": "#285451",

                "--input": "#102424",
                "--ring": "#2dd4bf",

                "--subtle-foreground": "#a3c7c2",

                "--hover": "#0c1f1f",
                "--hover-foreground": "#e6fffb",

                "--active": "#112d2b",
                "--active-foreground": "#effffb",

                "--selected": "#153c38",
                "--selected-foreground": "#d9fffa",

                "--overlay": "rgba(2, 7, 7, 0.72)",

                "--radius": "0.5rem",

                "--sidebar": "#030909",
                "--sidebar-foreground": "#ecfeff",

                "--sidebar-primary": "#2dd4bf",
                "--sidebar-primary-foreground": "#001312",

                "--sidebar-accent": "#0e2423",
                "--sidebar-accent-foreground": "#5eead4",

                "--sidebar-border": "#173535",
                "--sidebar-ring": "#2dd4bf",
            }
        }
    },
    [THEME_IDS.MIDNIGHT_VIOLET]: {
        name: "Midnight Violet",
        tier: "pro",
        mode: {
            light: {
                "--background": "#fbfaff",
                "--foreground": "#160b2e",

                "--surface": "#f8f6ff",
                "--surface-foreground": "#241442",

                "--surface-elevated": "#ffffff",
                "--surface-elevated-foreground": "#160b2e",

                "--surface-sunken": "#f1edff",
                "--surface-sunken-foreground": "#4c3670",

                "--card": "#ffffff",
                "--card-foreground": "#160b2e",

                "--popover": "#ffffff",
                "--popover-foreground": "#160b2e",

                "--primary": "#7c3aed",
                "--primary-foreground": "#ffffff",

                "--secondary": "#ede9fe",
                "--secondary-foreground": "#3b176f",

                "--muted": "#f5f3ff",
                "--muted-foreground": "#777184",

                "--accent": "#8b5cf6",
                "--accent-foreground": "#ffffff",

                "--destructive": "#dc2626",
                "--success": "#059669",
                "--warning": "#d97706",

                "--border-subtle": "#f0ecfa",
                "--border": "#e3ddf0",
                "--border-strong": "#cfc3e3",

                "--input": "#e4dff0",
                "--ring": "#8b5cf6",

                "--subtle-foreground": "#5f526f",

                "--hover": "#f0ebff",
                "--hover-foreground": "#4c1d95",

                "--active": "#e5dcff",
                "--active-foreground": "#3b176f",

                "--selected": "#ddd0ff",
                "--selected-foreground": "#4c1d95",

                "--overlay": "rgba(22, 11, 46, 0.45)",

                "--radius": "0.5rem",

                "--sidebar": "#fdfcff",
                "--sidebar-foreground": "#160b2e",

                "--sidebar-primary": "#7c3aed",
                "--sidebar-primary-foreground": "#ffffff",

                "--sidebar-accent": "#f3efff",
                "--sidebar-accent-foreground": "#3b176f",

                "--sidebar-border": "#e3ddf0",
                "--sidebar-ring": "#8b5cf6",
            },

            dark: {
                "--background": "#020008",
                "--foreground": "#f5f3ff",

                "--surface": "#06020f",
                "--surface-foreground": "#eee9ff",

                "--surface-elevated": "#0d0619",
                "--surface-elevated-foreground": "#faf8ff",

                "--surface-sunken": "#010005",
                "--surface-sunken-foreground": "#968ca8",

                "--card": "#0a0414",
                "--card-foreground": "#f5f3ff",

                "--popover": "#10071d",
                "--popover-foreground": "#f5f3ff",

                "--primary": "#a78bfa",
                "--primary-foreground": "#090014",

                "--secondary": "#181028",
                "--secondary-foreground": "#ede9fe",

                "--muted": "#120c20",
                "--muted-foreground": "#a8a0bd",

                "--accent": "#7c3aed",
                "--accent-foreground": "#ffffff",

                "--destructive": "#ef4444",
                "--success": "#22c55e",
                "--warning": "#f59e0b",

                "--border-subtle": "#160c28",
                "--border": "#24163f",
                "--border-strong": "#3b2460",

                "--input": "#1a122e",
                "--ring": "#a78bfa",

                "--subtle-foreground": "#c0b8d1",

                "--hover": "#160c26",
                "--hover-foreground": "#f5f3ff",

                "--active": "#21113a",
                "--active-foreground": "#faf8ff",

                "--selected": "#2d1550",
                "--selected-foreground": "#f3eaff",

                "--overlay": "rgba(2, 0, 8, 0.72)",

                "--radius": "0.5rem",

                "--sidebar": "#06020f",
                "--sidebar-foreground": "#f5f3ff",

                "--sidebar-primary": "#a78bfa",
                "--sidebar-primary-foreground": "#090014",

                "--sidebar-accent": "#140d24",
                "--sidebar-accent-foreground": "#ede9fe",

                "--sidebar-border": "#24163f",
                "--sidebar-ring": "#a78bfa",
            }
        }
    },
    [THEME_IDS.FOREST_WOOD]: {
        name: "Forest Amber",
        tier: "pro",
        mode: {
            light: {
                "--background": "#f8faf4",
                "--foreground": "#1b2617",

                "--surface": "#f1f6eb",
                "--surface-foreground": "#25331f",

                "--surface-elevated": "#ffffff",
                "--surface-elevated-foreground": "#1b2617",

                "--surface-sunken": "#e7efde",
                "--surface-sunken-foreground": "#46563b",

                "--card": "#ffffff",
                "--card-foreground": "#1b2617",

                "--popover": "#ffffff",
                "--popover-foreground": "#1b2617",

                "--primary": "#4f7f2f",
                "--primary-foreground": "#ffffff",

                "--secondary": "#e5eedc",
                "--secondary-foreground": "#26371e",

                "--muted": "#edf3e7",
                "--muted-foreground": "#68775d",

                "--accent": "#a85f0a",
                "--accent-foreground": "#ffffff",

                "--destructive": "#dc2626",
                "--success": "#16a34a",
                "--warning": "#c87912",

                "--border-subtle": "#e9eee3",
                "--border": "#d5dfc9",
                "--border-strong": "#b9c9aa",

                "--input": "#d9e3ce",
                "--ring": "#a85f0a",

                "--subtle-foreground": "#536249",

                "--hover": "#e8f0df",
                "--hover-foreground": "#304521",

                "--active": "#dce8d1",
                "--active-foreground": "#263b1c",

                "--selected": "#d0dfc2",
                "--selected-foreground": "#294119",

                "--overlay": "rgba(27, 38, 23, 0.45)",

                "--radius": "0.5rem",

                "--sidebar": "#fcfdf9",
                "--sidebar-foreground": "#1b2617",

                "--sidebar-primary": "#4f7f2f",
                "--sidebar-primary-foreground": "#ffffff",

                "--sidebar-accent": "#edf3e6",
                "--sidebar-accent-foreground": "#304521",

                "--sidebar-border": "#d5dfc9",
                "--sidebar-ring": "#a85f0a",
            },

            dark: {
                "--background": "#050804",
                "--foreground": "#eef6e8",

                "--surface": "#091008",
                "--surface-foreground": "#dfead8",

                "--surface-elevated": "#10190c",
                "--surface-elevated-foreground": "#f2f8ed",

                "--surface-sunken": "#020402",
                "--surface-sunken-foreground": "#87977e",

                "--card": "#0c1409",
                "--card-foreground": "#eef6e8",

                "--popover": "#111b0d",
                "--popover-foreground": "#f2f8ed",

                "--primary": "#84cc16",
                "--primary-foreground": "#081005",

                "--secondary": "#172311",
                "--secondary-foreground": "#e7f2df",

                "--muted": "#121b0e",
                "--muted-foreground": "#91a38a",

                "--accent": "#b87512",
                "--accent-foreground": "#fff6df",

                "--destructive": "#ef4444",
                "--success": "#22c55e",
                "--warning": "#d9911b",

                "--border-subtle": "#172116",
                "--border": "#26341f",
                "--border-strong": "#3a4a2d",

                "--input": "#1a2514",
                "--ring": "#b87512",

                "--subtle-foreground": "#b8c7ae",

                "--hover": "#172310",
                "--hover-foreground": "#f0f7e9",

                "--active": "#213018",
                "--active-foreground": "#f4faed",

                "--selected": "#2b3d1d",
                "--selected-foreground": "#eff9e8",

                "--overlay": "rgba(5, 8, 4, 0.72)",

                "--radius": "0.5rem",

                "--sidebar": "#080d06",
                "--sidebar-foreground": "#eef6e8",

                "--sidebar-primary": "#84cc16",
                "--sidebar-primary-foreground": "#081005",

                "--sidebar-accent": "#14200f",
                "--sidebar-accent-foreground": "#e7f2df",

                "--sidebar-border": "#26341f",
                "--sidebar-ring": "#b87512",
            }
        }
    },
    [THEME_IDS.VOLCANIC]: {
        name: "Volcanic",
        tier: "pro",
        mode: {
            light: {
                "--background": "#fdf7f4",
                "--foreground": "#2b140e",

                "--surface": "#f8ece6",
                "--surface-foreground": "#361b13",

                "--surface-elevated": "#ffffff",
                "--surface-elevated-foreground": "#2b140e",

                "--surface-sunken": "#f0dfd7",
                "--surface-sunken-foreground": "#633c30",

                "--card": "#ffffff",
                "--card-foreground": "#2b140e",

                "--popover": "#ffffff",
                "--popover-foreground": "#2b140e",

                "--primary": "#c83318",
                "--primary-foreground": "#ffffff",

                "--secondary": "#f4dfd8",
                "--secondary-foreground": "#6b2313",

                "--muted": "#f2e4de",
                "--muted-foreground": "#85584c",

                "--accent": "#ea580c",
                "--accent-foreground": "#ffffff",

                "--destructive": "#b91c1c",
                "--success": "#15803d",
                "--warning": "#b45309",

                "--border-subtle": "#faede7",
                "--border": "#e8cfc4",
                "--border-strong": "#cfaaa0",

                "--input": "#f4dfd8",
                "--ring": "#c83318",

                "--subtle-foreground": "#6e4b41",

                "--hover": "#faeae3",
                "--hover-foreground": "#6b2313",

                "--active": "#f0d5ca",
                "--active-foreground": "#521609",

                "--selected": "#ebd0c4",
                "--selected-foreground": "#4a1206",

                "--overlay": "rgba(43, 20, 14, 0.45)",

                "--radius": "0.5rem",

                "--sidebar": "#f8ede7",
                "--sidebar-foreground": "#2b140e",

                "--sidebar-primary": "#c83318",
                "--sidebar-primary-foreground": "#ffffff",

                "--sidebar-accent": "#edd3c7",
                "--sidebar-accent-foreground": "#6b2313",

                "--sidebar-border": "#e8cfc4",
                "--sidebar-ring": "#c83318",
            },

            dark: {
                "--background": "#120502",
                "--foreground": "#fceee9",

                "--surface": "#1c0b06",
                "--surface-foreground": "#f8ded5",

                "--surface-elevated": "#261009",
                "--surface-elevated-foreground": "#ffffff",

                "--surface-sunken": "#0a0200",
                "--surface-sunken-foreground": "#a47366",

                "--card": "#180804",
                "--card-foreground": "#fceee9",

                "--popover": "#230e07",
                "--popover-foreground": "#ffffff",

                "--primary": "#ff4d2e",
                "--primary-foreground": "#260600",

                "--secondary": "#2e120a",
                "--secondary-foreground": "#f9ded6",

                "--muted": "#230e07",
                "--muted-foreground": "#b57d6f",

                "--accent": "#f97316",
                "--accent-foreground": "#1c0702",

                "--destructive": "#ef4444",
                "--success": "#22c55e",
                "--warning": "#f59e0b",

                "--border-subtle": "#2b0f07",
                "--border": "#47190d",
                "--border-strong": "#692514",

                "--input": "#2c1109",
                "--ring": "#ff4d2e",

                "--subtle-foreground": "#cfa093",

                "--hover": "#2e120a",
                "--hover-foreground": "#fff1ec",

                "--active": "#3f190e",
                "--active-foreground": "#ffffff",

                "--selected": "#4a1c10",
                "--selected-foreground": "#ffffff",

                "--overlay": "rgba(10, 2, 0, 0.75)",

                "--radius": "0.5rem",

                "--sidebar": "#0e0301",
                "--sidebar-foreground": "#fceee9",

                "--sidebar-primary": "#ff4d2e",
                "--sidebar-primary-foreground": "#260600",

                "--sidebar-accent": "#260d06",
                "--sidebar-accent-foreground": "#ff9a85",

                "--sidebar-border": "#3a1309",
                "--sidebar-ring": "#ff4d2e",
            }
        }
    },
    [THEME_IDS.COFFEE]: {
        name: "Coffee",
        tier: "pro",
        mode: {
            light: {
                "--background": "#fffbf3",
                "--foreground": "#2b1a12",

                "--surface": "#fff3e2",
                "--surface-foreground": "#3a2418",

                "--surface-elevated": "#fffefa",
                "--surface-elevated-foreground": "#2b1a12",

                "--surface-sunken": "#f0dcc0",
                "--surface-sunken-foreground": "#62442e",

                "--card": "#fffefa",
                "--card-foreground": "#2b1a12",

                "--popover": "#fffefa",
                "--popover-foreground": "#2b1a12",

                "--primary": "#5a301c",
                "--primary-foreground": "#fffaf1",

                "--secondary": "#efd5b3",
                "--secondary-foreground": "#402515",

                "--muted": "#f7e5cc",
                "--muted-foreground": "#795b43",

                "--accent": "#f7e8d0",
                "--accent-foreground": "#452716",

                "--destructive": "#dc2626",
                "--success": "#16a34a",
                "--warning": "#c87922",

                "--border-subtle": "#f5e8d6",
                "--border": "#e2c8a8",
                "--border-strong": "#c19a70",

                "--input": "#e2c8a8",
                "--ring": "#8b5734",

                "--subtle-foreground": "#674a34",

                "--hover": "#f3dfc6",
                "--hover-foreground": "#442817",

                "--active": "#e8cda9",
                "--active-foreground": "#3a2114",

                "--selected": "#ddbd93",
                "--selected-foreground": "#321b10",

                "--overlay": "rgba(43, 26, 18, 0.48)",

                "--radius": "0.5rem",

                "--sidebar": "#fffcf6",
                "--sidebar-foreground": "#2b1a12",

                "--sidebar-primary": "#5a301c",
                "--sidebar-primary-foreground": "#fffaf1",

                "--sidebar-accent": "#f8e9d3",
                "--sidebar-accent-foreground": "#452716",

                "--sidebar-border": "#e2c8a8",
                "--sidebar-ring": "#8b5734",
            },

            dark: {
                "--background": "#070302",
                "--foreground": "#fff8ed",

                "--surface": "#100704",
                "--surface-foreground": "#f6e5d0",

                "--surface-elevated": "#1b0d07",
                "--surface-elevated-foreground": "#fffaf2",

                "--surface-sunken": "#030201",
                "--surface-sunken-foreground": "#8e6b51",

                "--card": "#140905",
                "--card-foreground": "#fff8ed",

                "--popover": "#211108",
                "--popover-foreground": "#fffaf2",

                "--primary": "#8b5734",
                "--primary-foreground": "#fffaf1",

                "--secondary": "#2b160b",
                "--secondary-foreground": "#f7e5cf",

                "--muted": "#211107",
                "--muted-foreground": "#a98567",

                "--accent": "#6b472d",
                "--accent-foreground": "#fff4e2",

                "--destructive": "#ef4444",
                "--success": "#22c55e",
                "--warning": "#eab308",

                "--border-subtle": "#241207",
                "--border": "#3a1f11",
                "--border-strong": "#56331d",

                "--input": "#2d180c",
                "--ring": "#d6ad82",

                "--subtle-foreground": "#c6a585",

                "--hover": "#2b160b",
                "--hover-foreground": "#fff6e9",

                "--active": "#3b2112",
                "--active-foreground": "#fff9ef",

                "--selected": "#4b2b18",
                "--selected-foreground": "#fff0dd",

                "--overlay": "rgba(7, 3, 2, 0.76)",

                "--radius": "0.5rem",

                "--sidebar": "#050201",
                "--sidebar-foreground": "#fff8ed",

                "--sidebar-primary": "#8b5734",
                "--sidebar-primary-foreground": "#fffaf1",

                "--sidebar-accent": "#211107",
                "--sidebar-accent-foreground": "#f7e5cf",

                "--sidebar-border": "#3a1f11",
                "--sidebar-ring": "#d6ad82",
            }
        }
    },
    [THEME_IDS.SAKURA]: {
        name: "Sakura",
        tier: "pro",
        mode: {
            light: {
                "--background": "#fff8fb",
                "--foreground": "#4a2838",

                "--surface": "#fff0f5",
                "--surface-foreground": "#583142",

                "--surface-elevated": "#fffdfd",
                "--surface-elevated-foreground": "#4a2838",

                "--surface-sunken": "#fce4ec",
                "--surface-sunken-foreground": "#7a4c5f",

                "--card": "#ffffff",
                "--card-foreground": "#4a2838",

                "--popover": "#ffffff",
                "--popover-foreground": "#4a2838",

                "--primary": "#e96b94",
                "--primary-foreground": "#ffffff",

                "--secondary": "#f9dce6",
                "--secondary-foreground": "#5b3042",

                "--muted": "#fcecf2",
                "--muted-foreground": "#927181",

                "--accent": "#f3a1ba",
                "--accent-foreground": "#5a263b",

                "--destructive": "#dc2626",
                "--success": "#16a34a",
                "--warning": "#d97706",

                "--border-subtle": "#f9e8ee",
                "--border": "#f1d3de",
                "--border-strong": "#dfb2c2",

                "--input": "#efd2dc",
                "--ring": "#e96b94",

                "--subtle-foreground": "#704b5c",

                "--hover": "#fbe7ee",
                "--hover-foreground": "#6a3047",

                "--active": "#f6d8e2",
                "--active-foreground": "#5d293e",

                "--selected": "#f0cbd8",
                "--selected-foreground": "#562438",

                "--overlay": "rgba(74, 40, 56, 0.42)",

                "--radius": "0.5rem",

                "--sidebar": "#fffafb",
                "--sidebar-foreground": "#4a2838",

                "--sidebar-primary": "#e96b94",
                "--sidebar-primary-foreground": "#ffffff",

                "--sidebar-accent": "#fcecf2",
                "--sidebar-accent-foreground": "#633147",

                "--sidebar-border": "#f1d3de",
                "--sidebar-ring": "#e96b94",
            },

            dark: {
                "--background": "#080306",
                "--foreground": "#ffeaf0",

                "--surface": "#0e070b",
                "--surface-foreground": "#f7dce4",

                "--surface-elevated": "#1b0d14",
                "--surface-elevated-foreground": "#fff1f5",

                "--surface-sunken": "#050204",
                "--surface-sunken-foreground": "#9f7283",

                "--card": "#14090f",
                "--card-foreground": "#ffeaf0",

                "--popover": "#21111a",
                "--popover-foreground": "#fff1f5",

                "--primary": "#ff80ab",
                "--primary-foreground": "#260b16",

                "--secondary": "#321a25",
                "--secondary-foreground": "#f8dce5",

                "--muted": "#25131c",
                "--muted-foreground": "#b8899a",

                "--accent": "#c94f79",
                "--accent-foreground": "#fff0f5",

                "--destructive": "#ef4444",
                "--success": "#22c55e",
                "--warning": "#f59e0b",

                "--border-subtle": "#2b161f",
                "--border": "#3e202e",
                "--border-strong": "#5a2d40",

                "--input": "#2f1823",
                "--ring": "#ff80ab",

                "--subtle-foreground": "#d0a7b5",

                "--hover": "#321a25",
                "--hover-foreground": "#ffeaf0",

                "--active": "#40202e",
                "--active-foreground": "#fff0f5",

                "--selected": "#51283b",
                "--selected-foreground": "#ffe8ef",

                "--overlay": "rgba(8, 3, 6, 0.76)",

                "--radius": "0.5rem",

                "--sidebar": "#060205",
                "--sidebar-foreground": "#ffeaf0",

                "--sidebar-primary": "#ff80ab",
                "--sidebar-primary-foreground": "#260b16",

                "--sidebar-accent": "#24131b",
                "--sidebar-accent-foreground": "#f8dce5",

                "--sidebar-border": "#3e202e",
                "--sidebar-ring": "#ff80ab",
            }
        }
    },
    [THEME_IDS.PLATINUM]: {
        name: "Platinum",
        tier: "pro",
        mode: {
            light: {
                "--background": "#f5f7f9",
                "--foreground": "#171b21",

                "--surface": "#eef1f4",
                "--surface-foreground": "#252b33",

                "--surface-elevated": "#ffffff",
                "--surface-elevated-foreground": "#171b21",

                "--surface-sunken": "#e6eaee",
                "--surface-sunken-foreground": "#4c5561",

                "--card": "#ffffff",
                "--card-foreground": "#171b21",

                "--popover": "#ffffff",
                "--popover-foreground": "#171b21",

                "--primary": "#4b5563",
                "--primary-foreground": "#ffffff",

                "--secondary": "#e2e6eb",
                "--secondary-foreground": "#252b33",

                "--muted": "#edf0f3",
                "--muted-foreground": "#737c87",

                "--accent": "#64707d",
                "--accent-foreground": "#ffffff",

                "--destructive": "#dc2626",
                "--success": "#16a34a",
                "--warning": "#d97706",

                "--border-subtle": "#edf0f2",
                "--border": "#d2d8de",
                "--border-strong": "#b5bec8",

                "--input": "#d3d9df",
                "--ring": "#64707d",

                "--subtle-foreground": "#59636e",

                "--hover": "#e9edf1",
                "--hover-foreground": "#252b33",

                "--active": "#dfe4e9",
                "--active-foreground": "#1f252c",

                "--selected": "#d5dce2",
                "--selected-foreground": "#1c232b",

                "--overlay": "rgba(23, 27, 33, 0.45)",

                "--radius": "0.5rem",

                "--sidebar": "#fafbfc",
                "--sidebar-foreground": "#171b21",

                "--sidebar-primary": "#4b5563",
                "--sidebar-primary-foreground": "#ffffff",

                "--sidebar-accent": "#eef1f4",
                "--sidebar-accent-foreground": "#252b33",

                "--sidebar-border": "#d2d8de",
                "--sidebar-ring": "#64707d",
            },

            dark: {
                "--background": "#080b0f",
                "--foreground": "#f1f4f7",

                "--surface": "#0d1116",
                "--surface-foreground": "#dfe4e9",

                "--surface-elevated": "#151a21",
                "--surface-elevated-foreground": "#f5f7f9",

                "--surface-sunken": "#05070a",
                "--surface-sunken-foreground": "#89939e",

                "--card": "#11161c",
                "--card-foreground": "#f1f4f7",

                "--popover": "#171d24",
                "--popover-foreground": "#f5f7f9",

                "--primary": "#c3cbd4",
                "--primary-foreground": "#0a0d11",

                "--secondary": "#171e26",
                "--secondary-foreground": "#e8edf1",

                "--muted": "#141a21",
                "--muted-foreground": "#8d98a4",

                "--accent": "#8995a2",
                "--accent-foreground": "#080b0f",

                "--destructive": "#ef4444",
                "--success": "#22c55e",
                "--warning": "#f59e0b",

                "--border-subtle": "#12171d",
                "--border": "#202831",
                "--border-strong": "#303b47",

                "--input": "#171e26",
                "--ring": "#d5dce3",

                "--subtle-foreground": "#b3bcc5",

                "--hover": "#182028",
                "--hover-foreground": "#f1f4f7",

                "--active": "#202a34",
                "--active-foreground": "#f7f9fb",

                "--selected": "#293540",
                "--selected-foreground": "#f3f6f8",

                "--overlay": "rgba(8, 11, 15, 0.72)",

                "--radius": "0.5rem",

                "--sidebar": "#06090c",
                "--sidebar-foreground": "#f1f4f7",

                "--sidebar-primary": "#c3cbd4",
                "--sidebar-primary-foreground": "#0a0d11",

                "--sidebar-accent": "#12181f",
                "--sidebar-accent-foreground": "#e8edf1",

                "--sidebar-border": "#202831",
                "--sidebar-ring": "#d5dce3",
            }
        }
    },
    [THEME_IDS.SKYLINE_AFTERDARK]: {
        name: "Skyline Afterdark",
        tier: "pro",
        mode: {
            light: {
                "--background": "#F7FBFF",
                "--foreground": "#10234A",

                "--surface": "#EEF7FF",
                "--surface-foreground": "#18345F",

                "--surface-elevated": "#FFFFFF",
                "--surface-elevated-foreground": "#10234A",

                "--surface-sunken": "#E2F0FC",
                "--surface-sunken-foreground": "#46658A",

                "--card": "#FFFFFF",
                "--card-foreground": "#10234A",

                "--popover": "#FFFFFF",
                "--popover-foreground": "#10234A",

                "--primary": "#7692FF",
                "--primary-foreground": "#FFFFFF",

                "--secondary": "#DDEBFA",
                "--secondary-foreground": "#183A69",

                "--muted": "#EAF4FC",
                "--muted-foreground": "#647E9E",

                "--accent": "#ABD2FA",
                "--accent-foreground": "#12345D",

                "--destructive": "#DC2626",
                "--success": "#16A34A",
                "--warning": "#D97706",

                "--border-subtle": "#E5F1FA",
                "--border": "#C8DEEF",
                "--border-strong": "#A8C7DF",

                "--input": "#C8DEEF",
                "--ring": "#7692FF",

                "--subtle-foreground": "#526F91",

                "--hover": "#E0EFFC",
                "--hover-foreground": "#163C68",

                "--active": "#D1E7F8",
                "--active-foreground": "#12345B",

                "--selected": "#C3DDF3",
                "--selected-foreground": "#102F55",

                "--overlay": "rgba(16, 35, 74, 0.42)",

                "--radius": "0.5rem",

                "--sidebar": "#FBFDFF",
                "--sidebar-foreground": "#10234A",

                "--sidebar-primary": "#7692FF",
                "--sidebar-primary-foreground": "#FFFFFF",

                "--sidebar-accent": "#EAF4FC",
                "--sidebar-accent-foreground": "#183A69",

                "--sidebar-border": "#C8DEEF",
                "--sidebar-ring": "#7692FF",
            },

            dark: {
                "--background": "#02050D",
                "--foreground": "#EAF1FF",

                "--surface": "#040A17",
                "--surface-foreground": "#DCE7FF",

                "--surface-elevated": "#071027",
                "--surface-elevated-foreground": "#F2F6FF",

                "--surface-sunken": "#010207",
                "--surface-sunken-foreground": "#68799F",

                "--card": "#050C1C",
                "--card-foreground": "#EAF1FF",

                "--popover": "#09132B",
                "--popover-foreground": "#F2F6FF",

                "--primary": "#1B2CC1",
                "--primary-foreground": "#FFFFFF",

                "--secondary": "#080F24",
                "--secondary-foreground": "#DCE6FF",

                "--muted": "#060C1A",
                "--muted-foreground": "#8294BA",

                "--accent": "#1B2CC1",
                "--accent-foreground": "#FFFFFF",

                "--destructive": "#EF4444",
                "--success": "#22C55E",
                "--warning": "#F59E0B",

                "--border-subtle": "#080F20",
                "--border": "#101D38",
                "--border-strong": "#192B50",

                "--input": "#091329",
                "--ring": "#7692FF",

                "--subtle-foreground": "#A7B7D5",

                "--hover": "#0A152E",
                "--hover-foreground": "#EDF3FF",

                "--active": "#0D1C3B",
                "--active-foreground": "#F5F8FF",

                "--selected": "#132957",
                "--selected-foreground": "#EDF3FF",

                "--overlay": "rgba(1, 2, 7, 0.82)",

                "--radius": "0.5rem",

                "--sidebar": "#01040A",
                "--sidebar-foreground": "#EAF1FF",

                "--sidebar-primary": "#1B2CC1",
                "--sidebar-primary-foreground": "#FFFFFF",

                "--sidebar-accent": "#050B18",
                "--sidebar-accent-foreground": "#DCE6FF",

                "--sidebar-border": "#101D38",
                "--sidebar-ring": "#7692FF",
            }
        }
    },
    [THEME_IDS.BUMBLEBEE]: {
        name: "Bumblebee",
        tier: "pro",
        mode: {
            light: {
                "--background": "#FFFFFF",
                "--foreground": "#0A0A0A",

                "--surface": "#F4F4F5",
                "--surface-foreground": "#18181B",

                "--surface-elevated": "#FFFFFF",
                "--surface-elevated-foreground": "#0A0A0A",

                "--surface-sunken": "#E4E4E7",
                "--surface-sunken-foreground": "#52525B",

                "--card": "#FFFFFF",
                "--card-foreground": "#0A0A0A",

                "--popover": "#FFFFFF",
                "--popover-foreground": "#0A0A0A",

                "--primary": "#0A0A0A",
                "--primary-foreground": "#FFD000",

                "--secondary": "#FFFBEB",
                "--secondary-foreground": "#78350F",

                "--muted": "#F4F4F5",
                "--muted-foreground": "#71717A",

                "--accent": "#FFD000",
                "--accent-foreground": "#000000",

                "--destructive": "#DC2626",
                "--success": "#16A34A",
                "--warning": "#D97706",

                "--border-subtle": "#F4F4F5",
                "--border": "#E4E4E7",
                "--border-strong": "#A1A1AA",

                "--input": "#E4E4E7",
                "--ring": "#FFD000",

                "--subtle-foreground": "#52525B",

                "--hover": "#FEF3C7",
                "--hover-foreground": "#000000",

                "--active": "#FDE68A",
                "--active-foreground": "#000000",

                "--selected": "#FDE047",
                "--selected-foreground": "#000000",

                "--overlay": "rgba(0, 0, 0, 0.60)",

                "--radius": "0.5rem",

                "--sidebar": "#FAFAFA",
                "--sidebar-foreground": "#0A0A0A",

                "--sidebar-primary": "#0A0A0A",
                "--sidebar-primary-foreground": "#FFD000",

                "--sidebar-accent": "#FEF3C7",
                "--sidebar-accent-foreground": "#000000",

                "--sidebar-border": "#E4E4E7",
                "--sidebar-ring": "#FFD000",
            },

            dark: {
                "--background": "#000000",
                "--foreground": "#FFFFFF",

                "--surface": "#080808",
                "--surface-foreground": "#F4F4F5",

                "--surface-elevated": "#121212",
                "--surface-elevated-foreground": "#FFFFFF",

                "--surface-sunken": "#000000",
                "--surface-sunken-foreground": "#71717A",

                "--card": "#0A0A0A",
                "--card-foreground": "#FFFFFF",

                "--popover": "#121212",
                "--popover-foreground": "#FFFFFF",

                "--primary": "#FFD000",
                "--primary-foreground": "#000000",

                "--secondary": "#171717",
                "--secondary-foreground": "#FFD000",

                "--muted": "#121212",
                "--muted-foreground": "#8E8E93",

                "--accent": "#FFE500",
                "--accent-foreground": "#000000",

                "--destructive": "#EF4444",
                "--success": "#22C55E",
                "--warning": "#F59E0B",

                "--border-subtle": "#141414",
                "--border": "#242424",
                "--border-strong": "#383838",

                "--input": "#171717",
                "--ring": "#FFD000",

                "--subtle-foreground": "#A1A1AA",

                "--hover": "#1A1A1A",
                "--hover-foreground": "#FFD000",

                "--active": "#262626",
                "--active-foreground": "#FFFFFF",

                "--selected": "#FFD000",
                "--selected-foreground": "#000000",

                "--overlay": "rgba(0, 0, 0, 0.85)",

                "--radius": "0.5rem",

                "--sidebar": "#050505",
                "--sidebar-foreground": "#FFFFFF",

                "--sidebar-primary": "#FFD000",
                "--sidebar-primary-foreground": "#000000",

                "--sidebar-accent": "#141414",
                "--sidebar-accent-foreground": "#FFD000",

                "--sidebar-border": "#242424",
                "--sidebar-ring": "#FFD000",
            }
        }
    },
};