import api from './api';
const favouriteService = {
  getFavourites: () => api.get('/auth/favourites'),
  addFavourite: (productId) => api.post(`/auth/favourites/${productId}`),
  removeFavourite: (productId) => api.delete(`/auth/favourites/${productId}`),
};
export default favouriteService;
