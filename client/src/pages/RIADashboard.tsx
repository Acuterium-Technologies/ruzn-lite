import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Brain
} from "lucide-react";
import { useLocation } from "wouter";

function getRiskBadgeColor(risk: string | null) {
  switch (risk) {
    case "CRITICAL": return "bg-red-600 text-white";
    case "HIGH": return "bg-orange-500 text-white";
    case "MEDIUM": return "bg-yellow-500 text-black";
    case "LOW": return "bg-green-500 text-white";
    case "NEGLIGIBLE": return "bg-blue-500 text-white";
    default: return "bg-gray-500 text-white";
  }
}

function getStatusBadge(status: string | null) {
  switch (status) {
    case "approved": return <Badge className="bg-green-600">معتمد</Badge>;
    case "draft": return <Badge className="bg-gray-600">مسودة</Badge>;
    case "pending_review": return <Badge className="bg-yellow-600 text-black">بانتظار المراجعة</Badge>;
    case "rejected": return <Badge className="bg-red-600">مرفوض</Badge>;
    case "archived": return <Badge className="bg-gray-500">مؤرشف</Badge>;
    default: return <Badge className="bg-gray-600">{status}</Badge>;
  }
}

function getSeverityIcon(severity: string | null) {
  switch (severity) {
    case "critical": return <AlertTriangle className="h-5 w-5 text-red-500" />;
    case "warning": return <Clock className="h-5 w-5 text-yellow-500" />;
    case "info": return <CheckCircle2 className="h-5 w-5 text-blue-500" />;
    default: return <FileText className="h-5 w-5 text-gray-500" />;
  }
}

function getRiskCategoryLabel(category: string | null) {
  switch (category) {
    case "PROCEED": return "يُوصى بالمضي";
    case "PROCEED_WITH_MODIFICATIONS": return "يُوصى بتعديلات";
    case "REQUIRES_MAJOR_REVISION": return "يتطلب مراجعة كبرى";
    case "NOT_RECOMMENDED": return "غير موصى به";
    default: return category;
  }
}

export default function RIADashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isNewAssessmentOpen, setIsNewAssessmentOpen] = useState(false);
  // Using sonner toast directly
  
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
      toast.success("تم تحليل النص بنجاح - Analysis complete");
    },
    onError: (error) => {
      setIsAnalyzing(false);
      toast.error(`خطأ في التحليل: ${error.message}`);
    }
  });
  
  // Create assessment with AI analysis mutation
  const createWithAnalysis = trpc.ria.createWithAnalysis.useMutation({
    onSuccess: (data) => {
      toast.success("تم إنشاء التقييم مع التحليل الذكي - Assessment created with AI analysis");
      setIsNewAssessmentOpen(false);
      setAnalysisResult(null);
      refetchRia();
      // Navigate to detail view
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
      toast.success("تم إنشاء التقييم بنجاح - Assessment created successfully");
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
      // Create with AI analysis
      createWithAnalysis.mutate({
        ...newAssessment,
        analysis: analysisResult
      });
    } else {
      // Create without AI analysis
      createAssessment.mutate(newAssessment);
    }
  };
  
  const handleRefresh = () => {
    refetchRia();
    refetchAlerts();
    toast.success("تم التحديث - Data refreshed successfully");
  };

  // Vision 2040 pillars with live data
  const vision2040Pillars = [
    { 
      id: "economy", 
      name: "اقتصاد متنوع ومستدام", 
      nameEn: "الاقتصاد المتنوع", 
      icon: TrendingUp, 
      score: vision2040Data?.pillars.economy.score || 0 
    },
    { 
      id: "society", 
      name: "مجتمع إنسان وقدرات", 
      nameEn: "الإنسان والقدرات", 
      icon: Building2, 
      score: vision2040Data?.pillars.society.score || 0 
    },
    { 
      id: "governance", 
      name: "حوكمة رشيدة", 
      nameEn: "الحوكمة الرشيدة", 
      icon: Landmark, 
      score: vision2040Data?.pillars.governance.score || 0 
    },
    { 
      id: "environment", 
      name: "بيئة مستدامة", 
      nameEn: "Sustainable Environment", 
      icon: Target, 
      score: vision2040Data?.pillars.environment.score || 0 
    },
  ];

  const isLoading = riaLoading || vision2040Loading || alertsLoading;

  return (
    <DashboardLayout defaultCollapsed={true}>
      <div className="space-y-4 md:space-y-6 p-3 sm:p-4 md:p-6" dir="rtl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#c9a227]">
              لوحة تقييم الأثر التنظيمي
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              EREBUSFORMULA659 - RIA Dashboard
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading} className="text-sm sm:text-base px-3 sm:px-4 py-2 h-auto">
              <RefreshCw className={`h-4 w-4 sm:h-5 sm:w-5 ml-2 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">تحديث</span>
            </Button>
            <Dialog open={isNewAssessmentOpen} onOpenChange={setIsNewAssessmentOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#c9a227] hover:bg-[#b8922a] text-black text-sm sm:text-base px-3 sm:px-4 py-2 h-auto">
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                  تقييم جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl bg-[#1a1a1a] border-[#333] max-h-[90vh] overflow-y-auto" dir="rtl">
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl text-[#c9a227]">إنشاء تقييم أثر تنظيمي جديد</DialogTitle>
                  <DialogDescription>New Regulatory Impact Assessment</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm sm:text-base">العنوان بالإنجليزية *</Label>
                      <Input
                        id="title"
                        placeholder="Title in English"
                        value={newAssessment.title}
                        onChange={(e) => setNewAssessment({ ...newAssessment, title: e.target.value })}
                        className="bg-[#0d0d0d] border-[#333] text-sm sm:text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="titleArabic" className="text-sm sm:text-base">العنوان بالعربية</Label>
                      <Input
                        id="titleArabic"
                        placeholder="العنوان بالعربية"
                        value={newAssessment.titleArabic}
                        onChange={(e) => setNewAssessment({ ...newAssessment, titleArabic: e.target.value })}
                        className="bg-[#0d0d0d] border-[#333] text-sm sm:text-base"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="legislationType" className="text-sm sm:text-base">نوع التشريع *</Label>
                      <Select
                        value={newAssessment.legislationType}
                        onValueChange={(value: any) => setNewAssessment({ ...newAssessment, legislationType: value })}
                      >
                        <SelectTrigger className="bg-[#0d0d0d] border-[#333] text-sm sm:text-base">
                          <SelectValue placeholder="اختر نوع التشريع" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="royal_decree">مرسوم سلطاني</SelectItem>
                          <SelectItem value="ministerial_decision">قرار وزاري</SelectItem>
                          <SelectItem value="regulation">لائحة تنظيمية</SelectItem>
                          <SelectItem value="amendment">تعديل</SelectItem>
                          <SelectItem value="policy">سياسة</SelectItem>
                          <SelectItem value="circular">تعميم</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="issuingAuthority" className="text-sm sm:text-base">الجهة المصدرة *</Label>
                      <Input
                        id="issuingAuthority"
                        placeholder="مثال: وزارة التجارة"
                        value={newAssessment.issuingAuthority}
                        onChange={(e) => setNewAssessment({ ...newAssessment, issuingAuthority: e.target.value })}
                        className="bg-[#0d0d0d] border-[#333] text-sm sm:text-base"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="legislativeText" className="text-sm sm:text-base">نص التشريع *</Label>
                    <Textarea
                      id="legislativeText"
                      placeholder="أدخل نص التشريع أو ملخصه..."
                      value={newAssessment.legislativeText}
                      onChange={(e) => {
                        setNewAssessment({ ...newAssessment, legislativeText: e.target.value });
                        setAnalysisResult(null); // Reset analysis when text changes
                      }}
                      className="bg-[#0d0d0d] border-[#333] min-h-[150px] text-sm sm:text-base"
                    />
                  </div>
                  
                  {/* AI Analysis Button */}
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-[#6b9ac4] text-[#6b9ac4] hover:bg-[#6b9ac4]/10"
                      onClick={handleAnalyzeText}
                      disabled={isAnalyzing || !newAssessment.legislativeText}
                    >
                      {isAnalyzing ? (
                        <><Loader2 className="h-4 w-4 ml-2 animate-spin" /> جاري التحليل الذكي...</>
                      ) : (
                        <><Brain className="h-4 w-4 ml-2" /> تحليل ذكي (EREBUS-RIA)</>
                      )}
                    </Button>
                    {analysisResult && (
                      <Badge className="bg-green-600"><Sparkles className="h-3 w-3 ml-1" /> تم التحليل</Badge>
                    )}
                  </div>
                  
                  {/* AI Analysis Results */}
                  {analysisResult && (
                    <Card className="bg-[#0d0d0d] border-[#6b9ac4]">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-[#6b9ac4] flex items-center gap-2">
                          <Sparkles className="h-4 w-4" /> نتائج التحليل الذكي
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs text-muted-foreground">مستوى المخاطر</span>
                            <Badge className={getRiskBadgeColor(analysisResult.riskLevel)}>
                              {analysisResult.riskLevel}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">توافق رؤية 2040</span>
                            <div className="text-lg font-bold text-[#c9a227]">{analysisResult.vision2040Score}%</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-center">
                          <div>
                            <div className="text-xs text-muted-foreground">اقتصادي</div>
                            <div className="font-semibold text-blue-400">{analysisResult.economicImpact}%</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">اجتماعي</div>
                            <div className="font-semibold text-green-400">{analysisResult.socialImpact}%</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">حوكمة</div>
                            <div className="font-semibold text-purple-400">{analysisResult.governanceImpact}%</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">بيئي</div>
                            <div className="font-semibold text-teal-400">{analysisResult.environmentImpact}%</div>
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">الملخص:</span>
                          <p className="text-sm text-white mt-1">{analysisResult.summary}</p>
                        </div>
                        {analysisResult.keyFindings?.length > 0 && (
                          <div>
                            <span className="text-xs text-muted-foreground">النتائج الرئيسية:</span>
                            <ul className="text-xs text-white mt-1 list-disc list-inside">
                              {analysisResult.keyFindings.slice(0, 3).map((finding: string, i: number) => (
                                <li key={i}>{finding}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">إلغاء</Button>
                  </DialogClose>
                  <Button 
                    className="bg-[#c9a227] hover:bg-[#b8922a] text-black"
                    onClick={handleCreateAssessment}
                    disabled={createAssessment.isPending || createWithAnalysis.isPending}
                  >
                    {(createAssessment.isPending || createWithAnalysis.isPending) ? (
                      <><Loader2 className="h-4 w-4 ml-2 animate-spin" /> جاري الإنشاء...</>
                    ) : analysisResult ? (
                      <><Sparkles className="h-4 w-4 ml-2" /> إنشاء مع التحليل الذكي</>
                    ) : (
                      <><Plus className="h-4 w-4 ml-2" /> إنشاء التقييم</>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* التوافق مع رؤية 2040 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {vision2040Pillars.map((pillar) => (
            <Card key={pillar.id} className="bg-[#1a1a1a] border-[#333]">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <pillar.icon className="h-5 w-5 sm:h-6 sm:w-6 text-[#6b9ac4]" />
                  <span className="text-xl sm:text-2xl font-bold text-[#c9a227]">
                    {vision2040Loading ? <Loader2 className="h-5 w-5 animate-spin" /> : `${pillar.score}%`}
                  </span>
                </div>
                <h3 className="font-semibold text-white text-sm sm:text-base">{pillar.name}</h3>
                <Progress value={pillar.score} className="mt-2 h-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3 sm:space-y-4">
          <TabsList className="bg-[#1a1a1a] border border-[#333] h-auto">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#c9a227] data-[state=active]:text-black text-sm sm:text-base px-3 sm:px-4 py-2 h-auto">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
              <span className="hidden sm:inline">نظرة عامة</span>
            </TabsTrigger>
            <TabsTrigger value="assessments" className="data-[state=active]:bg-[#c9a227] data-[state=active]:text-black text-sm sm:text-base px-3 sm:px-4 py-2 h-auto">
              <Scale className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
              <span className="hidden sm:inline">التقييمات</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-[#c9a227] data-[state=active]:text-black text-sm sm:text-base px-3 sm:px-4 py-2 h-auto">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
              <span className="hidden sm:inline">التنبيهات</span>
              {alertsData?.stats.unread ? (
                <Badge className="mr-2 bg-red-600">{alertsData.stats.unread}</Badge>
              ) : null}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Summary Stats */}
              <Card className="bg-[#1a1a1a] border-[#333]">
                <CardHeader>
                  <CardTitle className="text-[#c9a227]">إحصائيات التقييم</CardTitle>
                  <CardDescription>Assessment Statistics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {riaLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-[#c9a227]" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">إجمالي التقييمات</span>
                        <span className="text-2xl font-bold text-white">{riaData?.stats.total || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">مسودات</span>
                        <span className="text-xl font-semibold text-gray-400">{riaData?.stats.draft || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">بانتظار المراجعة</span>
                        <span className="text-xl font-semibold text-yellow-400">{riaData?.stats.pending_review || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">معتمدة</span>
                        <span className="text-xl font-semibold text-green-400">{riaData?.stats.approved || 0}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* توزيع المخاطر */}
              <Card className="bg-[#1a1a1a] border-[#333]">
                <CardHeader>
                  <CardTitle className="text-[#c9a227]">توزيع المخاطر</CardTitle>
                  <CardDescription>توزيع المخاطر</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {riaLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-[#c9a227]" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="flex-1 text-muted-foreground">حرج</span>
                        <span className="font-semibold text-white">{riaData?.riskDistribution.critical || 0}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span className="flex-1 text-muted-foreground">عالي</span>
                        <span className="font-semibold text-white">{riaData?.riskDistribution.high || 0}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span className="flex-1 text-muted-foreground">متوسط</span>
                        <span className="font-semibold text-white">{riaData?.riskDistribution.medium || 0}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="flex-1 text-muted-foreground">منخفض</span>
                        <span className="font-semibold text-white">{riaData?.riskDistribution.low || 0}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Vision 2040 Overall */}
              <Card className="bg-[#1a1a1a] border-[#333]">
                <CardHeader>
                  <CardTitle className="text-[#c9a227]">التوافق مع رؤية 2040</CardTitle>
                  <CardDescription>التوافق مع رؤية 2040</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-4">
                  {vision2040Loading ? (
                    <Loader2 className="h-16 w-16 animate-spin text-[#c9a227]" />
                  ) : (
                    <>
                      <div className="relative w-32 h-32">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="#333"
                            strokeWidth="12"
                            fill="none"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="#c9a227"
                            strokeWidth="12"
                            fill="none"
                            strokeDasharray={`${(vision2040Data?.overallAlignment || 0) * 3.52} ${100 * 3.52}`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-3xl font-bold text-[#c9a227]">
                            {vision2040Data?.overallAlignment || 0}%
                          </span>
                        </div>
                      </div>
                      <p className="text-muted-foreground mt-4 text-center">
                        متوسط التوافق العام
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Assessments Tab */}
          <TabsContent value="assessments" className="space-y-4">
            <Card className="bg-[#1a1a1a] border-[#333]">
              <CardHeader>
                <CardTitle className="text-[#c9a227]">التقييمات الأخيرة</CardTitle>
                <CardDescription>Recent Regulatory Impact Assessments</CardDescription>
              </CardHeader>
              <CardContent>
                {riaLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-12 w-12 animate-spin text-[#c9a227]" />
                  </div>
                ) : riaData?.assessments.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Scale className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>لا توجد تقييمات بعد</p>
                    <p className="text-sm">No assessments yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {riaData?.assessments.map((assessment: any) => (
                      <div
                        key={assessment.id}
                        className="p-4 bg-[#0d0d0d] rounded-lg border border-[#333] hover:border-[#c9a227] transition-colors"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Scale className="h-5 w-5 text-[#6b9ac4]" />
                              <h3 className="font-semibold text-white">{assessment.title}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">{assessment.title}</p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              {getStatusBadge(assessment.status)}
                              <Badge className={getRiskBadgeColor(assessment.riskLevel)}>
                                {assessment.riskLevel}
                              </Badge>
                              <Badge variant="outline" className="text-[#6b9ac4] border-[#6b9ac4]">
                                {assessment.issuingAuthority}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-[#c9a227]">
                                {Number(assessment.vision2040Score) || 0}%
                              </div>
                              <div className="text-xs text-muted-foreground">RIA Score</div>
                            </div>
                            <div className="flex gap-4 text-sm">
                              <div className="text-center">
                                <div className="font-semibold text-blue-400">{Number(assessment.economicImpact) || 0}%</div>
                                <div className="text-xs text-muted-foreground">اقتصادي</div>
                              </div>
                              <div className="text-center">
                                <div className="font-semibold text-green-400">{Number(assessment.socialImpact) || 0}%</div>
                                <div className="text-xs text-muted-foreground">اجتماعي</div>
                              </div>
                              <div className="text-center">
                                <div className="font-semibold text-purple-400">{Number(assessment.governanceImpact) || 0}%</div>
                                <div className="text-xs text-muted-foreground">حوكمة</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            <Card className="bg-[#1a1a1a] border-[#333]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[#c9a227]">التنبيهات التشريعية</CardTitle>
                    <CardDescription>Legislative Alerts & Notifications</CardDescription>
                  </div>
                  {alertsData?.stats && (
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-red-500 border-red-500">
                        {alertsData.stats.critical} حرج
                      </Badge>
                      <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                        {alertsData.stats.warning} تحذير
                      </Badge>
                      <Badge variant="outline" className="text-blue-500 border-blue-500">
                        {alertsData.stats.info} معلومات
                      </Badge>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {alertsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-12 w-12 animate-spin text-[#c9a227]" />
                  </div>
                ) : alertsData?.alerts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle2 className="h-16 w-16 mx-auto mb-4 opacity-50 text-green-500" />
                    <p>لا توجد تنبيهات</p>
                    <p className="text-sm">No alerts at this time</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {alertsData?.alerts.map((alert: any) => (
                      <div
                        key={alert.id}
                        className={`p-4 rounded-lg border ${
                          alert.severity === "critical"
                            ? "bg-red-950/30 border-red-800"
                            : alert.severity === "warning"
                            ? "bg-yellow-950/30 border-yellow-800"
                            : "bg-blue-950/30 border-blue-800"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {getSeverityIcon(alert.severity)}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-white">{alert.title}</h3>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {alert.alertType}
                                </Badge>
                                <Badge variant={!alert.isRead ? 'default' : 'secondary'} className="text-xs">
                                  {!alert.isRead ? 'جديد' : alert.isActioned ? 'تم الحل' : 'تم الاطلاع'}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{alert.title}</p>
                            <p className="text-sm text-gray-300 mt-2">{alert.description}</p>
                            {alert.descriptionEn && (
                              <p className="text-xs text-[#6b9ac4] mt-2">
                                <strong>ملاحظات:</strong> {alert.descriptionEn}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer Branding */}
        <div className="flex items-center justify-center gap-8 pt-6 border-t border-[#333]">
          <div className="flex items-center gap-2">
            <img 
              src="/logos/AMADLOGOTINNY.jpg" 
              alt="AMAD" 
              className="h-10 rounded"
            />
            <div className="text-xs text-muted-foreground">
              <div className="font-semibold text-[#c9a227]">مجموعة عماد</div>
              <div>الشريك الاستراتيجي</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <img 
              src="/logos/AcuteriumTechnologies_logo.png" 
              alt="Acuterium Technologies" 
              className="h-10"
            />
            <div className="text-xs text-muted-foreground">
              <div className="font-semibold text-[#6b9ac4]">أكيوتيريوم تكنولوجيز</div>
              <div>الشريك التقني</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
