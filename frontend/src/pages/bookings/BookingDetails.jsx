import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Calendar,
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
    Ban,
    CheckCircle2,
    Edit3,
    Globe,
    Building2,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { useUserStore, useBookingStore } from "@/stores";

const STATUS_VARIANTS = {
    CONFIRMED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    COMPLETED: "bg-accent/10 text-accent border-accent/20",
    CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
    NO_SHOW: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    EXPIRED: "bg-muted text-subtle-foreground border-border",
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

    // Dialog States
    const [isNotesOpen, setIsNotesOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
    const [isCancelOpen, setIsCancelOpen] = useState(false);

    // Dialog Inputs
    const [notesInput, setNotesInput] = useState("");
    const [statusInput, setStatusInput] = useState("");
    const [rescheduleInput, setRescheduleInput] = useState("");
    const [cancellationReasonInput, setCancellationReasonInput] = useState("");

    const fetchBooking = useCallback(async () => {
        if (!bookingId || !organizationId) return;
        try {
            await getBookingById({ bookingId, orgId: organizationId });
        } catch (error) {
            console.error(error);
        }
    }, [bookingId, organizationId, getBookingById]);

    useEffect(() => {
        fetchBooking();
    }, [fetchBooking]);

    const handleOpenNotesDialog = () => {
        setNotesInput(booking?.notes || "");
        setIsNotesOpen(true);
    };

    const handleOpenStatusDialog = () => {
        setStatusInput(booking?.status || "CONFIRMED");
        setIsStatusOpen(true);
    };

    const handleOpenRescheduleDialog = () => {
        if (booking?.startTime) {
            const localIso = new Date(booking.startTime)
                .toISOString()
                .slice(0, 16);
            setRescheduleInput(localIso);
        }
        setIsRescheduleOpen(true);
    };

    const handleUpdateNotes = async (e) => {
        e.preventDefault();
        try {
            await updateBooking({
                bookingId,
                orgId: organizationId,
                payload: { notes: notesInput },
            });
            setIsNotesOpen(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdateStatus = async () => {
        try {
            await updateBookingStatus({
                bookingId,
                orgId: organizationId,
                status: statusInput,
            });
            setIsStatusOpen(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleReschedule = async (e) => {
        e.preventDefault();
        if (!rescheduleInput) return;
        try {
            await rescheduleBooking({
                bookingId,
                orgId: organizationId,
                startTime: new Date(rescheduleInput).toISOString(),
            });
            setIsRescheduleOpen(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCancelBooking = async (e) => {
        e.preventDefault();
        try {
            await cancelBooking({
                bookingId,
                orgId: organizationId,
                cancellationReason: cancellationReasonInput,
            });
            setIsCancelOpen(false);
        } catch (error) {
            console.error(error);
        }
    };

    if (isLoadingBooking && !booking) {
        return (
            <div className="space-y-4 max-w-5xl mx-auto px-4 sm:px-6 py-6" aria-busy="true">
                <Skeleton className="h-9 w-36 rounded-xl bg-surface-sunken" />
                <Skeleton className="h-44 w-full rounded-2xl bg-surface-sunken" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-56 w-full rounded-2xl bg-surface-sunken" />
                    <Skeleton className="h-56 w-full rounded-2xl bg-surface-sunken" />
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                <Card className="border-border-strong border-dashed bg-surface-elevated/40 rounded-2xl">
                    <CardContent className="flex min-h-[300px] flex-col items-center justify-center gap-3 p-6 text-center">
                        <Building2 className="size-8 text-subtle-foreground/60" />
                        <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground">
                            Booking Not Found
                        </h2>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate("/bookings")}
                            className="rounded-xl border-border bg-surface text-subtle-foreground hover:bg-surface-sunken hover:text-foreground active:scale-95 transition-all cursor-pointer text-xs font-semibold"
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
        status = "PENDING",
        meeting,
        calendarEvent,
        notes,
        cancellationReason,
        cancelledAt,
        createdAt,
    } = booking;

    const isCancelled = status === "CANCELLED";
    const isCompleted = status === "COMPLETED";

    return (
        <div className="space-y-5 max-w-5xl mx-auto px-4 sm:px-6 py-4 bg-background text-foreground">
            {/* Top Breadcrumb & Action Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/bookings")}
                    className="gap-2 px-2 text-subtle-foreground hover:text-foreground hover:bg-hover transition-colors rounded-xl cursor-pointer"
                >
                    <ArrowLeft className="size-4" />
                    <span className="text-xs font-medium">Back to Bookings</span>
                </Button>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleOpenStatusDialog}
                        className="h-8 gap-1.5 px-3 rounded-xl border-border-subtle bg-surface text-foreground hover:bg-hover text-xs font-semibold cursor-pointer shadow-xs transition-all active:scale-95"
                    >
                        <CheckCircle2 className="size-3.5 text-accent" />
                        <span>Update Status</span>
                    </Button>

                    {!isCancelled && !isCompleted && (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleOpenRescheduleDialog}
                                className="h-8 gap-1.5 px-3 rounded-xl border-border-subtle bg-surface text-foreground hover:bg-hover text-xs font-semibold cursor-pointer shadow-xs transition-all active:scale-95"
                            >
                                <RotateCcw className="size-3.5 text-amber-500" />
                                <span>Reschedule</span>
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setCancellationReasonInput("");
                                    setIsCancelOpen(true);
                                }}
                                className="h-8 gap-1.5 px-3 rounded-xl border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10 text-xs font-semibold cursor-pointer shadow-xs transition-all active:scale-95"
                            >
                                <Ban className="size-3.5" />
                                <span>Cancel</span>
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Main Booking Hero Banner */}
            <Card className="border border-border-subtle bg-surface-elevated text-surface-elevated-foreground shadow-xs rounded-2xl">
                <CardContent className="p-5 sm:p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border-subtle/60 pb-4">
                        <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2.5">
                                <h1 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-foreground">
                                    {serviceSnapshot?.name || service?.name || "Standard Booking"}
                                </h1>
                                <Badge
                                    variant="outline"
                                    className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-lg select-none ${STATUS_VARIANTS[status] || "bg-secondary text-secondary-foreground"
                                        }`}
                                >
                                    {status.replace("_", " ")}
                                </Badge>
                            </div>
                            <p className="text-xs text-subtle-foreground font-mono">
                                Booking ID: {booking._id}
                            </p>
                        </div>

                        <div className="text-left sm:text-right shrink-0">
                            <div className="font-heading text-lg sm:text-xl font-bold text-foreground">
                                {formatPrice(serviceSnapshot?.price, serviceSnapshot?.currency)}
                            </div>
                            <span className="text-[11px] text-subtle-foreground">
                                {serviceSnapshot?.durationInMinutes ? `${serviceSnapshot.durationInMinutes} mins duration` : "Confirmed Fee"}
                            </span>
                        </div>
                    </div>

                    {/* Core Appointment Timing Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-surface border border-border-subtle">
                            <Calendar className="size-4 text-accent shrink-0" />
                            <div>
                                <p className="text-[10px] uppercase font-semibold text-subtle-foreground">Date</p>
                                <p className="font-medium text-foreground">{formatDate(startTime)}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 p-3 rounded-xl bg-surface border border-border-subtle">
                            <Clock className="size-4 text-accent shrink-0" />
                            <div>
                                <p className="text-[10px] uppercase font-semibold text-subtle-foreground">Time Window</p>
                                <p className="font-medium text-foreground">
                                    {formatTime(startTime)} – {formatTime(endTime)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 p-3 rounded-xl bg-surface border border-border-subtle">
                            <Globe className="size-4 text-accent shrink-0" />
                            <div>
                                <p className="text-[10px] uppercase font-semibold text-subtle-foreground">Timezone</p>
                                <p className="font-medium text-foreground truncate">{timezone || "Local"}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 2-Column Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Information Card */}
                <Card className="border border-border-subtle bg-surface-elevated text-surface-elevated-foreground shadow-xs rounded-2xl">
                    <CardContent className="p-5 space-y-3.5">
                        <h2 className="font-heading text-sm font-bold tracking-tight text-foreground flex items-center gap-2 border-b border-border-subtle/60 pb-2.5">
                            <User className="size-4 text-accent" />
                            <span>Customer Details</span>
                        </h2>

                        <div className="space-y-2.5 text-xs">
                            <div className="flex items-center justify-between py-1 border-b border-border-subtle/30">
                                <span className="text-subtle-foreground font-medium">Name:</span>
                                <span className="text-foreground font-semibold">{booker?.name || "-"}</span>
                            </div>
                            <div className="flex items-center justify-between py-1 border-b border-border-subtle/30">
                                <span className="text-subtle-foreground font-medium">Email:</span>
                                <a
                                    href={`mailto:${booker?.email}`}
                                    className="text-foreground hover:text-accent font-medium flex items-center gap-1 transition-colors"
                                >
                                    <Mail className="size-3 text-subtle-foreground/60" />
                                    <span>{booker?.email || "-"}</span>
                                </a>
                            </div>
                            <div className="flex items-center justify-between py-1 border-b border-border-subtle/30">
                                <span className="text-subtle-foreground font-medium">Phone:</span>
                                <a
                                    href={`tel:${booker?.phone}`}
                                    className="text-foreground hover:text-accent font-medium flex items-center gap-1 transition-colors"
                                >
                                    <Phone className="size-3 text-subtle-foreground/60" />
                                    <span>{booker?.phone || "-"}</span>
                                </a>
                            </div>
                            <div className="flex items-center justify-between py-1">
                                <span className="text-subtle-foreground font-medium">Created On:</span>
                                <span className="text-subtle-foreground">{formatDate(createdAt)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Meeting & Location Card */}
                <Card className="border border-border-subtle bg-surface-elevated text-surface-elevated-foreground shadow-xs rounded-2xl">
                    <CardContent className="p-5 space-y-3.5">
                        <h2 className="font-heading text-sm font-bold tracking-tight text-foreground flex items-center gap-2 border-b border-border-subtle/60 pb-2.5">
                            <Video className="size-4 text-accent" />
                            <span>Meeting & Integrations</span>
                        </h2>

                        <div className="space-y-2.5 text-xs">
                            <div className="flex items-center justify-between py-1 border-b border-border-subtle/30">
                                <span className="text-subtle-foreground font-medium">Mode:</span>
                                <span className="text-foreground font-semibold">{serviceSnapshot?.mode || "ONLINE"}</span>
                            </div>

                            {meeting?.link ? (
                                <div className="flex items-center justify-between py-1 border-b border-border-subtle/30">
                                    <span className="text-subtle-foreground font-medium">Meeting Link:</span>
                                    <a
                                        href={meeting.link}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-accent hover:underline font-semibold"
                                    >
                                        <span>Join Call</span>
                                        <ExternalLink className="size-3" />
                                    </a>
                                </div>
                            ) : serviceSnapshot?.address ? (
                                <div className="flex items-start justify-between py-1 border-b border-border-subtle/30 gap-2">
                                    <span className="text-subtle-foreground font-medium shrink-0">Address:</span>
                                    <span className="text-foreground text-right">{serviceSnapshot.address}</span>
                                </div>
                            ) : null}

                            {calendarEvent?.htmlLink && (
                                <div className="flex items-center justify-between py-1 border-b border-border-subtle/30">
                                    <span className="text-subtle-foreground font-medium">Calendar Event:</span>
                                    <a
                                        href={calendarEvent.htmlLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-accent hover:underline font-semibold"
                                    >
                                        <CalendarDays className="size-3.5" />
                                        <span>Open in Google Calendar</span>
                                    </a>
                                </div>
                            )}

                            {isCancelled && cancellationReason && (
                                <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs space-y-1">
                                    <div className="flex items-center gap-1.5 font-bold">
                                        <AlertTriangle className="size-3.5" />
                                        <span>Cancellation Reason</span>
                                    </div>
                                    <p className="text-[11px] leading-relaxed">{cancellationReason}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Internal Staff Notes Card */}
            <Card className="border border-border-subtle bg-surface-elevated text-surface-elevated-foreground shadow-xs rounded-2xl">
                <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-border-subtle/60 pb-2.5">
                        <h2 className="font-heading text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
                            <FileText className="size-4 text-accent" />
                            <span>Internal Notes</span>
                        </h2>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleOpenNotesDialog}
                            className="h-7 gap-1 px-2.5 text-xs font-semibold rounded-lg border-border bg-surface text-subtle-foreground hover:bg-hover hover:text-foreground cursor-pointer shadow-xs transition-all active:scale-95"
                        >
                            <Edit3 className="size-3" />
                            <span>Edit Notes</span>
                        </Button>
                    </div>
                    <p className="text-xs text-subtle-foreground leading-relaxed whitespace-pre-wrap">
                        {notes?.trim() ? notes : "No staff notes attached to this booking yet."}
                    </p>
                </CardContent>
            </Card>

            {/* 1. EDIT NOTES DIALOG */}
            <Dialog open={isNotesOpen} onOpenChange={setIsNotesOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl bg-surface-elevated border-border text-foreground">
                    <form onSubmit={handleUpdateNotes}>
                        <DialogHeader>
                            <DialogTitle className="font-heading text-base font-bold">Edit Booking Notes</DialogTitle>
                            <DialogDescription className="text-xs text-subtle-foreground">
                                Add private notes or instructions regarding this client appointment.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Textarea
                                rows={4}
                                value={notesInput}
                                onChange={(e) => setNotesInput(e.target.value)}
                                placeholder="Enter booking notes..."
                                className="text-xs bg-surface border-border text-foreground placeholder:text-subtle-foreground/60 rounded-xl"
                            />
                        </div>
                        <DialogFooter className="gap-2 sm:space-x-0">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsNotesOpen(false)}
                                className="rounded-xl text-xs font-semibold cursor-pointer"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={isUpdating}
                                className="rounded-xl bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wider cursor-pointer active:scale-95 shadow-xs"
                            >
                                {isUpdating ? "Saving..." : "Save Notes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* 2. UPDATE STATUS DIALOG */}
            <Dialog open={isStatusOpen} onOpenChange={setIsStatusOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl bg-surface-elevated border-border text-foreground">
                    <DialogHeader>
                        <DialogTitle className="font-heading text-base font-bold">Update Booking Status</DialogTitle>
                        <DialogDescription className="text-xs text-subtle-foreground">
                            Modify the lifecycle status of this booking.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-2">
                        <Select value={statusInput} onValueChange={setStatusInput}>
                            <SelectTrigger className="w-full text-xs rounded-xl border-border bg-surface text-foreground cursor-pointer">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-popover text-popover-foreground border-border">
                                <SelectItem value="CONFIRMED" className="text-xs hover:bg-hover cursor-pointer">Confirmed</SelectItem>
                                <SelectItem value="COMPLETED" className="text-xs hover:bg-hover cursor-pointer">Completed</SelectItem>
                                <SelectItem value="CANCELLED" className="text-xs hover:bg-hover cursor-pointer">Cancelled</SelectItem>
                                <SelectItem value="NO_SHOW" className="text-xs hover:bg-hover cursor-pointer">No Show</SelectItem>
                                <SelectItem value="EXPIRED" className="text-xs hover:bg-hover cursor-pointer">Expired</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter className="gap-2 sm:space-x-0">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsStatusOpen(false)}
                            className="rounded-xl text-xs font-semibold cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            disabled={isUpdatingStatus}
                            onClick={handleUpdateStatus}
                            className="rounded-xl bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wider cursor-pointer active:scale-95 shadow-xs"
                        >
                            {isUpdatingStatus ? "Updating..." : "Update Status"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 3. RESCHEDULE DIALOG */}
            <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl bg-surface-elevated border-border text-foreground">
                    <form onSubmit={handleReschedule}>
                        <DialogHeader>
                            <DialogTitle className="font-heading text-base font-bold">Reschedule Appointment</DialogTitle>
                            <DialogDescription className="text-xs text-subtle-foreground">
                                Select a new start date and time for this appointment.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-2">
                            <label htmlFor="reschedule-time" className="text-[11px] font-semibold text-subtle-foreground">
                                New Start Time
                            </label>
                            <Input
                                id="reschedule-time"
                                type="datetime-local"
                                value={rescheduleInput}
                                onChange={(e) => setRescheduleInput(e.target.value)}
                                required
                                className="text-xs bg-surface border-border text-foreground rounded-xl"
                            />
                        </div>
                        <DialogFooter className="gap-2 sm:space-x-0">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsRescheduleOpen(false)}
                                className="rounded-xl text-xs font-semibold cursor-pointer"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={isRescheduling}
                                className="rounded-xl bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wider cursor-pointer active:scale-95 shadow-xs"
                            >
                                {isRescheduling ? "Rescheduling..." : "Confirm Reschedule"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* 4. CANCEL BOOKING DIALOG */}
            <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl bg-surface-elevated border-border text-foreground">
                    <form onSubmit={handleCancelBooking}>
                        <DialogHeader>
                            <DialogTitle className="font-heading text-base font-bold text-destructive">Cancel Booking</DialogTitle>
                            <DialogDescription className="text-xs text-subtle-foreground">
                                Provide a reason for cancelling this appointment.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-2">
                            <label htmlFor="cancellation-reason" className="text-[11px] font-semibold text-subtle-foreground">
                                Cancellation Reason
                            </label>
                            <Textarea
                                id="cancellation-reason"
                                rows={3}
                                value={cancellationReasonInput}
                                onChange={(e) => setCancellationReasonInput(e.target.value)}
                                placeholder="e.g., Client requested cancellation or schedule conflict"
                                required
                                className="text-xs bg-surface border-border text-foreground placeholder:text-subtle-foreground/60 rounded-xl"
                            />
                        </div>
                        <DialogFooter className="gap-2 sm:space-x-0">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsCancelOpen(false)}
                                className="rounded-xl text-xs font-semibold cursor-pointer"
                            >
                                Keep Booking
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={isCancelling}
                                className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-bold uppercase tracking-wider cursor-pointer active:scale-95 shadow-xs"
                            >
                                {isCancelling ? "Cancelling..." : "Confirm Cancellation"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default BookingDetails;