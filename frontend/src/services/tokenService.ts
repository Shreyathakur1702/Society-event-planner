// src/services/tokenService.ts
const ACCESS_TOKEN_KEY = "access_token";

const TokenService = {
  getLocalAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  updateLocalAccessToken(token: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  removeLocalAccessToken() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  },
};

export default TokenService;
