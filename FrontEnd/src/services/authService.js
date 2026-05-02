import { api } from './api';

export const authService = {
  register(payload) {
    return api.post('/api/auth/register', payload);
  },

  async login(payload) {
    const { data } = await api.post('/api/auth/login', payload);
    return data;
  },

  async verifyTwoFactor(payload) {
    const { data } = await api.post('/api/auth/2fa/verify', payload);
    return data;
  }
};
