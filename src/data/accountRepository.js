import { pool } from '../index.js';

const accountRepository = {
  // Get account settings by user ID
  getAccountSettings: async (userId) => {
    const query = `
      SELECT 
        a.id,
        a.user_id,
        a.name,
        a.address,
        a.main_mobile_number,
        a.sub_mobile_number,
        a.whatsapp,
        a.main_email,
        a.sub_email,
        a.country,
        a.city,
        a.about_me,
        a.created_at,
        a.updated_at
      FROM accounts a
      WHERE a.user_id = $1
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows[0];
  },

  // Update account settings
  updateAccountSettings: async (userId, settingsData) => {
    const fields = Object.keys(settingsData);
    const values = Object.values(settingsData);
    
    if (fields.length === 0) {
      return null;
    }

    // Build dynamic SET clause
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    
    const query = `
      UPDATE accounts 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
      RETURNING 
        id,
        user_id,
        name,
        address,
        main_mobile_number,
        sub_mobile_number,
        whatsapp,
        main_email,
        sub_email,
        country,
        city,
        about_me,
        updated_at
    `;
    
    const { rows } = await pool.query(query, [userId, ...values]);
    return rows[0];
  },

  // Update profile information only
  updateProfile: async (userId, profileData) => {
    const fields = Object.keys(profileData);
    const values = Object.values(profileData);
    
    if (fields.length === 0) {
      return null;
    }

    // Build dynamic SET clause
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    
    const query = `
      UPDATE accounts 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
      RETURNING 
        id,
        user_id,
        name,
        about_me,
        updated_at
    `;
    
    const { rows } = await pool.query(query, [userId, ...values]);
    return rows[0];
  },

  // Update contact information only
  updateContact: async (userId, contactData) => {
    const fields = Object.keys(contactData);
    const values = Object.values(contactData);
    
    if (fields.length === 0) {
      return null;
    }

    // Build dynamic SET clause
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    
    const query = `
      UPDATE accounts 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
      RETURNING 
        id,
        user_id,
        main_mobile_number,
        sub_mobile_number,
        whatsapp,
        main_email,
        sub_email,
        address,
        country,
        city,
        updated_at
    `;
    
    const { rows } = await pool.query(query, [userId, ...values]);
    return rows[0];
  }
};

export default accountRepository;