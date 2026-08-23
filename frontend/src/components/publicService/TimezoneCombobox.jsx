import React, { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Globe } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { TIMEZONES } from "@/constants/timezone.constant.js";

const TimezoneCombobox = ({ value, onChange, className }) => {
    const [open, setOpen] = useState(false);

    const groupedTimezones = useMemo(() => {
        const groups = {};
        TIMEZONES.forEach((tz) => {
            if (tz === "UTC") {
                if (!groups["UTC"]) groups["UTC"] = [];
                groups["UTC"].push(tz);
                return;
            }
            const [region] = tz.split("/");
            if (!groups[region]) groups[region] = [];
            groups[region].push(tz);
        });
        return groups;
    }, []);

    const formattedLabel = (tz) => tz.replace(/_/g, " ");

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    role="combobox"
                    aria-expanded={open}
                    aria-label="Select timezone"
                    className={cn(
                        "flex items-center justify-between gap-2 h-9 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all cursor-pointer",
                        className
                    )}
                >
                    <div className="flex items-center gap-2 truncate">
                        <Globe className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="truncate">{formattedLabel(value || "UTC")}</span>
                    </div>
                    <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0 opacity-70" />
                </button>
            </PopoverTrigger>

            <PopoverContent className="w-70 p-0 rounded-2xl border border-slate-200/80 bg-white text-slate-900 shadow-xl ring-slate-200/80" align="end">
                <Command className="bg-white text-slate-900 **:data-[slot=input-group]:border-slate-200! **:data-[slot=input-group]:bg-white! **:data-[slot=input-group]:text-slate-900! **:data-[slot=input-group-addon]:text-slate-400!">
                    <CommandInput placeholder="Search timezone (e.g. Kolkata)..." className="h-9 text-xs text-slate-900 placeholder:text-slate-400" />
                    <CommandList className="max-h-60 overflow-y-auto p-1">
                        <CommandEmpty className="py-6 text-center text-xs text-slate-400">
                            No timezone found.
                        </CommandEmpty>

                        {!TIMEZONES.includes(value) && value && (
                            <CommandGroup heading="Current">
                                <CommandItem
                                    value={value}
                                    onSelect={() => {
                                        onChange(value);
                                        setOpen(false);
                                    }}
                                    className="text-xs cursor-pointer rounded-lg text-slate-700 data-selected:bg-indigo-50 data-selected:text-indigo-700"
                                >
                                    <Check className="mr-2 h-3.5 w-3.5 text-indigo-600 opacity-100" />
                                    <span>{formattedLabel(value)}</span>
                                </CommandItem>
                            </CommandGroup>
                        )}

                        {Object.entries(groupedTimezones).map(([region, tzs]) => (
                            <CommandGroup key={region} heading={region} className="text-slate-500 **:[[cmdk-group-heading]]:text-slate-500">
                                {tzs.map((tz) => {
                                    const isSelected = value === tz;
                                    return (
                                        <CommandItem
                                            key={tz}
                                            value={`${tz} ${formattedLabel(tz)}`}
                                            onSelect={() => {
                                                onChange(tz);
                                                setOpen(false);
                                            }}
                                            className="text-xs cursor-pointer rounded-lg flex items-center justify-between text-slate-700 data-selected:bg-indigo-50 data-selected:text-indigo-700"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Check
                                                    className={cn(
                                                        "h-3.5 w-3.5 text-indigo-600 transition-opacity",
                                                        isSelected ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                <span>{formattedLabel(tz)}</span>
                                            </div>
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        ))}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export default TimezoneCombobox;
