import type { FindingResult } from '../../types';

export interface BackupHygieneData {
  lastBackupDate: string | null;
  isOffsite: boolean;
  restorationTested: boolean;
  hasAutomatedBackups: boolean;
}

export async function checkBackupHygiene(data: BackupHygieneData): Promise<{
  score: number;
  findings: FindingResult[];
}> {
  const findings: FindingResult[] = [];
  let score = 100;

  if (!data.lastBackupDate) {
    findings.push({
      category: 'BACKUP_HYGIENE',
      title: 'No backup date reported',
      description: 'No recent backup has been recorded. Without current backups, a ransomware attack or data loss event could be catastrophic.',
      severity: 'CRITICAL',
      remediation: 'Implement daily automated backups immediately. Use a service like Veeam, Acronis, or cloud-native backup solutions.',
    });
    score -= 40;
  } else {
    const lastBackup = new Date(data.lastBackupDate);
    const now = new Date();
    const daysSinceBackup = Math.floor((now.getTime() - lastBackup.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceBackup > 30) {
      findings.push({
        category: 'BACKUP_HYGIENE',
        title: `Last backup was ${daysSinceBackup} days ago`,
        description: 'Your last backup is over 30 days old. Significant data loss is possible in a disaster scenario.',
        severity: 'HIGH',
        remediation: 'Implement daily or weekly automated backups and verify they complete successfully.',
      });
      score -= 25;
    } else if (daysSinceBackup > 7) {
      findings.push({
        category: 'BACKUP_HYGIENE',
        title: `Last backup was ${daysSinceBackup} days ago`,
        description: 'Consider more frequent backups for business-critical data.',
        severity: 'MEDIUM',
        remediation: 'Increase backup frequency to daily for critical systems.',
      });
      score -= 10;
    }
  }

  if (!data.isOffsite) {
    findings.push({
      category: 'BACKUP_HYGIENE',
      title: 'Backups are not stored offsite or in the cloud',
      description: 'On-site backups are vulnerable to the same physical risks as your primary data (fire, flood, theft, ransomware).',
      severity: 'HIGH',
      remediation: 'Store backups in a separate physical location or use cloud storage (AWS S3, Azure Blob, Backblaze B2). Follow the 3-2-1 rule: 3 copies, 2 media types, 1 offsite.',
    });
    score -= 20;
  }

  if (!data.restorationTested) {
    findings.push({
      category: 'BACKUP_HYGIENE',
      title: 'Backup restoration has not been tested recently',
      description: 'Untested backups may be corrupt or incomplete. Many organisations discover backup failures only during an actual disaster.',
      severity: 'MEDIUM',
      remediation: 'Test backup restoration quarterly. Document the restoration procedure and time-to-recovery. Schedule the next test within 90 days.',
    });
    score -= 15;
  }

  if (!data.hasAutomatedBackups) {
    findings.push({
      category: 'BACKUP_HYGIENE',
      title: 'No automated backup process in place',
      description: 'Manual backups are unreliable and frequently skipped. Human error is the leading cause of backup failure.',
      severity: 'HIGH',
      remediation: 'Implement automated daily backups using your hosting provider\'s backup service or a dedicated backup tool.',
    });
    score -= 15;
  }

  return { score: Math.max(0, score), findings };
}
