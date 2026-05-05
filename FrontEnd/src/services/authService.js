import { api } from './api';

export const authService = {
  async register(payload) {
    const { data } = await api.post('/api/auth/register', payload);
    return data;
  },

  async login(payload) {
    const { data } = await api.post('/api/auth/login', payload);
    return data;
  },

  async verifyTwoFactor(payload) {
    const { data } = await api.post('/api/auth/2fa/verify', payload);
    return data;
  },

  confirmEmail(payload) {
    return api.post('/api/auth/confirm-email', payload);
  },

  forgotPassword(payload) {
    return api.post('/api/auth/forgot-password', payload);
  },

  resetPassword(payload) {
    return api.post('/api/auth/reset-password', payload);
  }
};
