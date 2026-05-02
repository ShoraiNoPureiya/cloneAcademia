import { api } from './api';

export const adminService = {
  async dashboard() {
    const { data } = await api.get('/api/admin/dashboard');
    return data;
  },

  async products() {
    const { data } = await api.get('/api/admin/products');
    return data;
  },

  async createProduct(payload) {
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('description', payload.description);
    formData.append('sku', payload.sku);
    formData.append('price', String(payload.price).replace('.', ','));
    formData.append('stockQuantity', payload.stockQuantity);
    formData.append('image', payload.image);

    const { data } = await api.post('/api/admin/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return data;
  },

  async coupons() {
    const { data } = await api.get('/api/admin/coupons');
    return data;
  },

  async createCoupon(payload) {
    const { data } = await api.post('/api/admin/coupons', payload);
    return data;
  }
};
