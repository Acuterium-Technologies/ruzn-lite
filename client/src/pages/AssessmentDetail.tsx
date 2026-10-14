import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useRoute, useLocation } from "wouter";
import { 
  ArrowRight,
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
  Edit,
  History,
  Sparkles,
  ChevronLeft,
  Calendar,
  User,
  Building,
  FileCheck,
  AlertCircle,
  Lightbulb,
  ListChecks
} from "lucide-react";

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

function getRiskLabel(risk: string | null) {
  switch (risk) {
    case "CRITICAL": return "حرج";
    case "HIGH": return "عالي";
    case "MEDIUM": return "متوسط";
    case "LOW": return "منخفض";
    case "NEGLIGIBLE": return "ضئيل";
    default: return risk;
  }
}

function getStatusBadge(status: string | null) {
  switch (status) {
    case "completed": return <Badge className="bg-green-600">مكتمل</Badge>;
    case "draft": return <Badge className="bg-gray-600">مسودة</Badge>;
    case "in_progress": return <Badge className="bg-blue-600">قيد التنفيذ</Badge>;
    case "pending_review": return <Badge className="bg-yellow-600 text-black">بانتظار المراجعة</Badge>;
    case "archived": return <Badge className="bg-gray-500">مؤرشف</Badge>;
    default: return <Badge className="bg-gray-600">{status}</Badge>;
  }
}

function getRegulationTypeLabel(type: string | null) {
  switch (type) {
    case "decree": return "مرسوم سلطاني";
    case "law": return "قانون";
    case "regulation": return "لائحة تنظيمية";
    case "circular": return "تعميم";
    case "policy": return "سياسة";
    case "amendment": return "تعديل";
    default: return type || "غير محدد";
  }
}

export default function AssessmentDetail() {
  const [, params] = useRoute("/ria-dashboard/assessment/:id");
  const [, setLocation] = useLocation();
  const assessmentId = params?.id ? parseInt(params.id) : 0;
  
  const { data: assessment, isLoading, refetch } = trpc.ria.getById.useQuery(
    { id: assessmentId },
    { enabled: assessmentId > 0 }
  );
  
  const updateStatus = trpc.ria.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الحالة بنجاح");
      refetch();
    },
    onError: (error) => {
      toast.error(`خطأ: ${error.message}`);
    }
  });
  
  const handleStatusChange = (newStatus: string) => {
    updateStatus.mutate({
      id: assessmentId,
      status: newStatus as any
    });
  };
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-[#c9a227]" />
        </div>
      </DashboardLayout>
    );
  }
  
  if (!assessment) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <AlertCircle className="h-16 w-16 text-red-500" />
          <h2 className="text-xl font-semibold">التقييم غير موجود</h2>
          <Button onClick={() => setLocation("/ria-dashboard")} variant="outline">
            <ChevronLeft className="h-4 w-4 ml-2" />
            العودة للوحة التقييمات
          </Button>
        </div>
      </DashboardLayout>
    );
  }
  
  // Parse pillars affected if it's a JSON string
  let pillarsAffected: string[] = [];
  try {
    if (assessment.pillarsAffected) {
      pillarsAffected = JSON.parse(assessment.pillarsAffected);
    }
  } catch {
    pillarsAffected = [];
  }
  
  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setLocation("/ria-dashboard")}
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-[#c9a227]">{assessment.title}</h1>
              <p className="text-sm text-muted-foreground">{assessment.titleEn}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(assessment.status)}
            <Badge className={getRiskBadgeColor(assessment.riskLevel)}>
              {getRiskLabel(assessment.riskLevel)}
            </Badge>
          </div>
        </div>
        
        {/* Vision 2040 Score Card */}
        <Card className="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] border-[#c9a227]">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {/* Overall Score */}
              <div className="text-center">
                <div className="text-5xl font-bold text-[#c9a227]">
                  {assessment.vision2040Score || 0}%
                </div>
                <div className="text-sm text-muted-foreground mt-1">توافق رؤية 2040</div>
                <Progress value={assessment.vision2040Score || 0} className="mt-2 h-3" />
              </div>
              
              {/* Pillar Scores */}
              <div className="text-center">
                <TrendingUp className="h-8 w-8 mx-auto text-blue-400" />
                <div className="text-2xl font-bold text-blue-400 mt-2">
                  {assessment.economicImpact || 0}%
                </div>
                <div className="text-xs text-muted-foreground">اقتصاد متنوع</div>
                <Progress value={assessment.economicImpact || 0} className="mt-2 h-2 bg-blue-900" />
              </div>
              
              <div className="text-center">
                <Building2 className="h-8 w-8 mx-auto text-green-400" />
                <div className="text-2xl font-bold text-green-400 mt-2">
                  {assessment.socialImpact || 0}%
                </div>
                <div className="text-xs text-muted-foreground">مجتمع إنسان</div>
                <Progress value={assessment.socialImpact || 0} className="mt-2 h-2 bg-green-900" />
              </div>
              
              <div className="text-center">
                <Landmark className="h-8 w-8 mx-auto text-purple-400" />
                <div className="text-2xl font-bold text-purple-400 mt-2">
                  {assessment.governanceImpact || 0}%
                </div>
                <div className="text-xs text-muted-foreground">حوكمة رشيدة</div>
                <Progress value={assessment.governanceImpact || 0} className="mt-2 h-2 bg-purple-900" />
              </div>
              
              <div className="text-center">
                <Target className="h-8 w-8 mx-auto text-teal-400" />
                <div className="text-2xl font-bold text-teal-400 mt-2">
                  {assessment.environmentImpact || 0}%
                </div>
                <div className="text-xs text-muted-foreground">بيئة مستدامة</div>
                <Progress value={assessment.environmentImpact || 0} className="mt-2 h-2 bg-teal-900" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="bg-[#1a1a1a] border-[#333]">
              <CardHeader>
                <CardTitle className="text-[#c9a227] flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  معلومات التقييم
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-muted-foreground">نوع التشريع</span>
                    <p className="text-white font-medium">{getRegulationTypeLabel(assessment.regulationType)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">الجهة المصدرة</span>
                    <p className="text-white font-medium">{assessment.issuingAuthority || "غير محدد"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">رقم التشريع</span>
                    <p className="text-white font-medium">{assessment.regulationNumber || "غير محدد"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">تاريخ النفاذ</span>
                    <p className="text-white font-medium">
                      {assessment.effectiveDate 
                        ? new Date(assessment.effectiveDate).toLocaleDateString('ar-OM')
                        : "غير محدد"}
                    </p>
                  </div>
                </div>
                
                {assessment.description && (
                  <div className="pt-4 border-t border-[#333]">
                    <span className="text-xs text-muted-foreground">الوصف</span>
                    <p className="text-white mt-1">{assessment.description}</p>
                  </div>
                )}
                
                {assessment.descriptionEn && (
                  <div>
                    <span className="text-xs text-muted-foreground">Description (English)</span>
                    <p className="text-gray-300 mt-1">{assessment.descriptionEn}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Affected Sectors */}
            {pillarsAffected.length > 0 && (
              <Card className="bg-[#1a1a1a] border-[#333]">
                <CardHeader>
                  <CardTitle className="text-[#c9a227] flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    القطاعات المتأثرة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {pillarsAffected.map((sector, index) => (
                      <Badge key={index} variant="outline" className="text-[#6b9ac4] border-[#6b9ac4]">
                        {sector}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Right Column - Actions & Status */}
          <div className="space-y-6">
            {/* Status Management */}
            <Card className="bg-[#1a1a1a] border-[#333]">
              <CardHeader>
                <CardTitle className="text-[#c9a227] flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  إدارة الحالة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-xs text-muted-foreground">الحالة الحالية</span>
                  <div className="mt-1">{getStatusBadge(assessment.status)}</div>
                </div>
                
                <div>
                  <span className="text-xs text-muted-foreground">تغيير الحالة</span>
                  <Select
                    value={assessment.status || "draft"}
                    onValueChange={handleStatusChange}
                    disabled={updateStatus.isPending}
                  >
                    <SelectTrigger className="mt-1 bg-[#0d0d0d] border-[#333]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">مسودة</SelectItem>
                      <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                      <SelectItem value="pending_review">بانتظار المراجعة</SelectItem>
                      <SelectItem value="completed">مكتمل</SelectItem>
                      <SelectItem value="archived">مؤرشف</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="pt-4 border-t border-[#333]">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>تاريخ الإنشاء: {new Date(assessment.createdAt).toLocaleDateString('ar-OM')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                    <Clock className="h-4 w-4" />
                    <span>آخر تحديث: {new Date(assessment.updatedAt).toLocaleDateString('ar-OM')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Risk Assessment */}
            <Card className="bg-[#1a1a1a] border-[#333]">
              <CardHeader>
                <CardTitle className="text-[#c9a227] flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  تقييم المخاطر
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Badge className={`${getRiskBadgeColor(assessment.riskLevel)} text-lg px-4 py-2`}>
                    {getRiskLabel(assessment.riskLevel)}
                  </Badge>
                </div>
                
                <div className="text-sm text-muted-foreground text-center">
                  {assessment.riskLevel === "CRITICAL" && "يتطلب إجراء فوري - مخاطر حرجة"}
                  {assessment.riskLevel === "HIGH" && "يتطلب مراجعة كبرى - مخاطر عالية"}
                  {assessment.riskLevel === "MEDIUM" && "يُوصى بتعديلات - مخاطر متوسطة"}
                  {assessment.riskLevel === "LOW" && "يُوصى بالمتابعة - مخاطر منخفضة"}
                  {assessment.riskLevel === "NEGLIGIBLE" && "يُوصى بالمضي - مخاطر ضئيلة"}
                </div>
              </CardContent>
            </Card>
            
            {/* Quick Actions */}
            <Card className="bg-[#1a1a1a] border-[#333]">
              <CardHeader>
                <CardTitle className="text-[#c9a227]">إجراءات سريعة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  className="w-full bg-[#6b9ac4] hover:bg-[#5a89b3]"
                  onClick={() => toast.info("سيتم إضافة هذه الميزة قريباً")}
                >
                  <Edit className="h-4 w-4 ml-2" />
                  تعديل التقييم
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => toast.info("سيتم إضافة هذه الميزة قريباً")}
                >
                  <History className="h-4 w-4 ml-2" />
                  عرض سجل التغييرات
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.print()}
                >
                  <FileText className="h-4 w-4 ml-2" />
                  طباعة التقرير
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
(Content truncated due to size limit. Use page ranges or line ranges to read remaining content)