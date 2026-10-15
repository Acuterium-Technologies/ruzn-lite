import { useState, useEffect } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, Search, Filter, Scale, Building2, Calendar,
  DollarSign, Clock, FileText, ChevronDown, ChevronUp, Gavel,
  AlertTriangle, TrendingUp, Users, Loader2, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import SovereignHeader from "@/components/SovereignHeader";

type Language = "arabic" | "english";

const UI_TEXT = {
  arabic: {
    title: "قاعدة بيانات السوابق القضائية",
    subtitle: "أرشيف قابل للبحث لقضايا الإدانة والمخالفات",
    back: "العودة",
    search: "بحث في القضايا...",
    filterBy: "تصفية حسب",
    year: "السنة",
    violationType: "نوع المخالفة",
    entityType: "نوع الجهة",
    allYears: "جميع السنوات",
    allTypes: "جميع الأنواع",
    allEntities: "جميع الجهات",
    totalCases: "إجمالي القضايا",
    totalAmount: "إجمالي المبالغ المتورطة",
    totalRecovered: "إجمالي المبالغ المستردة",
    avgSentence: "متوسط العقوبة",
    years: "سنوات",
    caseDetails: "تفاصيل القضية",
    entity: "الجهة",
    position: "المنصب",
    violation: "المخالفة",
    sentence: "العقوبة",
    fine: "الغرامة",
    amountInvolved: "المبلغ المتورط",
    amountRecovered: "المبلغ المسترد",
    legalArticles: "المواد القانونية",
    additionalPenalties: "عقوبات إضافية",
    source: "المصدر",
    noResults: "لا توجد نتائج",
    loading: "جاري التحميل...",
    seedDatabase: "تهيئة قاعدة البيانات",
    seeding: "جاري التهيئة...",
    seedSuccess: "تم تهيئة قاعدة البيانات بنجاح",
    seedError: "فشل تهيئة قاعدة البيانات"
  },
  english: {
    title: "Case Law Database",
    subtitle: "Searchable archive of governance conviction cases",
    back: "Back",
    search: "Search cases...",
    filterBy: "Filter by",
    year: "Year",
    violationType: "Violation Type",
    entityType: "Entity Type",
    allYears: "All Years",
    allTypes: "All Types",
    allEntities: "All Entities",
    totalCases: "Total Cases",
    totalAmount: "Total Amount Involved",
    totalRecovered: "Total Recovered",
    avgSentence: "Avg Sentence",
    years: "years",
    caseDetails: "Case Details",
    entity: "Entity",
    position: "Position",
    violation: "Violation",
    sentence: "Sentence",
    fine: "Fine",
    amountInvolved: "Amount Involved",
    amountRecovered: "Amount Recovered",
    legalArticles: "Legal Articles",
    additionalPenalties: "Additional Penalties",
    source: "Source",
    noResults: "No results found",
    loading: "Loading...",
    seedDatabase: "Seed Database",
    seeding: "Seeding...",
    seedSuccess: "Database seeded successfully",
    seedError: "Failed to seed database"
  }
};

export default function CaseLaw() {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("ruzn_lang") : null;
    return saved === "en" || saved === "english" ? "english" : "arabic";
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<number | undefined>();
  const [selectedViolationType, setSelectedViolationType] = useState<string | undefined>();
  const [selectedEntityType, setSelectedEntityType] = useState<string | undefined>();
  const [expandedCase, setExpandedCase] = useState<number | null>(null);
  
  const isRTL = language === "arabic";
  const text = UI_TEXT[language];

  useEffect(() => {
    localStorage.setItem("ruzn_lang", language === "english" ? "en" : "ar");
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = isRTL ? "ar" : "en";
  }, [language, isRTL]);
  
  // Queries
  const { data: searchResults, isLoading } = trpc.caseLaw.search.useQuery({
    query: searchQuery || undefined,
    year: selectedYear,
    violationType: selectedViolationType,
    entityType: selectedEntityType,
    limit: 50
  });
  
  const { data: stats } = trpc.caseLaw.getStats.useQuery();
  const { data: violationTypes } = trpc.caseLaw.getViolationTypes.useQuery();
  const { data: entityTypes } = trpc.caseLaw.getEntityTypes.useQuery();
  
  const seedMutation = trpc.caseLaw.seedDatabase.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`${text.seedSuccess} (${data.count} cases)`);
      } else {
        toast.error(text.seedError);
      }
    },
    onError: () => {
      toast.error(text.seedError);
    }
  });
  
  const availableYears = [2021, 2022, 2023, 2024];
  
  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return "-";
    return `OMR ${amount.toLocaleString()}`;
  };
  
  const formatSentence = (years: number | null | undefined, months: number | null | undefined) => {
    if (!years && !months) return "-";
    const parts = [];
    if (years) parts.push(`${years} ${text.years}`);
    if (months) parts.push(`${months} months`);
    return parts.join(", ");
  };
  
  const getViolationLabel = (type: string) => {
    const found = violationTypes?.find(v => v.value === type);
    return found ? (language === "arabic" ? found.labelAr : found.labelEn) : type;
  };
  
  const getEntityLabel = (type: string) => {
    const found = entityTypes?.find(e => e.value === type);
    return found ? (language === "arabic" ? found.labelAr : found.labelEn) : type;
  };

  return (
    <div 
      className="min-h-screen flex flex-col font-body"
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
        activeSuite="caseLaw"
        onToggleLanguage={() => setLanguage(language === "arabic" ? "english" : "arabic")}
        actions={
          <button
            onClick={() => seedMutation.mutate()}
            disabled={seedMutation.isPending}
            className="ruzn-btn text-xs gap-1.5 border-[rgba(214,179,106,0.3)] hover:border-[rgba(214,179,106,0.6)] text-[rgba(214,179,106,0.95)]"
          >
            {seedMutation.isPending ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {text.seeding}</>
            ) : (
              <><Sparkles className="w-3.5 h-3.5" /> {text.seedDatabase}</>
            )}
          </button>
        }
      />
      
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="ruzn-kpi p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl border border-[rgba(214,179,106,0.3)] bg-[rgba(214,179,106,0.1)]">
                <Gavel className="w-5 h-5 text-[rgba(214,179,106,0.98)]" />
              </div>
              <div>
                <p className="text-xs text-white/60">{text.totalCases}</p>
                <p className="text-2xl font-extrabold text-[rgba(214,179,106,0.98)] font-heading">{stats?.totalCases || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="ruzn-kpi p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/25">
                <DollarSign className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-xs text-white/60">{text.totalAmount}</p>
                <p className="text-xl font-extrabold text-red-400 font-heading">{formatCurrency(stats?.totalAmountInvolved)}</p>
              </div>
            </div>
          </div>
          
          <div className="ruzn-kpi p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-green-500/10 border border-green-500/25">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-white/60">{text.totalRecovered}</p>
                <p className="text-xl font-extrabold text-green-400 font-heading">{formatCurrency(stats?.totalAmountRecovered)}</p>
              </div>
            </div>
          </div>
          
          <div className="ruzn-kpi p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/25">
                <Clock className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-white/60">{text.avgSentence}</p>
                <p className="text-xl font-extrabold text-orange-400 font-heading">{stats?.avgSentenceYears?.toFixed(1) || 0} {text.years}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="ruzn-card p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={text.search}
                className="pl-10 ruzn-input"
              />
            </div>
            
            <div className="flex gap-3 flex-wrap">
              <select
                value={selectedYear || ""}
                onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : undefined)}
                className="ruzn-input px-3 py-2 rounded-xl min-w-[120px]"
              >
                <option value="">{text.allYears}</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              
              <select
                value={selectedViolationType || ""}
                onChange={(e) => setSelectedViolationType(e.target.value || undefined)}
                className="ruzn-input px-3 py-2 rounded-xl min-w-[150px]"
              >
                <option value="">{text.allTypes}</option>
                {violationTypes?.map(type => (
                  <option key={type.value} value={type.value}>
                    {language === "arabic" ? type.labelAr : type.labelEn}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedEntityType || ""}
                onChange={(e) => setSelectedEntityType(e.target.value || undefined)}
                className="ruzn-input px-3 py-2 rounded-xl min-w-[150px]"
              >
                <option value="">{text.allEntities}</option>
                {entityTypes?.map(type => (
                  <option key={type.value} value={type.value}>
                    {language === "arabic" ? type.labelAr : type.labelEn}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Results */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="ruzn-card p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
              <p className="text-muted-foreground">{text.loading}</p>
            </div>
          ) : searchResults?.cases.length === 0 ? (
            <div className="ruzn-card p-8 text-center">
              <Scale className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">{text.noResults}</p>
            </div>
          ) : (
            searchResults?.cases.map((caseItem) => (
              <div key={caseItem.id} className="ruzn-card overflow-hidden">
                <button
                  onClick={() => setExpandedCase(expandedCase === caseItem.id ? null : caseItem.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-start">
                      <h3 className="font-semibold text-foreground">
                        {language === "arabic" ? caseItem.entityNameArabic : caseItem.entityNameEnglish}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {caseItem.year} • {getViolationLabel(caseItem.violationType)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-end">
                      <p className="text-sm font-medium text-primary">
                        {formatSentence(caseItem.sentenceYears, caseItem.sentenceMonths)}
                      </p>
                      {caseItem.fineOMR && (
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(caseItem.fineOMR)} fine
                        </p>
                      )}
                    </div>
                    {expandedCase === caseItem.id ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </button>
                
                {expandedCase === caseItem.id && (
                  <div className="px-4 pb-4 border-t border-white/10 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-primary mb-2">{text.caseDetails}</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{text.entity}:</span>
                            <span>{language === "arabic" ? caseItem.entityNameArabic : caseItem.entityNameEnglish}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{text.position}:</span>
                            <span>{language === "arabic" ? caseItem.accusedPositionArabic : caseItem.accusedPosition}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{text.violation}:</span>
                            <span>{language === "arabic" ? caseItem.violationTypeArabic : caseItem.violationTypeEnglish}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{text.sentence}:</span>
                            <span>{formatSentence(caseItem.sentenceYears, caseItem.sentenceMonths)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{text.fine}:</span>
                            <span>{formatCurrency(caseItem.fineOMR)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-primary mb-2">{text.amountInvolved}</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{text.amountInvolved}:</span>
                            <span className="text-red-400">{formatCurrency(caseItem.amountInvolved)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{text.amountRecovered}:</span>
                            <span className="text-green-400">{formatCurrency(caseItem.amountRecovered)}</span>
                          </div>
                        </div>
                        
                        {caseItem.legalArticles && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-primary mb-2">{text.legalArticles}</h4>
                            <div className="flex flex-wrap gap-2">
                              {JSON.parse(caseItem.legalArticles).map((article: string, idx: number) => (
                                <span key={idx} className="ruzn-tag-info text-xs">
                                  {article}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {caseItem.additionalPenalties && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-primary mb-2">{text.additionalPenalties}</h4>
                            <div className="flex flex-wrap gap-2">
                              {JSON.parse(caseItem.additionalPenalties).map((penalty: string, idx: number) => (
                                <span key={idx} className="ruzn-tag-med text-xs">
                                  {penalty}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 rounded-lg bg-black/20">
                      <p className="text-sm">
                        {language === "arabic" ? caseItem.summaryArabic : caseItem.summaryEnglish}
                      </p>
                    </div>
                    
                    {caseItem.sourceReport && (
                      <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {text.source}: {caseItem.sourceReport}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
