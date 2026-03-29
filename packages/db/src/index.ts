import { createClient } from '@supabase/supabase-js';
import { config } from '@admin-panel/config';

export const supabase = createClient(config.supabaseUrl, config.supabaseKey);
export type { Database } from './types'; // Placeholder for now
