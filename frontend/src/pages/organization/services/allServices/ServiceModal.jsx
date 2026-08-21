import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  Euro,
  IndianRupee,
  MapPin,
  Video,
  Info,
  Sparkles,
  Check,
  AlertCircle,
  Loader2,
  Clock,
} from 'lucide-react';
import { INTEGRATION_CONFIG } from '@/constants/integrations.constant';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { cn } from '@/lib/utils';

const DEFAULT_FORM = {
  name: '',
  description: '',
  mode: 'ONLINE',
  durationInMinutes: 30,
  price: 0,
  currency: 'INR',
  meetingProvider: 'GOOGLE_MEET',
  autoGenerateMeetingLink: true,
  address: {
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
  },
};

const MAX_PRICE = 99999999;
const MAX_DURATION = 1440; // Max 24 hours (1440 mins)

const DURATION_PRESETS = [
  { label: '15 mins', value: '15' },
  { label: '30 mins', value: '30' },
  { label: '45 mins', value: '45' },
  { label: '60 mins (1 hr)', value: '60' },
  { label: '90 mins (1.5 hrs)', value: '90' },
  { label: '120 mins (2 hrs)', value: '120' },
  { label: 'Custom...', value: 'custom' },
];

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

const normalizeDurationInput = (value) => {
  const normalizedValue = normalizeNumberInput(value);
  if (normalizedValue === '') return '';

  const numericValue = Number(normalizedValue);
  if (!Number.isFinite(numericValue)) return MAX_DURATION.toString();
  if (numericValue > MAX_DURATION) return MAX_DURATION.toString();

  return normalizedValue;
};

const toFormState = (service = null) => {
  if (!service) return DEFAULT_FORM;

  return {
    name: service.name || '',
    description: service.description || '',
    mode: service.mode || 'ONLINE',
    durationInMinutes: service.durationInMinutes || 30,
    price: service.price ?? 0,
    currency: service.currency || 'INR',
    meetingProvider: service.meetingProvider || 'GOOGLE_MEET',
    autoGenerateMeetingLink: service.autoGenerateMeetingLink ?? true,
    address: {
      street: service.address?.street || '',
      city: service.address?.city || '',
      state: service.address?.state || '',
      country: service.address?.country || '',
      zipCode: service.address?.zipCode || '',
    },
  };
};

const buildPayload = (form, organizationId) => {
  const payload = {
    organizationId,
    name: form.name.trim(),
    description: form.description.trim(),
    mode: form.mode,
    durationInMinutes: Number(form.durationInMinutes),
    price: Number(form.price),
    currency: form.currency,
  };

  if (form.mode === 'ONLINE') {
    payload.meetingProvider = form.meetingProvider;
    payload.autoGenerateMeetingLink = Boolean(form.autoGenerateMeetingLink);
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

export default function ServiceModal({
  open,
  mode,
  service,
  organizationId,
  isUpdating,
  onOpenChange,
  onSubmit,
}) {
  const [form, setForm] = useState(() => toFormState(service));
  const [errors, setErrors] = useState({});
  const [isCustomDuration, setIsCustomDuration] = useState(false);

  useEffect(() => {
    if (open) {
      const initialForm = toFormState(service);
      setForm(initialForm);
      setErrors({});

      const isPreset = DURATION_PRESETS.some(
        (p) => p.value === String(initialForm.durationInMinutes)
      );
      setIsCustomDuration(!isPreset);
    }
  }, [service, open]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const updatePriceField = (value) => {
    setForm((current) => ({ ...current, price: normalizePriceInput(value) }));
  };

  const updateDurationPreset = (value) => {
    if (value === 'custom') {
      setIsCustomDuration(true);
    } else {
      setIsCustomDuration(false);
      updateField('durationInMinutes', Number(value));
    }
  };

  const updateCustomDuration = (value) => {
    const normalized = normalizeDurationInput(value);
    updateField('durationInMinutes', normalized);
  };

  const updateAddress = (field, value) => {
    setForm((current) => ({
      ...current,
      address: {
        ...current.address,
        [field]: value,
      },
    }));
    if (errors[`address.${field}`]) {
      setErrors((prev) => ({ ...prev, [`address.${field}`]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Service name is required';
    if (!form.durationInMinutes || Number(form.durationInMinutes) <= 0) {
      newErrors.durationInMinutes = 'Enter valid duration (min 1 min)';
    }

    if (form.mode === 'OFFLINE') {
      if (!form.address.street.trim()) newErrors['address.street'] = 'Street is required';
      if (!form.address.city.trim()) newErrors['address.city'] = 'City is required';
      if (!form.address.country.trim()) newErrors['address.country'] = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    onSubmit(buildPayload(form, organizationId));
  };

  const isEdit = mode === 'edit';
  const CurrencyIcon = currencyIcons[form.currency] || IndianRupee;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 sm:max-w-2xl overflow-hidden rounded-2xl border border-border-strong bg-surface-elevated text-surface-elevated-foreground shadow-2xl [&>button]:cursor-pointer">
        {/* Header */}
        <div className="border-b border-border-subtle px-6 py-4.5 bg-surface-sunken">
          <DialogHeader className="space-y-1">
            <DialogTitle className="font-heading text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
              {isEdit ? 'Edit Service' : 'Create New Service'}
            </DialogTitle>
            <DialogDescription className="text-xs text-subtle-foreground">
              Configure parameters, pricing models, and location settings for client bookings.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="max-h-[calc(85vh-8.5rem)] overflow-y-auto px-6 py-5 space-y-6">

            {/* Section 1: Basic Service Metadata */}
            <div className="space-y-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-subtle-foreground">
                1. General Details
              </div>

              {/* Service Name */}
              <div className="space-y-1.5">
                <Label htmlFor="service-name" className="text-xs font-semibold text-foreground">
                  Service Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="service-name"
                  autoFocus
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className={cn(
                    "h-10 rounded-xl border-border bg-surface text-sm text-foreground shadow-xs transition-all focus-visible:ring-1 focus-visible:ring-ring",
                    errors.name && "border-destructive focus-visible:ring-destructive/20"
                  )}
                  placeholder="e.g. Executive Strategy Consultation"
                />
                {errors.name && (
                  <p className="text-[11px] font-medium text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.name}
                  </p>
                )}
              </div>

              {/* Combined Duration & Price Controls */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Duration Control matching Price & Currency style */}
                <div className="space-y-1.5">
                  <Label htmlFor="service-duration" className="text-xs font-semibold text-foreground">
                    Duration <span className="text-destructive">*</span>
                  </Label>
                  <div
                    className={cn(
                      "flex h-10 rounded-xl border border-border bg-surface shadow-xs focus-within:ring-1 focus-within:ring-ring transition-all overflow-hidden",
                      errors.durationInMinutes && "border-destructive focus-within:ring-destructive/20"
                    )}
                  >
                    <Select
                      value={isCustomDuration ? 'custom' : String(form.durationInMinutes)}
                      onValueChange={updateDurationPreset}
                    >
                      <SelectTrigger className="h-full border-0 border-r border-border rounded-none bg-surface-sunken px-3 text-xs font-semibold text-foreground focus:ring-0 cursor-pointer w-28 shrink-0">
                        <SelectValue placeholder="Duration" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover text-popover-foreground border-border">
                        {DURATION_PRESETS.map((preset) => (
                          <SelectItem key={preset.value} value={preset.value} className="cursor-pointer text-xs font-medium hover:bg-hover hover:text-hover-foreground">
                            {preset.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="relative flex-1 flex items-center">
                      <Clock className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-subtle-foreground shrink-0" />
                      <Input
                        id="service-duration"
                        type="number"
                        min="1"
                        max={MAX_DURATION}
                        step="1"
                        disabled={!isCustomDuration}
                        value={form.durationInMinutes}
                        onFocus={(e) => {
                          if (e.currentTarget.value === '0') e.currentTarget.select();
                        }}
                        onChange={(e) => updateCustomDuration(e.target.value)}
                        className="h-full border-0 bg-transparent pl-8 pr-10 text-sm text-foreground focus-visible:ring-0 shadow-none disabled:opacity-75 disabled:cursor-not-allowed"
                        placeholder="30"
                      />
                      <span className="pointer-events-none absolute right-2.5 text-[10px] font-bold uppercase text-subtle-foreground">
                        mins
                      </span>
                    </div>
                  </div>
                  {errors.durationInMinutes && (
                    <p className="text-[11px] font-medium text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {errors.durationInMinutes}
                    </p>
                  )}
                </div>

                {/* Currency + Price Control */}
                <div className="space-y-1.5">
                  <Label htmlFor="service-price" className="text-xs font-semibold text-foreground">
                    Price & Currency <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex h-10 rounded-xl border border-border bg-surface shadow-xs focus-within:ring-1 focus-within:ring-ring transition-all overflow-hidden">
                    <Select
                      value={form.currency}
                      onValueChange={(value) => updateField('currency', value)}
                    >
                      <SelectTrigger className="h-full border-0 border-r border-border rounded-none bg-surface-sunken px-3 text-xs font-semibold text-foreground focus:ring-0 cursor-pointer w-22.5 shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover text-popover-foreground border-border">
                        <SelectItem value="INR" className="cursor-pointer hover:bg-hover hover:text-hover-foreground">INR (₹)</SelectItem>
                        <SelectItem value="USD" className="cursor-pointer hover:bg-hover hover:text-hover-foreground">USD ($)</SelectItem>
                        <SelectItem value="EUR" className="cursor-pointer hover:bg-hover hover:text-hover-foreground">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="relative flex-1 flex items-center">
                      <CurrencyIcon className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-subtle-foreground shrink-0" />
                      <Input
                        id="service-price"
                        type="number"
                        min="0"
                        max={MAX_PRICE}
                        step="1"
                        value={form.price}
                        onFocus={(e) => {
                          if (e.currentTarget.value === '0') e.currentTarget.select();
                        }}
                        onChange={(e) => updatePriceField(e.target.value)}
                        className="h-full border-0 bg-transparent pl-8 pr-3 text-sm text-foreground focus-visible:ring-0 shadow-none"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px w-full bg-border-subtle" />

            {/* Section 2: Delivery Mode & Dynamic Settings */}
            <div className="space-y-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-subtle-foreground">
                2. Location & Delivery
              </div>

              {/* Mode Segmented Control */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-surface-sunken border border-border-subtle">
                <button
                  type="button"
                  onClick={() => updateField('mode', 'ONLINE')}
                  className={cn(
                    "flex h-9 items-center justify-center gap-2 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                    form.mode === 'ONLINE'
                      ? "bg-surface-elevated text-foreground shadow-xs border border-border font-bold"
                      : "text-subtle-foreground hover:text-foreground"
                  )}
                >
                  <Video className="h-3.5 w-3.5 text-accent shrink-0" />
                  Virtual / Online
                </button>

                <button
                  type="button"
                  onClick={() => updateField('mode', 'OFFLINE')}
                  className={cn(
                    "flex h-9 items-center justify-center gap-2 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                    form.mode === 'OFFLINE'
                      ? "bg-surface-elevated text-foreground shadow-xs border border-border font-bold"
                      : "text-subtle-foreground hover:text-foreground"
                  )}
                >
                  <MapPin className="h-3.5 w-3.5 text-accent shrink-0" />
                  In-Person / Offline
                </button>
              </div>

              {/* ONLINE Mode: Integration Card */}
              {form.mode === 'ONLINE' && (
                <div className="p-4 rounded-xl border border-border-subtle bg-surface space-y-4 animate-in fade-in-50 duration-150">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      Meeting Platform
                    </Label>
                    <Select
                      value={form.meetingProvider}
                      onValueChange={(val) => updateField('meetingProvider', val)}
                    >
                      <SelectTrigger className="h-10 w-full rounded-xl border-border bg-surface-elevated text-sm text-foreground cursor-pointer shadow-xs">
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover text-popover-foreground border-border">
                        {Object.entries(INTEGRATION_CONFIG).map(([key, config]) => {
                          const IconComponent = config.icon;
                          return (
                            <SelectItem key={key} value={key} className="cursor-pointer hover:bg-hover hover:text-hover-foreground">
                              <div className="flex items-center gap-2 text-xs font-medium">
                                {IconComponent && <IconComponent className="h-3.5 w-3.5 text-accent shrink-0" />}
                                <span>{config.name}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-border-subtle">
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-xs font-semibold text-foreground">
                        Auto-generate meeting link
                      </div>
                      <div className="text-[11px] text-subtle-foreground">
                        Automatically attach a unique link to confirmed bookings.
                      </div>
                    </div>
                    <Switch
                      checked={form.autoGenerateMeetingLink}
                      onCheckedChange={(val) => updateField('autoGenerateMeetingLink', val)}
                      className="cursor-pointer transition-all data-[state=checked]:bg-accent data-[state=checked]:shadow-md data-[state=checked]:shadow-accent/30 data-[state=unchecked]:bg-muted-foreground/30 [&>span]:data-[state=checked]:bg-accent-foreground"
                    />
                  </div>
                </div>
              )}

              {/* OFFLINE Mode: Address Fields */}
              {form.mode === 'OFFLINE' && (
                <div className="p-4 rounded-xl border border-border-subtle bg-surface space-y-3 animate-in fade-in-50 duration-150">
                  {/* Street */}
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-foreground">
                      Street Address <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={form.address.street}
                      onChange={(e) => updateAddress('street', e.target.value)}
                      className={cn(
                        "h-10 rounded-xl border-border bg-surface-elevated text-sm text-foreground shadow-xs",
                        errors['address.street'] && "border-destructive"
                      )}
                      placeholder="e.g. 100 Innovation Way, Suite 300"
                    />
                  </div>

                  {/* City + State + Zip */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold text-foreground">
                        City <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        value={form.address.city}
                        onChange={(e) => updateAddress('city', e.target.value)}
                        className={cn("h-9 rounded-xl text-xs bg-surface-elevated border-border text-foreground", errors['address.city'] && "border-destructive")}
                        placeholder="City"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold text-subtle-foreground">
                        State
                      </Label>
                      <Input
                        value={form.address.state}
                        onChange={(e) => updateAddress('state', e.target.value)}
                        className="h-9 rounded-xl text-xs bg-surface-elevated border-border text-foreground"
                        placeholder="State / Prov"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold text-subtle-foreground">
                        Zip
                      </Label>
                      <Input
                        value={form.address.zipCode}
                        onChange={(e) => updateAddress('zipCode', e.target.value)}
                        className="h-9 rounded-xl text-xs bg-surface-elevated border-border text-foreground"
                        placeholder="Postal Code"
                      />
                    </div>
                  </div>

                  {/* Country */}
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-foreground">
                      Country <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={form.address.country}
                      onChange={(e) => updateAddress('country', e.target.value)}
                      className={cn("h-9 rounded-xl text-xs bg-surface-elevated border-border text-foreground", errors['address.country'] && "border-destructive")}
                      placeholder="e.g. United States"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="h-px w-full bg-border-subtle" />

            {/* Section 3: Optional Context */}
            <div className="space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-subtle-foreground">
                3. Additional Information
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="service-description" className="text-xs font-semibold text-foreground">
                    Description
                  </Label>
                  <span className="text-[10px] text-subtle-foreground">(Optional)</span>
                </div>
                <Textarea
                  id="service-description"
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  className="min-h-18 rounded-xl border-border bg-surface p-3 font-normal text-xs sm:text-sm text-foreground shadow-xs resize-y focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Outline topics covered or preparation required for this session..."
                />
              </div>
            </div>

          </div>

          {/* Locked Dialog Footer */}
          <div className="flex items-center justify-end gap-2.5 border-t border-border-subtle px-6 py-3.5 bg-surface-sunken">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 min-h-[40px] rounded-xl border-border bg-surface px-4 text-xs font-bold text-subtle-foreground transition-all hover:bg-surface-elevated hover:text-foreground hover:border-border-strong active:scale-95 cursor-pointer shadow-xs"
            >
              Cancel
            </Button>
            <Button
              disabled={isUpdating}
              type="submit"
              className="h-10 min-h-[40px] rounded-xl bg-accent px-5 text-xs font-bold uppercase tracking-wider text-accent-foreground shadow-md shadow-accent/20 transition-all hover:opacity-90 active:scale-95 cursor-pointer min-w-27.5"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Saving...
                </>
              ) : isEdit ? (
                'Save Changes'
              ) : (
                'Create Service'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}