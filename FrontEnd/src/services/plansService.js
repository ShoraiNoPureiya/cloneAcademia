import { api } from './api';

export const plansService = {
  async list() {
    const { data } = await api.get('/api/catalog/plans');
    return data;
  }
};
