import { Calendar, Clock, Mail, Phone, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  if (price === undefined || price === null) return null;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(price);
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

  const formattedPrice = formatPrice(
    serviceSnapshot?.price,
    serviceSnapshot?.currency
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen?.(booking)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen?.(booking);
        }
      }}
      className="group relative flex flex-col justify-between gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl border border-border-subtle bg-surface-elevated p-3 sm:p-4 shadow-xs transition-all hover:border-border hover:bg-surface-elevated/80 cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-ring active:scale-[0.99]"
    >
      {/* 1. Top Section: Service & Status */}
      <div className="flex items-center justify-between gap-2 border-b border-border-subtle/50 pb-2 sm:pb-2.5">
        <h3 className="font-heading text-xs sm:text-sm font-bold tracking-tight text-foreground group-hover:text-accent transition-colors line-clamp-1">
          {service?.name || "Standard Booking"}
        </h3>
        <Badge
          variant="outline"
          className={`shrink-0 text-[9px] sm:text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md select-none ${
            STATUS_VARIANTS[status] || "bg-secondary text-secondary-foreground"
          }`}
        >
          {status.replace("_", " ")}
        </Badge>
      </div>

      {/* 2. Middle Section: Customer Details */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-foreground">
          <User className="size-3.5 sm:size-4 text-accent shrink-0" />
          <span className="truncate">{booker?.name || "Unknown Customer"}</span>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs text-subtle-foreground pl-5">
          {booker?.email && (
            <span className="flex items-center gap-1 min-w-0 max-w-full truncate">
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

      {/* 3. Bottom Section: Schedule & Price */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border-subtle/50 text-[11px] sm:text-xs">
        <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 text-subtle-foreground">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <Calendar className="size-3.5 text-accent shrink-0" />
            <span>{formatDate(startTime)}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="size-3.5 text-subtle-foreground/60 shrink-0" />
            <span className="whitespace-nowrap">
              {formatTime(startTime)} – {formatTime(endTime)}
            </span>
          </div>
        </div>

        {formattedPrice && (
          <div className="font-heading text-xs sm:text-sm font-bold tracking-tight text-foreground whitespace-nowrap ml-auto">
            {formattedPrice}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingRow;