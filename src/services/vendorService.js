import vendorRepository from '../data/vendorRepository.js';

const vendorService = {
  getAllVendors: async () => {
    return await vendorRepository.getAllVendors();
  },

  getVendorById: async (id) => {
    return await vendorRepository.getVendorById(id);
  },

  getVendorBySlug: async (slug) => {
    return await vendorRepository.getVendorBySlug(slug);
  },

  createVendor: async (vendorData) => {
    // Generate slug if not provided
    if (!vendorData.slug) {
      vendorData.slug = vendorData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }
    
    return await vendorRepository.createVendor(vendorData);
  },

  updateVendor: async (id, vendorData) => {
    // Check if vendor exists
    const existingVendor = await vendorRepository.getVendorById(id);
    if (!existingVendor) {
      throw new Error('Vendor not found');
    }
    
    return await vendorRepository.updateVendor(id, vendorData);
  },

  deleteVendor: async (id) => {
    // Check if vendor exists
    const existingVendor = await vendorRepository.getVendorById(id);
    if (!existingVendor) {
      throw new Error('Vendor not found');
    }
    
    return await vendorRepository.deleteVendor(id);
  },

  getVendorDashboardData: async (vendorId) => {
    return await vendorRepository.getVendorDashboardData(vendorId);
  }
};

export default vendorService;