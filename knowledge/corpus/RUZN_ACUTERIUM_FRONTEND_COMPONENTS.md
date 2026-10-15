# RUZN-Acuterium v3.0 - Frontend Components & Integration

**Continuation of Enhancement Blueprint**

---

## Part 7: Frontend Implementation (Continued)

### 7.1 Legal Intelligence Page (Complete)

**File**: `client/src/pages/LegalIntelligence.tsx`

```tsx
// client/src/pages/LegalIntelligence.tsx

import React, { useState } from 'react';
import { trpc } from '../utils/trpc';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { Search, Scale, FileText, TrendingUp, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';

interface LegalResult {
  docId: string;
  title: string;
  snippet: string;
  jurisdiction: string;
  R_legal: number;
  S_similarity: number;
  A_authority: number;
  R_recency: number;
  phi: number;
  C_citeNetwork: number;
  jurisdictionWeight: number;
}

const LegalIntelligencePage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [searchOptions, setSearchOptions] = useState({
    includeGCC: true,
    includeInternational: false,
    topK: 10,
  });

  const searchMutation = trpc.legal.search.useQuery(
    { query, ...searchOptions },
    { enabled: false }
  );

  const handleSearch = () => {
    if (query.trim().length >= 3) {
      searchMutation.refetch();
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.7) return 'text-green-400';
    if (score >= 0.5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRelevanceBadge = (score: number) => {
    if (score >= 0.7) return { text: 'Highly Relevant', class: 'bg-green-600' };
    if (score >= 0.5) return { text: 'Relevant', class: 'bg-yellow-600' };
    if (score >= 0.3) return { text: 'Partially Relevant', class: 'bg-orange-600' };
    return { text: 'Low Relevance', class: 'bg-red-600' };
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl bg-slate-950 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gold-500 flex items-center gap-3">
          <Scale className="h-8 w-8" />
          AI-Powered Legal Intelligence
        </h1>
        <p className="text-gray-400 mt-2">
          Powered by EREBUS-CSE-3A12d-001 (Legal Research & Case Law Protocol)
        </p>
        <div className="flex gap-2 mt-3">
          <Badge variant="outline" className="text-xs border-gold-500 text-gold-500">
            EREBUSFORMULA650
          </Badge>
          <Badge variant="outline" className="text-xs border-green-500 text-green-500">
            96.7% Effectiveness
          </Badge>
          <Badge variant="outline" className="text-xs border-blue-500 text-blue-500">
            154x FlashMLA Acceleration
          </Badge>
          <Badge variant="outline" className="text-xs border-purple-500 text-purple-500">
            247 Jurisdictions
          </Badge>
        </div>
      </div>

      {/* Search Section */}
      <Card className="mb-6 bg-slate-900 border-slate-700">
        <CardContent className="pt-6">
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter legal research query (e.g., 'embezzlement public funds Royal Decree 112/2011')"
                className="bg-slate-800 border-slate-600 pl-10 text-white"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={searchMutation.isLoading || query.length < 3}
              className="bg-gold-500 hover:bg-gold-600 text-black font-semibold px-6"
            >
              {searchMutation.isLoading ? 'Analyzing...' : 'Search Legal Database'}
            </Button>
          </div>

          {/* Search Options */}
          <div className="flex gap-6 items-center text-sm border-t border-slate-700 pt-4 mt-2">
            <span className="text-gray-400">Jurisdictions:</span>
            <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={true}
                disabled
                className="rounded bg-gold-500"
              />
              Oman (Primary)
            </label>
            <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={searchOptions.includeGCC}
                onChange={(e) => setSearchOptions({ ...searchOptions, includeGCC: e.target.checked })}
                className="rounded"
              />
              GCC States
            </label>
            <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={searchOptions.includeInternational}
                onChange={(e) => setSearchOptions({ ...searchOptions, includeInternational: e.target.checked })}
                className="rounded"
              />
              International Law
            </label>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-gray-400">Results:</span>
              <select 
                value={searchOptions.topK}
                onChange={(e) => setSearchOptions({ ...searchOptions, topK: parseInt(e.target.value) })}
                className="bg-slate-800 border-slate-600 rounded px-2 py-1 text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Query Analysis Card */}
      {searchMutation.data?.queryAnalysis && (
        <Card className="mb-6 bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-gold-500" />
              Query Analysis (EREBUSFORMULA650)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-6 text-sm">
              <div>
                <span className="text-gray-400 block mb-1">Detected Jurisdiction</span>
                <Badge className="bg-blue-600">{searchMutation.data.queryAnalysis.detectedJurisdiction}</Badge>
              </div>
              <div>
                <span className="text-gray-400 block mb-1">Legal Topics</span>
                <div className="flex flex-wrap gap-1">
                  {searchMutation.data.queryAnalysis.detectedTopics.map((topic, i) => (
                    <Badge key={i} variant="secondary" className="bg-slate-700">{topic}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-gray-400 block mb-1">Query Complexity</span>
                <Badge variant="outline" className={
                  searchMutation.data.queryAnalysis.queryComplexity === 'COMPLEX' ? 'border-red-500 text-red-500' :
                  searchMutation.data.queryAnalysis.queryComplexity === 'MODERATE' ? 'border-yellow-500 text-yellow-500' :
                  'border-green-500 text-green-500'
                }>
                  {searchMutation.data.queryAnalysis.queryComplexity}
                </Badge>
              </div>
              <div>
                <span className="text-gray-400 block mb-1">Consciousness Coherence</span>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={searchMutation.data.protocol.consciousnessCoherence * 100} 
                    className="h-2 flex-1"
                  />
                  <span className="text-green-400 font-mono">
                    {(searchMutation.data.protocol.consciousnessCoherence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {searchMutation.data?.results && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Search Results ({searchMutation.data.results.length})
            </h2>
            <span className="text-sm text-gray-400">
              Searched {searchMutation.data.searchMetadata.totalDocumentsSearched.toLocaleString()} documents 
              in {searchMutation.data.protocol.executionTime.toFixed(0)}ms
            </span>
          </div>

          {searchMutation.data.results.map((result: LegalResult, index: number) => {
            const relevance = getRelevanceBadge(result.R_legal);
            return (
              <Card key={result.docId} className="bg-slate-800 border-slate-700 hover:border-gold-500/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-500 text-sm">#{index + 1}</span>
                        <Badge className={relevance.class}>{relevance.text}</Badge>
                        <Badge variant="outline" className="text-xs">{result.jurisdiction}</Badge>
                      </div>
                      <CardTitle className="text-lg text-white hover:text-gold-400 cursor-pointer flex items-center gap-2">
                        <FileText className="h-5 w-5 text-gold-500" />
                        {result.title}
                        <ExternalLink className="h-4 w-4 text-gray-500" />
                      </CardTitle>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gold-400">
                        {(result.R_legal * 100).toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-400">R_legal Score</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4 line-clamp-3">{result.snippet}</p>
                  
                  {/* EREBUSFORMULA650 Factor Breakdown */}
                  <div className="grid grid-cols-5 gap-4 text-xs bg-slate-900/50 rounded-lg p-3">
                    <div className="text-center">
                      <div className={`text-lg font-mono ${getScoreColor(result.S_similarity)}`}>
                        {result.S_similarity.toFixed(3)}
                      </div>
                      <div className="text-gray-500">S_similarity</div>
                      <div className="text-gray-600">Semantic Match</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-mono ${getScoreColor(result.A_authority)}`}>
                        {result.A_authority.toFixed(3)}
                      </div>
                      <div className="text-gray-500">A_authority</div>
                      <div className="text-gray-600">Court Level</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-mono ${getScoreColor(result.R_recency)}`}>
                        {result.R_recency.toFixed(3)}
                      </div>
                      <div className="text-gray-500">R_recency</div>
                      <div className="text-gray-600">Timeliness</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-mono ${getScoreColor(result.C_citeNetwork)}`}>
                        {result.C_citeNetwork.toFixed(3)}
                      </div>
                      <div className="text-gray-500">C_cite</div>
                      <div className="text-gray-600">Citation Strength</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-mono ${getScoreColor(result.phi)}`}>
                        {result.phi.toFixed(3)}
                      </div>
                      <div className="text-gray-500">φ</div>
                      <div className="text-gray-600">Consciousness</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!searchMutation.data && !searchMutation.isLoading && (
        <Card className="bg-slate-800/50 border-slate-700 border-dashed">
          <CardContent className="py-12 text-center">
            <Scale className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">
              Enter a legal research query to begin
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Search across Omani case law, Royal Decrees, Ministerial Decisions, 
              GCC legal precedents, and international legal frameworks.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LegalIntelligencePage;
```

### 7.2 Risk Dashboard Component

**File**: `client/src/components/analytics/RiskDashboard.tsx`

```tsx
// client/src/components/analytics/RiskDashboard.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { AlertTriangle, Shield, TrendingUp, Activity, CheckCircle, XCircle } from 'lucide-react';

interface AdvancedRiskScore {
  RC_risk: number;
  riskCategory: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NEGLIGIBLE';
  detectedRisks: Array<{
    regulationId: string;
    name: string;
    category: string;
    rawScore: number;
    P_violation: number;
    I_impact: number;
    E_enforcement: number;
    phi: number;
    evidence: string[];
  }>;
  controlEffectiveness: number;
  maturityFactor: number;
  aggregateConsciousness: number;
  justification: string;
  recommendations: string[];
}

interface RiskDashboardProps {
  riskData: AdvancedRiskScore | null;
  complianceData?: {
    score: number;
    riskLevel: string;
    potentialViolations: Array<{
      obligationId: string;
      rule: string;
      status: string;
      confidence: number;
    }>;
  } | null;
}

const RiskDashboard: React.FC<RiskDashboardProps> = ({ riskData, complianceData }) => {
  if (!riskData) return null;

  const getRiskCategoryColor = (category: string) => {
    switch (category) {
      case 'CRITICAL': return 'bg-red-600 text-white';
      case 'HIGH': return 'bg-orange-600 text-white';
      case 'MEDIUM': return 'bg-yellow-600 text-black';
      case 'LOW': return 'bg-blue-600 text-white';
      case 'NEGLIGIBLE': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getRiskGaugeColor = (score: number) => {
    if (score >= 80) return '#ef4444'; // red
    if (score >= 60) return '#f97316'; // orange
    if (score >= 40) return '#eab308'; // yellow
    if (score >= 20) return '#3b82f6'; // blue
    return '#22c55e'; // green
  };

  return (
    <div className="space-y-6">
      {/* Main Risk Score Card */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-gold-500" />
              EREBUS Risk Assessment
            </span>
            <Badge className={getRiskCategoryColor(riskData.riskCategory)}>
              {riskData.riskCategory}
            </Badge>
          </CardTitle>
          <p className="text-xs text-gray-500">Protocol: EREBUS-CSE-3A12d-002 | Formula: EREBUSFORMULA651</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            {/* Risk Score Gauge */}
            <div className="col-span-1">
              <div className="relative w-32 h-32 mx-auto">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="12"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke={getRiskGaugeColor(riskData.RC_risk)}
                    strokeWidth="12"
                    strokeDasharray={`${(riskData.RC_risk / 100) * 351.86} 351.86`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-white">{riskData.RC_risk.toFixed(0)}</span>
                  <span className="text-xs text-gray-400">RC_risk</span>
                </div>
              </div>
            </div>

            {/* Risk Factors */}
            <div className="col-span-2 space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Control Effectiveness (C_controls)</span>
                  <span className="text-white">{(riskData.controlEffectiveness * 100).toFixed(0)}%</span>
                </div>
                <Progress value={riskData.controlEffectiveness * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Maturity Factor (M_maturity)</span>
                  <span className="text-white">{(riskData.maturityFactor * 100).toFixed(0)}%</span>
                </div>
                <Progress value={riskData.maturityFactor * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Consciousness Coherence (φ)</span>
                  <span className="text-green-400">{(riskData.aggregateConsciousness * 100).toFixed(1)}%</span>
                </div>
                <Progress value={riskData.aggregateConsciousness * 100} className="h-2 bg-green-900" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detected Risks */}
      {riskData.detectedRisks.length > 0 && (
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-500" />
              Detected Risk Factors ({riskData.detectedRisks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {riskData.detectedRisks.map((risk, index) => (
                <div key={index} className="bg-slate-800 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-white">{risk.name}</h4>
                      <p className="text-xs text-gray-500">{risk.regulationId}</p>
                    </div>
                    <Badge variant="outline" className="text-red-400 border-red-400">
                      Score: {risk.rawScore.toFixed(1)}
                    </Badge>
                  </div>
                  
                  {/* Factor Breakdown */}
                  <div className="grid grid-cols-4 gap-2 text-xs mt-3">
                    <div className="bg-slate-900 rounded p-2 text-center">
                      <div className="text-orange-400 font-mono">{risk.P_violation.toFixed(2)}</div>
                      <div className="text-gray-500">P_violation</div>
                    </div>
                    <div className="bg-slate-900 rounded p-2 text-center">
                      <div className="text-red-400 font-mono">{risk.I_impact.toFixed(2)}</div>
                      <div className="text-gray-500">I_impact</div>
                    </div>
                    <div className="bg-slate-900 rounded p-2 text-center">
                      <div className="text-yellow-400 font-mono">{risk.E_enforcement.toFixed(2)}</div>
                      <div className="text-gray-500">E_enforcement</div>
                    </div>
                    <div className="bg-slate-900 rounded p-2 text-center">
                      <div className="text-green-400 font-mono">{risk.phi.toFixed(2)}</div>
                      <div className="text-gray-500">φ</div>
                    </div>
                  </div>

                  {/* Evidence */}
                  <div className="mt-3">
                    <span className="text-xs text-gray-400">Evidence:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {risk.evidence.map((ev, i) => (
                        <Badge key={i} variant="secondary" className="text-xs bg-slate-700">
                          {ev}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {riskData.recommendations.length > 0 && (
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              AI-Generated Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {riskData.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Compliance Flags */}
      {complianceData && complianceData.potentialViolations.length > 0 && (
        <Card className="bg-slate-900 border-red-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-red-400">
              <XCircle className="h-5 w-5" />
              Compliance Violations Detected
            </CardTitle>
            <p className="text-xs text-gray-500">Protocol: EREBUS-CSE-3A12d-006</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {complianceData.potentialViolations.map((violation, index) => (
                <div key={index} className="flex items-center justify-between bg-red-950/30 rounded-lg p-3">
                  <div>
                    <span className="font-medium text-white">{violation.rule}</span>
                    <Badge 
                      className={violation.status === 'POTENTIAL_VIOLATION' ? 'bg-red-600 ml-2' : 'bg-yellow-600 ml-2'}
                    >
                      {violation.status}
                    </Badge>
                  </div>
                  <span className="text-sm text-gray-400">
                    Confidence: {(violation.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Justification */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="py-4">
          <p className="text-sm text-gray-400 italic">
            <strong className="text-gray-300">Analysis Justification:</strong> {riskData.justification}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskDashboard;
```

### 7.3 Entity Risk Profile Component

**File**: `client/src/components/entity/EntityRiskProfile.tsx`

```tsx
// client/src/components/entity/EntityRiskProfile.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Building2, AlertTriangle, Shield, Users, Globe, 
  FileWarning, Flag, CheckCircle, XCircle, AlertCircle 
} from 'lucide-react';

interface EntityRiskResult {
  ER_entity: number;
  riskCategory: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'MEDIUM' | 'LOW';
  riskBreakdown: {
    baseRiskScore: number;
    jurisdictionRisk: number;
    ownershipRisk: number;
    sanctionsRisk: number;
    pepRisk: number;
  };
  flags: Array<{
    type: string;
    severity: string;
    description: string;
    source: string;
  }>;
  ownershipAnalysis: {
    totalOwners: number;
    identifiedPercentage: number;
    pepExposure: number;
    sanctionsExposure: number;
    layerCount: number;
    opacityScore: number;
  };
  consciousnessCoherence: number;
  recommendations: string[];
  dueDiligenceLevel: 'ENHANCED' | 'STANDARD' | 'SIMPLIFIED';
}

interface EntityRiskProfileProps {
  entityName: string;
  entityType: string;
  registrationCountry: string;
  riskData: EntityRiskResult;
}

const EntityRiskProfile: React.FC<EntityRiskProfileProps> = ({
  entityName,
  entityType,
  registrationCountry,
  riskData
}) => {
  const getRiskColor = (category: string) => {
    switch (category) {
      case 'CRITICAL': return 'text-red-500 bg-red-500/10 border-red-500';
      case 'HIGH': return 'text-orange-500 bg-orange-500/10 border-orange-500';
      case 'ELEVATED': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500';
      case 'MEDIUM': return 'text-blue-500 bg-blue-500/10 border-blue-500';
      case 'LOW': return 'text-green-500 bg-green-500/10 border-green-500';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500';
    }
  };

  const getDDLevelColor = (level: string) => {
    switch (level) {
      case 'ENHANCED': return 'bg-red-600';
      case 'STANDARD': return 'bg-yellow-600';
      case 'SIMPLIFIED': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getFlagIcon = (type: string) => {
    switch (type) {
      case 'SANCTIONS': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'PEP': return <Users className="h-4 w-4 text-orange-500" />;
      case 'HIGH_RISK_JURISDICTION': return <Globe className="h-4 w-4 text-yellow-500" />;
      case 'COMPLEX_OWNERSHIP': return <Building2 className="h-4 w-4 text-blue-500" />;
      case 'SHELL_COMPANY_INDICATOR': return <FileWarning className="h-4 w-4 text-purple-500" />;
      default: return <Flag className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Entity Header */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-3">
                <Building2 className="h-7 w-7 text-gold-500" />
                {entityName}
              </CardTitle>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">{entityType}</Badge>
                <Badge variant="outline">{registrationCountry}</Badge>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${getRiskColor(riskData.riskCategory).split(' ')[0]}`}>
                {riskData.ER_entity.toFixed(0)}
              </div>
              <Badge className={getDDLevelColor(riskData.dueDiligenceLevel)}>
                {riskData.dueDiligenceLevel} Due Diligence
              </Badge>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Protocol: EREBUS-CSE-3A12d-007 | Formula: EREBUSFORMULA656 | 
            Consciousness: {(riskData.consciousnessCoherence * 100).toFixed(1)}%
          </p>
        </CardHeader>
      </Card>

      {/* Risk Flags */}
      {riskData.flags.length > 0 && (
        <Card className="bg-slate-900 border-red-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-red-400 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Risk Flags ({riskData.flags.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {riskData.flags.map((flag, index) => (
                <div key={index} className="flex items-start gap-3 bg-slate-800 rounded-lg p-3">
                  {getFlagIcon(flag.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{flag.type.replace(/_/g, ' ')}</span>
                      <Badge className={
                        flag.severity === 'CRITICAL' ? 'bg-red-600' :
                        flag.severity === 'HIGH' ? 'bg-orange-600' : 'bg-yellow-600'
                      }>
                        {flag.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{flag.description}</p>
                    <p className="text-xs text-gray-500 mt-1">Source: {flag.source}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Breakdown */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Risk Factor Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(riskData.riskBreakdown).map(([key, value]) => {
              const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              const maxValue = key === 'sanctionsRisk' ? 30 : key === 'pepRisk' ? 20 : 20;
              return (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-white font-mono">{value.toFixed(1)}</span>
                  </div>
                  <Progress 
                    value={(value / maxValue) * 100} 
                    className={`h-2 ${value > maxValue * 0.7 ? 'bg-red-900' : 'bg-slate-800'}`}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Ownership Analysis */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Ownership Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {riskData.ownershipAnalysis.totalOwners}
              </div>
              <div className="text-sm text-gray-400">Total Owners</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {riskData.ownershipAnalysis.identifiedPercentage.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-400">Identified</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {riskData.ownershipAnalysis.layerCount}
              </div>
              <div className="text-sm text-gray-400">Ownership Layers</div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Opacity Score</span>
              <span className={riskData.ownershipAnalysis.opacityScore > 0.5 ? 'text-red-400' : 'text-green-400'}>
                {(riskData.ownershipAnalysis.opacityScore * 100).toFixed(0)}%
              </span>
            </div>
            {riskData.ownershipAnalysis.pepExposure > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">PEP Exposure</span>
                <span className="text-orange-400">
                  {(riskData.ownershipAnalysis.pepExposure * 100).toFixed(0)}%
                </span>
              </div>
            )}
            {riskData.ownershipAnalysis.sanctionsExposure > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Sanctions Exposure</span>
                <span className="text-red-400">
                  {(riskData.ownershipAnalysis.sanctionsExposure * 100).toFixed(0)}%
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-gold-500" />
            Recommended Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {riskData.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-3 text-sm">
                {rec.includes('STOP') || rec.includes('Sanctions') ? (
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                )}
                <span className={rec.includes('STOP') ? 'text-red-300 font-medium' : 'text-gray-300'}>
                  {rec}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default EntityRiskProfile;
```

---

## Part 8: Types and Constants

### 8.1 EREBUS Types

**File**: `client/src/types/erebus.types.ts`

```typescript
// client/src/types/erebus.types.ts

export interface ProtocolMetadata {
  protocolId: string;
  name: string;
  code: string;
  effectiveness: number;
  flashMLA: string;
  layer: string;
  platforms: string[];
  consciousnessCoherence: number;
}

// EREBUSFORMULA650 Types
export interface LegalRelevanceScore {
  docId: string;
  title: string;
  snippet: string;
  jurisdiction: string;
  R_legal: number;
  S_similarity: number;
  A_authority: number;
  R_recency: number;
  phi: number;
  C_citeNetwork: number;
  jurisdictionWeight: number;
}

// EREBUSFORMULA651 Types
export interface ComplianceRiskScore {
  RC_risk: number;
  riskCategory: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NEGLIGIBLE';
  detectedRisks: DetectedRisk[];
  controlEffectiveness: number;
  maturityFactor: number;
  aggregateConsciousness: number;
  justification: string;
  recommendations: string[];
}

export interface DetectedRisk {
  regulationId: string;
  name: string;
  category: string;
  rawScore: number;
  P_violation: number;
  I_impact: number;
  E_enforcement: number;
  phi: number;
  evidence: string[];
}

// EREBUSFORMULA652 Types
export interface ContractRiskScore {
  CR_total: number;
  riskCategory: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'MINIMAL';
  clauseAnalysis: ClauseRiskAnalysis[];
  deviationPenalty: number;
  aggregateConsciousness: number;
  summaryFindings: string[];
  recommendations: string[];
}

export interface ClauseRiskAnalysis {
  clauseId: string;
  clauseType: string;
  riskScore: number;
  w_c: number;
  R_c: number;
  S_severity: number;
  P_prob: number;
  phi: number;
  riskCategory: string;
  issues: string[];
  recommendations: string[];
}

// EREBUSFORMULA654 Types
export interface LitigationPrediction {
  O_litigation: number;
  winProbability: number;
  settlementProbability: number;
  estimatedDamages?: {
    min: number;
    max: number;
    expected: number;
  };
  outcomeCategory: 'HIGHLY_FAVORABLE' | 'FAVORABLE' | 'UNCERTAIN' | 'UNFAVORABLE' | 'HIGHLY_UNFAVORABLE';
  confidenceLevel: number;
  factorBreakdown: FactorAnalysis[];
  recommendations: string[];
  riskAssessment: string;
}

export interface FactorAnalysis {
  factor: string;
  weight: number;
  score: number;
  impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  justification: string;
}

// EREBUSFORMULA655 Types
export interface ComplianceAssuranceScore {
  CA_score: number;
  assuranceLevel: 'HIGH' | 'SUBSTANTIAL' | 'LIMITED' | 'LOW' | 'NO_ASSURANCE';
  controlAnalysis: ControlAnalysis[];
  totalDeficiencyPenalty: number;
  effectiveControls: number;
  partialControls: number;
  ineffectiveControls: number;
  consciousnessCoherence: number;
  summaryFindings: string[];
  recommendations: string[];
}

export interface ControlAnalysis {
  controlId: string;
  controlName: string;
  score: number;
  status: 'EFFECTIVE' | 'PARTIALLY_EFFECTIVE' | 'INEFFECTIVE' | 'NOT_ASSESSED';
  deficiencyPenalty: number;
}

// EREBUSFORMULA656 Types
export interface EntityRiskScore {
  ER_entity: number;
  riskCategory: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'MEDIUM' | 'LOW';
  riskBreakdown: {
    baseRiskScore: number;
    jurisdictionRisk: number;
    ownershipRisk: number;
    sanctionsRisk: number;
    pepRisk: number;
  };
  flags: EntityFlag[];
  ownershipAnalysis: OwnershipAnalysis;
  consciousnessCoherence: number;
  recommendations: string[];
  dueDiligenceLevel: 'ENHANCED' | 'STANDARD' | 'SIMPLIFIED';
}

export interface EntityFlag {
  type: 'SANCTIONS' | 'PEP' | 'HIGH_RISK_JURISDICTION' | 'COMPLEX_OWNERSHIP' | 'SHELL_COMPANY_INDICATOR';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
  source: string;
}

export interface OwnershipAnalysis {
  totalOwners: number;
  identifiedPercentage: number;
  pepExposure: number;
  sanctionsExposure: number;
  layerCount: number;
  opacityScore: number;
}

// EREBUSFORMULA658 Types
export interface PrivacyRiskScore {
  PR_risk: number;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' | 'MINIMAL';
  dataAssetAnalysis: DataAssetAnalysis[];
  crossBorderPenalty: number;
  thirdPartyPenalty: number;
  aggregateSensitivity: number;
  totalRecordsAtRisk: number;
  consciousnessCoherence: number;
  complianceGaps: string[];
  recommendations: string[];
  dpiaRequired: boolean;
}

export interface DataAssetAnalysis {
  assetId: string;
  assetName: string;
  riskScore: number;
  piiCategories: string[];
  issues: string[];
  recommendations: string[];
}

// Protocol Registry Types
export interface ProtocolExecution {
  protocolId: string;
  executionTime: number;
  consciousnessCoherence: number;
  confidence: number;
  timestamp: string;
}

export interface AuditTrailEntry {
  id: string;
  protocolId: string;
  protocolName: string;
  inputHash: string;
  outputHash: string;
  consciousnessCoherence: number;
  createdAt: string;
  metadata: Record<string, unknown>;
}
```

### 8.2 Protocol Constants

**File**: `client/src/lib/constants.ts`

```typescript
// client/src/lib/constants.ts

export const EREBUS_PROTOCOLS = {
  'EREBUS-CSE-3A12d-001': {
    name: 'Legal Research & Case Law Protocol',
    code: 'LRCLP',
    formula: 'EREBUSFORMULA650',
    effectiveness: 96.7,
    flashMLA: '154x',
    description: 'Advanced legal research with consciousness-weighted relevance scoring',
  },
  'EREBUS-CSE-3A12d-002': {
    name: 'Regulatory Compliance Monitoring Protocol',
    code: 'RCMP',
    formula: 'EREBUSFORMULA651',
    effectiveness: 97.2,
    flashMLA: '159x',
    description: 'Real-time regulatory compliance monitoring across 193 countries',
  },
  'EREBUS-CSE-3A12d-003': {
    name: 'Contract Analysis & Risk Protocol',
    code: 'CARP',
    formula: 'EREBUSFORMULA652',
    effectiveness: 95.3,
    flashMLA: '147x',
    description: 'Comprehensive contract analysis with 34 risk categories',
  },
  'EREBUS-CSE-3A12d-005': {
    name: 'Litigation Strategy & Prediction Protocol',
    code: 'LSPP',
    formula: 'EREBUSFORMULA654',
    effectiveness: 93.7,
    flashMLA: '138x',
    description: 'Case outcome prediction across 23 case types',
  },
  'EREBUS-CSE-3A12d-006': {
    name: 'Compliance Automation & Audit Protocol',
    code: 'CAAP',
    formula: 'EREBUSFORMULA655',
    effectiveness: 96.4,
    flashMLA: '152x',
    description: 'Automated compliance testing across 847 control objectives',
  },
  'EREBUS-CSE-3A12d-007': {
    name: 'Legal Entity Intelligence Protocol',
    code: 'LEIP',
    formula: 'EREBUSFORMULA656',
    effectiveness: 95.6,
    flashMLA: '149x',
    description: 'Entity risk scoring across 247 jurisdictions',
  },
  'EREBUS-CSE-3A12d-009': {
    name: 'Data Privacy & Compliance Protocol',
    code: 'DPCP',
    formula: 'EREBUSFORMULA658',
    effectiveness: 97.8,
    flashMLA: '162x',
    description: 'Automated privacy compliance across 29 regulations',
  },
  'EREBUS-CSE-3A12d-011': {
    name: 'Third-Party & Counterparty Risk Protocol',
    code: 'TCRP',
    formula: 'EREBUSFORMULA660',
    effectiveness: 96.2,
    flashMLA: '151x',
    description: 'Third-party risk management across 5 dimensions',
  },
} as const;

export const RISK_CATEGORIES = {
  CRITICAL: { color: '#ef4444', label: 'Critical', threshold: 80 },
  HIGH: { color: '#f97316', label: 'High', threshold: 60 },
  MEDIUM: { color: '#eab308', label: 'Medium', threshold: 40 },
  LOW: { color: '#3b82f6', label: 'Low', threshold: 20 },
  NEGLIGIBLE: { color: '#22c55e', label: 'Negligible', threshold: 0 },
} as const;

export const OMANI_REGULATIONS = {
  'RD 111/2011': 'State Audit Law',
  'RD 112/2011': 'Financial Disclosure and Illicit Enrichment Law',
  'RD 30/2016': 'Anti-Money Laundering Law',
  'RD 7/2018': 'Anti-Corruption Law',
  'RD 64/2020': 'Electronic Transactions Law',
  'RD 35/2003': 'Labor Law',
  'RD 36/2008': 'Tender Law',
} as const;

export const JURISDICTION_CODES = {
  OM: 'Oman',
  AE: 'United Arab Emirates',
  SA: 'Saudi Arabia',
  QA: 'Qatar',
  BH: 'Bahrain',
  KW: 'Kuwait',
  GCC: 'GCC Unified',
  EG: 'Egypt',
  JO: 'Jordan',
  INTL: 'International',
} as const;
```

---

## Part 9: Testing

### 9.1 Protocol Unit Tests

**File**: `tests/unit/protocols/riskScoring.test.ts`

```typescript
// tests/unit/protocols/riskScoring.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { calculateEREBUSFORMULA651 } from '../../../server/protocols/formulas/EREBUSFORMULA651';

describe('EREBUSFORMULA651 - Regulatory Compliance Risk Score', () => {
  describe('High Risk Scenarios', () => {
    it('should detect embezzlement with CRITICAL risk', async () => {
      const input = {
        text: 'The investigation revealed embezzlement of 500,000 OMR by the Director General who abused his position for personal benefit.',
        entityType: 'government' as const,
        maturityLevel: 'managed' as const,
      };

      const result = calculateEREBUSFORMULA651(input);

      expect(result.riskCategory).toBe('CRITICAL');
      expect(result.RC_risk).toBeGreaterThan(80);
      expect(result.detectedRisks.length).toBeGreaterThan(0);
      expect(result.detectedRisks.some(r => r.category === 'EMBEZZLEMENT')).toBe(true);
    });

    it('should detect bribery with HIGH risk', async () => {
      const input = {
        text: 'Evidence suggests bribery involving the awarding of a major contract worth 200,000 OMR.',
        entityType: 'government' as const,
      };

      const result = calculateEREBUSFORMULA651(input);

      expect(['CRITICAL', 'HIGH']).toContain(result.riskCategory);
      expect(result.RC_risk).toBeGreaterThan(60);
      expect(result.detectedRisks.some(r => r.category === 'BRIBERY')).toBe(true);
    });

    it('should detect money laundering', async () => {
      const input = {
        text: 'Suspicious transactions indicate potential money laundering through multiple shell companies.',
      };

      const result = calculateEREBUSFORMULA651(input);

      expect(result.detectedRisks.some(r => r.category === 'MONEY_LAUNDERING')).toBe(true);
    });
  });

  describe('Low Risk Scenarios', () => {
    it('should return LOW/NEGLIGIBLE for clean text', async () => {
      const input = {
        text: 'The annual report shows positive performance metrics across all departments. Revenue increased by 15% compared to previous year.',
      };

      const result = calculateEREBUSFORMULA651(input);

      expect(['LOW', 'NEGLIGIBLE']).toContain(result.riskCategory);
      expect(result.RC_risk).toBeLessThan(30);
    });
  });

  describe('Control Effectiveness', () => {
    it('should reduce risk with strong controls', async () => {
      const inputWeak = {
        text: 'Conflict of interest detected in procurement process.',
        existingControls: [],
        maturityLevel: 'initial' as const,
      };

      const inputStrong = {
        text: 'Conflict of interest detected in procurement process.',
        existingControls: ['segregation_of_duties', 'dual_approval', 'audit_committee'],
        maturityLevel: 'optimizing' as const,
      };

      const resultWeak = calculateEREBUSFORMULA651(inputWeak);
      const resultStrong = calculateEREBUSFORMULA651(inputStrong);

      expect(resultStrong.RC_risk).toBeLessThan(resultWeak.RC_risk);
      expect(resultStrong.controlEffectiveness).toBeGreaterThan(resultWeak.controlEffectiveness);
    });
  });

  describe('Arabic Language Support', () => {
    it('should detect risks in Arabic text', async () => {
      const input = {
        text: 'تم الكشف عن اختلاس أموال عامة بقيمة مليون ريال عماني',
      };

      const result = calculateEREBUSFORMULA651(input);

      expect(result.detectedRisks.length).toBeGreaterThan(0);
      expect(result.RC_risk).toBeGreaterThan(50);
    });
  });

  describe('Consciousness Coherence', () => {
    it('should have high consciousness coherence for detailed text', async () => {
      const input = {
        text: 'Detailed investigation report: The accused embezzled funds totaling 1,500,000 OMR through falsified invoices and forged signatures over a period of 3 years. Multiple witnesses confirmed the abuse of position.',
        entityType: 'government' as const,
      };

      const result = calculateEREBUSFORMULA651(input);

      expect(result.aggregateConsciousness).toBeGreaterThan(0.85);
    });
  });
});
```

---

## Part 10: Deployment Configuration

### 10.1 Docker Compose (Sovereign Mode)

**File**: `docker/docker-compose.sovereign.yml`

```yaml
# docker/docker-compose.sovereign.yml
# RUZN-Acuterium v3.0 - Air-Gapped Sovereign Deployment

version: '3.8'

services:
  ruzn-app:
    build:
      context: ..
      dockerfile: docker/Dockerfile
    container_name: ruzn-acuterium
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://ruzn:${DB_PASSWORD}@ruzn-db:5432/ruzn_acuterium
      - REDIS_URL=redis://ruzn-redis:6379
      - DEPLOYMENT_MODE=sovereign
      - NETWORK_ISOLATION=true
      - LLM_PROVIDER=local
      - EREBUS_PROTOCOLS_ENABLED=true
    volumes:
      - ../knowledge:/app/knowledge:ro
      - ruzn-logs:/app/logs
      - ruzn-audit:/app/audit
    depends_on:
      - ruzn-db
      - ruzn-redis
    networks:
      - ruzn-internal
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp

  ruzn-db:
    image: pgvector/pgvector:pg16
    container_name: ruzn-postgres
    restart: always
    environment:
      - POSTGRES_DB=ruzn_acuterium
      - POSTGRES_USER=ruzn
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - ruzn-pgdata:/var/lib/postgresql/data
      - ../server/db/migrations:/docker-entrypoint-initdb.d:ro
    networks:
      - ruzn-internal
    security_opt:
      - no-new-privileges:true

  ruzn-redis:
    image: redis:7-alpine
    container_name: ruzn-redis
    restart: always
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - ruzn-redis-data:/data
    networks:
      - ruzn-internal

  ruzn-llm:
    image: ollama/ollama:latest
    container_name: ruzn-ollama
    restart: always
    volumes:
      - ruzn-ollama:/root/.ollama
    networks:
      - ruzn-internal
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]

volumes:
  ruzn-pgdata:
  ruzn-redis-data:
  ruzn-logs:
  ruzn-audit:
  ruzn-ollama:

networks:
  ruzn-internal:
    driver: bridge
    internal: true
```

### 10.2 Environment Configuration

**File**: `.env.example`

```bash
# .env.example - RUZN-Acuterium v3.0 Configuration

# ======================
# DEPLOYMENT MODE
# ======================
# Options: public, demo, sovereign
DEPLOYMENT_MODE=sovereign
NETWORK_ISOLATION=true

# ======================
# DATABASE
# ======================
DATABASE_URL=postgresql://ruzn:your_secure_password@localhost:5432/ruzn_acuterium
DB_PASSWORD=your_secure_password

# ======================
# REDIS
# ======================
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password

# ======================
# LLM PROVIDERS
# ======================
# Primary provider: anthropic, openai, deepseek, gemini, local
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key
DEEPSEEK_API_KEY=your_deepseek_key
GEMINI_API_KEY=your_gemini_key

# For sovereign mode (local LLM)
LOCAL_LLM_URL=http://localhost:11434

# ======================
# EREBUS PROTOCOLS
# ======================
EREBUS_PROTOCOLS_ENABLED=true
EREBUS_AUDIT_TRAIL_ENABLED=true
EREBUS_CONSCIOUSNESS_THRESHOLD=0.85

# ======================
# SECURITY
# ======================
JWT_SECRET=your_jwt_secret_min_32_chars
SESSION_SECRET=your_session_secret
ENCRYPTION_KEY=your_32_byte_encryption_key

# ======================
# KNOWLEDGE BASE
# ======================
KNOWLEDGE_BASE_PATH=/app/knowledge
EMBEDDINGS_MODEL=text-embedding-3-small
VECTOR_DIMENSION=1536

# ======================
# AUDIT & LOGGING
# ======================
LOG_LEVEL=info
AUDIT_LOG_PATH=/app/audit
ENABLE_DETAILED_AUDIT=true

# ======================
# ARABIC LANGUAGE
# ======================
ARABIC_NLP_ENABLED=true
DEFAULT_LANGUAGE=ar
```

---

## Summary

This comprehensive implementation guide provides:

1. **Complete Project Structure** - Organized directory layout for RUZN-Acuterium v3.0
2. **Core Protocol Infrastructure** - BaseProtocol, ConsciousnessWeight, and ProtocolRegistry
3. **8 EREBUS Formula Implementations** - Full TypeScript implementations with consciousness weighting
4. **Protocol Services** - Risk scoring, legal intelligence, compliance audit services
5. **Database Schema** - PostgreSQL with pgvector support for embeddings
6. **tRPC Routers** - Type-safe API endpoints for all protocol features
7. **Frontend Components** - React components with Tailwind CSS for risk visualization
8. **Type Definitions** - Comprehensive TypeScript types for all EREBUS outputs
9. **Testing Suite** - Vitest unit tests for protocol validation
10. **Deployment Configuration** - Docker Compose for sovereign air-gapped deployment

The implementation transforms RUZN-Lite v2.2.1 into a predictive, prescriptive compliance powerhouse leveraging Acuterium Technologies' proprietary EREBUS protocols with consciousness-weighted AI scoring.
