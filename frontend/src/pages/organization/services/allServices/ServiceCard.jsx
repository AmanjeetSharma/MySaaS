import {
  CalendarClock,
  Clock,
  DollarSign,
  Euro,
  IndianRupee,
  MapPin,
  Settings2,
  Video,
  WalletCards,
} from 'lucide-react';
import { INTEGRATION_CONFIG } from '@/constants/integrations.constant';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

const currencyIcons = {
  INR: IndianRupee,
  USD: DollarSign,
  EUR: Euro,
};

const formatPriceDisplay = (service) => {
  const amount = Number(service?.price || 0);
  if (amount === 0) return 'Free';

  const currency = service?.currency || 'INR';
  const CurrencyIcon = currencyIcons[currency] || IndianRupee;

  const formattedAmount = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);

  return (
    <span className="inline-flex items-center gap-1">
      <CurrencyIcon className="h-3.5 w-3.5" />
      {formattedAmount}
    </span>
  );
};

const formatShortLocation = (address) => {
  if (!address) return 'In-Person';
  const parts = [address.city, address.state].filter((item) => item && item.trim() !== '');
  return parts.length > 0 ? parts.join(', ') : 'In-Person';
};

export default function ServiceCard({
  service,
  actionLoading,
  onToggleStatus,
  onManageService,
}) {
  const isOffline = service.mode === 'OFFLINE';
  const providerConfig = INTEGRATION_CONFIG[service.onlineMeetingProvider];
  const providerName = providerConfig?.name || 'Online Meeting';

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl border p-5 transition-all duration-300 sm:p-6 ${service.isActive
          ? 'border-border/80 bg-card shadow-sm hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md'
          : 'border-border/60 bg-muted/30 opacity-80 hover:bg-muted/50'
        }`}
    >
      <div>
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-black uppercase tracking-tight text-foreground sm:text-xl">
              {service.name}
            </h3>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest ${service.isActive
                  ? 'border border-primary/20 bg-primary/10 text-primary'
                  : 'border border-border bg-muted text-muted-foreground'
                }`}
            >
              {service.isActive ? 'Active' : 'Inactive'}
            </span>
            <div className="flex items-center rounded-full border border-border bg-background p-1 shadow-xs">
              <Switch
                checked={!!service.isActive}
                onCheckedChange={() => onToggleStatus(service)}
                disabled={actionLoading?.status}
                className="cursor-pointer ring-primary/20 data-checked:ring-2 data-unchecked:bg-muted-foreground/35"
              />
            </div>
          </div>
        </div>

        {/* Short Description */}
        <p className="mt-3 min-h-10 text-xs font-medium leading-relaxed text-muted-foreground line-clamp-2 sm:text-sm">
          {service.description || 'No description provided.'}
        </p>

        <div className="my-4 h-px w-full bg-border/60" />

        {/* Essential Metrics Grid */}
        <div className="space-y-2.5 text-xs font-bold text-foreground">
          {/* Duration */}
          <div className="flex items-center justify-between rounded-xl bg-muted/40 px-3.5 py-2.5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 text-primary" />
              <span>Duration</span>
            </div>
            <span className="font-black">{service.durationInMinutes || 30} min</span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between rounded-xl bg-muted/40 px-3.5 py-2.5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <WalletCards className="h-4 w-4 text-primary" />
              <span>Price</span>
            </div>
            <span className="font-black">{formatPriceDisplay(service)}</span>
          </div>

          {/* Location or Online Provider */}
          <div className="flex items-center justify-between rounded-xl bg-muted/40 px-3.5 py-2.5">
            <div className="flex items-center gap-2 text-muted-foreground">
              {isOffline ? (
                <MapPin className="h-4 w-4 text-primary" />
              ) : (
                <Video className="h-4 w-4 text-primary" />
              )}
              <span>{isOffline ? 'Location' : 'Online'}</span>
            </div>
            <span className="max-w-[180px] truncate font-black text-right">
              {isOffline ? formatShortLocation(service.address) : providerName}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="mt-6 pt-2">
        <Button
          type="button"
          onClick={() => onManageService(service)}
          className="h-11 w-full cursor-pointer rounded-xl text-xs font-black uppercase tracking-widest shadow-sm transition-all active:scale-[0.98]"
        >
          <Settings2 className="h-4 w-4" />
          Manage Service
        </Button>
      </div>
    </div>
  );
}