import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CalendarClock,
  Check,
  ChevronsUpDown,
  Edit3,
  Loader2,
  RotateCcw,
  Plus,
  Save,
  Trash2,
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
      const slots = day.slots.length
        ? day.slots
        : [{ startTime: '09:00', endTime: '12:00' }];

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
    let defaultEnd = '17:00';

    if (preset) {
      defaultStart = preset.startTime;
      defaultEnd = preset.endTime;
    } else if (existingSlots.length > 0) {
      const sorted = sortSlots(existingSlots);
      const lastSlot = sorted[sorted.length - 1];
      const lastEndMins = timeToMinutes(lastSlot.endTime);

      if (lastEndMins < 1380) {
        defaultStart = minutesToTime(lastEndMins);
        defaultEnd = minutesToTime(Math.min(1440, lastEndMins + 60));
      }
    }

    setSlotModal({
      mode: 'add',
      dayKey,
      slotIndex: null,
      startTime: defaultStart,
      endTime: defaultEnd,
      title: preset?.label ? `${preset.label} slot` : 'Custom slot',
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
      title: 'Edit slot',
    });
  };

  const updateSlotModalStartTime = (value) => {
    setSlotModal((current) => {
      if (!current) return current;
      const newStartMins = timeToMinutes(value);
      const currentEndMins = timeToMinutes(current.endTime);

      let nextEnd = current.endTime;
      if (currentEndMins <= newStartMins) {
        nextEnd = minutesToTime(Math.min(1440, newStartMins + 60));
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

    const existingSlots = form.days[slotModal.dayKey].slots;
    const hasOverlap = checkSlotOverlap(
      existingSlots,
      startMinutes,
      endMinutes,
      slotModal.mode === 'edit' ? slotModal.slotIndex : null
    );

    if (hasOverlap) {
      toast.error('Time slot overlaps with an existing slot');
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
      <div className="flex h-screen items-center justify-center gap-3 font-black uppercase tracking-widest text-muted-foreground/60">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        Syncronizing Workspace...
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
            className="h-9 cursor-pointer rounded-lg px-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground active:scale-95 transition-all"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Service
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

        {/* Global Action Buttons */}
        <div className="flex shrink-0 flex-wrap gap-2">
          {hasChanges && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setForm(toForm(availability))}
              disabled={isSaving}
              className="h-11 cursor-pointer rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all"
            >
              <X className="h-4 w-4 mr-1" />
              Discard Changes
            </Button>
          )}
          {hasExistingAvailability && (
            <Button
              type="button"
              variant="outline"
              onClick={handleDelete}
              disabled={isDeleting || isSaving}
              className="h-11 cursor-pointer rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
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
              className="h-11 cursor-pointer rounded-xl text-xs font-black uppercase tracking-widest shadow-md hover:shadow-primary/20 active:scale-95 transition-all"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
              {hasExistingAvailability ? 'Save Changes' : 'Create Availability'}
            </Button>
          )}
        </div>
      </div>

      {/* Timezone Selector Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-primary/15 bg-card p-3 sm:p-4 md:flex-row md:items-center md:justify-between shadow-sm">
        <div className="space-y-0.5">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Service Timezone
          </Label>
          <p className="text-xs text-muted-foreground font-medium">
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
                className="h-10 w-full justify-between rounded-xl bg-background px-3 font-bold text-xs cursor-pointer hover:border-primary/50 transition-all shadow-sm"
              >
                <span className="truncate">{form.timezone}</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 z-50" align="end">
              <Command>
                <CommandInput placeholder="Search timezone..." className="h-9 text-xs" />
                <CommandList className="max-h-56">
                  <CommandEmpty className="py-2 text-center text-xs font-medium text-muted-foreground">
                    No timezone found.
                  </CommandEmpty>
                  <CommandGroup>
                    {TIMEZONES.map((tz) => (
                      <CommandItem
                        key={tz}
                        value={tz}
                        onSelect={() => updateTimezone(tz)}
                        className="text-xs font-bold cursor-pointer"
                      >
                        <Check
                          className={cn(
                            'mr-2 h-3.5 w-3.5',
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
                'rounded-xl border bg-card p-4 transition-all shadow-sm sm:p-5',
                day.enabled ? 'border-primary/25 hover:border-primary/40' : 'border-border/60 bg-card/40'
              )}
            >
              <div className="flex flex-col justify-between gap-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={day.enabled}
                      onCheckedChange={(checked) => toggleDay(key, checked)}
                      className="cursor-pointer ring-primary/20 data-checked:ring-2 transition-all"
                    />
                    <div>
                      <h2 className="text-base font-black uppercase tracking-tight">
                        {label}
                      </h2>
                      <p className="text-xs font-bold text-muted-foreground">
                        {day.enabled
                          ? `${day.slots.length} slot${day.slots.length === 1 ? '' : 's'} configured`
                          : 'Unavailable'}
                      </p>
                    </div>
                  </div>

                  {day.enabled && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => openAddSlot(key)}
                      className="h-8 shrink-0 cursor-pointer rounded-lg text-[11px] font-black uppercase tracking-widest active:scale-95 transition-all"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add Slot
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
                            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-black text-primary hover:bg-primary/20 active:scale-95 transition-all"
                          >
                            {formatSlot(slot)}
                            <Edit3 className="h-3 w-3" />
                          </button>
                        ))
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-border/80 bg-background/50 px-3 py-1 text-xs font-bold text-muted-foreground">
                          No slots added yet
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-3">
                      <span className="mr-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Quick Add:
                      </span>
                      {PRESETS.map((preset) => (
                        <Button
                          key={preset.key}
                          type="button"
                          variant="ghost"
                          onClick={() => openAddSlot(key, preset)}
                          className="h-7 cursor-pointer rounded-md bg-muted/40 px-2 text-[10px] font-bold text-muted-foreground hover:bg-primary/15 hover:text-primary active:scale-95 transition-all"
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="py-2 text-xs font-medium text-muted-foreground/70">
                    Enable this day to configure booking hours.
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* Add / Edit Time Slot Modal */}
      <AddAvailabilityModal
        isOpen={!!slotModal}
        onClose={() => setSlotModal(null)}
        slotModal={slotModal}
        onUpdateField={updateSlotModalField}
        onUpdateStartTime={updateSlotModalStartTime}
        onSave={commitSlotModal}
        onRemove={removeSlot}
      />
    </div>
  );
}