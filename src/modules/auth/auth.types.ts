/**
 * Authentication types
 */

export interface LoginResponse {
  status: 'success';
  data: {
    user: {
      id: string;
      fullName: string;
      email?: string;
      phone?: string;
      role: string;
      address?: string;
      pictures: string[];
    };
    accessToken: string;
  };
}

export interface RegisterResponse {
  status: 'success';
  data: {
    user: {
      id: string;
      fullName: string;
      email?: string;
      phone?: string;
      role: string;
      address?: string;
      pictures: string[];
    };
    accessToken: string;
  };
}

export interface RefreshResponse {
  status: 'success';
  data: {
    accessToken: string;
  };
}

