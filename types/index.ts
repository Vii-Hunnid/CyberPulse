export interface ScanResult {
  domain: string;
  organisationId: string;
  overallScore: number;
  grade: string;
  categoryScores: CategoryScore[];
  findings: FindingResult[];
  darkWebResults?: DarkWebResult[];
  completedAt: Date;
}

export interface CategoryScore {
  category: string;
  score: number;
  weight: number;
  status: 'pass' | 'warn' | 'fail';
}

export interface FindingResult {
  category: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  remediation?: string;
}

export interface DarkWebResult {
  source: string;
  breachDate: string;
  dataClasses: string[];
  isVerified: boolean;
  description: string;
}

export interface UnderwritingAnalysis {
  underwritingScore: number;
  insurabilityGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  keyRiskFactors: string[];
  positiveFactors: string[];
  recommendedCoverageLevel: 'Basic' | 'Standard' | 'Comprehensive';
  premiumIndicator: 'Low' | 'Medium' | 'High' | 'Uninsurable';
  summary: string;
}

export interface TeaserFinding {
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
}

export interface CategorySummary {
  category: string;
  status: 'pass' | 'warn' | 'fail';
  summary: string;
}

export interface FreeScanPayload {
  domain: string;
  overallScore: number;
  grade: string;
  categoryResults: CategorySummary[];
  top3Findings: TeaserFinding[];
  darkWebBreachCount: number;
  underwritingGrade: string;
  scanId: string;
}

export interface SSEEmitter {
  send(event: string, data: unknown): void;
  close(): void;
}
