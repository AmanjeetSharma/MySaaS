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
    },
    {
        value: "call",
        label: "Call",
        icon: Phone,
    },
    {
        value: "email",
        label: "Email",
        icon: Mail,
    },
    {
        value: "whatsapp",
        label: "WhatsApp",
        icon: MessageCircle,
    },
    {
        value: "sms",
        label: "SMS",
        icon: MessageSquare,
    },
    {
        value: "meeting",
        label: "Meeting",
        icon: Users,
    },
    {
        value: "task",
        label: "Task",
        icon: CheckSquare,
    },
    {
        value: "stage_change",
        label: "Stage Change",
        icon: ArrowRightLeft,
    },
    {
        value: "deal_created",
        label: "Deal Created",
        icon: PlusCircle,
    },
    {
        value: "deal_updated",
        label: "Deal Updated",
        icon: RefreshCcw,
    },
    {
        value: "deal_won",
        label: "Deal Won",
        icon: Trophy,
    },
    {
        value: "deal_lost",
        label: "Deal Lost",
        icon: XCircle,
    },
    {
        value: "custom",
        label: "Custom",
        icon: Sparkles,
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