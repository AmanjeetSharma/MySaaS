import React from "react";
import { User, Mail, Phone, FileText, ArrowRight, Loader2 } from "lucide-react";
import { formatCurrency } from "@/pages/organization/services/publicService/publicService.helper.js";

const AttendeeForm = ({
    formData,
    onInputChange,
    onSubmit,
    isFormValid,
    isProcessing,
    price,
    currency
}) => {
    return (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Your Details</h2>
                <p className="text-xs text-slate-500 mt-0.5">Please provide your contact information to finalize and pay.</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={onInputChange}
                            placeholder="Your full name"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={onInputChange}
                            placeholder="you@example.com"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                            type="tel"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={onInputChange}
                            placeholder="+91 98765 43210"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Notes <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                        <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                            type="text"
                            name="notes"
                            value={formData.notes}
                            onChange={onInputChange}
                            placeholder="Any specific requests or notes for the appointment"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
                        />
                    </div>
                </div>

                <div className="pt-4 hidden sm:block">
                    <button
                        type="submit"
                        disabled={!isFormValid || isProcessing}
                        className={`w-full py-3.5 px-4 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${isFormValid && !isProcessing
                            ? "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/10 cursor-pointer active:scale-[0.99]"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                            }`}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                                <span>Initializing Gateway...</span>
                            </>
                        ) : (
                            <>
                                <span>Confirm & Pay {price > 0 ? formatCurrency(price, currency) : ""}</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AttendeeForm;