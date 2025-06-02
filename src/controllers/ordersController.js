// ===============================
// ORDERS CONTROLLER (ordersController.js)
// ===============================

import ordersService from '../services/ordersService.js';

const ordersController = {
  // GET /api/vendors/:vendorId/orders
  getVendorOrders: async (req, res) => {
    try {
      const { vendorId } = req.params;
      const { status, page = 1, limit = 10, sort = 'created_at', order = 'desc' } = req.query;
      
      if (!vendorId) {
        return res.status(400).json({
          success: false,
          message: 'Vendor ID is required'
        });
      }

      // Validate status filter if provided
      const validStatuses = ['pending', 'processing', 'shipping', 'complete', 'cancelled'];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status filter. Must be one of: pending, processing, shipping, complete, cancelled'
        });
      }

      // Validate pagination
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pagination parameters'
        });
      }

      const filters = {
        status,
        page: pageNum,
        limit: limitNum,
        sort,
        order
      };

      const result = await ordersService.getVendorOrders(vendorId, filters);
      
      res.status(200).json({
        success: true,
        message: 'Orders retrieved successfully',
        data: {
          orders: result.orders,
          pagination: {
            currentPage: pageNum,
            totalPages: Math.ceil(result.total / limitNum),
            totalOrders: result.total,
            hasNext: pageNum * limitNum < result.total,
            hasPrev: pageNum > 1
          }
        }
      });
    } catch (error) {
      console.error('Error getting vendor orders:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // PUT /api/orders/:id/status
  updateOrderStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Order ID is required'
        });
      }

      // Validate status
      const validStatuses = ['pending', 'processing', 'shipping', 'complete', 'cancelled'];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Valid status is required. Must be one of: pending, processing, shipping, complete, cancelled'
        });
      }

      // Get current order to validate status transition
      const currentOrder = await ordersService.getOrderById(id);
      if (!currentOrder) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Validate status transition logic
      const validTransitions = {
        'pending': ['processing', 'cancelled'],
        'processing': ['shipping', 'cancelled'],
        'shipping': ['complete', 'cancelled'],
        'complete': [], // Final state
        'cancelled': [] // Final state
      };

      if (!validTransitions[currentOrder.status].includes(status) && currentOrder.status !== status) {
        return res.status(400).json({
          success: false,
          message: `Cannot change status from ${currentOrder.status} to ${status}`
        });
      }

      const updatedOrder = await ordersService.updateOrderStatus(id, status);
      
      res.status(200).json({
        success: true,
        message: `Order status updated to ${status}`,
        data: updatedOrder
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // GET /api/orders/:id
  getOrderDetails: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Order ID is required'
        });
      }

      const order = await ordersService.getOrderById(id);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Order details retrieved successfully',
        data: order
      });
    } catch (error) {
      console.error('Error getting order details:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // POST /api/vendors/:vendorId/orders - Create new order (optional)
  createOrder: async (req, res) => {
    try {
      const { vendorId } = req.params;
      const { order_number, customer_name, total_amount, status } = req.body;

      if (!vendorId) {
        return res.status(400).json({
          success: false,
          message: 'Vendor ID is required'
        });
      }

      if (!order_number || !customer_name || !total_amount) {
        return res.status(400).json({
          success: false,
          message: 'Order number, customer name, and total amount are required'
        });
      }

      // Validate total_amount
      const amount = parseFloat(total_amount);
      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Total amount must be a positive number'
        });
      }

      // Validate status if provided
      const validStatuses = ['pending', 'processing', 'shipping', 'complete', 'cancelled'];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be one of: pending, processing, shipping, complete, cancelled'
        });
      }

      const orderData = {
        order_number: order_number.trim(),
        customer_name: customer_name.trim(),
        total_amount: amount,
        status: status || 'pending'
      };

      const newOrder = await ordersService.createOrder(vendorId, orderData);
      
      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: newOrder
      });
    } catch (error) {
      console.error('Error creating order:', error);
      if (error.message.includes('duplicate key')) {
        res.status(409).json({
          success: false,
          message: 'Order number already exists'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message
        });
      }
    }
  }
};

export default ordersController;