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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

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
      <CurrencyIcon className="h-4 w-4 shrink-0 text-subtle-foreground" />
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
      meetingProvider: 'GOOGLE_MEET',
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
    meetingProvider: service.meetingProvider || 'GOOGLE_MEET',
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
    payload.meetingProvider = form.meetingProvider;
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 animate-pulse">
        <Skeleton className="h-8 w-32" />
        <div className="flex flex-col gap-4 border-b border-border/80 pb-5 sm:pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20 rounded-xl" />
            <Skeleton className="h-9 w-24 rounded-xl" />
            <Skeleton className="h-9 w-20 rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-18 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  const CurrencyIcon = currencyIcons[form.currency] || IndianRupee;
  const currentProviderConfig = INTEGRATION_CONFIG[form.meetingProvider];
  const isOffline = (isEditing ? form.mode : selectedService?.mode) === 'OFFLINE';

  const fieldInputClass =
    'h-10 w-full rounded-xl border-border/80 bg-background px-3 font-medium text-xs sm:text-sm text-foreground shadow-2xs transition-all focus-visible:ring-1 focus-visible:ring-ring';

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Back Navigation */}
      <div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/organizations/${selectedService?.organization}/services`)}
          className="text-muted-foreground hover:text-foreground -ml-2 h-8 gap-1.5 cursor-pointer text-xs sm:text-sm font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Services
        </Button>
      </div>

      {/* Header Toolbar */}
      <div className="flex flex-col gap-4 border-b border-border/80 pb-5 sm:pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="truncate text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {selectedService?.name || 'Service Details'}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wider ${selectedService?.isActive
                ? 'bg-success/10 text-success border border-success/20'
                : 'bg-muted text-muted-foreground border border-border'
                }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${selectedService?.isActive ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
              {selectedService?.isActive ? 'ACTIVE' : 'INACTIVE'}
            </span>
            {selectedService?.isSlugStale && (
              <span className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-[10px] font-semibold text-warning">
                <AlertTriangle className="h-3 w-3" />
                URL DESYNCED
              </span>
            )}
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            {isEditing
              ? 'Editing configuration parameters & scheduling options'
              : 'Service settings, pricing structures, and external integrations'}
          </p>
        </div>

        {/* Action Button Hierarchy */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {!isEditing ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-9 px-3.5 text-xs font-medium cursor-pointer rounded-xl bg-card/80 hover:bg-accent/40 active:scale-[0.98] border border-border/80 shadow-2xs gap-1.5"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit</span>
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancelEdit}
              className="h-9 px-3.5 text-xs font-medium cursor-pointer rounded-xl border border-border/80 hover:bg-muted active:scale-[0.98] gap-1.5"
            >
              <X className="h-3.5 w-3.5" />
              <span>Cancel Edit</span>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate(`/services/all/${serviceId}/availability`)}
            className="h-9 px-3.5 text-xs font-medium cursor-pointer rounded-xl bg-card/80 hover:bg-accent/40 active:scale-[0.98] border border-border/80 shadow-2xs gap-1.5"
          >
            <CalendarClock className="h-3.5 w-3.5" />
            <span>Availability</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            className="h-9 px-3.5 text-xs font-medium cursor-pointer rounded-xl bg-card/80 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 active:scale-[0.98] border border-border/80 shadow-2xs gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </Button>

          <div className="flex h-9 items-center justify-between gap-2.5 rounded-xl border border-border/80 bg-card/80 px-3 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
              Accepting Bookings
            </span>
            <Switch
              checked={!!selectedService?.isActive}
              onCheckedChange={handleToggleStatus}
              disabled={isActionLoading}
              className="cursor-pointer"
            />
          </div>
        </div>
      </div>
      {/* Quick Summary Bar */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 md:grid-cols-4 sm:gap-3">
        <div className="rounded-xl border border-border/80 bg-card/60 p-3.5 shadow-2xs sm:p-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
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

        <div className="rounded-xl border border-border/80 bg-card/60 p-3.5 shadow-2xs sm:p-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Duration
          </span>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-foreground sm:text-sm">
            <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">{selectedService?.durationInMinutes || 30} min</span>
          </div>
        </div>

        <div className="rounded-xl border border-border/80 bg-card/60 p-3.5 shadow-2xs sm:p-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Price
          </span>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-foreground sm:text-sm">
            <CurrencyIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">{formatAmountDisplay(selectedService?.price, selectedService?.currency)}</span>
          </div>
        </div>

        <div className="rounded-xl border border-border/80 bg-card/60 p-3.5 shadow-2xs sm:p-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {isOffline ? 'Location' : 'Provider'}
          </span>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-foreground sm:text-sm">
            {isOffline ? (
              <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            ) : currentProviderConfig?.icon ? (
              <currentProviderConfig.icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            ) : (
              <Globe2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            )}
            <span className="truncate">
              {isOffline
                ? formatShortAddress(selectedService?.address)
                : currentProviderConfig?.name || selectedService?.meetingProvider || 'Online'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Workspace Form */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Dedicated Public Booking URL Card */}
        <div className="rounded-xl border border-border/80 bg-card/60 p-3.5 shadow-2xs sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-muted/60 text-muted-foreground">
                <Globe2 className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Public Booking Page
                </span>
                <p className="truncate text-xs font-mono font-medium text-foreground select-all sm:text-sm">
                  {selectedService?.publicUrl || `/${selectedService?.slug}`}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-2.5 sm:border-t-0 sm:pt-0 shrink-0">
              {selectedService?.publicUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-8 rounded-xl text-xs font-medium border-border/80 hover:bg-muted"
                >
                  <a href={selectedService.publicUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                    Open
                  </a>
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyUrl}
                className="h-8 rounded-xl text-xs font-medium border-border/80 hover:bg-muted cursor-pointer"
              >
                {hasCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1 text-success" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 mr-1" />
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
                  className="h-8 cursor-pointer gap-1.5 rounded-xl border-warning/30 bg-warning/10 text-warning hover:bg-warning/20 text-xs font-medium transition-colors"
                >
                  <RefreshCw className="h-3 w-3" />
                  Sync URL
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Section 1: General Details */}
        <div className="space-y-4 rounded-xl border border-border/80 bg-card/60 p-4 shadow-2xs sm:p-5">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
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
                <p className="text-sm font-semibold text-foreground sm:text-base">{selectedService?.name}</p>
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
                  className="min-h-24 w-full rounded-xl border-border/80 bg-background p-3 font-medium text-xs sm:text-sm text-foreground shadow-2xs focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Summarize key takeaways for clients..."
                />
              ) : (
                <p className="text-xs font-normal leading-relaxed text-muted-foreground sm:text-sm">
                  {selectedService?.description || 'No description provided.'}
                </p>
              )}
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Service Mode
              </Label>
              {isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => updateField('mode', 'OFFLINE')}
                    className={`relative flex items-center justify-between gap-3 rounded-xl border p-3 text-left transition-all cursor-pointer ${form.mode === 'OFFLINE'
                      ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary shadow-xs'
                      : 'border-border/80 bg-background/50 text-muted-foreground hover:border-border hover:bg-background hover:text-foreground'
                      }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${form.mode === 'OFFLINE'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                          }`}
                      >
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-semibold ${form.mode === 'OFFLINE' ? 'text-foreground' : 'text-foreground/80'}`}>
                          Offline
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          In-person venue or address
                        </p>
                      </div>
                    </div>
                    {form.mode === 'OFFLINE' ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                    ) : (
                      <div className="h-4 w-4 shrink-0 rounded-full border border-border/80" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => updateField('mode', 'ONLINE')}
                    className={`relative flex items-center justify-between gap-3 rounded-xl border p-3 text-left transition-all cursor-pointer ${form.mode === 'ONLINE'
                      ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary shadow-xs'
                      : 'border-border/80 bg-background/50 text-muted-foreground hover:border-border hover:bg-background hover:text-foreground'
                      }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${form.mode === 'ONLINE'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                          }`}
                      >
                        <Video className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-semibold ${form.mode === 'ONLINE' ? 'text-foreground' : 'text-foreground/80'}`}>
                          Online
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          Virtual call (Google Meet, etc.)
                        </p>
                      </div>
                    </div>
                    {form.mode === 'ONLINE' ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                    ) : (
                      <div className="h-4 w-4 shrink-0 rounded-full border border-border/80" />
                    )}
                  </button>
                </div>
              ) : (
                <div>
                  <span className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-card px-3.5 py-2 text-xs font-medium text-foreground shadow-2xs">
                    {isOffline ? (
                      <>
                        <div className="flex h-5 w-5 items-center justify-center rounded-md bg-muted text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                        </div>
                        <span>Offline / In-Person</span>
                      </>
                    ) : (
                      <>
                        <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <Video className="h-3 w-3" />
                        </div>
                        <span>Online / Virtual</span>
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
          <div className="space-y-4 rounded-xl border border-border/80 bg-card/60 p-4 shadow-2xs sm:p-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
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
                    value={form.meetingProvider}
                    onValueChange={(v) => updateField('meetingProvider', v)}
                  >
                    <SelectTrigger className="h-10 w-full cursor-pointer rounded-xl border-border/80 bg-background shadow-2xs">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover text-popover-foreground border-border">
                      {Object.entries(INTEGRATION_CONFIG).map(([key, config]) => {
                        const IconComponent = config.icon;
                        return (
                          <SelectItem key={key} value={key} className="cursor-pointer hover:bg-muted">
                            <div className="flex items-center gap-2 font-medium text-xs">
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
                  <div className="flex h-11 items-center justify-between gap-3 rounded-xl border border-border/80 bg-background px-3.5 shadow-2xs">
                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold text-foreground">Auto Generate Link</div>
                      <div className="truncate text-[10px] font-medium text-muted-foreground">
                        {currentProviderConfig?.name || 'Selected Provider'}
                      </div>
                    </div>
                    <Switch
                      checked={meetingLinkEnabled}
                      onCheckedChange={handleMeetingLinkToggle}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border/80 bg-card p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Meeting Platform
                  </span>
                  <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-foreground sm:text-sm">
                    {currentProviderConfig?.icon && (
                      <currentProviderConfig.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="truncate">{currentProviderConfig?.name || selectedService?.meetingProvider}</span>
                  </div>
                </div>

                <div className="rounded-xl border border-border/80 bg-card p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Link Generation
                  </span>
                  <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-foreground sm:text-sm">
                    {selectedService?.autoGenerateMeetingLink ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                        <span>Auto-Link Generation Enabled</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 shrink-0 text-warning" />
                        <span>Auto-Link Generation Disabled</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 rounded-xl border border-border/80 bg-card/60 p-4 shadow-2xs sm:p-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
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
              <div className="rounded-xl border border-border/80 bg-card p-3.5">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  Venue Location
                </div>
                <p className="mt-1 text-xs font-semibold text-foreground sm:text-sm">
                  {formatFullAddress(selectedService?.address)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Section 3: Pricing & Duration */}
        <div className="space-y-4 rounded-xl border border-border/80 bg-card/60 p-4 shadow-2xs sm:p-5">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
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
                  <SelectTrigger className="h-10 w-full cursor-pointer rounded-xl border-border/80 bg-background shadow-2xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover text-popover-foreground border-border">
                    <SelectItem value="INR" className="cursor-pointer hover:bg-muted">
                      INR (₹)
                    </SelectItem>
                    <SelectItem value="USD" className="cursor-pointer hover:bg-muted">
                      USD ($)
                    </SelectItem>
                    <SelectItem value="EUR" className="cursor-pointer hover:bg-muted">
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
              <div className="rounded-xl border border-border/80 bg-card p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Session Duration
                </span>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {selectedService?.durationInMinutes} minutes
                </p>
              </div>

              <div className="rounded-xl border border-border/80 bg-card p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Fee Structure
                </span>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {formatAmountDisplay(selectedService?.price, selectedService?.currency)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Embedded Save Bar */}
        {isEditing && (
          <div className="sticky bottom-4 z-40 flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-card/95 p-3.5 shadow-xl backdrop-blur-md">
            <div className="hidden items-center gap-2 text-xs font-medium text-muted-foreground sm:flex">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span>Editing mode active - Unsaved changes will be lost</span>
            </div>

            <div className="flex w-full items-center gap-2.5 sm:ml-auto sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEdit}
                className="h-9 flex-1 cursor-pointer rounded-xl border-border/80 px-4 text-xs font-medium sm:flex-initial"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isUpdating}
                className="h-9 flex-1 cursor-pointer gap-2 rounded-xl px-5 text-xs font-medium shadow-2xs active:scale-[0.98] transition-all sm:flex-initial"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}
      </form>

      {/* Sync URL Confirmation Modal */}
      <Dialog open={showSyncModal} onOpenChange={setShowSyncModal}>
        <DialogContent className="sm:max-w-md rounded-2xl border-border bg-card text-card-foreground [&>button]:cursor-pointer [&>button]:rounded-full [&>button]:p-1.5">
          <DialogHeader className="space-y-2 text-left">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/10 text-warning border border-warning/20">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle className="text-base font-bold text-foreground">Sync Booking URL?</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Create a new booking link that matches the current service name.
              <span className="block mt-1 text-warning font-medium">Warning: Previously shared links will stop working.</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSyncing}
              onClick={() => setShowSyncModal(false)}
              className="h-9 rounded-xl text-xs font-medium cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isSyncing}
              onClick={handleConfirmSyncSlug}
              className="h-9 rounded-xl text-xs font-medium cursor-pointer gap-1.5 bg-warning text-warning-foreground hover:bg-warning/90 shadow-2xs"
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
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-md rounded-2xl border-border bg-card text-card-foreground [&>button]:cursor-pointer [&>button]:rounded-full [&>button]:p-1.5">
          <DialogHeader className="space-y-2 text-left">
            <div className="h-9 w-9 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
              <AlertCircle className="h-5 w-5" />
            </div>
            <DialogTitle className="text-base font-bold text-destructive">Delete Service</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-foreground underline">{selectedService?.name}</span>? This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => setShowDeleteModal(false)}
              className="h-9 rounded-xl text-xs font-medium cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDeleteService}
              className="h-9 rounded-xl text-xs font-medium cursor-pointer shadow-2xs"
            >
              {isDeleting ? 'Deleting...' : 'Delete Service'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}