import { jwtDecode } from "jwt-decode";

export const TOKEN_KEY = "fixnow_token";

export interface DecodedToken {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function isTokenValid(): boolean {
  const token = getToken();
  if (!token) return false;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    // Check if token has expired
    if (decoded.exp * 1000 > Date.now()) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

export function decodeToken(): DecodedToken | null {
  const token = getToken();
  if (!token) return null;

  try {
    return jwtDecode<DecodedToken>(token);
  } catch (error) {
    return null;
  }
}

// NOTE: Since the JWT only contains ID and Role in this backend, 
// we still need to fetch full user info from /me endpoint for name/avatar.
// This matches the existing logic in AuthContext.
export function getUserFromToken() {
  const decoded = decodeToken();
  if (!decoded) return null;
  
  return {
    id: decoded.id,
    role: decoded.role
  };
}
