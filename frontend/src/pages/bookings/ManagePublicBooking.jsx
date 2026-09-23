import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  MapPin,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  Globe,
  ArrowLeft,
  Loader2,
  Info,
  Check,
} from "lucide-react";

// Store & Helpers
import { useBookingStore } from "@/stores/index.js";
import {
  formatCurrency,
  getDateKeyInTimezone,
  normalizeTimezone,
  formatSlotTimeInTimezone,
  getUserBrowserTimezone,
  generateAllAvailableInstants,
  isDayDisabledInDisplayTz,
} from "@/pages/organization/services/publicService/publicService.helper.js";

import TimezoneCombobox from "@/components/publicService/TimezoneCombobox";

// shadcn UI Components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// In-file formatters
const formatBookingDate = (dateString, timezone) => {
  if (!dateString) return "";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: normalizeTimezone(timezone),
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateString));
};

const formatCompactDate = (dateString, timezone) => {
  if (!dateString) return "";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: normalizeTimezone(timezone),
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(dateString));
};

const formatBookingTimeRange = (startTime, endTime, timezone) => {
  if (!startTime) return "";
  const tz = normalizeTimezone(timezone);
  const startFormatted = formatSlotTimeInTimezone(new Date(startTime), tz);
  const endFormatted = endTime
    ? formatSlotTimeInTimezone(new Date(endTime), tz)
    : "";
  return endFormatted ? `${startFormatted} – ${endFormatted}` : startFormatted;
};

// ============================================================================
// Component 1: ManagePublicBooking (Primary Page Orchestrator)
// ============================================================================
export default function ManagePublicBooking() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const {
    booking: bookingData,
    isLoadingBooking,
    bookingError,
    getPublicBooking,
    publicCancelBooking,
    isCancelling,
  } = useBookingStore();

  const [isReschedulingView, setIsReschedulingView] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // Default detect user's device/browser timezone
  const [displayTimezone, setDisplayTimezone] = useState(() => getUserBrowserTimezone());

  useEffect(() => {
    if (token) {
      getPublicBooking(token).catch(() => { });
    }
  }, [token, getPublicBooking]);

  const handleCancelSubmit = async () => {
    try {
      await publicCancelBooking({
        token,
        cancellationReason: cancelReason.trim() || undefined,
      });
      toast.success("Appointment cancelled successfully.");
      await getPublicBooking(token).catch(() => { });
      setIsCancelDialogOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to cancel appointment.");
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-xs text-center text-card-foreground">
          <div className="w-12 h-12 bg-warning/10 text-warning border border-warning/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-foreground tracking-tight mb-2">
            Invalid Access Link
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            A valid security token is required to manage this booking. Please check your confirmation email.
          </p>
        </div>
      </div>
    );
  }

  if (isLoadingBooking) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-4 sm:p-6">
        <div className="w-full max-w-xl bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 text-card-foreground">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-7 w-64" />
              <Skeleton className="h-4 w-36" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Separator />
          <div className="space-y-4">
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
          <Separator />
          <div className="flex justify-end gap-3 pt-2">
            <Skeleton className="h-9 w-28 rounded-xl" />
            <Skeleton className="h-9 w-32 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (bookingError || !bookingData) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-xs text-center text-card-foreground">
          <div className="w-12 h-12 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-foreground tracking-tight mb-2">
            Unable to Load Booking
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
            {bookingError || "This booking link has expired or is invalid."}
          </p>
          <Button
            variant="outline"
            className="h-9 rounded-xl border-border/80 text-foreground cursor-pointer text-xs font-medium"
            onClick={() => getPublicBooking(token)}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between antialiased selection:bg-primary selection:text-primary-foreground">
      {/* Brand Header */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a
            href="/"
            className="flex items-center gap-2 group transition-all cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring rounded-lg p-1 -ml-1"
          >
            <span className="font-extrabold text-foreground tracking-tight text-lg group-hover:opacity-80 transition-opacity">
              mini<span className="text-primary">CRM</span>
            </span>
          </a>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hidden sm:inline">
            Manage Booking
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 flex flex-col items-center justify-center">
        {isReschedulingView ? (
          <RescheduleInlineView
            token={token}
            bookingData={bookingData}
            onBack={() => setIsReschedulingView(false)}
            displayTimezone={displayTimezone}
            setDisplayTimezone={setDisplayTimezone}
          />
        ) : (
          <div className="w-full max-w-xl">
            <BookingDetailsCard
              data={bookingData}
              onOpenReschedule={() => setIsReschedulingView(true)}
              onOpenCancel={() => setIsCancelDialogOpen(true)}
              displayTimezone={displayTimezone}
              setDisplayTimezone={setDisplayTimezone}
            />
          </div>
        )}
      </main>

      {/* Cancellation Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border text-card-foreground p-6 rounded-2xl [&>button]:cursor-pointer [&>button]:rounded-full">
          <DialogHeader>
            <div className="h-10 w-10 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 flex items-center justify-center mb-1">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              Cancel Appointment
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
              Are you sure you want to cancel your upcoming session? This action cannot be reversed.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 space-y-2">
            <label
              htmlFor="cancel-reason"
              className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block"
            >
              Reason for cancellation (optional)
            </label>
            <Textarea
              id="cancel-reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Let us know why you need to cancel..."
              className="resize-none h-24 rounded-xl border-border/80 bg-background text-xs sm:text-sm text-foreground focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground/60 shadow-2xs"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsCancelDialogOpen(false)}
              className="h-9 rounded-xl text-xs font-medium border-border/80 text-foreground cursor-pointer"
            >
              Keep Appointment
            </Button>
            <Button
              variant="destructive"
              type="button"
              disabled={isCancelling}
              onClick={handleCancelSubmit}
              className="h-9 rounded-xl text-xs font-medium cursor-pointer shadow-2xs"
            >
              {isCancelling ? "Cancelling..." : "Confirm Cancellation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Public Footer */}
      <footer className="border-t border-border/60 bg-background/50 py-6 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} <span className="font-semibold text-foreground">miniCRM</span>. All rights reserved.
      </footer>
    </div>
  );
}

// ============================================================================
// Component 2: BookingDetailsCard (Standalone Overview)
// ============================================================================
function BookingDetailsCard({ data, onOpenReschedule, onOpenCancel, displayTimezone, setDisplayTimezone }) {
  const {
    organization = {},
    service = {},
    booker = {},
    booking = {},
    meeting = {},
    cancellation = {},
    permissions = {},
  } = data || {};
  const serviceTimezone = normalizeTimezone(booking?.timezone || booking?.service?.availability?.timezone || "UTC");
  const clientTimezone = displayTimezone || serviceTimezone;
  const isTerminalState = ["CANCELLED", "COMPLETED", "NO_SHOW"].includes(booking?.status);

  const getStatusBadge = (status) => {
    const config = {
      CONFIRMED: {
        label: "Confirmed",
        className: "bg-success/10 text-success border-success/20",
        dotClassName: "bg-success animate-pulse",
      },
      CANCELLED: {
        label: "Cancelled",
        className: "bg-destructive/10 text-destructive border-destructive/20",
        dotClassName: "bg-destructive",
      },
      COMPLETED: {
        label: "Completed",
        className: "bg-muted text-muted-foreground border-border",
        dotClassName: "bg-muted-foreground",
      },
      NO_SHOW: {
        label: "No Show",
        className: "bg-warning/10 text-warning border-warning/20",
        dotClassName: "bg-warning",
      },
    };
    const current = config[status] || {
      label: status || "Pending",
      className: "bg-muted text-muted-foreground border-border",
      dotClassName: "bg-muted-foreground",
    };
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider border ${current.className}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${current.dotClassName}`} />
        {current.label}
      </span>
    );
  };

  return (
    <section className="bg-card border border-border/80 rounded-2xl shadow-xs p-6 sm:p-8 text-card-foreground">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 pb-6 border-b border-border/60">
        <div className="space-y-1 min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {organization?.name || "Appointment"}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground truncate">
            {service?.name || "Service Session"}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 pt-0.5">
            <Clock className="h-3.5 w-3.5" />
            <span>{service?.durationInMinutes || 30} mins</span>
            <span>·</span>
            <span>{formatCurrency(service?.price, service?.currency)}</span>
          </p>
        </div>
        <div className="shrink-0">{getStatusBadge(booking?.status)}</div>
      </div>

      {/* Details list */}
      <div className="py-6 space-y-4 sm:space-y-5">
        {/* Timezone Context Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/80 bg-muted/20">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="text-xs">
              <span className="text-muted-foreground">Service Timezone: </span>
              <span className="font-semibold text-foreground">{serviceTimezone}</span>
            </div>
          </div>
          {setDisplayTimezone && (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Your Timezone:
              </span>
              <TimezoneCombobox
                value={clientTimezone}
                onChange={setDisplayTimezone}
                className="h-8 text-xs"
              />
            </div>
          )}
        </div>

        {/* Date & Time */}
        <div className="flex items-start gap-3.5 rounded-xl border border-border/80 bg-muted/30 p-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-2">
              <p className="text-base font-bold text-foreground">
                {formatBookingDate(booking?.startTime, clientTimezone) || "Date pending"}
              </p>
              <span className="text-xs text-primary font-medium">
                ({clientTimezone})
              </span>
            </div>
            <p className="text-xs sm:text-sm text-foreground/80 font-semibold mt-0.5">
              {formatBookingTimeRange(booking?.startTime, booking?.endTime, clientTimezone) || "Time pending"}
            </p>
            {clientTimezone !== serviceTimezone && (
              <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/60 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>
                  Provider operating time:{" "}
                  <strong className="text-foreground font-semibold">
                    {formatBookingTimeRange(booking?.startTime, booking?.endTime, serviceTimezone)}
                  </strong>{" "}
                  ({serviceTimezone})
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Location / Meeting Link */}
        <div className="flex items-start gap-3.5 rounded-xl border border-border/80 bg-muted/30 p-4">
          <div className="w-10 h-10 rounded-xl bg-muted/60 text-muted-foreground border border-border/80 flex items-center justify-center shrink-0">
            {service?.mode === "ONLINE" ? (
              <Video className="w-5 h-5" />
            ) : (
              <MapPin className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-bold text-foreground">
              {service?.mode === "ONLINE" ? "Online Virtual Session" : "In-Person Meeting"}
            </p>
            {service?.mode === "ONLINE" ? (
              <div className="mt-2">
                {meeting?.link && !isTerminalState ? (
                  <Button
                    size="sm"
                    asChild
                    className="h-9 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-2xs gap-1.5 transition-colors cursor-pointer text-xs"
                  >
                    <a href={meeting.link} target="_blank" rel="noopener noreferrer">
                      Join {meeting.provider ? meeting.provider.replace("_", " ") : "Meeting"}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </Button>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {isTerminalState
                      ? "Meeting link is inactive."
                      : "Meeting details will be provided before the session starts."}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">Location provided upon confirmation.</p>
            )}
          </div>
        </div>

        {/* Attendee Info */}
        <div className="rounded-xl border border-border/80 bg-muted/30 p-4 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Booked For
          </p>
          <div className="pt-1">
            <p className="text-xs sm:text-sm font-bold text-foreground">{booker?.name || "Client"}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {booker?.email} {booker?.phone ? `· ${booker.phone}` : ""}
            </p>
          </div>
          {booking?.notes && booking.notes !== "No additional notes were provided." && (
            <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/60">
              <span className="font-semibold text-foreground">Notes:</span> {booking.notes}
            </p>
          )}
        </div>

        {/* Cancelled Notice */}
        {booking?.status === "CANCELLED" && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive space-y-1">
            <p className="font-bold">This appointment has been cancelled.</p>
            {cancellation?.reason && (
              <p className="text-destructive/80">Reason: {cancellation.reason}</p>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {!isTerminalState && (
        <div className="pt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-border/60">
          {permissions?.canCancel && (
            <Button
              variant="ghost"
              type="button"
              onClick={onOpenCancel}
              className="w-full sm:w-auto h-9 rounded-xl text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
            >
              Cancel Booking
            </Button>
          )}
          {permissions?.canReschedule && (
            <Button
              type="button"
              onClick={onOpenReschedule}
              className="w-full sm:w-auto h-9 px-4 rounded-xl text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs transition-colors cursor-pointer"
            >
              Reschedule Appointment
            </Button>
          )}
        </div>
      )}
    </section>
  );
}

// ============================================================================
// Component 3: RescheduleInlineView (Inline Split View with Timezone Switching)
// ============================================================================
function RescheduleInlineView({
  token,
  bookingData,
  onBack,
  displayTimezone,
  setDisplayTimezone,
}) {
  const { publicRescheduleBooking, isRescheduling, getPublicBooking } = useBookingStore();

  const { organization, service, booking, rescheduling } = bookingData || {};
  const serviceTimezone = normalizeTimezone(
    rescheduling?.availability?.timezone || booking?.timezone
  );
  const availability = rescheduling?.availability;
  const duration = service?.durationInMinutes || 30;
  const currentStartTime = booking?.startTime;

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Generate concrete UTC instants for all available slots in the upcoming window
  const allSlotInstants = useMemo(() => {
    if (!availability) return [];
    return generateAllAvailableInstants(availability, duration);
  }, [availability, duration]);

  // Filter available slots into the attendee's selected display timezone for the selected calendar date
  const displayedSlots = useMemo(() => {
    if (!selectedDate || !allSlotInstants.length) return [];
    const dateKey = getDateKeyInTimezone(selectedDate, displayTimezone);
    const currentStartMs = currentStartTime ? new Date(currentStartTime).getTime() : null;

    return allSlotInstants
      .filter((slot) => getDateKeyInTimezone(slot.utcDate, displayTimezone) === dateKey)
      .map((slot) => {
        const endInstant = new Date(slot.utcDate.getTime() + duration * 60 * 1000);
        const isCurrent = currentStartMs === slot.utcDate.getTime();
        return {
          ...slot,
          label: formatSlotTimeInTimezone(slot.utcDate, displayTimezone),
          endLabel: formatSlotTimeInTimezone(endInstant, displayTimezone),
          isCurrent,
          isSelectable: !isCurrent,
        };
      });
  }, [selectedDate, allSlotInstants, displayTimezone, duration, currentStartTime]);

  // Calendar Day Disablement: only enables days that actually have bookable slots in the chosen timezone
  const isDateDisabled = (date) => {
    if (!date || !allSlotInstants.length) return true;
    return isDayDisabledInDisplayTz(date, allSlotInstants, displayTimezone);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleConfirmReschedule = async () => {
    if (!selectedSlot?.isoString) return;

    try {
      await publicRescheduleBooking({
        token,
        startTime: selectedSlot.isoString,
      });
      toast.success("Your appointment has been rescheduled.");
      await getPublicBooking(token).catch(() => { });
      onBack();
    } catch (error) {
      const errorMsg = error?.response?.data?.message || "";
      if (
        errorMsg.toLowerCase().includes("booked") ||
        errorMsg.toLowerCase().includes("unavailable") ||
        error?.response?.status === 409
      ) {
        toast.error("This slot was just booked. Please select another time.");
        await getPublicBooking(token).catch(() => { });
        setSelectedSlot(null);
      } else {
        toast.error(errorMsg || "Unable to reschedule appointment. Please try again.");
      }
    }
  };

  return (
    <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
      {/* Left Column: Service Details & Current Schedule */}
      <div className="lg:col-span-4 lg:sticky lg:top-24 bg-card border border-border/80 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6 text-card-foreground">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground -ml-2 h-8 gap-1.5 cursor-pointer text-xs font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to details
        </Button>

        <div>
          <Badge
            variant="outline"
            className="bg-primary/10 text-primary border-primary/20 uppercase tracking-wider text-[10px] font-semibold px-2.5 py-0.5 rounded-full"
          >
            {organization?.name || "Service Provider"}
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight text-foreground mt-2.5">
            {service?.name || "Reschedule Appointment"}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-2.5">
            Select a new date and time for your appointment from the available slots within the upcoming booking window.
          </p>
        </div>

        <Separator />

        <div className="space-y-4 text-xs sm:text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Price</span>
            <span className="text-lg font-bold text-foreground">
              {formatCurrency(service?.price, service?.currency)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Duration</span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-foreground bg-muted/60 px-2.5 py-1 rounded-lg border border-border/80 text-xs">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              {duration} mins
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Location</span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-foreground text-xs">
              {service?.mode === "ONLINE" ? (
                <>
                  <Video className="w-3.5 h-3.5 text-primary" />
                  Virtual Video Call
                </>
              ) : (
                <>
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                  In-Person
                </>
              )}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Service Timezone</span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-foreground bg-muted/60 px-2.5 py-1 rounded-lg border border-border/80 text-xs">
              <Globe className="w-3.5 h-3.5 text-muted-foreground" />
              {serviceTimezone}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Your Timezone</span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20 text-xs">
              <Globe className="w-3.5 h-3.5 text-primary" />
              {displayTimezone}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-border/80 bg-muted/40 p-3.5 space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Current Appointment
          </p>
          <p className="text-xs sm:text-sm font-bold text-foreground mt-0.5">
            {formatCompactDate(currentStartTime, displayTimezone)}
          </p>
          <p className="text-xs text-foreground/90 font-medium">
            {formatBookingTimeRange(currentStartTime, booking?.endTime, displayTimezone)} ({displayTimezone})
          </p>
          {displayTimezone !== serviceTimezone && (
            <p className="text-[11px] text-muted-foreground border-t border-border/60 pt-1.5 mt-1">
              Host time: {formatBookingTimeRange(currentStartTime, booking?.endTime, serviceTimezone)} ({serviceTimezone})
            </p>
          )}
        </div>
      </div>

      {/* Right Column: Calendar & Available Slots */}
      <div className="lg:col-span-8 bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 sm:space-y-8 text-card-foreground">
        {/* Section Title & Timezone Dropdown Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div className="space-y-1">
            <h3 className="text-xl font-bold tracking-tight text-foreground">
              Select Date & Time
            </h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>
                Service operates in <strong className="font-semibold text-foreground">{serviceTimezone}</strong>. Displayed slots are converted to your timezone.
              </span>
            </p>
          </div>

          {/* Timezone Combobox Dropdown */}
          <div className="flex flex-col sm:items-end gap-1 shrink-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Your Timezone
            </span>
            <TimezoneCombobox
              value={displayTimezone}
              onChange={(newTz) => {
                setDisplayTimezone(newTz);
                setSelectedSlot(null);
              }}
            />
          </div>
        </div>

        {/* Centered Calendar Card */}
        <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 sm:p-6 flex flex-col items-center justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={isDateDisabled}
            initialFocus
            className="p-3 bg-card border border-border/80 rounded-xl shadow-2xs pointer-events-auto"
            classNames={{
              day_selected:
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-xl font-semibold shadow-xs",
              day_today: "bg-muted text-foreground font-semibold rounded-xl",
              day: "h-9 w-9 p-0 font-medium rounded-xl hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer",
            }}
          />
        </div>

        {/* Available Slots Section */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              {selectedDate
                ? `Available Slots (${formatCompactDate(selectedDate, displayTimezone)})`
                : "Available Slots"}
            </span>
            {selectedDate && (
              <span className="text-[10px] text-muted-foreground font-medium">
                Times shown in {displayTimezone}
              </span>
            )}
          </div>

          {!selectedDate ? (
            <div className="p-8 border border-dashed border-border/80 rounded-xl text-center">
              <CalendarIcon className="w-8 h-8 text-muted-foreground/60 mx-auto mb-2 stroke-1" />
              <p className="text-xs sm:text-sm font-semibold text-foreground">Please select a date from the calendar</p>
              <p className="text-xs text-muted-foreground mt-0.5">Bookings can be scheduled up to 35 days in advance.</p>
            </div>
          ) : displayedSlots.length === 0 ? (
            <div className="p-8 border border-dashed border-border/80 rounded-xl text-center">
              <p className="text-xs sm:text-sm font-semibold text-foreground">
                No available slots on this day in {displayTimezone}.
              </p>
              <p className="text-xs text-muted-foreground mt-1">Please select another date from the calendar.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {displayedSlots.map((slot) => {
                const isSelected = selectedSlot?.isoString === slot.isoString;

                if (slot.isCurrent) {
                  return (
                    <button
                      key={slot.isoString}
                      disabled
                      type="button"
                      className="h-11 px-3 text-xs font-medium rounded-xl border border-border/60 bg-muted/40 text-muted-foreground cursor-not-allowed text-center flex flex-col items-center justify-center"
                    >
                      <span className="font-semibold">{slot.label}</span>
                      <span className="text-[10px] text-muted-foreground/70 font-normal">Current</span>
                    </button>
                  );
                }

                if (!slot.isSelectable) {
                  return (
                    <button
                      key={slot.isoString}
                      disabled
                      type="button"
                      className="h-11 px-3 text-xs font-medium rounded-xl border border-border/30 bg-muted/20 text-muted-foreground/40 cursor-not-allowed text-center flex flex-col items-center justify-center"
                    >
                      <span className="font-semibold">{slot.label}</span>
                      <span className="text-[10px] text-muted-foreground/40 font-normal">Unavailable</span>
                    </button>
                  );
                }

                return (
                  <button
                    key={slot.isoString}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`h-11 px-3 text-xs font-medium rounded-xl border transition-all text-center flex items-center justify-center cursor-pointer ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-xs ring-2 ring-primary/20 font-semibold"
                        : "bg-card text-foreground border-border/80 hover:border-primary/60 hover:bg-primary/5 active:scale-[0.98]"
                    }`}
                  >
                    {slot.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Confirmation Footer Bar */}
        {selectedSlot && (
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in-0 duration-200">
            <div className="flex flex-col gap-1 text-xs text-foreground font-medium">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>
                  New time:{" "}
                  <span className="font-bold">
                    {formatCompactDate(selectedSlot.isoString, displayTimezone)} · {selectedSlot.label} – {selectedSlot.endLabel}
                  </span>
                  <span className="text-primary font-semibold ml-1">({displayTimezone})</span>
                </span>
              </div>
              {displayTimezone !== serviceTimezone && (
                <p className="text-[11px] text-muted-foreground ml-6">
                  Provider operates in {serviceTimezone}: {formatSlotTimeInTimezone(selectedSlot.utcDate, serviceTimezone)} – {formatSlotTimeInTimezone(new Date(selectedSlot.utcDate.getTime() + duration * 60000), serviceTimezone)}
                </p>
              )}
            </div>
            <Button
              type="button"
              disabled={isRescheduling}
              onClick={handleConfirmReschedule}
              className="w-full sm:w-auto h-9 px-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium shadow-2xs cursor-pointer"
            >
              {isRescheduling ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Updating...
                </>
              ) : (
                "Confirm Reschedule"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}