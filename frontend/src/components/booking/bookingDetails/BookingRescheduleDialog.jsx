import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, ChevronDown, CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

// Generate 15-minute increments for the full 24-hour day (00:00 to 23:45)
const GENERATE_TIME_OPTIONS = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
            const hStr = String(hour).padStart(2, "0");
            const mStr = String(minute).padStart(2, "0");
            const value = `${hStr}:${mStr}`;

            const h12 = hour % 12 === 0 ? 12 : hour % 12;
            const ampm = hour >= 12 ? "PM" : "AM";
            const label = `${h12}:${mStr} ${ampm}`;

            options.push({ value, label });
        }
    }
    return options;
};

const TIME_OPTIONS = GENERATE_TIME_OPTIONS();

const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(dateString));
};

const formatTimeDisplay = (dateString) => {
    if (!dateString) return "";
    return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    }).format(new Date(dateString));
};

const BookingRescheduleDialog = ({
    open,
    onOpenChange,
    initialStartTime,
    initialEndTime,
    durationInMinutes = 45,
    onReschedule,
    isRescheduling,
}) => {
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [date, setDate] = useState(null);
    const [startTimeValue, setStartTimeValue] = useState("09:00");

    useEffect(() => {
        if (initialStartTime) {
            const d = new Date(initialStartTime);
            setDate(d);

            const h = d.getHours();
            const m = d.getMinutes();
            // Round to nearest 15-minute slot
            const roundedMinute = [0, 15, 30, 45].reduce((prev, curr) =>
                Math.abs(curr - m) < Math.abs(prev - m) ? curr : prev
            );

            const hStr = String(h).padStart(2, "0");
            const mStr = String(roundedMinute).padStart(2, "0");
            setStartTimeValue(`${hStr}:${mStr}`);
        } else {
            setDate(new Date());
            setStartTimeValue("09:00");
        }
    }, [initialStartTime, open]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!date || !startTimeValue) return;

        const [hours, minutes] = startTimeValue.split(":").map(Number);
        const targetDate = new Date(date);
        targetDate.setHours(hours, minutes, 0, 0);

        onReschedule(targetDate.toISOString());
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md rounded-2xl bg-surface-elevated border-border text-foreground p-6 shadow-2xl overflow-hidden [&>button]:cursor-pointer">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Header */}
                    <DialogHeader className="space-y-1 text-left">
                        <DialogTitle className="font-heading text-base font-bold tracking-tight text-foreground">
                            Reschedule Appointment
                        </DialogTitle>
                        <DialogDescription className="text-xs text-subtle-foreground">
                            Pick a new date and choose the new start time.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 pt-1">
                        {/* Current Appointment Banner */}
                        {initialStartTime && (
                            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface border border-border-subtle text-xs text-subtle-foreground">
                                <CalendarDays className="size-4 text-subtle-foreground/70 shrink-0" />
                                <div className="min-w-0">
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-subtle-foreground/70 block">
                                        Current appointment
                                    </span>
                                    <span className="font-medium text-foreground truncate block">
                                        {formatDate(initialStartTime)} · {formatTimeDisplay(initialStartTime)}
                                        {initialEndTime ? ` – ${formatTimeDisplay(initialEndTime)}` : ""}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Date Selection */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                                <CalendarIcon className="size-3.5 text-accent" />
                                <span>Date</span>
                            </label>
                            <Popover open={popoverOpen} onOpenChange={setPopoverOpen} modal={true}>
                                <PopoverTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full justify-between text-xs h-9 px-3 rounded-xl border-border bg-surface text-foreground font-normal hover:bg-hover hover:text-foreground cursor-pointer shadow-xs"
                                    >
                                        <span className="truncate">
                                            {date ? format(date, "MMMM d, yyyy") : "Select date"}
                                        </span>
                                        <ChevronDown className="size-3.5 text-subtle-foreground/70 shrink-0" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-0 rounded-2xl bg-popover text-popover-foreground border-border shadow-xl z-[60]"
                                    align="start"
                                    side="bottom"
                                    sideOffset={4}
                                >
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        defaultMonth={date || new Date()}
                                        onSelect={(selected) => {
                                            if (selected) {
                                                setDate(selected);
                                                setPopoverOpen(false);
                                            }
                                        }}
                                        disabled={(d) =>
                                            d < new Date(new Date().setHours(0, 0, 0, 0))
                                        }
                                        initialFocus
                                        className="rounded-xl border-none"
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Start Time Select */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                                <Clock className="size-3.5 text-accent" />
                                <span>New Start Time</span>
                            </label>

                            <Select value={startTimeValue} onValueChange={setStartTimeValue}>
                                <SelectTrigger className="h-9 w-full rounded-xl border-border bg-surface font-medium text-xs text-foreground shadow-xs transition-all hover:border-border-strong focus:ring-1 focus:ring-accent cursor-pointer">
                                    <SelectValue placeholder="Select start time" />
                                </SelectTrigger>
                                <SelectContent
                                    className="max-h-52 w-[var(--radix-select-trigger-width)] z-[60] bg-popover text-popover-foreground border-border shadow-xl"
                                    position="popper"
                                >
                                    {TIME_OPTIONS.map((opt) => (
                                        <SelectItem
                                            key={`time-${opt.value}`}
                                            value={opt.value}
                                            className="text-xs font-medium cursor-pointer hover:bg-hover hover:text-hover-foreground"
                                        >
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Duration Notice */}
                            <p className="text-[11px] text-subtle-foreground/80 pt-0.5">
                                Duration: {durationInMinutes} minutes
                            </p>
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <DialogFooter className="pt-2 flex-row justify-end items-center gap-2 sm:space-x-0">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenChange(false)}
                            className="h-8.5 px-3.5 rounded-xl border-border bg-surface text-subtle-foreground hover:bg-hover hover:text-foreground text-xs font-semibold cursor-pointer active:scale-95 transition-all"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={isRescheduling || !date}
                            className="h-8.5 px-4 rounded-xl bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wider cursor-pointer active:scale-95 transition-all shadow-xs hover:opacity-95"
                        >
                            {isRescheduling ? "Rescheduling..." : "Reschedule"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default BookingRescheduleDialog;