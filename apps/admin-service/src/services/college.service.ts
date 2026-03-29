import { supabase } from '@admin-panel/db';
import { College } from '@admin-panel/types';

export class CollegeService {
  async getAll(): Promise<College[]> {
    const { data, error } = await supabase.from('colleges').select('*');
    if (error) throw error;
    return data as College[];
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

  async toggleActive(id: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
      .from('colleges')
      .update({ is_active: isActive })
      .eq('id', id);
    if (error) throw error;
  }
}
