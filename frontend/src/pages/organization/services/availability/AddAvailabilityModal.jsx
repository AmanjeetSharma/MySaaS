import { useMemo } from 'react';
import { AlertCircle, AlertTriangle, Info, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DAYS,
    TIME_OPTIONS,
    formatTime,
    getAvailabilityFit,
    timeToMinutes,
} from './availability.helper';

export default function AddAvailabilityModal({
    isOpen,
    onClose,
    slotModal,
    service,
    onUpdateField,
    onUpdateStartTime,
    onSave,
    onRemove,
}) {
    const slotModalDay = useMemo(
        () => DAYS.find((day) => day.key === slotModal?.dayKey),
        [slotModal?.dayKey]
    );

    const startTime = slotModal?.startTime;
    const endTime = slotModal?.endTime;
    const durationInMinutes = service?.durationInMinutes;

    const filteredEndOptions = useMemo(() => {
        if (!startTime) return TIME_OPTIONS;
        const startMins = timeToMinutes(startTime);
        return TIME_OPTIONS.filter((opt) => opt.minutes > startMins);
    }, [startTime]);

    const isTimeOrderValid = useMemo(() => {
        if (!startTime || !endTime) return false;
        return timeToMinutes(startTime) < timeToMinutes(endTime);
    }, [startTime, endTime]);

    const fit = useMemo(() => {
        if (!startTime || !endTime || !durationInMinutes) {
            return null;
        }
        return getAvailabilityFit({
            startTime,
            endTime,
            durationInMinutes,
        });
    }, [startTime, endTime, durationInMinutes]);

    // Hard block if end <= start or range cannot fit even 1 appointment
    const isSaveDisabled = useMemo(() => {
        if (!isTimeOrderValid) return true;
        if (fit && !fit.canFitAtLeastOne) return true;
        return false;
    }, [isTimeOrderValid, fit]);

    const formatMinutesText = (mins) => {
        if (mins >= 60) {
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            return m > 0 ? `${h}h ${m}m` : `${h}h`;
        }
        return `${mins}m`;
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md rounded-xl border border-border-strong bg-surface-elevated text-surface-elevated-foreground p-5 shadow-2xl transition-all duration-200 z-50 [&>button]:cursor-pointer [&>button]:transition-all [&>button]:hover:opacity-100">
                <DialogHeader className="space-y-1">
                    <DialogTitle className="font-heading text-base font-bold tracking-tight text-foreground">
                        {slotModal?.mode === 'edit' ? 'Configure Window' : 'Add Window'}
                    </DialogTitle>
                    <DialogDescription className="text-xs font-medium text-subtle-foreground">
                        {slotModalDay?.label || 'Day'} · {slotModal?.title || 'Custom Window'}
                    </DialogDescription>
                </DialogHeader>

                <div className="my-2 space-y-3.5 rounded-xl border border-border-subtle bg-surface-sunken p-3.5">
                    <div className="grid gap-3 sm:grid-cols-2">
                        {/* Start Time Select */}
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-semibold uppercase tracking-wider text-subtle-foreground">
                                Start Time
                            </Label>
                            <Select
                                value={slotModal?.startTime || '09:00'}
                                onValueChange={onUpdateStartTime}
                            >
                                <SelectTrigger className="h-9 w-full rounded-lg border-border bg-surface font-semibold text-xs text-foreground shadow-2xs transition-all hover:border-border-strong focus:ring-1 focus:ring-ring cursor-pointer">
                                    <SelectValue placeholder="Start time" />
                                </SelectTrigger>
                                <SelectContent className="max-h-52 w-[var(--radix-select-trigger-width)] z-[60] bg-popover text-popover-foreground border-border rounded-lg" position="popper">
                                    {TIME_OPTIONS.map((opt) => (
                                        <SelectItem key={`start-${opt.value}`} value={opt.value} className="text-xs font-medium cursor-pointer hover:bg-hover hover:text-hover-foreground">
                                            {formatTime(opt.value)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* End Time Select */}
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-semibold uppercase tracking-wider text-subtle-foreground">
                                End Time
                            </Label>
                            <Select
                                value={slotModal?.endTime || '17:00'}
                                onValueChange={(val) => onUpdateField('endTime', val)}
                            >
                                <SelectTrigger className="h-9 w-full rounded-lg border-border bg-surface font-semibold text-xs text-foreground shadow-2xs transition-all hover:border-border-strong focus:ring-1 focus:ring-ring cursor-pointer">
                                    <SelectValue placeholder="End time" />
                                </SelectTrigger>
                                <SelectContent className="max-h-52 w-[var(--radix-select-trigger-width)] z-[60] bg-popover text-popover-foreground border-border rounded-lg" position="popper">
                                    {filteredEndOptions.map((opt) => (
                                        <SelectItem key={`end-${opt.value}`} value={opt.value} className="text-xs font-medium cursor-pointer hover:bg-hover hover:text-hover-foreground">
                                            {formatTime(opt.value)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Fit & Validation Status Banners */}
                    {fit && isTimeOrderValid && (
                        <>
                            {/* CASE 2 BLOCKING ERROR: Zero appointments fit */}
                            {!fit.canFitAtLeastOne && (
                                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-destructive text-xs space-y-1">
                                    <div className="flex items-center gap-1.5 font-semibold">
                                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                        <span>Availability is too short</span>
                                    </div>
                                    <p className="text-[11px] leading-relaxed opacity-90 font-medium">
                                        This {formatMinutesText(fit.availableMinutes)} availability period is shorter than the service duration of {formatMinutesText(service.durationInMinutes)}. No appointments can be booked during this time. Please extend the availability window.
                                    </p>
                                </div>
                            )}

                            {/* CASE 1 NON-BLOCKING WARNING: At least 1 fits, but remainder exists */}
                            {fit.canFitAtLeastOne && !fit.fitsExactly && (
                                <div className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-warning text-xs space-y-1">
                                    <div className="flex items-center gap-1.5 font-semibold">
                                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                        <span>Availability doesn't fit evenly</span>
                                    </div>
                                    <p className="text-[11px] leading-relaxed opacity-90 font-medium">
                                        This {formatMinutesText(fit.availableMinutes)} availability window supports {fit.completeAppointments} × {service.durationInMinutes}-minute appointments, with {fit.remainingMinutes} minutes remaining at the end. You can adjust the window, or keep the remaining time for breaks, buffers, or transitions.
                                    </p>
                                </div>
                            )}
                        </>
                    )}

                    {/* How slots are generated explanation */}
                    <div className="rounded-lg border border-secondary bg-secondary/50 p-2.5 space-y-1 text-secondary-foreground">
                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                            <Info className="h-3.5 w-3.5 shrink-0 text-accent" />
                            <span>Booking Slot Calculation</span>
                        </div>
                        <p className="text-[11px] font-medium leading-relaxed text-subtle-foreground">
                            Bookable appointment slots will be calculated automatically within this window based on service duration ({service?.durationInMinutes || 60} mins).
                        </p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between sm:items-center pt-2">
                    <div>
                        {slotModal?.mode === 'edit' && (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onRemove}
                                className="h-8 cursor-pointer rounded-lg text-xs font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive active:scale-95 transition-all px-2.5"
                            >
                                <Trash2 className="h-3.5 w-3.5 mr-1" />
                                Remove
                            </Button>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="h-8 flex-1 cursor-pointer rounded-lg border-border bg-surface text-subtle-foreground text-xs font-semibold hover:bg-surface-sunken hover:text-foreground active:scale-95 transition-all sm:flex-none px-3"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={onSave}
                            disabled={isSaveDisabled}
                            className="h-8 flex-1 cursor-pointer rounded-lg bg-primary px-3.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground hover:bg-foreground active:translate-y-px transition-all disabled:opacity-50 sm:flex-none shadow-2xs"
                        >
                            {slotModal?.mode === 'edit' ? (
                                'Update'
                            ) : (
                                <>
                                    <Plus className="h-3.5 w-3.5 mr-1 stroke-[2.5]" />
                                    Add
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}