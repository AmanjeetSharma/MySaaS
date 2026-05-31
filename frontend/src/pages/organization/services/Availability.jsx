import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CalendarClock,
  Edit3,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import { timezones } from '@/config/timezone.config.js';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { http } from '@/api/httpClient';
import { useAvailabilityStore } from '@/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

const PRESETS = [
  { key: 'morning', label: 'Morning', startTime: '10:00', endTime: '12:00' },
  { key: 'afternoon', label: 'Afternoon', startTime: '13:00', endTime: '16:00' },
  { key: 'evening', label: 'Evening', startTime: '17:00', endTime: '20:00' },
  { key: 'night', label: 'Night', startTime: '20:00', endTime: '22:00' },
];

const TIMEZONES = timezones;

const createEmptyDay = () => ({
  enabled: false,
  slots: [],
});

const createDefaultForm = () => ({
  timezone: 'UTC',
  monday: createEmptyDay(),
  tuesday: createEmptyDay(),
  wednesday: createEmptyDay(),
  thursday: createEmptyDay(),
  friday: createEmptyDay(),
  saturday: createEmptyDay(),
  sunday: createEmptyDay(),
});

const normalizeDay = (day) => ({
  enabled: !!day?.enabled,
  slots: Array.isArray(day?.slots)
    ? day.slots.map((slot) => ({
      startTime: slot.startTime || '09:00',
      endTime: slot.endTime || '17:00',
    }))
    : [],
});

const toForm = (availability) => {
  const form = createDefaultForm();

  if (!availability) return form;

  form.timezone = availability.timezone || 'UTC';

  DAYS.forEach(({ key }) => {
    form[key] = normalizeDay(availability[key]);
  });

  return form;
};

const formatServiceMeta = (service) => {
  if (!service) return 'Service availability';

  const duration = service.durationInMinutes ? `${service.durationInMinutes} min` : null;
  const mode = service.mode || null;

  return [duration, mode].filter(Boolean).join(' - ') || 'Service availability';
};

const formatTime = (time) => {
  if (!time) return '';

  const [hours, minutes] = time.split(':').map(Number);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const normalizedHour = hours % 12 || 12;

  return `${normalizedHour}:${String(minutes || 0).padStart(2, '0')} ${suffix}`;
};

const formatSlot = (slot) => `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`;

const toPayload = (form) => {
  const payload = {
    timezone: form.timezone,
  };

  DAYS.forEach(({ key }) => {
    const day = form[key];

    payload[key] = {
      enabled: day.enabled,
      slots: day.enabled ? day.slots : [],
    };
  });

  return payload;
};

const stringifyPayload = (form) => JSON.stringify(toPayload(form));

export default function Availability() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const {
    availability,
    getAvailability,
    createAvailability,
    updateAvailability,
    deleteAvailability,
    clearAvailability,
    isLoading,
    isSaving,
    isDeleting,
  } = useAvailabilityStore();

  const [form, setForm] = useState(createDefaultForm);
  const [service, setService] = useState(null);
  const [serviceLoading, setServiceLoading] = useState(true);
  const [hasExistingAvailability, setHasExistingAvailability] = useState(false);
  const [slotModal, setSlotModal] = useState(null);

  const activeDays = useMemo(
    () => DAYS.filter(({ key }) => form[key].enabled).length,
    [form]
  );

  const totalSlots = useMemo(
    () => DAYS.reduce((count, { key }) => count + form[key].slots.length, 0),
    [form]
  );

  const savedForm = useMemo(
    () => (hasExistingAvailability ? toForm(availability) : createDefaultForm()),
    [availability, hasExistingAvailability]
  );

  const hasChanges = useMemo(
    () => stringifyPayload(form) !== stringifyPayload(savedForm),
    [form, savedForm]
  );

  const slotModalDay = useMemo(
    () => DAYS.find((day) => day.key === slotModal?.dayKey),
    [slotModal?.dayKey]
  );

  useEffect(() => {
    let mounted = true;

    const loadService = async () => {
      setServiceLoading(true);

      try {
        const response = await http.get(`/services/${serviceId}`);
        if (mounted) setService(response.data?.data || null);
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to load service');
      } finally {
        if (mounted) setServiceLoading(false);
      }
    };

    if (serviceId) loadService();

    return () => {
      mounted = false;
    };
  }, [serviceId]);

  useEffect(() => {
    if (!serviceId) return;

    getAvailability(serviceId)
      .then((data) => {
        setHasExistingAvailability(!!data?._id);
        setForm(toForm(data));
      })
      .catch((error) => {
        if (error?.response?.status === 404) {
          setHasExistingAvailability(false);
          setForm(createDefaultForm());
          return;
        }

        toast.error(error?.response?.data?.message || 'Failed to load availability');
      });

    return () => {
      clearAvailability();
    };
  }, [clearAvailability, getAvailability, serviceId]);

  const updateTimezone = (timezone) => {
    setForm((current) => ({ ...current, timezone }));
  };

  const toggleDay = (dayKey, enabled) => {
    setForm((current) => {
      const slots = current[dayKey].slots.length
        ? current[dayKey].slots
        : [{ startTime: '09:00', endTime: '17:00' }];

      return {
        ...current,
        [dayKey]: {
          ...current[dayKey],
          enabled,
          slots: enabled ? slots : current[dayKey].slots,
        },
      };
    });
  };

  const openAddSlot = (dayKey, preset = null) => {
    setSlotModal({
      mode: 'add',
      dayKey,
      slotIndex: null,
      startTime: preset?.startTime || '09:00',
      endTime: preset?.endTime || '17:00',
      title: preset?.label ? `${preset.label} slot` : 'Custom slot',
    });
  };

  const openEditSlot = (dayKey, slotIndex) => {
    const slot = form[dayKey].slots[slotIndex];

    setSlotModal({
      mode: 'edit',
      dayKey,
      slotIndex,
      startTime: slot.startTime,
      endTime: slot.endTime,
      title: 'Edit slot',
    });
  };

  const updateSlotModal = (field, value) => {
    setSlotModal((current) => current ? { ...current, [field]: value } : current);
  };

  const commitSlotModal = () => {
    if (!slotModal) return;

    if (!slotModal.startTime || !slotModal.endTime) {
      toast.error('Start and end time are required');
      return;
    }

    if (slotModal.startTime >= slotModal.endTime) {
      toast.error('End time must be after start time');
      return;
    }

    const nextSlot = {
      startTime: slotModal.startTime,
      endTime: slotModal.endTime,
    };

    setForm((current) => ({
      ...current,
      [slotModal.dayKey]: {
        ...current[slotModal.dayKey],
        enabled: true,
        slots: slotModal.mode === 'edit'
          ? current[slotModal.dayKey].slots.map((slot, index) =>
            index === slotModal.slotIndex ? nextSlot : slot
          )
          : [...current[slotModal.dayKey].slots, nextSlot],
      },
    }));

    setSlotModal(null);
  };

  const removeSlot = (dayKey, slotIndex) => {
    setForm((current) => {
      const slots = current[dayKey].slots.filter((_, index) => index !== slotIndex);

      return {
        ...current,
        [dayKey]: {
          ...current[dayKey],
          enabled: slots.length > 0 ? current[dayKey].enabled : false,
          slots,
        },
      };
    });
  };

  const validateForm = () => {
    for (const { key, label } of DAYS) {
      const day = form[key];

      if (day.enabled && day.slots.length === 0) {
        return `${label} needs at least one time slot`;
      }

      for (const slot of day.slots) {
        if (!slot.startTime || !slot.endTime) {
          return `${label} has an incomplete time slot`;
        }

        if (slot.startTime >= slot.endTime) {
          return `${label} has a slot where end time must be after start time`;
        }
      }
    }

    return null;
  };

  const handleSave = async () => {
    const validationError = validateForm();

    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      const payload = toPayload(form);
      const saved = hasExistingAvailability
        ? await updateAvailability(serviceId, payload)
        : await createAvailability(serviceId, payload);

      setHasExistingAvailability(!!saved?._id);
      setForm(toForm(saved));
      toast.success(hasExistingAvailability ? 'Availability updated' : 'Availability created');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to save availability');
    }
  };

  const handleReset = () => {
    setForm(toForm(availability));
  };

  const handleDelete = async () => {
    try {
      await deleteAvailability(serviceId);
      setHasExistingAvailability(false);
      setForm(createDefaultForm());
      toast.success('Availability deleted');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to delete availability');
    }
  };

  if (isLoading || serviceLoading) {
    return (
      <div className="flex h-screen items-center justify-center gap-3 font-black uppercase tracking-widest text-muted-foreground/60">
        Syncronizing Workspace...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-3 py-7 sm:px-4 sm:py-10 md:py-14">
      <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 space-y-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/services/all')}
            className="h-9 cursor-pointer rounded-lg px-2 text-xs font-black uppercase tracking-widest text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Services
          </Button>

          <div className="min-w-0 space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
              <CalendarClock className="h-4 w-4" />
              Availability
            </div>
            <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center">
              <h1 className="max-w-4xl break-words text-3xl font-black uppercase leading-tight tracking-tight [overflow-wrap:anywhere] sm:text-4xl md:text-5xl">
                {service?.name || 'Service Availability'}
              </h1>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Badge
                  variant="secondary"
                  className="h-7 rounded-full border border-primary/10 bg-primary/10 px-3 text-xs font-black text-primary"
                >
                  {activeDays}/7 Active Days
                </Badge>
                <Badge
                  variant="outline"
                  className="h-7 rounded-full bg-background px-3 text-xs font-black"
                >
                  {totalSlots} Time Slots
                </Badge>
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground sm:text-base">
              {formatServiceMeta(service)}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {hasChanges && (
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isSaving}
              className="h-11 cursor-pointer rounded-xl text-xs font-black uppercase tracking-widest"
            >
              <X className="h-4 w-4" />
              Reset
            </Button>
          )}
          {hasExistingAvailability && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting || isSaving}
              className="h-11 cursor-pointer rounded-xl text-xs font-black uppercase tracking-widest"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete
            </Button>
          )}
          {hasChanges && (
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isDeleting}
              className="h-11 cursor-pointer rounded-xl text-xs font-black uppercase tracking-widest shadow-sm"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {hasExistingAvailability ? 'Save Changes' : 'Create Availability'}
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-primary/15 bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 space-y-1">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Timezone
            </Label>
            <div className="break-words text-xl font-black tracking-tight [overflow-wrap:anywhere] sm:text-2xl">
              {form.timezone}
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Booking slots will be interpreted in this service timezone.
            </p>
          </div>

          <div className="w-full lg:max-w-md">
            <Select value={form.timezone} onValueChange={updateTimezone}>
              <SelectTrigger className="h-12 w-full rounded-xl border-primary/20 bg-background px-4 font-black shadow-sm">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {TIMEZONES.map((timezone) => (
                  <SelectItem key={timezone} value={timezone} className="cursor-pointer font-bold">
                    {timezone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {DAYS.map(({ key, label }) => {
          const day = form[key];

          return (
            <section
              key={key}
              className={`rounded-xl border bg-card p-4 shadow-sm sm:p-5 ${day.enabled ? 'border-primary/25' : 'border-border'}`}
            >
              <div className="flex min-h-34 flex-col justify-between gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <Switch
                      checked={day.enabled}
                      onCheckedChange={(checked) => toggleDay(key, checked)}
                      className="mt-1 cursor-pointer ring-primary/20 data-checked:ring-2 data-unchecked:bg-muted-foreground/35"
                    />
                    <div className="min-w-0">
                      <h2 className="text-base font-black uppercase tracking-tight">
                        {label}
                      </h2>
                      <p className="mt-1 text-xs font-bold text-muted-foreground">
                        {day.enabled ? `${day.slots.length} slot${day.slots.length === 1 ? '' : 's'} configured` : 'Unavailable'}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => openAddSlot(key)}
                    className="h-9 shrink-0 cursor-pointer rounded-lg text-xs font-black uppercase tracking-widest"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>

                <div className="flex min-h-8 gap-2 overflow-x-auto pb-1">
                  {day.enabled && day.slots.length > 0 ? (
                    day.slots.map((slot, index) => (
                      <button
                        type="button"
                        key={`${key}-summary-${index}`}
                        onClick={() => openEditSlot(key, index)}
                        className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-black text-primary hover:bg-primary/15"
                      >
                        {formatSlot(slot)}
                        <Edit3 className="h-3 w-3" />
                      </button>
                    ))
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-black text-muted-foreground">
                      No slots
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 border-t border-border/70 pt-3">
                  {PRESETS.map((preset) => (
                    <Button
                      key={preset.key}
                      type="button"
                      variant="secondary"
                      onClick={() => openAddSlot(key, preset)}
                      className="h-8 cursor-pointer rounded-lg px-2.5 text-[10px] font-black uppercase tracking-widest"
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <Dialog open={!!slotModal} onOpenChange={(open) => !open && setSlotModal(null)}>
        <DialogContent className="rounded-2xl border-primary/15 shadow-2xl shadow-primary/10 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-black uppercase tracking-tight">
              {slotModal?.mode === 'edit' ? 'Edit Time Slot' : 'Add Time Slot'}
            </DialogTitle>
            <DialogDescription className="font-medium">
              {slotModalDay?.label || 'Day'} · {slotModal?.title || 'Custom slot'}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-border/70 bg-background/80 p-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Start
                </Label>
                <div className="relative">
                  <Input
                    type="time"
                    value={slotModal?.startTime || ''}
                    onChange={(event) => updateSlotModal('startTime', event.target.value)}
                    className="h-12 cursor-text rounded-xl bg-card pr-10 font-black shadow-sm [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  End
                </Label>
                <div className="relative">
                  <Input
                    type="time"
                    value={slotModal?.endTime || ''}
                    onChange={(event) => updateSlotModal('endTime', event.target.value)}
                    className="h-12 cursor-text rounded-xl bg-card pr-10 font-black shadow-sm [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-lg bg-muted/50 px-3 py-2 text-xs font-bold text-muted-foreground">
              This updates the draft schedule only. Use Save Changes to publish it.
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <div>
              {slotModal?.mode === 'edit' && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    removeSlot(slotModal.dayKey, slotModal.slotIndex);
                    setSlotModal(null);
                  }}
                  className="h-11 cursor-pointer rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSlotModal(null)}
                className="h-11 flex-1 cursor-pointer rounded-xl font-black sm:flex-none"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={commitSlotModal}
                className="h-11 flex-1 cursor-pointer rounded-xl font-black sm:flex-none"
              >
                {slotModal?.mode === 'edit' ? 'Update' : 'Add'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
