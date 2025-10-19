import React from 'react';
import type { User } from '../types';

export type AuthContextType = {
  user: User | null;
  setUser: (u: User | null) => void;
  logout: () => void;
};

export const AuthContext = React.createContext<AuthContextType | null>(null);
