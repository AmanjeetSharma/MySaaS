// src/pages/support/HelpSupportPage.jsx

import {
    HelpCircle,
    Mail,
    Phone,
    BellRing,
    ShieldCheck,
    MessageSquareText,
    Users,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const Contact = () => {

    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 lg:px-8">

            {/* TOP */}
            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">

                {/* HERO */}
                <Card className="rounded-3xl border">
                    <CardContent className="space-y-5 p-5 sm:p-6 lg:p-8">

                        <div className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
                                <HelpCircle className="h-5 w-5 text-primary" />
                            </div>

                            <div>
                                <p className="text-sm font-semibold">
                                    Help & Support
                                </p>

                                <p className="text-xs text-muted-foreground">
                                    We are here to help you
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold leading-tight sm:text-3xl">
                                Simple support for your business
                            </h1>

                            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                                Manage customers, reminders, meetings, and follow-ups
                                from one simple dashboard.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <button className="h-11 rounded-2xl bg-primary px-5 text-sm font-medium text-primary-foreground">
                                Documentation
                            </button>
                        </div>

                    </CardContent>
                </Card>

                {/* SUPPORT INFO */}
                <Card className="rounded-3xl border">
                    <CardContent className="space-y-5 p-5 sm:p-6">

                        <div>
                            <h2 className="text-lg font-semibold">
                                Support Info
                            </h2>

                            <p className="text-sm text-muted-foreground">
                                Contact us anytime.
                            </p>
                        </div>

                        <div className="space-y-4">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
                                    <Mail className="h-4 w-4 text-primary" />
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Email
                                    </p>

                                    <p className="text-sm font-medium">
                                        support@yourcompany.com
                                    </p>
                                </div>

                            </div>

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
                                    <Phone className="h-4 w-4 text-primary" />
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Phone
                                    </p>

                                    <p className="text-sm font-medium">
                                        +91 98765 43210
                                    </p>
                                </div>

                            </div>

                        </div>

                    </CardContent>
                </Card>

            </div>

            {/* CONTACT FORM */}
            <Card className="mt-5 rounded-3xl border">
                <CardContent className="space-y-4 p-5 sm:p-6 lg:p-8">

                    <div>
                        <h2 className="text-lg font-semibold">
                            Send Message
                        </h2>

                        <p className="text-sm text-muted-foreground">
                            We usually reply within 24 hours.
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">

                        <Input
                            placeholder="Your name"
                            className="h-11 rounded-xl"
                        />

                        <Input
                            placeholder="Email address"
                            className="h-11 rounded-xl"
                        />

                    </div>

                    <Textarea
                        rows={5}
                        placeholder="Write your message..."
                        className="rounded-xl"
                    />

                    <button className="h-11 w-full rounded-2xl bg-primary text-sm font-medium text-primary-foreground sm:w-auto sm:px-6">
                        Send Message
                    </button>

                </CardContent>
            </Card>

        </div>
    );
};

export default Contact;