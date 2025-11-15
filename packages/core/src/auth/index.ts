// @ts-nocheck
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
}
