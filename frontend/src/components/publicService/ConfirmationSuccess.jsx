import React from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";

const ConfirmationSuccess = ({ serviceName, orgName, date, slot, timezone, attendee }) => {
    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
            <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-335 mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <a href="/" className="flex items-center gap-2 group cursor-pointer focus:outline-none rounded-lg p-1 -ml-1">
                        <span className="font-extrabold text-slate-900 tracking-tight text-lg group-hover:opacity-80 transition-opacity">
                            mini<span className="text-indigo-600">CRM</span>
                        </span>
                    </a>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/60">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span className="hidden sm:inline">Verified Booking Page</span>
                    </div>
                </div>
            </header>

            <main className="max-w-xl mx-auto px-4 py-16 flex-1 flex items-center justify-center w-full">
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 text-center space-y-6 w-full">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Booking Confirmed!</h2>
                        <p className="text-xs text-slate-500">A calendar invitation has been sent to <strong>{attendee.email}</strong></p>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-left space-y-3 text-xs">
                        <div className="flex justify-between border-b border-slate-200/60 pb-2.5">
                            <span className="text-slate-500">Service</span>
                            <span className="font-bold text-slate-900">{serviceName}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200/60 pb-2.5">
                            <span className="text-slate-500">Organization</span>
                            <span className="font-semibold text-slate-800">{orgName}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200/60 pb-2.5">
                            <span className="text-slate-500">Date & Time</span>
                            <span className="font-semibold text-slate-800">
                                {date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} @ {slot} ({timezone.replace(/_/g, " ")})
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Attendee</span>
                            <span className="font-semibold text-slate-800">{attendee.name}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-3 px-4 rounded-2xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-all cursor-pointer"
                    >
                        Book Another Session
                    </button>
                </div>
            </main>

            <footer className="border-t border-slate-200/60 bg-white py-6 text-center text-xs text-slate-400">
                &copy; {new Date().getFullYear()} <span className="font-semibold text-slate-600">miniCRM</span>. All rights reserved.
            </footer>
        </div>
    );
};

export default ConfirmationSuccess;