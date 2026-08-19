/**
 * GradGrid — Auth Module Types
 */

import { AuthAudience } from './auth-audience';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  /** Expected login audience — enforced by route */
  audience?: AuthAudience;
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
    sessionId?: string;
  };
  tokens: TokenPair;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
