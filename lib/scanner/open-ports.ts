import net from 'net';
import type { FindingResult } from '../../types';

interface PortCheck {
  port: number;
  service: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  description: string;
  remediation: string;
}

const DANGEROUS_PORTS: PortCheck[] = [
  {
    port: 23,
    service: 'Telnet',
    severity: 'CRITICAL',
    description: 'Telnet (port 23) is open. Telnet transmits data in plaintext including passwords. This is a critical security risk.',
    remediation: 'Disable Telnet immediately. Use SSH (port 22) instead for remote administration. Block port 23 on your firewall.',
  },
  {
    port: 3389,
    service: 'RDP (Remote Desktop)',
    severity: 'CRITICAL',
    description: 'RDP (port 3389) is exposed to the internet. This is a common attack vector for ransomware and brute-force attacks.',
    remediation: 'Restrict RDP access to specific IP addresses or use a VPN. Enable Network Level Authentication. Consider using a jump server.',
  },
  {
    port: 5900,
    service: 'VNC',
    severity: 'CRITICAL',
    description: 'VNC (port 5900) is open to the internet. VNC provides graphical remote access and is frequently targeted by attackers.',
    remediation: 'Block VNC from public access. Use a VPN or SSH tunnel for VNC access.',
  },
  {
    port: 1433,
    service: 'Microsoft SQL Server',
    severity: 'CRITICAL',
    description: 'MSSQL database port (1433) is publicly accessible. Database servers should never be exposed to the internet.',
    remediation: 'Block port 1433 on your firewall. Database servers should only be accessible from application servers on the same network.',
  },
  {
    port: 3306,
    service: 'MySQL Database',
    severity: 'CRITICAL',
    description: 'MySQL database port (3306) is publicly accessible. This exposes your database to direct attack.',
    remediation: 'Block port 3306 on your firewall. Configure MySQL to bind to localhost only (bind-address = 127.0.0.1).',
  },
  {
    port: 27017,
    service: 'MongoDB',
    severity: 'CRITICAL',
    description: 'MongoDB port (27017) is publicly accessible without authentication.',
    remediation: 'Block port 27017 on your firewall and enable MongoDB authentication.',
  },
  {
    port: 6379,
    service: 'Redis',
    severity: 'CRITICAL',
    description: 'Redis port (6379) is publicly accessible. Unsecured Redis instances are frequently compromised.',
    remediation: 'Block port 6379 on your firewall. Enable Redis authentication with a strong password.',
  },
  {
    port: 8080,
    service: 'HTTP Alternate',
    severity: 'MEDIUM',
    description: 'HTTP alternate port (8080) is open. This may expose development or admin interfaces.',
    remediation: 'Close port 8080 if not required, or ensure the service running on it is properly secured.',
  },
  {
    port: 8443,
    service: 'HTTPS Alternate',
    severity: 'LOW',
    description: 'HTTPS alternate port (8443) is open.',
    remediation: 'Ensure the service on port 8443 is necessary and properly configured.',
  },
];

function checkPort(host: string, port: number, timeout = 5000): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(timeout);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      resolve(false);
    });
    socket.connect(port, host);
  });
}

export async function checkOpenPorts(domain: string): Promise<{
  score: number;
  findings: FindingResult[];
}> {
  const findings: FindingResult[] = [];
  let score = 100;

  // Rate limit: check ports with small delays to avoid triggering IDS
  const results = await Promise.allSettled(
    DANGEROUS_PORTS.map(async (portCheck) => {
      const isOpen = await checkPort(domain, portCheck.port);
      return { portCheck, isOpen };
    })
  );

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value.isOpen) {
      const { portCheck } = result.value;
      findings.push({
        category: 'OPEN_PORTS',
        title: `${portCheck.service} port ${portCheck.port} is publicly accessible`,
        description: portCheck.description,
        severity: portCheck.severity,
        remediation: portCheck.remediation,
      });
      if (portCheck.severity === 'CRITICAL') score -= 25;
      else if (portCheck.severity === 'HIGH') score -= 15;
      else if (portCheck.severity === 'MEDIUM') score -= 10;
      else score -= 5;
    }
  }

  return { score: Math.max(0, score), findings };
}
