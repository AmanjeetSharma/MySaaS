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
      <CurrencyIcon className="h-3 w-3 shrink-0 text-subtle-foreground" />
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
  const providerConfig = INTEGRATION_CONFIG[service.meetingProvider];
  const ProviderIcon = providerConfig?.icon || Video;
  const providerName = providerConfig?.name || service.meetingProvider || 'Online';

  return (
    <div
      className={`relative flex flex-col justify-between rounded-2xl border p-4 sm:p-5 transition-all duration-300 ${
        service.isActive
          ? 'border-border-subtle bg-surface-elevated shadow-xs hover:border-primary/50 hover:shadow-[0_0_18px_rgba(124,58,237,0.12)]'
          : 'border-border-subtle bg-surface-sunken opacity-85 hover:border-border hover:opacity-100 hover:shadow-xs'
      }`}
    >
      <div className="space-y-3">
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-heading truncate text-sm font-bold text-foreground sm:text-base">
                {service.name}
              </h3>
            </div>
            <span
              className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                service.isActive
                  ? 'border border-success/20 bg-success/10 text-success'
                  : 'border border-border-subtle bg-surface text-subtle-foreground'
              }`}
            >
              {service.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 rounded-xl border border-border-subtle bg-surface px-2 py-1 shadow-2xs">
            <Switch
              checked={!!service.isActive}
              onCheckedChange={() => onToggleStatus(service)}
              disabled={actionLoading?.status}
              className="cursor-pointer scale-90 transition-all data-[state=checked]:bg-accent data-[state=checked]:shadow-md data-[state=checked]:shadow-accent/30 data-[state=unchecked]:bg-muted-foreground/30 [&>span]:data-[state=checked]:bg-accent-foreground"
            />
          </div>
        </div>

        {/* Short Description */}
        <p className="line-clamp-2 min-h-8 text-xs font-medium text-subtle-foreground leading-relaxed">
          {service.description || 'No description provided.'}
        </p>

        {/* Compact Metrics List with Separators */}
        <div className="divide-y divide-border-subtle rounded-xl border border-border-subtle bg-surface px-3 text-xs">
          {/* Duration */}
          <div className="flex items-center justify-between text-subtle-foreground py-2.5">
            <div className="flex items-center gap-2 font-semibold">
              <Clock className="h-3.5 w-3.5 text-accent shrink-0" />
              <span>Duration</span>
            </div>
            <span className="font-bold text-foreground">{service.durationInMinutes || 30} mins</span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between text-subtle-foreground py-2.5">
            <div className="flex items-center gap-2 font-semibold">
              <HandCoins className="h-3.5 w-3.5 text-accent shrink-0" />
              <span>Price</span>
            </div>
            {formatPriceDisplay(service)}
          </div>

          {/* Location or Online Provider Icon */}
          <div className="flex items-center justify-between text-subtle-foreground py-2.5">
            <div className="flex items-center gap-2 font-semibold">
              {isOffline ? (
                <MapPin className="h-3.5 w-3.5 text-accent shrink-0" />
              ) : (
                <MonitorPlay className="h-3.5 w-3.5 text-accent shrink-0" />
              )}
              <span>{isOffline ? 'Location' : 'Provider'}</span>
            </div>

            <div className="flex items-center gap-1.5 min-w-0 max-w-[150px] justify-end">
              {!isOffline && ProviderIcon && (
                <ProviderIcon className="h-3.5 w-3.5 shrink-0 text-subtle-foreground" />
              )}
              <span className="truncate font-bold text-foreground">
                {isOffline ? formatShortLocation(service.address) : providerName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-4">
        <Button
          type="button"
          onClick={() => onManageService(service)}
          className="h-9 w-full cursor-pointer rounded-xl bg-secondary text-secondary-foreground border border-border-subtle text-xs font-bold shadow-xs transition-all hover:bg-accent hover:text-accent-foreground hover:shadow-md hover:shadow-accent/20 active:scale-98"
        >
          <Settings2 className="h-3.5 w-3.5 shrink-0" />
          Manage Service
        </Button>
      </div>
    </div>
  );
}