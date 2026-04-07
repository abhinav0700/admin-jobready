import { supabase } from '@admin-panel/db';
import { College } from '@admin-panel/types';

export class CollegeService {
  async getAll(): Promise<(College & { user_count: number })[]> {
    const { data: colleges, error } = await supabase.from('colleges').select('*');
    if (error) throw error;

    const collegesWithCount = await Promise.all(colleges.map(async (college) => {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id')
        .eq('college_id', college.id);
      if (usersError) throw usersError;

      const userIds = new Set((users || []).map((u: any) => u.id));

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, college_id, college')
        .or(`college_id.eq.${college.id},college.eq.${college.name}`);
      if (profilesError) throw profilesError;

      const extraProfileCount = (profiles || [])
        .filter((p: any) => !userIds.has(p.id))
        .length;

      const userCount = userIds.size + extraProfileCount;
      return { ...college, user_count: userCount };
    }));

    return collegesWithCount;
  }

  async create(name: string, domain: string): Promise<College> {
    const { data, error } = await supabase
      .from('colleges')
      .insert({ name, domain })
      .select()
      .single();
    if (error) throw error;
    return data as College;
  }

  async update(id: string, name: string, domain: string): Promise<College> {
    const { data, error } = await supabase
      .from('colleges')
      .update({ name, domain })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as College;
  }

  async toggleActive(id: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
      .from('colleges')
      .update({ is_active: isActive })
      .eq('id', id);
    if (error) throw error;
  }
}
