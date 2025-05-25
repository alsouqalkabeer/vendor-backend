import accountRepository from '../data/accountRepository.js';

const accountService = {
  getAccountSettings: async (id) => {
    return await accountRepository.getAccountSettings(id);
  },

  updateAccountSettings: async (id, settingsData) => {
    // Sanitize and validate data
    const sanitizedData = {
      name: settingsData.name?.trim(),
      address: settingsData.address?.trim(),
      main_mobile_number: settingsData.main_mobile_number?.trim(),
      sub_mobile_number: settingsData.sub_mobile_number?.trim(),
      whatsapp: settingsData.whatsapp?.trim(),
      main_email: settingsData.main_email?.trim().toLowerCase(),
      sub_email: settingsData.sub_email?.trim().toLowerCase(),
      country: settingsData.country?.trim(),
      city: settingsData.city?.trim(),
      about_me: settingsData.about_me?.trim()
    };

    // Remove undefined/null values
    Object.keys(sanitizedData).forEach(key => {
      if (sanitizedData[key] === undefined || sanitizedData[key] === null || sanitizedData[key] === '') {
        delete sanitizedData[key];
      }
    });

    return await accountRepository.updateAccountSettings(id, sanitizedData);
  },

  updateProfile: async (id, profileData) => {
    const sanitizedData = {
      name: profileData.name?.trim(),
      about_me: profileData.about_me?.trim()
    };

    // Remove undefined/null values
    Object.keys(sanitizedData).forEach(key => {
      if (sanitizedData[key] === undefined || sanitizedData[key] === null || sanitizedData[key] === '') {
        delete sanitizedData[key];
      }
    });

    return await accountRepository.updateProfile(id, sanitizedData);
  },

  updateContact: async (id, contactData) => {
    const sanitizedData = {
      main_mobile_number: contactData.main_mobile_number?.trim(),
      sub_mobile_number: contactData.sub_mobile_number?.trim(),
      whatsapp: contactData.whatsapp?.trim(),
      main_email: contactData.main_email?.trim().toLowerCase(),
      sub_email: contactData.sub_email?.trim().toLowerCase(),
      address: contactData.address?.trim(),
      country: contactData.country?.trim(),
      city: contactData.city?.trim()
    };

    // Remove undefined/null values
    Object.keys(sanitizedData).forEach(key => {
      if (sanitizedData[key] === undefined || sanitizedData[key] === null || sanitizedData[key] === '') {
        delete sanitizedData[key];
      }
    });

    return await accountRepository.updateContact(id, sanitizedData);
  }
};

export default accountService;