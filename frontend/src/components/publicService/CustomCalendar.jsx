import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const CustomCalendar = ({ selected, onSelect, isDayDisabled }) => {
    const [viewDate, setViewDate] = useState(
        () => new Date(selected.getFullYear(), selected.getMonth(), 1)
    );

    const weeks = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const totalDays = new Date(year, month + 1, 0).getDate();

        const cells = [];
        for (let i = 0; i < firstDay; i++) cells.push(null);
        for (let d = 1; d <= totalDays; d++) cells.push(new Date(year, month, d));
        while (cells.length % 7 !== 0) cells.push(null);

        const grid = [];
        for (let i = 0; i < cells.length; i += 7) grid.push(cells.slice(i, i + 7));
        return grid;
    }, [viewDate]);

    const monthLabel = viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    return (
        <div className="w-full max-w-md select-none">
            <div className="flex items-center justify-between mb-4 px-1">
                <button
                    type="button"
                    onClick={() => setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                    aria-label="Previous month"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold text-slate-900 tracking-tight">{monthLabel}</span>
                <button
                    type="button"
                    onClick={() => setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                    aria-label="Next month"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            <div className="grid grid-cols-7 mb-1.5">
                {WEEKDAY_LABELS.map((label) => (
                    <div
                        key={label}
                        className="h-8 flex items-center justify-center text-[11px] font-bold uppercase tracking-wider text-slate-400"
                    >
                        {label}
                    </div>
                ))}
            </div>

            <div className="space-y-1">
                {weeks.map((week, wi) => (
                    <div key={wi} className="grid grid-cols-7 gap-1">
                        {week.map((date, di) => {
                            if (!date) return <div key={di} className="h-10" />;

                            const disabled = isDayDisabled(date);
                            const isSelected = selected && date.toDateString() === selected.toDateString();

                            return (
                                <button
                                    key={di}
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => !disabled && onSelect(date)}
                                    className={`relative h-10 rounded-xl text-sm font-semibold transition-all flex items-center justify-center ${isSelected
                                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-2 ring-indigo-600/20 cursor-pointer"
                                            : disabled
                                                ? "text-slate-300 cursor-not-allowed"
                                                : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 active:scale-95 cursor-pointer"
                                        }`}
                                >
                                    {date.getDate()}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CustomCalendar;