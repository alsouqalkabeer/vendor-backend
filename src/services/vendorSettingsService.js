import vendorSettingsRepository from '../data/vendorSettingsRepository.js';

const vendorSettingsService = {
  // Get all vendor settings
  getVendorSettings: async (vendorId) => {
    return await vendorSettingsRepository.getVendorSettings(vendorId);
  },

  // Update vendor settings
  updateVendorSettings: async (vendorId, settingsData) => {
    // Sanitize and validate data
    const sanitizedData = {
      // Basic Settings
      store_name: settingsData.store_name?.trim(),
      store_description: settingsData.store_description?.trim(),
      store_logo_url: settingsData.store_logo_url?.trim(),
      store_banner_url: settingsData.store_banner_url?.trim(),
      business_type: settingsData.business_type?.trim(),
      store_phone: settingsData.store_phone?.trim(),
      store_email: settingsData.store_email?.trim()?.toLowerCase(),
      store_address: settingsData.store_address?.trim(),
      
      // Shipping & Delivery Options
      shipping_enabled: settingsData.shipping_enabled,
      free_shipping_enabled: settingsData.free_shipping_enabled,
      free_shipping_threshold: settingsData.free_shipping_threshold,
      shipping_zones: settingsData.shipping_zones,
      delivery_methods: settingsData.delivery_methods,
      processing_time: settingsData.processing_time?.trim(),
      
      // Payment Methods
      cash_on_delivery: settingsData.cash_on_delivery,
      online_payments: settingsData.online_payments,
      payment_gateways: settingsData.payment_gateways,
      accept_credit_cards: settingsData.accept_credit_cards,
      accept_digital_wallets: settingsData.accept_digital_wallets,
      
      // Currencies & Languages
      default_currency: settingsData.default_currency?.trim()?.toUpperCase(),
      supported_currencies: settingsData.supported_currencies,
      default_language: settingsData.default_language?.trim()?.toLowerCase(),
      supported_languages: settingsData.supported_languages,
      
      // Store Options
      store_status: settingsData.store_status?.trim(),
      auto_approve_orders: settingsData.auto_approve_orders,
      inventory_tracking: settingsData.inventory_tracking,
      low_stock_threshold: settingsData.low_stock_threshold,
      allow_backorders: settingsData.allow_backorders,
      show_stock_quantity: settingsData.show_stock_quantity,
      
      // Rating Settings
      enable_reviews: settingsData.enable_reviews,
      require_purchase_for_review: settingsData.require_purchase_for_review,
      auto_approve_reviews: settingsData.auto_approve_reviews,
      min_rating_threshold: settingsData.min_rating_threshold,
      show_vendor_rating: settingsData.show_vendor_rating,
      
      // Maintenance Mode
      maintenance_mode: settingsData.maintenance_mode,
      maintenance_message: settingsData.maintenance_message?.trim(),
      maintenance_start_time: settingsData.maintenance_start_time,
      maintenance_end_time: settingsData.maintenance_end_time,
      
      // Domain Settings
      custom_domain: settingsData.custom_domain?.trim()?.toLowerCase(),
      subdomain: settingsData.subdomain?.trim()?.toLowerCase(),
      seo_title: settingsData.seo_title?.trim(),
      seo_description: settingsData.seo_description?.trim(),
      seo_keywords: settingsData.seo_keywords?.trim(),
      social_media_links: settingsData.social_media_links,
      
      // Additional settings
      timezone: settingsData.timezone?.trim(),
      date_format: settingsData.date_format?.trim(),
      time_format: settingsData.time_format?.trim()
    };

    // Remove undefined/null/empty values
    Object.keys(sanitizedData).forEach(key => {
      if (sanitizedData[key] === undefined || 
          sanitizedData[key] === null || 
          sanitizedData[key] === '' ||
          (Array.isArray(sanitizedData[key]) && sanitizedData[key].length === 0)) {
        delete sanitizedData[key];
      }
    });

    return await vendorSettingsRepository.updateVendorSettings(vendorId, sanitizedData);
  },

  // Update basic settings only
  updateBasicSettings: async (vendorId, basicData) => {
    const sanitizedData = {
      store_name: basicData.store_name?.trim(),
      store_description: basicData.store_description?.trim(),
      store_logo_url: basicData.store_logo_url?.trim(),
      store_banner_url: basicData.store_banner_url?.trim(),
      business_type: basicData.business_type?.trim(),
      store_phone: basicData.store_phone?.trim(),
      store_email: basicData.store_email?.trim()?.toLowerCase(),
      store_address: basicData.store_address?.trim()
    };

    // Remove undefined/null/empty values
    Object.keys(sanitizedData).forEach(key => {
      if (sanitizedData[key] === undefined || sanitizedData[key] === null || sanitizedData[key] === '') {
        delete sanitizedData[key];
      }
    });

    return await vendorSettingsRepository.updateVendorSettings(vendorId, sanitizedData);
  },

  // Update shipping settings only
  updateShippingSettings: async (vendorId, shippingData) => {
    const sanitizedData = {
      shipping_enabled: shippingData.shipping_enabled,
      free_shipping_enabled: shippingData.free_shipping_enabled,
      free_shipping_threshold: shippingData.free_shipping_threshold,
      shipping_zones: shippingData.shipping_zones,
      delivery_methods: shippingData.delivery_methods,
      processing_time: shippingData.processing_time?.trim()
    };

    // Remove undefined/null/empty values
    Object.keys(sanitizedData).forEach(key => {
      if (sanitizedData[key] === undefined || sanitizedData[key] === null || sanitizedData[key] === '') {
        delete sanitizedData[key];
      }
    });

    return await vendorSettingsRepository.updateVendorSettings(vendorId, sanitizedData);
  },

  // Update payment settings only
  updatePaymentSettings: async (vendorId, paymentData) => {
    const sanitizedData = {
      cash_on_delivery: paymentData.cash_on_delivery,
      online_payments: paymentData.online_payments,
      payment_gateways: paymentData.payment_gateways,
      accept_credit_cards: paymentData.accept_credit_cards,
      accept_digital_wallets: paymentData.accept_digital_wallets
    };

    // Remove undefined/null/empty values
    Object.keys(sanitizedData).forEach(key => {
      if (sanitizedData[key] === undefined || sanitizedData[key] === null) {
        delete sanitizedData[key];
      }
    });

    return await vendorSettingsRepository.updateVendorSettings(vendorId, sanitizedData);
  }
};

export default vendorSettingsService;