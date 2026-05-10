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
import { useState, useEffect } from 'react';
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

    // Auto close menus when collapsed
    useEffect(() => {
        if (state === "collapsed") {
            setOpenMenus({});
        }
    }, [state]);

    // Auto-open parent menu if child is active
    useEffect(() => {
        navigationConfig.mainNav.forEach((item) => {
            if (item.items && item.items.some(subItem => isItemActive(subItem))) {
                setOpenMenus(prev => ({ ...prev, [item.title]: true }));
            }
        });
    }, [location.pathname]);

    const toggleMenu = (title) => {
        if (state !== "collapsed") {
            setOpenMenus(prev => ({
                ...prev,
                [title]: !prev[title]
            }));
        }
    };

    const isActive = (item) => {
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

        // For non-organization nested routes
        if (location.pathname === item.href) return true;

        // Check if current path is a direct child of this item's href
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

    const isCollapsed = state === "collapsed";

    const handleNavClick = () => {
        if (isCollapsed) {
            toggleSidebar();
        }
    };

    return (
        <SidebarContainer
            collapsible="icon"
            className="border-r border-border/50"
            style={{
                '--sidebar-width-icon': '3rem',
                '--sidebar-width': '16rem'
            }}
        >
            {/* Header */}
            <SidebarHeader
                className={cn(
                    "flex h-16 items-center border-b border-border/50 px-4",
                    isCollapsed ? "justify-center" : "justify-end"
                )}
            >
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={toggleSidebar}
                                className={cn(
                                    "flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent transition-all duration-200",
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
                        <SidebarMenu className="gap-1.5">
                            {navigationConfig.mainNav.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    {item.items && item.items.length > 0 ? (
                                        <Collapsible
                                            open={openMenus[item.title]}
                                            onOpenChange={() => toggleMenu(item.title)}
                                            className="w-full"
                                        >
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton
                                                    tooltip={item.title}
                                                    onClick={handleNavClick}
                                                    className={cn(
                                                        "h-11 w-full justify-between transition-all duration-200",
                                                        isItemActive(item) &&
                                                        "bg-accent text-accent-foreground font-medium"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {item.icon && <item.icon className="h-5 w-5" />}
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
                                                                "h-4 w-4 transition-transform duration-200",
                                                                openMenus[item.title] && "rotate-90"
                                                            )}
                                                        />
                                                    )}
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>
                                            {!isCollapsed && (
                                                <CollapsibleContent>
                                                    <SidebarMenu className="ml-6 mt-1 border-l border-border/50 pl-3 space-y-1">
                                                        {item.items.map((subItem) => (
                                                            <SidebarMenuItem key={subItem.title}>
                                                                <NavLink to={subItem.href} className="block">
                                                                    <SidebarMenuButton
                                                                        tooltip={subItem.title}
                                                                        className={cn(
                                                                            "h-10 w-full transition-all duration-200",
                                                                            isActive(subItem) &&
                                                                            "bg-accent/50 text-accent-foreground font-medium"
                                                                        )}
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            {subItem.icon && <subItem.icon className="h-4 w-4" />}
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
                                        <NavLink to={item.href} className="block">
                                            <SidebarMenuButton
                                                tooltip={item.title}
                                                onClick={handleNavClick}
                                                className={cn(
                                                    "h-11 w-full transition-all duration-200",
                                                    isActive(item) &&
                                                    "bg-accent text-accent-foreground font-medium shadow-sm"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {item.icon && <item.icon className="h-5 w-5" />}
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
            <SidebarFooter className="border-t border-border/50 p-3">
                <div className={cn(
                    "text-xs text-muted-foreground",
                    isCollapsed && "hidden"
                )}>
                    <p>© 2026 miniCRM</p>
                </div>
            </SidebarFooter>
        </SidebarContainer>
    );
}