/**
 * Authentication types
 */

export interface LoginResponse {
  status: 'success';
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
    accessToken: string;
  };
}

export interface RegisterResponse {
  status: 'success';
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
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

