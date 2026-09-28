// src/pages/support/Contact.jsx

import { Construction } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Contact = () => {
    return (
        <div className="mx-auto flex min-h-[60vh] w-full max-w-xl items-center justify-center px-4 py-8">
            <Card className="w-full rounded-3xl border text-center">
                <CardContent className="flex flex-col items-center space-y-4 p-8 sm:p-10">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                        <Construction className="h-7 w-7 text-primary" />
                    </div>

                    <div className="space-y-1">
                        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                            Not Implemented Yet
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            The contact and support page is currently under development. Please check back later.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Contact;