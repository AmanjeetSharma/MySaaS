import { useMemo } from "react";
import {
  Clock,
  Mail,
  Phone,
  Video,
  MapPin,
  ChevronRight,
} from "lucide-react";

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
  if (price === undefined || price === null) return null;
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

const BookingRow = ({ booking, onOpen }) => {
  const {
    service,
    status = "PENDING",
    booker,
    startTime,
    endTime,
    serviceSnapshot,
  } = booking;

  const mode = serviceSnapshot?.mode || "Not Specified";
  const isOnline = mode.toUpperCase() === "ONLINE";

  const formattedPrice = formatPrice(
    serviceSnapshot?.price,
    serviceSnapshot?.currency
  );

  const statusInfo = STATUS_CONFIG[status] || {
    label: status.replace(/_/g, " "),
    classes: "bg-secondary text-secondary-foreground border-border-subtle",
  };

  const dateDetails = useMemo(() => {
    if (!startTime) return { month: "-", day: "-", weekday: "-", relative: null };
    try {
      const date = new Date(startTime);
      const now = new Date();

      const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

      const tomorrow = new Date();
      tomorrow.setDate(now.getDate() + 1);
      const isTomorrow =
        date.getDate() === tomorrow.getDate() &&
        date.getMonth() === tomorrow.getMonth() &&
        date.getFullYear() === tomorrow.getFullYear();

      return {
        month: new Intl.DateTimeFormat("en-US", { month: "short" }).format(date),
        day: new Intl.DateTimeFormat("en-US", { day: "numeric" }).format(date),
        weekday: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date),
        year: new Intl.DateTimeFormat("en-US", { year: "numeric" }).format(date),
        relative: isToday ? "Today" : isTomorrow ? "Tomorrow" : null,
      };
    } catch {
      return { month: "-", day: "-", weekday: "-", relative: null };
    }
  }, [startTime]);

  const serviceName = serviceSnapshot?.name || service?.name || "Standard Booking";
  const customerName = booker?.name || "Unknown Customer";

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Booking for ${customerName} - ${serviceName}`}
      onClick={() => onOpen?.(booking)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen?.(booking);
        }
      }}
      className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-xl border border-border-subtle bg-surface-elevated p-3 sm:p-3.5 shadow-xs transition-all hover:border-border hover:bg-surface-elevated/90 cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-ring active:scale-[0.995]"
    >
      {/* Zone 1: Temporal Anchor (Date & Time Tile) */}
      <div className="flex sm:flex-col items-center justify-between sm:justify-center shrink-0 sm:w-20 sm:min-w-[80px] py-1.5 sm:py-2 px-2.5 rounded-lg bg-surface border border-border-subtle text-center">
        <div className="flex items-center sm:flex-col gap-1.5 sm:gap-0">
          <div className="flex items-center gap-1 justify-center">
            <span className="text-[10px] font-bold tracking-widest text-subtle-foreground uppercase">
              {dateDetails.month}
            </span>
            {dateDetails.relative && (
              <span className="text-[9px] font-bold px-1 py-0.2 rounded tracking-wider bg-accent/20 text-accent-foreground sm:hidden">
                {dateDetails.relative}
              </span>
            )}
          </div>
          <span className="font-heading text-lg sm:text-xl font-bold tracking-tight text-foreground leading-none sm:my-0.5">
            {dateDetails.day}
          </span>
          <span className="text-[10px] text-subtle-foreground font-medium hidden sm:block">
            {dateDetails.relative || dateDetails.weekday}
          </span>
        </div>

        {/* Mobile-only time badge aligned on the right of the header */}
        <div className="flex items-center gap-1 text-[11px] text-subtle-foreground sm:hidden font-medium">
          <Clock className="size-3 text-subtle-foreground/70 shrink-0" />
          <span>
            {formatTime(startTime)} – {formatTime(endTime)}
          </span>
        </div>
      </div>

      {/* Zone 2: Primary Content Entity (Customer, Service & Contacts) */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Line 1: Primary Entity (Customer Name) + Service Subtitle */}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <h3 className="font-heading text-sm font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors truncate">
            {customerName}
          </h3>

          <span className="text-border-subtle hidden sm:inline">•</span>

          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs text-subtle-foreground font-medium truncate max-w-[200px] sm:max-w-[260px]">
              {serviceName}
            </span>

            {/* Mode Indicator Badge (Clean architectural micro-tag) */}
            <span className="text-[9px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded border border-border-subtle bg-surface text-subtle-foreground select-none gap-1 inline-flex items-center h-4.5">
              {isOnline ? (
                <Video className="size-2.5 text-accent shrink-0" />
              ) : (
                <MapPin className="size-2.5 text-amber-500 shrink-0" />
              )}
              <span>{mode}</span>
            </span>
          </div>
        </div>

        {/* Line 2: Contact Metadata & Desktop Time */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-subtle-foreground">
          {/* Desktop Time Anchor */}
          <div className="hidden sm:flex items-center gap-1 font-medium text-foreground">
            <Clock className="size-3 text-subtle-foreground/70 shrink-0" />
            <span className="whitespace-nowrap">
              {formatTime(startTime)} – {formatTime(endTime)}
            </span>
          </div>

          {startTime && (booker?.email || booker?.phone) && (
            <span className="text-border-subtle hidden sm:inline">•</span>
          )}

          {booker?.email && (
            <span className="flex items-center gap-1 min-w-0 max-w-[220px] truncate">
              <Mail className="size-3 text-subtle-foreground/60 shrink-0" />
              <span className="truncate">{booker.email}</span>
            </span>
          )}

          {booker?.email && booker?.phone && (
            <span className="text-border-subtle hidden sm:inline">•</span>
          )}

          {booker?.phone && (
            <span className="flex items-center gap-1 whitespace-nowrap">
              <Phone className="size-3 text-subtle-foreground/60 shrink-0" />
              <span>{booker.phone}</span>
            </span>
          )}
        </div>
      </div>

      {/* Zone 3: Triage & Commercials (Premium Status Tag, Price & Interactive Affordance) */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border-subtle/50">
        {/* Premium Status Badge (Architectural micro-tag without bubbly pill shape or dot) */}
        <span
          className={`text-[10px] sm:text-[11px] font-semibold tracking-[0.16em] uppercase px-2 py-0.5 rounded-md border select-none inline-flex items-center justify-center ${statusInfo.classes}`}
        >
          {statusInfo.label}
        </span>

        <div className="flex items-center gap-2">
          {formattedPrice && (
            <span className="font-heading text-xs sm:text-sm font-semibold tracking-tight text-foreground whitespace-nowrap">
              {formattedPrice}
            </span>
          )}

          <ChevronRight className="size-4 text-subtle-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>
      </div>
    </div>
  );
};

export default BookingRow;