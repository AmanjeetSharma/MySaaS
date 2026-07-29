import {
    Phone,
    Mail,
    MessageCircle,
    MessageSquare,
    Users,
    CheckSquare,
    FileText,
    ArrowRightLeft,
    PlusCircle,
    RefreshCcw,
    Trophy,
    XCircle,
    Sparkles,
} from "lucide-react";

export const ACTIVITY_TYPES = [
    {
        value: "note",
        label: "Note",
        icon: FileText,
        color: "bg-blue-500/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
    },
    {
        value: "call",
        label: "Call",
        icon: Phone,
        color: "bg-cyan-500/15 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400",
    },
    {
        value: "email",
        label: "Email",
        icon: Mail,
        color: "bg-purple-500/15 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
    },
    {
        value: "whatsapp",
        label: "WhatsApp",
        icon: MessageCircle,
        color: "bg-green-500/15 text-green-600 dark:bg-green-500/20 dark:text-green-400",
    },
    {
        value: "sms",
        label: "SMS",
        icon: MessageSquare,
        color: "bg-yellow-500/15 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400",
    },
    {
        value: "meeting",
        label: "Meeting",
        icon: Users,
        color: "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
    },
    {
        value: "task",
        label: "Task",
        icon: CheckSquare,
        color: "bg-orange-500/15 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
    },
    {
        value: "stage_change",
        label: "Stage Change",
        icon: ArrowRightLeft,
        color: "bg-indigo-500/15 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400",
    },
    {
        value: "deal_created",
        label: "Deal Created",
        icon: PlusCircle,
        color: "bg-teal-500/15 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400",
    },
    {
        value: "deal_updated",
        label: "Deal Updated",
        icon: RefreshCcw,
        color: "bg-cyan-500/15 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400",
    },
    {
        value: "deal_won",
        label: "Deal Won",
        icon: Trophy,
        color: "bg-green-600/15 text-green-700 dark:bg-green-600/20 dark:text-green-400",
    },
    {
        value: "deal_lost",
        label: "Deal Lost",
        icon: XCircle,
        color: "bg-red-500/15 text-red-600 dark:bg-red-500/20 dark:text-red-400",
    },
    {
        value: "custom",
        label: "Custom",
        icon: Sparkles,
        color: "bg-indigo-500/15 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400",
    },
];

export const getActivityType = (type) => {
    return (
        ACTIVITY_TYPES.find(
            (item) => item.value === type
        ) || ACTIVITY_TYPES[0]
    );
};

export const getActivityIcon = (type) => {
    return getActivityType(type).icon;
};

export const getActivityLabel = (type) => {
    return getActivityType(type).label;
};

export const getActivityColor = (type) => {
    return getActivityType(type).color;
};