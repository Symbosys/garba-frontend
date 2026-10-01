const TOKEN_KEY = 'garbamitra_access_token';

export const authStorage = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string, remember: boolean) {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  },
};
