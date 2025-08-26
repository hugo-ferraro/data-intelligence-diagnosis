import { SaveDiagnosticData } from './diagnostic-service';

export async function registerLeadConversion(data: SaveDiagnosticData) {
  try {
    console.log('Attempting to register lead conversion with RD Station...');
    
    // Validate required data before making the request
    if (!data.email || !data.nome) {
      console.error('Missing required data for RD Station:', { 
        hasEmail: !!data.email, 
        hasNome: !!data.nome 
      });
      return { error: 'Missing required data: email and nome are required' };
    }
    
    const response = await fetch('/api/rd-station', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log('RD Station API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
      console.error('RD Station API error response:', errorData);
      return { error: errorData.error || `HTTP ${response.status}: ${response.statusText}` };
    }

    const result = await response.json();
    console.log('Lead conversion registered successfully with RD Station:', result);
    return result;
  } catch (error) {
    console.error('Error registering lead conversion with RD Station:', error);
    // Don't throw error to prevent blocking the main flow
    // Just log it and continue
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
