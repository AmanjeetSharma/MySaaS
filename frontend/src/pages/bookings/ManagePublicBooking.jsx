import React, { useEffect, useMemo, useState } from "react";
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
  createInstantFromServiceSlot,
  formatSlotTimeInTimezone,
} from "@/pages/organization/services/publicService/publicService.helper.js";

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

const WEEKDAY_NAMES = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

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

  useEffect(() => {
    if (token) {
      getPublicBooking(token).catch(() => {});
    }
  }, [token, getPublicBooking]);

  const handleCancelSubmit = async () => {
    try {
      await publicCancelBooking({
        token,
        cancellationReason: cancelReason.trim() || undefined,
      });
      toast.success("Appointment cancelled successfully.");
      setIsCancelDialogOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to cancel appointment.");
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50/60 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xs text-center">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-amber-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight mb-2">
            Invalid Access Link
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            A valid security token is required to manage this booking. Please check your confirmation email.
          </p>
        </div>
      </div>
    );
  }

  if (isLoadingBooking) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col justify-center items-center p-4 sm:p-6">
        <div className="w-full max-w-xl bg-white border border-slate-200/70 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
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
            <Skeleton className="h-10 w-28 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (bookingError || !bookingData) {
    return (
      <div className="min-h-screen bg-slate-50/60 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xs text-center">
          <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6 text-rose-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight mb-2">
            Unable to Load Booking
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            {bookingError || "This booking link has expired or is invalid."}
          </p>
          <Button
            variant="outline"
            className="border-slate-200 text-slate-700"
            onClick={() => getPublicBooking(token)}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <header className="w-full max-w-6xl pb-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight text-slate-900">mini<span className="text-purple-600">CRM</span></span>
        </div>
      </header>

      {/* Main Content: Details vs Inline Reschedule */}
      {isReschedulingView ? (
        <RescheduleInlineView
          token={token}
          bookingData={bookingData}
          onBack={() => setIsReschedulingView(false)}
        />
      ) : (
        <div className="w-full max-w-xl">
          <BookingDetailsCard
            data={bookingData}
            onOpenReschedule={() => setIsReschedulingView(true)}
            onOpenCancel={() => setIsCancelDialogOpen(true)}
          />
        </div>
      )}

      {/* Cancellation Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white border-slate-200 p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-900">
              Cancel Appointment
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 mt-1.5">
              Are you sure you want to cancel your upcoming session? This action cannot be reversed.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <label
              htmlFor="cancel-reason"
              className="text-xs font-semibold text-slate-600 mb-2 block"
            >
              Reason for cancellation (optional)
            </label>
            <Textarea
              id="cancel-reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Let us know why you need to cancel..."
              className="resize-none h-24 border-slate-200 focus-visible:ring-purple-600 text-sm"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsCancelDialogOpen(false)}
              className="border-slate-200 text-slate-700"
            >
              Keep Appointment
            </Button>
            <Button
              variant="destructive"
              type="button"
              disabled={isCancelling}
              onClick={handleCancelSubmit}
              className="bg-rose-600 hover:bg-rose-700 text-white font-medium"
            >
              {isCancelling ? "Cancelling..." : "Confirm Cancellation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================================
// Component 2: BookingDetailsCard (Standalone Overview)
// ============================================================================
function BookingDetailsCard({ data, onOpenReschedule, onOpenCancel }) {
  const { organization, service, booker, booking, meeting, cancellation, permissions } = data;
  const timezone = normalizeTimezone(booking?.timezone);
  const isTerminalState = ["CANCELLED", "COMPLETED", "NO_SHOW"].includes(booking?.status);

  const getStatusBadge = (status) => {
    const config = {
      CONFIRMED: { label: "Confirmed", className: "bg-emerald-50 text-emerald-700 border-emerald-200/70" },
      CANCELLED: { label: "Cancelled", className: "bg-rose-50 text-rose-700 border-rose-200/70" },
      COMPLETED: { label: "Completed", className: "bg-slate-100 text-slate-600 border-slate-200" },
      NO_SHOW: { label: "No Show", className: "bg-amber-50 text-amber-700 border-amber-200/70" },
    };
    const current = config[status] || { label: status, className: "bg-slate-100 text-slate-600 border-slate-200" };
    return (
      <Badge variant="outline" className={`px-2.5 py-0.5 font-medium ${current.className}`}>
        {current.label}
      </Badge>
    );
  };

  return (
    <section className="bg-white border border-slate-200/80 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-6 sm:p-9">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 pb-6">
        <div className="space-y-1">
          <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            {organization?.name || "Appointment"}
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {service?.name}
          </h1>
          <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5 pt-0.5">
            <span>{service?.durationInMinutes} min</span>
            <span className="text-slate-300">·</span>
            <span>{formatCurrency(service?.price, service?.currency)}</span>
          </p>
        </div>
        <div>{getStatusBadge(booking?.status)}</div>
      </div>

      <Separator className="bg-slate-100" />

      {/* Details list */}
      <div className="py-6 space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 border border-purple-100/70">
            <CalendarIcon className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-800">
              {formatBookingDate(booking?.startTime, timezone)}
            </p>
            <p className="text-sm text-slate-600 font-medium mt-0.5">
              {formatBookingTimeRange(booking?.startTime, booking?.endTime, timezone)}
            </p>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Timezone: {timezone}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
            {service?.mode === "ONLINE" ? (
              <Video className="w-5 h-5 text-slate-600" />
            ) : (
              <MapPin className="w-5 h-5 text-slate-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800">
              {service?.mode === "ONLINE" ? "Online Session" : "In-Person Meeting"}
            </p>
            {service?.mode === "ONLINE" ? (
              <div className="mt-2">
                {meeting?.link && !isTerminalState ? (
                  <Button
                    size="sm"
                    asChild
                    className="bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-xs gap-1.5 transition-colors"
                  >
                    <a href={meeting.link} target="_blank" rel="noopener noreferrer">
                      Join {meeting.provider ? meeting.provider.replace("_", " ") : "Meeting"}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </Button>
                ) : (
                  <p className="text-xs text-slate-500">
                    {isTerminalState
                      ? "Meeting link is inactive."
                      : "Meeting details will be provided before the session starts."}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 mt-1">Location provided upon confirmation.</p>
            )}
          </div>
        </div>

        <div className="bg-slate-50/70 border border-slate-200/60 rounded-xl p-4">
          <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Booked For
          </p>
          <div className="mt-1.5">
            <p className="text-sm font-semibold text-slate-800">{booker?.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {booker?.email} {booker?.phone ? `· ${booker.phone}` : ""}
            </p>
          </div>
          {booking?.notes && booking.notes !== "No additional notes were provided." && (
            <p className="text-xs text-slate-500 mt-2.5 pt-2 border-t border-slate-200/50">
              <span className="font-medium text-slate-600">Notes:</span> {booking.notes}
            </p>
          )}
        </div>

        {booking?.status === "CANCELLED" && (
          <div className="bg-rose-50/60 border border-rose-200/70 rounded-xl p-4 text-xs text-rose-800">
            <p className="font-semibold mb-0.5">This appointment has been cancelled.</p>
            {cancellation?.reason && (
              <p className="text-rose-700">Reason: {cancellation.reason}</p>
            )}
          </div>
        )}
      </div>

      {!isTerminalState && (
        <>
          <Separator className="bg-slate-100" />
          <div className="pt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
            {permissions?.canCancel && (
              <Button
                variant="ghost"
                type="button"
                onClick={onOpenCancel}
                className="w-full sm:w-auto text-slate-500 hover:text-rose-600 hover:bg-rose-50/80 font-medium"
              >
                Cancel Booking
              </Button>
            )}
            {permissions?.canReschedule && (
              <Button
                type="button"
                onClick={onOpenReschedule}
                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-xs transition-colors"
              >
                Reschedule Appointment
              </Button>
            )}
          </div>
        </>
      )}
    </section>
  );
}

// ============================================================================
// Component 3: RescheduleInlineView (Inline Split View Inspired by Booking UI)
// ============================================================================
function RescheduleInlineView({ token, bookingData, onBack }) {
  const { publicRescheduleBooking, isRescheduling, getPublicBooking } = useBookingStore();

  const { organization, service, booking, rescheduling } = bookingData;
  const timezone = normalizeTimezone(
    rescheduling?.availability?.timezone || booking?.timezone
  );
  const availability = rescheduling?.availability;
  const duration = service?.durationInMinutes || 30;
  const currentStartTime = booking?.startTime;

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Maximum selectable window: strictly 30 days ahead from today in target timezone
  const { minDateKey, maxDateKey } = useMemo(() => {
    const today = new Date();
    const minKey = getDateKeyInTimezone(today, timezone);

    const max = new Date();
    max.setDate(max.getDate() + 30);
    const maxKey = getDateKeyInTimezone(max, timezone);

    return { minDateKey: minKey, maxDateKey: maxKey };
  }, [timezone]);

  // Available slots for currently selected calendar date
  const availableSlots = useMemo(() => {
    if (!selectedDate || !availability?.days) return [];

    const dateKey = getDateKeyInTimezone(selectedDate, timezone);
    const [year, month, day] = dateKey.split("-").map(Number);
    const dayIndex = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
    const dayName = WEEKDAY_NAMES[dayIndex];

    const dayConfig = availability.days[dayName];
    if (!dayConfig?.enabled || !dayConfig?.slots?.length) return [];

    const step = duration > 0 ? duration : 30;
    const slots = [];
    const now = new Date();

    dayConfig.slots.forEach((range) => {
      let current = range.startTime;
      while (current + step <= range.endTime) {
        const instant = createInstantFromServiceSlot(dateKey, current, timezone);
        const endInstant = createInstantFromServiceSlot(dateKey, current + step, timezone);

        const isPast = instant <= now;
        const isCurrent = currentStartTime
          ? new Date(currentStartTime).getTime() === instant.getTime()
          : false;

        slots.push({
          startTimeMinutes: current,
          endTimeMinutes: current + step,
          utcInstant: instant,
          isoString: instant.toISOString(),
          label: formatSlotTimeInTimezone(instant, timezone),
          endLabel: formatSlotTimeInTimezone(endInstant, timezone),
          isPast,
          isCurrent,
          isBooked: false, // Clean anchor for backend-provided reserved ranges
          isSelectable: !isPast && !isCurrent,
        });

        current += step;
      }
    });

    return slots;
  }, [selectedDate, availability, duration, currentStartTime, timezone]);

  // Calendar Day Disablement: (Past dates, >30 days, or disabled recurring days)
  const isDateDisabled = (date) => {
    if (!availability?.days || !date) return true;

    const targetDateKey = getDateKeyInTimezone(date, timezone);
    if (targetDateKey < minDateKey || targetDateKey > maxDateKey) return true;

    const [year, month, day] = targetDateKey.split("-").map(Number);
    const dayIndex = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
    const dayName = WEEKDAY_NAMES[dayIndex];

    const dayConfig = availability.days[dayName];
    return !(dayConfig?.enabled && Array.isArray(dayConfig?.slots) && dayConfig.slots.length > 0);
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
      onBack();
    } catch (error) {
      const errorMsg = error?.response?.data?.message || "";
      if (
        errorMsg.toLowerCase().includes("booked") ||
        errorMsg.toLowerCase().includes("unavailable") ||
        error?.response?.status === 409
      ) {
        toast.error("This slot was just booked. Please select another time.");
        await getPublicBooking(token).catch(() => {});
        setSelectedSlot(null);
      } else {
        toast.error(errorMsg || "Unable to reschedule appointment. Please try again.");
      }
    }
  };

  return (
    <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Service Details & Current Schedule */}
      <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-slate-500 hover:text-slate-900 -ml-2 mb-2 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to details
        </Button>

        <div>
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200/60 uppercase tracking-wider text-[10px] font-semibold px-2.5 py-0.5 rounded-full"
          >
            {organization?.name || "Service Provider"}
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-2.5">
            {service?.name}
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed mt-3">
            Select a new date and time for your appointment from the available calendar slots within the next 30 days.
          </p>
        </div>

        <Separator className="bg-slate-100" />

        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Price</span>
            <span className="text-xl font-bold text-slate-900">
              {formatCurrency(service?.price, service?.currency)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Duration</span>
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 text-xs">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {service?.durationInMinutes} mins
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Location</span>
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 text-xs">
              {service?.mode === "ONLINE" ? (
                <>
                  <Video className="w-3.5 h-3.5 text-purple-600" />
                  Virtual Video Call
                </>
              ) : (
                <>
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  In-Person
                </>
              )}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Service Timezone</span>
            <span className="inline-flex items-center gap-1.5 font-medium text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-100 text-xs">
              <Globe className="w-3.5 h-3.5 text-purple-600" />
              {timezone}
            </span>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4">
          <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Current Appointment
          </p>
          <p className="text-sm font-semibold text-slate-800 mt-1">
            {formatCompactDate(currentStartTime, timezone)}
          </p>
          <p className="text-xs text-slate-500">
            {formatBookingTimeRange(currentStartTime, booking?.endTime, timezone)}
          </p>
        </div>
      </div>

      {/* Right Column: Calendar & Available Slots */}
      <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-8">
        {/* Section Title & Timezone Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-slate-900">
              Select Date & Time
            </h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              Provider operates in <span className="font-semibold text-slate-700">{timezone}</span>. Displayed slots are adjusted to this timezone.
            </p>
          </div>
          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-50 border border-slate-200/70 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-lg">
            <Globe className="w-3.5 h-3.5 text-purple-600" />
            <span>{timezone}</span>
          </div>
        </div>

        {/* Centered Calendar Card */}
        <div className="bg-slate-50/50 border border-slate-200/60 rounded-2xl p-6 flex flex-col items-center justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={isDateDisabled}
            initialFocus
            className="p-3 bg-white border border-slate-200/80 rounded-xl shadow-xs pointer-events-auto"
            classNames={{
              day_selected:
                "bg-purple-600 text-white hover:bg-purple-600 hover:text-white focus:bg-purple-600 focus:text-white rounded-xl font-medium",
              day_today: "bg-slate-100 text-slate-900 font-semibold rounded-xl",
              day: "h-10 w-10 p-0 font-normal rounded-xl hover:bg-purple-50 transition-colors",
            }}
          />
        </div>

        {/* Available Slots Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {selectedDate
                ? `Available Slots (${formatCompactDate(selectedDate, timezone)})`
                : "Available Slots"}
            </span>
          </div>

          {!selectedDate ? (
            <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center">
              <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto mb-2 stroke-1" />
              <p className="text-sm font-medium text-slate-600">Please select a date from the calendar</p>
              <p className="text-xs text-slate-400 mt-0.5">Bookings can be scheduled up to 30 days in advance.</p>
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center">
              <p className="text-sm font-medium text-slate-600">
                No available slots on this day in {timezone}.
              </p>
              <p className="text-xs text-slate-400 mt-1">Please select another date from the calendar.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {availableSlots.map((slot) => {
                const isSelected = selectedSlot?.isoString === slot.isoString;

                if (slot.isCurrent) {
                  return (
                    <button
                      key={slot.startTimeMinutes}
                      disabled
                      type="button"
                      className="py-2.5 px-3 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed text-center"
                    >
                      {slot.label}
                      <span className="block text-[10px] text-slate-400 font-normal">Current</span>
                    </button>
                  );
                }

                if (!slot.isSelectable) {
                  return (
                    <button
                      key={slot.startTimeMinutes}
                      disabled
                      type="button"
                      className="py-2.5 px-3 text-xs font-medium rounded-xl border border-slate-200/50 bg-slate-50/50 text-slate-300 cursor-not-allowed text-center"
                    >
                      {slot.label}
                      <span className="block text-[10px] text-slate-300 font-normal">Unavailable</span>
                    </button>
                  );
                }

                return (
                  <button
                    key={slot.startTimeMinutes}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-3 px-3 text-xs font-medium rounded-xl border transition-all text-center ${
                      isSelected
                        ? "bg-purple-600 text-white border-purple-600 shadow-sm ring-2 ring-purple-200"
                        : "bg-white text-slate-700 border-slate-200/80 hover:border-purple-300 hover:bg-purple-50/30"
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
          <div className="p-4 bg-purple-50/80 border border-purple-100 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-purple-950 font-medium">
              <Check className="w-4 h-4 text-purple-600 shrink-0" />
              <span>
                New appointment:{" "}
                <span className="font-bold">
                  {formatCompactDate(selectedSlot.isoString, timezone)} · {selectedSlot.label} – {selectedSlot.endLabel}
                </span>
              </span>
            </div>
            <Button
              type="button"
              disabled={isRescheduling}
              onClick={handleConfirmReschedule}
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium shadow-xs"
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