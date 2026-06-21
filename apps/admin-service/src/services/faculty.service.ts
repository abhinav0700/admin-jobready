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

  async getRoleUsers() {
    // 1. Fetch user_roles
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .in('role', ['faculty', 'trainer', 'student']);

    if (!userRoles || userRoles.length === 0) {
      return { faculties: [], students: [], assignments: [] };
    }

    const facultyIds = userRoles.filter(r => r.role === 'faculty' || r.role === 'trainer').map(r => r.user_id);
    const studentIds = userRoles.filter(r => r.role === 'student').map(r => r.user_id);
    
    // 2. Fetch profiles
    const allUserIds = [...facultyIds, ...studentIds];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', allUserIds);

    // 3. Map profiles to their roles
    const profileRoleMap = new Map(userRoles.map(r => [r.user_id, r.role]));

    // 4. Fetch assignments
    const { data: assignments } = await supabase
      .from('faculty_student_assignments')
      .select('faculty_id, student_id');

    // 5. Format to expected structure
    const formattedFaculties = (profiles || [])
      .filter(p => facultyIds.includes(p.id))
      .map(p => ({
        id: p.id,
        name: p.full_name,
        email: p.email,
        role: profileRoleMap.get(p.id)
      })).sort((a, b) => a.name.localeCompare(b.name));

    const formattedStudents = (profiles || [])
      .filter(p => studentIds.includes(p.id))
      .map(p => ({
        id: p.id,
        name: p.full_name,
        email: p.email,
        role: profileRoleMap.get(p.id)
      })).sort((a, b) => a.name.localeCompare(b.name));

    return { 
      faculties: formattedFaculties, 
      students: formattedStudents, 
      assignments: assignments || [] 
    };
  }

  async assignStudentsToFaculty(facultyId: string, studentIds: string[]) {
    // First delete existing assignments for this faculty
    await supabase
      .from('faculty_student_assignments')
      .delete()
      .eq('faculty_id', facultyId);

    if (studentIds.length === 0) {
      return { message: "Assignments cleared successfully." };
    }

    // Insert new assignments
    const values = studentIds.map(studentId => ({
      faculty_id: facultyId,
      student_id: studentId
    }));

    const { error } = await supabase
      .from('faculty_student_assignments')
      .insert(values);

    if (error) throw error;

    return { message: `Assigned ${studentIds.length} students successfully.` };
  }
}
