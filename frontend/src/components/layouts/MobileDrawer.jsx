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
import {
    ChevronRight,
    ChevronDown,
    ArrowLeftToLine,
    Menu
} from 'lucide-react';
import { useNavigationConfig } from '@/config/navigation.config';
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { SidebarFooter } from '@/components/ui/sidebar';

export function MobileDrawer({ children }) {
    const [open, setOpen] = useState(false);
    const [openMenus, setOpenMenus] = useState({});
    const location = useLocation();
    const navigationConfig = useNavigationConfig();

    // Close drawer on route change
    useEffect(() => {
        setOpen(false);
    }, [location.pathname]);

    // Auto-open parent menu if child is active
    useEffect(() => {
        navigationConfig.mainNav.forEach((item) => {
            if (item.items && item.items.some(subItem => isActive(subItem))) {
                setOpenMenus(prev => ({ ...prev, [item.title]: true }));
            }
        });
    }, [location.pathname]);

    const isActive = useCallback((item) => {
        if (!item.href) return false;

        // Exact match for dashboard or items with exactMatch flag
        if (item.exactMatch || item.href === '/dashboard') {
            return location.pathname === item.href;
        }

        // Pattern-based matching for nested org routes
        if (item.pattern) {
            const patternParts = item.pattern.split('/');
            const pathParts = location.pathname.split('/');

            if (patternParts.length !== pathParts.length) return false;

            return patternParts.every((part, i) => {
                if (part.startsWith(':')) return true; // Dynamic segment
                return part === pathParts[i];
            });
        }

        // For non-organization nested routes (services, deals, settings)
        if (location.pathname === item.href) return true;

        // Check if current path is a direct child of this item's href
        const childPatterns = navigationConfig.mainNav
            .flatMap(nav => nav.items || [])
            .filter(sub => sub.href && sub.href.startsWith(item.href + '/'))
            .map(sub => sub.href);

        // If there are child routes, don't mark parent as active when child is active
        if (childPatterns.length > 0) {
            return location.pathname === item.href;
        }

        return location.pathname.startsWith(item.href);
    }, [location.pathname, navigationConfig.mainNav]);

    const isItemActive = useCallback((item) => {
        if (item.href) {
            return isActive(item);
        }
        if (item.items) {
            return item.items.some((subItem) => isActive(subItem));
        }
        return false;
    }, [isActive]);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {children || (
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 hover:bg-hover hover:text-hover-foreground active:bg-active"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent 
                side="left" 
                className="w-[85%] sm:w-87.5 p-0 [&>button]:hidden bg-sidebar text-sidebar-foreground border-r border-sidebar-border"
            >
                {/* Header */}
                <SheetHeader className="border-b border-border-subtle p-4">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="font-heading text-xl font-bold tracking-tight text-sidebar-foreground">
                            MySaaS
                        </SheetTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setOpen(false)}
                            className="h-8 w-8 shrink-0 hover:bg-hover hover:text-hover-foreground active:bg-active text-subtle-foreground hover:text-sidebar-foreground"
                        >
                            <ArrowLeftToLine className="h-4 w-4" />
                        </Button>
                    </div>
                    <SheetDescription className="sr-only">
                        Mobile navigation menu
                    </SheetDescription>
                </SheetHeader>

                <div className="flex h-full flex-col justify-between">
                    {/* Navigation */}
                    <div className="flex-1 overflow-y-auto py-4">
                        <div className="space-y-1.5 px-3">
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
                                                        'w-full justify-between px-3 py-2.5 h-11 rounded-lg font-medium text-[15px] transition-all duration-150 hover:bg-accent/80 hover:text-accent-foreground text-sidebar-foreground',
                                                        isItemActive(item) &&
                                                        'bg-accent text-accent-foreground font-semibold shadow-sm'
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {item.icon && <item.icon className="h-5 w-5 shrink-0" />}
                                                        <span>{item.title}</span>
                                                    </div>
                                                    {openMenus[item.title] ? (
                                                        <ChevronDown className="h-4 w-4 opacity-80" />
                                                    ) : (
                                                        <ChevronRight className="h-4 w-4 opacity-80" />
                                                    )}
                                                </Button>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <div className="ml-5 mt-1 space-y-1 border-l border-border-subtle pl-3">
                                                    {item.items.map((subItem) => (
                                                        <NavLink
                                                            key={subItem.title}
                                                            to={subItem.href}
                                                            onClick={() => setOpen(false)}
                                                            className={cn(
                                                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150 hover:bg-accent/70 hover:text-accent-foreground text-subtle-foreground',
                                                                isActive(subItem) &&
                                                                'bg-accent text-accent-foreground font-semibold shadow-xs'
                                                            )}
                                                        >
                                                            {subItem.icon && <subItem.icon className="h-4 w-4 shrink-0" />}
                                                            <span>{subItem.title}</span>
                                                        </NavLink>
                                                    ))}
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    ) : (
                                        <NavLink
                                            to={item.href}
                                            onClick={() => setOpen(false)}
                                            className={cn(
                                                'flex items-center gap-3 rounded-lg px-3 py-2.5 h-11 font-medium text-[15px] transition-all duration-150 hover:bg-accent/80 hover:text-accent-foreground text-sidebar-foreground',
                                                isActive(item) &&
                                                'bg-accent text-accent-foreground font-semibold shadow-sm'
                                            )}
                                        >
                                            {item.icon && <item.icon className="h-5 w-5 shrink-0" />}
                                            <span>{item.title}</span>
                                        </NavLink>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <SidebarFooter className="border-t border-border-subtle p-4 bg-sidebar">
                        <div className="space-y-0.5 text-center">
                            <p className="text-sm font-medium text-sidebar-foreground">MySaaS</p>
                            <p className="text-xs text-subtle-foreground">Version 1.0.0</p>
                        </div>
                    </SidebarFooter>
                </div>
            </SheetContent>
        </Sheet>
    );
}