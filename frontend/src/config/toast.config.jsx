import { toast } from "sonner";
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";

/**
 * Modern SaaS Toast Styling Configuration
 * Uses Tailwind CSS classes matching Shadcn's layout patterns.
 */
const TOAST_DEFAULT_CONFIG = {
    duration: 4000,
    position: "bottom-right", // Modern SaaS usually prefers bottom-right or top-right
    className: "group font-sans antialiased",
    classNames: {
        toast: "w-full border p-4 flex gap-3 rounded-xl shadow-lg backdrop-blur-md bg-background/95",
        title: "text-sm font-semibold tracking-tight text-foreground",
        description: "text-xs text-muted-foreground font-normal leading-relaxed mt-0.5",
        actionButton: "bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 rounded-md transition-colors hover:bg-primary/90",
        cancelButton: "bg-muted text-muted-foreground text-xs font-medium px-3 py-1.5 rounded-md transition-colors hover:bg-muted/80",
    }
};

const TOAST_VARIANTS = {
    success: {
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
        classNames: {
            toast: "border-emerald-500/15 dark:border-emerald-500/10 bg-gradient-to-r from-emerald-500/[0.02] to-transparent"
        }
    },
    error: {
        icon: <AlertCircle className="h-5 w-5 text-destructive shrink-0" />,
        classNames: {
            toast: "border-destructive/15 dark:border-destructive/10 bg-gradient-to-r from-destructive/[0.02] to-transparent"
        }
    },
    warning: {
        icon: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
        classNames: {
            toast: "border-amber-500/15 dark:border-amber-500/10 bg-gradient-to-r from-amber-500/[0.02] to-transparent"
        }
    },
    info: {
        icon: <Info className="h-5 w-5 text-blue-500 shrink-0" />,
        classNames: {
            toast: "border-blue-500/15 dark:border-blue-500/10 bg-gradient-to-r from-blue-500/[0.02] to-transparent"
        }
    }
};

/**
 * Main wrapper function to deeply merge configs and trigger Sonner
 */
const triggerToast = (type, message, options = {}) => {
    const variant = TOAST_VARIANTS[type] || {};

    // Merge deep Tailwind classes smoothly
    const mergedClassNames = {
        ...TOAST_DEFAULT_CONFIG.classNames,
        ...variant.classNames,
        ...options.classNames,
        // Safely appends deep sub-classes like toast, description, etc.
        toast: `${TOAST_DEFAULT_CONFIG.classNames.toast} ${variant.classNames?.toast || ""} ${options.classNames?.toast || ""}`,
    };

    const toastMethod = toast[type] || toast;

    return toastMethod(message, {
        duration: options.duration || variant.duration || TOAST_DEFAULT_CONFIG.duration,
        position: options.position || TOAST_DEFAULT_CONFIG.position,
        icon: options.icon !== undefined ? options.icon : variant.icon,
        description: options.description,
        className: TOAST_DEFAULT_CONFIG.className,
        classNames: mergedClassNames,
        ...options, // Fallback for promise, action, styles, etc.
    });
};

export const AppToast = {
    success: (message, options) => triggerToast("success", message, options),
    error: (message, options) => triggerToast("error", message, options),
    warning: (message, options) => triggerToast("warning", message, options),
    info: (message, options) => triggerToast("info", message, options),

    // Clean neutral/custom variant
    custom: (message, options = {}) => triggerToast("default", message, {
        classNames: {
            toast: "border-border"
        },
        ...options
    }),

    // Loader/Promise toast helper for smooth SaaS network states
    promise: (promise, data) => toast.promise(promise, {
        loading: data.loading || "Processing...",
        success: (res) => data.success(res),
        error: (err) => data.error(err),
        position: TOAST_DEFAULT_CONFIG.position,
        classNames: TOAST_DEFAULT_CONFIG.classNames,
    }),

    dismiss: (id) => toast.dismiss(id),
};

