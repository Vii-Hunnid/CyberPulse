import axios from 'axios';
import type { DarkWebResult } from '../../types';

interface HIBPBreach {
  Name: string;
  Domain: string;
  BreachDate: string;
  DataClasses: string[];
  IsVerified: boolean;
  Description: string;
}

export async function checkDomainBreaches(domain: string): Promise<DarkWebResult[]> {
  const apiKey = process.env.HIBP_API_KEY;
  if (!apiKey) return [];

  try {
    const response = await axios.get<HIBPBreach[]>(
      `https://haveibeenpwned.com/api/v3/breacheddomain/${domain}`,
      {
        headers: {
          'hibp-api-key': apiKey,
          'User-Agent': 'CyberPulse-SecurityScanner/1.0',
        },
        timeout: 10000,
        validateStatus: (s) => s === 200 || s === 404,
      }
    );

    if (response.status === 404 || !response.data) return [];

    return response.data.map((breach) => ({
      source: breach.Name,
      breachDate: breach.BreachDate,
      dataClasses: breach.DataClasses,
      isVerified: breach.IsVerified,
      description: breach.Description.replace(/<[^>]*>/g, ''),
    }));
  } catch {
    return [];
  }
}

export async function checkEmailBreaches(email: string): Promise<DarkWebResult[]> {
  const apiKey = process.env.HIBP_API_KEY;
  if (!apiKey) return [];

  try {
    const response = await axios.get<HIBPBreach[]>(
      `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}`,
      {
        headers: {
          'hibp-api-key': apiKey,
          'User-Agent': 'CyberPulse-SecurityScanner/1.0',
        },
        timeout: 10000,
        validateStatus: (s) => s === 200 || s === 404,
      }
    );

    if (response.status === 404 || !response.data) return [];

    return response.data.map((breach) => ({
      source: breach.Name,
      breachDate: breach.BreachDate,
      dataClasses: breach.DataClasses,
      isVerified: breach.IsVerified,
      description: breach.Description.replace(/<[^>]*>/g, ''),
    }));
  } catch {
    return [];
  }
}
