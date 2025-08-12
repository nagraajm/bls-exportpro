import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import {
  Product, BatchInfo, PackagingMaterial,
  Customer, Supplier, Manufacturer,
  Invoice, PackingList, PurchaseOrder,
  Registration, ComplianceStatus,
  ExchangeRate, PaymentTerms, Calculation,
  ExportMetrics, RegulatoryMetrics, InventoryMetrics
} from '../index';

export const createProduct = (overrides?: Partial<Product>): Product => ({
  id: uuidv4(),
  brandName: faker.commerce.productName(),
  genericName: faker.science.chemicalElement().name,
  strength: `${faker.number.int({ min: 10, max: 500 })}mg`,
  packSize: `${faker.number.int({ min: 10, max: 100 })} ${faker.helpers.arrayElement(['tablets', 'capsules', 'vials'])}`,
  HSNCode: faker.string.numeric(8),
  therapeuticCategory: faker.helpers.arrayElement(['Antibiotics', 'Analgesics', 'Cardiovascular', 'Diabetes']),
  dosageForm: faker.helpers.arrayElement(['Tablet', 'Capsule', 'Injection', 'Syrup']),
  activeIngredients: [
    {
      name: faker.science.chemicalElement().name,
      quantity: `${faker.number.int({ min: 10, max: 500 })}`,
      unit: 'mg'
    }
  ],
  shelfLife: faker.number.int({ min: 12, max: 36 }),
  storageConditions: faker.helpers.arrayElement(['Store below 25°C', 'Store in cool dry place', 'Refrigerate']),
  isScheduledDrug: faker.datatype.boolean(),
  scheduleCategory: faker.helpers.arrayElement(['Schedule H', 'Schedule X', undefined]),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides
});

export const createBatchInfo = (productId?: string, overrides?: Partial<BatchInfo>): BatchInfo => {
  const mfgDate = faker.date.past({ years: 1 });
  const expDate = new Date(mfgDate);
  expDate.setMonth(expDate.getMonth() + faker.number.int({ min: 12, max: 36 }));
  
  return {
    id: uuidv4(),
    productId: productId || uuidv4(),
    batchNo: `${faker.string.alpha({ length: 3, casing: 'upper' })}${faker.string.numeric(6)}`,
    mfgDate,
    expDate,
    quantity: faker.number.int({ min: 1000, max: 100000 }),
    quantityUnit: faker.helpers.arrayElement(['tablets', 'capsules', 'vials', 'bottles', 'strips', 'sachets']),
    availableQuantity: faker.number.int({ min: 0, max: 50000 }),
    status: faker.helpers.arrayElement(['available', 'allocated', 'quarantine', 'expired', 'sold']),
    qualityCertificateNo: `QC${faker.string.numeric(8)}`,
    releaseDate: faker.date.between({ from: mfgDate, to: new Date() }),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides
  };
};

export const createCustomer = (overrides?: Partial<Customer>): Customer => ({
  id: uuidv4(),
  name: faker.company.name(),
  country: faker.location.country(),
  countryCode: faker.location.countryCode(),
  address: {
    line1: faker.location.streetAddress(),
    line2: faker.location.secondaryAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    postalCode: faker.location.zipCode(),
    country: faker.location.country(),
    countryCode: faker.location.countryCode()
  },
  registrationNo: `REG${faker.string.numeric(8)}`,
  taxId: faker.string.alphanumeric(15),
  importLicenseNo: `IMP${faker.string.numeric(6)}`,
  contactDetails: [
    {
      name: faker.person.fullName(),
      designation: faker.person.jobTitle(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      mobile: faker.phone.number(),
      isPrimary: true
    }
  ],
  customerType: faker.helpers.arrayElement(['distributor', 'hospital', 'pharmacy', 'government', 'other']),
  status: faker.helpers.arrayElement(['active', 'inactive', 'blacklisted']),
  creditLimit: faker.number.int({ min: 10000, max: 1000000 }),
  paymentTerms: faker.number.int({ min: 0, max: 90 }),
  bankDetails: {
    bankName: faker.company.name() + ' Bank',
    accountNumber: faker.finance.accountNumber(),
    swiftCode: faker.string.alphanumeric(11),
    iban: faker.finance.iban(),
    routingNumber: faker.finance.routingNumber()
  },
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides
});

export const createSupplier = (overrides?: Partial<Supplier>): Supplier => ({
  id: uuidv4(),
  name: faker.company.name(),
  GSTIN: `${faker.string.numeric(2)}${faker.string.alpha({ length: 5, casing: 'upper' })}${faker.string.numeric(4)}${faker.string.alpha({ length: 1, casing: 'upper' })}${faker.string.alphanumeric({ length: 1, casing: 'upper' })}Z${faker.string.alphanumeric({ length: 1, casing: 'upper' })}`,
  address: {
    line1: faker.location.streetAddress(),
    line2: faker.location.secondaryAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    postalCode: faker.location.zipCode(),
    country: 'India',
    countryCode: 'IN'
  },
  products: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => uuidv4()),
  licenseNumbers: {
    drugLicense: `DL${faker.string.numeric(8)}`,
    manufacturingLicense: `ML${faker.string.numeric(8)}`,
    gmpCertificate: `GMP${faker.string.numeric(6)}`,
    isoNumber: `ISO${faker.string.numeric(6)}`,
    whoGmpNumber: `WHO${faker.string.numeric(6)}`
  },
  contactDetails: [
    {
      name: faker.person.fullName(),
      designation: faker.person.jobTitle(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      mobile: faker.phone.number(),
      isPrimary: true
    }
  ],
  supplierType: faker.helpers.arrayElement(['manufacturer', 'trader', 'importer', 'distributor']),
  status: faker.helpers.arrayElement(['active', 'inactive', 'suspended']),
  qualityRating: faker.number.float({ min: 3, max: 5, fractionDigits: 1 }),
  deliveryRating: faker.number.float({ min: 3, max: 5, fractionDigits: 1 }),
  paymentTerms: faker.number.int({ min: 0, max: 60 }),
  bankDetails: {
    bankName: faker.company.name() + ' Bank',
    accountNumber: faker.finance.accountNumber(),
    ifscCode: `${faker.string.alpha({ length: 4, casing: 'upper' })}0${faker.string.alphanumeric({ length: 6, casing: 'upper' })}`,
    branch: faker.location.city()
  },
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides
});

export const createInvoice = (customerId?: string, overrides?: Partial<Invoice>): Invoice => {
  const items = Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, (_, index) => {
    const quantity = faker.number.int({ min: 100, max: 10000 });
    const unitPrice = faker.number.float({ min: 1, max: 100, fractionDigits: 2 });
    const totalPrice = quantity * unitPrice;
    const taxRate = faker.helpers.arrayElement([0, 5, 12, 18, 28]);
    const taxAmount = (totalPrice * taxRate) / 100;
    const discount = faker.number.float({ min: 0, max: 10, fractionDigits: 2 });
    const netAmount = totalPrice + taxAmount - discount;

    return {
      lineNo: index + 1,
      productId: uuidv4(),
      batchId: uuidv4(),
      quantity,
      unitPrice,
      currency: 'USD' as const,
      totalPrice,
      HSNCode: faker.string.numeric(8),
      taxRate,
      taxAmount,
      discount,
      netAmount
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalTax = items.reduce((sum, item) => sum + item.taxAmount, 0);
  const shippingCharges = faker.number.float({ min: 0, max: 1000, fractionDigits: 2 });
  const otherCharges = faker.number.float({ min: 0, max: 500, fractionDigits: 2 });
  const totalAmount = subtotal + totalTax + shippingCharges + otherCharges;

  return {
    id: uuidv4(),
    invoiceNo: `INV${faker.string.numeric(8)}`,
    invoiceType: faker.helpers.arrayElement(['proforma', 'preshipment', 'postshipment', 'commercial', 'tax']),
    invoiceDate: faker.date.recent(),
    customerId: customerId || uuidv4(),
    buyerOrderNo: `PO${faker.string.numeric(6)}`,
    buyerOrderDate: faker.date.past(),
    items,
    currency: 'USD',
    exchangeRate: faker.number.float({ min: 70, max: 85, fractionDigits: 2 }),
    subtotal,
    totalTax,
    shippingCharges,
    otherCharges,
    totalAmount,
    incoterms: faker.helpers.arrayElement(['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF']),
    paymentTerms: faker.helpers.arrayElement(['30 days', '60 days', 'LC at sight', 'Advance payment']),
    paymentDueDate: faker.date.future(),
    bankDetails: {
      bankName: faker.company.name() + ' Bank',
      accountNumber: faker.finance.accountNumber(),
      swiftCode: faker.string.alphanumeric(11),
      iban: faker.finance.iban(),
      correspondentBank: faker.company.name() + ' Bank'
    },
    shippingDetails: {
      portOfLoading: faker.location.city(),
      portOfDischarge: faker.location.city(),
      finalDestination: faker.location.city(),
      vesselName: faker.company.name(),
      voyageNo: `V${faker.string.numeric(4)}`,
      containerNo: `CONT${faker.string.numeric(7)}`,
      sealNo: `SEAL${faker.string.numeric(6)}`
    },
    status: faker.helpers.arrayElement(['draft', 'sent', 'paid', 'cancelled', 'overdue']),
    notes: faker.lorem.sentence(),
    termsAndConditions: faker.lorem.paragraph(),
    createdBy: faker.person.fullName(),
    approvedBy: faker.person.fullName(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides
  };
};

export const createRegistration = (productId?: string, overrides?: Partial<Registration>): Registration => {
  const applicationDate = faker.date.past({ years: 2 });
  const approvalDate = faker.date.between({ from: applicationDate, to: new Date() });
  const validFrom = approvalDate;
  const validTo = new Date(validFrom);
  validTo.setFullYear(validTo.getFullYear() + faker.number.int({ min: 1, max: 5 }));

  return {
    id: uuidv4(),
    country: faker.location.country(),
    countryCode: faker.location.countryCode(),
    productId: productId || uuidv4(),
    registrationNo: `REG${faker.string.numeric(8)}`,
    registrationType: faker.helpers.arrayElement(['new', 'renewal', 'variation', 'extension']),
    dossierNo: `DOS${faker.string.numeric(6)}`,
    dossierType: faker.helpers.arrayElement(['CTD', 'ACTD', 'eCTD', 'national']),
    status: faker.helpers.arrayElement(['pending', 'submitted', 'under_review', 'approved', 'rejected', 'expired', 'renewal_due']),
    applicationDate,
    approvalDate,
    validFrom,
    validTo,
    renewalDueDate: new Date(validTo.getTime() - 90 * 24 * 60 * 60 * 1000), // 90 days before expiry
    regulatoryAuthority: faker.company.name() + ' Drug Authority',
    maHolder: faker.company.name(),
    localAgent: {
      name: faker.company.name(),
      address: faker.location.streetAddress(),
      licenseNo: `LA${faker.string.numeric(6)}`,
      contactPerson: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number()
    },
    fees: {
      applicationFee: faker.number.int({ min: 1000, max: 50000 }),
      renewalFee: faker.number.int({ min: 500, max: 25000 }),
      currency: 'USD',
      paidAmount: faker.number.int({ min: 0, max: 50000 }),
      paymentStatus: faker.helpers.arrayElement(['pending', 'partial', 'paid'])
    },
    documents: Array.from({ length: faker.number.int({ min: 1, max: 10 }) }, () => ({
      documentType: faker.helpers.arrayElement(['CTD Module 1', 'CTD Module 2', 'CTD Module 3', 'Certificate', 'License']),
      fileName: faker.system.fileName(),
      uploadDate: faker.date.past(),
      version: `v${faker.number.int({ min: 1, max: 5 })}`,
      status: faker.helpers.arrayElement(['draft', 'submitted', 'approved', 'rejected'])
    })),
    variations: [],
    inspections: [],
    remarks: faker.lorem.sentence(),
    createdBy: faker.person.fullName(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides
  };
};

export const createExchangeRate = (overrides?: Partial<ExchangeRate>): ExchangeRate => ({
  id: uuidv4(),
  fromCurrency: 'USD',
  toCurrency: 'INR',
  rate: faker.number.float({ min: 70, max: 85, fractionDigits: 4 }),
  effectiveDate: faker.date.recent(),
  expiryDate: faker.date.future(),
  source: faker.helpers.arrayElement(['RBI', 'market', 'custom', 'bank']),
  isActive: true,
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides
});

export const createCalculation = (overrides?: Partial<Calculation>): Calculation => {
  const productCost = faker.number.float({ min: 1000, max: 50000, fractionDigits: 2 });
  const packagingCost = faker.number.float({ min: 100, max: 5000, fractionDigits: 2 });
  const inlandFreight = faker.number.float({ min: 50, max: 1000, fractionDigits: 2 });
  const handlingCharges = faker.number.float({ min: 50, max: 500, fractionDigits: 2 });
  const documentationCharges = faker.number.float({ min: 50, max: 500, fractionDigits: 2 });
  const otherCharges = faker.number.float({ min: 0, max: 1000, fractionDigits: 2 });
  
  const FOBTotal = productCost + packagingCost + inlandFreight + handlingCharges + documentationCharges + otherCharges;
  const freightCharges = faker.number.float({ min: 500, max: 5000, fractionDigits: 2 });
  const insuranceCharges = faker.number.float({ min: 100, max: 1000, fractionDigits: 2 });
  const CIFTotal = FOBTotal + freightCharges + insuranceCharges;

  return {
    FOB: {
      productCost,
      packagingCost,
      inlandFreight,
      handlingCharges,
      documentationCharges,
      otherCharges,
      total: FOBTotal
    },
    CIF: {
      FOBValue: FOBTotal,
      freightCharges,
      insuranceCharges,
      total: CIFTotal
    },
    IGST: {
      taxableValue: CIFTotal,
      rate: faker.helpers.arrayElement([0, 5, 12, 18, 28]),
      amount: (CIFTotal * faker.helpers.arrayElement([0, 5, 12, 18, 28])) / 100,
      isLUT: faker.datatype.boolean(),
      lutNo: `LUT${faker.string.numeric(8)}`,
      lutValidUpto: faker.date.future()
    },
    drawback: {
      scheme: faker.helpers.arrayElement(['DBK', 'RoDTEP', 'RoSCTL', 'MEIS']),
      rate: faker.number.float({ min: 0.5, max: 5, fractionDigits: 2 }),
      rateType: 'percentage',
      capAmount: faker.number.float({ min: 1000, max: 10000, fractionDigits: 2 }),
      calculatedAmount: faker.number.float({ min: 100, max: 5000, fractionDigits: 2 }),
      claimStatus: faker.helpers.arrayElement(['eligible', 'claimed', 'received', 'rejected'])
    },
    RODTEP: {
      rate: faker.number.float({ min: 0.1, max: 3, fractionDigits: 2 }),
      amount: faker.number.float({ min: 100, max: 5000, fractionDigits: 2 }),
      certificateNo: `RODTEP${faker.string.numeric(8)}`,
      claimDate: faker.date.recent(),
      status: faker.helpers.arrayElement(['pending', 'claimed', 'credited', 'utilized'])
    },
    profitMargin: {
      percentage: faker.number.float({ min: 5, max: 30, fractionDigits: 2 }),
      amount: faker.number.float({ min: 500, max: 10000, fractionDigits: 2 })
    },
    finalPrice: CIFTotal * faker.number.float({ min: 1.1, max: 1.3, fractionDigits: 2 }),
    currency: 'USD',
    ...overrides
  };
};