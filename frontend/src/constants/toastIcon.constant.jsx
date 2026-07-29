import React from "react";
import {
    AlertTriangle,
    Bell,
    Calendar,
    CheckCircle2,
    Info,
    LoaderCircle,
    Mail,
    Palette,
    Settings,
    ShieldCheck,
    Sparkles,
    Trash2,
    User,
    XCircle,
} from "lucide-react";
import { IoIosMail } from "react-icons/io";

const iconSize = 18;
const strokeWidth = 2.25;

export const toastIconRegistry = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,

    palette: Palette,
    mail: Mail,
    iosmail: IoIosMail,
    delete: Trash2,
    trash: Trash2,
    security: ShieldCheck,
    shield: ShieldCheck,
    loading: LoaderCircle,
    calendar: Calendar,
    notification: Bell,
    bell: Bell,
    user: User,
    settings: Settings,
    sparkles: Sparkles,
};

export const resolveToastIcon = (icon, options = {}) => {
    if (!icon) return undefined;

    // allow direct JSX
    if (React.isValidElement(icon)) return icon;

    // allow custom React component
    if (typeof icon === "function") {
        const CustomIcon = icon;
        return (
            <CustomIcon
                size={options.size ?? iconSize}
                strokeWidth={options.strokeWidth ?? strokeWidth}
                className={options.className}
            />
        );
    }

    if (typeof icon !== "string") return undefined;

    const Icon = toastIconRegistry[icon.trim().toLowerCase()];
    if (!Icon) return undefined;

    return (
        <Icon
            size={options.size ?? iconSize}
            strokeWidth={options.strokeWidth ?? strokeWidth}
            className={options.className}
        />
    );
};

export const toastIcon = (icon, options = {}) =>
    resolveToastIcon(icon, options);

// USAGE EXAMPLES

/*

1. Default icon
---------------------------------------
toast.success("Saved!", {
    icon: toastIcon("success"),
});


2. Named icon
---------------------------------------
toast.success("Profile updated", {
    icon: toastIcon("user"),
});


3. Custom size
---------------------------------------
toast.success("Big icon!", {
    icon: toastIcon("sparkles", { size: 26 }),
});


4. Custom stroke width
---------------------------------------
toast.success("Bold icon!", {
    icon: toastIcon("warning", { strokeWidth: 3 }),
});


5. Custom class (animation etc.)
---------------------------------------
toast.loading("Loading...", {
    icon: toastIcon("loading", {
        className: "animate-spin text-blue-500",
    }),
});


6. Passing direct Lucide component
---------------------------------------
toast.success("Custom", {
    icon: toastIcon(CheckCircle2),
});


7. Passing JSX directly
---------------------------------------
toast.success("JSX icon", {
    icon: <CheckCircle2 size={20} />,
});

*/