const KEY = 'ecoclay_user';

function getUser() {
  try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
}
function setUser(u) { localStorage.setItem(KEY, JSON.stringify(u)); }

export const User = {
  async me() {
    return getUser();
  },
  async login() {
    // Simple prompt-based login simulation
    const email = prompt('Ingresa tu email (simulación de login Google):');
    if (!email) return null;
    const full_name = email.split('@')[0];
    const u = { email, full_name };
    setUser(u);
    return u;
  },
  async logout() {
    localStorage.removeItem(KEY);
  }
};
