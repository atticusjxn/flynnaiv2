// Flynn.ai v2 - User Database Operations
import { createClient } from '@/utils/supabase/server';
import { Database } from '@/types/database.types';
import { UserSettings } from '@/types/settings.types';

type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

export class UserService {
  private supabase = createClient();

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    return data;
  }

  async createUser(userData: UserInsert): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .insert(userData)
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return null;
    }

    return data;
  }

  async updateUser(userId: string, updates: UserUpdate): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return null;
    }

    return data;
  }

  async getUserById(userId: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user by id:', error);
      return null;
    }

    return data;
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', userId);
  }

  async deactivateUser(userId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('users')
      .update({ is_active: false })
      .eq('id', userId);

    return !error;
  }

  // Settings-specific methods
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('settings')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user settings:', error);
      return null;
    }

    return data.settings as UserSettings;
  }

  async updateUserSettings(userId: string, settings: UserSettings): Promise<boolean> {
    const { error } = await this.supabase
      .from('users')
      .update({ 
        settings: settings,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user settings:', error);
      return false;
    }

    return true;
  }

  async updatePartialSettings<T extends keyof UserSettings>(
    userId: string, 
    section: T, 
    updates: Partial<UserSettings[T]>
  ): Promise<boolean> {
    // First, get current settings
    const currentSettings = await this.getUserSettings(userId);
    if (!currentSettings) {
      return false;
    }

    // Update the specific section
    const newSettings = {
      ...currentSettings,
      [section]: {
        ...currentSettings[section],
        ...updates
      }
    };

    return this.updateUserSettings(userId, newSettings);
  }

  async resetUserSettings(userId: string, defaultSettings: UserSettings): Promise<boolean> {
    return this.updateUserSettings(userId, defaultSettings);
  }
}