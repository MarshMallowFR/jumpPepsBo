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

type CommonState = {
  isSuccess?: boolean;
  message?: string | null;
};

export type AdminState = {
  errors?: {
    firstName?: string[];
    lastName?: string[];
    email?: string[];
  };
} & CommonState;

export type ValidateAdminState = {
  errors?: {
    password?: string[];
    checkPassword?: string[];
  };
} & CommonState;
