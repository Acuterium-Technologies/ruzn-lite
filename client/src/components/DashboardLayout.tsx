import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { 
  LayoutDashboard, 
  LogOut, 
  PanelLeft, 
  Users, 
  Scale, 
  FileText, 
  BookOpen, 
  History, 
  Map, 
  TrendingUp, 
  ClipboardList, 
  BarChart3, 
  Shield, 
  Settings, 
  Globe 
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";

const menuItems = [
  { icon: LayoutDashboard, label: "الرئيسية (المساعد)", path: "/" },
  { icon: Scale, label: "تقييم الأثر التنظيمي (RIA)", path: "/ria-dashboard" },
  { icon: FileText, label: "سجل البلاغات", path: "/complaint-registry" },
  { icon: BookOpen, label: "قاعدة المعرفة السيادية", path: "/knowledge-base" },
  { icon: History, label: "السوابق القضائية", path: "/case-law" },
  { icon: Map, label: "خريطة الكيانات", path: "/entity-map" },
  { icon: TrendingUp, label: "التحليل المقارن", path: "/comparative-analysis" },
  { icon: ClipboardList, label: "العمليات التنفيذية", path: "/operations" },
  { icon: BarChart3, label: "لوحة التحليلات", path: "/analytics" },
  { icon: Shield, label: "إدارة الوصول", path: "/access-management" },
  { icon: Settings, label: "لوحة التحكم", path: "/admin" },
  { icon: Globe, label: "الموقع التعريفي (Landing)", path: "/landing" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

export default function DashboardLayout({
  children,
  defaultCollapsed = false,
}: {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />
  }

  const effectiveUser = user || {
    id: 1,
    name: "مقيم سيادي (عرض معتمد)",
    email: "chairman@ruzn.legal",
    role: "admin"
  };

  return (
    <SidebarProvider
      defaultOpen={!defaultCollapsed}
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const effectiveUser = user || {
    id: 1,
    name: "مقيم سيادي (عرض معتمد)",
    email: "chairman@ruzn.legal",
    role: "admin"
  };
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = menuItems.find(item => item.path === location);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r-0"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 justify-center">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              {!isCollapsed ? (
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src="/ruzn-logo-v-1-TRANS.png"
                    alt="Ruzn Sovereign Emblem"
                    className="h-7 w-7 object-contain drop-shadow-[0_0_8px_rgba(214,179,106,0.35)] shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-sm text-primary tracking-wide font-arabic-heading truncate">
                      رُزن السيادية
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest -mt-0.5 truncate">
                      RUZN.LEGAL
                    </span>
                  </div>
                </div>
              ) : (
                <img
                  src="/ruzn-logo-v-1-TRANS.png"
                  alt="Ruzn Sovereign Emblem"
                  className="h-6 w-6 object-contain drop-shadow-[0_0_6px_rgba(214,179,106,0.35)] mx-auto"
                />
              )}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0">
            <SidebarMenu className="px-2 py-1">
              {menuItems.map(item => {
                const isActive = location === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setLocation(item.path)}
                      tooltip={item.label}
                      className={`h-10 transition-all font-normal`}
                    >
                      <item.icon
                        className={`h-4 w-4 ${isActive ? "text-primary" : ""}`}
                      />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-accent/50 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-9 w-9 border shrink-0">
                    <AvatarFallback className="text-xs font-medium">
                      {(effectiveUser.name || "R").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium truncate leading-none">
                      {effectiveUser.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-1.5">
                      {effectiveUser.email}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset 
        className="min-h-screen"
        style={{
          background: 'radial-gradient(1200px 600px at 60% 18%, rgba(214,179,106,.15), transparent 55%), radial-gradient(900px 500px at 20% 80%, rgba(96,165,250,.09), transparent 60%), linear-gradient(180deg, #050506, #0a0a0c)'
        }}
      >
        {isMobile && (
          <div className="flex border-b border-white/10 h-14 items-center justify-between bg-black/40 px-3 backdrop-blur-md sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-lg ruzn-btn p-1.5" />
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <span className="tracking-tight text-white font-semibold">
                    {activeMenuItem?.label ?? "Menu"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        <main className="flex-1 p-3 sm:p-4 md:p-6">{children}</main>
      </SidebarInset>
    </>
  );
}
