import { Clock } from "lucide-react";

const BookingSlotsGrid = ({
    slots,
    selectedSlot,
    onSelectSlot,
    selectedDate,
    displayTimezone
}) => {
    return (
        <div className="space-y-3.5 pt-2">
            <div className="flex items-center justify-between">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Available Slots ({selectedDate ? selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""})
                </label>
                {slots.length > 0 && (
                    <span className="text-[11px] font-medium text-muted-foreground">
                        {slots.length} {slots.length === 1 ? "slot" : "slots"} available
                    </span>
                )}
            </div>

            {slots.length > 0 ? (
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-2.5">
                    {slots.map((slot) => {
                        const isSelected = selectedSlot?.isoString === slot.isoString;
                        return (
                            <button
                                key={slot.isoString}
                                type="button"
                                onClick={() => onSelectSlot(slot)}
                                className={`min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border cursor-pointer active:scale-[0.97] ${
                                    isSelected
                                        ? "border-primary bg-primary text-primary-foreground shadow-xs ring-2 ring-primary/20 font-bold"
                                        : "border-border/80 bg-card text-foreground hover:border-primary/60 hover:bg-primary/5"
                                }`}
                            >
                                <Clock className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-primary-foreground/90" : "text-muted-foreground"}`} />
                                <span className="truncate">{slot.formattedTime}</span>
                            </button>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-muted/20 border border-dashed border-border/80 rounded-2xl p-6 sm:p-8 text-center">
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed max-w-sm mx-auto">
                        No available slots on this day in {displayTimezone.replace(/_/g, " ")}. Please select another date from the calendar.
                    </p>
                </div>
            )}
        </div>
    );
};

export default BookingSlotsGrid;