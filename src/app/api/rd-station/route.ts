import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    // Get environment variables for server-side
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    // Validate environment variables
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json(
        { error: 'Server configuration error: Missing Supabase credentials' },
        { status: 500 }
      );
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Get the most recent access token from Supabase
    const { data: authData, error: authError } = await supabase
      .from('rd_marketing_auth')
      .select('acess_token')
      .order('id', { ascending: false })
      .limit(1)
      .single();

    if (authError || !authData?.acess_token) {
      console.error('Error fetching RD Station access token:', authError);
      return NextResponse.json(
        { error: 'Failed to retrieve RD Station access token' },
        { status: 500 }
      );
    }

    const accessToken = authData.acess_token;

    // Get the diagnostic data from the request
    const diagnosticData = await request.json();
    
    // Validate required fields
    if (!diagnosticData.email || !diagnosticData.nome) {
      console.error('Missing required fields for RD Station:', { 
        hasEmail: !!diagnosticData.email, 
        hasNome: !!diagnosticData.nome 
      });
      return NextResponse.json(
        { error: 'Missing required fields: email and nome are required' },
        { status: 400 }
      );
    }
    
    console.log('Sending data to RD Station:', {
      nome: diagnosticData.nome,
      email: diagnosticData.email,
      empresa: diagnosticData.empresa,
      funcionarios: diagnosticData.funcionarios,
      hasUtmSource: !!diagnosticData.utmSource,
      hasUtmMedium: !!diagnosticData.utmMedium,
      hasUtmCampaign: !!diagnosticData.utmCampaign
    });

    // Map the diagnostic data to RD Station format
    const rdStationPayload = {
      event_type: "CONVERSION",
      event_family: "CDP",
      payload: {
        conversion_identifier: "Diagnóstico Maturidade em Dados",
        email: diagnosticData.email,
        name: diagnosticData.nome,
        personal_phone: diagnosticData.whatsapp,
        mobile_phone: diagnosticData.whatsapp,
        company_name: diagnosticData.empresa,
        cf_business_size: diagnosticData.funcionarios,
        cf_utm_source: diagnosticData.utmSource,
        cf_utm_medium: diagnosticData.utmMedium,
        cf_utm_campaign: diagnosticData.utmCampaign,
        cf_utm_adset: diagnosticData.utmAdset,
        cf_utm_ad: diagnosticData.utmAd
      }
    };

    // Send the request to RD Station Marketing
    const rdStationResponse = await fetch('https://api.rd.services/platform/events?event_type=conversion', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(rdStationPayload)
    });

    if (!rdStationResponse.ok) {
      const errorText = await rdStationResponse.text();
      console.error('RD Station API error:', {
        status: rdStationResponse.status,
        statusText: rdStationResponse.statusText,
        error: errorText
      });
      
      return NextResponse.json(
        { error: `RD Station API error: ${rdStationResponse.status} ${rdStationResponse.statusText}` },
        { status: rdStationResponse.status }
      );
    }

    const rdStationResult = await rdStationResponse.json();
    console.log('RD Station conversion registered successfully:', rdStationResult);

    return NextResponse.json({ 
      success: true, 
      message: 'Lead conversion registered with RD Station Marketing',
      data: rdStationResult 
    });

  } catch (error) {
    console.error('Error registering lead conversion with RD Station:', error);
    return NextResponse.json(
      { error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
