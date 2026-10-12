import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
    ArrowLeft,
    Calendar as CalendarIcon,
    Clock,
    User,
    Mail,
    Phone,
    Video,
    ExternalLink,
    MapPin,
    CalendarDays,
    FileText,
    AlertTriangle,
    RotateCcw,
    CalendarOff,
    CheckCircle2,
    Edit3,
    Globe,
    Building2,
    Copy,
    Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useUserStore, useBookingStore } from "@/stores";
import { toastIcon } from "@/constants/toastIcon.constant";

import BookingEditDialog from "../../components/booking/bookingDetails/BookingEditDialog";
import BookingStatusDialog from "../../components/booking/bookingDetails/BookingStatusDialog";
import BookingRescheduleDialog from "../../components/booking/bookingDetails/BookingRescheduleDialog";
import BookingCancelDialog from "../../components/booking/bookingDetails/BookingCancelDialog";

export const BOOKING_STATUS_TRANSITIONS = {
    PENDING_PAYMENT: ["PAYMENT_FAILED", "CONFIRMED", "EXPIRED"],
    CONFIRMED: ["COMPLETED", "NO_SHOW"],
    COMPLETED: [],
    CANCELLED: [],
    NO_SHOW: [],
    EXPIRED: [],
    PAYMENT_FAILED: [],
};

const STATUS_CONFIG = {
    CONFIRMED: {
        label: "Confirmed",
        classes: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
    },
    COMPLETED: {
        label: "Completed",
        classes: "bg-surface text-foreground border-border-strong",
    },
    CANCELLED: {
        label: "Cancelled",
        classes: "bg-destructive/10 text-destructive border-destructive/25",
    },
    NO_SHOW: {
        label: "No Show",
        classes: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25",
    },
    EXPIRED: {
        label: "Expired",
        classes: "bg-surface text-subtle-foreground border-border-subtle",
    },
    PENDING_PAYMENT: {
        label: "Pending Payment",
        classes: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
    },
    PAYMENT_FAILED: {
        label: "Payment Failed",
        classes: "bg-destructive/10 text-destructive border-destructive/25",
    },
};

const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
        return new Intl.DateTimeFormat("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
        }).format(new Date(dateString));
    } catch {
        return dateString;
    }
};

const formatTime = (dateString) => {
    if (!dateString) return "";
    try {
        return new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        }).format(new Date(dateString));
    } catch {
        return "";
    }
};

const formatPrice = (price, currency = "INR") => {
    if (price === undefined || price === null) return "-";
    try {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: currency,
            maximumFractionDigits: 0,
        }).format(price);
    } catch {
        return `${currency} ${price}`;
    }
};

const BookingDetails = () => {
    const navigate = useNavigate();
    const { bookingId } = useParams();
    const { userProfile } = useUserStore();
    const organizationId = userProfile?.activeOrganization || null;

    const {
        booking,
        isLoadingBooking,
        isUpdating,
        isUpdatingStatus,
        isRescheduling,
        isCancelling,
        getBookingById,
        updateBooking,
        updateBookingStatus,
        rescheduleBooking,
        cancelBooking,
    } = useBookingStore();

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
    const [isCancelOpen, setIsCancelOpen] = useState(false);

    const [cancellationReasonInput, setCancellationReasonInput] = useState("");
    const [copiedId, setCopiedId] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    const fetchBooking = useCallback(async () => {
        if (!bookingId || !organizationId) return;
        try {
            await getBookingById({ bookingId, orgId: organizationId });
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to load booking details.", {
                icon: toastIcon("error"),
            });
        }
    }, [bookingId, organizationId, getBookingById]);

    useEffect(() => {
        fetchBooking();
    }, [fetchBooking]);

    const handleCopyId = () => {
        if (!booking?._id) return;
        navigator.clipboard.writeText(booking._id);
        setCopiedId(true);
        toast.success("Booking ID copied to clipboard", {
            icon: toastIcon("success"),
        });
        setTimeout(() => setCopiedId(false), 2000);
    };

    const handleCopyMeetingLink = (link) => {
        if (!link) return;
        navigator.clipboard.writeText(link);
        setCopiedLink(true);
        toast.success("Meeting link copied to clipboard", {
            icon: toastIcon("success"),
        });
        setTimeout(() => setCopiedLink(false), 2000);
    };

    const handleSaveDetails = async (payload) => {
        try {
            await updateBooking({
                bookingId,
                orgId: organizationId,
                payload,
            });
            setIsEditOpen(false);
            toast.success("Booking details updated successfully.", {
                icon: toastIcon("success"),
            });
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to update booking details.", {
                icon: toastIcon("error"),
            });
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            await updateBookingStatus({
                bookingId,
                orgId: organizationId,
                status: newStatus,
            });
            setIsStatusOpen(false);
            toast.success(`Booking status changed to ${newStatus.replace(/_/g, " ")}.`, {
                icon: toastIcon("success"),
            });
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to update booking status.", {
                icon: toastIcon("error"),
            });
        }
    };

    const handleRescheduleConfirm = async (newStartTime) => {
        try {
            await rescheduleBooking({
                bookingId,
                orgId: organizationId,
                startTime: newStartTime,
            });
            setIsRescheduleOpen(false);
            toast.success("Appointment rescheduled successfully.", {
                icon: toastIcon("success"),
            });
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to reschedule appointment.", {
                icon: toastIcon("error"),
            });
        }
    };

    const handleCancelConfirm = async (e) => {
        e.preventDefault();
        try {
            await cancelBooking({
                bookingId,
                orgId: organizationId,
                cancellationReason: cancellationReasonInput,
            });
            setIsCancelOpen(false);
            setCancellationReasonInput("");
            toast.success("Booking cancelled successfully.", {
                icon: toastIcon("delete"),
            });
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to cancel booking.", {
                icon: toastIcon("error"),
            });
        }
    };

    const allowedTransitions = useMemo(() => {
        return BOOKING_STATUS_TRANSITIONS[booking?.status] || [];
    }, [booking?.status]);

    const relativeDateTag = useMemo(() => {
        if (!booking?.startTime) return null;
        try {
            const date = new Date(booking.startTime);
            const now = new Date();
            const isToday =
                date.getDate() === now.getDate() &&
                date.getMonth() === now.getMonth() &&
                date.getFullYear() === now.getFullYear();
            if (isToday) return "Today";

            const tomorrow = new Date();
            tomorrow.setDate(now.getDate() + 1);
            const isTomorrow =
                date.getDate() === tomorrow.getDate() &&
                date.getMonth() === tomorrow.getMonth() &&
                date.getFullYear() === tomorrow.getFullYear();
            if (isTomorrow) return "Tomorrow";
        } catch {
            return null;
        }
        return null;
    }, [booking?.startTime]);

    if (isLoadingBooking && !booking) {
        return (
            <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 py-6" aria-busy="true">
                <Skeleton className="h-8 w-32 rounded-lg bg-surface" />
                <div className="space-y-2">
                    <Skeleton className="h-9 w-64 rounded bg-surface" />
                    <Skeleton className="h-4 w-48 rounded bg-surface" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-border-subtle">
                    <Skeleton className="h-12 w-full rounded bg-surface" />
                    <Skeleton className="h-12 w-full rounded bg-surface" />
                    <Skeleton className="h-12 w-full rounded bg-surface" />
                    <Skeleton className="h-12 w-full rounded bg-surface" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-4">
                    <div className="md:col-span-7 space-y-4">
                        <Skeleton className="h-32 w-full rounded-xl bg-surface" />
                        <Skeleton className="h-24 w-full rounded-xl bg-surface" />
                    </div>
                    <div className="md:col-span-5 space-y-4">
                        <Skeleton className="h-36 w-full rounded-xl bg-surface" />
                    </div>
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
                <div className="inline-flex items-center justify-center size-12 rounded-2xl bg-surface border border-border-subtle text-subtle-foreground mx-auto">
                    <Building2 className="size-6 stroke-[1.5]" />
                </div>
                <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground">
                    Booking Not Found
                </h2>
                <p className="text-xs text-subtle-foreground max-w-xs mx-auto">
                    The requested appointment could not be located or you may not have access to it.
                </p>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/bookings")}
                    className="rounded-lg border-border-subtle bg-surface text-subtle-foreground hover:bg-hover hover:text-foreground text-xs font-semibold cursor-pointer"
                >
                    Back to Bookings
                </Button>
            </div>
        );
    }

    const {
        service,
        serviceSnapshot,
        booker,
        startTime,
        endTime,
        timezone,
        status = "PENDING_PAYMENT",
        meeting,
        calendarEvent,
        notes,
        cancellationReason,
    } = booking;

    const isTerminal = ["COMPLETED", "CANCELLED", "NO_SHOW", "EXPIRED", "PAYMENT_FAILED"].includes(status);
    const canReschedule = status === "CONFIRMED" || status === "PENDING_PAYMENT";
    const canCancel = !isTerminal;

    const statusConfig = STATUS_CONFIG[status] || {
        label: status.replace(/_/g, " "),
        classes: "bg-secondary text-secondary-foreground border-border-subtle",
    };

    const isOnline = (serviceSnapshot?.mode || "ONLINE").toUpperCase() === "ONLINE";

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 space-y-6 bg-background text-foreground">
            {/* 1. TOP NAVIGATION & WORKFLOW ACTIONS */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border-subtle pb-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/bookings")}
                    className="w-fit -ml-2 gap-1.5 px-2 text-subtle-foreground hover:text-foreground hover:bg-hover transition-colors rounded-lg cursor-pointer h-8"
                >
                    <ArrowLeft className="size-4" />
                    <span className="text-xs font-medium">Back to Bookings</span>
                </Button>

                <div className="flex flex-wrap items-center gap-2">

                    {canReschedule && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsRescheduleOpen(true)}
                            className="h-8 gap-1.5 px-3 rounded-lg border-border-subtle bg-surface text-foreground hover:bg-hover text-xs font-semibold cursor-pointer shadow-xs transition-all active:scale-95"
                        >
                            <RotateCcw className="size-3.5 text-accent" />
                            <span>Reschedule</span>
                        </Button>
                    )}

                    {allowedTransitions.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsStatusOpen(true)}
                            className="h-8 gap-1.5 px-3 rounded-lg border-border-subtle bg-surface text-subtle-foreground hover:text-foreground hover:bg-hover text-xs font-semibold cursor-pointer shadow-xs transition-all active:scale-95"
                        >
                            <CheckCircle2 className="size-3.5" />
                            <span>Change Status</span>
                        </Button>
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditOpen(true)}
                        className="h-8 gap-1.5 px-3 rounded-lg border-border-subtle bg-surface text-subtle-foreground hover:text-foreground hover:bg-hover text-xs font-semibold cursor-pointer shadow-xs transition-all active:scale-95"
                    >
                        <Edit3 className="size-3.5" />
                        <span>Edit</span>
                    </Button>

                    {canCancel && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setCancellationReasonInput("");
                                setIsCancelOpen(true);
                            }}
                            className="h-8 gap-1.5 px-2.5 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive text-xs font-semibold cursor-pointer transition-all active:scale-95"
                        >
                            <CalendarOff className="size-3.5" />
                            <span>Cancel</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* 2. HERO HEADER (Open Architectural Heading, Zero Card Shell) */}
            <div className="space-y-3 pb-6 border-b border-border-subtle">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                {serviceSnapshot?.name || service?.name || "Appointment"}
                            </h1>

                            {/* Architectural Status Tag (No dot, no bubbly pill) */}
                            <span
                                className={`text-[10px] sm:text-[11px] font-semibold tracking-[0.16em] uppercase px-2.5 py-0.5 rounded-md border select-none inline-flex items-center justify-center ${statusConfig.classes}`}
                            >
                                {statusConfig.label}
                            </span>
                        </div>

                        {/* Metrology ID Bar */}
                        <div className="flex items-center gap-2 text-xs text-subtle-foreground">
                            <span className="font-mono text-subtle-foreground/60 text-[11px]">ID:</span>
                            <span className="font-mono text-[11px] text-foreground/80">{booking._id}</span>
                            <button
                                type="button"
                                onClick={handleCopyId}
                                title="Copy Booking ID"
                                className="p-1 rounded hover:bg-hover hover:text-foreground text-subtle-foreground/70 transition-colors cursor-pointer"
                                aria-label="Copy booking ID"
                            >
                                {copiedId ? (
                                    <Check className="size-3 text-success" />
                                ) : (
                                    <Copy className="size-3" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Commercial Value */}
                    <div className="text-left sm:text-right shrink-0">
                        <span className="text-[10px] uppercase font-semibold tracking-wider text-subtle-foreground block">
                            Service Fee
                        </span>
                        <div className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
                            {formatPrice(serviceSnapshot?.price, serviceSnapshot?.currency)}
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. TEMPORAL & LOGISTICAL RUNWAY (Open 4-Column Grid, Zero Card Shell) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 py-5 border-b border-border-subtle">
                {/* Metric 1: Date */}
                <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-subtle-foreground flex items-center gap-1.5">
                        <CalendarIcon className="size-3.5 text-accent" />
                        <span>Date</span>
                    </span>
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-sm sm:text-base font-semibold text-foreground">
                            {formatDate(startTime)}
                        </span>
                        {relativeDateTag && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider bg-accent/20 text-accent-foreground">
                                {relativeDateTag}
                            </span>
                        )}
                    </div>
                </div>

                {/* Metric 2: Time Window */}
                <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-subtle-foreground flex items-center gap-1.5">
                        <Clock className="size-3.5 text-accent" />
                        <span>Time Window</span>
                    </span>
                    <div className="text-sm sm:text-base font-semibold text-foreground">
                        {formatTime(startTime)} – {formatTime(endTime)}
                        {serviceSnapshot?.durationInMinutes && (
                            <span className="text-xs text-subtle-foreground font-normal ml-1.5">
                                ({serviceSnapshot.durationInMinutes}m)
                            </span>
                        )}
                    </div>
                </div>

                {/* Metric 3: Format */}
                <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-subtle-foreground flex items-center gap-1.5">
                        {isOnline ? (
                            <Video className="size-3.5 text-accent" />
                        ) : (
                            <MapPin className="size-3.5 text-amber-500" />
                        )}
                        <span>Format</span>
                    </span>
                    <div className="text-sm sm:text-base font-semibold text-foreground">
                        {isOnline ? "Online Meeting" : "In-Person"}
                    </div>
                </div>

                {/* Metric 4: Timezone */}
                <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-subtle-foreground flex items-center gap-1.5">
                        <Globe className="size-3.5 text-subtle-foreground" />
                        <span>Timezone</span>
                    </span>
                    <div className="text-sm sm:text-base font-semibold text-foreground truncate">
                        {timezone || "Asia/Kolkata"}
                    </div>
                </div>
            </div>

            {/* 4. CANCELLATION STATE ALERT (Full-width banner, only shown when cancelled) */}
            {status === "CANCELLED" && cancellationReason && (
                <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold tracking-tight">
                        <AlertTriangle className="size-4 shrink-0" />
                        <span>Appointment Cancelled</span>
                    </div>
                    <p className="text-xs text-destructive/90 leading-relaxed pl-5">
                        <span className="font-semibold">Reason:</span> {cancellationReason}
                    </p>
                </div>
            )}

            {/* 5. CONTENT ARCHITECTURE (Open Asymmetric Grid, Zero Card Shells) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-2">
                {/* LEFT DOMAIN (7 Columns): Meeting Connection, Location & Notes */}
                <div className="md:col-span-7 space-y-6">
                    {/* Section: Meeting Access / Venue */}
                    <div className="space-y-3">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-subtle-foreground flex items-center gap-2">
                            {isOnline ? (
                                <Video className="size-3.5 text-accent" />
                            ) : (
                                <MapPin className="size-3.5 text-amber-500" />
                            )}
                            <span>{isOnline ? "Video Meeting Connection" : "Location & Venue"}</span>
                        </h2>

                        {isOnline ? (
                            <div className="p-3.5 rounded-xl bg-surface border border-border-subtle space-y-3">
                                {meeting?.link ? (
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="space-y-0.5 min-w-0">
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-subtle-foreground">
                                                Meeting Room Link
                                            </span>
                                            <p className="text-xs font-mono text-foreground truncate max-w-sm">
                                                {meeting.link}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleCopyMeetingLink(meeting.link)}
                                                className="h-7 text-xs px-2.5 gap-1 rounded-md border-border-subtle bg-surface-elevated text-subtle-foreground hover:text-foreground cursor-pointer"
                                            >
                                                {copiedLink ? (
                                                    <Check className="size-3 text-success" />
                                                ) : (
                                                    <Copy className="size-3" />
                                                )}
                                                <span>{copiedLink ? "Copied" : "Copy Link"}</span>
                                            </Button>

                                            <Button
                                                size="sm"
                                                asChild
                                                className="h-7 text-xs px-3 gap-1 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/80 cursor-pointer"
                                            >
                                                <a href={meeting.link} target="_blank" rel="noreferrer">
                                                    <span>Join Call</span>
                                                    <ExternalLink className="size-3" />
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-subtle-foreground/70 italic">
                                        No meeting link generated for this session.
                                    </p>
                                )}

                                <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-xs">
                                    <span className="text-subtle-foreground">Google Calendar Sync</span>
                                    {calendarEvent?.htmlLink ? (
                                        <a
                                            href={calendarEvent.htmlLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 text-foreground hover:text-accent font-medium transition-colors"
                                        >
                                            <CalendarDays className="size-3.5 text-accent" />
                                            <span>Open Event</span>
                                            <ExternalLink className="size-3 text-subtle-foreground" />
                                        </a>
                                    ) : (
                                        <span className="text-subtle-foreground/60 italic">Not synced</span>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="p-3.5 rounded-xl bg-surface border border-border-subtle space-y-2 text-xs">
                                {serviceSnapshot?.address ? (
                                    <>
                                        {serviceSnapshot.address.street && (
                                            <p className="font-semibold text-foreground text-sm">
                                                {serviceSnapshot.address.street}
                                            </p>
                                        )}
                                        <p className="text-subtle-foreground">
                                            {[
                                                serviceSnapshot.address.city,
                                                serviceSnapshot.address.state,
                                                serviceSnapshot.address.zipCode,
                                            ]
                                                .filter(Boolean)
                                                .join(", ")}
                                        </p>
                                        {serviceSnapshot.address.country && (
                                            <p className="text-subtle-foreground/80 font-medium pt-0.5">
                                                {serviceSnapshot.address.country}
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-subtle-foreground/70 italic">
                                        In-person address not specified.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Section: Customer Booking Note */}
                    <div className="space-y-2.5">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-subtle-foreground flex items-center gap-2">
                            <FileText className="size-3.5 text-accent" />
                            <span>Customer Booking Note</span>
                        </h2>
                        <div className="p-3.5 rounded-xl bg-surface border border-border-subtle text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap break-words">
                            {notes?.trim() ? (
                                notes
                            ) : (
                                <span className="text-subtle-foreground/60 italic">
                                    No notes provided by customer for this appointment.
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT DOMAIN (5 Columns): Customer Dossier & Audit */}
                <div className="md:col-span-5 space-y-6">
                    {/* Section: Customer Dossier */}
                    <div className="space-y-3">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-subtle-foreground flex items-center gap-2">
                            <User className="size-3.5 text-accent" />
                            <span>Customer</span>
                        </h2>

                        <div className="space-y-3">
                            <div>
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-subtle-foreground block">
                                    Full Name
                                </span>
                                <p className="text-base font-semibold text-foreground truncate mt-0.5">
                                    {booker?.name || "Unknown Booker"}
                                </p>
                            </div>

                            <div className="space-y-2 pt-2 border-t border-border-subtle">
                                {booker?.email && (
                                    <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-surface border border-border-subtle text-xs">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Mail className="size-3.5 text-subtle-foreground/70 shrink-0" />
                                            <a
                                                href={`mailto:${booker.email}`}
                                                className="truncate text-foreground hover:underline font-medium"
                                            >
                                                {booker.email}
                                            </a>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                navigator.clipboard.writeText(booker.email);
                                                toast.success("Email copied to clipboard", { icon: toastIcon("success") });
                                            }}
                                            className="p-1 text-subtle-foreground hover:text-foreground rounded cursor-pointer shrink-0"
                                            aria-label="Copy email"
                                        >
                                            <Copy className="size-3" />
                                        </button>
                                    </div>
                                )}

                                {booker?.phone && (
                                    <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-surface border border-border-subtle text-xs">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Phone className="size-3.5 text-subtle-foreground/70 shrink-0" />
                                            <a
                                                href={`tel:${booker.phone}`}
                                                className="truncate text-foreground hover:underline font-medium"
                                            >
                                                {booker.phone}
                                            </a>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                navigator.clipboard.writeText(booker.phone);
                                                toast.success("Phone number copied to clipboard", { icon: toastIcon("success") });
                                            }}
                                            className="p-1 text-subtle-foreground hover:text-foreground rounded cursor-pointer shrink-0"
                                            aria-label="Copy phone"
                                        >
                                            <Copy className="size-3" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Section: Administrative Audit Metadata */}
                    <div className="space-y-2 pt-4 border-t border-border-subtle text-xs text-subtle-foreground">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-subtle-foreground/80 block">
                            Record Audit
                        </span>
                        <div className="flex items-center justify-between">
                            <span>Created:</span>
                            <span className="font-mono text-[11px] text-foreground">
                                {formatDate(booking.createdAt)}
                            </span>
                        </div>
                        {booking.updatedAt && (
                            <div className="flex items-center justify-between">
                                <span>Last Updated:</span>
                                <span className="font-mono text-[11px] text-foreground">
                                    {formatDate(booking.updatedAt)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL DIALOGS */}
            <BookingEditDialog
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                booking={booking}
                onSave={handleSaveDetails}
                isSaving={isUpdating}
            />

            <BookingStatusDialog
                open={isStatusOpen}
                onOpenChange={setIsStatusOpen}
                currentStatus={status}
                allowedTransitions={allowedTransitions}
                onUpdate={handleStatusChange}
                isUpdating={isUpdatingStatus}
            />

            <BookingRescheduleDialog
                open={isRescheduleOpen}
                onOpenChange={setIsRescheduleOpen}
                initialStartTime={startTime}
                initialEndTime={endTime}
                durationInMinutes={serviceSnapshot?.durationInMinutes || 45}
                onReschedule={handleRescheduleConfirm}
                isRescheduling={isRescheduling}
            />

            <BookingCancelDialog
                open={isCancelOpen}
                onOpenChange={setIsCancelOpen}
                reason={cancellationReasonInput}
                onReasonChange={setCancellationReasonInput}
                onConfirm={handleCancelConfirm}
                isCancelling={isCancelling}
            />
        </div>
    );
};

export default BookingDetails;