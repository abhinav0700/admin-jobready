import { supabase } from '@admin-panel/db';

export class DashboardService {
  async getStats() {
    const collegesResp = await supabase.from('colleges').select('*', { count: 'exact', head: true });
    const usersResp = await supabase.from('users').select('*', { count: 'exact', head: true });
    const activeUsersResp = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_password_changed', true);

    let totalUsers = usersResp.count || 0;
    if (!totalUsers) {
      const profileCount = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      totalUsers = profileCount.count || 0;
    }

    let activeUsers = activeUsersResp.count || 0;
    if (!activeUsers) {
      const onboardingCount = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('onboarding_completed', true);
      activeUsers = onboardingCount.count || 0;
    }

    return {
      totalColleges: collegesResp.count || 0,
      totalUsers,
      activeUsers
    };
  }
}
