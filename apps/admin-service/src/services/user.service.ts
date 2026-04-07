import { supabase } from '@admin-panel/db';
import { hashPassword, parseCSV } from '@admin-panel/utils';
import { User } from '@admin-panel/types';

export class UserService {
  async bulkUpload(collegeId: string, csvContent: string): Promise<any> {
    const rows = parseCSV(csvContent);
    const results: { success: number; failed: number; errors: any[] } = { 
      success: 0, 
      failed: 0, 
      errors: [] 
    };

    for (const row of rows) {
      try {
        const { email } = row;
        if (!email) continue;

        const username = email.split('@')[0];
        const hashedPassword = await hashPassword(username);

        const { error } = await supabase.from('users').insert({
          email,
          username,
          password_hash: hashedPassword,
          college_id: collegeId,
          is_password_changed: false,
          role: 'student'
        });

        if (error) {
          results.failed++;
          results.errors.push({ email, error: error.message });
        } else {
          results.success++;
        }
      } catch (err: any) {
        results.failed++;
        results.errors.push({ row, error: err.message });
      }
    }

    return results;
  }

  async getByCollege(collegeId: string): Promise<any[]> {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*, colleges(id, name, domain)')
      .eq('college_id', collegeId)
      .order('created_at', { ascending: false });

    if (usersError) throw usersError;

    const { data: collegeDataSet, error: collegeError } = await supabase
      .from('colleges')
      .select('id, name, domain')
      .eq('id', collegeId)
      .single();

    if (collegeError && collegeError.code !== 'PGRST116') throw collegeError;

    const userIds = new Set((users || []).map((u: any) => u.id));

    const profileOrQuery = collegeDataSet?.name
      ? `college_id.eq.${collegeId},college.eq.${collegeDataSet.name}`
      : `college_id.eq.${collegeId}`;

    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, college, college_id, created_at')
      .or(profileOrQuery)
      .order('created_at', { ascending: false });

    if (profileError) throw profileError;

    const profileOnly = (profiles || [])
      .filter((p: any) => !userIds.has(p.id))
      .map((p: any) => ({
        id: p.id,
        email: null,
        username: p.full_name ?? p.id,
        full_name: p.full_name,
        college: p.college,
        college_id: p.college_id,
        is_password_changed: false,
        role: 'student',
        created_at: p.created_at,
        colleges: collegeDataSet ? { ...collegeDataSet } : null,
      }));

    const combined = [...(users || []), ...profileOnly];

    return combined.sort((a: any, b: any) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  async getAll(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*, colleges(id, name, domain)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as User[];
  }
}
