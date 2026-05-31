import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CalendarClock, Loader2, Plus, Save, Trash2, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { http } from '@/api/httpClient';
import { useAvailabilityStore } from '@/stores';
import { Button } from '@/components/ui/button';
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

const TIMEZONES = [
  'UTC',
  'Africa/Cairo',
  'Africa/Casablanca',
  'Africa/Johannesburg',
  'Africa/Lagos',
  'Africa/Nairobi',
  'America/Anchorage',
  'America/Argentina/Buenos_Aires',
  'America/Bogota',
  'America/Chicago',
  'America/Denver',
  'America/Halifax',
  'America/Los_Angeles',
  'America/Mexico_City',
  'America/New_York',
  'America/Phoenix',
  'America/Sao_Paulo',
  'America/Toronto',
  'America/Vancouver',
  'Asia/Bangkok',
  'Asia/Dhaka',
  'Asia/Dubai',
  'Asia/Hong_Kong',
  'Asia/Jakarta',
  'Asia/Jerusalem',
  'Asia/Karachi',
  'Asia/Kathmandu',
  'Asia/Kolkata',
  'Asia/Seoul',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Adelaide',
  'Australia/Brisbane',
  'Australia/Melbourne',
  'Australia/Perth',
  'Australia/Sydney',
  'Europe/Amsterdam',
  'Europe/Athens',
  'Europe/Berlin',
  'Europe/Brussels',
  'Europe/Budapest',
  'Europe/Copenhagen',
  'Europe/Dublin',
  'Europe/Helsinki',
  'Europe/Istanbul',
  'Europe/Lisbon',
  'Europe/London',
  'Europe/Madrid',
  'Europe/Moscow',
  'Europe/Oslo',
  'Europe/Paris',
  'Europe/Prague',
  'Europe/Rome',
  'Europe/Stockholm',
  'Europe/Vienna',
  'Europe/Warsaw',
  'Europe/Zurich',
  'Pacific/Auckland',
  'Pacific/Fiji',
  'Pacific/Honolulu',
  'Asia/Riyadh',
  'Asia/Qatar',
  'Asia/Kuwait',
  'Asia/Bahrain',
  'Asia/Muscat',
];

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

  const activeDays = useMemo(
    () => DAYS.filter(({ key }) => form[key].enabled).length,
    [form]
  );

  const totalSlots = useMemo(
    () => DAYS.reduce((count, { key }) => count + form[key].slots.length, 0),
    [form]
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

  const addSlot = (dayKey) => {
    setForm((current) => ({
      ...current,
      [dayKey]: {
        ...current[dayKey],
        enabled: true,
        slots: [
          ...current[dayKey].slots,
          { startTime: '09:00', endTime: '17:00' },
        ],
      },
    }));
  };

  const updateSlot = (dayKey, slotIndex, field, value) => {
    setForm((current) => ({
      ...current,
      [dayKey]: {
        ...current[dayKey],
        slots: current[dayKey].slots.map((slot, index) =>
          index === slotIndex ? { ...slot, [field]: value } : slot
        ),
      },
    }));
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
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading Availability...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-3 py-7 sm:px-4 sm:py-10 md:py-14">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/services/all')}
            className="h-9 cursor-pointer rounded-lg px-2 text-xs font-black uppercase tracking-widest text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Services
          </Button>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
              <CalendarClock className="h-4 w-4" />
              Availability
            </div>
            <h1 className="wrap-break-word text-3xl font-black uppercase tracking-tighter sm:text-4xl md:text-5xl">
              {service?.name || 'Service Availability'}
            </h1>
            <p className="text-sm font-medium text-muted-foreground sm:text-base">
              {formatServiceMeta(service)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
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
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isDeleting}
            className="h-11 cursor-pointer rounded-xl text-xs font-black uppercase tracking-widest shadow-sm"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {hasExistingAvailability ? 'Save Changes' : 'Create Availability'}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Active Days
          </div>
          <div className="mt-2 text-2xl font-black">{activeDays}/7</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Time Slots
          </div>
          <div className="mt-2 text-2xl font-black">{totalSlots}</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Timezone
          </Label>
          <Select value={form.timezone} onValueChange={updateTimezone}>
            <SelectTrigger className="mt-2 h-10 w-full rounded-xl bg-background font-bold">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {TIMEZONES.map((timezone) => (
                <SelectItem key={timezone} value={timezone}>
                  {timezone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        {DAYS.map(({ key, label }) => {
          const day = form[key];

          return (
            <section
              key={key}
              className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={day.enabled}
                    onCheckedChange={(checked) => toggleDay(key, checked)}
                    className="cursor-pointer ring-primary/20 data-checked:ring-2 data-unchecked:bg-muted-foreground/35"
                  />
                  <div>
                    <h2 className="text-base font-black uppercase tracking-tight">
                      {label}
                    </h2>
                    <p className="text-xs font-bold text-muted-foreground">
                      {day.enabled ? `${day.slots.length} slot${day.slots.length === 1 ? '' : 's'}` : 'Unavailable'}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addSlot(key)}
                  className="h-9 cursor-pointer rounded-lg text-xs font-black uppercase tracking-widest"
                >
                  <Plus className="h-4 w-4" />
                  Add Slot
                </Button>
              </div>

              {day.enabled && (
                <div className="mt-4 space-y-3">
                  {day.slots.map((slot, index) => (
                    <div
                      key={`${key}-${index}`}
                      className="grid gap-3 rounded-xl border border-border/70 bg-background/70 p-3 sm:grid-cols-[1fr_1fr_44px] sm:items-end"
                    >
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          Start
                        </Label>
                        <Input
                          type="time"
                          value={slot.startTime}
                          onChange={(event) => updateSlot(key, index, 'startTime', event.target.value)}
                          className="h-10 rounded-xl font-bold"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          End
                        </Label>
                        <Input
                          type="time"
                          value={slot.endTime}
                          onChange={(event) => updateSlot(key, index, 'endTime', event.target.value)}
                          className="h-10 rounded-xl font-bold"
                        />
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removeSlot(key, index)}
                        className="h-10 cursor-pointer rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
