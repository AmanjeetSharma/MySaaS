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
    PanelLeftClose,
    Menu
} from 'lucide-react';
import { useNavigationConfig } from '@/config/navigation.config';
import { useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';

const NAV_GROUPS = [
    {
        id: 'core',
        label: 'Overview',
        items: ['Dashboard']
    },
    {
        id: 'crm',
        label: 'CRM',
        items: ['Customers', 'Deals']
    },
    {
        id: 'bookings',
        label: 'Bookings',
        items: ['Services', 'Bookings']
    },
    {
        id: 'workspace',
        label: 'Workspace',
        items: ['Organization', 'Integrations']
    },
    {
        id: 'system',
        label: 'System',
        items: ['Notifications', 'Settings', 'Support']
    }
];

const ALL_GROUPED_TITLES = new Set(NAV_GROUPS.flatMap(g => g.items));
const CURRENT_YEAR = new Date().getFullYear();

export function MobileDrawer({ children }) {
    const [open, setOpen] = useState(false);
    const [openMenus, setOpenMenus] = useState({});
    const location = useLocation();
    const navigationConfig = useNavigationConfig();

    const closeDrawer = useCallback(() => {
        setOpen(false);
    }, []);

    const setMenuOpen = useCallback((title, isOpen) => {
        setOpenMenus(prev => ({
            ...prev,
            [title]: isOpen
        }));
    }, []);

    const activeStatusMap = useMemo(() => {
        const pathname = location.pathname;
        const mainNav = navigationConfig.mainNav || [];
        const allChildHrefs = mainNav
            .flatMap(nav => nav.items || [])
            .map(sub => sub.href)
            .filter(Boolean);

        const checkItemActive = (item) => {
            if (!item.href) return false;

            if (item.exactMatch || item.href === '/dashboard') {
                return pathname === item.href;
            }

            if (item.pattern) {
                const patternParts = item.pattern.split('/');
                const pathParts = pathname.split('/');

                if (patternParts.length !== pathParts.length) return false;

                return patternParts.every((part, i) => {
                    if (part.startsWith(':')) return true;
                    return part === pathParts[i];
                });
            }

            if (pathname === item.href) return true;

            const hasChildrenStartingWithHref = allChildHrefs.some(h => h.startsWith(item.href + '/'));
            if (hasChildrenStartingWithHref) {
                return pathname === item.href;
            }

            return pathname.startsWith(item.href);
        };

        const map = {};
        for (const item of mainNav) {
            const isItemActive = checkItemActive(item);
            let hasActiveChild = false;
            const subMap = {};
            if (item.items && item.items.length > 0) {
                for (const sub of item.items) {
                    const isSubActive = checkItemActive(sub);
                    subMap[sub.title] = isSubActive;
                    if (isSubActive) hasActiveChild = true;
                }
            }
            map[item.title] = {
                isActive: isItemActive,
                isChildActive: hasActiveChild,
                subItems: subMap
            };
        }
        return map;
    }, [location.pathname, navigationConfig.mainNav]);

    const groupedNav = useMemo(() => {
        const mainNav = navigationConfig.mainNav || [];
        const result = NAV_GROUPS.map(group => ({
            ...group,
            navItems: group.items
                .map(title => mainNav.find(item => item.title === title))
                .filter(Boolean)
        })).filter(group => group.navItems.length > 0);

        const remaining = mainNav.filter(item => !ALL_GROUPED_TITLES.has(item.title));
        if (remaining.length > 0) {
            result.push({
                id: 'other',
                label: 'More',
                navItems: remaining
            });
        }
        return result;
    }, [navigationConfig.mainNav]);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {children || (
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 hover:bg-hover hover:text-hover-foreground active:bg-active touch-manipulation"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent 
                side="left" 
                showCloseButton={false}
                className="w-72 sm:w-80 max-w-[85vw] p-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col justify-between"
            >
                {/* Header */}
                <SheetHeader className="h-16 border-b border-border-subtle px-4 flex flex-row items-center justify-between shrink-0">
                    <SheetTitle className="font-heading text-lg font-bold tracking-tight text-sidebar-foreground select-none">
                        miniCRM
                    </SheetTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={closeDrawer}
                        className="h-8 w-8 rounded-md hover:bg-hover hover:text-hover-foreground active:bg-active text-muted-foreground hover:text-foreground cursor-pointer transition-colors touch-manipulation"
                        aria-label="Close navigation"
                    >
                        <PanelLeftClose className="h-5 w-5" />
                    </Button>
                    <SheetDescription className="sr-only">
                        Mobile navigation menu
                    </SheetDescription>
                </SheetHeader>

                {/* Content: Grouped Navigation matching DesktopSidebar */}
                <nav aria-label="Mobile Navigation" className="flex-1 overflow-y-auto overscroll-y-contain py-2.5 px-2.5">
                    {groupedNav.map((group, groupIdx) => (
                        <div
                            key={group.id}
                            className={cn(
                                "w-full",
                                groupIdx > 0 && "mt-3.5"
                            )}
                        >
                            {group.label && (
                                <div className="h-5 px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60 select-none">
                                    {group.label}
                                </div>
                            )}
                            <div className="w-full space-y-0.5">
                                {group.navItems.map((item) => {
                                    const activeState = activeStatusMap[item.title] || {};
                                    const isActive = Boolean(activeState.isActive);
                                    const isChildActive = Boolean(activeState.isChildActive);

                                    return (
                                        <div key={item.title} className="w-full">
                                            {item.items && item.items.length > 0 ? (
                                                <Collapsible
                                                    open={Boolean(openMenus[item.title] ?? isChildActive)}
                                                    onOpenChange={(isOpen) => setMenuOpen(item.title, isOpen)}
                                                    className="w-full"
                                                >
                                                    <CollapsibleTrigger asChild>
                                                        <button
                                                            type="button"
                                                            className={cn(
                                                                "flex items-center justify-between w-full h-8.5 px-2.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer select-none touch-manipulation active:scale-[0.99]",
                                                                isChildActive
                                                                    ? "text-foreground font-semibold bg-sidebar-accent/50"
                                                                    : "text-muted-foreground hover:bg-sidebar-accent/80 hover:text-foreground"
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-2.5">
                                                                {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                                                                <span className="truncate">{item.title}</span>
                                                            </div>
                                                            <ChevronRight
                                                                className={cn(
                                                                    "h-3.5 w-3.5 shrink-0 transition-transform duration-200 text-muted-foreground/70",
                                                                    (openMenus[item.title] ?? isChildActive) && "rotate-90 text-foreground"
                                                                )}
                                                            />
                                                        </button>
                                                    </CollapsibleTrigger>
                                                    <CollapsibleContent>
                                                        <div className="ml-3.5 mt-0.5 border-l border-border-subtle/80 pl-2.5 space-y-0.5">
                                                            {item.items.map((subItem) => {
                                                                const isSubActive = activeState.subItems?.[subItem.title] ?? false;

                                                                return (
                                                                    <NavLink
                                                                        key={subItem.title}
                                                                        to={subItem.href}
                                                                        onClick={closeDrawer}
                                                                        className={cn(
                                                                            "flex items-center gap-2.5 h-8 w-full cursor-pointer rounded-lg text-xs transition-all duration-150 px-2 select-none touch-manipulation active:scale-[0.99]",
                                                                            isSubActive
                                                                                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-2xs relative before:absolute before:-left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:rounded-full before:bg-primary"
                                                                                : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground"
                                                                        )}
                                                                    >
                                                                        {subItem.icon && <subItem.icon className="h-3.5 w-3.5 shrink-0" />}
                                                                        <span className="truncate">{subItem.title}</span>
                                                                    </NavLink>
                                                                );
                                                            })}
                                                        </div>
                                                    </CollapsibleContent>
                                                </Collapsible>
                                            ) : (
                                                <NavLink
                                                    to={item.href}
                                                    onClick={closeDrawer}
                                                    className={cn(
                                                        "flex items-center gap-2.5 w-full h-8.5 px-2.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer select-none touch-manipulation active:scale-[0.99]",
                                                        isActive
                                                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-2xs relative before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-0.5 before:rounded-r before:bg-primary"
                                                            : "text-muted-foreground hover:bg-sidebar-accent/80 hover:text-foreground"
                                                    )}
                                                >
                                                    {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                                                    <span className="truncate">{item.title}</span>
                                                </NavLink>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Footer */}
                <div className="border-t border-border-subtle p-3 px-4 shrink-0">
                    <p className="text-xs text-subtle-foreground">
                        © {CURRENT_YEAR} miniCRM
                    </p>
                </div>
            </SheetContent>
        </Sheet>
    );
}