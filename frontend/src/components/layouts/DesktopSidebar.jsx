import { NavLink, useLocation } from 'react-router-dom';
import {
    Sidebar as SidebarContainer,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarHeader,
    SidebarFooter,
    useSidebar,
} from '@/components/ui/sidebar';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useNavigationConfig } from '@/config/navigation.config';
import { useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from '@/components/ui/tooltip';
import {
    ChevronRight,
    PanelRightClose,
    PanelLeftClose
} from 'lucide-react';

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
const IS_MAC = typeof window !== 'undefined' && /Mac|iPhone|iPod|iPad/.test(navigator.userAgent);
const SHORTCUT_LABEL = IS_MAC ? '⌘B' : 'Ctrl+B';
const CURRENT_YEAR = new Date().getFullYear();

export function DesktopSidebar() {
    const location = useLocation();
    const { state, toggleSidebar } = useSidebar();
    const navigationConfig = useNavigationConfig();
    const [openMenus, setOpenMenus] = useState({});

    const isCollapsed = state === "collapsed";

    const setMenuOpen = useCallback((title, isOpen) => {
        if (state !== "collapsed") {
            setOpenMenus(prev => ({
                ...prev,
                [title]: isOpen
            }));
        }
    }, [state]);

    const handleNavClick = useCallback(() => {
        if (state === "collapsed") {
            toggleSidebar();
        }
    }, [state, toggleSidebar]);

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
        <SidebarContainer
            collapsible="icon"
            className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground select-none"
            style={{
                '--sidebar-width-icon': '3rem',
                '--sidebar-width': '16rem'
            }}
        >
            {/* Header */}
            <SidebarHeader
                className={cn(
                    "flex flex-row items-center border-b border-border-subtle h-16 w-full",
                    isCollapsed ? "justify-center p-0" : "justify-end px-4"
                )}
            >
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={toggleSidebar}
                                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                                className={cn(
                                    "flex items-center justify-center rounded-md hover:bg-hover hover:text-hover-foreground active:bg-active transition-all duration-200 cursor-pointer text-sidebar-foreground",
                                    isCollapsed ? "h-8 w-8 mx-auto" : "h-9 w-9 ml-auto"
                                )}
                            >
                                {isCollapsed ? (
                                    <PanelRightClose className="h-4 w-4 shrink-0 transition-transform duration-200" />
                                ) : (
                                    <PanelLeftClose className="h-5 w-5 shrink-0 transition-transform duration-200" />
                                )}
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            <span>{isCollapsed ? `Expand (${SHORTCUT_LABEL})` : `Close (${SHORTCUT_LABEL})`}</span>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </SidebarHeader>

            {/* Content: Grouped Navigation with Consistent Rhythm */}
            <SidebarContent className="py-2.5">
                {groupedNav.map((group, groupIdx) => (
                    <SidebarGroup
                        key={group.id}
                        className={cn(
                            "w-full",
                            isCollapsed ? "p-0 items-center" : "py-0 px-2.5",
                            groupIdx > 0 && "mt-3.5"
                        )}
                    >
                        {!isCollapsed && group.label && (
                            <SidebarGroupLabel className="h-5 px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60 select-none">
                                {group.label}
                            </SidebarGroupLabel>
                        )}
                        <SidebarGroupContent className={cn("w-full", isCollapsed && "flex flex-col items-center justify-center")}>
                            <SidebarMenu className={cn("w-full gap-0.5", isCollapsed && "items-center")}>
                                {group.navItems.map((item) => {
                                    const activeState = activeStatusMap[item.title] || {};
                                    const isActive = Boolean(activeState.isActive);
                                    const isChildActive = Boolean(activeState.isChildActive);

                                    return (
                                        <SidebarMenuItem
                                            key={item.title}
                                            className={cn("w-full", isCollapsed && "flex justify-center items-center")}
                                        >
                                            {item.items && item.items.length > 0 ? (
                                                isCollapsed ? (
                                                    <SidebarMenuButton
                                                        tooltip={item.title}
                                                        onClick={handleNavClick}
                                                        className={cn(
                                                            "cursor-pointer rounded-lg text-xs font-medium transition-all duration-150 h-8 w-8 justify-center p-0! mx-auto",
                                                            isChildActive
                                                                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-2xs"
                                                                : "text-muted-foreground hover:bg-sidebar-accent/80 hover:text-foreground"
                                                        )}
                                                    >
                                                        <div className="flex items-center justify-center w-full">
                                                            {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                                                        </div>
                                                    </SidebarMenuButton>
                                                ) : (
                                                    <Collapsible
                                                        open={Boolean(openMenus[item.title] ?? isChildActive)}
                                                        onOpenChange={(isOpen) => setMenuOpen(item.title, isOpen)}
                                                        className="w-full"
                                                    >
                                                        <CollapsibleTrigger asChild>
                                                            <SidebarMenuButton
                                                                tooltip={item.title}
                                                                onClick={handleNavClick}
                                                                className={cn(
                                                                    "cursor-pointer rounded-lg text-xs font-medium transition-all duration-150 h-8.5 w-full justify-between px-2.5",
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
                                                            </SidebarMenuButton>
                                                        </CollapsibleTrigger>
                                                        <CollapsibleContent>
                                                            <SidebarMenu className="ml-3.5 mt-0.5 border-l border-border-subtle/80 pl-2.5 space-y-0.5">
                                                                {item.items.map((subItem) => {
                                                                    const isSubActive = activeState.subItems?.[subItem.title] ?? false;

                                                                    return (
                                                                        <SidebarMenuItem key={subItem.title}>
                                                                            <NavLink to={subItem.href} className="block cursor-pointer">
                                                                                <SidebarMenuButton
                                                                                    tooltip={subItem.title}
                                                                                    className={cn(
                                                                                        "h-8 w-full cursor-pointer rounded-lg text-xs transition-all duration-150 px-2",
                                                                                        isSubActive
                                                                                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-2xs relative before:absolute before:-left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:rounded-full before:bg-primary"
                                                                                            : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground"
                                                                                    )}
                                                                                >
                                                                                    <div className="flex items-center gap-2.5">
                                                                                        {subItem.icon && <subItem.icon className="h-3.5 w-3.5 shrink-0" />}
                                                                                        <span className="truncate">{subItem.title}</span>
                                                                                    </div>
                                                                                </SidebarMenuButton>
                                                                            </NavLink>
                                                                        </SidebarMenuItem>
                                                                    );
                                                                })}
                                                            </SidebarMenu>
                                                        </CollapsibleContent>
                                                    </Collapsible>
                                                )
                                            ) : (
                                                <NavLink
                                                    to={item.href}
                                                    className={cn(
                                                        "cursor-pointer",
                                                        isCollapsed ? "flex justify-center items-center w-full" : "block"
                                                    )}
                                                >
                                                    <SidebarMenuButton
                                                        tooltip={item.title}
                                                        onClick={handleNavClick}
                                                        className={cn(
                                                            "cursor-pointer rounded-lg text-xs font-medium transition-all duration-150",
                                                            isCollapsed
                                                                ? "h-8 w-8 justify-center p-0! mx-auto"
                                                                : "h-8.5 w-full justify-start px-2.5",
                                                            isActive
                                                                ? (isCollapsed
                                                                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-2xs"
                                                                    : "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-2xs relative before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-0.5 before:rounded-r before:bg-primary"
                                                                )
                                                                : "text-muted-foreground hover:bg-sidebar-accent/80 hover:text-foreground"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "flex items-center",
                                                            isCollapsed ? "justify-center w-full" : "gap-2.5"
                                                        )}>
                                                            {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                                                            <span className={cn(
                                                                "truncate",
                                                                isCollapsed && "hidden"
                                                            )}>
                                                                {item.title}
                                                            </span>
                                                        </div>
                                                    </SidebarMenuButton>
                                                </NavLink>
                                            )}
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            {/* Footer */}
            <SidebarFooter className={cn("border-t border-border-subtle p-3", isCollapsed && "p-0 h-10 border-transparent")}>
                <div className={cn(
                    "text-xs text-subtle-foreground transition-opacity duration-200",
                    isCollapsed ? "hidden" : "px-2"
                )}>
                    <p>© {CURRENT_YEAR} miniCRM</p>
                </div>
            </SidebarFooter>
        </SidebarContainer>
    );
}
