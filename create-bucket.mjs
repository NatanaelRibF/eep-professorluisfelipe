import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://fupgdvsjmwntbvuenexh.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1cGdkdnNqbXdudGJ2dWVuZXhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Nzg4MjQwNCwiZXhwIjoyMTAzNDU4NDA0fQ.wsOWBIXBhvtjAFq8F5uuBIgjmZ_cA16vbfIvySDTMOo';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createBucket() {
  console.log('Creating/checking student-photos bucket...');
  const { data, error } = await supabase.storage.createBucket('student-photos', {
    public: true,
    fileSizeLimit: 5242880, // 5MB
  });

  if (error) {
    console.log('Bucket status:', error.message);
  } else {
    console.log('✅ Bucket student-photos created successfully with public access!');
  }
}

createBucket();
