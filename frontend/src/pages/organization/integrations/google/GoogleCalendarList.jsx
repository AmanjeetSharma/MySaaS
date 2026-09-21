import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Calendar as CalendarIcon,
    Check,
    ChevronDown,
    ChevronUp,
    CornerDownRight,
    Loader2,
    Copy,
    Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from '@/components/ui/tooltip';

const CALENDAR_ACCENT_COLORS = [
    '#4285F4', // Google Blue
    '#0B8043', // Basil Green
    '#8E24AA', // Grape Purple
    '#D93025', // Flamingo Red
    '#E37400', // Tangerine
    '#039BE5'  // Peacock Blue
];

export const GoogleCalendarList = ({
    calendars = [],
    selectedCalendarId,
    isOwner,
    organizationId,
    isUpdatingCalendar,
    onSelectCalendar
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedCalendarId, setCopiedCalendarId] = useState(null);
    const [updatingCalendarId, setUpdatingCalendarId] = useState(null);

    const scrollAreaRef = useRef(null);
    const [canScrollDown, setCanScrollDown] = useState(false);
    const [canScrollUp, setCanScrollUp] = useState(false);

    const filteredCalendars = useMemo(() => {
        if (!searchQuery.trim()) return calendars;
        const query = searchQuery.toLowerCase();
        return calendars.filter(
            (cal) =>
                cal.name?.toLowerCase().includes(query) ||
                cal.description?.toLowerCase().includes(query) ||
                cal.id?.toLowerCase().includes(query)
        );
    }, [calendars, searchQuery]);

    const checkScroll = useCallback(() => {
        const viewport = scrollAreaRef.current?.querySelector('[data-slot="scroll-area-viewport"]');
        if (!viewport) return;
        const { scrollTop, scrollHeight, clientHeight } = viewport;
        const atTop = scrollTop <= 8;
        const atBottom = scrollTop + clientHeight >= scrollHeight - 8;
        const hasOverflow = scrollHeight > clientHeight + 8;

        setCanScrollUp(hasOverflow && !atTop);
        setCanScrollDown(hasOverflow && !atBottom);
    }, []);

    useEffect(() => {
        const viewport = scrollAreaRef.current?.querySelector('[data-slot="scroll-area-viewport"]');
        if (!viewport) return;

        checkScroll();
        viewport.addEventListener('scroll', checkScroll, { passive: true });

        const resizeObserver = new ResizeObserver(() => {
            checkScroll();
        });
        resizeObserver.observe(viewport);

        return () => {
            viewport.removeEventListener('scroll', checkScroll);
            resizeObserver.disconnect();
        };
    }, [checkScroll, filteredCalendars]);

    const handleScrollDown = () => {
        const viewport = scrollAreaRef.current?.querySelector('[data-slot="scroll-area-viewport"]');
        if (viewport) {
            viewport.scrollBy({ top: 160, behavior: 'smooth' });
        }
    };

    const handleScrollUp = () => {
        const viewport = scrollAreaRef.current?.querySelector('[data-slot="scroll-area-viewport"]');
        if (viewport) {
            viewport.scrollBy({ top: -160, behavior: 'smooth' });
        }
    };

    const handleCopyCalendarId = (calendarId) => {
        if (!calendarId) return;
        navigator.clipboard.writeText(calendarId);
        setCopiedCalendarId(calendarId);
        toast.success('Calendar ID copied to clipboard');
        setTimeout(() => {
            setCopiedCalendarId((curr) => (curr === calendarId ? null : curr));
        }, 2000);
    };

    const handleSelect = async (calendarId) => {
        if (!organizationId || !isOwner || isUpdatingCalendar) return;
        setUpdatingCalendarId(calendarId);
        try {
            await onSelectCalendar(calendarId);
        } finally {
            setUpdatingCalendarId(null);
        }
    };

    return (
        <div
            ref={scrollAreaRef}
            className="relative flex-1 min-h-0 flex flex-col rounded-xl border border-border-subtle bg-surface-elevated shadow-xs overflow-hidden w-full"
        >
            {/* Header & Filter Bar */}
            <div className="shrink-0 p-3 sm:p-4 border-b border-border-subtle bg-surface/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 min-w-0 w-full">
                <div className="min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                        <CalendarIcon className="size-4 text-foreground shrink-0" />
                        <h2 className="font-heading text-xs sm:text-sm font-semibold text-foreground truncate">
                            Google Calendar Feeds
                        </h2>
                        <span className="rounded-full bg-surface border border-border-subtle px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-medium text-muted-foreground shrink-0">
                            {calendars.length} {calendars.length === 1 ? 'calendar' : 'calendars'}
                        </span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 truncate">
                        {isOwner
                            ? 'Select which calendar feed receives incoming client bookings.'
                            : 'Google calendars currently authorized for this workspace.'}
                    </p>
                </div>

                {calendars.length > 3 && (
                    <div className="relative w-full sm:w-48 shrink-0">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter calendars..."
                            className="w-full rounded-lg border border-border-subtle bg-surface pl-8 pr-2.5 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-border transition-colors h-7.5 sm:h-8"
                        />
                    </div>
                )}
            </div>

            {/* Scrollable Feed List */}
            <ScrollArea className="flex-1 min-h-0 h-full p-2.5 sm:p-4 w-full">
                {filteredCalendars.length > 0 ? (
                    <div className="space-y-2.5 sm:space-y-3 pb-6 w-full">
                        {filteredCalendars.map((calendar, idx) => {
                            const isSelected = calendar.selected || calendar.id === selectedCalendarId;
                            const isRowUpdating = updatingCalendarId === calendar.id;
                            const isCopied = copiedCalendarId === calendar.id;
                            const accentColor = CALENDAR_ACCENT_COLORS[idx % CALENDAR_ACCENT_COLORS.length];

                            return (
                                <div
                                    key={calendar.id}
                                    className={cn(
                                        'group relative flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-xl border transition-all gap-2.5 sm:gap-3 min-w-0 w-full overflow-hidden',
                                        isSelected
                                            ? 'border-border bg-surface-sunken ring-1 ring-border/50 shadow-xs'
                                            : 'border-border-subtle bg-surface hover:border-border hover:bg-surface/80'
                                    )}
                                >
                                    <div className="flex items-start gap-2.5 sm:gap-3 min-w-0 flex-1 w-full">
                                        <span
                                            className="size-2.5 sm:size-3 rounded-full shrink-0 mt-1 ring-2 ring-surface shadow-2xs"
                                            style={{ backgroundColor: accentColor }}
                                            title="Calendar color tag"
                                        />

                                        <div className="min-w-0 flex-1 space-y-1">
                                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
                                                <h3 className="font-heading text-xs sm:text-sm font-semibold text-foreground truncate min-w-0 max-w-full">
                                                    {calendar.name}
                                                </h3>

                                                {calendar.primary && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span className="cursor-pointer rounded-md bg-secondary border border-border-subtle px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-medium text-secondary-foreground shrink-0">
                                                                Primary
                                                            </span>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            Your primary Google Calendar associated with your Google account
                                                        </TooltipContent>
                                                    </Tooltip>
                                                )}
                                            </div>

                                            <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-2 min-w-0 break-words">
                                                {calendar.description ||
                                                    (calendar.primary ? 'Default personal calendar' : 'Workspace schedule feed')}
                                            </p>

                                            {isSelected && (
                                                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-accent pt-0.5 min-w-0">
                                                    <CornerDownRight className="size-3 sm:size-3.5 shrink-0 stroke-[2.5]" />
                                                    <span className="truncate">Appointments are being created here</span>
                                                </div>
                                            )}

                                            {calendar.id && (
                                                <div className="flex items-center gap-1.5 pt-0.5 min-w-0 max-w-full">
                                                    <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground/80 truncate min-w-0 flex-1 max-w-[180px] xs:max-w-[240px] sm:max-w-sm">
                                                        ID: {calendar.id}
                                                    </span>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon-xs"
                                                                onClick={() => handleCopyCalendarId(calendar.id)}
                                                                className="cursor-pointer size-5 shrink-0 text-muted-foreground hover:text-foreground"
                                                                aria-label="Copy Calendar ID"
                                                            >
                                                                {isCopied ? (
                                                                    <Check className="size-3 text-success" />
                                                                ) : (
                                                                    <Copy className="size-3" />
                                                                )}
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>{isCopied ? 'Copied!' : 'Copy Calendar ID'}</TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="shrink-0 self-end sm:self-auto pt-1.5 sm:pt-0 border-t border-border-subtle sm:border-t-0 w-full sm:w-auto flex justify-end">
                                        {isSelected ? (
                                            <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 text-[11px] sm:text-xs font-semibold text-foreground/90 bg-surface border border-border-subtle rounded-lg shadow-2xs">
                                                <Check className="size-3 sm:size-3.5 text-success stroke-[2.5]" />
                                                In Use
                                            </span>
                                        ) : isOwner ? (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleSelect(calendar.id)}
                                                        disabled={isUpdatingCalendar}
                                                        className="cursor-pointer w-full sm:w-auto text-[11px] sm:text-xs h-7.5 sm:h-8 px-2.5 sm:px-3 hover:bg-surface-elevated"
                                                    >
                                                        {isRowUpdating ? (
                                                            <>
                                                                <Loader2 className="size-3 sm:size-3.5 animate-spin" />
                                                                <span>Updating...</span>
                                                            </>
                                                        ) : (
                                                            'Set as Active'
                                                        )}
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    Set the calendar for creating new appointments.                                                </TooltipContent>
                                            </Tooltip>
                                        ) : null}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="h-44 sm:h-48 flex flex-col items-center justify-center text-center p-4 sm:p-6 rounded-xl border border-dashed border-border-subtle bg-surface-sunken/40">
                        <CalendarIcon className="size-7 sm:size-8 text-muted-foreground/50 mb-2" />
                        <p className="text-xs font-medium text-foreground">
                            {searchQuery ? 'No calendars match your search' : 'No calendars discovered'}
                        </p>
                        <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-1">
                            {searchQuery
                                ? 'Try adjusting your search query'
                                : 'Click "Sync" in the top bar to fetch calendars feed from Google.'}
                        </p>
                    </div>
                )}
            </ScrollArea>

            {/* Floating Scroll Affordances */}
            {canScrollDown && (
                <div className="absolute bottom-2 sm:bottom-2.5 left-1/2 -translate-x-1/2 z-20 pointer-events-auto animate-in fade-in-0 duration-200">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                onClick={handleScrollDown}
                                className="cursor-pointer size-7 rounded-full bg-surface/95 backdrop-blur-xs border border-border-subtle shadow-md hover:bg-surface hover:border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all active:scale-95"
                                aria-label="Scroll down to see more calendars"
                            >
                                <ChevronDown className="size-4" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Scroll down for more feeds</TooltipContent>
                    </Tooltip>
                </div>
            )}

            {canScrollUp && !canScrollDown && (
                <div className="absolute bottom-2 sm:bottom-2.5 left-1/2 -translate-x-1/2 z-20 pointer-events-auto animate-in fade-in-0 duration-200">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                onClick={handleScrollUp}
                                className="cursor-pointer size-7 rounded-full bg-surface/95 backdrop-blur-xs border border-border-subtle shadow-md hover:bg-surface hover:border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all active:scale-95"
                                aria-label="Scroll to top of calendars"
                            >
                                <ChevronUp className="size-4" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Scroll to top</TooltipContent>
                    </Tooltip>
                </div>
            )}
        </div>
    );
};