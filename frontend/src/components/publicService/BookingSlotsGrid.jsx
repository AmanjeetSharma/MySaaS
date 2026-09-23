import { Clock } from "lucide-react";

const BookingSlotsGrid = ({
    slots,
    selectedSlot,
    onSelectSlot,
    selectedDate,
    displayTimezone
}) => {
    return (
        <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Available Slots ({selectedDate ? selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""})
                </label>
                {slots.length > 0 && (
                    <span className="text-[11px] font-medium text-muted-foreground">
                        {slots.length} slots available
                    </span>
                )}
            </div>

            {slots.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {slots.map((slot) => {
                        const isSelected = selectedSlot?.isoString === slot.isoString;
                        return (
                            <button
                                key={slot.isoString}
                                type="button"
                                onClick={() => onSelectSlot(slot)}
                                className={`py-3 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                                    isSelected
                                        ? "border-primary bg-primary text-primary-foreground shadow-xs ring-2 ring-primary/20"
                                        : "border-border/80 bg-card text-foreground hover:border-primary/60 hover:bg-primary/5 active:scale-[0.98]"
                                }`}
                            >
                                <Clock className={`w-3.5 h-3.5 ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`} />
                                <span>{slot.formattedTime}</span>
                            </button>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-muted/20 border border-dashed border-border/80 rounded-2xl p-8 text-center">
                    <p className="text-xs text-muted-foreground font-medium">
                        No available slots on this day in {displayTimezone.replace(/_/g, " ")}. Please select another date from the calendar.
                    </p>
                </div>
            )}
        </div>
    );
};

export default BookingSlotsGrid;