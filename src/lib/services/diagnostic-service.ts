import { DiagnosticData } from '@/types/diagnostic';
import { registerLeadConversion } from './rd-station-service';

export interface SaveDiagnosticData {
  nome: string;
  Q1: string;
  Q2: string;
  Q3: string;
  Q4: string;
  Q5: string;
  Q6: string;
  empresa: string;
  nicho: string;
  funcionarios: string;
  email: string;
  whatsapp: string;
  privacyConsent: boolean;
  // UTM/Attribution data
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  utmAdset?: string;
  utmAd?: string;
  referrer?: string;
  landingUrl?: string;
  gclid?: string;
  fbclid?: string;
  maturityScore?: number;
}

export async function saveDiagnosticData(data: SaveDiagnosticData) {
  try {
    console.log('Attempting to save diagnostic data via API...');
    
    const response = await fetch('/api/diagnostic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log('API response status:', response.status);
    console.log('API response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
      console.error('API error response:', errorData);
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Diagnostic data saved successfully:', result.data);
    
    // Register lead conversion with RD Station Marketing
    // This is done after successful save to ensure we have the data
    try {
      await registerLeadConversion(data);
    } catch (rdError) {
      console.error('RD Station registration failed, but diagnostic was saved:', rdError);
      // Don't fail the entire process if RD Station fails
    }
    
    return result.data;
  } catch (error) {
    console.error('Error saving diagnostic data:', error);
    throw new Error(`Failed to save diagnostic data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getDiagnosticData(id: number) {
  try {
    console.log('Attempting to fetch diagnostic data via API...');
    
    const response = await fetch(`/api/diagnostic?id=${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
      console.error('API error response:', errorData);
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching diagnostic data:', error);
    throw new Error(`Failed to fetch diagnostic data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
