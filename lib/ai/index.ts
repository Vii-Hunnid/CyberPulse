import Anthropic from '@anthropic-ai/sdk';
import type { ScanResult, FindingResult, DarkWebResult, UnderwritingAnalysis } from '../../types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = 'claude-sonnet-4-20250514';

export async function generateRiskNarrative(scanResult: ScanResult): Promise<string> {
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system:
      'You are a senior cybersecurity analyst writing plain-English risk summaries for non-technical SME business owners in South Africa. Write clearly, avoid jargon, be direct about severity, and always end with the single most important action to take first.',
    messages: [
      {
        role: 'user',
        content: `Please write a risk narrative for this cyber security scan result:\n\n${JSON.stringify(scanResult, null, 2)}`,
      },
    ],
  });

  const content = message.content[0];
  return content.type === 'text' ? content.text : '';
}

export async function generateRemediationSteps(finding: FindingResult): Promise<string> {
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system:
      'You are a cybersecurity engineer writing step-by-step remediation instructions for SME IT administrators in South Africa. Steps must be specific, actionable, and achievable without enterprise tooling. Include estimated time to fix.',
    messages: [
      {
        role: 'user',
        content: `Please provide remediation steps for this security finding:\n\nTitle: ${finding.title}\nCategory: ${finding.category}\nSeverity: ${finding.severity}\nDescription: ${finding.description}`,
      },
    ],
  });

  const content = message.content[0];
  return content.type === 'text' ? content.text : '';
}

export async function generateUnderwritingScore(
  scanResult: ScanResult
): Promise<UnderwritingAnalysis> {
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system:
      'You are a cyber insurance underwriter assessing an SME\'s insurability for a cyber liability policy. Score the organisation 0-100 based on their security posture. Return ONLY valid JSON, no markdown, no preamble.',
    messages: [
      {
        role: 'user',
        content: `Assess this organisation\'s cyber insurance readiness:\n\n${JSON.stringify(scanResult, null, 2)}\n\nReturn JSON with keys: underwritingScore (number), insurabilityGrade (A/B/C/D/F), keyRiskFactors (string[]), positiveFactors (string[]), recommendedCoverageLevel (Basic/Standard/Comprehensive), premiumIndicator (Low/Medium/High/Uninsurable), summary (string)`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from AI');
  }

  try {
    return JSON.parse(content.text) as UnderwritingAnalysis;
  } catch {
    // Return default if parsing fails
    return {
      underwritingScore: scanResult.overallScore,
      insurabilityGrade: scanResult.grade as 'A' | 'B' | 'C' | 'D' | 'F',
      keyRiskFactors: scanResult.findings
        .filter((f) => f.severity === 'CRITICAL' || f.severity === 'HIGH')
        .map((f) => f.title)
        .slice(0, 5),
      positiveFactors: [],
      recommendedCoverageLevel: 'Standard',
      premiumIndicator: 'Medium',
      summary: 'Unable to generate detailed analysis. Please review findings manually.',
    };
  }
}

export async function analyzeDarkWebExposures(exposures: DarkWebResult[]): Promise<string> {
  if (exposures.length === 0) {
    return 'No dark web exposures were detected for this domain. This is a positive sign, but continue to monitor regularly as breaches can take months to surface.';
  }

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 512,
    system:
      'You are a threat intelligence analyst. Summarise dark web credential exposure findings for a non-technical business owner. Explain the real-world risk plainly. Be direct but not alarmist.',
    messages: [
      {
        role: 'user',
        content: `Summarise these dark web breach findings in plain English (max 150 words):\n\n${JSON.stringify(exposures, null, 2)}`,
      },
    ],
  });

  const content = message.content[0];
  return content.type === 'text' ? content.text : '';
}
