import {
  Home,
  Users,
  Package,
  ClipboardList,
  History,
  ShieldAlert,
  Hammer,
  ShoppingCart,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Members",
    url: "/members",
    icon: Users,
  },
  {
    title: "Resources & Inventory",
    url: "/resources",
    icon: Package,
  },
  {
    title: "Tasks",
    url: "/tasks",
    icon: ClipboardList,
  },
  {
    title: "Task History",
    url: "/task-history",
    icon: History,
  },
  {
    title: "Strikes",
    url: "/strikes",
    icon: ShieldAlert,
  },
  {
    title: "Crafting",
    url: "/crafting",
    icon: Hammer,
  },
  {
    title: "Orders",
    url: "/orders",
    icon: ShoppingCart,
  },
];

export function AppSidebar() {
  const [location, setLocation] = useLocation();
  const { isGuest, isAdmin, signOut, appUser } = useAuth();

  return (
    <Sidebar>
      <SidebarContent>
        <div className="p-6">
          <h1 className="font-heading text-2xl font-bold text-sidebar-primary">
            Ballas Fund
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Manager</p>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <a href={item.url} onClick={(e) => {
                      e.preventDefault();
                      setLocation(item.url);
                    }}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex flex-col gap-3">
          {!isGuest && appUser && (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-sidebar-primary flex items-center justify-center">
                <span className="text-xs font-medium text-sidebar-primary-foreground">
                  {appUser.display_name?.[0] || appUser.email[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {appUser.display_name || appUser.email}
                </p>
                <Badge variant={isAdmin ? "default" : "secondary"} className="text-xs mt-1">
                  {isAdmin ? 'Admin' : 'Member'}
                </Badge>
              </div>
            </div>
          )}
          {isGuest && (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Guest Mode</p>
                <Badge variant="outline" className="text-xs mt-1">
                  Read Only
                </Badge>
              </div>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={signOut}
            className="w-full"
            data-testid="button-sign-out"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
