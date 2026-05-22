import { useMemo, useState } from 'react';
import { ChevronDown, DollarSign, Euro, Globe2, IndianRupee, Link2, MapPin, Video, WalletCards } from 'lucide-react';
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

const DEFAULT_FORM = {
  name: '',
  description: '',
  mode: 'ONLINE',
  durationInMinutes: 30,
  price: 0,
  currency: 'INR',
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

const toFormState = (service = null) => {
  if (!service) return DEFAULT_FORM;

  return {
    name: service.name || '',
    description: service.description || '',
    mode: service.mode || 'ONLINE',
    durationInMinutes: service.durationInMinutes || 30,
    price: service.price ?? 0,
    currency: service.currency || 'INR',
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

  if (form.mode === 'OFFLINE') {
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

const PublicServicePreview = ({ service }) => {
  const isOffline = service.mode === 'OFFLINE';
  const CurrencyIcon = currencyIcons[service.currency] || IndianRupee;

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
            {isOffline ? <MapPin className="h-3 w-3" /> : <Video className="h-3 w-3" />}
            {service.mode || 'ONLINE'}
          </div>
          <h3 className="mt-4 wrap-break-word text-2xl font-black uppercase tracking-tight">
            {service.name || 'Service name'}
          </h3>
        </div>
        <div className="shrink-0 text-right">
          <div className="flex items-center justify-end gap-1.5 text-xl font-black">
            <WalletCards className="h-4 w-4 text-muted-foreground" />
            <CurrencyIcon className="h-4 w-4" />
            {formatAmount(service)}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {service.durationInMinutes || 30} min
          </div>
        </div>
      </div>

      <p className="mt-4 min-h-12 text-sm font-medium leading-relaxed text-muted-foreground">
        {service.description || 'A clear description of what customers can book.'}
      </p>

      <div className="mt-5 flex items-start gap-2 rounded-xl bg-muted/60 p-3 text-sm font-medium">
        {isOffline ? <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> : <Link2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />}
        <span className="wrap-break-word">
          {isOffline ? formatAddress(service.address) : 'Google Meet link generated after booking'}
        </span>
      </div>

      <Button
        type="button"
        className="mt-5 h-11 w-full cursor-default rounded-xl font-black uppercase tracking-widest"
      >
        Book Service
      </Button>
    </div>
  );
};

export default function ServiceModal({
  open,
  mode,
  service,
  organizationId,
  isUpdating,
  isMeetingLinkUpdating,
  onOpenChange,
  onSubmit,
  onToggleMeetingLink,
}) {
  const [form, setForm] = useState(() => toFormState(service));
  const [meetingLinkEnabled, setMeetingLinkEnabled] = useState(() => !!service?.autoGenerateMeetingLink);

  const previewService = useMemo(() => ({
    ...service,
    ...form,
    price: Number(form.price || 0),
    durationInMinutes: Number(form.durationInMinutes || 0),
  }), [form, service]);

  const updateField = (field, value) => {
    setForm(current => ({ ...current, [field]: value }));
  };

  const updateNumberField = (field, value) => {
    setForm(current => ({ ...current, [field]: normalizeNumberInput(value) }));
  };

  const updatePriceField = (value) => {
    setForm(current => ({ ...current, price: normalizePriceInput(value) }));
  };

  const updateAddress = (field, value) => {
    setForm(current => ({
      ...current,
      address: {
        ...current.address,
        [field]: value,
      },
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(buildPayload(form, organizationId));
  };

  const isEdit = mode === 'edit';
  const CurrencyIcon = currencyIcons[form.currency] || IndianRupee;
  const fieldClassName = 'h-11 rounded-xl border-border/80 bg-background font-bold shadow-sm transition-shadow focus-visible:shadow-md sm:h-12';
  const handleMeetingLinkToggle = async () => {
    if (!service || !onToggleMeetingLink) return;

    try {
      const result = await onToggleMeetingLink(service);
      setMeetingLinkEnabled(!!result?.autoGenerateMeetingLink);
    } catch {
      setMeetingLinkEnabled(!!service.autoGenerateMeetingLink);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-2xl p-3 sm:max-w-5xl sm:rounded-[1.5rem] sm:p-4">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-tight sm:text-2xl">
            {isEdit ? 'Edit Service' : 'Create Service'}
          </DialogTitle>
          <DialogDescription className="font-medium">
            Update the booking details on the left and review the public card on the right.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 pt-1 sm:gap-6 sm:pt-2 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4 sm:space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Service Name
                </Label>
                <Input
                  autoFocus
                  value={form.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  className={`${fieldClassName} text-base`}
                  placeholder="Strategy consultation"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Meeting Link
                </Label>
                <div className="flex h-11 items-center justify-between gap-3 rounded-xl border border-border/80 bg-background px-3 shadow-sm sm:h-12">
                  <div className="min-w-0">
                    <div className="truncate text-xs font-black uppercase tracking-widest">
                      Auto Meet
                    </div>
                    <div className="truncate text-[11px] font-medium text-muted-foreground">
                      {isEdit ? 'Google Meet' : 'Available after create'}
                    </div>
                  </div>
                  <Switch
                    checked={meetingLinkEnabled}
                    onCheckedChange={handleMeetingLinkToggle}
                    disabled={!isEdit || isMeetingLinkUpdating}
                    className="cursor-pointer ring-primary/20 data-checked:ring-2 data-unchecked:bg-muted-foreground/35"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Currency
                </Label>
                <Select value={form.currency} onValueChange={(value) => updateField('currency', value)}>
                  <SelectTrigger className="h-11 w-full rounded-xl border-border/80 bg-background shadow-sm sm:h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Duration
                </Label>
                <Input
                  type="number"
                  min="15"
                  value={form.durationInMinutes}
                  onFocus={(event) => {
                    if (event.currentTarget.value === '0') event.currentTarget.select();
                  }}
                  onChange={(event) => updateNumberField('durationInMinutes', event.target.value)}
                  className={fieldClassName}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Price
                </Label>
                <div className="relative">
                  <WalletCards className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <CurrencyIcon className="pointer-events-none absolute left-9 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground" />
                  <Input
                    type="number"
                    min="0"
                    max={MAX_PRICE}
                    step="0.01"
                    value={form.price}
                    onFocus={(event) => {
                      if (event.currentTarget.value === '0') event.currentTarget.select();
                    }}
                    onChange={(event) => updatePriceField(event.target.value)}
                    className={`${fieldClassName} pl-16`}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Description
              </Label>
              <Textarea
                value={form.description}
                onChange={(event) => updateField('description', event.target.value)}
                className="min-h-24 rounded-xl border-border/80 bg-background shadow-sm focus-visible:shadow-md sm:min-h-28"
                placeholder="Tell customers what they get from this service."
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Service Mode
              </Label>
              <div className="relative rounded-xl border border-border/80 bg-background p-1 shadow-sm">
                <div className={`absolute bottom-1 top-1 w-[calc(50%-0.25rem)] rounded-lg bg-primary shadow-sm transition-transform duration-200 ${form.mode === 'ONLINE' ? 'translate-x-full' : 'translate-x-0'}`} />
                <div className="relative grid grid-cols-2">
                  <button
                    type="button"
                    onClick={() => updateField('mode', 'OFFLINE')}
                    className={`flex h-14 cursor-pointer items-center justify-center gap-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors ${form.mode === 'OFFLINE' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <MapPin className="h-4 w-4" />
                    Offline
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('mode', 'ONLINE')}
                    className={`flex h-14 cursor-pointer items-center justify-center gap-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors ${form.mode === 'ONLINE' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <Video className="h-4 w-4" />
                    Online
                  </button>
                </div>
                {form.mode === 'OFFLINE' && (
                  <div className="pointer-events-none absolute left-1/4 top-full z-10 flex -translate-x-1/2 -translate-y-1 items-center justify-center rounded-full border border-border bg-background p-1 text-primary shadow-sm">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                )}
              </div>
            </div>

            {form.mode === 'OFFLINE' && (
              <div className="grid gap-3 rounded-xl border border-border/70 bg-muted/30 p-3 sm:grid-cols-2 sm:gap-4 sm:rounded-2xl sm:p-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Street
                  </Label>
                  <Input
                    value={form.address.street}
                    onChange={(event) => updateAddress('street', event.target.value)}
                    className={fieldClassName}
                    placeholder="Office / building / street"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    City
                  </Label>
                  <Input
                    value={form.address.city}
                    onChange={(event) => updateAddress('city', event.target.value)}
                    className={fieldClassName}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    State
                  </Label>
                  <Input
                    value={form.address.state}
                    onChange={(event) => updateAddress('state', event.target.value)}
                    className={fieldClassName}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Country
                  </Label>
                  <Input
                    value={form.address.country}
                    onChange={(event) => updateAddress('country', event.target.value)}
                    className={fieldClassName}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Zip Code
                  </Label>
                  <Input
                    value={form.address.zipCode}
                    onChange={(event) => updateAddress('zipCode', event.target.value)}
                    className={fieldClassName}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-11 flex-1 cursor-pointer rounded-xl font-bold sm:h-12"
              >
                Cancel
              </Button>
              <Button
                disabled={isUpdating}
                type="submit"
                className="h-11 flex-1 cursor-pointer rounded-xl text-xs font-black uppercase tracking-widest sm:h-12 sm:text-sm"
              >
                {isUpdating ? 'Saving...' : isEdit ? 'Save Service' : 'Create Service'}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <Globe2 className="h-3.5 w-3.5" />
              Public Preview
            </div>
            <PublicServicePreview service={previewService} />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
