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

const createIcon = (Icon, props = {}) =>
    React.createElement(Icon, {
        size: iconSize,
        strokeWidth: 2.25,
        ...props,
    });

export const toastIconRegistry = {
    success: createIcon(CheckCircle2),
    error: createIcon(XCircle),
    warning: createIcon(AlertTriangle),
    info: createIcon(Info),

    palette: createIcon(Palette),
    mail: createIcon(Mail),
    iosmail: createIcon(IoIosMail),
    delete: createIcon(Trash2),
    trash: createIcon(Trash2),
    security: createIcon(ShieldCheck),
    shield: createIcon(ShieldCheck),
    loading: createIcon(LoaderCircle, { className: "animate-spin" }),
    calendar: createIcon(Calendar),
    notification: createIcon(Bell),
    bell: createIcon(Bell),
    user: createIcon(User),
    settings: createIcon(Settings),
    sparkles: createIcon(Sparkles),
};

export const resolveToastIcon = (icon) => {
    if (!icon) return undefined;
    if (typeof icon !== "string") return icon;

    return toastIconRegistry[icon.trim().toLowerCase()];
};

export const toastIcon = (icon, options = {}) => ({
    ...options,
    icon: resolveToastIcon(icon),
});

export default resolveToastIcon;
