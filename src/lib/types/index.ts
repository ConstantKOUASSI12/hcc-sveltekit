

export type Role = 'admin' | 'coach' | 'player' | 'contributor' | 'pending';

export interface ApiResponse<T> {
  status:  number;
  message: string;
  data?:   T;
  errors?: Record<string, string[]>;
}

export interface RoleInfo {
  id:   number;
  name: Role;
}

export interface Adherent {
  id:               number;
  first_name:       string;
  last_name:        string;
  email:            string;
  contact:          string;
  role:             Role | null;
  is_validated:     boolean;
  created_at:       string;
  updated_at:       string;
  registrations?:   Registration[];
  mes_actualites?:  News[];
  mes_matchs?:      Match[];
}


export interface TokenInfo {
  token:      string;
  expires_at: string;
}

export interface Tokens {
  access:  TokenInfo;
  refresh: TokenInfo;
}

// data retourné par POST /api/auth/login
export interface LoginResponseData {
  tokens: Tokens;
}

// Session locale : tokens + profil adherent (chargé via /me)
export interface Session {
  adherent: Adherent;
  tokens:   Tokens;
}

export interface Match {
  id:           number;
  date:         string;
  time:         string;
  opponent:     string;
  location:     string | null;
  score:        string | null;
  is_finished:  boolean;
  comment:      string | null;
  coach:        Partial<Adherent>;
  played_matches: Registration[];
  created_at:   string;
  updated_at:   string;
}

export interface Registration {
  adherent:             Partial<Adherent>;
  date_of_registration: string;
  match?:               Partial<Match>;
}

export interface News {
  id:           number;
  title:        string;
  content:      string;
  created_at: string;
  author:       Partial<Adherent>;
}

export interface DashboardStats {
  total_adherents:   number;
  pending_adherents: number;
  total_matchs:      number;
  next_match:        Match | null;
  total_news:        number;
}

