// ===============================
// ORDERS SERVICE (ordersService.js)
// ===============================

import ordersRepository from '../data/ordersRepository.js';

const ordersService = {
  // Get vendor orders with filters and pagination
  getVendorOrders: async (vendorId, filters) => {
    try {
      return await ordersRepository.getVendorOrders(vendorId, filters);
    } catch (error) {
      console.error('Service error getting vendor orders:', error);
      throw new Error('Failed to retrieve vendor orders');
    }
  },

  // Update order status
  updateOrderStatus: async (id, status) => {
    try {
      return await ordersRepository.updateOrderStatus(id, status);
    } catch (error) {
      console.error('Service error updating order status:', error);
      throw new Error('Failed to update order status');
    }
  },

  // Get order by ID
  getOrderById: async (id) => {
    try {
      return await ordersRepository.getOrderById(id);
    } catch (error) {
      console.error('Service error getting order by id:', error);
      throw new Error('Failed to retrieve order');
    }
  }
};

export default ordersService;