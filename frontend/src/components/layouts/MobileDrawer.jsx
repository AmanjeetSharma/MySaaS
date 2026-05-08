import { NavLink, useLocation } from 'react-router-dom';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronDown, ArrowLeftToLine } from 'lucide-react';
import { navigationConfig } from '@/config/navigation.config';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { SidebarFooter } from '@/components/ui/sidebar';

export function MobileDrawer({ children }) {
    const [open, setOpen] = useState(false);
    const [openMenus, setOpenMenus] = useState({});

    const location = useLocation();

    // Close drawer when route changes
    useEffect(() => {
        setOpen(false);
    }, [location.pathname]);

    const isActive = (href) => {
        if (!href) return false;

        if (href === '/dashboard') {
            return location.pathname === href;
        }

        return location.pathname.startsWith(href);
    };

    const isItemActive = (item) => {
        if (item.href) return isActive(item.href);

        if (item.items) {
            return item.items.some((subItem) => isActive(subItem.href));
        }

        return false;
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>

            <SheetContent
                side="left"
                className="w-[85%] sm:w-87.5 p-0 [&>button]:hidden"
            >
                <SheetHeader className="border-b p-4">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="text-xl font-bold">
                            MySaaS
                        </SheetTitle>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setOpen(false)}
                            className="h-8 w-8 shrink-0"
                        >
                            <ArrowLeftToLine className="h-4 w-4" />
                        </Button>
                    </div>

                    <SheetDescription className="sr-only">
                        Mobile navigation menu
                    </SheetDescription>
                </SheetHeader>

                <div className="flex h-full flex-col">
                    {/* Navigation */}
                    <div className="flex-1 overflow-y-auto py-4">
                        <div className="space-y-1 px-3">
                            {navigationConfig.mainNav.map((item) => (
                                <div key={item.title} className="space-y-1">
                                    {item.items && item.items.length > 0 ? (
                                        <Collapsible
                                            open={openMenus[item.title] ?? false}
                                            onOpenChange={(isOpen) =>
                                                setOpenMenus((prev) => ({
                                                    ...prev,
                                                    [item.title]: isOpen,
                                                }))
                                            }
                                        >
                                            <CollapsibleTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    className={cn(
                                                        'w-full justify-between px-3 py-2 h-auto',
                                                        isItemActive(item) &&
                                                        'bg-accent text-accent-foreground'
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {item.icon && (
                                                            <item.icon className="h-5 w-5" />
                                                        )}

                                                        <span className="font-medium">
                                                            {item.title}
                                                        </span>
                                                    </div>

                                                    {openMenus[item.title] ? (
                                                        <ChevronDown className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronRight className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </CollapsibleTrigger>

                                            <CollapsibleContent>
                                                <div className="ml-6 mt-1 space-y-1 border-l border-border pl-3">
                                                    {item.items.map(
                                                        (subItem) => (
                                                            <NavLink
                                                                key={
                                                                    subItem.title
                                                                }
                                                                to={
                                                                    subItem.href
                                                                }
                                                                className={({
                                                                    isActive:
                                                                    active,
                                                                }) =>
                                                                    cn(
                                                                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                                                                        active
                                                                            ? 'bg-accent/50 text-accent-foreground font-medium'
                                                                            : 'text-muted-foreground hover:bg-accent/50'
                                                                    )
                                                                }
                                                            >
                                                                {subItem.icon && (
                                                                    <subItem.icon className="h-4 w-4" />
                                                                )}

                                                                <span>
                                                                    {
                                                                        subItem.title
                                                                    }
                                                                </span>
                                                            </NavLink>
                                                        )
                                                    )}
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    ) : (
                                        <NavLink
                                            to={item.href}
                                            className={({ isActive: active }) =>
                                                cn(
                                                    'flex items-center gap-3 rounded-md px-3 py-2 transition-colors',
                                                    active
                                                        ? 'bg-accent text-accent-foreground font-medium'
                                                        : 'text-foreground hover:bg-accent/50'
                                                )
                                            }
                                        >
                                            {item.icon && (
                                                <item.icon className="h-5 w-5" />
                                            )}

                                            <span className="font-medium">
                                                {item.title}
                                            </span>
                                        </NavLink>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <SidebarFooter className="border-t p-4">
                        <div className="space-y-1 text-center">
                            <p className="text-sm font-medium">
                                MySaaS
                            </p>

                            <p className="text-xs text-muted-foreground">
                                Version 1.0.0
                            </p>
                        </div>
                    </SidebarFooter>
                </div>
            </SheetContent>
        </Sheet>
    );
}