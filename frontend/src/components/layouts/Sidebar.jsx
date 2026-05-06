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
    SidebarTrigger,
    useSidebar,
} from '@/components/ui/sidebar';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, LogOut } from 'lucide-react';
import { navigationConfig } from '@/config/navigation.config';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Sidebar() {
    const location = useLocation();
    const { logout } = useAuthStore();
    const { state } = useSidebar(); // Get sidebar state (expanded/collapsed)
    const [openMenus, setOpenMenus] = useState({});

    // Auto-close all menus when sidebar is collapsed
    useEffect(() => {
        if (state === "collapsed") {
            setOpenMenus({});
        }
    }, [state]);

    const toggleMenu = (title) => {
        if (state !== "collapsed") {
            setOpenMenus(prev => ({ ...prev, [title]: !prev[title] }));
        }
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
        <SidebarContainer collapsible="icon" className="border-r border-border/50">
            <SidebarHeader className="flex h-16 items-center justify-end px-4 border-b border-border/50">
                <SidebarTrigger className="hover:bg-accent transition-all duration-200" />
            </SidebarHeader>

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
                                                    className={cn(
                                                        "h-11 w-full justify-between transition-all duration-200",
                                                        isItemActive(item) && "bg-accent text-accent-foreground font-medium"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {item.icon && <item.icon className="h-5 w-5" />}
                                                        <span className="font-medium text-[15px] group-data-[collapsible=icon]:hidden">
                                                            {item.title}
                                                        </span>
                                                    </div>
                                                    <ChevronDown className={cn(
                                                        "h-4 w-4 transition-transform duration-200",
                                                        openMenus[item.title] && "rotate-180",
                                                        "group-data-[collapsible=icon]:hidden"
                                                    )} />
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <SidebarMenu className="ml-6 mt-1 border-l border-border/50 pl-3 space-y-1">
                                                    {item.items.map((subItem) => (
                                                        <SidebarMenuItem key={subItem.title}>
                                                            <NavLink to={subItem.href} className="block">
                                                                <SidebarMenuButton
                                                                    tooltip={subItem.title}
                                                                    className={cn(
                                                                        "h-10 w-full transition-all duration-200",
                                                                        isActive(subItem.href) && "bg-accent/50 text-accent-foreground font-medium"
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
                                        </Collapsible>
                                    ) : (
                                        <NavLink to={item.href} className="block">
                                            <SidebarMenuButton
                                                tooltip={item.title}
                                                className={cn(
                                                    "h-11 w-full transition-all duration-200",
                                                    isActive(item.href) && "bg-accent text-accent-foreground font-medium shadow-sm"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {item.icon && <item.icon className="h-5 w-5" />}
                                                    <span className="font-medium text-[15px] group-data-[collapsible=icon]:hidden">
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

            <SidebarFooter className="border-t border-border/50 p-3">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-11 transition-all duration-200 text-muted-foreground hover:text-red-500 hover:bg-red-50/10 dark:hover:bg-red-950/20"
                    onClick={() => logout()}
                >
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium text-[15px] group-data-[collapsible=icon]:hidden">
                        Logout
                    </span>
                </Button>
            </SidebarFooter>
        </SidebarContainer>
    );
}