import { useMemo } from 'react';
import { Plus, Trash2 } from 'lucide-react';
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
    timeToMinutes,
    minutesToTime,
} from './availability.helper';

export default function AddAvailabilityModal({
    isOpen,
    onClose,
    slotModal,
    onUpdateField,
    onUpdateStartTime,
    onSave,
    onRemove,
}) {
    const slotModalDay = useMemo(
        () => DAYS.find((day) => day.key === slotModal?.dayKey),
        [slotModal?.dayKey]
    );

    // Filter available end options so users can only pick times after start time
    const filteredEndOptions = useMemo(() => {
        if (!slotModal?.startTime) return TIME_OPTIONS;
        const startMins = timeToMinutes(slotModal.startTime);
        return TIME_OPTIONS.filter((opt) => opt.minutes > startMins);
    }, [slotModal?.startTime]);

    const isValid = useMemo(() => {
        if (!slotModal) return false;
        return timeToMinutes(slotModal.startTime) < timeToMinutes(slotModal.endTime);
    }, [slotModal]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            {/* Added [&>button]:cursor-pointer to target the Radix UI Dialog close (X) button */}
            <DialogContent className="sm:max-w-md rounded-2xl border border-border/80 bg-card/95 backdrop-blur-md p-6 shadow-2xl transition-all duration-200 z-50 [&>button]:cursor-pointer [&>button]:transition-all [&>button]:hover:opacity-100">
                <DialogHeader className="space-y-1">
                    <DialogTitle className="text-lg font-black uppercase tracking-tight text-foreground">
                        {slotModal?.mode === 'edit' ? 'Edit Time Slot' : 'Add Time Slot'}
                    </DialogTitle>
                    <DialogDescription className="text-xs font-semibold text-muted-foreground">
                        {slotModalDay?.label || 'Day'} · {slotModal?.title || 'Custom slot'}
                    </DialogDescription>
                </DialogHeader>

                <div className="my-2 rounded-xl border border-border/60 bg-background/60 p-4 space-y-4">
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

                    <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">
                        • Click <span className="font-bold text-foreground">Save Changes</span> on the main view to see your updates.
                    </p>
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
                            disabled={!isValid}
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