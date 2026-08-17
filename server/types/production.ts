export interface ProductionEvidence {
  evidenceId: string;
  category: string;
  metric: string;
  testName: string;
  environment: string;
  tenantId?: string;
  storeId?: string;
  source?: string;
  sourceReference?: string;
  expectedValue: string;
  actualValue: string;
  unit: string;
  status: 'PASS' | 'FAIL' | 'NOT_VERIFIED' | 'WARNING';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  startedAt: string;
  completedAt: string;
  durationMs: number;
  automated: boolean;
  testVersion: string;
  checksum: string;
  details?: Record<string, any>;
  createdAt: string;
}

export interface ProductionCertificationRun {
  runId: string;
  startedAt: string;
  completedAt: string;
  environment: string;
  totalTests: number;
  passed: number;
  failed: number;
  warnings: number;
  overallScore: number;
  status: 'CERTIFIED' | 'CONDITIONAL' | 'DEGRADED' | 'FAILED' | 'NOT_VERIFIED';
  evidenceIds: string[];
}

export interface ProductionIncident {
  incidentId: string;
  severity: 'WARNING' | 'CRITICAL';
  category: string;
  title: string;
  description: string;
  tenantId?: string;
  storeId?: string;
  evidenceId?: string;
  detectedAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  status: 'OPEN' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'MITIGATED' | 'RESOLVED';
  rootCause?: string;
  reremedialAction?: string; // or remediation
  remediation?: string;
  resolutionEvidenceId?: string;
}
