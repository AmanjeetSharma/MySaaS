// toast.config.js

import { toast } from "sonner";

import {
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Info,
    Palette,
    Mail,
    Trash2,
    ShieldCheck,
    LoaderCircle,
    Calendar,
    Bell,
    User,
    Settings,
    Sparkles,
} from "lucide-react";

import { IoIosMail } from "react-icons/io";



// ================================
// ICON REGISTRY
// ================================

const iconRegistry = {
    success: <CheckCircle2 size={18} />,
    error: <XCircle size={18} />,
    warning: <AlertTriangle size={18} />,
    info: <Info size={18} />,

    palette: <Palette size={18} />,
    mail: <Mail size={18} />,
    delete: <Trash2 size={18} />,
    security: <ShieldCheck size={18} />,
    loading: <LoaderCircle size={18} className="animate-spin" />,
    calendar: <Calendar size={18} />,
    notification: <Bell size={18} />,
    user: <User size={18} />,
    settings: <Settings size={18} />,
    sparkles: <Sparkles size={18} />,

    // custom react-icons examples
    iosmail: <IoIosMail size={20} />,
};



// ================================
// DEFAULT CONFIG
// ================================

const defaultConfig = {
    duration: 4000,
    position: "top-right",

    classNames: {
        toast:
            "group rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl",

        title:
            "text-sm font-semibold text-zinc-100",

        description:
            "text-xs text-zinc-400",

        actionButton:
            "bg-white text-black",

        cancelButton:
            "bg-zinc-800 text-zinc-100",
    },
};



// ================================
// HELPER
// ================================

const resolveIcon = (icon) => {
    if (!icon) return undefined;

    // string icon
    if (typeof icon === "string") {
        return iconRegistry[icon.toLowerCase()];
    }

    // jsx icon
    return icon;
};



const buildOptions = (options = {}) => {
    return {
        ...defaultConfig,
        ...options,

        classNames: {
            ...defaultConfig.classNames,
            ...(options.classNames || {}),
        },

        icon: resolveIcon(options.icon),
    };
};



// ================================
// APP TOAST
// ================================

export const AppToast = {

    success: (message, options = {}) => {
        return toast.success(
            message,
            buildOptions({
                icon: "success",
                ...options,
            })
        );
    },



    error: (message, options = {}) => {
        return toast.error(
            message,
            buildOptions({
                icon: "error",
                ...options,
            })
        );
    },



    warning: (message, options = {}) => {
        return toast.warning(
            message,
            buildOptions({
                icon: "warning",
                ...options,
            })
        );
    },



    info: (message, options = {}) => {
        return toast.info(
            message,
            buildOptions({
                icon: "info",
                ...options,
            })
        );
    },



    custom: (message, options = {}) => {
        return toast(
            message,
            buildOptions(options)
        );
    },



    promise: (promise, messages, options = {}) => {
        return toast.promise(
            promise,
            {
                loading: messages.loading || "Loading...",
                success: messages.success || "Success",
                error: messages.error || "Something went wrong",
            },
            buildOptions(options)
        );
    },
};