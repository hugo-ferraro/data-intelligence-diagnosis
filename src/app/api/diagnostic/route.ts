import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    // Get environment variables for server-side
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    // Debug: Log environment variables (without exposing sensitive data)
    console.log('Environment check:', {
      hasUrl: !!SUPABASE_URL,
      hasKey: !!SUPABASE_ANON_KEY,
      urlLength: SUPABASE_URL?.length || 0,
      keyLength: SUPABASE_ANON_KEY?.length || 0
    });

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

    const data = await request.json();
    
    console.log('Received data:', {
      nome: data.nome,
      email: data.email,
      empresa: data.empresa,
      hasQ1: !!data.Q1,
      hasQ2: !!data.Q2,
      hasQ3: !!data.Q3,
      hasQ4: !!data.Q4,
      hasQ5: !!data.Q5,
      hasQ6: !!data.Q6
    });
    
    const { data: result, error } = await supabase
      .from('diagnostic_campaign_leads')
      .insert({
        lead_name: data.nome,
        lead_email: data.email,
        lead_phone: data.whatsapp,
        business_name: data.empresa,
        business_niche: data.nicho,
        business_num_employees: data.funcionarios,
        lgpd_consent: data.privacyConsent,
        answer_q1: data.Q1,
        answer_q2: data.Q2,
        answer_q3: data.Q3,
        answer_q4: data.Q4,
        answer_q5: data.Q5,
        answer_q6: data.Q6,
        // UTM/Attribution fields
        utm_source: data.utmSource,
        utm_medium: data.utmMedium,
        utm_campaign: data.utmCampaign,
        utm_term: data.utmTerm,
        utm_content: data.utmContent,
        referrer: data.referrer,
        landing_url: data.landingUrl,
        gclid: data.gclid,
        fbclid: data.fbclid,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('Diagnostic data saved successfully:', result);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error saving diagnostic data:', error);
    return NextResponse.json(
      { error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID parameter is required' },
        { status: 400 }
      );
    }

    const { data: result, error } = await supabase
      .from('diagnostic_campaign_leads')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching diagnostic data:', error);
    return NextResponse.json(
      { error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
