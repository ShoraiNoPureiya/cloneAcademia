import { API_BASE_URL, api } from './api';

export const productsService = {
  async list() {
    const { data } = await api.get('/api/catalog/products');
    return data.map((product) => ({
      ...product,
      imageUrl: normalizeImageUrl(product.imageUrl)
    }));
  },

  async purchase(productId, quantity = 1, customerInfo) {
    const { data } = await api.post(`/api/products/${productId}/purchase`, { quantity, customerInfo });
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
