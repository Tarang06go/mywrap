import api from './api';

const paymentService = {
  createRazorpayOrder: (orderId) => {
    return api.post('/payment/create', { orderId });
  },

  verifyPayment: (verificationPayload) => {
    return api.post('/payment/verify', verificationPayload);
  },
};

export default paymentService;
