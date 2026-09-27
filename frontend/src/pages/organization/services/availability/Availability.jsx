import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronsUpDown,
  Clock,
  Copy,
  Edit3,
  Globe,
  GripVertical,
  Loader2,
  Plus,
  RotateCcw,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { DragDropProvider, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/react';
import { PointerActivationConstraints, PointerSensor } from '@dnd-kit/dom';

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

/**
 * Custom smooth drop animation:
 * Softly dissolves and absorbs into place on drop, avoiding any disruptive
 * flyback morphing or layout shifts.
 */
const customDropAnimation = ({ feedbackElement }) => {
  if (!feedbackElement?.animate) return Promise.resolve();

  return feedbackElement.animate(
    [
      { opacity: 1, transform: 'scale(1)', filter: 'brightness(1)' },
      { opacity: 0.9, transform: 'scale(1.02)', filter: 'brightness(1.15)', offset: 0.2 },
      { opacity: 0, transform: 'scale(0.92)', filter: 'brightness(1)' },
    ],
    {
      duration: 180,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      fill: 'forwards',
    }
  ).finished;
};

/**
 * Individual Draggable and Droppable Day Schedule Row
 */
function DayRow({
  dayKey,
  label,
  day,
  isJustCopied,
  onToggle,
  onOpenAddSlot,
  onOpenEditSlot,
}) {
  const { ref: dragRef, handleRef, isDragging } = useDraggable({
    id: dayKey,
    data: { dayKey, label },
  });

  const { ref: dropRef, isDropTarget } = useDroppable({
    id: dayKey,
    data: { dayKey, label },
  });

  const setRowRef = useCallback(
    (element) => {
      dragRef(element);
      dropRef(element);
    },
    [dragRef, dropRef]
  );

  const isOverTarget = isDropTarget && !isDragging;

  return (
    <div
      ref={setRowRef}
      className={cn(
        'group relative flex flex-col md:flex-row md:items-center justify-between gap-3.5 p-3.5 sm:px-4 sm:py-3.5 transition-all duration-300',
        isDragging && 'opacity-25 bg-surface-sunken/90 border-dashed border-accent/40 scale-[0.99]',
        isJustCopied && 'copied-absorb-card',
        !isDragging && !isJustCopied && (
          day.enabled
            ? 'bg-surface-elevated hover:bg-surface-elevated/80'
            : 'bg-surface-sunken/40 hover:bg-surface-sunken/60'
        )
      )}
    >
      {/* Non-destructive Drop Target Veil: smoothly indicates drop eligibility without layout shifts */}
      {isOverTarget && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl border border-accent/70 bg-surface-elevated/92 backdrop-blur-[2px] shadow-lg shadow-accent/10 transition-all duration-150 animate-in fade-in zoom-in-98 pointer-events-none">
          <div className="flex items-center gap-2 text-xs font-bold text-accent">
            <Copy className="h-4 w-4" />
            <span>Drop to copy windows to {label}</span>
          </div>
        </div>
      )}

      {/* Col 1: Drag Grip + Switch + Day Label + Subtitle */}
      <div className="flex items-center gap-2.5 w-full md:w-56 shrink-0">
        <button
          type="button"
          ref={handleRef}
          aria-label={`Drag ${label} to copy windows`}
          title="Drag or touch & hold to copy to another day"
          className="h-8 w-8 -ml-1 flex items-center justify-center rounded-lg text-subtle-foreground/50 hover:text-foreground hover:bg-hover active:bg-accent/20 active:text-accent cursor-grab active:cursor-grabbing touch-none select-none transition-colors shrink-0"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <Switch
          id={`switch-${dayKey}`}
          checked={day.enabled}
          onCheckedChange={onToggle}
          className="cursor-pointer transition-all data-[state=checked]:bg-accent data-[state=unchecked]:bg-muted-foreground/30 [&>span]:data-[state=checked]:bg-accent-foreground shrink-0"
          aria-label={`Toggle availability for ${label}`}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <label
              htmlFor={`switch-${dayKey}`}
              className={cn(
                'block font-heading text-sm font-semibold tracking-tight cursor-pointer truncate',
                day.enabled ? 'text-foreground' : 'text-subtle-foreground'
              )}
            >
              {label}
            </label>
            {isJustCopied && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/15 px-2 py-0.5 rounded-full border border-accent/30 animate-in fade-in zoom-in-75 duration-200">
                <Check className="h-2.5 w-2.5" />
                Copied
              </span>
            )}
          </div>
          <span className="block text-[11px] font-medium text-subtle-foreground">
            {day.enabled
              ? `${day.slots.length} ${day.slots.length === 1 ? 'window' : 'windows'}`
              : 'Unavailable'}
          </span>
        </div>
      </div>

      {/* Col 2: Configured Time Slots or Inactive State */}
      <div className="flex-1 min-w-0 w-full md:w-auto">
        {day.enabled ? (
          <div className="flex flex-wrap items-center gap-2 sm:gap-1.5">
            {day.slots.length > 0 ? (
              day.slots.map((slot, index) => (
                <button
                  type="button"
                  key={`${dayKey}-slot-${index}`}
                  onClick={() => onOpenEditSlot(dayKey, index)}
                  className={cn(
                    'group/slot inline-flex items-center justify-between sm:justify-start gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 sm:px-2.5 sm:py-1 text-xs font-semibold text-foreground hover:border-border-strong hover:bg-surface-sunken active:scale-95 transition-all cursor-pointer shadow-2xs w-full sm:w-auto',
                    isJustCopied && 'animate-in fade-in slide-in-from-left-2 duration-300'
                  )}
                  style={isJustCopied ? { animationDelay: `${index * 50}ms` } : undefined}
                  title="Click to edit or remove window"
                >
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-subtle-foreground group-hover/slot:text-accent transition-colors shrink-0" />
                    <span>{formatSlot(slot)}</span>
                  </div>
                  <Edit3 className="h-3 w-3 text-subtle-foreground opacity-60 group-hover/slot:opacity-100 transition-opacity ml-1 shrink-0" />
                </button>
              ))
            ) : (
              <span className="text-xs text-subtle-foreground/80 italic font-medium py-1">
                No windows set. Add one to enable booking.
              </span>
            )}
          </div>
        ) : (
          <span className="text-xs text-subtle-foreground/50 font-normal py-1">
            Unavailable on this day
          </span>
        )}
      </div>

      {/* Col 3: Actions (Quick Presets + Add Window) - Single-row on mobile with horizontally scrollable presets */}
      {day.enabled && (
        <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-2 pt-2 border-t border-border-subtle/50 md:border-t-0 md:pt-0 shrink-0">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 flex-1 min-w-0 md:flex-initial md:border-r md:border-border-subtle md:pr-1.5 md:mr-0.5">
            <span className="text-[10px] font-semibold text-subtle-foreground/70 uppercase tracking-wider shrink-0 mr-1 sm:hidden">
              Add:
            </span>
            {PRESETS.map((preset) => (
              <Button
                key={preset.key}
                type="button"
                variant="ghost"
                onClick={() => onOpenAddSlot(dayKey, preset)}
                className="h-7 shrink-0 cursor-pointer rounded-md px-1.5 text-[10px] font-semibold text-subtle-foreground hover:bg-hover hover:text-foreground active:scale-95 transition-all"
                title={`Quick add ${preset.label} window`}
              >
                {preset.label}
              </Button>
            ))}
          </div>

          <Button
            type="button"
            onClick={() => onOpenAddSlot(dayKey)}
            className="h-7 shrink-0 cursor-pointer rounded-lg bg-secondary text-secondary-foreground border border-border-subtle px-2.5 text-[11px] font-semibold hover:bg-hover active:scale-95 transition-all shadow-2xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Window
          </Button>
        </div>
      )}
    </div>
  );
}

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
  const [justCopiedDay, setJustCopiedDay] = useState(null);

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

  // Optimized Sensor Configuration for snappy Desktop mouse drag & seamless Mobile touch-and-hold
  const customSensors = useMemo(() => {
    return (defaults) => [
      ...defaults.filter((sensor) => sensor !== PointerSensor),
      PointerSensor.configure({
        activationConstraints(event) {
          if (event.pointerType === 'touch') {
            return [
              new PointerActivationConstraints.Delay({
                value: 150,
                tolerance: 10,
              }),
            ];
          }
          return undefined;
        },
      }),
    ];
  }, []);

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

  /**
   * Handle drag-to-copy between days using @dnd-kit/react
   */
  const handleDragEnd = (event) => {
    if (event.canceled) return;
    const { source, target } = event.operation || {};
    if (!source || !target || source.id === target.id) return;

    const sourceKey = String(source.id);
    const targetKey = String(target.id);

    const sourceDay = form.days[sourceKey];
    if (!sourceDay) return;

    const sourceDayLabel = DAYS.find((d) => d.key === sourceKey)?.label || sourceKey;
    const targetDayLabel = DAYS.find((d) => d.key === targetKey)?.label || targetKey;

    if (!sourceDay.enabled || sourceDay.slots.length === 0) {
      toast.error(`${sourceDayLabel} has no active windows to copy`);
      return;
    }

    setForm((current) => ({
      ...current,
      days: {
        ...current.days,
        [targetKey]: {
          enabled: true,
          slots: [...sourceDay.slots],
        },
      },
    }));

    setJustCopiedDay(targetKey);
    setTimeout(() => {
      setJustCopiedDay(null);
    }, 1200);

    toast.success(`Copied ${sourceDayLabel}'s windows to ${targetDayLabel}`);
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
      toast.success('Availability reset to default');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to reset availability');
    }
  };

  if (isLoading || serviceLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center text-xs font-semibold uppercase tracking-widest text-subtle-foreground/70">
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-accent" />
        Synchronizing Schedule...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-3.5 py-5 sm:px-6 sm:py-8 lg:py-10 pb-44 sm:pb-32">
      {/* Drop feedback styles */}
      <style>{`
        @keyframes copied-absorb {
          0% {
            transform: scale(0.992);
            box-shadow: 0 0 0 1.5px var(--color-accent, #00ffff), 0 0 20px rgba(0, 255, 255, 0.35);
            background-color: color-mix(in srgb, var(--color-accent, #00ffff) 14%, var(--surface-elevated, #0c0c0d));
          }
          35% {
            transform: scale(1.008);
            box-shadow: 0 0 0 1.5px var(--color-accent, #00ffff), 0 0 14px rgba(0, 255, 255, 0.22);
            background-color: color-mix(in srgb, var(--color-accent, #00ffff) 9%, var(--surface-elevated, #0c0c0d));
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 1px var(--color-accent, #00ffff), 0 0 6px rgba(0, 255, 255, 0.1);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 transparent;
          }
        }
        .copied-absorb-card {
          animation: copied-absorb 1.1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* View Header: Navigation + Title + Primary Action Bar */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border-subtle pb-6">
        <div className="min-w-0 space-y-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(`/organizations/${service?.organization}/services/${serviceId}`)}
            className="h-8 -ml-2 cursor-pointer rounded-lg px-2 text-xs font-medium text-subtle-foreground hover:bg-hover hover:text-foreground active:scale-95 transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Back to Service
          </Button>

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {service?.name || 'Service Availability'}
            </h1>
            <span className="text-xs font-medium text-subtle-foreground">
              {formatServiceMeta(service)}
            </span>
          </div>
        </div>

        {/* Global Action Controls */}
        {hasExistingAvailability && (
          <div className="flex shrink-0 items-center">
            <Button
              type="button"
              variant="ghost"
              onClick={handleDelete}
              disabled={isDeleting || isSaving}
              className="h-8 cursor-pointer rounded-lg border border-transparent px-3 text-xs font-semibold text-subtle-foreground hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive active:scale-95 transition-all"
            >
              {isDeleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : (
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              )}
              Reset
            </Button>
          </div>
        )}
      </header>

      {/* Schedule Utility Deck: Timezone + Telemetry + Drag Copy Guidance */}
      <section aria-label="Schedule settings and telemetry" className="rounded-xl border border-border-subtle bg-surface-elevated p-3.5 sm:p-4 shadow-xs">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Timezone Selector Combobox */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-subtle-foreground shrink-0">
              <Globe className="h-3.5 w-3.5 text-accent" />
              <span>Timezone:</span>
            </div>

            <Popover open={timezoneSearchOpen} onOpenChange={setTimezoneSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={timezoneSearchOpen}
                  className="h-8 w-full sm:w-64 justify-between rounded-lg border-border bg-surface px-2.5 text-xs font-semibold text-foreground hover:border-border-strong hover:bg-hover transition-all cursor-pointer"
                >
                  <span className="truncate">{form.timezone}</span>
                  <ChevronsUpDown className="ml-1.5 h-3.5 w-3.5 shrink-0 text-subtle-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 z-50 border-border-strong bg-popover text-popover-foreground shadow-xl rounded-xl" align="start">
                <Command className="bg-popover text-popover-foreground">
                  <CommandInput placeholder="Search timezone..." className="h-8 text-xs" />
                  <CommandList className="max-h-56">
                    <CommandEmpty className="py-2.5 text-center text-xs font-medium text-subtle-foreground">
                      No timezone found.
                    </CommandEmpty>
                    <CommandGroup>
                      {TIMEZONES.map((tz) => (
                        <CommandItem
                          key={tz}
                          value={tz}
                          onSelect={() => updateTimezone(tz)}
                          className="text-xs font-medium cursor-pointer hover:bg-hover hover:text-hover-foreground"
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

          {/* Telemetry Badges & Drag Instruction */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge
              variant="secondary"
              className="h-6 rounded-full border border-border-subtle bg-secondary px-2.5 text-[10px] font-semibold tracking-wider uppercase text-secondary-foreground"
            >
              {activeDays}/7 Active Days
            </Badge>

            <Badge
              variant="outline"
              className="h-6 rounded-full border-border-subtle bg-surface px-2.5 text-[10px] font-semibold tracking-wider uppercase text-foreground"
            >
              {totalSlots} {totalSlots === 1 ? 'Window' : 'Windows'}
            </Badge>

            <div className="h-4 w-px bg-border-subtle hidden sm:block mx-0.5" />

            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-subtle-foreground/80">
              <GripVertical className="h-3.5 w-3.5 text-accent shrink-0" />
              <span>Drag grip (or hold on mobile) to copy to another day</span>
            </span>
          </div>
        </div>
      </section>

      {/* 7-Day Weekly Schedule Ledger with Drag-and-Drop Copying */}
      <DragDropProvider sensors={customSensors} onDragEnd={handleDragEnd}>
        <section
          aria-label="Weekly schedule configuration"
          className="rounded-xl border border-border-subtle bg-surface-elevated overflow-hidden shadow-xs divide-y divide-border-subtle"
        >
          {DAYS.map(({ key, label }) => (
            <DayRow
              key={key}
              dayKey={key}
              label={label}
              day={form.days[key]}
              isJustCopied={justCopiedDay === key}
              onToggle={(checked) => toggleDay(key, checked)}
              onOpenAddSlot={openAddSlot}
              onOpenEditSlot={openEditSlot}
            />
          ))}
        </section>

        {/* Tactile Drag Overlay with smooth custom dissolve animation (no explosive stretch) */}
        <DragOverlay dropAnimation={customDropAnimation}>
          {(source) => {
            if (!source) return null;
            const sourceKey = String(source.id);
            const day = form.days[sourceKey];
            const dayLabel = DAYS.find((d) => d.key === sourceKey)?.label || sourceKey;
            return (
              <div className="flex items-center gap-2.5 rounded-xl border border-accent/80 bg-surface-elevated/95 backdrop-blur-md px-3.5 py-2 shadow-2xl shadow-accent/25 ring-1 ring-accent pointer-events-none select-none">
                <GripVertical className="h-3.5 w-3.5 text-accent" />
                <span className="font-heading text-xs font-bold text-foreground">{dayLabel}</span>
                <span className="text-[11px] text-subtle-foreground font-medium">
                  ({day?.slots?.length || 0} windows)
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/15 px-2 py-0.5 rounded-full border border-accent/30">
                  Copying
                </span>
              </div>
            );
          }}
        </DragOverlay>
      </DragDropProvider>

      {/* Floating Bottom Sticky Action Bar positioned above mobile nav */}
      {hasChanges && (
        <aside
          aria-label="Pending changes dock"
          className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center justify-between gap-2 sm:gap-3 w-[calc(100%-1.5rem)] sm:w-auto max-w-sm sm:max-w-md rounded-xl border border-border-strong bg-surface-elevated/95 backdrop-blur-md px-3 py-2 sm:px-4 sm:py-2.5 shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs font-semibold text-foreground truncate">
              Unsaved changes
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Button
              type="button"
              onClick={() => setForm(toForm(availability))}
              disabled={isSaving}
              className="h-7 cursor-pointer rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30 px-2.5 text-xs font-semibold shadow-xs transition-all active:translate-y-px"
            >
              Discard
            </Button>

            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isDeleting}
              className="h-7 shrink-0 cursor-pointer rounded-lg bg-primary text-primary-foreground hover:bg-foreground px-2.5 sm:px-3 text-xs font-semibold uppercase tracking-wider shadow-xs transition-all active:translate-y-px"
            >
              {isSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
              ) : (
                <Check className="h-3.5 w-3.5 mr-1 stroke-[2.5]" />
              )}
              <span>Save<span className="hidden xs:inline sm:inline"> Changes</span></span>
            </Button>
          </div>
        </aside>
      )}

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