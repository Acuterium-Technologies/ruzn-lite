import { useState } from "react";
import SovereignHeader from "@/components/SovereignHeader";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  Target,
  BarChart3,
  Shield,
  Scale,
  Building2,
  Landmark,
  RefreshCw,
  Loader2,
  Plus,
  Sparkles,
  Eye,
  Brain,
  Zap,
  ArrowRight
} from "lucide-react";
import { useLocation } from "wouter";

function getRiskBadgeColor(risk: string | null) {
  switch (risk) {
    case "CRITICAL": return "ruzn-tag-high text-xs";
    case "HIGH": return "ruzn-tag-high text-xs";
    case "MEDIUM": return "ruzn-tag-med text-xs";
    case "LOW": return "ruzn-tag-low text-xs";
    case "NEGLIGIBLE": return "ruzn-tag-info text-xs";
    default: return "ruzn-tag-info text-xs";
  }
}

function getStatusBadge(status: string | null) {
  switch (status) {
    case "approved": return <span className="ruzn-tag-low text-xs">معتمد</span>;
    case "draft": return <span className="ruzn-tag-info text-xs">مسودة</span>;
    case "pending_review": return <span className="ruzn-tag-med text-xs">بانتظار المراجعة</span>;
    case "rejected": return <span className="ruzn-tag-high text-xs">مرفوض</span>;
    case "archived": return <span className="ruzn-tag-info text-xs">مؤرشف</span>;
    default: return <span className="ruzn-tag-info text-xs">{status}</span>;
  }
}

function getSeverityIcon(severity: string | null) {
  switch (severity) {
    case "critical": return <AlertTriangle className="h-5 w-5 text-red-400" />;
    case "warning": return <Clock className="h-5 w-5 text-yellow-400" />;
    case "info": return <CheckCircle2 className="h-5 w-5 text-blue-400" />;
    default: return <FileText className="h-5 w-5 text-white/60" />;
  }
}

export default function RIADashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "assessments" | "alerts">("overview");
  const [isNewAssessmentOpen, setIsNewAssessmentOpen] = useState(false);
  
  // Fetch RIA data
  const { data: riaData, isLoading: riaLoading, refetch: refetchRia } = trpc.ria.list.useQuery();
  const { data: vision2040Data, isLoading: vision2040Loading } = trpc.ria.getVision2040Stats.useQuery();
  const { data: alertsData, isLoading: alertsLoading, refetch: refetchAlerts } = trpc.alerts.list.useQuery();
  
  const [, setLocation] = useLocation();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  
  // AI Analysis mutation
  const analyzeText = trpc.ria.analyzeText.useMutation({
    onSuccess: (data) => {
      setAnalysisResult(data.analysis);
      setIsAnalyzing(false);
      toast.success("تم إنجاز التحليل الذكي للأثر التشريعي بنجاح");
    },
    onError: (error) => {
      setIsAnalyzing(false);
      toast.error(`خطأ في التحليل: ${error.message}`);
    }
  });
  
  // Create assessment with AI analysis mutation
  const createWithAnalysis = trpc.ria.createWithAnalysis.useMutation({
    onSuccess: (data) => {
      toast.success("تم إنشاء تقييم الأثر التنظيمي مع التحليل الذكي");
      setIsNewAssessmentOpen(false);
      setAnalysisResult(null);
      refetchRia();
      if (data.id) {
        setLocation(`/ria-dashboard/assessment/${data.id}`);
      }
    },
    onError: (error) => {
      toast.error(`خطأ: ${error.message}`);
    }
  });
  
  // Legacy create assessment mutation (without AI)
  const createAssessment = trpc.ria.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء التقييم بنجاح");
      setIsNewAssessmentOpen(false);
      refetchRia();
    },
    onError: (error) => {
      toast.error(`خطأ: ${error.message}`);
    }
  });
  
  // Form state for new assessment
  const [newAssessment, setNewAssessment] = useState({
    title: "",
    titleArabic: "",
    legislationType: "regulation" as const,
    issuingAuthority: "",
    legislativeText: "",
    affectedSectors: [] as string[]
  });
  
  const handleAnalyzeText = () => {
    if (!newAssessment.legislativeText || newAssessment.legislativeText.length < 10) {
      toast.error("يرجى إدخال نص التشريع أولاً (10 أحرف على الأقل)");
      return;
    }
    setIsAnalyzing(true);
    analyzeText.mutate({
      legislativeText: newAssessment.legislativeText,
      title: newAssessment.title,
      issuingAuthority: newAssessment.issuingAuthority,
      legislationType: newAssessment.legislationType
    });
  };
  
  const handleCreateAssessment = () => {
    if (!newAssessment.title || !newAssessment.issuingAuthority || !newAssessment.legislativeText) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    
    if (analysisResult) {
      createWithAnalysis.mutate({
        ...newAssessment,
        analysis: analysisResult
      });
    } else {
      createAssessment.mutate(newAssessment);
    }
  };
  
  const handleRefresh = () => {
    refetchRia();
    refetchAlerts();
    toast.success("تم تحديث بيانات التقييم والمؤشرات بنجاح");
  };

  // Vision 2040 pillars with live data
  const vision2040Pillars = [
    { 
      id: "economy", 
      name: "اقتصاد متنوع ومستدام", 
      nameEn: "Economy & Development", 
      icon: TrendingUp, 
      score: vision2040Data?.pillars?.economy?.score || 0 
    },
    { 
      id: "society", 
      name: "مجتمع إنسان وقدرات", 
      nameEn: "Society & Human Capital", 
      icon: Building2, 
      score: vision2040Data?.pillars?.society?.score || 0 
    },
    { 
      id: "governance", 
      name: "حوكمة رشيدة ونزاهة", 
      nameEn: "Governance & Institutional", 
      icon: Landmark, 
      score: vision2040Data?.pillars?.governance?.score || 0 
    },
    { 
      id: "environment", 
      name: "بيئة مستدامة وموارد", 
      nameEn: "Sustainable Environment", 
      icon: Target, 
      score: vision2040Data?.pillars?.environment?.score || 0 
    },
  ];

  const isLoading = riaLoading || vision2040Loading || alertsLoading;

  return (
    <div 
      className="min-h-screen text-foreground flex flex-col font-body"
      dir="rtl"
      style={{
        background: 'radial-gradient(1200px 600px at 60% 18%, rgba(214,179,106,.16), transparent 55%), radial-gradient(900px 500px at 20% 80%, rgba(96,165,250,.10), transparent 60%), linear-gradient(180deg, #050506, #0a0a0c)'
      }}
    >
      <SovereignHeader
        title="لوحة تقييم الأثر التنظيمي (RIA)"
        subtitle="قياس مواءمة التشريعات واللوائح والقرارات الوزارية مع محاور رؤية عُمان 2040"
        language="arabic"
        activeSuite="ria"
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="ruzn-btn text-xs sm:text-sm flex items-center gap-1.5 px-3.5 py-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>تحديث</span>
            </button>

            <Dialog open={isNewAssessmentOpen} onOpenChange={setIsNewAssessmentOpen}>
              <DialogTrigger asChild>
                <button className="ruzn-btn-gold text-xs sm:text-sm font-bold flex items-center gap-2 px-4 py-2 rounded-xl">
                  <Plus className="h-4 w-4" />
                  <span>تقييم جديد</span>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl ruzn-card max-h-[90vh] overflow-y-auto p-6" dir="rtl">
                <DialogHeader className="mb-4 pb-3 border-b border-[rgba(214,179,106,0.2)]">
                  <DialogTitle className="text-xl font-bold ruzn-gold-gradient font-heading">
                    إنشاء تقييم أثر تنظيمي جديد (RIA)
                  </DialogTitle>
                  <DialogDescription className="text-xs text-white/60">
                    أدخل بيانات التشريع أو اللائحة التنظيمية لحساب التوافق مع رؤية 2040
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="titleArabic" className="text-xs text-white/80">العنوان بالعربية *</Label>
                      <input
                        id="titleArabic"
                        placeholder="مثال: لائحة حوكمة العقود والمشتريات"
                        value={newAssessment.titleArabic}
                        onChange={(e) => setNewAssessment({ ...newAssessment, titleArabic: e.target.value })}
                        className="ruzn-input text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="title" className="text-xs text-white/80">العنوان بالإنجليزية (English Title) *</Label>
                      <input
                        id="title"
                        placeholder="e.g. Procurement Governance Bylaw"
                        value={newAssessment.title}
                        onChange={(e) => setNewAssessment({ ...newAssessment, title: e.target.value })}
                        className="ruzn-input text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="legislationType" className="text-xs text-white/80">نوع التشريع *</Label>
                      <select
                        id="legislationType"
                        value={newAssessment.legislationType}
                        onChange={(e: any) => setNewAssessment({ ...newAssessment, legislationType: e.target.value })}
                        className="ruzn-input text-sm"
                      >
                        <option value="royal_decree">مرسوم سلطاني</option>
                        <option value="ministerial_decision">قرار وزاري</option>
                        <option value="regulation">لائحة تنظيمية</option>
                        <option value="amendment">تعديل تشريعي</option>
                        <option value="policy">سياسة عامة</option>
                        <option value="circular">تعميم رسمي</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="issuingAuthority" className="text-xs text-white/80">الجهة المصدرة *</Label>
                      <input
                        id="issuingAuthority"
                        placeholder="مثال: وزارة المالية / الأمانة العامة للضرائب"
                        value={newAssessment.issuingAuthority}
                        onChange={(e) => setNewAssessment({ ...newAssessment, issuingAuthority: e.target.value })}
                        className="ruzn-input text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="legislativeText" className="text-xs text-white/80">نص التشريع أو المواد المقترحة *</Label>
                    <textarea
                      id="legislativeText"
                      placeholder="أدخل النص الكامل للمواد التشريعية المراد قياس أثرها ومواءمتها التنظيمية..."
                      value={newAssessment.legislativeText}
                      onChange={(e) => {
                        setNewAssessment({ ...newAssessment, legislativeText: e.target.value });
                        setAnalysisResult(null);
                      }}
                      className="ruzn-input min-h-[140px] text-sm resize-y"
                    />
                  </div>
                  
                  {/* AI Analysis Button */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleAnalyzeText}
                      disabled={isAnalyzing || !newAssessment.legislativeText}
                      className="ruzn-btn-gold text-xs sm:text-sm font-bold flex items-center gap-2 px-4 py-2.5 rounded-xl disabled:opacity-50"
                    >
                      {isAnalyzing ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> جاري التحليل الذكي السيادي...</>
                      ) : (
                        <><Brain className="h-4 w-4" /> تحليل الأثر الذكي (EREBUS-RIA)</>
                      )}
                    </button>
                    {analysisResult && (
                      <span className="ruzn-tag-low text-xs flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5" />
                        تم استخراج النتائج
                      </span>
                    )}
                  </div>
                  
                  {/* AI Analysis Preview Card */}
                  {analysisResult && (
                    <div className="ruzn-card p-4 border-[rgba(214,179,106,0.35)] mt-3">
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                        <span className="text-xs font-bold text-[rgba(214,179,106,0.98)] flex items-center gap-1.5">
                          <Sparkles className="h-4 w-4" /> نتائج تقييم الأثر الفوري
                        </span>
                        <span className="text-lg font-bold text-[rgba(214,179,106,0.98)]">
                          توافق رؤية 2040: {analysisResult.vision2040Score}%
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-center mb-3">
                        <div className="ruzn-glass-soft p-2 rounded-xl">
                          <div className="text-[11px] text-white/60">اقتصادي</div>
                          <div className="text-sm font-bold text-blue-400">{analysisResult.economicImpact}%</div>
                        </div>
                        <div className="ruzn-glass-soft p-2 rounded-xl">
                          <div className="text-[11px] text-white/60">اجتماعي</div>
                          <div className="text-sm font-bold text-green-400">{analysisResult.socialImpact}%</div>
                        </div>
                        <div className="ruzn-glass-soft p-2 rounded-xl">
                          <div className="text-[11px] text-white/60">حوكمة</div>
                          <div className="text-sm font-bold text-purple-400">{analysisResult.governanceImpact}%</div>
                        </div>
                        <div className="ruzn-glass-soft p-2 rounded-xl">
                          <div className="text-[11px] text-white/60">بيئي</div>
                          <div className="text-sm font-bold text-teal-400">{analysisResult.environmentImpact}%</div>
                        </div>
                      </div>

                      <p className="text-xs text-white/80 leading-relaxed bg-black/30 p-2.5 rounded-xl border border-white/10">
                        {analysisResult.summary}
                      </p>
                    </div>
                  )}
                </div>

                <DialogFooter className="mt-4 pt-3 border-t border-[rgba(214,179,106,0.16)] flex gap-2">
                  <DialogClose asChild>
                    <button className="ruzn-btn text-xs px-4 py-2">إلغاء</button>
                  </DialogClose>
                  <button 
                    onClick={handleCreateAssessment}
                    disabled={createAssessment.isPending || createWithAnalysis.isPending}
                    className="ruzn-btn-gold text-xs font-bold px-5 py-2 rounded-xl"
                  >
                    {(createAssessment.isPending || createWithAnalysis.isPending) ? (
                      <><Loader2 className="h-4 w-4 animate-spin ml-1" /> جاري الحفظ...</>
                    ) : analysisResult ? (
                      <><Sparkles className="h-4 w-4 ml-1" /> اعتماد التقييم مع النتائج</>
                    ) : (
                      <><Plus className="h-4 w-4 ml-1" /> حفظ التقييم</>
                    )}
                  </button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <div className="container max-w-7xl mx-auto space-y-6 p-3 sm:p-5 md:p-6 font-body">

        {/* ─── Vision 2040 Key Pillars (Sovereign KPI Deck) ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {vision2040Pillars.map((pillar) => {
            const IconComp = pillar.icon;
            return (
              <div key={pillar.id} className="ruzn-kpi p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-[rgba(214,179,106,0.3)] bg-[rgba(214,179,106,0.12)]">
                    <IconComp className="h-5 w-5 text-[rgba(214,179,106,0.98)]" />
                  </div>
                  <span className="text-2xl font-extrabold text-[rgba(214,179,106,0.98)] font-heading">
                    {vision2040Loading ? <Loader2 className="h-5 w-5 animate-spin" /> : `${pillar.score}%`}
                  </span>
                </div>
                <h3 className="font-bold text-white/95 text-sm mb-1">{pillar.name}</h3>
                <p className="text-[11px] text-white/55 mb-2.5">{pillar.nameEn}</p>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#b8924d] to-[#d6b36a] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(pillar.score, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── Segmented Tabs ─── */}
        <div className="flex gap-2 border-b border-white/10 pb-3 flex-wrap">
          <button
            onClick={() => setActiveTab("overview")}
            className={`ruzn-tab text-xs sm:text-sm font-semibold flex items-center gap-2 px-4 py-2.5 rounded-xl ${
              activeTab === "overview" ? "active" : ""
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>نظرة عامة ومؤشرات المواءمة</span>
          </button>

          <button
            onClick={() => setActiveTab("assessments")}
            className={`ruzn-tab text-xs sm:text-sm font-semibold flex items-center gap-2 px-4 py-2.5 rounded-xl ${
              activeTab === "assessments" ? "active" : ""
            }`}
          >
            <Scale className="h-4 w-4" />
            <span>سجل التقييمات التشريعية</span>
            {riaData?.assessments?.length ? (
              <span className="ruzn-tag-info text-[10px] px-2 py-0.5 rounded-full">
                {riaData.assessments.length}
              </span>
            ) : null}
          </button>

          <button
            onClick={() => setActiveTab("alerts")}
            className={`ruzn-tab text-xs sm:text-sm font-semibold flex items-center gap-2 px-4 py-2.5 rounded-xl ${
              activeTab === "alerts" ? "active" : ""
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            <span>التنبيهات التشريعية</span>
            {alertsData?.stats?.unread ? (
              <span className="ruzn-tag-high text-[10px] px-2 py-0.5 rounded-full">
                {alertsData.stats.unread}
              </span>
            ) : null}
          </button>
        </div>

        {/* ─── Tab Content 1: Overview ─── */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Summary Stats */}
            <div className="ruzn-card p-6">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
                <BarChart3 className="w-5 h-5 text-[rgba(214,179,106,0.98)]" />
                <h3 className="font-bold text-white/95 text-base font-heading">إحصائيات التقييمات</h3>
              </div>

              {riaLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-[#d6b36a]" />
                </div>
              ) : (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between p-2.5 ruzn-glass-soft rounded-xl">
                    <span className="text-xs text-white/70">إجمالي التقييمات</span>
                    <span className="text-xl font-bold text-white font-heading">{riaData?.stats?.total || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 ruzn-glass-soft rounded-xl">
                    <span className="text-xs text-white/70">مسودات قيد الإعداد</span>
                    <span className="text-lg font-semibold text-gray-300">{riaData?.stats?.draft || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 ruzn-glass-soft rounded-xl">
                    <span className="text-xs text-white/70">بانتظار المراجعة والاعتماد</span>
                    <span className="text-lg font-semibold text-yellow-400">{riaData?.stats?.pending_review || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 ruzn-glass-soft rounded-xl">
                    <span className="text-xs text-white/70">تقييمات معتمدة رسمياً</span>
                    <span className="text-lg font-semibold text-green-400">{riaData?.stats?.approved || 0}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Risk Distribution */}
            <div className="ruzn-card p-6">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
                <AlertTriangle className="w-5 h-5 text-[rgba(214,179,106,0.98)]" />
                <h3 className="font-bold text-white/95 text-base font-heading">توزيع مستويات المخاطر</h3>
              </div>

              {riaLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-[#d6b36a]" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2.5 ruzn-glass-soft rounded-xl border-r-4 border-r-red-500">
                    <span className="text-xs text-white/80">مخاطر حرجة (Critical)</span>
                    <span className="font-bold text-red-400 text-base">{riaData?.riskDistribution?.critical || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 ruzn-glass-soft rounded-xl border-r-4 border-r-orange-500">
                    <span className="text-xs text-white/80">مخاطر عالية (High)</span>
                    <span className="font-bold text-orange-400 text-base">{riaData?.riskDistribution?.high || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 ruzn-glass-soft rounded-xl border-r-4 border-r-yellow-500">
                    <span className="text-xs text-white/80">مخاطر متوسطة (Medium)</span>
                    <span className="font-bold text-yellow-400 text-base">{riaData?.riskDistribution?.medium || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 ruzn-glass-soft rounded-xl border-r-4 border-r-green-500">
                    <span className="text-xs text-white/80">مخاطر منخفضة (Low)</span>
                    <span className="font-bold text-green-400 text-base">{riaData?.riskDistribution?.low || 0}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Vision 2040 Overall Alignment Dial */}
            <div className="ruzn-card p-6 flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10 w-full justify-center">
                <Target className="w-5 h-5 text-[rgba(214,179,106,0.98)]" />
                <h3 className="font-bold text-white/95 text-base font-heading">متوسط المواءمة العامة مع 2040</h3>
              </div>

              {vision2040Loading ? (
                <Loader2 className="h-16 w-16 animate-spin text-[#d6b36a] my-8" />
              ) : (
                <div className="py-4">
                  <div className="relative w-36 h-36 mx-auto mb-3">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="72"
                        cy="72"
                        r="60"
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="12"
                        fill="none"
                      />
                      <circle
                        cx="72"
                        cy="72"
                        r="60"
                        stroke="#d6b36a"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${(vision2040Data?.overallAlignment || 0) * 3.77} ${100 * 3.77}`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-extrabold text-[rgba(214,179,106,0.98)] font-heading">
                        {vision2040Data?.overallAlignment || 0}%
                      </span>
                      <span className="text-[10px] text-white/60">مؤشر RIA</span>
                    </div>
                  </div>
                  <p className="text-xs text-white/70 max-w-xs leading-relaxed">
                    متوسط الامتثال والمواءمة لكافة التشريعات المسجلة في النظام السيادي
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Tab Content 2: Assessments ─── */}
        {activeTab === "assessments" && (
          <div className="ruzn-card p-6">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
              <div>
                <h3 className="text-lg font-bold text-white/95 font-heading">التقييمات الأخيرة</h3>
                <p className="text-xs text-white/60">سجل التشريعات المقيدة مع درجات الأثر التقديري</p>
              </div>
              <button
                onClick={() => setIsNewAssessmentOpen(true)}
                className="ruzn-btn-gold text-xs font-bold px-3 py-1.5 rounded-xl"
              >
                + تقييم جديد
              </button>
            </div>

            {riaLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-10 w-10 animate-spin text-[#d6b36a]" />
              </div>
            ) : riaData?.assessments?.length === 0 ? (
              <div className="text-center py-16 text-white/50">
                <Scale className="h-14 w-14 mx-auto mb-3 opacity-40 text-[#d6b36a]" />
                <p className="font-semibold text-white/80">لا توجد تقييمات تشريعية مسجلة حالياً</p>
                <p className="text-xs text-white/50 mt-1">اضغط على زر "تقييم جديد" للبدء</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {riaData?.assessments?.map((assessment: any) => (
                  <div
                    key={assessment.id}
                    className="p-4 ruzn-card hover:border-[rgba(214,179,106,0.45)] transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <Scale className="h-4 w-4 text-[rgba(214,179,106,0.95)]" />
                          <h4 className="font-bold text-white/95 text-base">{assessment.titleArabic || assessment.title}</h4>
                        </div>
                        <p className="text-xs text-white/60 font-mono mb-2.5">{assessment.title}</p>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                          {getStatusBadge(assessment.status)}
                          <span className={getRiskBadgeColor(assessment.riskLevel)}>
                            {assessment.riskLevel || "NORMAL"}
                          </span>
                          <span className="ruzn-glass-soft text-xs text-[rgba(214,179,106,0.9)] px-2.5 py-0.5 rounded-full border border-[rgba(214,179,106,0.25)]">
                            {assessment.issuingAuthority}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 self-end md:self-center">
                        <div className="text-center">
                          <div className="text-2xl font-extrabold text-[rgba(214,179,106,0.98)] font-heading">
                            {Number(assessment.vision2040Score) || 0}%
                          </div>
                          <div className="text-[10px] text-white/55">توافق 2040</div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="ruzn-glass-soft px-2 py-1 rounded-lg">
                            <div className="text-[10px] text-white/50">اقتصادي</div>
                            <div className="font-bold text-blue-400">{Number(assessment.economicImpact) || 0}%</div>
                          </div>
                          <div className="ruzn-glass-soft px-2 py-1 rounded-lg">
                            <div className="text-[10px] text-white/50">اجتماعي</div>
                            <div className="font-bold text-green-400">{Number(assessment.socialImpact) || 0}%</div>
                          </div>
                          <div className="ruzn-glass-soft px-2 py-1 rounded-lg">
                            <div className="text-[10px] text-white/50">حوكمة</div>
                            <div className="font-bold text-purple-400">{Number(assessment.governanceImpact) || 0}%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── Tab Content 3: Alerts ─── */}
        {activeTab === "alerts" && (
          <div className="ruzn-card p-6">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
              <div>
                <h3 className="text-lg font-bold text-white/95 font-heading">التنبيهات التشريعية والمستجدات</h3>
                <p className="text-xs text-white/60">إشعارات التعديلات التشريعية وفروقات الالتزام</p>
              </div>

              {alertsData?.stats && (
                <div className="flex gap-2">
                  <span className="ruzn-tag-high text-xs">{alertsData.stats.critical} حرج</span>
                  <span className="ruzn-tag-med text-xs">{alertsData.stats.warning} تحذير</span>
                  <span className="ruzn-tag-info text-xs">{alertsData.stats.info} معلومات</span>
                </div>
              )}
            </div>

            {alertsLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-10 w-10 animate-spin text-[#d6b36a]" />
              </div>
            ) : alertsData?.alerts?.length === 0 ? (
              <div className="text-center py-16 text-white/50">
                <CheckCircle2 className="h-14 w-14 mx-auto mb-3 opacity-40 text-green-400" />
                <p className="font-semibold text-white/80">لا توجد تنبيهات تشريعية جديدة</p>
                <p className="text-xs text-white/50 mt-1">كافة الأنظمة والتشريعات مستقرة ومتوافقة</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {alertsData?.alerts?.map((alert: any) => (
                  <div
                    key={alert.id}
                    className="p-4 ruzn-card hover:border-[rgba(214,179,106,0.4)] transition-all"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="mt-0.5">{getSeverityIcon(alert.severity)}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                          <h4 className="font-bold text-white/95 text-sm">{alert.title}</h4>
                          <span className="ruzn-tag-info text-[10px]">
                            {alert.alertType}
                          </span>
                        </div>
                        <p className="text-xs text-white/70 leading-relaxed mb-2">
                          {alert.description}
                        </p>
                        {alert.descriptionEn && (
                          <p className="text-[11px] text-[rgba(214,179,106,0.85)] font-mono bg-black/25 p-2 rounded-lg border border-white/5">
                            {alert.descriptionEn}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
