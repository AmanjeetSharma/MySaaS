import { Construction } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import waitingGif from "@/assets/animations/waiting.gif";

export const Dashboard = () => {
    return (
        <div className="relative min-h-[calc(100vh-8rem)] w-full flex items-center justify-center px-4 py-8">
            {/* Main Not Implemented Yet Center Card */}
            <div className="relative z-10 w-full max-w-xl">
                <Card className="w-full rounded-3xl border border-border/80 bg-card shadow-sm text-center">
                    <CardContent className="flex flex-col items-center space-y-4 p-8 sm:p-10">
                        {/* Construction Icon */}
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <Construction className="h-7 w-7" />
                        </div>

                        {/* Heading & Subtext */}
                        <div className="space-y-1">
                            <h2 className="text-xl font-bold tracking-tight sm:text-2xl text-foreground">
                                Not Implemented Yet
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                The dashboard is currently under development. Please check back later.
                            </p>
                        </div>

                        {/* Waiting Animation GIF */}
                        <div className="pt-2">
                            <img
                                src={waitingGif}
                                alt="Dashboard Under Construction Animation"
                                className="mx-auto h-40 sm:h-48 w-auto rounded-2xl object-contain drop-shadow-sm select-none"
                                loading="eager"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;