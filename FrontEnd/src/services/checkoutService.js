import { api } from './api';

export const checkoutService = {
  async createPreference(planId, couponCode, customerInfo) {
    const { data } = await api.post('/api/payments/checkout', {
      planId,
      couponCode: couponCode || null,
      customerInfo
    });

    return data;
  }
};
