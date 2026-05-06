import { API_BASE_URL, api } from './api';

export const adminService = {
  async dashboard() {
    const { data } = await api.get('/api/admin/dashboard');
    return data;
  },

  async products() {
    const { data } = await api.get('/api/admin/products');
    return data.map((product) => ({
      ...product,
      imageUrl: normalizeImageUrl(product.imageUrl)
    }));
  },

  async plans() {
    const { data } = await api.get('/api/admin/plans');
    return data;
  },

  async updateProduct(id, payload) {
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('description', payload.description);
    formData.append('sku', payload.sku);
    formData.append('price', toDecimalString(payload.price));
    formData.append('stockQuantity', payload.stockQuantity);
    formData.append('active', payload.active);
    if (payload.image) {
      formData.append('image', payload.image);
    }

    const { data } = await api.put(`/api/admin/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return {
      ...data,
      imageUrl: normalizeImageUrl(data.imageUrl)
    };
  },

  async createPlan(payload) {
    const { data } = await api.post('/api/admin/plans', payload);
    return data;
  },

  async updatePlan(id, payload) {
    const { data } = await api.put(`/api/admin/plans/${id}`, payload);
    return data;
  },

  async createProduct(payload) {
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('description', payload.description);
    formData.append('sku', payload.sku);
    formData.append('price', toDecimalString(payload.price));
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
  },

  async updateCoupon(id, payload) {
    const { data } = await api.put(`/api/admin/coupons/${id}`, payload);
    return data;
  }
};

function normalizeImageUrl(imageUrl) {
  if (!imageUrl) {
    return '';
  }

  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }

  return `${API_BASE_URL}${imageUrl}`;
}

function toDecimalString(value) {
  return String(value ?? '').trim().replace(',', '.');
}
