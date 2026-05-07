import { NavLink, useLocation } from 'react-router-dom';
import {
    Sheet,
    SheetContent,
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
import { Menu, ChevronDown, LogOut, X } from 'lucide-react';
import { navigationConfig } from '@/config/navigation.config';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores';
import { cn } from '@/lib/utils';

export function MobileDrawer({ children }) {
    const [open, setOpen] = useState(false);
    const [openMenus, setOpenMenus] = useState({});
    const location = useLocation();
    const { logout } = useAuthStore();

    // Close drawer when route changes
    useEffect(() => {
        setOpen(false);
    }, [location.pathname]);

    const toggleMenu = (title) => {
        setOpenMenus(prev => ({ ...prev, [title]: !prev[title] }));
    };

    const isActive = (href) => {
        if (!href) return false;
        if (href === '/dashboard') {
            return location.pathname === href;
        }
        return location.pathname.startsWith(href);
    };

    const isItemActive = (item) => {
        if (item.href) return isActive(item.href);
        if (item.items) return item.items.some(subItem => isActive(subItem.href));
        return false;
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            <SheetContent side="left" className="w-[85%] sm:w-87.5 p-0 [&>button]:hidden">
                <SheetHeader className="border-b p-4">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="text-xl font-bold text-center">MySaaS</SheetTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setOpen(false)}
                            className="h-8 w-8 shrink-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </SheetHeader>

                <div className="flex flex-col h-full">
                    {/* Navigation Menu */}
                    <div className="flex-1 overflow-y-auto py-4">
                        <div className="px-3 space-y-1">
                            {navigationConfig.mainNav.map((item) => (
                                <div key={item.title} className="space-y-1">
                                    {item.items && item.items.length > 0 ? (
                                        <Collapsible
                                            open={openMenus[item.title]}
                                            onOpenChange={() => toggleMenu(item.title)}
                                        >
                                            <CollapsibleTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    className={cn(
                                                        "w-full justify-between px-3 py-2 h-auto",
                                                        isItemActive(item) && "bg-accent text-accent-foreground"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {item.icon && <item.icon className="h-5 w-5" />}
                                                        <span className="font-medium">{item.title}</span>
                                                    </div>
                                                    <ChevronDown className={cn(
                                                        "h-4 w-4 transition-transform",
                                                        openMenus[item.title] && "rotate-180"
                                                    )} />
                                                </Button>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <div className="ml-6 pl-3 border-l border-border space-y-1 mt-1">
                                                    {item.items.map((subItem) => (
                                                        <NavLink
                                                            key={subItem.title}
                                                            to={subItem.href}
                                                            className={({ isActive: active }) =>
                                                                cn(
                                                                    "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                                                                    active
                                                                        ? "bg-accent/50 text-accent-foreground font-medium"
                                                                        : "hover:bg-accent/50 text-muted-foreground"
                                                                )
                                                            }
                                                        >
                                                            {subItem.icon && <subItem.icon className="h-4 w-4" />}
                                                            <span>{subItem.title}</span>
                                                        </NavLink>
                                                    ))}
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    ) : (
                                        <NavLink
                                            to={item.href}
                                            className={({ isActive: active }) =>
                                                cn(
                                                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                                                    active
                                                        ? "bg-accent text-accent-foreground font-medium"
                                                        : "hover:bg-accent/50 text-foreground"
                                                )
                                            }
                                        >
                                            {item.icon && <item.icon className="h-5 w-5" />}
                                            <span className="font-medium">{item.title}</span>
                                        </NavLink>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer with Logout */}
                    <div className="border-t p-4">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50/10 dark:hover:bg-red-950/20"
                            onClick={() => logout()}
                        >
                            <LogOut className="h-5 w-5" />
                            <span className="font-medium">Logout</span>
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}