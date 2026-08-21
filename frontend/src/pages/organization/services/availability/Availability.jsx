import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CalendarClock,
  Check,
  ChevronsUpDown,
  Edit3,
  Loader2,
  Plus,
  RotateCcw,
  X,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { http } from '@/api/httpClient';
import { useAvailabilityStore } from '@/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

import AddAvailabilityModal from './AddAvailabilityModal';
import {
  DAYS,
  PRESETS,
  checkSlotOverlap,
  createDefaultForm,
  formatServiceMeta,
  formatSlot,
  getActiveDaysCount,
  getPresetSlotRange,
  getTotalSlotsCount,
  minutesToTime,
  sortSlots,
  stringifyPayload,
  timeToMinutes,
  toForm,
  toPayload,
  validateForm,
} from './availability.helper';
import { TIMEZONES } from '@/constants/timezone.constant';

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

  // Modal & Dropdown UI State
  const [slotModal, setSlotModal] = useState(null);
  const [timezoneSearchOpen, setTimezoneSearchOpen] = useState(false);

  // Computed Summaries
  const activeDays = useMemo(() => getActiveDaysCount(form), [form]);
  const totalSlots = useMemo(() => getTotalSlotsCount(form), [form]);

  const serviceDuration = useMemo(
    () => service?.durationInMinutes || 60,
    [service?.durationInMinutes]
  );

  const savedForm = useMemo(
    () => (hasExistingAvailability ? toForm(availability) : createDefaultForm()),
    [availability, hasExistingAvailability]
  );

  const hasChanges = useMemo(
    () => stringifyPayload(form) !== stringifyPayload(savedForm),
    [form, savedForm]
  );

  // Service Data Fetching
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

  // Availability Data Fetching
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

    return () => clearAvailability();
  }, [clearAvailability, getAvailability, serviceId]);

  // Handler Functions
  const updateTimezone = (timezone) => {
    setForm((current) => ({ ...current, timezone }));
    setTimezoneSearchOpen(false);
  };

  const toggleDay = (dayKey, enabled) => {
    setForm((current) => {
      const day = current.days[dayKey];

      const defaultEndMins = Math.min(1440, 540 + serviceDuration);
      const slots = day.slots.length
        ? day.slots
        : [{ startTime: '09:00', endTime: minutesToTime(defaultEndMins) }];

      return {
        ...current,
        days: {
          ...current.days,
          [dayKey]: {
            ...day,
            enabled,
            slots: enabled ? slots : day.slots,
          },
        },
      };
    });
  };

  const openAddSlot = (dayKey, preset = null) => {
    const existingSlots = form.days[dayKey].slots;
    let defaultStart = '09:00';
    let defaultEnd = minutesToTime(Math.min(1440, 540 + serviceDuration));

    if (preset) {
      const presetRange = getPresetSlotRange(preset, serviceDuration);
      defaultStart = presetRange.startTime;
      defaultEnd = presetRange.endTime;
    } else if (existingSlots.length > 0) {
      const sorted = sortSlots(existingSlots);
      const lastSlot = sorted[sorted.length - 1];
      const lastEndMins = timeToMinutes(lastSlot.endTime);

      if (lastEndMins < 1440) {
        defaultStart = minutesToTime(lastEndMins);
        defaultEnd = minutesToTime(Math.min(1440, lastEndMins + serviceDuration));
      }
    }

    setSlotModal({
      mode: 'add',
      dayKey,
      slotIndex: null,
      startTime: defaultStart,
      endTime: defaultEnd,
      title: preset?.label ? `${preset.label} window` : 'Custom window',
    });
  };

  const openEditSlot = (dayKey, slotIndex) => {
    const slot = form.days[dayKey].slots[slotIndex];
    setSlotModal({
      mode: 'edit',
      dayKey,
      slotIndex,
      startTime: slot.startTime,
      endTime: slot.endTime,
      title: 'Edit window',
    });
  };

  const updateSlotModalStartTime = (value) => {
    setSlotModal((current) => {
      if (!current) return current;
      const newStartMins = timeToMinutes(value);
      const currentEndMins = timeToMinutes(current.endTime);

      let nextEnd = current.endTime;
      if (currentEndMins <= newStartMins) {
        nextEnd = minutesToTime(Math.min(1440, newStartMins + serviceDuration));
      }

      return { ...current, startTime: value, endTime: nextEnd };
    });
  };

  const updateSlotModalField = (field, value) => {
    setSlotModal((current) => (current ? { ...current, [field]: value } : current));
  };

  const commitSlotModal = () => {
    if (!slotModal) return;

    const startMinutes = timeToMinutes(slotModal.startTime);
    const endMinutes = timeToMinutes(slotModal.endTime);

    if (startMinutes >= endMinutes) {
      toast.error('End time must be after start time');
      return;
    }

    const availableMins = endMinutes - startMinutes;
    if (availableMins < serviceDuration) {
      toast.error(`Window must be at least ${serviceDuration} minutes long to fit an appointment`);
      return;
    }

    const existingSlots = form.days[slotModal.dayKey].slots;
    const hasOverlap = checkSlotOverlap(
      existingSlots,
      startMinutes,
      endMinutes,
      slotModal.mode === 'edit' ? slotModal.slotIndex : null
    );

    if (hasOverlap) {
      toast.error('Time window overlaps with an existing window');
      return;
    }

    const nextSlot = {
      startTime: slotModal.startTime,
      endTime: slotModal.endTime,
    };

    setForm((current) => {
      const targetDay = current.days[slotModal.dayKey];
      return {
        ...current,
        days: {
          ...current.days,
          [slotModal.dayKey]: {
            ...targetDay,
            enabled: true,
            slots:
              slotModal.mode === 'edit'
                ? targetDay.slots.map((slot, index) =>
                  index === slotModal.slotIndex ? nextSlot : slot
                )
                : [...targetDay.slots, nextSlot],
          },
        },
      };
    });

    setSlotModal(null);
  };

  const removeSlot = () => {
    if (!slotModal) return;
    const { dayKey, slotIndex } = slotModal;

    setForm((current) => {
      const targetDay = current.days[dayKey];
      const slots = targetDay.slots.filter((_, index) => index !== slotIndex);

      return {
        ...current,
        days: {
          ...current.days,
          [dayKey]: {
            ...targetDay,
            enabled: slots.length > 0 ? targetDay.enabled : false,
            slots,
          },
        },
      };
    });

    setSlotModal(null);
  };

  const handleSave = async () => {
    const validationError = validateForm(form);
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

  const handleDelete = async () => {
    try {
      await deleteAvailability(serviceId);
      setHasExistingAvailability(false);
      setForm(createDefaultForm());
      toast.success('Availability has been reset to default');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to reset availability');
    }
  };

  if (isLoading || serviceLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center animate-pulse text-sm font-semibold uppercase tracking-widest text-subtle-foreground/60">
        Synchronizing Workspace...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-3 py-7 sm:px-4 sm:py-10 md:py-14">
      {/* Header Section */}
      <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 space-y-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(`/organizations/${service?.organization}/services/${serviceId}`)}
            className="h-9 cursor-pointer rounded-xl px-2 text-xs font-bold uppercase tracking-wider text-subtle-foreground hover:bg-hover hover:text-hover-foreground active:scale-95 transition-all"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Service
          </Button>

          <div className="min-w-0 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent">
              <CalendarClock className="h-4 w-4" />
              Availability
            </div>
            <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center">
              <h1 className="font-heading max-w-4xl wrap-break-word text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                {service?.name || 'Service Availability'}
              </h1>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Badge
                  variant="secondary"
                  className="h-7 rounded-full border border-border-subtle bg-secondary px-3 text-xs font-bold text-secondary-foreground"
                >
                  {activeDays}/7 Active Days
                </Badge>
                <Badge
                  variant="outline"
                  className="h-7 rounded-full border-border-subtle bg-surface-elevated px-3 text-xs font-bold text-foreground"
                >
                  {totalSlots} Windows
                </Badge>
              </div>
            </div>
            <p className="text-sm font-medium text-subtle-foreground sm:text-base">
              {formatServiceMeta(service)}
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex shrink-0 flex-wrap gap-2">
          {hasChanges && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setForm(toForm(availability))}
              disabled={isSaving}
              className="h-11 cursor-pointer rounded-xl border border-border bg-surface text-subtle-foreground text-xs font-bold transition-all hover:bg-surface-sunken hover:text-foreground hover:border-border-strong active:scale-95 shadow-xs"
            >
              <X className="h-4 w-4 mr-1" />
              Discard Changes
            </Button>
          )}
          {hasExistingAvailability && (
            <Button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || isSaving}
              className="h-11 cursor-pointer rounded-xl bg-secondary text-secondary-foreground border border-border-subtle text-xs font-bold uppercase tracking-wider shadow-xs transition-all hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive active:scale-95"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-1.5" />
              )}
              Reset Availability
            </Button>
          )}
          {hasChanges && (
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isDeleting}
              className="h-11 cursor-pointer rounded-xl bg-accent px-5 text-xs font-bold uppercase tracking-wider text-accent-foreground shadow-md shadow-accent/20 transition-all hover:opacity-90 active:scale-95"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              ) : (
                <Plus className="h-4 w-4 mr-1 stroke-[2.5]" />
              )}
              {hasExistingAvailability ? 'Save Changes' : 'Create Availability'}
            </Button>
          )}
        </div>
      </div>

      {/* Timezone Selector Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-surface-elevated p-4 shadow-xs md:flex-row md:items-center md:justify-between text-surface-elevated-foreground">
        <div className="space-y-0.5">
          <Label className="text-[10px] font-bold uppercase tracking-wider text-subtle-foreground">
            Service Timezone
          </Label>
          <p className="text-xs text-subtle-foreground font-medium">
            Slots are interpreted using this timezone offset.
          </p>
        </div>

        <div className="w-full md:w-72 shrink-0">
          <Popover open={timezoneSearchOpen} onOpenChange={setTimezoneSearchOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={timezoneSearchOpen}
                className="h-10 w-full justify-between rounded-xl border-border bg-surface px-3 font-semibold text-xs text-foreground cursor-pointer hover:border-border-strong hover:bg-hover transition-all shadow-xs"
              >
                <span className="truncate">{form.timezone}</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-subtle-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 z-50 border-border-strong bg-popover text-popover-foreground shadow-2xl rounded-xl" align="end">
              <Command className="bg-popover text-popover-foreground">
                <CommandInput placeholder="Search timezone..." className="h-9 text-xs" />
                <CommandList className="max-h-56">
                  <CommandEmpty className="py-2 text-center text-xs font-medium text-subtle-foreground">
                    No timezone found.
                  </CommandEmpty>
                  <CommandGroup>
                    {TIMEZONES.map((tz) => (
                      <CommandItem
                        key={tz}
                        value={tz}
                        onSelect={() => updateTimezone(tz)}
                        className="text-xs font-semibold cursor-pointer hover:bg-hover hover:text-hover-foreground"
                      >
                        <Check
                          className={cn(
                            'mr-2 h-3.5 w-3.5 text-accent',
                            form.timezone === tz ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {tz}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Day Cards Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {DAYS.map(({ key, label }) => {
          const day = form.days[key];

          return (
            <section
              key={key}
              className={cn(
                'rounded-2xl border p-4 sm:p-5 transition-all shadow-xs',
                day.enabled
                  ? 'border-border-subtle bg-surface-elevated text-surface-elevated-foreground hover:border-primary/40'
                  : 'border-border-subtle bg-surface-sunken opacity-85 text-subtle-foreground'
              )}
            >
              <div className="flex flex-col justify-between gap-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={day.enabled}
                      onCheckedChange={(checked) => toggleDay(key, checked)}
                      className="cursor-pointer transition-all data-[state=checked]:bg-accent data-[state=checked]:shadow-md data-[state=checked]:shadow-accent/30 data-[state=unchecked]:bg-muted-foreground/30 [&>span]:data-[state=checked]:bg-accent-foreground"
                    />
                    <div>
                      <h2 className="font-heading text-base font-bold tracking-tight text-foreground">
                        {label}
                      </h2>
                      <p className="text-xs font-medium text-subtle-foreground">
                        {day.enabled
                          ? `${day.slots.length} window${day.slots.length === 1 ? '' : 's'} configured`
                          : 'Unavailable'}
                      </p>
                    </div>
                  </div>

                  {day.enabled && (
                    <Button
                      type="button"
                      onClick={() => openAddSlot(key)}
                      className="h-8 shrink-0 cursor-pointer rounded-xl bg-secondary text-secondary-foreground border border-border-subtle text-[11px] font-bold tracking-wider shadow-xs transition-all hover:bg-accent hover:text-accent-foreground hover:shadow-md hover:shadow-accent/20 active:scale-95"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add Window
                    </Button>
                  )}
                </div>

                {day.enabled ? (
                  <>
                    <div className="flex min-h-9 flex-wrap gap-2 pt-1">
                      {day.slots.length > 0 ? (
                        day.slots.map((slot, index) => (
                          <button
                            type="button"
                            key={`${key}-slot-${index}`}
                            onClick={() => openEditSlot(key, index)}
                            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-border-subtle bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground shadow-xs hover:bg-accent hover:text-accent-foreground hover:shadow-md hover:shadow-accent/20 active:scale-95 transition-all"
                          >
                            {formatSlot(slot)}
                            <Edit3 className="h-3 w-3" />
                          </button>
                        ))
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-border-subtle bg-surface px-3 py-1 text-xs font-medium text-subtle-foreground">
                          No windows added yet
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 border-t border-border-subtle pt-3">
                      <span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-subtle-foreground">
                        Quick Add:
                      </span>
                      {PRESETS.map((preset) => (
                        <Button
                          key={preset.key}
                          type="button"
                          variant="ghost"
                          onClick={() => openAddSlot(key, preset)}
                          className="h-7 cursor-pointer rounded-lg bg-surface px-2 text-[10px] font-semibold text-subtle-foreground hover:bg-hover hover:text-hover-foreground active:scale-95 transition-all"
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="py-2 text-xs font-medium text-subtle-foreground/80">
                    Enable this day to configure availability windows.
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* Add / Edit Availability Window Modal */}
      <AddAvailabilityModal
        isOpen={!!slotModal}
        onClose={() => setSlotModal(null)}
        slotModal={slotModal}
        service={service}
        onUpdateField={updateSlotModalField}
        onUpdateStartTime={updateSlotModalStartTime}
        onSave={commitSlotModal}
        onRemove={removeSlot}
      />
    </div>
  );
}