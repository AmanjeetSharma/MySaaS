import { useMemo } from 'react';
import { AlertCircle, AlertTriangle, Calendar, Info, Plus, Trash2 } from 'lucide-react';
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

    const filteredEndOptions = useMemo(() => {
        if (!slotModal?.startTime) return TIME_OPTIONS;
        const startMins = timeToMinutes(slotModal.startTime);
        return TIME_OPTIONS.filter((opt) => opt.minutes > startMins);
    }, [slotModal?.startTime]);

    const isTimeOrderValid = useMemo(() => {
        if (!slotModal) return false;
        return timeToMinutes(slotModal.startTime) < timeToMinutes(slotModal.endTime);
    }, [slotModal]);

    const fit = useMemo(() => {
        if (!slotModal?.startTime || !slotModal?.endTime || !service?.durationInMinutes) {
            return null;
        }
        return getAvailabilityFit({
            startTime: slotModal.startTime,
            endTime: slotModal.endTime,
            durationInMinutes: service.durationInMinutes,
        });
    }, [slotModal?.startTime, slotModal?.endTime, service?.durationInMinutes]);

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
            <DialogContent className="sm:max-w-md rounded-2xl border border-border/80 bg-card/95 backdrop-blur-md p-6 shadow-2xl transition-all duration-200 z-50 [&>button]:cursor-pointer [&>button]:transition-all [&>button]:hover:opacity-100">
                <DialogHeader className="space-y-1">
                    <DialogTitle className="text-lg font-black uppercase tracking-tight text-foreground">
                        {slotModal?.mode === 'edit' ? 'Configure Window' : 'Add Window'}
                    </DialogTitle>
                    <DialogDescription className="text-xs font-semibold text-muted-foreground">
                        {slotModalDay?.label || 'Day'} · {slotModal?.title || 'Custom Window'}
                    </DialogDescription>
                </DialogHeader>

                <div className="my-2 space-y-4 rounded-xl border border-border/60 bg-background/60 p-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        {/* Start Time Select */}
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                Start Time
                            </Label>
                            <Select
                                value={slotModal?.startTime || '09:00'}
                                onValueChange={onUpdateStartTime}
                            >
                                <SelectTrigger className="h-11 w-full rounded-xl bg-card font-bold text-xs shadow-sm transition-all hover:border-primary/50 focus:ring-2 focus:ring-primary/20 cursor-pointer">
                                    <SelectValue placeholder="Start time" />
                                </SelectTrigger>
                                <SelectContent className="max-h-52 w-[var(--radix-select-trigger-width)] z-[60]" position="popper">
                                    {TIME_OPTIONS.map((opt) => (
                                        <SelectItem key={`start-${opt.value}`} value={opt.value} className="text-xs font-bold cursor-pointer">
                                            {formatTime(opt.value)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* End Time Select */}
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                End Time
                            </Label>
                            <Select
                                value={slotModal?.endTime || '17:00'}
                                onValueChange={(val) => onUpdateField('endTime', val)}
                            >
                                <SelectTrigger className="h-11 w-full rounded-xl bg-card font-bold text-xs shadow-sm transition-all hover:border-primary/50 focus:ring-2 focus:ring-primary/20 cursor-pointer">
                                    <SelectValue placeholder="End time" />
                                </SelectTrigger>
                                <SelectContent className="max-h-52 w-[var(--radix-select-trigger-width)] z-[60]" position="popper">
                                    {filteredEndOptions.map((opt) => (
                                        <SelectItem key={`end-${opt.value}`} value={opt.value} className="text-xs font-bold cursor-pointer">
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
                                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-destructive text-xs space-y-1">
                                    <div className="flex items-center gap-1.5 font-bold">
                                        <AlertCircle className="h-4 w-4 shrink-0" />
                                        <span>Availability is too short</span>
                                    </div>
                                    <p className="text-[11px] leading-relaxed opacity-90 font-medium">
                                        This {formatMinutesText(fit.availableMinutes)} availability period is shorter than the service duration of {formatMinutesText(service.durationInMinutes)}. No appointments can be booked during this time. Please extend the availability window.
                                    </p>
                                </div>
                            )}

                            {/* CASE 1 NON-BLOCKING WARNING: At least 1 fits, but remainder exists */}
                            {fit.canFitAtLeastOne && !fit.fitsExactly && (
                                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-600 dark:text-amber-400 text-xs space-y-1">
                                    <div className="flex items-center gap-1.5 font-bold">
                                        <AlertTriangle className="h-4 w-4 shrink-0" />
                                        <span>Availability doesn't fit evenly</span>
                                    </div>
                                    <p className="text-[11px] leading-relaxed text-amber-700/90 dark:text-amber-300/90 font-medium">
                                        This {formatMinutesText(fit.availableMinutes)} availability window supports {fit.completeAppointments} × {service.durationInMinutes}-minute appointments, with {fit.remainingMinutes} minutes remaining at the end. You can adjust the window, or keep the remaining time for breaks, buffers, or transitions.
                                    </p>
                                </div>
                            )}
                        </>
                    )}

                    {/* How slots are generated explanation */}
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-1 text-primary">
                        <div className="flex items-center gap-1.5 text-xs font-bold">
                            <Info className="h-3.5 w-3.5 shrink-0" />
                            <span>Booking Slot Generation</span>
                        </div>
                        <p className="text-[11px] font-medium leading-relaxed opacity-90">
                            Bookable appointment slots will be calculated automatically within this availability window based on your service duration ({service?.durationInMinutes || 60} mins).
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
                                className="h-10 cursor-pointer rounded-xl text-xs font-bold text-destructive hover:bg-destructive/10 hover:text-destructive active:scale-95 transition-all"
                            >
                                <Trash2 className="h-4 w-4 mr-1.5" />
                                Remove
                            </Button>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="h-10 flex-1 cursor-pointer rounded-xl text-xs font-bold active:scale-95 transition-all sm:flex-none"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={onSave}
                            disabled={isSaveDisabled}
                            className="h-10 flex-1 cursor-pointer rounded-xl text-xs font-black uppercase tracking-wider active:scale-95 transition-all shadow-sm sm:flex-none"
                        >
                            {slotModal?.mode === 'edit' ? (
                                'Update'
                            ) : (
                                <>
                                    <Plus className="h-4 w-4 mr-1.5 stroke-[2.5]" />
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