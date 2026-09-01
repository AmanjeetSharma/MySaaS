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

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const STATUS_VARIANTS = {
    CONFIRMED: "bg-success/10 text-success border-success/20",
    COMPLETED: "bg-accent/10 text-accent border-accent/20",
    CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
    NO_SHOW: "bg-destructive/10 text-destructive border-destructive/20",
    EXPIRED: "bg-muted text-subtle-foreground border-border-subtle",
    PENDING_PAYMENT: "bg-warning/10 text-warning border-warning/20",
    PAYMENT_FAILED: "bg-destructive/10 text-destructive border-destructive/20",
};

const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(dateString));
};

const formatTime = (dateString) => {
    if (!dateString) return "";
    return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    }).format(new Date(dateString));
};

const formatPrice = (price, currency = "INR") => {
    if (price === undefined || price === null) return "-";
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: currency,
        maximumFractionDigits: 0,
    }).format(price);
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
    const [copied, setCopied] = useState(false);

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
        setCopied(true);
        toast.success("Booking ID copied to clipboard", {
            icon: toastIcon("success"),
        });
        setTimeout(() => setCopied(false), 2000);
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

    if (isLoadingBooking && !booking) {
        return (
            <div className="space-y-3 max-w-5xl mx-auto px-3 sm:px-6 py-4" aria-busy="true">
                <Skeleton className="h-8 w-32 rounded-xl bg-surface-sunken" />
                <Skeleton className="h-36 w-full rounded-2xl bg-surface-sunken" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Skeleton className="h-44 w-full rounded-2xl bg-surface-sunken" />
                    <Skeleton className="h-44 w-full rounded-2xl bg-surface-sunken" />
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="max-w-5xl mx-auto px-3 sm:px-6 py-8">
                <Card className="border-border-strong border-dashed bg-surface-elevated/40 rounded-2xl">
                    <CardContent className="flex min-h-[240px] flex-col items-center justify-center gap-3 p-6 text-center">
                        <Building2 className="size-8 text-subtle-foreground/60" />
                        <h2 className="font-heading text-base font-semibold tracking-tight text-foreground">
                            Booking Not Found
                        </h2>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate("/bookings")}
                            className="rounded-xl border-border bg-surface text-subtle-foreground hover:bg-hover hover:text-foreground active:scale-95 transition-all cursor-pointer text-xs font-semibold"
                        >
                            Back to Bookings
                        </Button>
                    </CardContent>
                </Card>
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

    return (
        <div className="space-y-3 sm:space-y-4 max-w-5xl mx-auto px-3 sm:px-6 py-3 bg-background text-foreground">
            {/* 1. HEADER ACTIONS */}
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/bookings")}
                    className="w-fit -ml-2 gap-1.5 px-2 text-subtle-foreground hover:text-foreground hover:bg-hover transition-colors rounded-xl cursor-pointer h-8"
                >
                    <ArrowLeft className="size-4" />
                    <span className="text-xs font-medium">Back to Bookings</span>
                </Button>

                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditOpen(true)}
                        className="h-8 gap-1.5 px-2.5 sm:px-3 rounded-xl border-border-subtle bg-surface text-subtle-foreground hover:text-foreground hover:bg-hover text-xs font-semibold cursor-pointer shadow-xs transition-all active:scale-95"
                    >
                        <Edit3 className="size-3.5" />
                        <span>Edit</span>
                    </Button>

                    {allowedTransitions.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsStatusOpen(true)}
                            className="h-8 gap-1.5 px-2.5 sm:px-3 rounded-xl border-border-subtle bg-surface text-subtle-foreground hover:text-foreground hover:bg-hover text-xs font-semibold cursor-pointer shadow-xs transition-all active:scale-95"
                        >
                            <CheckCircle2 className="size-3.5" />
                            <span>Change Status</span>
                        </Button>
                    )}

                    {canReschedule && (
                        <Button
                            size="sm"
                            onClick={() => setIsRescheduleOpen(true)}
                            className="h-8 gap-1.5 px-3 sm:px-3.5 rounded-xl bg-accent text-accent-foreground hover:opacity-90 text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs transition-all active:scale-95"
                        >
                            <RotateCcw className="size-3.5" />
                            <span>Reschedule Booking</span>
                        </Button>
                    )}

                    {canCancel && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setCancellationReasonInput("");
                                setIsCancelOpen(true);
                            }}
                            className="h-8 gap-1.5 px-2 sm:px-3 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive text-xs font-semibold cursor-pointer transition-all active:scale-95"
                        >
                            <CalendarOff className="size-3.5" />
                            <span>Cancel</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* 2 & 3. MAIN HEADER & APPOINTMENT METADATA */}
            <Card className="border border-border-subtle bg-surface-elevated text-surface-elevated-foreground shadow-xs rounded-2xl">
                <CardContent className="p-3.5 sm:p-5 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-border-subtle/50 pb-3">
                        <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="font-heading text-base sm:text-lg font-bold tracking-tight text-foreground truncate">
                                    {serviceSnapshot?.name || service?.name || "Appointment"}
                                </h1>
                                <Badge
                                    variant="outline"
                                    className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md select-none ${STATUS_VARIANTS[status] || "bg-secondary text-secondary-foreground"
                                        }`}
                                >
                                    {status.replace(/_/g, " ")}
                                </Badge>
                            </div>

                            {/* Full Booking ID with Explicit Copy Button */}
                            <div className="flex items-center gap-1.5 text-[11px] text-subtle-foreground font-mono">
                                <span className="font-sans text-subtle-foreground/70">ID:</span>
                                <span className="truncate max-w-[200px] sm:max-w-none">{booking._id}</span>
                                <button
                                    type="button"
                                    onClick={handleCopyId}
                                    title="Copy full Booking ID"
                                    className="p-1 rounded-md hover:bg-hover hover:text-foreground text-subtle-foreground/80 transition-colors cursor-pointer"
                                >
                                    {copied ? (
                                        <Check className="size-3.5 text-success" />
                                    ) : (
                                        <Copy className="size-3.5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="text-left sm:text-right shrink-0">
                            <div className="font-heading text-lg sm:text-xl font-bold text-foreground">
                                {formatPrice(serviceSnapshot?.price, serviceSnapshot?.currency)}
                            </div>
                        </div>
                    </div>

                    {/* Compact Appointment Metadata Bar */}
                    <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-5 gap-y-1.5 text-xs pt-0.5">
                        <div className="flex items-center gap-1.5 text-foreground font-semibold">
                            <Clock className="size-3.5 text-accent shrink-0" />
                            <span>
                                {formatTime(startTime)} – {formatTime(endTime)}
                            </span>
                            {serviceSnapshot?.durationInMinutes && (
                                <span className="text-[11px] font-normal text-subtle-foreground">
                                    ({serviceSnapshot.durationInMinutes}m)
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-1.5 text-subtle-foreground font-medium">
                            <CalendarIcon className="size-3.5 text-subtle-foreground/70 shrink-0" />
                            <span>{formatDate(startTime)}</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-subtle-foreground">
                            <Globe className="size-3.5 text-subtle-foreground/70 shrink-0" />
                            <span className="truncate">{timezone || "Asia/Kolkata"}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 4 & 5. TWO-COLUMN LAYOUT: CUSTOMER + MEETING/CALENDAR */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
                {/* CUSTOMER CARD (Includes Customer-provided Notes) */}
                <Card className="border border-border-subtle bg-surface-elevated text-surface-elevated-foreground shadow-xs rounded-2xl">
                    <CardContent className="p-3.5 sm:p-4 space-y-3">
                        <h2 className="font-heading text-xs font-bold tracking-wider uppercase text-subtle-foreground flex items-center gap-1.5 border-b border-border-subtle/50 pb-2">
                            <User className="size-3.5 text-accent" />
                            <span>Customer</span>
                        </h2>

                        <div className="space-y-2 text-xs">
                            <div>
                                <p className="font-heading text-sm font-semibold text-foreground truncate">
                                    {booker?.name || "Unknown Booker"}
                                </p>
                            </div>

                            <div className="flex flex-col gap-1.5 text-subtle-foreground select-text">
                                {booker?.email && (
                                    <div className="inline-flex items-center gap-2 truncate max-w-full cursor-default">
                                        <Mail className="size-3.5 text-subtle-foreground/60 shrink-0" />
                                        <span className="truncate">{booker.email}</span>
                                    </div>
                                )}
                                {booker?.phone && (
                                    <div className="inline-flex items-center gap-2 cursor-default">
                                        <Phone className="size-3.5 text-subtle-foreground/60 shrink-0" />
                                        <span>{booker.phone}</span>
                                    </div>
                                )}
                            </div>

                            {/* Customer Booking Note Section */}
                            <div className="pt-2 border-t border-border-subtle/40 space-y-1">
                                <span className="text-[11px] font-semibold text-subtle-foreground flex items-center gap-1.5">
                                    <FileText className="size-3 text-accent shrink-0" />
                                    <span>Customer Note</span>
                                </span>
                                <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere] bg-surface p-2.5 rounded-xl border border-border-subtle/60">
                                    {notes?.trim() ? notes : "No note provided by customer."}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* MEETING & CALENDAR */}
                <Card className="border border-border-subtle bg-surface-elevated text-surface-elevated-foreground shadow-xs rounded-2xl">
                    <CardContent className="p-3.5 sm:p-4 space-y-3">
                        <h2 className="font-heading text-xs font-bold tracking-wider uppercase text-subtle-foreground flex items-center gap-1.5 border-b border-border-subtle/50 pb-2">
                            <Video className="size-3.5 text-accent" />
                            <span>Meeting & Calendar</span>
                        </h2>

                        <div className="space-y-2.5 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-subtle-foreground font-medium">Mode:</span>
                                <Badge
                                    variant="outline"
                                    className="text-[10px] font-bold rounded-md bg-surface text-foreground"
                                >
                                    {serviceSnapshot?.mode || "ONLINE"}
                                </Badge>
                            </div>

                            {serviceSnapshot?.mode === "OFFLINE" ? (
                                <div className="space-y-1.5 pt-1">
                                    <span className="text-[11px] font-semibold text-subtle-foreground flex items-center gap-1.5">
                                        <MapPin className="size-3.5 text-accent shrink-0" />
                                        <span>Appointment Location</span>
                                    </span>

                                    {serviceSnapshot?.address ? (
                                        <div className="rounded-xl border border-border-subtle bg-surface p-2.5 sm:p-3 space-y-1 text-xs">
                                            {serviceSnapshot.address.street && (
                                                <p className="font-medium text-foreground leading-relaxed">
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
                                                <p className="text-[11px] font-medium text-subtle-foreground/80 pt-0.5">
                                                    {serviceSnapshot.address.country}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-[11px] text-subtle-foreground/70 italic">
                                            In-person address not specified
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <span className="text-subtle-foreground font-medium">Meeting Link:</span>
                                    {meeting?.link ? (
                                        <a
                                            href={meeting.link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 text-accent hover:underline font-semibold cursor-pointer"
                                        >
                                            <span>Join Call</span>
                                            <ExternalLink className="size-3" />
                                        </a>
                                    ) : (
                                        <span className="text-subtle-foreground/60">No link generated</span>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-1">
                                <span className="text-subtle-foreground font-medium">Calendar:</span>
                                {calendarEvent?.htmlLink ? (
                                    <a
                                        href={calendarEvent.htmlLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-accent hover:underline font-semibold cursor-pointer"
                                    >
                                        <CalendarDays className="size-3.5" />
                                        <span>Google Calendar</span>
                                        <ExternalLink className="size-3 ml-0.5" />
                                    </a>
                                ) : (
                                    <span className="text-subtle-foreground/60">Not synced</span>
                                )}
                            </div>

                            {status === "CANCELLED" && cancellationReason && (
                                <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs space-y-1 mt-2">
                                    <div className="flex items-center gap-1 font-bold">
                                        <AlertTriangle className="size-3 shrink-0" />
                                        <span>Cancellation Reason</span>
                                    </div>
                                    <p className="text-[11px] leading-relaxed">{cancellationReason}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* COMPONENT DIALOGS */}
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