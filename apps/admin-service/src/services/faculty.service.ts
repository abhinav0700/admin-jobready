import { supabase } from '@admin-panel/db';

export class FacultyService {
  async getDepartments() {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  async getFacultiesByCollege(collegeId: string) {
    // 1. Get user IDs with 'faculty' role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'faculty');

    if (roleError) throw roleError;
    const facultyUserIds = roleData.map(r => r.user_id);

    if (facultyUserIds.length === 0) return [];

    // 2. Get profiles for those users in the specific college
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*, departments(id, name)')
      .in('id', facultyUserIds)
      .eq('college_id', collegeId)
      .order('created_at', { ascending: false });

    if (profileError) throw profileError;
    return profiles;
  }

  async createFaculty(name: string, email: string, departmentId: string, collegeId: string) {
    // 0. Verify domain matches college
    const { data: college, error: collegeError } = await supabase
      .from('colleges')
      .select('domain')
      .eq('id', collegeId)
      .single();

    if (collegeError) throw collegeError;
    
    const emailDomain = email.split('@')[1];
    if (college.domain !== emailDomain) {
      throw new Error(`Email domain mismatch. Expected @${college.domain}`);
    }

    // 1. Invite user via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: { full_name: name }
    });

    if (authError) throw authError;
    const userId = authData.user.id;

    // 2. Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        full_name: name,
        email: email,
        department_id: departmentId,
        college_id: collegeId,
        role: 'faculty' // Some schemas keep role in profile too
      });

    if (profileError) {
      // Cleanup auth user if profile creation fails? 
      // Manual cleanup might be needed if your system requires absolute integrity
      throw profileError;
    }

    // 3. Set role in user_roles
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: 'faculty'
      });

    if (roleError) throw roleError;

    return authData.user;
  }

  async updateFaculty(id: string, data: { name?: string; departmentId?: string }) {
    const updateData: any = {};
    if (data.name) updateData.full_name = data.name;
    if (data.departmentId) updateData.department_id = data.departmentId;

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return profile;
  }

  async deleteFaculty(id: string) {
    // 1. Delete from user_roles
    await supabase.from('user_roles').delete().eq('user_id', id);
    
    // 2. Delete profile
    await supabase.from('profiles').delete().eq('id', id);

    // 3. Delete from Supabase Auth
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) throw error;

    return { success: true };
  }
}
