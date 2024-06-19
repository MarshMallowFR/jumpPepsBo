export interface Admin {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  validated: boolean;
}

export interface AdminDB {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  validated: boolean;
}
