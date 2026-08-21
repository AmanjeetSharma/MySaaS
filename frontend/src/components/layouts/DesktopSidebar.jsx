import { NavLink, useLocation } from 'react-router-dom';
import {
    Sidebar as SidebarContainer,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
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
import { useState } from 'react';
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

export function DesktopSidebar() {
    const location = useLocation();
    const { state, toggleSidebar } = useSidebar();
    const navigationConfig = useNavigationConfig();
    const [openMenus, setOpenMenus] = useState({});

    const isActive = (item) => {
        if (!item.href) return false;

        if (item.exactMatch || item.href === '/dashboard') {
            return location.pathname === item.href;
        }

        if (item.pattern) {
            const patternParts = item.pattern.split('/');
            const pathParts = location.pathname.split('/');

            if (patternParts.length !== pathParts.length) return false;

            return patternParts.every((part, i) => {
                if (part.startsWith(':')) return true;
                return part === pathParts[i];
            });
        }

        if (location.pathname === item.href) return true;

        const childPatterns = navigationConfig.mainNav
            .flatMap(nav => nav.items || [])
            .filter(sub => sub.href && sub.href.startsWith(item.href + '/'))
            .map(sub => sub.href);

        if (childPatterns.length > 0) {
            return location.pathname === item.href;
        }

        return location.pathname.startsWith(item.href);
    };

    const isItemActive = (item) => {
        if (item.href) {
            return isActive(item);
        }
        if (item.items) {
            return item.items.some(subItem => isActive(subItem));
        }
        return false;
    };

    const setMenuOpen = (title, isOpen) => {
        if (state !== "collapsed") {
            setOpenMenus(prev => ({
                ...prev,
                [title]: isOpen
            }));
        }
    };

    const isCollapsed = state === "collapsed";

    const handleNavClick = () => {
        if (isCollapsed) {
            toggleSidebar();
        }
    };

    return (
        <SidebarContainer
            collapsible="icon"
            className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground"
            style={{
                '--sidebar-width-icon': '3rem',
                '--sidebar-width': '16rem'
            }}
        >
            {/* Header */}
            <SidebarHeader
                className={cn(
                    "flex h-16 items-center border-b border-border-subtle px-4",
                    isCollapsed ? "justify-center px-0" : "justify-end"
                )}
            >
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={toggleSidebar}
                                className={cn(
                                    "flex h-9 w-9 items-center justify-center rounded-md hover:bg-hover hover:text-hover-foreground active:bg-active transition-all duration-200 cursor-pointer text-sidebar-foreground",
                                    !isCollapsed && "ml-auto"
                                )}
                            >
                                {isCollapsed ? (
                                    <PanelRightClose className="h-5 w-5" />
                                ) : (
                                    <PanelLeftClose className="h-5 w-5" />
                                )}
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            <span>{isCollapsed ? "Expand" : "Close"}</span>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </SidebarHeader>

            {/* Content */}
            <SidebarContent className="py-4">
                <SidebarGroup>
                    <SidebarGroupContent>
                        {/* Removed px-2 to restore full width alignment */}
                        <SidebarMenu className="gap-1.5">
                            {navigationConfig.mainNav.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    {item.items && item.items.length > 0 ? (
                                        <Collapsible
                                            open={!isCollapsed && (openMenus[item.title] ?? isItemActive(item))}
                                            onOpenChange={(isOpen) => setMenuOpen(item.title, isOpen)}
                                            className="w-full"
                                        >
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton
                                                    tooltip={item.title}
                                                    onClick={handleNavClick}
                                                    className={cn(
                                                        "h-11 w-full cursor-pointer rounded-lg transition-all duration-150 hover:bg-accent/80 hover:text-accent-foreground",
                                                        isCollapsed ? "justify-center px-0" : "justify-between",
                                                        isItemActive(item) &&
                                                        "bg-accent text-accent-foreground font-semibold shadow-sm"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "flex items-center",
                                                        isCollapsed ? "justify-center w-full" : "gap-3"
                                                    )}>
                                                        {item.icon && <item.icon className="h-5 w-5 shrink-0" />}
                                                        <span className={cn(
                                                            "font-medium text-[15px]",
                                                            isCollapsed && "hidden"
                                                        )}>
                                                            {item.title}
                                                        </span>
                                                    </div>
                                                    {!isCollapsed && (
                                                        <ChevronRight
                                                            className={cn(
                                                                "h-4 w-4 transition-transform duration-200 opacity-80",
                                                                (openMenus[item.title] ?? isItemActive(item)) && "rotate-90 opacity-100"
                                                            )}
                                                        />
                                                    )}
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>
                                            {!isCollapsed && (
                                                <CollapsibleContent>
                                                    <SidebarMenu className="ml-6 mt-1 border-l border-border-subtle pl-3 space-y-1">
                                                        {item.items.map((subItem) => (
                                                            <SidebarMenuItem key={subItem.title}>
                                                                <NavLink to={subItem.href} className="block cursor-pointer">
                                                                    <SidebarMenuButton
                                                                        tooltip={subItem.title}
                                                                        className={cn(
                                                                            "h-10 w-full cursor-pointer rounded-lg transition-all duration-150 hover:bg-accent/70 hover:text-accent-foreground text-subtle-foreground",
                                                                            isActive(subItem) &&
                                                                            "bg-accent text-accent-foreground font-semibold shadow-xs"
                                                                        )}
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            {subItem.icon && <subItem.icon className="h-4 w-4 shrink-0" />}
                                                                            <span className="text-sm">{subItem.title}</span>
                                                                        </div>
                                                                    </SidebarMenuButton>
                                                                </NavLink>
                                                            </SidebarMenuItem>
                                                        ))}
                                                    </SidebarMenu>
                                                </CollapsibleContent>
                                            )}
                                        </Collapsible>
                                    ) : (
                                        <NavLink to={item.href} className="block cursor-pointer">
                                            <SidebarMenuButton
                                                tooltip={item.title}
                                                onClick={handleNavClick}
                                                className={cn(
                                                    "h-11 w-full cursor-pointer rounded-lg transition-all duration-150 hover:bg-accent/80 hover:text-accent-foreground",
                                                    isCollapsed ? "justify-center px-0" : "justify-start",
                                                    isActive(item) &&
                                                    "bg-accent text-accent-foreground font-semibold shadow-sm"
                                                )}
                                            >
                                                <div className={cn(
                                                    "flex items-center",
                                                    isCollapsed ? "justify-center w-full" : "gap-3"
                                                )}>
                                                    {item.icon && <item.icon className="h-5 w-5 shrink-0" />}
                                                    <span className={cn(
                                                        "font-medium text-[15px]",
                                                        isCollapsed && "hidden"
                                                    )}>
                                                        {item.title}
                                                    </span>
                                                </div>
                                            </SidebarMenuButton>
                                        </NavLink>
                                    )}
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* Footer */}
            <SidebarFooter className="border-t border-border-subtle p-3">
                <div className={cn(
                    "text-xs text-subtle-foreground",
                    isCollapsed ? "hidden" : "px-2"
                )}>
                    <p>© 2026 miniCRM</p>
                </div>
            </SidebarFooter>
        </SidebarContainer>
    );
}