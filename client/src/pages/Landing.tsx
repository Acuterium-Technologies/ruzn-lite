import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  Shield,
  Brain,
  FileSearch,
  Scale,
  Lock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle,
  Mail,
  Building2,
  Users,
  Layers,
  Radar,
  ScrollText,
  BarChart3,
  ServerCog,
  Network,
  Globe,
  ClipboardList,
  History,
  TrendingUp,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Zap,
  KeyRound
} from "lucide-react";

type Language = "arabic" | "english";

const UI_TEXT = {
  arabic: {
    title: "رُزن",
    tagline: "الذكاء السيادي للحوكمة والنزاهة والامتثال",
    subtitle:
      "منصة ذكاء تشغيلي تجمع البلاغات، الرقابة المالية، السوابق القضائية، وتقييم الأثر في طبقة سيادية واحدة",
    description:
      "رُزن هو نظام ذكاء اصطناعي سيادي عالي الموثوقية يدعم الجهات والمؤسسات في تحويل البلاغات والبيانات التنظيمية المعقدة إلى قرارات واضحة وقابلة للتوثيق والتدقيق الجنائي — وفق التشريعات ومراسيم سلطنة عُمان ورؤية 2040.",
    directAccessBtn: "دخول المنصة السيادية المباشرة",
    demoKeyBtn: "تفعيل المفتاح السيادي الفوري (Master Key)",
    kpis: [
      { value: "6,007", label: "مادة قانونية وتشريعية", sub: "مفهرسة مع نصوص المواد الكاملة" },
      { value: "63", label: "مرسوماً سلطانياً سيادياً", sub: "تغطي العمل والجزاء والمناقصات والرقابة" },
      { value: "99.4%", label: "دقة الفرز والتصنيف", sub: "بمعايير Q-ARC وEREBUS المقننة" },
      { value: "12", label: "بروتوكول EREBUS مؤمّن", sub: "حماية سيادية وتشفير Q-ENC تام" }
    ],
    modulesTitle: "أجنحة المنظومة السيادية",
    modulesSub: "اختر الجناح التشغيلي للدخول المباشر واستكشاف القدرات",
    modules: [
      {
        id: "operations",
        title: "مركز العمليات التنفيذية",
        titleEn: "Operations Command Center",
        desc: "الفرز الفوري للبلاغات عبر نموذج الشقين (Split Deck)، تقييم المخاطر، والموجز اليومي لمعالي الوزير.",
        icon: ClipboardList,
        path: "/operations",
        badge: "الأكثر استخداماً"
      },
      {
        id: "ria",
        title: "لوحة تقييم الأثر التنظيمي (RIA)",
        titleEn: "Regulatory Impact Assessment",
        desc: "قياس مواءمة التشريعات مع محاور رؤية عُمان 2040 والآثار الاقتصادية والاجتماعية والحوكمية.",
        icon: Scale,
        path: "/ria-dashboard",
        badge: "رؤية 2040"
      },
      {
        id: "complaints",
        title: "سجل البلاغات والنزاهة",
        titleEn: "Complaint & Integrity Registry",
        desc: "استقبال البلاغات عبر القنوات المتعددة، تتبع حالات الفرز والتحقيق، وتوليد حزم الأدلة (Case Packs).",
        icon: FileSearch,
        path: "/complaint-registry",
        badge: "قنوات متعددة"
      },
      {
        id: "caselaw",
        title: "أرشيف السوابق القضائية",
        titleEn: "Case Law & Convictions Archive",
        desc: "قاعدة بيانات أحكام المحاكم وقضايا حماية المال العام والإدانة، مبالغ الهدر والاسترداد المالي.",
        icon: History,
        path: "/case-law",
        badge: "أحكام موثقة"
      },
      {
        id: "entitymap",
        title: "خريطة استخبارات الجهات",
        titleEn: "Entity Intelligence Map",
        desc: "تجميع البلاغات وتتبع تركيز المخاطر حسب الوزارات، الوحدات الحكومية، والشركات التابعة في المحافظات.",
        icon: Building2,
        path: "/entity-map",
        badge: "مؤشرات جغرافية"
      },
      {
        id: "chat",
        title: "المساعد القانوني والتشريعي",
        titleEn: "Sovereign Legal AI Intake",
        desc: "بحث واستشارات قانونية فورية مدعومة بكافة مراسيم سلطنة عُمان مع التوثيق المصدري الصارم.",
        icon: Brain,
        path: "/",
        badge: "مراسيم 2024"
      }
    ],
    valueBullets: [
      "مخرجات مفسرة ذات أثر تدقيقي كامل وليست صندوقاً أسود",
      "دعم قرار سيادي (Human-in-the-loop) — السلطة التقديرية بيد المختص",
      "أثر تدقيقي جنائي وحزم أدلة قابلة للتصدير والطباعة الرسمية",
      "تشغيل محلي سيادي مغلق (Air-Gapped) بدون أي تسريب للبيانات الحساسة"
    ],
    sections: {
      capabilities: "قدرات رُزن الأساسية",
      howItWorks: "مسار عمل المنظومة",
      productPath: "مسار النشر: رُزن لايت → رُزن-ASI",
      governance: "الحوكمة والسيادة الرقمية",
      clients: "القطاعات المستهدفة",
      contact: "تواصل معنا"
    },
    capabilities: [
      {
        icon: "complaints",
        title: "ذكاء البلاغات والتقارير",
        desc: "تصنيف وفرز تلقائي، تقييم مخاطر، إحالة ذكية، وحزم حالة جاهزة للمحققين."
      },
      {
        icon: "integrity",
        title: "تحليلات النزاهة والمخاطر",
        desc: "اكتشاف أنماط المخاطر، مؤشرات التلاعب/تضارب المصالح، وبؤر المخاطر عبر الجهات."
      },
      {
        icon: "legal",
        title: "ذكاء قانوني وتشريعي سيادي",
        desc: "بحث وتفسير قانوني/تنظيمي، مقارنة نصوص، وإعداد ملخصات أثر وامتثال قابلة للتوثيق."
      },
      {
        icon: "briefs",
        title: "لوحات مؤشرات وتقارير قيادية",
        desc: "لوحة تنفيذية + موجز يومي/أسبوعي قابل للطباعة للمسؤولين وصانعي القرار."
      }
    ],
    how: [
      {
        title: "١) إدخال بيانات من قنوات متعددة",
        desc: "استقبال بلاغات/مستندات/مراسلات/سجلات — ثم توحيدها ضمن نموذج بيانات منضبط."
      },
      {
        title: "٢) فرز وتحليل وإسناد",
        desc: "توليد تصنيف + درجة مخاطر + مؤشرات + إحالة مقترحة، مع تفسير واضح لأسباب القرار."
      },
      {
        title: "٣) حزمة أدلة + أثر تدقيقي",
        desc: "إنشاء Case Pack: ملخص، مؤشرات، توصيات، وروابط/مرفقات — مع سجل كامل للأحداث."
      },
      {
        title: "٤) لوحة قيادة + موجز يومي",
        desc: "تحويل النتائج إلى لوحات مؤشرات وبؤر مخاطر وإجراءات مقترحة قابلة للتنفيذ."
      }
    ],
    productPath: {
      lite: {
        title: "رُزن لايت (Proof-of-Value)",
        desc: "نطاق بسيط وسريع لإثبات الأثر خلال أيام ببيانات منضبطة ومؤشرات قابلة للقياس."
      },
      asi: {
        title: "رُزن-ASI (المنصة الكاملة)",
        desc: "أتمتة متعددة الدوائر، تكاملات أعمق، إدارة سياسات، قدرات بحث قانوني موسعة، وتشغيل سيادي."
      },
      note: "المبدأ: نبدأ صغيراً — نثبت الأثر — ثم نوسع النطاق بثقة وبحوكمة."
    },
    governance: [
      {
        icon: "sov",
        title: "سيادة التشغيل",
        desc: "خيارات تشغيل محلي/سيادي، وملاءمة لبيئات عالية الحساسية عند الحاجة."
      },
      {
        icon: "audit",
        title: "قابل للتدقيق",
        desc: "كل مخرج يتضمن أسباباً، مؤشرات، وسجل أحداث — لتقليل المخاطر وتعزيز الثقة."
      },
      {
        icon: "safe",
        title: "دعم قرار لا اتهام",
        desc: "رُزن يرشّح ويصنف ويقترح — لكنه لا يستبدل الحكم المهني ولا يصدر أحكاماً."
      },
      {
        icon: "deploy",
        title: "قابل للنشر بسرعة",
        desc: "حزمة PoV سريعة، ثم قابلية توسع تدريجية حسب السياسات والحوكمة."
      }
    ],
    accessSection: {
      title: "الوصول برمز الاعتماد السيادي",
      subtitle: "إذا كنت تمتلك رمز وصول معتمداً أو ترغب في إدخال رمز خاص، استخدم النموذج أدناه:",
      placeholder: "رمز الاعتماد (مثال: RUZN2024)",
      button: "تحقق ودخول",
      error: "رمز الوصول غير صحيح",
      success: "تم التحقق بنجاح — مرحباً بك في رُزن"
    },
    contact: {
      title: "تواصل معنا",
      subtitle: "للاستفسارات المؤسسية والاعتماد الرسمي لقطاعات الدولة",
      email: "info@ruzn.ai",
      cta: "طلب اعتماد مؤسسي"
    },
    footer: {
      poweredBy: "مدعوم من أكيوتيريوم تكنولوجيز (Acuterium Technologies)",
      rights: "جميع الحقوق محفوظة — منظومة رُزن السيادية v3.0"
    },
    clients: "القطاعات المستهدفة",
    clientTypes: ["الجهات الحكومية والوزارات", "المؤسسات المالية والرقابية", "الشركات الكبرى والسيادية", "القطاعات المنظمة والمناطق الاقتصادية"]
  },
  english: {
    title: "Ruzn",
    tagline: "Sovereign Intelligence for Governance, Integrity & Compliance",
    subtitle:
      "An auditable operations layer unifying complaints, compliance signals, and legal intelligence",
    description:
      "Ruzn is an advanced, high-fidelity sovereign AI system that turns complex institutional data and complaints into clear, defensible decisions—aligned with Sultanate of Oman Royal Decrees, ISAM standards, and Oman Vision 2040.",
    directAccessBtn: "Enter Sovereign Live Platform",
    demoKeyBtn: "Activate Instant Master Key Access",
    kpis: [
      { value: "6,007", label: "Legal & Regulatory Articles", sub: "Full indexed texts with articles" },
      { value: "63", label: "Sovereign Royal Decrees", sub: "Labor, Penal, Procurement & State Audit" },
      { value: "99.4%", label: "Classification & Triage Accuracy", sub: "Q-ARC & EREBUS calibrated standards" },
      { value: "12", label: "Secured EREBUS Protocols", sub: "Air-gapped ready with Q-ENC encryption" }
    ],
    modulesTitle: "Sovereign System Wings",
    modulesSub: "Select an operational wing for direct access and live exploration",
    modules: [
      {
        id: "operations",
        title: "Operations Command Center",
        titleEn: "Operations Command Center",
        desc: "Split Deck live complaints intake, real-time risk triage, and the Ministerial daily decision briefing.",
        icon: ClipboardList,
        path: "/operations",
        badge: "Flagship"
      },
      {
        id: "ria",
        title: "Regulatory Impact Assessment (RIA)",
        titleEn: "Regulatory Impact Assessment",
        desc: "Measure legislative alignment against Oman Vision 2040 economic, social, and governance pillars.",
        icon: Scale,
        path: "/ria-dashboard",
        badge: "Vision 2040"
      },
      {
        id: "complaints",
        title: "Complaints & Case Registry",
        titleEn: "Complaints & Integrity Registry",
        desc: "Multi-channel intake, triage workflow tracking, SLA monitoring, and exportable investigator Case Packs.",
        icon: FileSearch,
        path: "/complaint-registry",
        badge: "Multi-channel"
      },
      {
        id: "caselaw",
        title: "Case Law & Convictions Archive",
        titleEn: "Case Law & Convictions Archive",
        desc: "Searchable database of court convictions, public funds protection cases, and financial recovery amounts.",
        icon: History,
        path: "/case-law",
        badge: "Judicial Precedents"
      },
      {
        id: "entitymap",
        title: "Entity Intelligence Map",
        titleEn: "Entity Intelligence Map",
        desc: "Aggregated complaints and risk concentration tracking across ministries, state units, and regional branches.",
        icon: Building2,
        path: "/entity-map",
        badge: "Geographic Insights"
      },
      {
        id: "chat",
        title: "Sovereign Legal AI Assistant",
        titleEn: "Sovereign Legal AI Intake",
        desc: "Instant conversational legal research grounded in Oman's Royal Decrees with strict provenance citations.",
        icon: Brain,
        path: "/",
        badge: "Decrees 2024"
      }
    ],
    valueBullets: [
      "Explainable outputs with full audit trail (never a black box)",
      "Human-in-the-loop decision support (authority remains with officials)",
      "Printable executive briefs and forensic case packs ready for investigators",
      "Air-gapped and sovereign deployment options with zero telemetry leakage"
    ],
    sections: {
      capabilities: "Core Capabilities",
      howItWorks: "How Ruzn Works",
      productPath: "Product Path: Ruzn-Lite → Ruzn-ASI",
      governance: "Governance & Sovereign Trust",
      clients: "Target Sectors",
      contact: "Contact"
    },
    capabilities: [
      {
        icon: "complaints",
        title: "Complaints & Reports Intelligence",
        desc: "Auto classification, risk scoring, smart routing, and investigator-ready case packs."
      },
      {
        icon: "integrity",
        title: "Integrity & Risk Analytics",
        desc: "Pattern detection, conflict-of-interest signals, and entity hotspot monitoring."
      },
      {
        icon: "legal",
        title: "Sovereign Legal & Legislative Intelligence",
        desc: "Legal/regulatory research, text comparison, and defensible compliance briefs."
      },
      {
        icon: "briefs",
        title: "Executive Dashboards & Briefing",
        desc: "Leadership dashboards + printable daily/weekly decision briefs."
      }
    ],
    how: [
      {
        title: "1) Multi-channel intake",
        desc: "Ingest complaints/documents/messages/records, then normalize into a governed schema."
      },
      {
        title: "2) Triage + analysis + routing",
        desc: "Generate classification, risk score, evidence flags, and suggested routing—with rationale."
      },
      {
        title: "3) Evidence pack + audit trail",
        desc: "Produce case packs: summaries, signals, recommended actions, and full event logs."
      },
      {
        title: "4) Dashboards + daily briefs",
        desc: "Convert results into KPIs, hotspots, and leadership-ready briefings."
      }
    ],
    productPath: {
      lite: {
        title: "Ruzn-Lite (Proof of Value)",
        desc: "A minimal, fast deployment to prove impact in days with measurable KPIs."
      },
      asi: {
        title: "Ruzn-ASI (Full Platform)",
        desc: "Multi-directorate workflows, deeper integrations, policy governance, and sovereign-scale deployment."
      },
      note: "Start small → prove impact → scale safely under governance."
    },
    governance: [
      {
        icon: "sov",
        title: "Sovereign deployment",
        desc: "On-prem / sovereign options designed for high-sensitivity environments."
      },
      {
        icon: "audit",
        title: "Auditable by design",
        desc: "Every output includes rationale, flags, and traceable event logs."
      },
      {
        icon: "safe",
        title: "Decision support, not accusation",
        desc: "Ruzn recommends and prioritizes—professionals remain the authority."
      },
      {
        icon: "deploy",
        title: "Rapid rollout",
        desc: "Fast PoV package with a controlled scale-up roadmap."
      }
    ],
    accessSection: {
      title: "Platform Access Verification",
      subtitle: "If you hold a designated access credential or master code, enter it below:",
      placeholder: "Access Code (e.g., RUZN2024)",
      button: "Verify & Enter",
      error: "Invalid access code",
      success: "Verification successful — Welcome to Ruzn"
    },
    contact: {
      title: "Contact Us",
      subtitle: "For institutional inquiries and official state onboarding",
      email: "info@ruzn.ai",
      cta: "Request Institutional Access"
    },
    footer: {
      poweredBy: "Powered by Acuterium Technologies",
      rights: "All Rights Reserved — Ruzn Sovereign Platform v3.0"
    },
    clients: "Who It’s For",
    clientTypes: ["Government Entities & Ministries", "State Audit & Integrity Bodies", "Sovereign Wealth Funds & SOEs", "Regulated Sectors & Free Zones"]
  }
};

interface LandingProps {
  onAccessGranted: () => void;
}

export default function Landing({ onAccessGranted }: LandingProps) {
  const [language, setLanguage] = useState<Language>("arabic");
  const [accessCode, setAccessCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Request access form state
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestName, setRequestName] = useState("");
  const [requestEmail, setRequestEmail] = useState("");
  const [requestOrg, setRequestOrg] = useState("");
  const [requestReason, setRequestReason] = useState("");

  const isRTL = language === "arabic";
  const text = UI_TEXT[language];

  // Direct 1-Click Sovereign Entry
  const handleDirectSovereignEntry = (targetPath = "/") => {
    sessionStorage.setItem("sovereign_auth_active", "granted");
    toast.success(
      language === "arabic" 
        ? "مرحباً بك في منصة رُزن السيادية — تم منح صلاحية الوصول المباشر" 
        : "Welcome to Ruzn Sovereign Platform — Live access activated"
    );
    if (targetPath && targetPath !== "/") {
      window.location.href = targetPath;
    } else {
      onAccessGranted();
    }
  };

  // 1-Click Demo Master Key Activation
  const handleMasterKeyActivation = () => {
    setAccessCode("RUZN2024");
    sessionStorage.setItem("sovereign_auth_active", "granted");
    toast.success(
      language === "arabic" 
        ? "تم تفعيل المفتاح الرئيسي السيادي بنجاح (RUZN2024)" 
        : "Sovereign Master Key activated (RUZN2024)"
    );
    setTimeout(() => {
      onAccessGranted();
    }, 400);
  };

  // Server-side validation mutation
  const validateCodeMutation = trpc.access.validateCode.useMutation({
    onSuccess: (data) => {
      if (data.valid) {
        toast.success(text.accessSection.success);
        sessionStorage.setItem("sovereign_auth_active", "granted");
        onAccessGranted();
      } else {
        toast.error(data.message || text.accessSection.error);
      }
      setIsVerifying(false);
    },
    onError: (error) => {
      toast.error(error.message || text.accessSection.error);
      setIsVerifying(false);
    }
  });

  // Request access mutation
  const requestAccessMutation = trpc.access.requestAccess.useMutation({
    onSuccess: () => {
      toast.success(language === "arabic" 
        ? "تم إرسال طلبك بنجاح. سيتم التواصل معك قريباً."
        : "Your request has been submitted. Our team will contact you shortly.");
      setShowRequestForm(false);
      setRequestName("");
      setRequestEmail("");
      setRequestOrg("");
      setRequestReason("");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = accessCode.trim().toUpperCase();
    if (!cleanCode) return;
    
    // Sovereign Chairman Master Codes (instant client-side bypass)
    const MASTER_CODES = [
      'RUZN2024',
      'RUZN-2024',
      'RUZN',
      'RZN-MASTER-DRJAY',
      'RZN-CHAIRMAN',
      'ACUTERIUM2026',
      'SOVEREIGN2026',
      'ACUTERIUM',
      'ALMAJD',
      'ASATEER'
    ];
    if (MASTER_CODES.includes(cleanCode) || cleanCode.startsWith('RZN-MASTER')) {
      toast.success(text.accessSection.success);
      sessionStorage.setItem("sovereign_auth_active", "granted");
      onAccessGranted();
      return;
    }

    setIsVerifying(true);
    validateCodeMutation.mutate({ code: cleanCode });
  };

  const handleRequestAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestName.trim() || !requestEmail.trim()) {
      toast.error(language === "arabic" ? "يرجى إدخال الاسم والبريد الإلكتروني" : "Please enter name and email");
      return;
    }
    requestAccessMutation.mutate({
      name: requestName.trim(),
      email: requestEmail.trim(),
      organization: requestOrg.trim() || undefined,
      reason: requestReason.trim() || undefined
    });
  };

  const bgStyle = useMemo(
    () => ({
      background:
        "radial-gradient(1200px 600px at 60% 18%, rgba(214,179,106,.16), transparent 55%)," +
        "radial-gradient(900px 500px at 20% 80%, rgba(96,165,250,.10), transparent 60%)," +
        "linear-gradient(180deg, #050506, #0a0a0c)",
    }),
    []
  );

  return (
    <div
      className="min-h-screen text-foreground font-body selection:bg-[rgba(214,179,106,0.3)]"
      dir={isRTL ? "rtl" : "ltr"}
      style={bgStyle}
    >
      {/* ─── Sovereign Top Navigation Bar ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/45 backdrop-blur-xl border-b border-[rgba(214,179,106,0.18)] shadow-deep">
        <div className="container max-w-7xl mx-auto px-4 py-3.5">
          <div className="flex items-center justify-between gap-4">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <img
                src="/ruzn-logo-v-1-TRANS.png"
                alt="Ruzn Sovereign Emblem"
                className="h-10 w-10 object-contain drop-shadow-[0_0_12px_rgba(214,179,106,0.45)]"
              />
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold ruzn-gold-gradient font-heading leading-tight">
                  {text.title}
                </span>
                <span className="text-[10px] text-[rgba(214,179,106,0.85)] tracking-wider -mt-1 hidden sm:block">
                  SOVEREIGN GOVERNANCE INTELLIGENCE
                </span>
              </div>
            </div>

            {/* Quick Wing Links (Desktop) */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={() => handleDirectSovereignEntry("/operations")}
                className="ruzn-tab text-xs hover:text-[rgba(214,179,106,0.98)]"
              >
                {language === "arabic" ? "العمليات" : "Operations"}
              </button>
              <button
                onClick={() => handleDirectSovereignEntry("/ria-dashboard")}
                className="ruzn-tab text-xs hover:text-[rgba(214,179,106,0.98)]"
              >
                {language === "arabic" ? "تقييم الأثر" : "RIA"}
              </button>
              <button
                onClick={() => handleDirectSovereignEntry("/case-law")}
                className="ruzn-tab text-xs hover:text-[rgba(214,179,106,0.98)]"
              >
                {language === "arabic" ? "السوابق" : "Case Law"}
              </button>
              <button
                onClick={() => handleDirectSovereignEntry("/complaint-registry")}
                className="ruzn-tab text-xs hover:text-[rgba(214,179,106,0.98)]"
              >
                {language === "arabic" ? "سجل البلاغات" : "Complaints"}
              </button>
              <button
                onClick={() => handleDirectSovereignEntry("/entity-map")}
                className="ruzn-tab text-xs hover:text-[rgba(214,179,106,0.98)]"
              >
                {language === "arabic" ? "الجهات" : "Entity Map"}
              </button>
            </div>

            {/* Language & Direct Enter CTA */}
            <div className="flex items-center gap-2.5">
              {/* Language toggle */}
              <div className="ruzn-glass-soft rounded-full p-1 flex items-center gap-1 border-[rgba(214,179,106,0.18)]">
                <button
                  type="button"
                  onClick={() => setLanguage("arabic")}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                    language === "arabic"
                      ? "bg-[rgba(214,179,106,.20)] border border-[rgba(214,179,106,.45)] text-[rgba(214,179,106,1)]"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  العربية
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("english")}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                    language === "english"
                      ? "bg-[rgba(214,179,106,.20)] border border-[rgba(214,179,106,.45)] text-[rgba(214,179,106,1)]"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  English
                </button>
              </div>

              {/* Direct Access CTA in Header */}
              <button
                onClick={() => handleDirectSovereignEntry("/")}
                className="ruzn-btn-gold text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-[0_0_20px_rgba(214,179,106,0.25)]"
              >
                <Zap className="w-4 h-4 text-[#d6b36a]" />
                <span className="hidden sm:inline">{language === "arabic" ? "دخول المنصة" : "Enter Platform"}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Hero Section ─── */}
      <section className="pt-32 pb-16 px-4 relative overflow-hidden">
        <div className="container max-w-6xl mx-auto text-center">
          {/* Sovereign Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full ruzn-glass-soft border-[rgba(214,179,106,0.3)] mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-[rgba(214,179,106,.98)]" />
            <span className="text-xs sm:text-sm font-semibold text-[rgba(214,179,106,.98)]">
              {text.tagline}
            </span>
          </div>

          {/* Grand Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-6 ruzn-gold-gradient font-heading tracking-tight leading-tight">
            {text.title}
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-2xl text-white/90 mb-5 font-heading font-medium max-w-4xl mx-auto leading-relaxed">
            {text.subtitle}
          </p>

          {/* Descriptive Narrative */}
          <p className="text-sm sm:text-base text-white/75 max-w-3xl mx-auto mb-10 leading-relaxed font-body">
            {text.description}
          </p>

          {/* Primary Action Buttons (Instant Entry) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <button
              onClick={() => handleDirectSovereignEntry("/")}
              className="ruzn-btn-gold ruzn-btn-lg w-full sm:w-auto text-base font-bold flex items-center justify-center gap-3 px-8 shadow-[0_0_35px_rgba(214,179,106,0.35)] hover:scale-[1.02] transition-transform"
            >
              <ShieldCheck className="w-5 h-5 text-[#d6b36a]" />
              {text.directAccessBtn}
              <ArrowRight className={`w-5 h-5 ${isRTL ? "rotate-180" : ""}`} />
            </button>

            <button
              onClick={handleMasterKeyActivation}
              className="ruzn-btn ruzn-btn-lg w-full sm:w-auto text-sm sm:text-base font-semibold flex items-center justify-center gap-2.5 px-6 border-[rgba(214,179,106,0.35)] hover:border-[rgba(214,179,106,0.7)] text-[rgba(214,179,106,0.95)]"
            >
              <KeyRound className="w-4 h-4" />
              {text.demoKeyBtn}
            </button>
          </div>

          {/* 4 Sovereign Key Performance Indicators (KPIs) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mb-12">
            {text.kpis.map((kpi, idx) => (
              <div key={idx} className="ruzn-kpi p-5 text-center">
                <div className="ruzn-kpi-value text-2xl sm:text-4xl mb-1 text-[rgba(214,179,106,0.98)] font-heading">
                  {kpi.value}
                </div>
                <div className="font-semibold text-xs sm:text-sm text-white/90 mb-1">
                  {kpi.label}
                </div>
                <div className="text-[11px] text-white/55">
                  {kpi.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Value Bullets */}
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {text.valueBullets.map((bullet, i) => (
              <div
                key={i}
                className="ruzn-glass-soft rounded-2xl px-4 py-3.5 text-white/85 flex items-start gap-3 border-[rgba(214,179,106,0.14)] text-start"
              >
                <CheckCircle className="w-5 h-5 text-[rgba(214,179,106,.98)] shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm leading-relaxed">{bullet}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6-Wing Sovereign Core Modules Showcase ─── */}
      <section className="py-16 px-4 border-t border-[rgba(214,179,106,0.12)]">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white/95 font-heading mb-3 ruzn-gold-gradient">
              {text.modulesTitle}
            </h2>
            <p className="text-sm sm:text-base text-white/65 max-w-2xl mx-auto">
              {text.modulesSub}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {text.modules.map((mod) => {
              const IconComp = mod.icon;
              return (
                <div
                  key={mod.id}
                  className="ruzn-card p-6 flex flex-col justify-between hover:border-[rgba(214,179,106,0.5)] transition-all group hover:scale-[1.01]"
                >
                  <div>
                    {/* Header: Icon & Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-[rgba(214,179,106,0.35)] bg-[rgba(214,179,106,0.12)] shadow-sm">
                        <IconComp className="w-6 h-6 text-[rgba(214,179,106,0.98)]" />
                      </div>
                      <span className="ruzn-tag-high text-xs px-2.5 py-1">
                        {mod.badge}
                      </span>
                    </div>

                    {/* Titles */}
                    <h3 className="text-lg font-bold text-white/95 font-heading mb-1 group-hover:text-[rgba(214,179,106,1)] transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-[rgba(214,179,106,0.75)] mb-3 font-mono">
                      {mod.titleEn}
                    </p>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-white/70 leading-relaxed mb-6">
                      {mod.desc}
                    </p>
                  </div>

                  {/* Launch Button */}
                  <button
                    onClick={() => handleDirectSovereignEntry(mod.path)}
                    className="ruzn-btn-gold w-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 py-2.5 rounded-xl"
                  >
                    <span>{language === "arabic" ? "فتح الجناح التشغيلي" : "Launch Module"}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Capabilities Section ─── */}
      <section className="py-16 px-4 border-t border-[rgba(214,179,106,0.12)] bg-black/20">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white/95 font-heading">
              {text.sections.capabilities}
            </h2>
            <p className="text-sm text-white/65 mt-2">
              {language === "arabic"
                ? "طبقة ذكاء موحدة للعمليات عالية الحساسية — مع حوكمة كاملة قابلة للتدقيق القضائي."
                : "One intelligence layer for high-stakes operations—auditable under judicial governance."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {text.capabilities.map((cap, i) => (
              <div key={i} className="ruzn-card p-6 border-[rgba(214,179,106,0.18)]">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center border border-[rgba(214,179,106,0.3)] bg-[rgba(214,179,106,0.1)] mb-4 text-[rgba(214,179,106,0.98)]">
                  {i === 0 && <FileSearch className="w-6 h-6" />}
                  {i === 1 && <Radar className="w-6 h-6" />}
                  {i === 2 && <ScrollText className="w-6 h-6" />}
                  {i === 3 && <BarChart3 className="w-6 h-6" />}
                </div>
                <h3 className="font-extrabold text-base text-white/95 font-heading mb-2">
                  {cap.title}
                </h3>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                  {cap.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it Works Section ─── */}
      <section className="py-16 px-4 border-t border-[rgba(214,179,106,0.12)]">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white/95 font-heading">
              {text.sections.howItWorks}
            </h2>
            <p className="text-sm text-white/65 mt-2">
              {language === "arabic"
                ? "دورة حياة البلاغ والتحليل من الاستقبال وحتى حزمة التحقيق"
                : "Lifecycle from multi-channel intake to investigator case packs"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {text.how.map((step, idx) => (
              <div key={idx} className="ruzn-card p-5 border-[rgba(214,179,106,0.2)] flex flex-col justify-between">
                <div>
                  <div className="text-xs font-mono font-bold text-[rgba(214,179,106,0.9)] mb-2">
                    PHASE 0{idx + 1}
                  </div>
                  <h3 className="font-bold text-white/90 text-sm mb-2 font-heading">
                    {step.title}
                  </h3>
                  <p className="text-xs text-white/70 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Sovereign Access Code & Credential Section ─── */}
      <section className="py-16 px-4 border-t border-[rgba(214,179,106,0.12)] bg-black/30">
        <div className="container max-w-md mx-auto text-center">
          <div className="ruzn-card p-7 border-[rgba(214,179,106,0.3)] shadow-[0_0_30px_rgba(214,179,106,0.15)]">
            <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center border border-[rgba(214,179,106,0.35)] bg-[rgba(214,179,106,0.12)]">
              <Lock className="w-6 h-6 text-[rgba(214,179,106,0.98)]" />
            </div>
            
            <h3 className="text-lg font-bold text-white/95 font-heading mb-1.5">
              {text.accessSection.title}
            </h3>
            <p className="text-xs text-white/70 mb-5 leading-relaxed">
              {text.accessSection.subtitle}
            </p>

            {!showRequestForm ? (
              <>
                <form onSubmit={handleAccessSubmit} className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      placeholder={text.accessSection.placeholder}
                      className="ruzn-input text-center text-sm"
                    />
                    <button
                      type="submit"
                      disabled={isVerifying || !accessCode}
                      className="ruzn-btn-gold text-xs font-bold px-4 shrink-0 rounded-xl"
                    >
                      {isVerifying ? "..." : text.accessSection.button}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleMasterKeyActivation}
                    className="w-full ruzn-btn text-xs text-[rgba(214,179,106,0.9)] border-[rgba(214,179,106,0.25)] hover:border-[rgba(214,179,106,0.5)] py-2 rounded-xl"
                  >
                    {language === "arabic" ? "استخدام الرمز الافتراضي (RUZN2024)" : "Use Default Master Key (RUZN2024)"}
                  </button>
                </form>

                <div className="mt-5 pt-4 border-t border-white/10 text-center">
                  <button
                    type="button"
                    onClick={() => setShowRequestForm(true)}
                    className="text-xs text-white/60 hover:text-[rgba(214,179,106,0.9)] underline"
                  >
                    {language === "arabic" ? "طلب ترخيص أو اعتماد جديد لجهة حكومية" : "Request Institutional Access Credential"}
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleRequestAccess} className="space-y-3 text-start">
                <Input
                  type="text"
                  value={requestName}
                  onChange={(e) => setRequestName(e.target.value)}
                  placeholder={language === "arabic" ? "الاسم الكامل *" : "Full Name *"}
                  required
                  className="ruzn-input text-xs"
                />
                <Input
                  type="email"
                  value={requestEmail}
                  onChange={(e) => setRequestEmail(e.target.value)}
                  placeholder={language === "arabic" ? "البريد الإلكتروني الرسمي *" : "Official Email *"}
                  required
                  className="ruzn-input text-xs"
                />
                <Input
                  type="text"
                  value={requestOrg}
                  onChange={(e) => setRequestOrg(e.target.value)}
                  placeholder={language === "arabic" ? "المؤسسة / الجهة الحكومية" : "Government Entity / Organization"}
                  className="ruzn-input text-xs"
                />
                <Textarea
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  placeholder={language === "arabic" ? "الغرض من الاستخدام والتقييم" : "Evaluation Purpose"}
                  rows={2}
                  className="ruzn-input text-xs resize-none"
                />
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowRequestForm(false)}
                    className="ruzn-btn flex-1 text-xs"
                  >
                    {language === "arabic" ? "إلغاء" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    disabled={requestAccessMutation.isPending || !requestName || !requestEmail}
                    className="ruzn-btn-gold flex-1 text-xs font-bold"
                  >
                    {requestAccessMutation.isPending 
                      ? (language === "arabic" ? "جاري الإرسال..." : "Sending...") 
                      : (language === "arabic" ? "إرسال الطلب" : "Submit")}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ─── Clients & Governance Section ─── */}
      <section className="py-14 px-4 border-t border-[rgba(214,179,106,0.12)]">
        <div className="container max-w-6xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-white/90 font-heading">
            {text.clients}
          </h2>

          <div className="flex flex-wrap justify-center gap-3">
            {text.clientTypes.map((client, idx) => (
              <div
                key={idx}
                className="ruzn-glass-soft px-5 py-2.5 rounded-2xl border-[rgba(214,179,106,0.2)] text-xs sm:text-sm text-white/80 flex items-center gap-2"
              >
                <Building2 className="w-4 h-4 text-[rgba(214,179,106,0.9)]" />
                <span>{client}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-8 px-4 border-t border-[rgba(214,179,106,0.16)] bg-black/60">
        <div className="container max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-start">
          <div className="flex items-center gap-3 justify-center">
            <img
              src="/ruzn-logo-v-1-TRANS.png"
              alt="Ruzn Emblem"
              className="h-7 w-7 object-contain opacity-80"
            />
            <span className="text-xs text-white/60">
              {text.footer.poweredBy}
            </span>
          </div>

          <div className="text-xs text-white/50">
            {text.footer.rights}
          </div>
        </div>
      </footer>
    </div>
  );
}
