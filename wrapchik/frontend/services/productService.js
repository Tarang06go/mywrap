import api from './api';

const productService = {
  getProducts: (params = {}) => {
    return api.get('/products', { params });
  },

  getProductById: (id) => {
    return api.get(`/products/${id}`);
  },

  createProduct: (productData) => {
    return api.post('/products', productData);
  },

  updateProduct: (id, productData) => {
    return api.put(`/products/${id}`, productData);
  },

  toggleAvailability: (id) => {
    return api.patch(`/products/${id}/availability`);
  },

  deleteProduct: (id) => {
    return api.delete(`/products/${id}`);
  },
};

export default productService;
