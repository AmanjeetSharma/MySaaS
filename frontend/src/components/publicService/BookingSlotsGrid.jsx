import React from "react";
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
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Available Slots ({selectedDate ? selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""})
                </label>
                {slots.length > 0 && (
                    <span className="text-[11px] font-medium text-slate-400">
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
                                className={`py-3 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${isSelected
                                        ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/20 ring-2 ring-indigo-600/20"
                                        : "border-slate-200/80 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
                                    }`}
                            >
                                <Clock className={`w-3.5 h-3.5 ${isSelected ? "text-indigo-200" : "text-slate-400"}`} />
                                <span>{slot.formattedTime}</span>
                            </button>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-slate-50 border border-dashed border-slate-200/80 rounded-2xl p-8 text-center">
                    <p className="text-xs text-slate-500 font-medium">
                        No available slots on this day in {displayTimezone.replace(/_/g, " ")}. Please select another date from the calendar.
                    </p>
                </div>
            )}
        </div>
    );
};

export default BookingSlotsGrid;