import { supabase } from '@admin-panel/db';
import { comparePassword, signToken } from '@admin-panel/utils';
import { User, AuthResponse } from '@admin-panel/types';

export class AuthService {
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data: user, error } = await supabase
      .from('users')
      .select('*, colleges(*)')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const domain = email.split('@')[1];
    if (user.role !== 'admin' && user.colleges.domain !== domain) {
      throw new Error('Domain mismatch');
    }

    const token = signToken({ id: user.id, role: user.role, college_id: user.college_id });

    return {
      user: user as unknown as User,
      token,
      forceReset: !user.is_password_changed
    };
  }
}
