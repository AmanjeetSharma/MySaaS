import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const CustomCalendar = ({ selected, onSelect, isDayDisabled }) => {
    const todayStr = useMemo(() => new Date().toDateString(), []);

    const [viewDate, setViewDate] = useState(
        () => new Date((selected || new Date()).getFullYear(), (selected || new Date()).getMonth(), 1)
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
            <div className="flex items-center justify-between mb-3 px-1">
                <button
                    type="button"
                    onClick={() => setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                    aria-label="Previous month"
                    className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition-all cursor-pointer"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold text-foreground tracking-tight">{monthLabel}</span>
                <button
                    type="button"
                    onClick={() => setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                    aria-label="Next month"
                    className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition-all cursor-pointer"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            <div className="grid grid-cols-7 mb-1.5">
                {WEEKDAY_LABELS.map((label) => (
                    <div
                        key={label}
                        className="h-8 flex items-center justify-center text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
                    >
                        {label}
                    </div>
                ))}
            </div>

            <div className="space-y-1">
                {weeks.map((week, wi) => (
                    <div key={wi} className="grid grid-cols-7 gap-1">
                        {week.map((date, di) => {
                            if (!date) return <div key={di} className="h-10 min-h-[40px]" />;

                            const disabled = isDayDisabled ? isDayDisabled(date) : false;
                            const isSelected = selected && date.toDateString() === selected.toDateString();
                            const isToday = todayStr === date.toDateString();

                            return (
                                <button
                                    key={di}
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => !disabled && onSelect(date)}
                                    className={`relative min-h-[40px] h-10 rounded-xl text-xs sm:text-sm font-semibold transition-all flex flex-col items-center justify-center gap-0.5 ${
                                        isSelected
                                            ? "bg-primary text-primary-foreground shadow-xs ring-2 ring-primary/20 cursor-pointer font-bold"
                                            : disabled
                                                ? "text-muted-foreground/25 cursor-not-allowed select-none"
                                                : "text-foreground hover:bg-accent hover:text-accent-foreground active:scale-95 cursor-pointer"
                                    }`}
                                >
                                    <span>{date.getDate()}</span>
                                    {isToday && !isSelected && (
                                        <span className="w-1 h-1 rounded-full bg-primary" />
                                    )}
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