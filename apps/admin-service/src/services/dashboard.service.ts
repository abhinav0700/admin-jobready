import { supabase } from '@admin-panel/db';

export class DashboardService {
  async getStats() {
    const [colleges, users, activeUsers] = await Promise.all([
      supabase.from('colleges').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_password_changed', true) // Proxy for active
    ]);

    return {
      totalColleges: colleges.count || 0,
      totalUsers: users.count || 0,
      activeUsers: activeUsers.count || 0
    };
  }
}
