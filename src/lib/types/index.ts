

export type Role = 'admin' | 'coach' | 'player' | 'contributor' | 'pending';

export interface ApiResponse<T> {
  status:  number;
  message: string;
  data?:   T;
  errors?: Record<string, string[]>;
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


