import deliveryAddressRepository from '../data/deliveryAddressRepository.js';

const deliveryAddressService = {
  // Get all delivery addresses for a vendor
  getDeliveryAddresses: async (vendorId, status = null) => {
    try {
      return await deliveryAddressRepository.getDeliveryAddresses(vendorId, status);
    } catch (error) {
      console.error('Service error getting delivery addresses:', error);
      throw new Error('Failed to retrieve delivery addresses');
    }
  },

  // Create new delivery address
  createDeliveryAddress: async (vendorId, addressData) => {
    try {
      return await deliveryAddressRepository.createDeliveryAddress(vendorId, addressData);
    } catch (error) {
      console.error('Service error creating delivery address:', error);
      throw new Error('Failed to create delivery address');
    }
  },

  // Update delivery address
  updateDeliveryAddress: async (id, updateData) => {
    try {
      return await deliveryAddressRepository.updateDeliveryAddress(id, updateData);
    } catch (error) {
      console.error('Service error updating delivery address:', error);
      throw new Error('Failed to update delivery address');
    }
  },

  // Delete delivery address
  deleteDeliveryAddress: async (id) => {
    try {
      return await deliveryAddressRepository.deleteDeliveryAddress(id);
    } catch (error) {
      console.error('Service error deleting delivery address:', error);
      throw new Error('Failed to delete delivery address');
    }
  },

  // Update status
  updateStatus: async (id, status) => {
    try {
      return await deliveryAddressRepository.updateStatus(id, status);
    } catch (error) {
      console.error('Service error updating delivery address status:', error);
      throw new Error('Failed to update delivery address status');
    }
  },

  // Get single delivery address
  getDeliveryAddressById: async (id) => {
    try {
      return await deliveryAddressRepository.getDeliveryAddressById(id);
    } catch (error) {
      console.error('Service error getting delivery address by id:', error);
      throw new Error('Failed to retrieve delivery address');
    }
  }
};
export default deliveryAddressService