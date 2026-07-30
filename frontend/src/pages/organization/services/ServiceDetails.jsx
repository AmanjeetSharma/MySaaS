import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarClock,
  Clock,
  Copy,
  DollarSign,
  Edit3,
  Euro,
  ExternalLink,
  Globe2,
  IndianRupee,
  MapPin,
  RefreshCw,
  Video,
  WalletCards,
  X,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Building2,
  Check,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { INTEGRATION_CONFIG } from '@/constants/integrations.constant';
import { useServiceStore } from '@/stores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const MAX_PRICE = 99999999;

const currencyIcons = {
  INR: IndianRupee,
  USD: DollarSign,
  EUR: Euro,
};

const normalizeNumberInput = (value) => {
  if (value === '') return '';
  if (value.startsWith('0.') || value === '0') return value;
  return value.replace(/^0+(?=\d)/, '');
};

const normalizePriceInput = (value) => {
  const normalizedValue = normalizeNumberInput(value);
  if (normalizedValue === '') return '';

  const numericValue = Number(normalizedValue);
  if (!Number.isFinite(numericValue)) return MAX_PRICE.toString();
  if (numericValue > MAX_PRICE) return MAX_PRICE.toString();

  return normalizedValue;
};

const copyToClipboard = async (text) => {
  if (!text) return;
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
};

const formatAmountDisplay = (amount, currency) => {
  const numericAmount = Number(amount || 0);
  if (numericAmount === 0) return 'Free';

  const CurrencyIcon = currencyIcons[currency] || IndianRupee;
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: numericAmount % 1 === 0 ? 0 : 2,
  }).format(numericAmount);

  return (
    <span className="inline-flex items-center gap-1 font-extrabold text-foreground">
      <CurrencyIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
      {formatted}
    </span>
  );
};

const formatFullAddress = (address) => {
  if (!address) return 'No address set';
  const parts = [
    address.street,
    address.city,
    address.state,
    address.country,
    address.zipCode,
  ].filter((p) => p && p.trim() !== '');

  return parts.length > 0 ? parts.join(', ') : 'No address set';
};

const formatShortAddress = (address) => {
  if (!address) return 'Offline';
  const parts = [address.city, address.state].filter((p) => p && p.trim() !== '');
  return parts.length > 0 ? parts.join(', ') : 'Offline';
};

const toFormState = (service) => {
  if (!service) {
    return {
      name: '',
      description: '',
      mode: 'ONLINE',
      durationInMinutes: 30,
      price: 0,
      currency: 'INR',
      onlineMeetingProvider: 'GOOGLE_MEET',
      address: {
        street: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
      },
    };
  }

  return {
    name: service.name || '',
    description: service.description || '',
    mode: service.mode || 'ONLINE',
    durationInMinutes: service.durationInMinutes || 30,
    price: service.price ?? 0,
    currency: service.currency || 'INR',
    onlineMeetingProvider: service.onlineMeetingProvider || 'GOOGLE_MEET',
    address: {
      street: service.address?.street || '',
      city: service.address?.city || '',
      state: service.address?.state || '',
      country: service.address?.country || '',
      zipCode: service.address?.zipCode || '',
    },
  };
};

const buildPayload = (form) => {
  const payload = {
    name: form.name.trim(),
    description: form.description.trim(),
    mode: form.mode,
    durationInMinutes: Number(form.durationInMinutes),
    price: Number(form.price),
    currency: form.currency,
  };

  if (form.mode === 'ONLINE') {
    payload.onlineMeetingProvider = form.onlineMeetingProvider;
  } else if (form.mode === 'OFFLINE') {
    payload.address = {
      street: form.address.street.trim(),
      city: form.address.city.trim(),
      state: form.address.state.trim(),
      country: form.address.country.trim(),
      zipCode: form.address.zipCode.trim(),
    };
  }

  return payload;
};

export default function ServiceDetails() {
  const { serviceId } = useParams();
  const navigate = useNavigate();

  const {
    selectedService,
    getServiceById,
    updateService,
    deleteService,
    toggleServiceStatus,
    toggleAutoGenerateMeetingLink,
    syncServiceSlug,
    isLoading,
    isUpdating,
    clearSelectedService,
  } = useServiceStore();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(() => toFormState(null));
  const [meetingLinkEnabled, setMeetingLinkEnabled] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (serviceId) {
      getServiceById(serviceId).catch((error) => {
        toast.error(error?.response?.data?.message || 'Failed to fetch service details');
      });
    }

    return () => {
      clearSelectedService();
    };
  }, [serviceId, getServiceById, clearSelectedService]);

  useEffect(() => {
    if (selectedService) {
      setForm(toFormState(selectedService));
      setMeetingLinkEnabled(!!selectedService.autoGenerateMeetingLink);
    }
  }, [selectedService]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateNumberField = (field, value) => {
    setForm((current) => ({ ...current, [field]: normalizeNumberInput(value) }));
  };

  const updatePriceField = (value) => {
    setForm((current) => ({ ...current, price: normalizePriceInput(value) }));
  };

  const updateAddress = (field, value) => {
    setForm((current) => ({
      ...current,
      address: {
        ...current.address,
        [field]: value,
      },
    }));
  };

  const handleCancelEdit = () => {
    setForm(toFormState(selectedService));
    setMeetingLinkEnabled(!!selectedService?.autoGenerateMeetingLink);
    setIsEditing(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!serviceId) return;

    try {
      await updateService(serviceId, buildPayload(form));
      toast.success('Service updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update service');
    }
  };

  const handleDeleteService = async () => {
    if (!serviceId) return;
    setIsDeleting(true);

    try {
      await deleteService(serviceId);
      toast.success('Service deleted successfully');
      navigate(`/organizations/${selectedService.organization}/services`);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete service');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!serviceId) return;
    setIsActionLoading(true);

    try {
      const result = await toggleServiceStatus(serviceId);
      toast.success(result?.message || 'Service status updated');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Status update failed');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleMeetingLinkToggle = async () => {
    if (!serviceId) return;

    const previousState = meetingLinkEnabled;
    setMeetingLinkEnabled(!previousState);

    try {
      const result = await toggleAutoGenerateMeetingLink(serviceId);
      setMeetingLinkEnabled(!!result?.autoGenerateMeetingLink);
      toast.success(result?.message || 'Meeting link setting updated');
    } catch (error) {
      setMeetingLinkEnabled(previousState);
      toast.error(error?.response?.data?.message || 'Meeting link update failed');
    }
  };

  const handleCopyUrl = async () => {
    if (!selectedService?.publicUrl) {
      toast.error('Public URL not available');
      return;
    }

    try {
      await copyToClipboard(selectedService.publicUrl);
      setHasCopied(true);
      toast.success('Public URL copied');
      setTimeout(() => setHasCopied(false), 2000);
    } catch {
      toast.error('Unable to copy URL');
    }
  };

  const handleConfirmSyncSlug = async () => {
    if (!serviceId) return;
    setIsSyncing(true);

    try {
      const result = await syncServiceSlug(serviceId);
      toast.success(result?.message || 'Service URL synced successfully');
      setShowSyncModal(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'URL sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading && !selectedService) {
    return (
      <div className="flex h-[70vh] items-center justify-center p-4 text-center font-bold tracking-wider text-muted-foreground/60 text-xs uppercase">
        Synchronizing Service Workspace...
      </div>
    );
  }

  const CurrencyIcon = currencyIcons[form.currency] || IndianRupee;
  const currentProviderConfig = INTEGRATION_CONFIG[form.onlineMeetingProvider];
  const isOffline = (isEditing ? form.mode : selectedService?.mode) === 'OFFLINE';

  const fieldInputClass =
    'h-10 w-full rounded-lg border-border/80 bg-background/80 px-3 font-semibold text-sm shadow-xs transition-all focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50';

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 px-3 py-4 sm:space-y-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Header Toolbar */}
      <div className="flex flex-col gap-4 border-b border-border/60 pb-4 sm:pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/organizations/${selectedService.organization}/services`)}
            className="h-10 w-10 shrink-0 rounded-lg border border-border/60 bg-background shadow-2xs hover:bg-muted active:scale-95 sm:h-9 sm:w-9 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </Button>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-lg font-bold tracking-tight text-foreground sm:text-2xl">
                {selectedService?.name || 'Service Details'}
              </h1>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${selectedService?.isActive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-muted text-muted-foreground border border-border/60'
                  }`}
              >
                {selectedService?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="mt-0.5 text-xs font-medium text-muted-foreground sm:text-sm">
              {isEditing
                ? 'Editing configuration parameters & scheduling options'
                : 'Service settings, pricing structures, and external integrations'}
            </p>
          </div>
        </div>

        {/* Action Button Hierarchy */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {!isEditing ? (
            <Button
              type="button"
              onClick={() => setIsEditing(true)}
              className="h-10 min-h-[40px] flex-1 cursor-pointer rounded-lg px-3.5 text-xs font-bold uppercase tracking-wider shadow-xs transition-all active:scale-95 sm:h-9 sm:flex-none"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Edit
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelEdit}
              className="h-10 min-h-[40px] flex-1 cursor-pointer rounded-lg px-3.5 text-xs font-bold transition-all hover:bg-muted sm:h-9 sm:flex-none"
            >
              <X className="h-3.5 w-3.5" />
              Cancel Edit
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/services/all/${serviceId}/availability`)}
            className="h-10 min-h-[40px] flex-1 cursor-pointer rounded-lg px-3.5 text-xs font-bold tracking-wider shadow-2xs hover:bg-muted sm:h-9 sm:flex-none"
          >
            <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
            Availability
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={() => setShowDeleteModal(true)}
            className="h-10 min-h-[40px] flex-1 cursor-pointer rounded-lg px-3 text-xs font-bold uppercase tracking-wider shadow-2xs sm:h-9 sm:flex-none"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>

          <div className="flex h-10 min-h-[40px] w-full items-center justify-between gap-2 rounded-lg border border-border/80 bg-background px-3 shadow-2xs sm:h-9 sm:w-auto sm:justify-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
              Accepting Bookings
            </span>
            <Switch
              checked={!!selectedService?.isActive}
              onCheckedChange={handleToggleStatus}
              disabled={isActionLoading}
              className="cursor-pointer ring-primary/20 data-checked:ring-2 data-unchecked:bg-muted-foreground/35"
            />
          </div>
        </div>
      </div>

      {/* Quick Summary Bar */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-4 sm:gap-3">
        <div className="rounded-xl border border-border/60 bg-card p-3 shadow-2xs sm:p-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Mode
          </span>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-foreground sm:text-sm">
            {isOffline ? (
              <>
                <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="truncate">Offline</span>
              </>
            ) : (
              <>
                <Video className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="truncate">Online</span>
              </>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-3 shadow-2xs sm:p-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Duration
          </span>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-foreground sm:text-sm">
            <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">{selectedService?.durationInMinutes || 30} min</span>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-3 shadow-2xs sm:p-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Price
          </span>
          <div className="mt-1 truncate text-xs font-bold text-foreground sm:text-sm">
            {formatAmountDisplay(selectedService?.price, selectedService?.currency)}
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-3 shadow-2xs sm:p-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {isOffline ? 'Location' : 'Provider'}
          </span>
          <div className="mt-1 truncate text-xs font-bold text-foreground sm:text-sm">
            {isOffline
              ? formatShortAddress(selectedService?.address)
              : currentProviderConfig?.name || selectedService?.onlineMeetingProvider || 'Online'}
          </div>
        </div>
      </div>

      {/* Main Workspace Form */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Dedicated Public Booking URL Card */}
        <div className="rounded-xl border border-border/70 bg-card p-3.5 shadow-2xs transition-all sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-muted-foreground">
                <Globe2 className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Public Booking Page
                </span>
                <p className="truncate text-xs font-mono font-semibold text-foreground/90 sm:text-sm">
                  {selectedService?.publicUrl || `/${selectedService?.slug}`}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-border/40 pt-2.5 sm:border-t-0 sm:pt-0 shrink-0">
              {selectedService?.publicUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-9 min-h-[36px] flex-1 rounded-lg text-xs font-bold sm:h-8 sm:flex-none"
                >
                  <a href={selectedService.publicUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open
                  </a>
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyUrl}
                className="h-9 min-h-[36px] flex-1 rounded-lg text-xs font-bold cursor-pointer sm:h-8 sm:flex-none"
              >
                {hasCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </Button>

              {/* Lightweight Sync URL Action Button */}
              {selectedService?.isSlugStale && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSyncModal(true)}
                  className="h-9 min-h-[36px] flex-1 cursor-pointer gap-1.5 rounded-lg border-amber-500/30 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 hover:text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-400 dark:hover:bg-amber-500/25 sm:h-8 sm:flex-none text-[10px] font-bold uppercase tracking-wider transition-colors"
                >
                  <RefreshCw className="h-3 w-3" />
                  Sync URL
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Section 1: General Details */}
        <div className="space-y-4 rounded-xl border border-border/70 bg-card p-4 shadow-2xs sm:p-5">
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              General Settings
            </h2>
            <span className="text-[10px] font-medium text-muted-foreground/70">
              {isEditing ? 'Editing...' : 'Service Overview'}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Service Name
              </Label>
              {isEditing ? (
                <Input
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className={fieldInputClass}
                  placeholder="e.g. Executive Strategy Consultation"
                  required
                />
              ) : (
                <p className="text-sm font-bold text-foreground sm:text-base">{selectedService?.name}</p>
              )}
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Description
              </Label>
              {isEditing ? (
                <Textarea
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  className="min-h-24 w-full rounded-lg border-border/80 bg-background/80 p-3 font-medium text-xs sm:text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-primary/20"
                  placeholder="Summarize key takeaways for clients..."
                />
              ) : (
                <p className="text-xs font-medium leading-relaxed text-muted-foreground sm:text-sm">
                  {selectedService?.description || 'No description provided.'}
                </p>
              )}
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Mode
              </Label>
              {isEditing ? (
                <div className="relative rounded-lg border border-border/70 bg-muted/20 p-1">
                  <div
                    className={`absolute bottom-1 top-1 w-[calc(50%-0.25rem)] rounded-md bg-background shadow-xs transition-transform duration-200 ${form.mode === 'ONLINE' ? 'translate-x-full' : 'translate-x-0'
                      }`}
                  />
                  <div className="relative grid grid-cols-2">
                    <button
                      type="button"
                      onClick={() => updateField('mode', 'OFFLINE')}
                      className={`flex h-10 min-h-[40px] cursor-pointer items-center justify-center gap-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors sm:h-9 ${form.mode === 'OFFLINE'
                          ? 'text-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      Offline
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField('mode', 'ONLINE')}
                      className={`flex h-10 min-h-[40px] cursor-pointer items-center justify-center gap-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors sm:h-9 ${form.mode === 'ONLINE'
                          ? 'text-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                      <Video className="h-3.5 w-3.5 shrink-0" />
                      Online
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/30 px-3 py-1.5 text-xs font-bold text-foreground">
                    {isOffline ? (
                      <>
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        Offline / In-Person
                      </>
                    ) : (
                      <>
                        <Video className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        Online / Virtual
                      </>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Online or Offline Setup */}
        {!isOffline ? (
          <div className="space-y-4 rounded-xl border border-border/70 bg-card p-4 shadow-2xs sm:p-5">
            <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Online Integration Settings
              </h2>
            </div>

            {isEditing ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Choose Meeting Platform
                  </Label>
                  <Select
                    value={form.onlineMeetingProvider}
                    onValueChange={(v) => updateField('onlineMeetingProvider', v)}
                  >
                    <SelectTrigger className="h-10 w-full cursor-pointer rounded-lg border-border/80 bg-background/80 shadow-xs">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(INTEGRATION_CONFIG).map(([key, config]) => {
                        const IconComponent = config.icon;
                        return (
                          <SelectItem key={key} value={key} className="cursor-pointer">
                            <div className="flex items-center gap-2 font-bold text-xs">
                              {IconComponent && <IconComponent className="h-3.5 w-3.5 shrink-0 text-primary" />}
                              <span>{config.name}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Meeting Link Settings
                  </Label>
                  <div className="flex h-12 items-center justify-between gap-3 rounded-lg border border-border/80 bg-background/80 px-3.5 shadow-xs sm:h-11">
                    <div className="min-w-0">
                      <div className="truncate text-xs font-bold">Auto Generate Link</div>
                      <div className="truncate text-[10px] font-medium text-muted-foreground">
                        {currentProviderConfig?.name || 'Selected Provider'}
                      </div>
                    </div>
                    <Switch
                      checked={meetingLinkEnabled}
                      onCheckedChange={handleMeetingLinkToggle}
                      className="cursor-pointer ring-primary/20 data-checked:ring-2 data-unchecked:bg-muted-foreground/35"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Meeting Platform
                  </span>
                  <div className="mt-1 flex items-center gap-2 text-xs font-bold text-foreground sm:text-sm">
                    {currentProviderConfig?.icon && (
                      <currentProviderConfig.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="truncate">{currentProviderConfig?.name || selectedService?.onlineMeetingProvider}</span>
                  </div>
                </div>

                <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Link Generation
                  </span>
                  <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-foreground sm:text-sm">
                    {selectedService?.autoGenerateMeetingLink ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                        <span>Auto-generation enabled</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
                        <span>Auto-generation disabled</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 rounded-xl border border-border/70 bg-card p-4 shadow-2xs sm:p-5">
            <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Location & Address Details
              </h2>
            </div>

            {isEditing ? (
              <div className="grid gap-3.5 sm:grid-cols-2">
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Street Address
                  </Label>
                  <Input
                    value={form.address.street}
                    onChange={(e) => updateAddress('street', e.target.value)}
                    className={fieldInputClass}
                    placeholder="Suite, street number, office building"
                    required={form.mode === 'OFFLINE'}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    City
                  </Label>
                  <Input
                    value={form.address.city}
                    onChange={(e) => updateAddress('city', e.target.value)}
                    className={fieldInputClass}
                    required={form.mode === 'OFFLINE'}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    State / Province
                  </Label>
                  <Input
                    value={form.address.state}
                    onChange={(e) => updateAddress('state', e.target.value)}
                    className={fieldInputClass}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Country
                  </Label>
                  <Input
                    value={form.address.country}
                    onChange={(e) => updateAddress('country', e.target.value)}
                    className={fieldInputClass}
                    required={form.mode === 'OFFLINE'}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Zip / Postal Code
                  </Label>
                  <Input
                    value={form.address.zipCode}
                    onChange={(e) => updateAddress('zipCode', e.target.value)}
                    className={fieldInputClass}
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-border/60 bg-muted/20 p-3.5">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  Venue Location
                </div>
                <p className="mt-1 text-xs font-bold text-foreground sm:text-sm">
                  {formatFullAddress(selectedService?.address)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Section 3: Pricing & Duration */}
        <div className="space-y-4 rounded-xl border border-border/70 bg-card p-4 shadow-2xs sm:p-5">
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Pricing & Scheduling Parameters
            </h2>
          </div>

          {isEditing ? (
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Currency
                </Label>
                <Select
                  value={form.currency}
                  onValueChange={(v) => updateField('currency', v)}
                >
                  <SelectTrigger className="h-10 w-full cursor-pointer rounded-lg border-border/80 bg-background/80 shadow-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR" className="cursor-pointer">
                      INR (₹)
                    </SelectItem>
                    <SelectItem value="USD" className="cursor-pointer">
                      USD ($)
                    </SelectItem>
                    <SelectItem value="EUR" className="cursor-pointer">
                      EUR (€)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Duration (mins)
                </Label>
                <Input
                  type="number"
                  min="15"
                  value={form.durationInMinutes}
                  onFocus={(e) => {
                    if (e.currentTarget.value === '0') e.currentTarget.select();
                  }}
                  onChange={(e) => updateNumberField('durationInMinutes', e.target.value)}
                  className={fieldInputClass}
                  required
                />
              </div>

              <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Price Amount
                </Label>
                <div className="relative">
                  <WalletCards className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <CurrencyIcon className="pointer-events-none absolute left-8 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground" />
                  <Input
                    type="number"
                    min="0"
                    max={MAX_PRICE}
                    step="1"
                    value={form.price}
                    onFocus={(e) => {
                      if (e.currentTarget.value === '0') e.currentTarget.select();
                    }}
                    onChange={(e) => updatePriceField(e.target.value)}
                    className={`${fieldInputClass} pl-14`}
                    required
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Session Duration
                </span>
                <p className="mt-1 text-sm font-extrabold text-foreground">
                  {selectedService?.durationInMinutes} minutes
                </p>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Fee Structure
                </span>
                <p className="mt-1 text-sm font-extrabold text-foreground">
                  {formatAmountDisplay(selectedService?.price, selectedService?.currency)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Embedded Save Bar */}
        {isEditing && (
          <div className="sticky bottom-3 z-40 flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-background/95 p-3 shadow-xl backdrop-blur-md sm:bottom-5 sm:p-3.5">
            <span className="hidden text-xs font-semibold text-muted-foreground sm:inline">
              Unsaved changes will be lost, click "Save Changes" to see the changes.
            </span>

            <div className="flex w-full items-center gap-2.5 sm:ml-auto sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEdit}
                className="h-10 min-h-[40px] flex-1 cursor-pointer rounded-lg px-4 text-xs font-bold transition-all hover:bg-accent/20 active:scale-98 sm:h-9 sm:flex-initial sm:px-5"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isUpdating}
                className="h-10 min-h-[40px] flex-1 cursor-pointer gap-2 rounded-lg px-5 text-xs font-bold uppercase tracking-wider shadow-xs transition-all active:scale-98 sm:h-9 sm:flex-initial"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}
      </form>

      {/* Sync URL Confirmation Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in-0 duration-150">
          <div className="w-full max-w-md space-y-5 rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Content Block */}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <AlertTriangle className="h-6 w-6" />
              </div>

              <div className="space-y-1.5 pt-0.5">
                <h3 className="text-lg font-bold text-foreground">Sync Booking URL?</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Create a new booking link that matches the current service name.
                </p>
                <p className="text-xs font-semibold leading-relaxed text-amber-600 dark:text-amber-400">
                  Warning: Previously shared links will stop working.
                </p>
              </div>
            </div>

            {/* 50/50 Equal Width Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                disabled={isSyncing}
                onClick={() => setShowSyncModal(false)}
                className="h-10 w-full rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </Button>

              <Button
                type="button"
                disabled={isSyncing}
                onClick={handleConfirmSyncSlug}
                className="h-10 w-full cursor-pointer gap-2 rounded-xl bg-amber-600 px-4 text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  'Confirm Sync'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md space-y-4 rounded-xl border border-border bg-card p-5 shadow-2xl">
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-foreground sm:text-lg">Delete Service</h3>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Are you sure you want to delete <strong className="text-foreground">{selectedService?.name}</strong>? This action cannot be undone and will remove all public booking capabilities for this service.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={isDeleting}
                onClick={() => setShowDeleteModal(false)}
                className="h-9 rounded-lg text-xs font-bold cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={isDeleting}
                onClick={handleDeleteService}
                className="h-9 rounded-lg px-4 text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Delete Service'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}