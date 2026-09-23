import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const PublicServiceSkeleton = () => {
    return (
        <div className="min-h-screen bg-background text-foreground antialiased flex flex-col justify-between selection:bg-primary selection:text-primary-foreground lg:h-screen lg:overflow-hidden">
            {/* Header with live miniCRM branding */}
            <header className="border-b border-border/60 bg-background/80 backdrop-blur-md sticky top-0 z-50 shrink-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 select-none">
                        <span className="font-extrabold text-foreground tracking-tight text-base sm:text-lg">
                            mini<span className="text-primary">CRM</span>
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Skeleton Content */}
            <main className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 flex-1 w-full flex flex-col lg:flex-row items-stretch lg:overflow-hidden min-h-0">
                
                {/* LEFT COLUMN: Service Summary Card (Fixed part taking left space) */}
                <aside className="w-full lg:w-[440px] xl:w-[480px] shrink-0 py-4 sm:py-6 lg:py-8 lg:pr-6 xl:pr-8 flex flex-col lg:h-full lg:overflow-y-auto [scrollbar-width:thin] [scrollbar-color:var(--border)_transparent]">
                    <div className="bg-card rounded-2xl p-4 sm:p-6 lg:p-7 border border-border/80 shadow-xs space-y-4 sm:space-y-6 text-card-foreground flex-1 flex flex-col justify-between">
                        <div className="space-y-4 sm:space-y-6">
                            {/* Organization Badge & Service Title */}
                            <div className="space-y-3">
                                <Skeleton className="h-6 w-32 rounded-full" />
                                <div className="space-y-2 pt-1">
                                    <Skeleton className="h-8 w-4/5 rounded-xl" />
                                    <Skeleton className="h-8 w-3/5 rounded-xl" />
                                </div>
                            </div>

                            {/* Service Description */}
                            <div className="space-y-2 border-b border-border/60 pb-4 sm:pb-5">
                                <Skeleton className="h-3.5 w-full rounded-md" />
                                <Skeleton className="h-3.5 w-[92%] rounded-md" />
                                <Skeleton className="h-3.5 w-3/4 rounded-md" />
                            </div>

                            {/* Mobile micro-metrics row */}
                            <div className="grid grid-cols-3 gap-2 p-2.5 sm:hidden bg-muted/40 rounded-xl border border-border/70">
                                <Skeleton className="h-8 rounded-lg" />
                                <Skeleton className="h-8 rounded-lg" />
                                <Skeleton className="h-8 rounded-lg" />
                            </div>

                            {/* Desktop Meta Metrics */}
                            <div className="hidden sm:block space-y-4 pt-1">
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-4 w-12 rounded" />
                                    <Skeleton className="h-6 w-20 rounded-lg" />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-4 w-16 rounded" />
                                    <Skeleton className="h-6 w-24 rounded-md" />
                                </div>

                                <div className="flex items-center justify-between pt-1">
                                    <Skeleton className="h-4 w-14 rounded" />
                                    <div className="space-y-1 text-right flex flex-col items-end">
                                        <Skeleton className="h-4 w-32 rounded" />
                                        <Skeleton className="h-3 w-20 rounded" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-border/60">
                                    <Skeleton className="h-4 w-28 rounded" />
                                    <Skeleton className="h-6 w-28 rounded-md" />
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* VERTICAL SHADCN SEPARATOR */}
                <Separator orientation="vertical" className="hidden lg:block shrink-0 self-stretch my-6 lg:my-8" />
                <Separator orientation="horizontal" className="block lg:hidden shrink-0 my-3" />

                {/* RIGHT COLUMN: Calendar & Attendee Form (Scrollable part) */}
                <section className="flex-1 w-full py-4 sm:py-6 lg:py-8 lg:pl-6 xl:pl-8 space-y-6 sm:space-y-8 lg:h-full lg:overflow-y-auto [scrollbar-width:thin] [scrollbar-color:var(--border)_transparent]">
                    {/* Step 1: Calendar & Slot Selection Card */}
                    <div className="bg-card rounded-2xl border border-border/80 shadow-xs p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 text-card-foreground">
                        {/* Card Header & Timezone Selector */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 border-b border-border/60 pb-4 sm:pb-5">
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-48 rounded-lg" />
                                <Skeleton className="h-3.5 w-64 sm:w-80 rounded" />
                            </div>
                            <div className="flex flex-col sm:items-end gap-1.5 self-start sm:self-auto">
                                <Skeleton className="h-3 w-16 rounded" />
                                <Skeleton className="h-9 w-40 rounded-xl" />
                            </div>
                        </div>

                        {/* Calendar Grid Container */}
                        <div className="flex justify-center p-2.5 sm:p-5 bg-muted/20 rounded-xl sm:rounded-2xl border border-border/80">
                            <div className="w-full max-w-md bg-card rounded-xl sm:rounded-2xl border border-border/80 shadow-xs p-3 sm:p-5 space-y-4">
                                {/* Month & Nav Controls */}
                                <div className="flex items-center justify-between px-1">
                                    <Skeleton className="w-8 h-8 rounded-lg" />
                                    <Skeleton className="h-4 w-32 rounded-lg" />
                                    <Skeleton className="w-8 h-8 rounded-lg" />
                                </div>

                                {/* Weekday Headers */}
                                <div className="grid grid-cols-7 gap-1">
                                    {WEEKDAYS.map((day) => (
                                        <div key={day} className="h-8 flex items-center justify-center">
                                            <Skeleton className="h-3 w-5 rounded" />
                                        </div>
                                    ))}
                                </div>

                                {/* Month Dates (5 Weeks) */}
                                <div className="grid grid-cols-7 gap-1 pt-1">
                                    {[...Array(35)].map((_, i) => (
                                        <Skeleton
                                            key={i}
                                            className="h-10 min-h-[40px] rounded-xl"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Available Slots Section */}
                        <div className="space-y-3.5 pt-2">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-3.5 w-44 rounded" />
                                <Skeleton className="h-3 w-24 rounded" />
                            </div>
                            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-2.5">
                                {[...Array(8)].map((_, i) => (
                                    <Skeleton
                                        key={i}
                                        className="h-11 min-h-[44px] rounded-xl"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Attendee Form Card */}
                    <div className="bg-card rounded-2xl border border-border/80 shadow-xs p-4 sm:p-6 lg:p-8 space-y-6 text-card-foreground">
                        <div className="border-b border-border/60 pb-4 space-y-1.5">
                            <Skeleton className="h-5 w-32 rounded" />
                            <Skeleton className="h-3 w-64 rounded" />
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Skeleton className="h-3 w-20 rounded" />
                                <Skeleton className="h-11 sm:h-10 w-full rounded-xl" />
                            </div>
                            <div className="space-y-1.5">
                                <Skeleton className="h-3 w-24 rounded" />
                                <Skeleton className="h-11 sm:h-10 w-full rounded-xl" />
                            </div>
                            <div className="space-y-1.5">
                                <Skeleton className="h-3 w-28 rounded" />
                                <Skeleton className="h-11 sm:h-10 w-full rounded-xl" />
                            </div>
                            <div className="space-y-1.5">
                                <Skeleton className="h-3 w-20 rounded" />
                                <Skeleton className="h-11 sm:h-10 w-full rounded-xl" />
                            </div>
                            <div className="pt-3 hidden sm:block">
                                <Skeleton className="h-11 w-full rounded-xl" />
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Mobile Sticky CTA Bar Skeleton */}
            <div className="sm:hidden sticky bottom-0 z-40 bg-background/95 backdrop-blur-md border-t border-border/80 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] shadow-2xl">
                <div className="flex items-center justify-between gap-3">
                    <Skeleton className="h-8 w-32 rounded-lg" />
                    <Skeleton className="h-9 w-28 rounded-xl" />
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-border/60 bg-background/50 py-3.5 sm:py-4 shrink-0 text-center text-xs text-muted-foreground">
                &copy; {new Date().getFullYear()} <span className="font-semibold text-foreground">miniCRM</span>. All rights reserved.
            </footer>
        </div>
    );
};

export default PublicServiceSkeleton;