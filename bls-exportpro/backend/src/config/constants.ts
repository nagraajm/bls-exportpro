export const CONSTANTS = {
  IGST_RATE: 0.00,
  DRAWBACK_RATE: 0.012,
  RODTEP_RATE: 0.007,
  
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },
  
  FILE_UPLOAD: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_EXCEL_TYPES: [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  },
  
  PDF: {
    PAGE_SIZE: 'A4',
    MARGINS: { top: 50, bottom: 50, left: 50, right: 50 },
  },
  
  CURRENCY: {
    DEFAULT: 'USD',
    SUPPORTED: ['USD', 'INR'],
  },
  
  DATE_FORMAT: {
    DISPLAY: 'DD/MM/YYYY',
    ISO: 'YYYY-MM-DD',
  },
  
  COMPANY_INFO: {
    name: 'BLS TRADING COMPANY',
    address: {
      street: 'Gayathrinagar, Near R.R.Hospital',
      city: 'Chittoor',
      state: 'Andhra Pradesh',
      country: 'India',
      postalCode: '517001',
    },
    phone: '+91-8772-238822',
    email: 'blstradingcompany@gmail.com',
    gstin: '37AXLPB0547C1ZD',
    iecCode: 'YOUR_IEC_CODE',
  },
  
  BANK_DETAILS: {
    primary: {
      bankName: 'STATE BANK OF INDIA',
      accountName: 'BLS TRADING COMPANY',
      accountNumber: '12345678901234',
      swiftCode: 'SBININBB',
      ifscCode: 'SBIN0001234',
      branchAddress: 'Main Branch, Chittoor, AP, India',
    },
  },
};