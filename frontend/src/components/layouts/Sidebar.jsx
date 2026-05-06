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
} from '@/components/ui/sidebar';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Settings, LogOut } from 'lucide-react';
import { navigationConfig } from '@/config/navigation.config';
import { useState } from 'react';
import { useAuthStore } from '@/stores';
import { Button } from '@/components/ui/button';

export function Sidebar() {
    const location = useLocation();
    const { logout } = useAuthStore();
    const [openMenus, setOpenMenus] = useState({});

    const toggleMenu = (title) => {
        setOpenMenus(prev => ({ ...prev, [title]: !prev[title] }));
    };

    const isActive = (href) => {
        if (href === '/dashboard') {
            return location.pathname === href;
        }
        return location.pathname.startsWith(href);
    };

    const isItemActive = (item) => {
        if (item.href) {
            return isActive(item.href);
        }
        if (item.items) {
            return item.items.some(subItem => isActive(subItem.href));
        }
        return false;
    };

    return (
        <SidebarContainer className="border-r">
            <SidebarHeader className="border-b px-6 py-4">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground font-bold">MS</span>
                    </div>
                    <span className="font-semibold text-lg">MySaaS</span>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
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
                                                    className={`w-full justify-between ${isItemActive(item) ? 'bg-accent text-accent-foreground' : ''}`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {item.icon && <item.icon className="h-4 w-4" />}
                                                        <span>{item.title}</span>
                                                    </div>
                                                    {openMenus[item.title] ? (
                                                        <ChevronDown className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronRight className="h-4 w-4" />
                                                    )}
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <SidebarMenu className="ml-6 mt-1">
                                                    {item.items.map((subItem) => (
                                                        <SidebarMenuItem key={subItem.title}>
                                                            <NavLink to={subItem.href} className="block">
                                                                <SidebarMenuButton
                                                                    className={`w-full ${isActive(subItem.href) ? 'bg-accent text-accent-foreground' : ''}`}
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        {subItem.icon && <subItem.icon className="h-3 w-3" />}
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
                                                className={`w-full ${isActive(item.href) ? 'bg-accent text-accent-foreground' : ''}`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {item.icon && <item.icon className="h-4 w-4" />}
                                                    <span>{item.title}</span>
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

            <SidebarFooter className="border-t p-4">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                    onClick={() => logout()}
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
            </SidebarFooter>
        </SidebarContainer>
    );
}