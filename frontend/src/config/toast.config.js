
import React from "react";
import { toast } from "sonner";
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

const createIcon = (Icon, props = {}) => (
    React.createElement(Icon, {
        size: iconSize,
        strokeWidth: 2.25,
        ...props,
    })
);

export const toastIconRegistry = {
    success: createIcon(CheckCircle2),
    error: createIcon(XCircle),
    warning: createIcon(AlertTriangle),
    info: createIcon(Info),

    palette: createIcon(Palette),
    platte: createIcon(Palette),
    mail: createIcon(Mail),
    iosmail: React.createElement(IoIosMail, { size: 20 }),
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

export const defaultToastConfig = {
    duration: 3000,
    position: "top-center",
    classNames: {
        toast:
            "group rounded-lg border border-border bg-popover text-popover-foreground shadow-lg",
        title: "text-sm font-semibold text-popover-foreground",
        description: "text-xs text-muted-foreground",
        icon: "text-current",
        actionButton: "rounded-md bg-primary px-3 py-1.5 text-primary-foreground",
        cancelButton: "rounded-md bg-muted px-3 py-1.5 text-muted-foreground",
        success: "border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
        error: "border-red-500/30 text-red-600 dark:text-red-400",
        warning: "border-amber-500/30 text-amber-600 dark:text-amber-400",
        info: "border-sky-500/30 text-sky-600 dark:text-sky-400",
        loading: "border-border text-muted-foreground",
    },
};

const variantIconMap = {
    success: "success",
    error: "error",
    warning: "warning",
    info: "info",
    loading: "loading",
};

export const resolveToastIcon = (icon) => {
    if (!icon) return undefined;
    if (typeof icon !== "string") return icon;

    return toastIconRegistry[icon.trim().toLowerCase()];
};

export const buildToastOptions = (options = {}, variant = "default") => {
    const fallbackIcon = variantIconMap[variant];
    const icon = resolveToastIcon(options.icon ?? fallbackIcon);

    return {
        ...defaultToastConfig,
        ...options,
        classNames: {
            ...defaultToastConfig.classNames,
            ...(options.classNames || {}),
        },
        icon,
    };
};

const normalizePromiseMessages = (messages = {}) => ({
    loading: messages.loading || "Loading...",
    success: messages.success || "Success",
    error: messages.error || "Something went wrong",
});

export const AppToast = {
    success(message, options = {}) {
        return toast.success(message, buildToastOptions(options, "success"));
    },

    error(message, options = {}) {
        return toast.error(message, buildToastOptions(options, "error"));
    },

    warning(message, options = {}) {
        return toast.warning(message, buildToastOptions(options, "warning"));
    },

    info(message, options = {}) {
        return toast.info(message, buildToastOptions(options, "info"));
    },

    loading(message, options = {}) {
        return toast.loading(message, buildToastOptions(options, "loading"));
    },

    custom(content, options = {}) {
        const toastOptions = buildToastOptions(options, "default");

        if (typeof content === "function") {
            return toast.custom(content, toastOptions);
        }

        return toast(content, toastOptions);
    },

    promise(promise, messages = {}, options = {}) {
        return toast.promise(promise, {
            ...buildToastOptions(options),
            ...normalizePromiseMessages(messages),
        });
    },

    dismiss(id) {
        return toast.dismiss(id);
    },
};

export default AppToast;
