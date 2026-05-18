import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qdawxpcwkadhfwqhnpsd.supabase.co';
const supabaseKey = 'sb_publishable_W6LnlxFB_jpBKDN2cn5oKQ_j_g1OZO2';

export const supabase = createClient(supabaseUrl, supabaseKey);