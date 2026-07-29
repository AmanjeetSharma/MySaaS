import {
  Clock,
  DollarSign,
  Euro,
  IndianRupee,
  MapPin,
  Settings2,
  Video,
  HandCoins,
  MonitorPlay,
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
    <span className="inline-flex items-center gap-0.5 font-bold text-foreground">
      <CurrencyIcon className="h-3 w-3 shrink-0 text-muted-foreground" />
      {formattedAmount}
    </span>
  );
};

const formatShortLocation = (address) => {
  if (!address) return 'Offline';
  const parts = [address.city, address.state].filter((item) => item && item.trim() !== '');
  return parts.length > 0 ? parts.join(', ') : 'Offline';
};

export default function ServiceCard({
  service,
  actionLoading,
  onToggleStatus,
  onManageService,
}) {
  const isOffline = service.mode === 'OFFLINE';

  // Resolve Provider Config and Icon dynamically
  const providerConfig = INTEGRATION_CONFIG[service.onlineMeetingProvider];
  const ProviderIcon = providerConfig?.icon || Video;
  const providerName = providerConfig?.name || service.onlineMeetingProvider || 'Online';

  return (
    <div
      className={`relative flex flex-col justify-between rounded-xl border p-4 transition-all duration-300 ${service.isActive
        ? 'border-border/80 bg-card shadow-2xs hover:border-primary/50 hover:shadow-[0_0_15px_rgba(var(--primary),0.18)] dark:hover:border-primary/60 dark:hover:shadow-[0_0_18px_rgba(255,255,255,0.08)]'
        : 'border-border/50 bg-muted/20 opacity-85 hover:border-border/90 hover:opacity-100 hover:shadow-[0_0_12px_rgba(0,0,0,0.06)]'
        }`}
    >
      <div className="space-y-3">
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-sm font-bold text-foreground sm:text-base">
                {service.name}
              </h3>
            </div>
            <span
              className={`mt-1 inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${service.isActive
                ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'border border-border/60 bg-muted text-muted-foreground'
                }`}
            >
              {service.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border/60 bg-background/80 px-2 py-1 shadow-2xs">
            <Switch
              checked={!!service.isActive}
              onCheckedChange={() => onToggleStatus(service)}
              disabled={actionLoading?.status}
              className="cursor-pointer ring-primary/20 data-checked:ring-2 data-unchecked:bg-muted-foreground/35 scale-90"
            />
          </div>
        </div>

        {/* Short Description */}
        <p className="line-clamp-2 min-h-8 text-xs font-medium text-muted-foreground leading-relaxed">
          {service.description || 'No description provided.'}
        </p>

        {/* Compact Metrics List with Separators */}
        <div className="divide-y divide-border/40 rounded-xl border border-border/50 bg-muted/30 px-3 text-xs">
          {/* Duration */}
          <div className="flex items-center justify-between text-muted-foreground py-2.5">
            <div className="flex items-center gap-2 font-semibold">
              <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Duration</span>
            </div>
            <span className="font-bold text-foreground">{service.durationInMinutes || 30} mins</span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between text-muted-foreground py-2.5">
            <div className="flex items-center gap-2 font-semibold">
              <HandCoins className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Price</span>
            </div>
            {formatPriceDisplay(service)}
          </div>

          {/* Location or Online Provider Icon */}
          <div className="flex items-center justify-between text-muted-foreground py-2.5">
            <div className="flex items-center gap-2 font-semibold">
              {isOffline ? (
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
              ) : (
                <MonitorPlay className="h-3.5 w-3.5 text-primary shrink-0" />
              )}
              <span>{isOffline ? 'Location' : 'Provider'}</span>
            </div>

            <div className="flex items-center gap-1.5 min-w-0 max-w-[150px] justify-end">
              {!isOffline && ProviderIcon && (
                <ProviderIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              )}
              <span className="truncate font-bold text-foreground">
                {isOffline ? formatShortLocation(service.address) : providerName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-3.5">
        <Button
          type="button"
          onClick={() => onManageService(service)}
          className="h-8 w-full cursor-pointer rounded-lg text-xs font-bold shadow-2xs hover:bg-primary/90 hover:shadow-sm active:scale-98 transition-all"
        >
          <Settings2 className="h-3.5 w-3.5 shrink-0" />
          Manage Service
        </Button>
      </div>
    </div>
  );
}