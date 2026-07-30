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
  onlineMeetingProvider: 'GOOGLE_MEET',
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

const toFormState = (service = null) => {
  if (!service) return DEFAULT_FORM;

  return {
    name: service.name || '',
    description: service.description || '',
    mode: service.mode || 'ONLINE',
    durationInMinutes: service.durationInMinutes || 30,
    price: service.price ?? 0,
    currency: service.currency || 'INR',
    onlineMeetingProvider: service.onlineMeetingProvider || 'GOOGLE_MEET',
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
    payload.onlineMeetingProvider = form.onlineMeetingProvider;
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

  useEffect(() => {
    if (open) {
      setForm(toFormState(service));
      setErrors({});
    }
  }, [service, open]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const updateNumberField = (field, value) => {
    setForm((current) => ({ ...current, [field]: normalizeNumberInput(value) }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
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
    if (errors[`address.${field}`]) {
      setErrors((prev) => ({ ...prev, [`address.${field}`]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Service name is required';
    if (!form.durationInMinutes || Number(form.durationInMinutes) <= 0) {
      newErrors.durationInMinutes = 'Enter valid duration';
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
      <DialogContent className="p-0 sm:max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl [&>button]:cursor-pointer">
        {/* Header */}
        <div className="border-b border-border px-6 py-4.5 bg-muted/20">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
              {isEdit ? 'Edit Service' : 'Create New Service'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configure parameters, pricing models, and location settings for client bookings.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="max-h-[calc(85vh-8.5rem)] overflow-y-auto px-6 py-5 space-y-6">

            {/* Section 1: Basic Service Metadata */}
            <div className="space-y-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                1. General Details
              </div>

              {/* Service Name */}
              <div className="space-y-1.5">
                <Label htmlFor="service-name" className="text-xs font-medium text-foreground">
                  Service Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="service-name"
                  autoFocus
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className={cn(
                    "h-9 rounded-lg border-border/80 bg-background text-sm shadow-2xs transition-all focus-visible:ring-2 focus-visible:ring-primary/20",
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

              {/* Duration + Combined Currency & Price Input */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Duration */}
                <div className="space-y-1.5">
                  <Label htmlFor="service-duration" className="text-xs font-medium text-foreground">
                    Duration <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={String(form.durationInMinutes)}
                    onValueChange={(val) => updateField('durationInMinutes', Number(val))}
                  >
                    <SelectTrigger id="service-duration" className="h-9 w-full rounded-lg border-border/80 bg-background text-sm shadow-2xs cursor-pointer">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15" className="cursor-pointer">15 minutes</SelectItem>
                      <SelectItem value="30" className="cursor-pointer">30 minutes</SelectItem>
                      <SelectItem value="45" className="cursor-pointer">45 minutes</SelectItem>
                      <SelectItem value="60" className="cursor-pointer">60 minutes (1 hr)</SelectItem>
                      <SelectItem value="90" className="cursor-pointer">90 minutes (1.5 hrs)</SelectItem>
                      <SelectItem value="120" className="cursor-pointer">120 minutes (2 hrs)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Compound Currency + Price Control */}
                <div className="space-y-1.5">
                  <Label htmlFor="service-price" className="text-xs font-medium text-foreground">
                    Price & Currency <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex h-9 rounded-lg border border-border/80 bg-background shadow-2xs focus-within:ring-2 focus-within:ring-primary/20 transition-all overflow-hidden">
                    <Select
                      value={form.currency}
                      onValueChange={(value) => updateField('currency', value)}
                    >
                      <SelectTrigger className="h-full border-0 border-r border-border/80 rounded-none bg-muted/30 px-2.5 text-xs font-semibold focus:ring-0 cursor-pointer w-[90px] shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR" className="cursor-pointer">INR (₹)</SelectItem>
                        <SelectItem value="USD" className="cursor-pointer">USD ($)</SelectItem>
                        <SelectItem value="EUR" className="cursor-pointer">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="relative flex-1 flex items-center">
                      <CurrencyIcon className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-muted-foreground shrink-0" />
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
                        className="h-full border-0 bg-transparent pl-8 pr-3 text-sm focus-visible:ring-0 shadow-none"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px w-full bg-border/60" />

            {/* Section 2: Delivery Mode & Dynamic Settings */}
            <div className="space-y-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                2. Location & Delivery
              </div>

              {/* Mode Segmented Control */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-muted/40 border border-border/60">
                <button
                  type="button"
                  onClick={() => updateField('mode', 'ONLINE')}
                  className={cn(
                    "flex h-9 items-center justify-center gap-2 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                    form.mode === 'ONLINE'
                      ? "bg-background text-foreground shadow-2xs border border-border/80"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Video className="h-3.5 w-3.5 text-primary shrink-0" />
                  Virtual / Online
                </button>

                <button
                  type="button"
                  onClick={() => updateField('mode', 'OFFLINE')}
                  className={cn(
                    "flex h-9 items-center justify-center gap-2 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                    form.mode === 'OFFLINE'
                      ? "bg-background text-foreground shadow-2xs border border-border/80"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                  In-Person / Offline
                </button>
              </div>

              {/* ONLINE Mode: Integration Card */}
              {form.mode === 'ONLINE' && (
                <div className="p-4 rounded-xl border border-border/80 bg-card space-y-4 animate-in fade-in-50 duration-150">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground">
                      Meeting Platform
                    </Label>
                    <Select
                      value={form.onlineMeetingProvider}
                      onValueChange={(val) => updateField('onlineMeetingProvider', val)}
                    >
                      <SelectTrigger className="h-9 w-full rounded-lg border-border/80 bg-background text-sm cursor-pointer shadow-2xs">
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(INTEGRATION_CONFIG).map(([key, config]) => {
                          const IconComponent = config.icon;
                          return (
                            <SelectItem key={key} value={key} className="cursor-pointer">
                              <div className="flex items-center gap-2 text-xs font-medium">
                                {IconComponent && <IconComponent className="h-3.5 w-3.5 text-primary shrink-0" />}
                                <span>{config.name}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-1 border-t border-border/50">
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-xs font-medium text-foreground">
                        Auto-generate meeting link
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Automatically attach a unique link to confirmed bookings.
                      </div>
                    </div>
                    <Switch
                      checked={form.autoGenerateMeetingLink}
                      onCheckedChange={(val) => updateField('autoGenerateMeetingLink', val)}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* OFFLINE Mode: Compact Address Matrix */}
              {form.mode === 'OFFLINE' && (
                <div className="p-4 rounded-xl border border-border/80 bg-card space-y-3 animate-in fade-in-50 duration-150">
                  {/* Street */}
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-foreground">
                      Street Address <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={form.address.street}
                      onChange={(e) => updateAddress('street', e.target.value)}
                      className={cn(
                        "h-9 rounded-lg border-border/80 bg-background text-sm shadow-2xs",
                        errors['address.street'] && "border-destructive"
                      )}
                      placeholder="e.g. 100 Innovation Way, Suite 300"
                    />
                  </div>

                  {/* City + State + Zip */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-medium text-foreground">
                        City <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        value={form.address.city}
                        onChange={(e) => updateAddress('city', e.target.value)}
                        className={cn("h-8 rounded-lg text-xs bg-background", errors['address.city'] && "border-destructive")}
                        placeholder="City"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-medium text-muted-foreground">
                        State
                      </Label>
                      <Input
                        value={form.address.state}
                        onChange={(e) => updateAddress('state', e.target.value)}
                        className="h-8 rounded-lg text-xs bg-background"
                        placeholder="State / Prov"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-medium text-muted-foreground">
                        Zip
                      </Label>
                      <Input
                        value={form.address.zipCode}
                        onChange={(e) => updateAddress('zipCode', e.target.value)}
                        className="h-8 rounded-lg text-xs bg-background"
                        placeholder="Postal Code"
                      />
                    </div>
                  </div>

                  {/* Country */}
                  <div className="space-y-1">
                    <Label className="text-[11px] font-medium text-foreground">
                      Country <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={form.address.country}
                      onChange={(e) => updateAddress('country', e.target.value)}
                      className={cn("h-8 rounded-lg text-xs bg-background", errors['address.country'] && "border-destructive")}
                      placeholder="e.g. United States"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="h-px w-full bg-border/60" />

            {/* Section 3: Optional Context */}
            <div className="space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                3. Additional Information
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="service-description" className="text-xs font-medium text-foreground">
                    Description
                  </Label>
                  <span className="text-[10px] text-muted-foreground">(Optional)</span>
                </div>
                <Textarea
                  id="service-description"
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  className="min-h-16 rounded-lg border-border/80 bg-background p-2.5 font-normal text-xs sm:text-sm shadow-2xs resize-y focus-visible:ring-2 focus-visible:ring-primary/20"
                  placeholder="Outline topics covered or preparation required for this session..."
                />
              </div>
            </div>

          </div>

          {/* Locked Dialog Footer */}
          <div className="flex items-center justify-end gap-2.5 border-t border-border px-6 py-3.5 bg-card">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-9 rounded-lg text-xs font-semibold px-4 cursor-pointer hover:bg-accent"
            >
              Cancel
            </Button>
            <Button
              disabled={isUpdating}
              type="submit"
              className="h-9 rounded-lg px-5 text-xs font-bold uppercase tracking-wider shadow-2xs cursor-pointer min-w-[110px]"
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