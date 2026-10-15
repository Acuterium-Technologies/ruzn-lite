/**
 * PageWrapper - Consistent Page Layout Component
 * 
 * Provides:
 * - Consistent header with back navigation
 * - Proper spacing for mobile bottom nav
 * - Safe area handling
 * - Professional typography
 * - Responsive design
 * 
 * Usage:
 * <PageWrapper
 *   title="التحليلات"
 *   subtitle="لوحة التحكم والمؤشرات"
 *   language="arabic"
 *   showBack
 *   rightAction={<Button>Export</Button>}
 * >
 *   {children}
 * </PageWrapper>
 */

import { ReactNode } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, ArrowRight, ChevronRight, ChevronLeft } from "lucide-react";
import MobileBottomNav from "./MobileBottomNav";
import { useIsMobile } from "@/hooks/useMobile";

interface PageWrapperProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  language?: "arabic" | "english";
  showBack?: boolean;
  backHref?: string;
  rightAction?: ReactNode;
  showMobileNav?: boolean;
  isAdmin?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  noPadding?: boolean;
}

export default function PageWrapper({
  children,
  title,
  subtitle,
  language = "arabic",
  showBack = false,
  backHref,
  rightAction,
  showMobileNav = true,
  isAdmin = false,
  className = "",
  headerClassName = "",
  contentClassName = "",
  noPadding = false,
}: PageWrapperProps) {
  const [location, setLocation] = useLocation();
  const isMobile = useIsMobile();
  const isRTL = language === "arabic";

  const handleBack = () => {
    if (backHref) {
      setLocation(backHref);
    } else {
      window.history.back();
    }
  };

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const BreadcrumbIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div
      className={`page-wrapper ${className}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Header */}
      {title && (
        <header className={`page-header ${headerClassName}`}>
          <div className="flex items-center justify-between gap-3">
            {/* Left/Right side (depends on RTL) */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Back Button */}
              {showBack && (
                <button
                  onClick={handleBack}
                  className="
                    flex items-center justify-center
                    w-10 h-10 rounded-xl
                    bg-white/5 hover:bg-white/10
                    text-white/70 hover:text-white
                    transition-all duration-200
                    shrink-0
                    touch-target
                  "
                  aria-label={isRTL ? "رجوع" : "Back"}
                >
                  <BackIcon className="w-5 h-5" />
                </button>
              )}

              {/* Title & Subtitle */}
              <div className="min-w-0 flex-1">
                <h1 className="page-title truncate">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-muted-foreground truncate mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Right Action */}
            {rightAction && (
              <div className="shrink-0">{rightAction}</div>
            )}
          </div>
        </header>
      )}

      {/* Main Content */}
      <main
        className={`
          page-content
          ${noPadding ? "!p-0" : ""}
          ${showMobileNav && isMobile ? "has-mobile-nav" : ""}
          ${contentClassName}
        `}
      >
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      {showMobileNav && isMobile && (
        <MobileBottomNav language={language} isAdmin={isAdmin} />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Sub-components for flexible composition
   ═══════════════════════════════════════════════════════════════════════════════ */

interface PageSectionProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function PageSection({
  children,
  title,
  subtitle,
  action,
  className = "",
}: PageSectionProps) {
  return (
    <section className={`mb-6 ${className}`}>
      {(title || action) && (
        <div className="section-header">
          <div>
            {title && <h2 className="section-title">{title}</h2>}
            {subtitle && <p className="section-subtitle">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

interface PageGridProps {
  children: ReactNode;
  cols?: 2 | 3 | 4;
  className?: string;
}

export function PageGrid({ children, cols = 2, className = "" }: PageGridProps) {
  const colsClass = {
    2: "ruzn-grid-2",
    3: "ruzn-grid-3",
    4: "ruzn-grid-4",
  };

  return (
    <div className={`ruzn-grid ${colsClass[cols]} ${className}`}>
      {children}
    </div>
  );
}

interface PageCardProps {
  children: ReactNode;
  title?: string;
  action?: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function PageCard({
  children,
  title,
  action,
  className = "",
  noPadding = false,
}: PageCardProps) {
  return (
    <div className={`ruzn-card ${className}`}>
      {(title || action) && (
        <div className="ruzn-card-header">
          {title && <h3 className="ruzn-card-title">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={noPadding ? "" : "ruzn-card-body"}>{children}</div>
    </div>
  );
}

interface PageKPIProps {
  value: string | number;
  label: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

export function PageKPI({
  value,
  label,
  trend,
  trendValue,
  className = "",
}: PageKPIProps) {
  const trendColors = {
    up: "text-green-400",
    down: "text-red-400",
    neutral: "text-muted-foreground",
  };

  return (
    <div className={`ruzn-kpi ${className}`}>
      <div className="ruzn-kpi-value">{value}</div>
      <div className="ruzn-kpi-label">{label}</div>
      {trend && trendValue && (
        <div className={`text-xs mt-1 ${trendColors[trend]}`}>
          {trend === "up" && "↑"}
          {trend === "down" && "↓"}
          {trendValue}
        </div>
      )}
    </div>
  );
}

interface PageEmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function PageEmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: PageEmptyStateProps) {
  return (
    <div
      className={`
        flex flex-col items-center justify-center
        py-12 px-6 text-center
        ${className}
      `}
    >
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
