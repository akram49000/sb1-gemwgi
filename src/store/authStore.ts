import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  setUser: (user: User | null) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAdmin: false,
  setUser: (user) => set({ 
    user,
    isAdmin: user?.email === 'karamtabet@gmail.com'
  }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAdmin: false });
  },
}));