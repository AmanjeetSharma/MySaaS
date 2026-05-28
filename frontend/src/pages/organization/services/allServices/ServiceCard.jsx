import {
  CalendarClock,
  Copy,
  DollarSign,
  Edit3,
  Euro,
  IndianRupee,
  Link2,
  MapPin,
  RefreshCw,
  Trash2,
  Video,
  WalletCards,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

const currencyIcons = {
  INR: IndianRupee,
  USD: DollarSign,
  EUR: Euro,
};

const formatAmount = (service) => {
  const amount = Number(service?.price || 0);

  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
};

const formatAddress = (address) => {
  if (!address) return 'No address added';

  return [
    address.street,
    address.city,
    address.state,
    address.country,
    address.zipCode,
  ].filter(Boolean).join(', ') || 'No address added';
};

export default function ServiceCard({
  service,
  actionLoading,
  onEdit,
  onDelete,
  onToggleStatus,
  onCopyUrl,
  onSyncSlug,
}) {
  const isOffline = service.mode === 'OFFLINE';
  const CurrencyIcon = currencyIcons[service.currency] || IndianRupee;

  return (
    <div className={`group relative flex flex-col rounded-2xl border p-4 transition-all duration-300 sm:p-6 ${service.isActive ? 'border-primary/30 bg-card shadow-sm shadow-primary/10 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg' : 'border-border/80 bg-muted/45 shadow-inner opacity-75 hover:bg-muted/60'}`}>
      <div className="flex items-start justify-between gap-3">
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${service.isActive ? 'border-primary/10 bg-primary/10 text-primary' : 'border-border bg-background/80 text-muted-foreground'}`}>
          {isOffline ? <MapPin className="h-3.5 w-3.5" /> : <Video className="h-3.5 w-3.5" />}
          {service.mode}
        </span>

        <div className="flex shrink-0 items-center rounded-full border border-border bg-background p-1 shadow-sm">
          <Switch
            checked={!!service.isActive}
            onCheckedChange={() => onToggleStatus(service)}
            disabled={actionLoading.status}
            className="cursor-pointer ring-primary/20 data-checked:ring-2 data-unchecked:bg-muted-foreground/35"
          />
        </div>
      </div>

      <div className="mt-5 flex-1 sm:mt-7">
        <h3 className="wrap-break-word text-lg font-black uppercase tracking-tight sm:text-2xl">{service.name}</h3>
        <p className="mt-2 min-h-10 text-xs font-medium leading-relaxed text-muted-foreground line-clamp-2 sm:mt-3 sm:min-h-12 sm:text-sm sm:line-clamp-3">
          {service.description || 'No description added yet.'}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-6 sm:gap-3">
          <div className="rounded-xl border border-border/70 bg-background/80 p-3 shadow-sm">
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5" />
              Duration
            </div>
            <div className="mt-1 text-sm font-black">{service.durationInMinutes} min</div>
          </div>

          <div className="rounded-xl border border-border/70 bg-background/80 p-3 shadow-sm">
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <WalletCards className="h-3.5 w-3.5" />
              Price
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-black">
              <CurrencyIcon className="h-3.5 w-3.5" />
              {formatAmount(service)}
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-border/70 bg-background/65 p-3 shadow-sm sm:mt-4">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {isOffline ? <MapPin className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
            {isOffline ? 'Address' : 'Meeting'}
          </div>
          <p className="mt-1 wrap-break-word text-sm font-medium text-foreground/90">
            {isOffline ? formatAddress(service.address) : service.autoGenerateMeetingLink ? 'Auto Google Meet link enabled' : 'Meeting link will not be auto-generated'}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-border/70 bg-background/70 px-3 py-2 shadow-sm">
          <span className="min-w-0 truncate text-xs font-bold text-muted-foreground">
            /{service.slug}
          </span>
          {service.isSlugStale && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onSyncSlug(service)}
                    disabled={actionLoading.sync}
                    className="h-8 shrink-0 cursor-pointer rounded-lg text-[10px] font-black uppercase tracking-widest"
                  >
                    <RefreshCw className="h-3 w-3" />
                    {actionLoading.sync ? 'Syncing' : 'Sync Url'}
                  </Button>
                </TooltipTrigger>

                <TooltipContent
                  side="top"
                  className="max-w-65 text-xs leading-relaxed"
                >
                  Note: This action will generate a new public service URL.
                  The previous link will become deprecated.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-6 sm:grid-cols-[1fr_1fr_44px]">
        <Button
          type="button"
          variant="secondary"
          onClick={() => onEdit(service)}
          className="h-10 cursor-pointer rounded-xl text-xs font-black uppercase tracking-widest shadow-sm sm:h-11"
        >
          <Edit3 className="h-4 w-4" />
          Edit
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => onCopyUrl(service)}
          disabled={actionLoading.copy}
          className="h-10 cursor-pointer rounded-xl text-xs font-black tracking-widest shadow-sm sm:h-11"
        >
          <Copy className="h-4 w-4" />
          {actionLoading.copy ? 'Copying...' : 'Copy public URL'}
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={() => onDelete(service)}
          className="col-span-2 h-10 cursor-pointer rounded-xl shadow-sm sm:col-span-1 sm:h-11"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
