import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  Shield,
  Scale,
  FileText,
  BookOpen,
  History,
  Building2,
  BarChart3,
  ClipboardList,
  Sparkles,
  Globe,
  User,
  LogOut,
  ChevronDown
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

interface SovereignHeaderProps {
  title: string;
  subtitle: string;
  language: "arabic" | "english";
  onToggleLanguage?: () => void;
  actions?: ReactNode;
  activeSuite?:
    | "chat"
    | "operations"
    | "ria"
    | "registry"
    | "entityMap"
    | "knowledge"
    | "caseLaw"
    | "analytics"
    | "admin";
}

export default function SovereignHeader({
  title,
  subtitle,
  language = "arabic",
  onToggleLanguage,
  actions,
  activeSuite
}: SovereignHeaderProps) {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const isRTL = language === "arabic";

  const SUITE_ITEMS = [
    {
      id: "chat",
      path: "/",
      labelAr: "المستشار القانوني",
      labelEn: "Legal Counsel",
      icon: Scale,
      match: location === "/" || location === "/home"
    },
    {
      id: "operations",
      path: "/operations",
      labelAr: "مركز العمليات",
      labelEn: "Operations Center",
      icon: ClipboardList,
      match: location.startsWith("/operations"),
      badge: "الفرز الذكي"
    },
    {
      id: "ria",
      path: "/ria-dashboard",
      labelAr: "تقييم الأثر (RIA)",
      labelEn: "RIA Impact",
      icon: Shield,
      match: location.startsWith("/ria"),
      badge: "رؤية 2040"
    },
    {
      id: "registry",
      path: "/complaint-registry",
      labelAr: "سجل البلاغات",
      labelEn: "Case Registry",
      icon: FileText,
      match: location.startsWith("/complaint-registry")
    },
    {
      id: "entityMap",
      path: "/entity-map",
      labelAr: "خريطة الجهات",
      labelEn: "Entity Map",
      icon: Building2,
      match: location.startsWith("/entity-map")
    },
    {
      id: "knowledge",
      path: "/knowledge-base",
      labelAr: "المكتبة التشريعية",
      labelEn: "Statutory Corpus",
      icon: BookOpen,
      match: location.startsWith("/knowledge-base") || location.startsWith("/knowledge"),
      badge: "6,007 مادة"
    },
    {
      id: "caseLaw",
      path: "/case-law",
      labelAr: "السوابق القضائية",
      labelEn: "Case Law",
      icon: History,
      match: location.startsWith("/case-law")
    },
    {
      id: "analytics",
      path: "/analytics",
      labelAr: "التحليلات والمقارنة",
      labelEn: "Analytics",
      icon: BarChart3,
      match: location.startsWith("/analytics") || location.startsWith("/comparative-analysis")
    }
  ];

  return (
    <header className="border-b border-[rgba(214,179,106,0.18)] bg-black/55 backdrop-blur-xl sticky top-0 z-50 shadow-deep print:hidden">
      <div className="container max-w-7xl mx-auto px-4 py-3">
        {/* Top Deck: Brand + Title + Status Badges + Global Actions */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-2.5">
          {/* Brand & Titles */}
          <div className="flex items-center gap-3">
            <Link href="/">
              <div className="flex items-center gap-2.5 cursor-pointer group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[rgba(214,179,106,0.35)] to-[rgba(255,255,255,0.03)] border border-[rgba(214,179,106,0.35)] flex items-center justify-center shadow-lg group-hover:border-[rgba(214,179,106,0.6)] transition-all">
                  <span className="font-heading font-extrabold text-[rgba(214,179,106,0.98)] text-base">رُزن</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-extrabold text-sm tracking-wide text-white/95 group-hover:text-[rgba(214,179,106,0.98)] transition-colors">
                      {language === "arabic" ? "رُزن السيادية" : "Ruzn.legal"}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[rgba(214,179,106,0.15)] border border-[rgba(214,179,106,0.3)] text-[rgba(214,179,106,0.95)] font-mono">
                      v3.0 Sovereign
                    </span>
                  </div>
                  <h1 className="text-sm md:text-base font-heading font-bold text-gold-gradient truncate max-w-[280px] sm:max-w-md">
                    {title}
                  </h1>
                </div>
              </div>
            </Link>
          </div>

          {/* Status Badges & Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Sovereign Runtime Pills */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/70">
              <span className="flex items-center gap-1.5 text-[rgba(214,179,106,0.95)] font-semibold">
                <Shield className="w-3.5 h-3.5" />
                {language === "arabic" ? "عرض محلي سيادي" : "Sovereign Mode"}
              </span>
              <span className="text-white/30">•</span>
              <span className="text-emerald-400 font-mono text-[11px]">Q-ARC: Active</span>
              <span className="text-white/30">•</span>
              <span className="text-cyan-400 font-mono text-[11px]">Q-ENC: 5-D</span>
            </div>

            {/* Custom Page Actions */}
            {actions}

            {/* Language Toggle */}
            {onToggleLanguage && (
              <button
                onClick={onToggleLanguage}
                className="ruzn-btn text-xs px-2.5 py-1.5 gap-1 text-white/80 hover:text-white"
                title={language === "arabic" ? "Switch to English" : "التبديل إلى العربية"}
              >
                <Globe className="w-3.5 h-3.5 text-[rgba(214,179,106,0.9)]" />
                <span>{language === "arabic" ? "EN" : "عربي"}</span>
              </button>
            )}

            {/* User Session Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-xs">
              <User className="w-3.5 h-3.5 text-[rgba(214,179,106,0.95)]" />
              <span className="text-white/80 font-medium hidden sm:inline">
                {user?.name || (language === "arabic" ? "معالي الوزير / الإدارة" : "Sovereign Chairman")}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Deck: Sovereign Suite Horizontal Navigation Bar */}
        <nav className="pt-2 border-t border-[rgba(214,179,106,0.12)] overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1.5 min-w-max pb-1">
            {SUITE_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeSuite ? activeSuite === item.id : item.match;

              return (
                <Link key={item.id} href={item.path}>
                  <button
                    className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 whitespace-nowrap border ${
                      isActive
                        ? "bg-gradient-to-r from-[rgba(214,179,106,0.25)] to-[rgba(184,146,77,0.15)] border-[rgba(214,179,106,0.5)] text-[rgba(214,179,106,0.98)] font-bold shadow-[0_0_15px_rgba(214,179,106,0.15)]"
                        : "bg-white/[0.03] border-white/[0.08] text-white/70 hover:text-white hover:bg-white/[0.07] hover:border-[rgba(214,179,106,0.25)]"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[rgba(214,179,106,0.98)]" : "text-white/60"}`} />
                    <span>{language === "arabic" ? item.labelAr : item.labelEn}</span>
                    {item.badge && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? "bg-[rgba(214,179,106,0.3)] text-white font-bold"
                          : "bg-white/10 text-white/60"
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}
