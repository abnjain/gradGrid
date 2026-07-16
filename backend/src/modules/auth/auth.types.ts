/**
 * GradGrid — Auth Module Types
 */

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    userType: string;
    roleName: string;
    permissions: string[];
  };
  tokens: TokenPair;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
