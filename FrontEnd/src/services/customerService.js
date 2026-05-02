import { api } from './api';

export const customerService = {
  async purchases() {
    const { data } = await api.get('/api/me/purchases');
    return data;
  }
};
