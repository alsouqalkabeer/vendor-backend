import { pool } from '../index.js';

// curl -X GET "http://localhost:5001/api/vendors/VENDOR001/settings" \
//   -H "Content-Type: application/json" \
//   -H "Accept: application/json"

const vendorSettingsRepository = {
  // Get all vendor settings by vendor ID
  getVendorSettings: async (vendorId) => {
    const query = `
      SELECT 
        id,
        vendor_id,
        category_name,
        category_key,
        description,
        icon,
        is_enabled,
        settings_data,
        display_order,
        created_at,
        updated_at
      FROM vendorSettings 
      WHERE vendor_id = $1 
      ORDER BY display_order
    `;
    
    const { rows } = await pool.query(query, [vendorId]);
    
    if (rows.length === 0) {
      return null;
    }
    
    // Transform the rows into a structured object with all categories
    const settingsObject = {
      vendor_id: vendorId,
      categories: {},
      total_categories: rows.length
    };
    
    // Group settings by category_key for easy access
    rows.forEach(row => {
      settingsObject.categories[row.category_key] = {
        id: row.id,
        category_name: row.category_name,
        category_key: row.category_key,
        description: row.description,
        icon: row.icon,
        is_enabled: row.is_enabled,
        settings_data: row.settings_data,
        display_order: row.display_order,
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    });
    
    // Also provide the raw array for frontend that might need it
    settingsObject.settings_array = rows;
    
    return settingsObject;
  },

  // Get vendor settings by category
  getVendorSettingsByCategory: async (vendorId, categoryKey) => {
    const query = `
      SELECT 
        id,
        vendor_id,
        category_name,
        category_key,
        description,
        icon,
        is_enabled,
        settings_data,
        display_order,
        created_at,
        updated_at
      FROM vendorSettings 
      WHERE vendor_id = $1 AND category_key = $2
    `;
    
    const { rows } = await pool.query(query, [vendorId, categoryKey]);
    return rows[0] || null;
  },

  // Get all categories as a simple array (for UI grid)
  getVendorSettingsArray: async (vendorId) => {
    const query = `
      SELECT 
        id,
        vendor_id,
        category_name,
        category_key,
        description,
        icon,
        is_enabled,
        settings_data,
        display_order,
        created_at,
        updated_at
      FROM vendorSettings 
      WHERE vendor_id = $1 
      ORDER BY display_order
    `;
    
    const { rows } = await pool.query(query, [vendorId]);
    return rows;
  },

  // Update vendor settings for a specific category
  updateVendorSettings: async (vendorId, categoryKey, settingsData) => {
    const query = `
      UPDATE vendorSettings 
      SET 
        settings_data = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE vendor_id = $1 AND category_key = $2
      RETURNING 
        id,
        vendor_id,
        category_name,
        category_key,
        description,
        icon,
        is_enabled,
        settings_data,
        display_order,
        created_at,
        updated_at
    `;
    
    const { rows } = await pool.query(query, [vendorId, categoryKey, settingsData]);
    return rows[0];
  },

  // Update settings data for multiple categories
  updateMultipleVendorSettings: async (vendorId, updates) => {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const updatedSettings = [];
      
      for (const update of updates) {
        const { category_key, settings_data } = update;
        
        const query = `
          UPDATE vendorSettings 
          SET 
            settings_data = $3,
            updated_at = CURRENT_TIMESTAMP
          WHERE vendor_id = $1 AND category_key = $2
          RETURNING *
        `;
        
        const { rows } = await client.query(query, [vendorId, category_key, settings_data]);
        if (rows[0]) {
          updatedSettings.push(rows[0]);
        }
      }
      
      await client.query('COMMIT');
      return updatedSettings;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Enable/Disable a category
  toggleCategoryStatus: async (vendorId, categoryKey, isEnabled) => {
    const query = `
      UPDATE vendorSettings 
      SET 
        is_enabled = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE vendor_id = $1 AND category_key = $2
      RETURNING *
    `;
    
    const { rows } = await pool.query(query, [vendorId, categoryKey, isEnabled]);
    return rows[0];
  },

  // Create initial vendor settings (for new vendors) - creates all 16 categories
  createVendorSettings: async (vendorId, initialData = {}) => {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Default categories with their settings
      const defaultCategories = [
        {
          category_name: 'Basic Settings',
          category_key: 'basic_settings',
          description: 'Store name, description, contact information and basic store configuration',
          icon: 'settings',
          display_order: 1,
          settings_data: initialData.basic_settings || {
            store_name: initialData.store_name || 'My Store',
            store_email: initialData.store_email || '',
            store_phone: '',
            store_address: '',
            store_description: ''
          }
        },
        {
          category_name: 'Shipping & Delivery Options',
          category_key: 'shipping_delivery',
          description: 'Configure shipping methods, rates, and delivery options',
          icon: 'truck',
          display_order: 2,
          settings_data: { free_shipping_threshold: 0, shipping_methods: [], delivery_zones: [], packaging_options: [] }
        },
        {
          category_name: 'Payment Methods',
          category_key: 'payment_methods',
          description: 'Set up accepted payment methods and gateway configurations',
          icon: 'credit-card',
          display_order: 3,
          settings_data: { accepted_methods: ['credit_card', 'debit_card'], payment_gateways: {}, payment_terms: '' }
        },
        {
          category_name: 'Wallet',
          category_key: 'wallet',
          description: 'Configure wallet settings and transaction limits',
          icon: 'wallet',
          display_order: 4,
          settings_data: { wallet_enabled: true, minimum_balance: 0, withdrawal_limit: 10000, auto_reload: false }
        },
        {
          category_name: 'Rating Settings',
          category_key: 'rating_settings',
          description: 'Manage product and store rating configurations',
          icon: 'star',
          display_order: 5,
          settings_data: { min_rating_threshold: 1, rating_display: true, review_moderation: false, rating_notifications: true }
        },
        {
          category_name: 'Currencies',
          category_key: 'currencies',
          description: 'Set default currency and supported currency options',
          icon: 'dollar-sign',
          display_order: 6,
          settings_data: { default_currency: 'USD', supported_currencies: ['USD', 'EUR', 'GBP'], auto_conversion: false }
        },
        {
          category_name: 'Languages',
          category_key: 'languages',
          description: 'Configure store language settings and translations',
          icon: 'globe',
          display_order: 7,
          settings_data: { default_language: 'en', supported_languages: ['en', 'es', 'fr'], auto_detect: false }
        },
        {
          category_name: 'Store Options',
          category_key: 'store_options',
          description: 'General store configuration and display options',
          icon: 'sliders',
          display_order: 8,
          settings_data: { store_visibility: 'public', catalog_mode: false, inventory_tracking: true, stock_notifications: true }
        },
        {
          category_name: 'Shipping Company Restrictions',
          category_key: 'shipping_restrictions',
          description: 'Manage allowed and restricted shipping companies',
          icon: 'shield',
          display_order: 9,
          settings_data: { allowed_companies: [], restricted_companies: [], restrictions_enabled: false }
        },
        {
          category_name: 'Maintenance Mode',
          category_key: 'maintenance_mode',
          description: 'Configure store maintenance mode and schedules',
          icon: 'clock',
          display_order: 10,
          settings_data: { maintenance_enabled: false, maintenance_message: '', scheduled_maintenance: null }
        },
        {
          category_name: 'Domain Settings',
          category_key: 'domain_settings',
          description: 'Custom domain configuration and SSL settings',
          icon: 'globe',
          display_order: 11,
          settings_data: { custom_domain: '', domain_verified: false, ssl_enabled: true, redirect_settings: {} }
        },
        {
          category_name: 'Order Options',
          category_key: 'order_options',
          description: 'Configure order processing and management options',
          icon: 'shopping-cart',
          display_order: 12,
          settings_data: { order_prefix: 'ORD', numbering_format: 'sequential', auto_confirmation: true, cancellation_window: 24 }
        },
        {
          category_name: 'Custom Fields',
          category_key: 'custom_fields',
          description: 'Create and manage custom fields for products and orders',
          icon: 'edit',
          display_order: 13,
          settings_data: { product_fields: [], order_fields: [], customer_fields: [] }
        },
        {
          category_name: 'Store Invoice Settings',
          category_key: 'invoice_settings',
          description: 'Configure invoice templates and numbering',
          icon: 'receipt',
          display_order: 14,
          settings_data: { template: 'default', numbering_format: 'sequential', invoice_prefix: 'INV', tax_calculation: true }
        },
        {
          category_name: 'Notifications',
          category_key: 'notifications',
          description: 'Manage notification preferences and settings',
          icon: 'bell',
          display_order: 15,
          settings_data: { email_notifications: true, sms_notifications: false, push_notifications: true, notification_types: {} }
        },
        {
          category_name: 'Payment Restrictions',
          category_key: 'payment_restrictions',
          description: 'Set payment method restrictions and limits',
          icon: 'ban',
          display_order: 16,
          settings_data: { restricted_methods: [], country_restrictions: [], amount_limits: { min: 0, max: 999999 } }
        }
      ];

      const createdSettings = [];
      
      for (const category of defaultCategories) {
        const query = `
          INSERT INTO vendorSettings (
            vendor_id,
            category_name,
            category_key,
            description,
            icon,
            settings_data,
            display_order,
            is_enabled
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
        `;
        
        const { rows } = await client.query(query, [
          vendorId,
          category.category_name,
          category.category_key,
          category.description,
          category.icon,
          category.settings_data,
          category.display_order,
          true
        ]);
        
        createdSettings.push(rows[0]);
      }
      
      await client.query('COMMIT');
      return createdSettings;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Check if vendor settings exist
  vendorSettingsExist: async (vendorId) => {
    const query = `SELECT id FROM vendorSettings WHERE vendor_id = $1 LIMIT 1`;
    const { rows } = await pool.query(query, [vendorId]);
    return rows.length > 0;
  },

  // Delete all vendor settings
  deleteVendorSettings: async (vendorId) => {
    const query = `DELETE FROM vendorSettings WHERE vendor_id = $1 RETURNING *`;
    const { rows } = await pool.query(query, [vendorId]);
    return rows;
  }
};

export default vendorSettingsRepository;