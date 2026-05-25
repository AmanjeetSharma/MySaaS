import { toast } from "sonner";
import {
    CheckCircle2,
    AlertCircle,
    AlertTriangle,
    Info,
    Palette,
} from "lucide-react";

/**
 * ICON SYSTEM (design-system layer)
 */
const ICON_MAP = {
    success: {
        icon: CheckCircle2,
        className: "text-primary",
        size: "h-5 w-5",
    },
    error: {
        icon: AlertCircle,
        className: "text-destructive",
        size: "h-5 w-5",
    },
    warning: {
        icon: AlertTriangle,
        className: "text-amber-500",
        size: "h-4 w-4",
    },
    info: {
        icon: Info,
        className: "text-muted-foreground",
        size: "h-5 w-5",
    },
    palette: {
        icon: Palette,
        className: "text-primary",
        size: "h-4 w-4",
    },
};

/**
 * DEFAULT CONFIG
 */
const TOAST_DEFAULT_CONFIG = {
    duration: 4000,
    position: "top-center",
    className: "group font-sans antialiased",
    classNames: {
        toast:
            "w-full border p-4 flex gap-3 rounded-xl shadow-lg backdrop-blur-md bg-background/95",
        title: "text-sm font-semibold tracking-tight text-foreground",
        description:
            "text-xs text-muted-foreground font-normal leading-relaxed mt-0.5",
        actionButton:
            "bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 rounded-md hover:bg-primary/90",
        cancelButton:
            "bg-muted text-muted-foreground text-xs font-medium px-3 py-1.5 rounded-md hover:bg-muted/80",
    },
};

/**
 * VARIANTS (NO JSX HERE)
 */
const TOAST_VARIANTS = {
    success: { icon: "success", classNames: { toast: "border-emerald-500/15 bg-gradient-to-r from-emerald-500/[0.02] to-transparent" } },
    error: { icon: "error", classNames: { toast: "border-red-500/15 bg-gradient-to-r from-red-500/[0.02] to-transparent" } },
    warning: { icon: "warning", classNames: { toast: "border-amber-500/15 bg-gradient-to-r from-amber-500/[0.02] to-transparent" } },
    info: { icon: "info", classNames: { toast: "border-blue-500/15 bg-gradient-to-r from-blue-500/[0.02] to-transparent" } },
};

/**
 * 🔥 FIXED ICON RESOLVER (IMPORTANT PART)
 */
const resolveIcon = (iconKey) => {
    if (!iconKey) return null;

    const iconConfig = ICON_MAP[iconKey];

    if (!iconConfig) {
        console.warn(`[AppToast] Unknown icon key: ${iconKey}`);
        return null;
    }

    const Icon = iconConfig.icon;

    return (
        <Icon
            className={`${iconConfig.size || "h-5 w-5"} shrink-0 ${iconConfig.className || ""}`}
        />
    );
};

/**
 * CORE TOAST ENGINE
 */
const triggerToast = (type, message, options = {}) => {
    const variant = TOAST_VARIANTS[type] || {};

    const iconKey = options.icon || variant.icon;

    const icon = resolveIcon(iconKey);

    const mergedClassNames = {
        ...TOAST_DEFAULT_CONFIG.classNames,
        ...variant.classNames,
        ...options.classNames,
        toast: `${TOAST_DEFAULT_CONFIG.classNames.toast} ${variant.classNames?.toast || ""
            } ${options.classNames?.toast || ""}`,
    };

    return toast[type]?.(message, {
        ...options,

        duration: options.duration || TOAST_DEFAULT_CONFIG.duration,
        position: options.position || TOAST_DEFAULT_CONFIG.position,

        icon,

        description: options.description,
        className: TOAST_DEFAULT_CONFIG.className,
        classNames: mergedClassNames,

    });
};

/**
 * PUBLIC API
 */
export const AppToast = {
    success: (msg, opt) => triggerToast("success", msg, opt),
    error: (msg, opt) => triggerToast("error", msg, opt),
    warning: (msg, opt) => triggerToast("warning", msg, opt),
    info: (msg, opt) => triggerToast("info", msg, opt),

    custom: (msg, opt = {}) =>
        triggerToast("default", msg, {
            classNames: { toast: "border-border" },
            ...opt,
        }),

    promise: (promise, data) =>
        toast.promise(promise, {
            loading: data.loading || "Processing...",
            success: data.success,
            error: data.error,
            position: TOAST_DEFAULT_CONFIG.position,
            classNames: TOAST_DEFAULT_CONFIG.classNames,
        }),

    dismiss: (id) => toast.dismiss(id),
};