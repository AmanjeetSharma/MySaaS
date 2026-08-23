// src/components/publicService/PublicServiceSkeleton.jsx
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck } from "lucide-react";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const PublicServiceSkeleton = () => {
    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 antialiased flex flex-col justify-between selection:bg-indigo-600 selection:text-white">
            {/* Header with live miniCRM branding */}
            <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 select-none">
                        <span className="font-extrabold text-slate-900 tracking-tight text-lg">
                            mini<span className="text-indigo-600">CRM</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/60 opacity-80">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span className="hidden sm:inline">Verified Booking Page</span>
                    </div>
                </div>
            </header>

            {/* Main Skeleton Content */}
            <main className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    
                    {/* LEFT COLUMN: Service Summary Card */}
                    <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
                        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-6">
                            {/* Organization Badge & Service Title */}
                            <div className="space-y-3">
                                <Skeleton className="h-6 w-32 rounded-full bg-indigo-50/80 border border-indigo-100" />
                                <div className="space-y-2 pt-1">
                                    <Skeleton className="h-8 w-4/5 rounded-xl bg-slate-200" />
                                    <Skeleton className="h-8 w-3/5 rounded-xl bg-slate-200" />
                                </div>
                            </div>

                            {/* Service Description */}
                            <div className="space-y-2 border-b border-slate-100 pb-5">
                                <Skeleton className="h-3.5 w-full rounded-md bg-slate-100" />
                                <Skeleton className="h-3.5 w-[92%] rounded-md bg-slate-100" />
                                <Skeleton className="h-3.5 w-3/4 rounded-md bg-slate-100" />
                            </div>

                            {/* Meta Metrics */}
                            <div className="space-y-4 pt-1">
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-4 w-12 rounded bg-slate-100" />
                                    <Skeleton className="h-6 w-20 rounded-lg bg-slate-200" />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-4 w-16 rounded bg-slate-100" />
                                    <Skeleton className="h-6 w-24 rounded-md bg-slate-100 border border-slate-200/50" />
                                </div>

                                <div className="flex items-center justify-between pt-1">
                                    <Skeleton className="h-4 w-14 rounded bg-slate-100" />
                                    <div className="space-y-1 text-right flex flex-col items-end">
                                        <Skeleton className="h-4 w-32 rounded bg-slate-200" />
                                        <Skeleton className="h-3 w-20 rounded bg-slate-100" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                    <Skeleton className="h-4 w-28 rounded bg-slate-100" />
                                    <Skeleton className="h-6 w-28 rounded-md bg-slate-100" />
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* RIGHT COLUMN: Calendar & Attendee Form */}
                    <section className="lg:col-span-8 space-y-8">
                        {/* Step 1: Calendar & Slot Selection Card */}
                        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-8">
                            {/* Card Header & Timezone Selector */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-48 rounded-lg bg-slate-200" />
                                    <Skeleton className="h-3.5 w-64 sm:w-80 rounded bg-slate-100" />
                                </div>
                                <div className="flex flex-col sm:items-end gap-1.5 self-start sm:self-auto">
                                    <Skeleton className="h-3 w-16 rounded bg-slate-100" />
                                    <Skeleton className="h-10 w-40 rounded-2xl bg-slate-100 border border-slate-200/60" />
                                </div>
                            </div>

                            {/* Calendar Grid Container */}
                            <div className="flex justify-center p-4 sm:p-6 bg-slate-50/60 rounded-2xl border border-slate-100">
                                <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4 sm:p-5 space-y-4">
                                    {/* Month & Nav Controls */}
                                    <div className="flex items-center justify-between px-1">
                                        <Skeleton className="w-8 h-8 rounded-lg bg-slate-100" />
                                        <Skeleton className="h-4 w-32 rounded-lg bg-slate-200" />
                                        <Skeleton className="w-8 h-8 rounded-lg bg-slate-100" />
                                    </div>

                                    {/* Weekday Headers */}
                                    <div className="grid grid-cols-7 gap-1">
                                        {WEEKDAYS.map((day) => (
                                            <div key={day} className="h-7 flex items-center justify-center">
                                                <Skeleton className="h-3 w-5 rounded bg-slate-100" />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Month Dates (5 Weeks) */}
                                    <div className="grid grid-cols-7 gap-1 pt-1">
                                        {[...Array(35)].map((_, i) => (
                                            <Skeleton
                                                key={i}
                                                className={`h-10 rounded-xl ${
                                                    i === 18
                                                        ? "bg-indigo-100 border border-indigo-200"
                                                        : "bg-slate-50/80 border border-slate-100/80"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Available Slots Section */}
                            <div className="space-y-4 pt-2">
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-3.5 w-44 rounded bg-slate-200" />
                                    <Skeleton className="h-3 w-24 rounded bg-slate-100" />
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                                    {[...Array(8)].map((_, i) => (
                                        <Skeleton
                                            key={i}
                                            className="h-11 rounded-xl bg-white border border-slate-200/80 shadow-sm"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Step 2: Attendee Form Card */}
                        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
                            <div className="border-b border-slate-100 pb-4 space-y-1.5">
                                <Skeleton className="h-5 w-32 rounded bg-slate-200" />
                                <Skeleton className="h-3 w-64 rounded bg-slate-100" />
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <Skeleton className="h-3 w-20 rounded bg-slate-100" />
                                    <Skeleton className="h-10 w-full rounded-xl bg-slate-50 border border-slate-200" />
                                </div>
                                <div className="space-y-1.5">
                                    <Skeleton className="h-3 w-24 rounded bg-slate-100" />
                                    <Skeleton className="h-10 w-full rounded-xl bg-slate-50 border border-slate-200" />
                                </div>
                                <div className="space-y-1.5">
                                    <Skeleton className="h-3 w-28 rounded bg-slate-100" />
                                    <Skeleton className="h-10 w-full rounded-xl bg-slate-50 border border-slate-200" />
                                </div>
                                <div className="space-y-1.5">
                                    <Skeleton className="h-3 w-20 rounded bg-slate-100" />
                                    <Skeleton className="h-10 w-full rounded-xl bg-slate-50 border border-slate-200" />
                                </div>
                                <div className="pt-3 hidden sm:block">
                                    <Skeleton className="h-12 w-full rounded-2xl bg-slate-900/80" />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            {/* Mobile Sticky CTA Bar Skeleton */}
            <div className="sm:hidden sticky bottom-0 z-40 bg-white border-t border-slate-200 p-4 shadow-xl">
                <Skeleton className="h-12 w-full rounded-xl bg-indigo-600/80" />
            </div>

            {/* Footer */}
            <footer className="border-t border-slate-200/60 bg-white py-6 text-center text-xs text-slate-400">
                &copy; {new Date().getFullYear()} <span className="font-semibold text-slate-600">miniCRM</span>. All rights reserved.
            </footer>
        </div>
    );
};

export default PublicServiceSkeleton;