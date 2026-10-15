/**
 * MobileBottomNav - Professional Sovereign Mobile Navigation
 * 
 * Features:
 * - Touch-optimized (44px+ touch targets)
 * - Safe area support for notched devices
 * - Haptic feedback
 * - Smooth animations
 * - Professional Arabic typography
 */

import { Link, useLocation } from "wouter";
import {
  Home,
  ClipboardList,
  BarChart3,
  Scale,
  Settings,
  MoreHorizontal,
  Search,
  Bell,
  User,
} from "lucide-react";
import { useState } from "react";

interface MobileBottomNavProps {
  language: "arabic" | "english";
  isAdmin?: boolean;
}

const NAV_ITEMS = {
  arabic: {
    home: "الرئيسية",
    operations: "العمليات",
    analytics: "التحليلات",
    caseLaw: "السوابق",
    more: "المزيد",
    admin: "المشرف",
    search: "بحث",
    notifications: "إشعارات",
    profile: "الملف",
  },
  english: {
    home: "Home",
    operations: "Operations",
    analytics: "Analytics",
    caseLaw: "Case Law",
    more: "More",
    admin: "Admin",
    search: "Search",
    notifications: "Alerts",
    profile: "Profile",
  },
};

export default function MobileBottomNav({ language, isAdmin }: MobileBottomNavProps) {
  const [location] = useLocation();
  const [showMore, setShowMore] = useState(false);
  const text = NAV_ITEMS[language];
  const isRTL = language === "arabic";

  // Haptic feedback helper
  const triggerHaptic = (type: "light" | "medium" | "heavy" = "light") => {
    if ("vibrate" in navigator) {
      const durations = { light: 10, medium: 20, heavy: 30 };
      navigator.vibrate(durations[type]);
    }
  };

  // Primary nav items (4 main + more)
  const primaryItems = [
    { href: "/", icon: Home, label: text.home },
    { href: "/operations", icon: ClipboardList, label: text.operations },
    { href: "/analytics", icon: BarChart3, label: text.analytics },
    { href: "/case-law", icon: Scale, label: text.caseLaw },
  ];

  // More menu items
  const moreItems = [
    { href: "/knowledge-base", label: language === "arabic" ? "قاعدة المعرفة" : "Knowledge Base" },
    { href: "/complaint-registry", label: language === "arabic" ? "سجل البلاغات" : "Registry" },
    { href: "/entity-map", label: language === "arabic" ? "خريطة الجهات" : "Entity Map" },
    { href: "/comparative-analysis", label: language === "arabic" ? "التحليل المقارن" : "Analysis" },
    ...(isAdmin ? [{ href: "/admin", label: text.admin }] : []),
  ];

  const handleNavClick = () => {
    triggerHaptic("light");
    setShowMore(false);
  };

  const handleMoreClick = () => {
    triggerHaptic("medium");
    setShowMore(!showMore);
  };

  return (
    <>
      {/* More Menu Overlay */}
      {showMore && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setShowMore(false)}
        />
      )}

      {/* More Menu Panel */}
      {showMore && (
        <div
          className={`fixed bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] ${isRTL ? "right-4 left-4" : "left-4 right-4"} z-50 md:hidden`}
        >
          <div className="bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-2 space-y-1">
              {moreItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <button
                      onClick={handleNavClick}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-ui text-sm ${
                        isActive
                          ? "bg-primary/15 text-primary"
                          : "text-white/80 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className={isRTL ? "text-right" : "text-left"}>{item.label}</span>
                    </button>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-black/90 backdrop-blur-xl border-t border-white/8 transition-transform duration-300"
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div className="flex items-center justify-around h-16 px-1">
          {primaryItems.map((item) => {
            const isActive =
              location === item.href ||
              (item.href !== "/" && location.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <button
                  onClick={handleNavClick}
                  className={`
                    flex flex-col items-center justify-center
                    gap-0.5 px-3 py-2
                    rounded-xl
                    transition-all duration-200
                    min-w-[64px] min-h-[52px]
                    ${
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-white/50 hover:text-white/80 active:bg-white/5"
                    }
                  `}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                >
                  <div
                    className={`
                      relative p-1.5 rounded-lg
                      transition-all duration-200
                      ${isActive ? "bg-primary/15" : ""}
                    `}
                  >
                    <Icon
                      className={`w-5 h-5 transition-transform duration-200 ${
                        isActive ? "scale-110" : ""
                      }`}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    {isActive && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                    )}
                  </div>
                  <span
                    className={`
                      text-[10px] font-medium font-ui
                      transition-all duration-200
                      ${isActive ? "text-primary opacity-100" : "opacity-70"}
                    `}
                  >
                    {item.label}
                  </span>
                </button>
              </Link>
            );
          })}

          {/* More Button */}
          <button
            onClick={handleMoreClick}
            className={`
              flex flex-col items-center justify-center
              gap-0.5 px-3 py-2
              rounded-xl
              transition-all duration-200
              min-w-[64px] min-h-[52px]
              ${
                showMore
                  ? "text-primary bg-primary/10"
                  : "text-white/50 hover:text-white/80 active:bg-white/5"
              }
            `}
            aria-label={text.more}
            aria-expanded={showMore}
          >
            <div
              className={`
                relative p-1.5 rounded-lg
                transition-all duration-200
                ${showMore ? "bg-primary/15" : ""}
              `}
            >
              <MoreHorizontal
                className={`w-5 h-5 transition-transform duration-200 ${
                  showMore ? "rotate-90" : ""
                }`}
                strokeWidth={showMore ? 2.5 : 2}
              />
            </div>
            <span
              className={`
                text-[10px] font-medium font-ui
                transition-all duration-200
                ${showMore ? "text-primary opacity-100" : "opacity-70"}
              `}
            >
              {text.more}
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
