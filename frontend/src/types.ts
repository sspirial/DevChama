export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export interface Chama {
  id: number;
  title: string;
  description?: string | null;
  creator: User;
  created_at?: string;
}

export interface Membership {
  user: User;
  chama: number;
  member_role: string;
  joined_date: string;
}

export interface Contribution {
  id: number;
  user: User;
  chama: number;
  type: string;
  amount?: number | null;
  metadata?: Record<string, unknown>;
  points_awarded?: number;
  date?: string;
}

export interface Task {
  id: number;
  chama: number;
  assigned_to?: User | null;
  title: string;
  description?: string;
  status?: string;
  due_date?: string | null;
  created_at?: string;
}

export interface Reward {
  id: number;
  user: User;
  chama: number;
  points: number;
  payout?: number | null;
  date_distributed?: string;
}
