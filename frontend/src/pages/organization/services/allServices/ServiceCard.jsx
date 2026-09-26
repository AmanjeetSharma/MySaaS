import {
  Clock,
  DollarSign,
  Euro,
  IndianRupee,
  MapPin,
  Video,
  ArrowUpRight,
  Trash2,
  Plus,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { INTEGRATION_CONFIG } from '@/constants/integrations.constant';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
    <span className="inline-flex items-center gap-1 font-bold text-foreground">
      <CurrencyIcon className="h-3.5 w-3.5 shrink-0 text-subtle-foreground" />
      {formattedAmount}
    </span>
  );
};

const formatShortLocation = (address) => {
  if (!address) return 'Offline';
  const parts = [address.city, address.state].filter((item) => item && item.trim() !== '');
  return parts.length > 0 ? parts.join(', ') : 'Offline';
};

export const ServiceCard = ({
  service,
  actionLoading,
  onToggleStatus,
  onManageService,
  onDelete,
}) => {
  const isOffline = service.mode === 'OFFLINE';

  // Resolve Provider Config and Icon dynamically
  const providerConfig = INTEGRATION_CONFIG[service.meetingProvider];
  const ProviderIcon = isOffline ? MapPin : (providerConfig?.icon || Video);
  const locationLabel = isOffline
    ? formatShortLocation(service.address)
    : (providerConfig?.name || service.meetingProvider || 'Virtual');

  const isUpdatingStatus = actionLoading?.status;

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl p-5 sm:p-6 transition-all duration-300 ease-out border
        ${service.isActive
          ? 'border-primary bg-surface-sunken shadow-lg shadow-primary/10 ring-1 ring-primary/20'
          : 'border-border-subtle bg-surface-elevated hover:border-primary/50 hover:shadow-md'
        }
      `}
    >
      {/* Top Active / Updating Badge on the border */}
      {isUpdatingStatus ? (
        <div className="absolute -top-3 right-6 z-10 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-md shadow-primary/25 ring-4 ring-background animate-pulse">
            <Loader2 className="h-3 w-3 animate-spin" /> Updating...
          </span>
        </div>
      ) : service.isActive ? (
        <div className="absolute -top-3 right-6 z-10 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-md shadow-primary/25 ring-4 ring-background">
            <CheckCircle2 className="h-3 w-3" /> Active
          </span>
        </div>
      ) : null}

      {/* Main Content Area */}
      <div className="space-y-5">
        {/* Header: Icon + Mode/Platform Badge and Status Toggle */}
        <div className="flex items-center justify-between gap-3">
          <div
            className={`
              flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 shrink-0
              ${service.isActive
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                : 'bg-surface text-subtle-foreground group-hover:bg-primary/10 group-hover:text-primary'
              }
            `}
          >
            <ProviderIcon className="h-6 w-6" />
          </div>

          <div
            className="flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-secondary-foreground border border-border-subtle">
              {isOffline ? <MapPin className="h-3 w-3" /> : <Video className="h-3 w-3" />}
              <span className="max-w-[100px] truncate">{locationLabel}</span>
            </span>

            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-flex items-center">
                    <Switch
                      checked={!!service.isActive}
                      onCheckedChange={() => onToggleStatus(service)}
                      disabled={isUpdatingStatus}
                      aria-label={`Toggle active status for ${service.name}`}
                      className="cursor-pointer scale-90 transition-all data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={4}>
                  {service.isActive ? 'Active - click to pause' : 'Paused - click to activate'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Title and Description */}
        <div>
          <h3 className="font-heading text-xl font-bold tracking-tight text-foreground truncate transition-colors">
            {service.name}
          </h3>
          <p className="mt-1 line-clamp-2 min-h-9 text-xs font-normal leading-relaxed text-subtle-foreground">
            {service.description || 'No description provided.'}
          </p>
        </div>

        {/* Compact Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-surface p-3 border border-border-subtle">
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-subtle-foreground uppercase tracking-wider">
              Duration
            </span>
            <div className="mt-1 flex items-center gap-1.5 text-foreground">
              <Clock className="h-3.5 w-3.5 text-subtle-foreground" />
              <span className="text-xs font-bold">
                {service.durationInMinutes || 30}{' '}
                <span className="font-normal text-subtle-foreground">mins</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col border-l border-border-subtle pl-3">
            <span className="text-[10px] font-semibold text-subtle-foreground uppercase tracking-wider">
              Pricing
            </span>
            <div className="mt-1 flex items-center gap-1.5 text-foreground">
              <span className="text-xs font-bold">{formatPriceDisplay(service)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="mt-6 flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => onManageService(service)}
          className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-secondary text-xs font-semibold text-secondary-foreground transition-all hover:bg-accent hover:text-accent-foreground active:scale-95 cursor-pointer shadow-2xs"
        >
          Manage Service <ArrowUpRight className="h-3.5 w-3.5" />
        </button>

        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(service);
            }}
            title="Delete Service"
            aria-label="Delete Service"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-destructive/20 text-destructive transition-all hover:bg-destructive/15 hover:text-destructive active:scale-90 cursor-pointer shrink-0"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export const CreateServiceCard = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group relative flex min-h-[280px] h-full w-full flex-col items-center justify-center
        rounded-2xl border-2 border-dashed border-border-strong
        bg-surface-elevated/50 p-6
        transition-all duration-300 ease-out
        hover:border-primary hover:bg-surface-elevated hover:shadow-md
        cursor-pointer
      "
    >
      <div className="
        flex h-12 w-12 items-center justify-center
        rounded-2xl bg-surface text-subtle-foreground
        transition-all duration-500
        group-hover:bg-primary group-hover:text-primary-foreground group-hover:rotate-90 group-hover:shadow-lg group-hover:shadow-primary/25
      ">
        <Plus className="h-6 w-6" />
      </div>

      <h3 className="font-heading mt-4 text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
        New Service
      </h3>

      <p className="mt-1 text-xs text-subtle-foreground max-w-[220px] text-center leading-relaxed">
        ( Online / Offline )
      </p>
    </button>
  );
};

export default ServiceCard;