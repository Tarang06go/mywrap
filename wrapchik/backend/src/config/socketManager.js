let io = null;

const init = (socketIo) => {
  io = socketIo;
};

const getIO = () => io;

const emitOrderUpdate = (order) => {
  if (!io) return;
  const userId = order.userId?._id || order.userId;
  io.to(`user_${userId}`).emit('order_updated', {
    orderId: order._id,
    orderNumber: order.orderNumber,
    orderStatus: order.orderStatus,
    orderType: order.orderType,
    paymentStatus: order.paymentStatus,
  });
  io.to('admin').emit('order_updated', {
    orderId: order._id,
    orderNumber: order.orderNumber,
    orderStatus: order.orderStatus,
    orderType: order.orderType,
    paymentStatus: order.paymentStatus,
  });
};

const emitNewOrder = (order) => {
  if (!io) return;
  io.to('admin').emit('new_order', {
    orderId: order._id,
    orderNumber: order.orderNumber,
    orderType: order.orderType,
    totalAmount: order.totalAmount,
    items: order.items,
    userId: order.userId,
  });
};

module.exports = { init, getIO, emitOrderUpdate, emitNewOrder };
