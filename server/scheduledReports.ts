/**
 * Scheduled Reports Service
 * 
 * This module handles the generation and distribution of scheduled weekly reports.
 * Reports are generated every Sunday and sent to configured recipients.
 */

import { generateWeeklyReport } from "./db";
import { notifyOwner } from "./_core/notification";

interface ReportRecipient {
  name: string;
  email: string;
  role: string;
}

// Default recipients for weekly reports
const REPORT_RECIPIENTS: ReportRecipient[] = [
  { name: "Minister's Office", email: "minister@osai.gov.om", role: "minister" },
  { name: "Deputy Chairman", email: "deputy@osai.gov.om", role: "deputy" },
  { name: "Director of Operations", email: "operations@osai.gov.om", role: "director" }
];

/**
 * Format the weekly report as HTML for email
 */
function formatReportAsHtml(report: any): string {
  const categoryLabels: Record<string, string> = {
    financial_corruption: "فساد مالي / Financial Corruption",
    conflict_of_interest: "تضارب المصالح / Conflict of Interest",
    abuse_of_power: "إساءة استخدام السلطة / Abuse of Power",
    tender_violation: "مخالفة قانون المناقصات / Tender Violation",
    administrative_negligence: "إهمال إداري / Administrative Negligence",
    general: "شكوى عامة / General Complaint"
  };

  const startDate = new Date(report.weekStartDate).toLocaleDateString('ar-OM');
  const endDate = new Date(report.weekEndDate).toLocaleDateString('ar-OM');

  const categoryBreakdown = typeof report.categoryBreakdown === 'string' 
    ? JSON.parse(report.categoryBreakdown) 
    : report.categoryBreakdown;

  const topEntities = typeof report.topEntities === 'string'
    ? JSON.parse(report.topEntities)
    : report.topEntities;

  const recommendations = typeof report.recommendations === 'string'
    ? JSON.parse(report.recommendations)
    : report.recommendations;

  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Noto Naskh Arabic', 'Tahoma', Arial, sans-serif;
      background: #0a0a0c;
      color: #f5f5f5;
      padding: 40px;
      direction: rtl;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.03));
      border: 1px solid rgba(255,255,255,.10);
      border-radius: 22px;
      padding: 30px;
    }
    .header {
      text-align: center;
      border-bottom: 1px solid rgba(214,179,106,.30);
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo {
      color: #d6b36a;
      font-size: 32px;
      font-weight: bold;
    }
    .subtitle {
      color: rgba(255,255,255,.70);
      font-size: 14px;
      margin-top: 8px;
    }
    .period {
      background: rgba(214,179,106,.12);
      border: 1px solid rgba(214,179,106,.25);
      border-radius: 12px;
      padding: 12px 20px;
      text-align: center;
      margin-bottom: 30px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-bottom: 30px;
    }
    .stat-box {
      background: rgba(255,255,255,.04);
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 16px;
      padding: 20px;
      text-align: center;
    }
    .stat-value {
      font-size: 28px;
      font-weight: 900;
      color: #d6b36a;
    }
    .stat-value.high { color: #ff6b6b; }
    .stat-value.resolved { color: #4ade80; }
    .stat-label {
      font-size: 12px;
      color: rgba(255,255,255,.70);
      margin-top: 8px;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      font-size: 16px;
      font-weight: bold;
      color: #d6b36a;
      margin-bottom: 15px;
      border-bottom: 1px solid rgba(214,179,106,.20);
      padding-bottom: 8px;
    }
    .category-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid rgba(255,255,255,.06);
    }
    .entity-card {
      background: rgba(255,255,255,.04);
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 12px;
      padding: 15px;
      margin-bottom: 10px;
    }
    .entity-name {
      font-weight: bold;
      margin-bottom: 8px;
    }
    .entity-stats {
      display: flex;
      gap: 20px;
      font-size: 12px;
      color: rgba(255,255,255,.70);
    }
    .recommendation {
      background: rgba(214,179,106,.08);
      border-right: 3px solid #d6b36a;
      padding: 12px 15px;
      margin-bottom: 10px;
      border-radius: 0 8px 8px 0;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid rgba(255,255,255,.06);
      font-size: 12px;
      color: rgba(255,255,255,.50);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">رُزن</div>
      <div class="subtitle">التقرير الأسبوعي للحوكمة والنزاهة</div>
    </div>
    
    <div class="period">
      <strong>الفترة:</strong> ${startDate} - ${endDate}
    </div>
    
    <div class="stats-grid">
      <div class="stat-box">
        <div class="stat-value">${report.totalComplaints}</div>
        <div class="stat-label">إجمالي البلاغات</div>
      </div>
      <div class="stat-box">
        <div class="stat-value high">${report.highRiskCount}</div>
        <div class="stat-label">عالي الخطورة</div>
      </div>
      <div class="stat-box">
        <div class="stat-value resolved">${report.resolvedCount}</div>
        <div class="stat-label">تم الحل</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${report.avgRiskScore}</div>
        <div class="stat-label">متوسط الخطورة</div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">توزيع التصنيفات</div>
      ${Object.entries(categoryBreakdown).map(([cat, count]) => `
        <div class="category-row">
          <span>${categoryLabels[cat] || cat}</span>
          <span><strong>${count}</strong></span>
        </div>
      `).join('')}
    </div>
    
    <div class="section">
      <div class="section-title">أعلى الجهات بلاغات</div>
      ${topEntities.map((entity: any) => `
        <div class="entity-card">
          <div class="entity-name">${entity.entity}</div>
          <div class="entity-stats">
            <span>إجمالي: ${entity.count}</span>
            <span>عالي الخطورة: ${entity.highRisk}</span>
          </div>
        </div>
      `).join('')}
    </div>
    
    <div class="section">
      <div class="section-title">التوصيات</div>
      ${recommendations.map((rec: string) => `
        <div class="recommendation">${rec}</div>
      `).join('')}
    </div>
    
    <div class="footer">
      تم إنشاء هذا التقرير تلقائياً بواسطة نظام رُزن<br>
      مدعوم من أكيوتيريوم تكنولوجيز
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Format the weekly report as plain text
 */
function formatReportAsText(report: any): string {
  const categoryLabels: Record<string, string> = {
    financial_corruption: "فساد مالي",
    conflict_of_interest: "تضارب المصالح",
    abuse_of_power: "إساءة استخدام السلطة",
    tender_violation: "مخالفة قانون المناقصات",
    administrative_negligence: "إهمال إداري",
    general: "شكوى عامة"
  };

  const startDate = new Date(report.weekStartDate).toLocaleDateString('ar-OM');
  const endDate = new Date(report.weekEndDate).toLocaleDateString('ar-OM');

  const categoryBreakdown = typeof report.categoryBreakdown === 'string' 
    ? JSON.parse(report.categoryBreakdown) 
    : report.categoryBreakdown;

  const topEntities = typeof report.topEntities === 'string'
    ? JSON.parse(report.topEntities)
    : report.topEntities;

  const recommendations = typeof report.recommendations === 'string'
    ? JSON.parse(report.recommendations)
    : report.recommendations;

  let text = `
═══════════════════════════════════════════════════════════════
                    رُزن - التقرير الأسبوعي
           الحوكمة والنزاهة والامتثال
═══════════════════════════════════════════════════════════════

الفترة: ${startDate} - ${endDate}

───────────────────────────────────────────────────────────────
                        ملخص الإحصائيات
───────────────────────────────────────────────────────────────
• إجمالي البلاغات: ${report.totalComplaints}
• بلاغات عالية الخطورة: ${report.highRiskCount}
• بلاغات تم حلها: ${report.resolvedCount}
• متوسط درجة الخطورة: ${report.avgRiskScore}/100

───────────────────────────────────────────────────────────────
                      توزيع التصنيفات
───────────────────────────────────────────────────────────────
`;

  Object.entries(categoryBreakdown).forEach(([cat, count]) => {
    text += `• ${categoryLabels[cat] || cat}: ${count}\n`;
  });

  text += `
───────────────────────────────────────────────────────────────
                    أعلى الجهات بلاغات
───────────────────────────────────────────────────────────────
`;

  topEntities.forEach((entity: any) => {
    text += `• ${entity.entity}: ${entity.count} بلاغ (${entity.highRisk} عالي الخطورة)\n`;
  });

  text += `
───────────────────────────────────────────────────────────────
                        التوصيات
───────────────────────────────────────────────────────────────
`;

  recommendations.forEach((rec: string, index: number) => {
    text += `${index + 1}. ${rec}\n`;
  });

  text += `
═══════════════════════════════════════════════════════════════
تم إنشاء هذا التقرير تلقائياً بواسطة نظام رُزن
مدعوم من أكيوتيريوم تكنولوجيز
═══════════════════════════════════════════════════════════════
`;

  return text.trim();
}

/**
 * Send weekly report to all configured recipients
 * This function is designed to be called by a cron job every Sunday
 */
export async function sendWeeklyReportToRecipients(): Promise<{
  success: boolean;
  report: any;
  notificationSent: boolean;
  error?: string;
}> {
  try {
    // Generate the weekly report
    const report = await generateWeeklyReport();
    
    if (!report) {
      return {
        success: false,
        report: null,
        notificationSent: false,
        error: "Failed to generate weekly report"
      };
    }

    // Format report for notification
    const reportText = formatReportAsText(report);
    
    // Send notification to owner
    const notificationSent = await notifyOwner({
      title: `📊 التقرير الأسبوعي لرُزن - ${new Date().toLocaleDateString('ar-OM')}`,
      content: reportText
    });

    console.log(`[ScheduledReports] Weekly report generated and notification ${notificationSent ? 'sent' : 'failed'}`);

    return {
      success: true,
      report,
      notificationSent
    };
  } catch (error) {
    console.error("[ScheduledReports] Error sending weekly report:", error);
    return {
      success: false,
      report: null,
      notificationSent: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Get the HTML version of a report for web display or PDF generation
 */
export function getReportHtml(report: any): string {
  return formatReportAsHtml(report);
}

/**
 * Get the text version of a report for plain text display
 */
export function getReportText(report: any): string {
  return formatReportAsText(report);
}

/**
 * Check if today is Sunday (for cron job validation)
 */
export function isSunday(): boolean {
  return new Date().getDay() === 0;
}

/**
 * Get the next Sunday date
 */
export function getNextSunday(): Date {
  const today = new Date();
  const daysUntilSunday = (7 - today.getDay()) % 7 || 7;
  const nextSunday = new Date(today);
  nextSunday.setDate(today.getDate() + daysUntilSunday);
  nextSunday.setHours(8, 0, 0, 0); // 8 AM
  return nextSunday;
}


/**
 * Auto-refresh configuration
 * This module supports automatic data refresh for keeping statistics up-to-date
 */

interface RefreshConfig {
  enabled: boolean;
  intervalHours: number;
  lastRefresh: Date | null;
  nextRefresh: Date | null;
}

// Default refresh configuration
let refreshConfig: RefreshConfig = {
  enabled: true,
  intervalHours: 168, // Weekly (7 days * 24 hours)
  lastRefresh: null,
  nextRefresh: null
};

/**
 * Get current refresh configuration
 */
export function getRefreshConfig(): RefreshConfig {
  return { ...refreshConfig };
}

/**
 * Update refresh configuration
 */
export function updateRefreshConfig(config: Partial<RefreshConfig>): RefreshConfig {
  refreshConfig = { ...refreshConfig, ...config };
  return refreshConfig;
}

/**
 * Calculate next refresh time based on interval
 */
export function calculateNextRefresh(intervalHours: number = refreshConfig.intervalHours): Date {
  const now = new Date();
  const nextRefresh = new Date(now.getTime() + intervalHours * 60 * 60 * 1000);
  return nextRefresh;
}

/**
 * Check if data refresh is due
 */
export function isRefreshDue(): boolean {
  if (!refreshConfig.enabled) return false;
  if (!refreshConfig.lastRefresh) return true;
  
  const now = new Date();
  const timeSinceLastRefresh = now.getTime() - refreshConfig.lastRefresh.getTime();
  const intervalMs = refreshConfig.intervalHours * 60 * 60 * 1000;
  
  return timeSinceLastRefresh >= intervalMs;
}

/**
 * Record that a refresh has occurred
 */
export function recordRefresh(): void {
  refreshConfig.lastRefresh = new Date();
  refreshConfig.nextRefresh = calculateNextRefresh();
}

/**
 * Get refresh status for display
 */
export function getRefreshStatus(): {
  enabled: boolean;
  lastRefresh: string | null;
  nextRefresh: string | null;
  isDue: boolean;
  intervalHours: number;
} {
  return {
    enabled: refreshConfig.enabled,
    lastRefresh: refreshConfig.lastRefresh?.toISOString() || null,
    nextRefresh: refreshConfig.nextRefresh?.toISOString() || null,
    isDue: isRefreshDue(),
    intervalHours: refreshConfig.intervalHours
  };
}
