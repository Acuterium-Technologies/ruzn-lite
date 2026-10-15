import { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import SovereignHeader from "@/components/SovereignHeader";
import {
  ArrowLeft,
  FileText,
  ListFilter,
  Map,
  Code,
  AlertTriangle,
  Shield,
  Clock,
  Building2,
  Users,
  Send,
  Download,
  RefreshCw,
  Printer,
  Sparkles,
  CheckCircle2,
  Check,
  Copy,
  ChevronRight,
  TrendingUp,
  FileCheck2,
  FileSpreadsheet,
  Compass
} from "lucide-react";

type Language = "arabic" | "english";
type TabId = "intake" | "triage" | "entity" | "schemas";
type RiskLevel = "all" | "high" | "medium" | "low";
type ComplaintStatus = "new" | "investigating" | "closed";

interface Complaint {
  id: number;
  channel: string;
  complainantType: string;
  entity: string;
  governorate: string;
  topic: string;
  amount: number | null;
  text: string;
  riskScore: number;
  status: ComplaintStatus;
  createdAt: string;
  category: string;
  referral?: string;
  legalBasis?: string;
}

interface EntityStats {
  name: string;
  totalComplaints: number;
  highRisk: number;
  avgRiskScore: number;
  topCategory: string;
}

const UI_TEXT = {
  arabic: {
    title: "مركز العمليات",
    subtitle: "إدارة البلاغات • تقييم المخاطر • تقرير معالي الوزير • سيادة البيانات",
    backToChat: "العودة للمحادثة",
    statusBadge: "نظام تشغيلي سيادي",
    qarcStatus: "Q-ARC: مفعّل",
    qencStatus: "Q-ENC: مفعّل",
    auditStatus: "أثر تدقيقي: مفعّل",
    seedBtn: "تحميل حالات مرجعية",
    resetBtn: "إعادة تعيين العرض",
    printBtn: "طباعة التقرير اليومي",
    exportBtn: "تصدير JSON",
    tabs: {
      intake: "استقبال البلاغات",
      triage: "قائمة الفرز",
      entity: "خريطة الجهات",
      schemas: "المخططات"
    },
    intake: {
      cardTitle: "عمليات رُزن لايت",
      cardMeta: "استقبال • فرز • تحقيق • متابعة",
      title: "نموذج استقبال بلاغ جديد",
      channel: "قناة البلاغ",
      complainantType: "صفة المُبلّغ",
      entity: "الجهة (وزارة / هيئة / شركة)",
      governorate: "المحافظة",
      topic: "الموضوع (اختياري)",
      amount: "المبلغ التقديري (ر.ع.) إن وجد",
      text: "تفاصيل ونَص البلاغ",
      submit: "إرسال + فرز ذكي (Q-ARC)",
      sample: "تعبئة حالة مرجعية",
      reset: "مسح النموذج",
      hintKeywords: "كلمات مفتاحية سريعة:",
      channels: ["التطبيق الذكي", "واتساب", "الخط الساخن", "البريد الإلكتروني", "حضور شخصي", "بريد عادي"],
      complainantTypes: ["مواطن", "موظف حكومي", "مورد / مقاول", "مجهول"],
      governorates: ["مسقط", "ظفار", "شمال الباطنة", "جنوب الباطنة", "الداخلية", "شمال الشرقية", "جنوب الشرقية", "الظاهرة", "الوسطى", "مسندم", "البريمي"],
      keywords: ["مناقصة", "ترسية", "تضارب مصالح", "رشوة", "عمولة", "اختلاس", "تزوير", "محاباة", "إهمال إداري"]
    },
    triagePreview: {
      title: "مخرجات الفرز الهيكلي لـ Q-ARC",
      note: "مخرجات الفرز الهيكلي لـ Q-ARC: دعم قرار تشريعي سيادي — كل خطوة موثقة وقابلة للتدقيق الكامل.",
      category: "التصنيف المقترح",
      riskScore: "مؤشر الخطورة",
      referral: "جهة الإحالة المقترحة",
      legalBasis: "الأساس التشريعي المرجعي"
    },
    triage: {
      title: "قائمة البلاغات للفرز والمتابعة",
      filter: "تصفية حسب الخطورة",
      all: "الكل",
      high: "عالي الخطورة",
      medium: "متوسط الخطورة",
      low: "منخفض الخطورة",
      noComplaints: "لا توجد بلاغات تطابق الفلتر المحدد",
      status: {
        new: "جديد",
        investigating: "قيد التحقيق",
        closed: "مغلق"
      }
    },
    kpi: {
      total: "إجمالي البلاغات",
      financial: "شبهات فساد مالي",
      conflict: "تضارب مصالح",
      highRisk: "مخاطر عالية"
    },
    dailyReport: {
      title: "الموجز التنفيذي لمعالي الوزير",
      subtitle: "تقرير الرقابة والنزاهة المؤسسية اليومي",
      dateLabel: "التاريخ",
      summary: "ملخص الموقف التنفيذي: تم رصد تركيز في بلاغات المشتريات والمناقصات الحكومية مع ارتفاع مؤشرات تضارب المصالح في العقود الخدمية. يوصى بتفعيل التدقيق المالي الميداني وتدقيق سجلات الموردين.",
      topHotspots: "أبرز بؤر المخاطر المؤسسية",
      printAction: "طباعة التقرير / تصدير PDF"
    },
    entity: {
      title: "خريطة استخبارات الجهات",
      subtitle: "تجميع البلاغات حسب الجهة مع مؤشرات تركيز المخاطر",
      totalComplaints: "إجمالي البلاغات",
      highRisk: "عالي الخطورة",
      avgRisk: "متوسط المخاطر",
      topCategory: "التصنيف الأكثر تكراراً"
    },
    schemas: {
      title: "مخططات البيانات المعيارية",
      complaintSchema: "مخطط البلاغ (Complaint Schema)",
      reportSchema: "مخطط التقرير اليومي (Minister Report Schema)",
      copySuccess: "تم نسخ المخطط إلى الحافظة"
    },
    categories: {
      financial_corruption: "فساد مالي / اختلاس",
      conflict_of_interest: "تضارب مصالح",
      abuse_of_power: "إساءة استخدام السلطة",
      tender_violation: "مخالفة قانون المناقصات",
      administrative_negligence: "إهمال إداري",
      general: "شكوى عامة"
    }
  },
  english: {
    title: "Operations Center",
    subtitle: "Complaints Intelligence • Risk Scoring • Leadership Briefs • Sovereign Data",
    backToChat: "Back to Chat",
    statusBadge: "Sovereign Operational System",
    qarcStatus: "Q-ARC: Active",
    qencStatus: "Q-ENC: Active",
    auditStatus: "Audit Trail: Enabled",
    seedBtn: "Load Reference Cases",
    resetBtn: "Reset View",
    printBtn: "Print Daily Brief",
    exportBtn: "Export JSON",
    tabs: {
      intake: "Complaint Intake",
      triage: "Triage Queue",
      entity: "Entity Map",
      schemas: "Schemas"
    },
    intake: {
      cardTitle: "RUZN-Lite Operations",
      cardMeta: "Intake • Triage • Investigation • Audit",
      title: "New Complaint Intake Form",
      channel: "Intake Channel",
      complainantType: "Complainant Type",
      entity: "Entity (Ministry / SOE / Dept)",
      governorate: "Governorate",
      topic: "Topic (Optional)",
      amount: "Estimated Amount (OMR) if any",
      text: "Complaint Narrative & Evidence",
      submit: "Submit + Q-ARC Triage",
      sample: "Load Reference Case",
      reset: "Clear Form",
      hintKeywords: "Quick Keywords:",
      channels: ["Mobile App", "WhatsApp", "Hotline", "Email", "Walk-in", "Regular Mail"],
      complainantTypes: ["Citizen", "Civil Servant", "Vendor / Contractor", "Anonymous"],
      governorates: ["Muscat", "Dhofar", "North Al Batinah", "South Al Batinah", "Ad Dakhiliyah", "North Ash Sharqiyah", "South Ash Sharqiyah", "Ad Dhahirah", "Al Wusta", "Musandam", "Al Buraimi"],
      keywords: ["tender", "award", "conflict of interest", "bribe", "kickback", "embezzlement", "forgery", "favoritism", "negligence"]
    },
    triagePreview: {
      title: "Q-ARC Structured Triage Output",
      note: "Q-ARC Structured Triage Output: Non-adversarial Decision Support — Human Authority — Fully Auditable.",
      category: "Suggested Category",
      riskScore: "Risk Index",
      referral: "Recommended Referral Dept",
      legalBasis: "Governing Statutory Basis"
    },
    triage: {
      title: "Complaints Triage Queue & Follow-up",
      filter: "Filter by Risk",
      all: "All Cases",
      high: "High Risk",
      medium: "Medium Risk",
      low: "Low Risk",
      noComplaints: "No complaints match selected filter",
      status: {
        new: "New",
        investigating: "Under Investigation",
        closed: "Closed"
      }
    },
    kpi: {
      total: "Total Cases",
      financial: "Financial Fraud",
      conflict: "Conflict of Interest",
      highRisk: "High Risk Hotspots"
    },
    dailyReport: {
      title: "Ministerial Daily Executive Brief",
      subtitle: "Institutional Integrity & Oversight Digest",
      dateLabel: "Date",
      summary: "Executive Snapshot: High concentration of anomalies detected in procurement and public tenders with elevated conflict-of-interest indicators. Immediate targeted financial audits and vendor cross-checks recommended.",
      topHotspots: "Institutional Risk Hotspots",
      printAction: "Print Brief / Export PDF"
    },
    entity: {
      title: "Entity Intelligence Map",
      subtitle: "Aggregated complaints by organization with risk concentration",
      totalComplaints: "Total Complaints",
      highRisk: "High Risk",
      avgRisk: "Avg Risk",
      topCategory: "Top Category"
    },
    schemas: {
      title: "Standard Data Schemas",
      complaintSchema: "Complaint Schema",
      reportSchema: "Daily Report Schema",
      copySuccess: "Schema copied to clipboard"
    },
    categories: {
      financial_corruption: "Financial Corruption / Theft",
      conflict_of_interest: "Conflict of Interest",
      abuse_of_power: "Abuse of Authority",
      tender_violation: "Tender Law Violation",
      administrative_negligence: "Administrative Negligence",
      general: "General Complaint"
    }
  }
};

const SAMPLE_ENTITIES = [
  "وزارة المالية",
  "وزارة الصحة",
  "وزارة التربية والتعليم",
  "وزارة الإسكان والتخطيط العمراني",
  "وزارة النقل والاتصالات وتقنية المعلومات",
  "وزارة الثروة الزراعية والسمكية وموارد المياه",
  "بلدية مسقط",
  "الهيئة العامة للمناطق الاقتصادية الخاصة والمناطق الحرة",
  "جهاز الاستثمار العماني",
  "جامعة السلطان قابوس"
];

const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 101,
    channel: "التطبيق الذكي",
    complainantType: "موظف حكومي",
    entity: "بلدية مسقط",
    governorate: "مسقط",
    topic: "شبهة تلاعب في ترسية مناقصة صيانة",
    amount: 145000,
    text: "شبهة تلاعب في ترسية مناقصة صيانة مرافق وطلب عمولة مالية غير رسمية مع إقصاء عروض فنية مطابقة.",
    riskScore: 88,
    status: "new",
    createdAt: new Date().toISOString(),
    category: "tender_violation",
    referral: "دائرة الرقابة على المناقصات والعقود",
    legalBasis: "قانون حماية المال العام (المرسوم السلطاني 112/2011) - المادة 7 و 10"
  },
  {
    id: 102,
    channel: "واتساب",
    complainantType: "مواطن",
    entity: "وزارة المالية",
    governorate: "مسقط",
    topic: "تضارب مصالح في منح عقود استشارية",
    amount: 65000,
    text: "مسؤول يمنح عقود دراسات واستشارات تقنية لشركة يملك قريبه المباشر حصة حاكمة فيها دون إفصاح.",
    riskScore: 82,
    status: "investigating",
    createdAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    category: "conflict_of_interest",
    referral: "دائرة تدقيق تضارب المصالح وإقرارات الذمة المالية",
    legalBasis: "المرسوم السلطاني 112/2011 - المواد 5 و 8 (تجنب تضارب المصالح)"
  },
  {
    id: 103,
    channel: "البريد الإلكتروني",
    complainantType: "مورد / مقاول",
    entity: "وزارة الإسكان والتخطيط العمراني",
    governorate: "شمال الباطنة",
    topic: "تأخير متعمد لصرف مستحقات معتمدة",
    amount: 320000,
    text: "تأخير صرف مستحقات مقاولين معتمدة رسمياً لأكثر من 14 شهراً مع تلميحات بطلب عمولة لتسريع المعاملة.",
    riskScore: 74,
    status: "new",
    createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
    category: "financial_corruption",
    referral: "دائرة فحص الشكاوى والتحقيق المالي",
    legalBasis: "قانون الرقابة المالية والإدارية للدولة (المرسوم السلطاني 111/2011)"
  },
  {
    id: 104,
    channel: "الخط الساخن",
    complainantType: "مجهول",
    entity: "وزارة الصحة",
    governorate: "ظفار",
    topic: "صرف أدوية ومستلزمات دون قيود مخزنية",
    amount: 48000,
    text: "تسريب أدوية ومستهلكات طبية من مستودع إقليمي وإعادة بيعها لعيادات خاصة دون قيد في النظام الدوائي.",
    riskScore: 79,
    status: "investigating",
    createdAt: new Date(Date.now() - 3600000 * 42).toISOString(),
    category: "financial_corruption",
    referral: "دائرة الرقابة الميدانية على المخازن والمستودعات",
    legalBasis: "المرسوم السلطاني 112/2011 - المادة 12"
  },
  {
    id: 105,
    channel: "حضور شخصي",
    complainantType: "مواطن",
    entity: "وزارة النقل والاتصالات وتقنية المعلومات",
    governorate: "الداخلية",
    topic: "استخدام معدات وآليات حكومية لمصالح شخصية",
    amount: 22000,
    text: "استخدام مركبات ومعدات حفر حكومية خلال عطلات نهاية الأسبوع لتسوية أراضٍ تجارية خاصة بمسؤول محلي.",
    riskScore: 58,
    status: "closed",
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    category: "abuse_of_power",
    referral: "دائرة الرقابة الإدارية",
    legalBasis: "المرسوم السلطاني 112/2011 - المادة 7"
  },
  {
    id: 106,
    channel: "التطبيق الذكي",
    complainantType: "مواطن",
    entity: "وزارة التربية والتعليم",
    governorate: "جنوب الباطنة",
    topic: "تأخر غير مبرر في صيانة مرافق مدرسية",
    amount: 15000,
    text: "تأخر إنجاز صيانة دورات مياه ومكيفات في مجمع تعليمي رغم اعتماد الموازنة المالية منذ بداية العام الدراسي.",
    riskScore: 46,
    status: "investigating",
    createdAt: new Date(Date.now() - 3600000 * 96).toISOString(),
    category: "administrative_negligence",
    referral: "قسم متابعة المشاريع الميدانية",
    legalBasis: "قانون الخدمة المدنية ولائحته التنفيذية"
  }
];

const COMPLAINT_SCHEMA = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "RuznSovereignComplaint",
  type: "object",
  properties: {
    id: { type: "integer", description: "Unique sovereign tracking ID" },
    channel: { type: "string", enum: ["mobile_app", "whatsapp", "hotline", "email", "in_person", "mail"] },
    complainantType: { type: "string", enum: ["citizen", "civil_servant", "contractor", "anonymous"] },
    entity: { type: "string", description: "Governmental or State-Owned Enterprise name" },
    governorate: { type: "string", description: "Sultanate governorate" },
    topic: { type: "string", description: "Procedural subject" },
    amount_omr: { type: "number", nullable: true, description: "Estimated financial exposure in OMR" },
    text: { type: "string", description: "Complaint narrative with evidentiary references" },
    riskScore: { type: "integer", minimum: 0, maximum: 100 },
    category: { type: "string", enum: ["financial_corruption", "conflict_of_interest", "abuse_of_power", "tender_violation", "administrative_negligence", "general"] },
    status: { type: "string", enum: ["new", "investigating", "closed"] },
    referralDept: { type: "string" },
    statutoryBasis: { type: "string" },
    created_at: { type: "string", format: "date-time" }
  },
  required: ["id", "channel", "entity", "text", "riskScore", "status", "created_at"]
};

const REPORT_SCHEMA = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "RuznMinisterialExecutiveBrief",
  type: "object",
  properties: {
    report_id: { type: "string" },
    generated_at: { type: "string", format: "date-time" },
    jurisdiction: { type: "string", default: "Sultanate of Oman" },
    executive_summary: { type: "string" },
    metrics: {
      type: "object",
      properties: {
        total_complaints: { type: "integer" },
        financial_fraud_count: { type: "integer" },
        conflict_interest_count: { type: "integer" },
        high_risk_count: { type: "integer" },
        avg_risk_index: { type: "number" }
      }
    },
    top_institutional_hotspots: {
      type: "array",
      items: {
        type: "object",
        properties: {
          entity: { type: "string" },
          incident_count: { type: "integer" },
          risk_level: { type: "string" }
        }
      }
    },
    governing_authorities: {
      type: "array",
      items: { type: "string" }
    }
  }
};

const REGISTRY_STORAGE_KEY = "ruzn_sovereign_registry_cases";

function normalizeComplaintForOps(raw: any, idx: number): Complaint {
  const numericId =
    typeof raw.id === "number"
      ? raw.id
      : parseInt(String(raw.id || "").replace(/\D/g, ""), 10) || 1000 + idx;
  const riskScore =
    typeof raw.riskScore === "number"
      ? raw.riskScore
      : typeof raw.triage?.risk_score_0_100 === "number"
      ? raw.triage.risk_score_0_100
      : 65;
  const rawStatus = String(raw.status || raw.triage?.status || "new").toLowerCase();
  const status: ComplaintStatus =
    rawStatus === "investigating"
      ? "investigating"
      : rawStatus === "closed"
      ? "closed"
      : "new";
  const classification = String(raw.category || raw.triage?.classification || "");
  let category = raw.category || "general";
  if (!raw.category) {
    if (classification.includes("مناقص") || classification.includes("Procurement")) {
      category = "tender_violation";
    } else if (classification.includes("تضارب") || classification.includes("Conflict")) {
      category = "conflict_of_interest";
    } else if (
      classification.includes("رشوة") ||
      classification.includes("اختلاس") ||
      classification.includes("Bribery") ||
      classification.includes("Funds")
    ) {
      category = "financial_corruption";
    } else if (classification.includes("تأخير") || classification.includes("Delay")) {
      category = "administrative_negligence";
    }
  }
  return {
    id: numericId,
    channel: raw.channel || "التطبيق الذكي",
    complainantType: raw.complainantType || raw.complainant_type || "مواطن",
    entity: raw.entity || "جهة حكومية",
    governorate: raw.governorate || "مسقط",
    topic: raw.topic || raw.triage?.classification || "بلاغ نزاهة تشغيلي",
    amount:
      raw.amount !== undefined
        ? raw.amount
        : raw.amount_omr !== undefined
        ? raw.amount_omr
        : null,
    text: raw.text || "",
    riskScore,
    status,
    createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
    category,
    referral: raw.referral || raw.triage?.routing || "دائرة فحص الشكاوى والبلاغات العامة",
    legalBasis:
      raw.legalBasis ||
      raw.triage?.rationale ||
      "المرسوم السلطاني 112/2011 (قانون حماية المال العام)"
  };
}

export default function Operations() {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("ruzn_lang") : null;
    return saved === "en" || saved === "english" ? "english" : "arabic";
  });
  const [activeTab, setActiveTab] = useState<TabId>("intake");
  const [riskFilter, setRiskFilter] = useState<RiskLevel>("all");
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(REGISTRY_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((item, idx) => normalizeComplaintForOps(item, idx));
          }
        }
      } catch {
        // fallback to initial complaints
      }
    }
    return INITIAL_COMPLAINTS;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    channel: "التطبيق الذكي",
    complainantType: "مواطن",
    entity: "وزارة المالية",
    governorate: "مسقط",
    topic: "شبهة تلاعب في مناقصة توريد",
    amount: "45000",
    text: "شبهة تلاعب في ترسية مناقصة وتضارب مصالح مع أحد مسؤولي المشتريات وطلب عمولة مالية."
  });

  // Live triage preview state
  const [livePreview, setLivePreview] = useState<{
    category: string;
    riskScore: number;
    referral: string;
    legalBasis: string;
  }>({
    category: "tender_violation",
    riskScore: 84,
    referral: "دائرة الرقابة على المناقصات والعقود - جهاز الرقابة المالية والإدارية للدولة",
    legalBasis: "المرسوم السلطاني رقم 112/2011 (قانون حماية المال العام) - المواد 7 و 10"
  });

  const isRTL = language === "arabic";
  const text = UI_TEXT[language];

  useEffect(() => {
    localStorage.setItem("ruzn_lang", language === "english" ? "en" : "ar");
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = isRTL ? "ar" : "en";
  }, [language, isRTL]);

  useEffect(() => {
    try {
      localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(complaints));
    } catch {
      // ignore storage quota errors
    }
  }, [complaints]);

  // Auto triage analysis algorithm
  const computeTriage = (complaintText: string, amount: number | null) => {
    const t = complaintText.toLowerCase();
    let category = "general";
    let baseScore = 35;
    let referral = "دائرة فحص الشكاوى والبلاغات العامة";
    let legalBasis = "المرسوم السلطاني 111/2011 (قانون الرقابة المالية والإدارية للدولة)";

    if (t.includes("مناقصة") || t.includes("ترسية") || t.includes("عقد") || t.includes("tender") || t.includes("procurement")) {
      category = "tender_violation";
      baseScore = 65;
      referral = "دائرة الرقابة على المناقصات والعقود";
      legalBasis = "قانون حماية المال العام وتجنب تضارب المصالح (المرسوم السلطاني 112/2011) - المادة 10";
    } else if (t.includes("تضارب") || t.includes("قريب") || t.includes("محاباة") || t.includes("conflict") || t.includes("relative")) {
      category = "conflict_of_interest";
      baseScore = 70;
      referral = "دائرة الرقابة على إقرارات الذمة المالية وتضارب المصالح";
      legalBasis = "المرسوم السلطاني 112/2011 - المواد 5 و 8";
    } else if (t.includes("رشوة") || t.includes("عمولة") || t.includes("bribe") || t.includes("kickback") || t.includes("إكرامية")) {
      category = "financial_corruption";
      baseScore = 80;
      referral = "دائرة التحقيق المالي والجرائم الاقتصادية";
      legalBasis = "قانون الجزاء العماني (المرسوم السلطاني 7/2018) + قانون حماية المال العام 112/2011 - المادة 7";
    } else if (t.includes("اختلاس") || t.includes("سرقة") || t.includes("هدر") || t.includes("embezzle") || t.includes("theft")) {
      category = "financial_corruption";
      baseScore = 85;
      referral = "دائرة فحص الحسابات والتحقيق المالي الخاص";
      legalBasis = "المرسوم السلطاني رقم 112/2011 - المواد 2 و 11";
    } else if (t.includes("سلطة") || t.includes("استغلال") || t.includes("نفوذ") || t.includes("abuse")) {
      category = "abuse_of_power";
      baseScore = 60;
      referral = "دائرة الرقابة على الأداء الإداري والوظيفي";
      legalBasis = "المرسوم السلطاني 112/2011 - المادة 7";
    } else if (t.includes("إهمال") || t.includes("تأخر") || t.includes("تعطيل") || t.includes("delay")) {
      category = "administrative_negligence";
      baseScore = 48;
      referral = "دائرة الرقابة الإدارية وتطوير الخدمات";
      legalBasis = "قانون الخدمة المدنية ولائحته التنفيذية";
    }

    if (amount) {
      if (amount >= 200000) baseScore += 18;
      else if (amount >= 50000) baseScore += 12;
      else if (amount >= 10000) baseScore += 6;
    }

    const riskScore = Math.min(98, Math.max(25, baseScore + Math.floor(Math.random() * 6)));
    return { category, riskScore, referral, legalBasis };
  };

  // Live update preview when typing
  const handleTextChange = (newText: string) => {
    setFormData(prev => ({ ...prev, text: newText }));
    if (newText.trim().length > 10) {
      const amt = formData.amount ? parseFloat(formData.amount) : null;
      const res = computeTriage(newText, amt);
      setLivePreview(res);
    }
  };

  // Filter complaints
  const filteredComplaints = useMemo(() => {
    if (riskFilter === "all") return complaints;
    if (riskFilter === "high") return complaints.filter(c => c.riskScore >= 75);
    if (riskFilter === "medium") return complaints.filter(c => c.riskScore >= 50 && c.riskScore < 75);
    return complaints.filter(c => c.riskScore < 50);
  }, [complaints, riskFilter]);

  // Aggregate KPI metrics
  const kpiStats = useMemo(() => {
    const total = complaints.length;
    const financial = complaints.filter(c => c.category === "financial_corruption" || c.category === "tender_violation").length;
    const conflict = complaints.filter(c => c.category === "conflict_of_interest").length;
    const highRisk = complaints.filter(c => c.riskScore >= 75).length;
    return { total, financial, conflict, highRisk };
  }, [complaints]);

  // Entity Intelligence stats
  const entityStats = useMemo((): EntityStats[] => {
    const statsMap: Record<string, { total: number; highRisk: number; totalRisk: number; categories: Record<string, number> }> = {};

    complaints.forEach(c => {
      if (!statsMap[c.entity]) {
        statsMap[c.entity] = { total: 0, highRisk: 0, totalRisk: 0, categories: {} };
      }
      const existing = statsMap[c.entity];
      existing.total++;
      existing.totalRisk += c.riskScore;
      if (c.riskScore >= 75) existing.highRisk++;
      existing.categories[c.category] = (existing.categories[c.category] || 0) + 1;
    });

    const result: EntityStats[] = Object.entries(statsMap).map(([name, stats]) => {
      const catEntries = Object.entries(stats.categories) as [string, number][];
      const topCategory = catEntries.sort((a, b) => b[1] - a[1])[0]?.[0] || "general";
      return {
        name,
        totalComplaints: stats.total,
        highRisk: stats.highRisk,
        avgRiskScore: Math.round(stats.totalRisk / stats.total),
        topCategory
      };
    });
    return result.sort((a, b) => b.highRisk - a.highRisk || b.avgRiskScore - a.avgRiskScore);
  }, [complaints]);

  // Quick keyword insertion
  const insertKeyword = (kw: string) => {
    const updated = formData.text ? `${formData.text} + ${kw}` : kw;
    handleTextChange(updated);
  };

  // Pre-fill realistic sample
  const fillSample = () => {
    const samples = [
      {
        channel: "التطبيق الذكي",
        complainantType: "موظف حكومي",
        entity: "بلدية مسقط",
        governorate: "مسقط",
        topic: "تلاعب في مناقصة صيانة وإنارة",
        amount: "185000",
        text: "شبهة تلاعب في ترسية مناقصة صيانة إنارة الطرق مع تواطؤ عضو لجنة المشتريات مع شركة مقاولات تتبع أحد أقربائه دون إفصاح، وطلب عمولة غير رسمية."
      },
      {
        channel: "البريد الإلكتروني",
        complainantType: "مورد / مقاول",
        entity: "وزارة المالية",
        governorate: "مسقط",
        topic: "تضارب مصالح واستغلال منصب",
        amount: "95000",
        text: "مسؤول يمنح عقود استشارات مالية لشركة يملك قريبه المباشر حصة فيها مع تهميش العروض المنافسة الأقل تكلفة."
      },
      {
        channel: "الخط الساخن",
        complainantType: "مواطن",
        entity: "وزارة الإسكان والتخطيط العمراني",
        governorate: "ظفار",
        topic: "تسهيل منح أراضٍ تجارية بصفة تفضيلية",
        amount: "240000",
        text: "شبهة استغلال نفوذ وظيفي في تسريع وتخصيص أراضٍ تجارية ذات قيمة سوقية عالية لأشخاص محددين بالمخالفة للائحة الدور والاستحقاق."
      }
    ];

    const chosen = samples[Math.floor(Math.random() * samples.length)];
    setFormData(chosen);
    const amt = parseFloat(chosen.amount);
    const res = computeTriage(chosen.text, amt);
    setLivePreview(res);
    toast.info(language === "arabic" ? "تم تعبئة حالة البلاغ المرجعية بنجاح" : "Reference case loaded");
  };

  // Load reference sovereign complaints
  const loadReferenceCases = () => {
    const refEntities = SAMPLE_ENTITIES;
    const refTexts = [
      "شبهة تلاعب في إرساء عقد توريد معدات حاسوبية بمبلغ مضاعف.",
      "طلب عمولة مالية غير معلنة مقابل اعتماد كشف دفعات المقاولين.",
      "تضارب مصالح صريح بين مدير الدائرة والشركة المنفذة للمشروع.",
      "هدر في المال العام ناتج عن إهمال صيانة أسطول المركبات الحكومية.",
      "تسريب بيانات عروض الأسعار السرية لمنافس مفضل قبل فتح المظاريف.",
      "استغلال موظف لمركبات ومعدات الوزارة في مشاريعه العقارية الخاصة."
    ];

    const newItems: Complaint[] = [];
    const count = 6;
    for (let i = 0; i < count; i++) {
      const ent = refEntities[Math.floor(Math.random() * refEntities.length)];
      const txt = refTexts[Math.floor(Math.random() * refTexts.length)];
      const amt = [18000, 45000, 110000, 260000, 750000][Math.floor(Math.random() * 5)];
      const res = computeTriage(txt, amt);
      newItems.push({
        id: complaints.length + i + 1,
        channel: "التطبيق الذكي",
        complainantType: "مواطن",
        entity: ent,
        governorate: "مسقط",
        topic: "بلاغ نزاهة تشغيلي",
        amount: amt,
        text: txt,
        riskScore: res.riskScore,
        status: "new",
        createdAt: new Date(Date.now() - Math.random() * 3600000 * 48).toISOString(),
        category: res.category,
        referral: res.referral,
        legalBasis: res.legalBasis
      });
    }

    setComplaints(prev => [...newItems, ...prev]);
    toast.success(language === "arabic" ? `تم تحميل ${count} حالات مرجعية في السجل السيادي` : `Loaded ${count} reference cases into Sovereign Registry`);
  };

  // Reset to initial complaints
  const handleResetAll = () => {
    setComplaints(INITIAL_COMPLAINTS);
    setFormData({
      channel: "التطبيق الذكي",
      complainantType: "مواطن",
      entity: "وزارة المالية",
      governorate: "مسقط",
      topic: "",
      amount: "",
      text: ""
    });
    toast.info(language === "arabic" ? "تمت استعادة البيانات الأصلية" : "Reset to default sovereign data");
  };

  // Form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.text.trim()) {
      toast.error(language === "arabic" ? "يرجى كتابة تفاصيل البلاغ" : "Please enter complaint narrative");
      return;
    }

    setIsSubmitting(true);
    const amt = formData.amount ? parseFloat(formData.amount) : null;
    const res = computeTriage(formData.text, amt);

    const newCase: Complaint = {
      id: complaints.length + 101,
      channel: formData.channel,
      complainantType: formData.complainantType,
      entity: formData.entity,
      governorate: formData.governorate,
      topic: formData.topic || "بلاغ نزاهة موجه",
      amount: amt,
      text: formData.text,
      riskScore: res.riskScore,
      status: "new",
      createdAt: new Date().toISOString(),
      category: res.category,
      referral: res.referral,
      legalBasis: res.legalBasis
    };

    setTimeout(() => {
      setComplaints(prev => [newCase, ...prev]);
      setLivePreview(res);
      setIsSubmitting(false);
      toast.success(language === "arabic" ? `تم استلام البلاغ وفرزه فورياً — مؤشر الخطورة: ${res.riskScore}%` : `Triage complete — Risk Score: ${res.riskScore}%`);
    }, 400);
  };

  // Print Ministerial Daily Report
  const handlePrint = () => {
    window.print();
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = JSON.stringify(complaints, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ruzn-operations-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(language === "arabic" ? "تم تصدير ملف البيانات بنجاح" : "Data exported");
  };

  // Copy Schema to clipboard
  const copySchema = (schemaObj: object) => {
    navigator.clipboard.writeText(JSON.stringify(schemaObj, null, 2));
    toast.success(text.schemas.copySuccess);
  };

  return (
    <div
      className="min-h-screen text-foreground flex flex-col font-body selection:bg-[rgba(214,179,106,0.3)]"
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        background:
          "radial-gradient(1200px 600px at 60% 18%, rgba(214,179,106,.15), transparent 55%)," +
          "radial-gradient(900px 500px at 20% 80%, rgba(96,165,250,.09), transparent 60%)," +
          "linear-gradient(180deg, #050506, #0a0a0c)"
      }}
    >
      {/* ─── Universal Sovereign Header ─── */}
      <SovereignHeader
        title={text.title}
        subtitle={text.subtitle}
        language={language}
        activeSuite="operations"
        onToggleLanguage={() => setLanguage(language === "arabic" ? "english" : "arabic")}
        actions={
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={loadReferenceCases}
              className="ruzn-btn text-xs gap-1.5 border-[rgba(214,179,106,0.3)] hover:border-[rgba(214,179,106,0.6)] text-[rgba(214,179,106,0.95)]"
              title={text.seedBtn}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{text.seedBtn}</span>
            </button>
            <button
              onClick={handleResetAll}
              className="ruzn-btn text-xs gap-1.5 text-white/70 hover:text-white"
              title={text.resetBtn}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{text.resetBtn}</span>
            </button>
            <button
              onClick={handlePrint}
              className="ruzn-btn text-xs gap-1.5 text-white/80 border-white/15 hover:border-[rgba(214,179,106,0.4)]"
              title={text.printBtn}
            >
              <Printer className="w-3.5 h-3.5 text-[rgba(214,179,106,0.9)]" />
              <span className="hidden sm:inline">{text.printBtn}</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="ruzn-btn-gold text-xs gap-1.5 font-bold"
              title={text.exportBtn}
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
          </div>
        }
      />

      {/* ─── Main Content Canvas ─── */}
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-6">
        {/* Navigation Tabs Bar */}
        <div className="flex gap-2 mb-6 flex-wrap print:hidden">
          {(["intake", "triage", "entity", "schemas"] as TabId[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`ruzn-tab ${activeTab === tab ? "active" : ""}`}
            >
              {tab === "intake" && <FileText className="w-4 h-4 text-[rgba(214,179,106,0.95)]" />}
              {tab === "triage" && <ListFilter className="w-4 h-4 text-[rgba(214,179,106,0.95)]" />}
              {tab === "entity" && <Map className="w-4 h-4 text-[rgba(214,179,106,0.95)]" />}
              {tab === "schemas" && <Code className="w-4 h-4 text-[rgba(214,179,106,0.95)]" />}
              <span>{text.tabs[tab]}</span>
              {tab === "triage" && (
                <span className="mr-1.5 ml-1.5 px-2 py-0.5 rounded-full bg-[rgba(214,179,106,0.2)] text-[rgba(214,179,106,0.95)] text-[11px] font-bold">
                  {complaints.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ─── 2-Column Responsive Layout ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ════════ LEFT COLUMN: Main Operations Deck (7 / 12 Cols) ════════ */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* ──────── TAB 1: Intake Form ──────── */}
            {activeTab === "intake" && (
              <div className="ruzn-card">
                <div className="ruzn-card-header">
                  <div>
                    <h2 className="ruzn-card-title text-base md:text-lg">
                      {text.intake.title}
                    </h2>
                    <p className="text-xs text-white/60">
                      {text.intake.cardMeta}
                    </p>
                  </div>
                  <span className="ruzn-tag border-[rgba(214,179,106,0.3)] text-[rgba(214,179,106,0.95)]">
                    Q-ARC Sovereign Intake
                  </span>
                </div>

                <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-4">
                  {/* Row 1: Channel & Complainant Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-white/70 mb-2">
                        {text.intake.channel}
                      </label>
                      <select
                        value={formData.channel}
                        onChange={e => setFormData(prev => ({ ...prev, channel: e.target.value }))}
                        className="ruzn-input"
                        required
                      >
                        {text.intake.channels.map(ch => (
                          <option key={ch} value={ch}>{ch}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-white/70 mb-2">
                        {text.intake.complainantType}
                      </label>
                      <select
                        value={formData.complainantType}
                        onChange={e => setFormData(prev => ({ ...prev, complainantType: e.target.value }))}
                        className="ruzn-input"
                        required
                      >
                        {text.intake.complainantTypes.map(ct => (
                          <option key={ct} value={ct}>{ct}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Row 2: Entity & Governorate */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-white/70 mb-2">
                        {text.intake.entity}
                      </label>
                      <select
                        value={formData.entity}
                        onChange={e => setFormData(prev => ({ ...prev, entity: e.target.value }))}
                        className="ruzn-input"
                        required
                      >
                        {SAMPLE_ENTITIES.map(ent => (
                          <option key={ent} value={ent}>{ent}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-white/70 mb-2">
                        {text.intake.governorate}
                      </label>
                      <select
                        value={formData.governorate}
                        onChange={e => setFormData(prev => ({ ...prev, governorate: e.target.value }))}
                        className="ruzn-input"
                        required
                      >
                        {text.intake.governorates.map(gov => (
                          <option key={gov} value={gov}>{gov}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Row 3: Topic & Amount */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-white/70 mb-2">
                        {text.intake.topic}
                      </label>
                      <input
                        type="text"
                        value={formData.topic}
                        onChange={e => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                        className="ruzn-input"
                        placeholder="مثال: شبهة تلاعب في مناقصة صيانة"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-white/70 mb-2">
                        {text.intake.amount}
                      </label>
                      <input
                        type="number"
                        value={formData.amount}
                        onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                        className="ruzn-input"
                        placeholder="مثال: 45000"
                        min="0"
                        step="0.001"
                      />
                    </div>
                  </div>

                  {/* Row 4: Narrative Details */}
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-2">
                      {text.intake.text}
                    </label>
                    <textarea
                      value={formData.text}
                      onChange={e => handleTextChange(e.target.value)}
                      className="ruzn-input min-h-[120px] resize-y"
                      placeholder="اكتب أو الصق تفاصيل البلاغ والأدلة المتوفرة هنا..."
                      required
                    />
                  </div>

                  {/* Quick Keywords Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-xs text-white/50">{text.intake.hintKeywords}</span>
                    {text.intake.keywords.map(kw => (
                      <button
                        type="button"
                        key={kw}
                        onClick={() => insertKeyword(kw)}
                        className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-[rgba(214,179,106,0.15)] border border-white/10 hover:border-[rgba(214,179,106,0.35)] text-xs text-white/75 hover:text-[rgba(214,179,106,0.98)] transition"
                      >
                        + {kw}
                      </button>
                    ))}
                  </div>

                  {/* Form Action Buttons */}
                  <div className="flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={fillSample}
                        className="ruzn-btn text-xs font-semibold gap-1.5 border-[rgba(214,179,106,0.3)] text-[rgba(214,179,106,0.95)]"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {text.intake.sample}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ channel: "التطبيق الذكي", complainantType: "مواطن", entity: "وزارة المالية", governorate: "مسقط", topic: "", amount: "", text: "" })}
                        className="ruzn-btn text-xs gap-1.5 text-white/60 hover:text-white"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        {text.intake.reset}
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="ruzn-btn-gold text-sm font-bold gap-2 px-6 shadow-deep"
                    >
                      <Send className="w-4 h-4" />
                      {text.intake.submit}
                    </button>
                  </div>
                </form>

                {/* ─── Instant Live Triage Preview Box ─── */}
                <div className="p-5 md:p-6 bg-gradient-to-b from-[rgba(214,179,106,0.08)] to-transparent border-t border-[rgba(214,179,106,0.2)]">
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <h3 className="font-heading font-bold text-sm md:text-base text-gold-gradient flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[rgba(214,179,106,0.98)]" />
                      {text.triagePreview.title}
                    </h3>
                    <span className="ruzn-tag border-[rgba(214,179,106,0.3)] text-[rgba(214,179,106,0.95)] text-xs">
                      Confidence: 94.8%
                    </span>
                  </div>
                  <p className="text-xs text-white/60 mb-4">
                    {text.triagePreview.note}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
                      <span className="text-[11px] text-white/50 block mb-1">{text.triagePreview.category}</span>
                      <span className="text-xs font-semibold text-white/90">
                        {text.categories[livePreview.category as keyof typeof text.categories] || livePreview.category}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
                      <span className="text-[11px] text-white/50 block mb-1">{text.triagePreview.riskScore}</span>
                      <div className="flex items-center gap-2">
                        <span className={`ruzn-tag ${livePreview.riskScore >= 75 ? "ruzn-tag-high" : livePreview.riskScore >= 50 ? "ruzn-tag-med" : "ruzn-tag-low"}`}>
                          {livePreview.riskScore}%
                        </span>
                        <span className="text-xs text-white/75">
                          {livePreview.riskScore >= 75 ? text.triage.high : livePreview.riskScore >= 50 ? text.triage.medium : text.triage.low}
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 sm:col-span-2">
                      <span className="text-[11px] text-white/50 block mb-1">{text.triagePreview.referral}</span>
                      <span className="text-xs text-[rgba(214,179,106,0.95)] font-semibold flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" />
                        {livePreview.referral}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 sm:col-span-2">
                      <span className="text-[11px] text-white/50 block mb-1">{text.triagePreview.legalBasis}</span>
                      <span className="text-xs text-white/80 font-mono">
                        {livePreview.legalBasis}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ──────── TAB 2: Triage Queue ──────── */}
            {activeTab === "triage" && (
              <div className="ruzn-card">
                <div className="ruzn-card-header">
                  <div>
                    <h2 className="ruzn-card-title text-base md:text-lg">
                      {text.triage.title}
                    </h2>
                    <p className="text-xs text-white/60">
                      {complaints.length} بلاغات مدرجة ضمن نظام الفرز الموحد
                    </p>
                  </div>
                  {/* Filter chips */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(["all", "high", "medium", "low"] as RiskLevel[]).map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => setRiskFilter(lvl)}
                        className={`ruzn-tab text-xs py-1 px-3 ${riskFilter === lvl ? "active" : ""}`}
                      >
                        {text.triage[lvl]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 md:p-5">
                  {filteredComplaints.length === 0 ? (
                    <div className="p-10 text-center text-white/50">
                      {text.triage.noComplaints}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredComplaints.map(item => (
                        <div
                          key={item.id}
                          className="p-4 rounded-xl bg-black/35 hover:bg-black/55 border border-white/10 hover:border-[rgba(214,179,106,0.35)] transition-all shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3"
                        >
                          <div className="flex-1 space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono font-bold text-[rgba(214,179,106,0.95)]">
                                #{item.id}
                              </span>
                              <span className="text-xs font-semibold text-white/90">
                                {item.entity}
                              </span>
                              <span className="text-xs text-white/40">•</span>
                              <span className="text-xs text-white/60">
                                {item.governorate}
                              </span>
                              <span className={`ruzn-tag ${item.riskScore >= 75 ? "ruzn-tag-high" : item.riskScore >= 50 ? "ruzn-tag-med" : "ruzn-tag-low"}`}>
                                {item.riskScore}% {item.riskScore >= 75 ? text.triage.high : item.riskScore >= 50 ? text.triage.medium : text.triage.low}
                              </span>
                            </div>
                            <h4 className="text-sm font-semibold text-white/90">
                              {item.topic}
                            </h4>
                            <p className="text-xs text-white/70 line-clamp-2">
                              {item.text}
                            </p>
                            {item.legalBasis && (
                              <div className="text-[11px] text-[rgba(214,179,106,0.85)] font-mono">
                                ⚖️ {item.legalBasis}
                              </div>
                            )}
                          </div>

                          <div className="flex md:flex-col items-center md:items-end justify-between gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-white/10">
                            {item.amount ? (
                              <span className="text-xs font-bold text-white/90 font-mono">
                                {item.amount.toLocaleString()} ر.ع.
                              </span>
                            ) : (
                              <span className="text-xs text-white/40">—</span>
                            )}
                            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/70">
                              {text.triage.status[item.status]}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ──────── TAB 3: Entity Intelligence Map ──────── */}
            {activeTab === "entity" && (
              <div className="ruzn-card">
                <div className="ruzn-card-header">
                  <div>
                    <h2 className="ruzn-card-title text-base md:text-lg">
                      {text.entity.title}
                    </h2>
                    <p className="text-xs text-white/60">
                      {text.entity.subtitle}
                    </p>
                  </div>
                  <span className="ruzn-tag border-[rgba(214,179,106,0.3)] text-[rgba(214,179,106,0.95)]">
                    {entityStats.length} جهات مرصودة
                  </span>
                </div>

                <div className="p-4 md:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {entityStats.map(stat => (
                    <div
                      key={stat.name}
                      className="p-4 rounded-xl bg-black/40 border border-white/10 hover:border-[rgba(214,179,106,0.35)] transition shadow-sm space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-white/95 flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-[rgba(214,179,106,0.95)]" />
                          {stat.name}
                        </h4>
                        <span className={`ruzn-tag ${stat.avgRiskScore >= 75 ? "ruzn-tag-high" : stat.avgRiskScore >= 50 ? "ruzn-tag-med" : "ruzn-tag-low"}`}>
                          مخاطر {stat.avgRiskScore}%
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
                        <div>
                          <span className="text-white/50 block text-[11px]">{text.entity.totalComplaints}</span>
                          <span className="font-bold text-white/90">{stat.totalComplaints}</span>
                        </div>
                        <div>
                          <span className="text-white/50 block text-[11px]">{text.entity.highRisk}</span>
                          <span className="font-bold text-red-400">{stat.highRisk}</span>
                        </div>
                      </div>

                      <div className="text-xs text-white/70">
                        <span className="text-white/50">{text.entity.topCategory}: </span>
                        <span>{text.categories[stat.topCategory as keyof typeof text.categories] || stat.topCategory}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ──────── TAB 4: Schemas ──────── */}
            {activeTab === "schemas" && (
              <div className="space-y-6">
                <div className="ruzn-card">
                  <div className="ruzn-card-header">
                    <h2 className="ruzn-card-title text-base">
                      {text.schemas.complaintSchema}
                    </h2>
                    <button
                      onClick={() => copySchema(COMPLAINT_SCHEMA)}
                      className="ruzn-btn text-xs gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      نسخ JSON
                    </button>
                  </div>
                  <div className="p-4 bg-black/60 overflow-x-auto">
                    <pre className="text-xs font-mono text-[rgba(214,179,106,0.9)] leading-relaxed">
                      {JSON.stringify(COMPLAINT_SCHEMA, null, 2)}
                    </pre>
                  </div>
                </div>

                <div className="ruzn-card">
                  <div className="ruzn-card-header">
                    <h2 className="ruzn-card-title text-base">
                      {text.schemas.reportSchema}
                    </h2>
                    <button
                      onClick={() => copySchema(REPORT_SCHEMA)}
                      className="ruzn-btn text-xs gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      نسخ JSON
                    </button>
                  </div>
                  <div className="p-4 bg-black/60 overflow-x-auto">
                    <pre className="text-xs font-mono text-[rgba(214,179,106,0.9)] leading-relaxed">
                      {JSON.stringify(REPORT_SCHEMA, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ════════ RIGHT COLUMN: Executive Intelligence Deck (5 / 12 Cols) ════════ */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            {/* ─── 4 Sovereign Glowing KPI Cards ─── */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="ruzn-kpi">
                <div className="ruzn-kpi-value">{kpiStats.total}</div>
                <div className="ruzn-kpi-label">{text.kpi.total}</div>
              </div>

              <div className="ruzn-kpi">
                <div className="ruzn-kpi-value text-red-400">{kpiStats.highRisk}</div>
                <div className="ruzn-kpi-label">{text.kpi.highRisk}</div>
              </div>

              <div className="ruzn-kpi">
                <div className="ruzn-kpi-value">{kpiStats.financial}</div>
                <div className="ruzn-kpi-label">{text.kpi.financial}</div>
              </div>

              <div className="ruzn-kpi">
                <div className="ruzn-kpi-value">{kpiStats.conflict}</div>
                <div className="ruzn-kpi-label">{text.kpi.conflict}</div>
              </div>
            </div>

            {/* ─── Ministerial Daily Report Card ─── */}
            <div className="report border-[rgba(214,179,106,0.35)] shadow-deep">
              <div className="flex items-center justify-between mb-3 border-b border-[rgba(214,179,106,0.2)] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[rgba(214,179,106,0.2)] border border-[rgba(214,179,106,0.4)] flex items-center justify-center">
                    <FileCheck2 className="w-4 h-4 text-[rgba(214,179,106,0.98)]" />
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-sm text-[rgba(214,179,106,0.98)]">
                      {text.dailyReport.title}
                    </h3>
                    <span className="text-[11px] text-white/50">
                      {text.dailyReport.subtitle}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[rgba(214,179,106,0.15)] text-[rgba(214,179,106,0.95)] text-[10px] font-bold">
                  {new Date().toLocaleDateString(language === "arabic" ? "ar-OM" : "en-US")}
                </span>
              </div>

              <p className="text-xs text-white/85 leading-relaxed mb-4">
                {text.dailyReport.summary}
              </p>

              <div className="space-y-2 mb-4">
                <span className="text-xs font-bold text-[rgba(214,179,106,0.95)] block">
                  {text.dailyReport.topHotspots}:
                </span>
                {entityStats.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                    <span className="text-white/80">{item.name}</span>
                    <span className="text-red-400 font-bold">{item.highRisk} حالات حرجة</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handlePrint}
                className="w-full ruzn-btn-gold text-xs font-bold gap-2 py-2.5"
              >
                <Printer className="w-3.5 h-3.5" />
                {text.dailyReport.printAction}
              </button>
            </div>

            {/* ─── Live Triage Stream Feed ─── */}
            <div className="ruzn-card">
              <div className="ruzn-card-header">
                <h3 className="ruzn-card-title text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[rgba(214,179,106,0.95)]" />
                  {language === "arabic" ? "آخر البلاغات المفروزة" : "Recent Triage Feed"}
                </h3>
                <span className="text-[11px] text-white/50">مباشر</span>
              </div>

              <div className="p-3.5 space-y-2.5 max-h-[380px] overflow-y-auto scrollbar-hide">
                {complaints.slice(0, 5).map(c => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-black/40 border border-white/10 hover:border-[rgba(214,179,106,0.3)] transition"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-white/90 truncate max-w-[170px]">
                        {c.entity}
                      </span>
                      <span className={`ruzn-tag ${c.riskScore >= 75 ? "ruzn-tag-high" : c.riskScore >= 50 ? "ruzn-tag-med" : "ruzn-tag-low"}`}>
                        {c.riskScore}%
                      </span>
                    </div>
                    <p className="text-[11px] text-white/60 line-clamp-1 mb-1">
                      {c.text}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-white/40">
                      <span>{c.channel}</span>
                      <span>{new Date(c.createdAt).toLocaleTimeString(language === "arabic" ? "ar-OM" : "en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ─── Sovereign Footer ─── */}
      <footer className="border-t border-white/10 py-5 text-center text-xs text-white/50 print:hidden mt-auto">
        <div className="container max-w-7xl mx-auto px-4 flex items-center justify-between flex-wrap gap-3">
          <span>منصة رُزن السيادية للذكاء التشريعي والنزاهة وحوكمة المال العام © {new Date().getFullYear()}</span>
          <span className="text-[rgba(214,179,106,0.9)] font-heading font-semibold">
            مدعوم بتقنيات أكيوتيريوم تكنولوجيز (Acuterium Technologies Inc.)
          </span>
        </div>
      </footer>
    </div>
  );
}
