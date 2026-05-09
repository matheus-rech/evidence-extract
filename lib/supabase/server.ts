import { withSupabase } from '@supabase/server';

export const withUserSupabase = withSupabase({ auth: 'user' });
export const withAdminSupabase = withSupabase({ auth: 'admin' });
