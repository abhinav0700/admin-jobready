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

  async getByCollege(collegeId: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('college_id', collegeId);
    if (error) throw error;
    return data as User[];
  }
}
