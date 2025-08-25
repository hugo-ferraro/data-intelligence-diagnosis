import { supabase } from '@/lib/database';

export async function testDatabaseConnection() {
  try {
    // Test the connection by trying to fetch a single record
    const { data, error } = await supabase
      .from('diagnostic_campaign_leads')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Database connection test failed:', error);
      return false;
    }

    console.log('Database connection test successful');
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}
