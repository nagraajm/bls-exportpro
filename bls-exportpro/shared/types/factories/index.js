"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCalculation = exports.createExchangeRate = exports.createRegistration = exports.createInvoice = exports.createSupplier = exports.createCustomer = exports.createBatchInfo = exports.createProduct = void 0;
const faker_1 = require("@faker-js/faker");
const uuid_1 = require("uuid");
const createProduct = (overrides) => ({
    id: (0, uuid_1.v4)(),
    brandName: faker_1.faker.commerce.productName(),
    genericName: faker_1.faker.science.chemicalElement().name,
    strength: `${faker_1.faker.number.int({ min: 10, max: 500 })}mg`,
    packSize: `${faker_1.faker.number.int({ min: 10, max: 100 })} ${faker_1.faker.helpers.arrayElement(['tablets', 'capsules', 'vials'])}`,
    HSNCode: faker_1.faker.string.numeric(8),
    therapeuticCategory: faker_1.faker.helpers.arrayElement(['Antibiotics', 'Analgesics', 'Cardiovascular', 'Diabetes']),
    dosageForm: faker_1.faker.helpers.arrayElement(['Tablet', 'Capsule', 'Injection', 'Syrup']),
    activeIngredients: [
        {
            name: faker_1.faker.science.chemicalElement().name,
            quantity: `${faker_1.faker.number.int({ min: 10, max: 500 })}`,
            unit: 'mg'
        }
    ],
    shelfLife: faker_1.faker.number.int({ min: 12, max: 36 }),
    storageConditions: faker_1.faker.helpers.arrayElement(['Store below 25°C', 'Store in cool dry place', 'Refrigerate']),
    isScheduledDrug: faker_1.faker.datatype.boolean(),
    scheduleCategory: faker_1.faker.helpers.arrayElement(['Schedule H', 'Schedule X', undefined]),
    createdAt: faker_1.faker.date.past(),
    updatedAt: faker_1.faker.date.recent(),
    ...overrides
});
exports.createProduct = createProduct;
const createBatchInfo = (productId, overrides) => {
    const mfgDate = faker_1.faker.date.past({ years: 1 });
    const expDate = new Date(mfgDate);
    expDate.setMonth(expDate.getMonth() + faker_1.faker.number.int({ min: 12, max: 36 }));
    return {
        id: (0, uuid_1.v4)(),
        productId: productId || (0, uuid_1.v4)(),
        batchNo: `${faker_1.faker.string.alpha({ length: 3, casing: 'upper' })}${faker_1.faker.string.numeric(6)}`,
        mfgDate,
        expDate,
        quantity: faker_1.faker.number.int({ min: 1000, max: 100000 }),
        quantityUnit: faker_1.faker.helpers.arrayElement(['tablets', 'capsules', 'vials', 'bottles', 'strips', 'sachets']),
        availableQuantity: faker_1.faker.number.int({ min: 0, max: 50000 }),
        status: faker_1.faker.helpers.arrayElement(['available', 'allocated', 'quarantine', 'expired', 'sold']),
        qualityCertificateNo: `QC${faker_1.faker.string.numeric(8)}`,
        releaseDate: faker_1.faker.date.between({ from: mfgDate, to: new Date() }),
        createdAt: faker_1.faker.date.past(),
        updatedAt: faker_1.faker.date.recent(),
        ...overrides
    };
};
exports.createBatchInfo = createBatchInfo;
const createCustomer = (overrides) => ({
    id: (0, uuid_1.v4)(),
    name: faker_1.faker.company.name(),
    country: faker_1.faker.location.country(),
    countryCode: faker_1.faker.location.countryCode(),
    address: {
        line1: faker_1.faker.location.streetAddress(),
        line2: faker_1.faker.location.secondaryAddress(),
        city: faker_1.faker.location.city(),
        state: faker_1.faker.location.state(),
        postalCode: faker_1.faker.location.zipCode(),
        country: faker_1.faker.location.country(),
        countryCode: faker_1.faker.location.countryCode()
    },
    registrationNo: `REG${faker_1.faker.string.numeric(8)}`,
    taxId: faker_1.faker.string.alphanumeric(15),
    importLicenseNo: `IMP${faker_1.faker.string.numeric(6)}`,
    contactDetails: [
        {
            name: faker_1.faker.person.fullName(),
            designation: faker_1.faker.person.jobTitle(),
            email: faker_1.faker.internet.email(),
            phone: faker_1.faker.phone.number(),
            mobile: faker_1.faker.phone.number(),
            isPrimary: true
        }
    ],
    customerType: faker_1.faker.helpers.arrayElement(['distributor', 'hospital', 'pharmacy', 'government', 'other']),
    status: faker_1.faker.helpers.arrayElement(['active', 'inactive', 'blacklisted']),
    creditLimit: faker_1.faker.number.int({ min: 10000, max: 1000000 }),
    paymentTerms: faker_1.faker.number.int({ min: 0, max: 90 }),
    bankDetails: {
        bankName: faker_1.faker.company.name() + ' Bank',
        accountNumber: faker_1.faker.finance.accountNumber(),
        swiftCode: faker_1.faker.string.alphanumeric(11),
        iban: faker_1.faker.finance.iban(),
        routingNumber: faker_1.faker.finance.routingNumber()
    },
    createdAt: faker_1.faker.date.past(),
    updatedAt: faker_1.faker.date.recent(),
    ...overrides
});
exports.createCustomer = createCustomer;
const createSupplier = (overrides) => ({
    id: (0, uuid_1.v4)(),
    name: faker_1.faker.company.name(),
    GSTIN: `${faker_1.faker.string.numeric(2)}${faker_1.faker.string.alpha({ length: 5, casing: 'upper' })}${faker_1.faker.string.numeric(4)}${faker_1.faker.string.alpha({ length: 1, casing: 'upper' })}${faker_1.faker.string.alphanumeric({ length: 1, casing: 'upper' })}Z${faker_1.faker.string.alphanumeric({ length: 1, casing: 'upper' })}`,
    address: {
        line1: faker_1.faker.location.streetAddress(),
        line2: faker_1.faker.location.secondaryAddress(),
        city: faker_1.faker.location.city(),
        state: faker_1.faker.location.state(),
        postalCode: faker_1.faker.location.zipCode(),
        country: 'India',
        countryCode: 'IN'
    },
    products: Array.from({ length: faker_1.faker.number.int({ min: 1, max: 5 }) }, () => (0, uuid_1.v4)()),
    licenseNumbers: {
        drugLicense: `DL${faker_1.faker.string.numeric(8)}`,
        manufacturingLicense: `ML${faker_1.faker.string.numeric(8)}`,
        gmpCertificate: `GMP${faker_1.faker.string.numeric(6)}`,
        isoNumber: `ISO${faker_1.faker.string.numeric(6)}`,
        whoGmpNumber: `WHO${faker_1.faker.string.numeric(6)}`
    },
    contactDetails: [
        {
            name: faker_1.faker.person.fullName(),
            designation: faker_1.faker.person.jobTitle(),
            email: faker_1.faker.internet.email(),
            phone: faker_1.faker.phone.number(),
            mobile: faker_1.faker.phone.number(),
            isPrimary: true
        }
    ],
    supplierType: faker_1.faker.helpers.arrayElement(['manufacturer', 'trader', 'importer', 'distributor']),
    status: faker_1.faker.helpers.arrayElement(['active', 'inactive', 'suspended']),
    qualityRating: faker_1.faker.number.float({ min: 3, max: 5, fractionDigits: 1 }),
    deliveryRating: faker_1.faker.number.float({ min: 3, max: 5, fractionDigits: 1 }),
    paymentTerms: faker_1.faker.number.int({ min: 0, max: 60 }),
    bankDetails: {
        bankName: faker_1.faker.company.name() + ' Bank',
        accountNumber: faker_1.faker.finance.accountNumber(),
        ifscCode: `${faker_1.faker.string.alpha({ length: 4, casing: 'upper' })}0${faker_1.faker.string.alphanumeric({ length: 6, casing: 'upper' })}`,
        branch: faker_1.faker.location.city()
    },
    createdAt: faker_1.faker.date.past(),
    updatedAt: faker_1.faker.date.recent(),
    ...overrides
});
exports.createSupplier = createSupplier;
const createInvoice = (customerId, overrides) => {
    const items = Array.from({ length: faker_1.faker.number.int({ min: 1, max: 5 }) }, (_, index) => {
        const quantity = faker_1.faker.number.int({ min: 100, max: 10000 });
        const unitPrice = faker_1.faker.number.float({ min: 1, max: 100, fractionDigits: 2 });
        const totalPrice = quantity * unitPrice;
        const taxRate = faker_1.faker.helpers.arrayElement([0, 5, 12, 18, 28]);
        const taxAmount = (totalPrice * taxRate) / 100;
        const discount = faker_1.faker.number.float({ min: 0, max: 10, fractionDigits: 2 });
        const netAmount = totalPrice + taxAmount - discount;
        return {
            lineNo: index + 1,
            productId: (0, uuid_1.v4)(),
            batchId: (0, uuid_1.v4)(),
            quantity,
            unitPrice,
            currency: 'USD',
            totalPrice,
            HSNCode: faker_1.faker.string.numeric(8),
            taxRate,
            taxAmount,
            discount,
            netAmount
        };
    });
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalTax = items.reduce((sum, item) => sum + item.taxAmount, 0);
    const shippingCharges = faker_1.faker.number.float({ min: 0, max: 1000, fractionDigits: 2 });
    const otherCharges = faker_1.faker.number.float({ min: 0, max: 500, fractionDigits: 2 });
    const totalAmount = subtotal + totalTax + shippingCharges + otherCharges;
    return {
        id: (0, uuid_1.v4)(),
        invoiceNo: `INV${faker_1.faker.string.numeric(8)}`,
        invoiceType: faker_1.faker.helpers.arrayElement(['proforma', 'preshipment', 'postshipment', 'commercial', 'tax']),
        invoiceDate: faker_1.faker.date.recent(),
        customerId: customerId || (0, uuid_1.v4)(),
        buyerOrderNo: `PO${faker_1.faker.string.numeric(6)}`,
        buyerOrderDate: faker_1.faker.date.past(),
        items,
        currency: 'USD',
        exchangeRate: faker_1.faker.number.float({ min: 70, max: 85, fractionDigits: 2 }),
        subtotal,
        totalTax,
        shippingCharges,
        otherCharges,
        totalAmount,
        incoterms: faker_1.faker.helpers.arrayElement(['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF']),
        paymentTerms: faker_1.faker.helpers.arrayElement(['30 days', '60 days', 'LC at sight', 'Advance payment']),
        paymentDueDate: faker_1.faker.date.future(),
        bankDetails: {
            bankName: faker_1.faker.company.name() + ' Bank',
            accountNumber: faker_1.faker.finance.accountNumber(),
            swiftCode: faker_1.faker.string.alphanumeric(11),
            iban: faker_1.faker.finance.iban(),
            correspondentBank: faker_1.faker.company.name() + ' Bank'
        },
        shippingDetails: {
            portOfLoading: faker_1.faker.location.city(),
            portOfDischarge: faker_1.faker.location.city(),
            finalDestination: faker_1.faker.location.city(),
            vesselName: faker_1.faker.company.name(),
            voyageNo: `V${faker_1.faker.string.numeric(4)}`,
            containerNo: `CONT${faker_1.faker.string.numeric(7)}`,
            sealNo: `SEAL${faker_1.faker.string.numeric(6)}`
        },
        status: faker_1.faker.helpers.arrayElement(['draft', 'sent', 'paid', 'cancelled', 'overdue']),
        notes: faker_1.faker.lorem.sentence(),
        termsAndConditions: faker_1.faker.lorem.paragraph(),
        createdBy: faker_1.faker.person.fullName(),
        approvedBy: faker_1.faker.person.fullName(),
        createdAt: faker_1.faker.date.past(),
        updatedAt: faker_1.faker.date.recent(),
        ...overrides
    };
};
exports.createInvoice = createInvoice;
const createRegistration = (productId, overrides) => {
    const applicationDate = faker_1.faker.date.past({ years: 2 });
    const approvalDate = faker_1.faker.date.between({ from: applicationDate, to: new Date() });
    const validFrom = approvalDate;
    const validTo = new Date(validFrom);
    validTo.setFullYear(validTo.getFullYear() + faker_1.faker.number.int({ min: 1, max: 5 }));
    return {
        id: (0, uuid_1.v4)(),
        country: faker_1.faker.location.country(),
        countryCode: faker_1.faker.location.countryCode(),
        productId: productId || (0, uuid_1.v4)(),
        registrationNo: `REG${faker_1.faker.string.numeric(8)}`,
        registrationType: faker_1.faker.helpers.arrayElement(['new', 'renewal', 'variation', 'extension']),
        dossierNo: `DOS${faker_1.faker.string.numeric(6)}`,
        dossierType: faker_1.faker.helpers.arrayElement(['CTD', 'ACTD', 'eCTD', 'national']),
        status: faker_1.faker.helpers.arrayElement(['pending', 'submitted', 'under_review', 'approved', 'rejected', 'expired', 'renewal_due']),
        applicationDate,
        approvalDate,
        validFrom,
        validTo,
        renewalDueDate: new Date(validTo.getTime() - 90 * 24 * 60 * 60 * 1000), // 90 days before expiry
        regulatoryAuthority: faker_1.faker.company.name() + ' Drug Authority',
        maHolder: faker_1.faker.company.name(),
        localAgent: {
            name: faker_1.faker.company.name(),
            address: faker_1.faker.location.streetAddress(),
            licenseNo: `LA${faker_1.faker.string.numeric(6)}`,
            contactPerson: faker_1.faker.person.fullName(),
            email: faker_1.faker.internet.email(),
            phone: faker_1.faker.phone.number()
        },
        fees: {
            applicationFee: faker_1.faker.number.int({ min: 1000, max: 50000 }),
            renewalFee: faker_1.faker.number.int({ min: 500, max: 25000 }),
            currency: 'USD',
            paidAmount: faker_1.faker.number.int({ min: 0, max: 50000 }),
            paymentStatus: faker_1.faker.helpers.arrayElement(['pending', 'partial', 'paid'])
        },
        documents: Array.from({ length: faker_1.faker.number.int({ min: 1, max: 10 }) }, () => ({
            documentType: faker_1.faker.helpers.arrayElement(['CTD Module 1', 'CTD Module 2', 'CTD Module 3', 'Certificate', 'License']),
            fileName: faker_1.faker.system.fileName(),
            uploadDate: faker_1.faker.date.past(),
            version: `v${faker_1.faker.number.int({ min: 1, max: 5 })}`,
            status: faker_1.faker.helpers.arrayElement(['draft', 'submitted', 'approved', 'rejected'])
        })),
        variations: [],
        inspections: [],
        remarks: faker_1.faker.lorem.sentence(),
        createdBy: faker_1.faker.person.fullName(),
        createdAt: faker_1.faker.date.past(),
        updatedAt: faker_1.faker.date.recent(),
        ...overrides
    };
};
exports.createRegistration = createRegistration;
const createExchangeRate = (overrides) => ({
    id: (0, uuid_1.v4)(),
    fromCurrency: 'USD',
    toCurrency: 'INR',
    rate: faker_1.faker.number.float({ min: 70, max: 85, fractionDigits: 4 }),
    effectiveDate: faker_1.faker.date.recent(),
    expiryDate: faker_1.faker.date.future(),
    source: faker_1.faker.helpers.arrayElement(['RBI', 'market', 'custom', 'bank']),
    isActive: true,
    createdAt: faker_1.faker.date.past(),
    updatedAt: faker_1.faker.date.recent(),
    ...overrides
});
exports.createExchangeRate = createExchangeRate;
const createCalculation = (overrides) => {
    const productCost = faker_1.faker.number.float({ min: 1000, max: 50000, fractionDigits: 2 });
    const packagingCost = faker_1.faker.number.float({ min: 100, max: 5000, fractionDigits: 2 });
    const inlandFreight = faker_1.faker.number.float({ min: 50, max: 1000, fractionDigits: 2 });
    const handlingCharges = faker_1.faker.number.float({ min: 50, max: 500, fractionDigits: 2 });
    const documentationCharges = faker_1.faker.number.float({ min: 50, max: 500, fractionDigits: 2 });
    const otherCharges = faker_1.faker.number.float({ min: 0, max: 1000, fractionDigits: 2 });
    const FOBTotal = productCost + packagingCost + inlandFreight + handlingCharges + documentationCharges + otherCharges;
    const freightCharges = faker_1.faker.number.float({ min: 500, max: 5000, fractionDigits: 2 });
    const insuranceCharges = faker_1.faker.number.float({ min: 100, max: 1000, fractionDigits: 2 });
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
            rate: faker_1.faker.helpers.arrayElement([0, 5, 12, 18, 28]),
            amount: (CIFTotal * faker_1.faker.helpers.arrayElement([0, 5, 12, 18, 28])) / 100,
            isLUT: faker_1.faker.datatype.boolean(),
            lutNo: `LUT${faker_1.faker.string.numeric(8)}`,
            lutValidUpto: faker_1.faker.date.future()
        },
        drawback: {
            scheme: faker_1.faker.helpers.arrayElement(['DBK', 'RoDTEP', 'RoSCTL', 'MEIS']),
            rate: faker_1.faker.number.float({ min: 0.5, max: 5, fractionDigits: 2 }),
            rateType: 'percentage',
            capAmount: faker_1.faker.number.float({ min: 1000, max: 10000, fractionDigits: 2 }),
            calculatedAmount: faker_1.faker.number.float({ min: 100, max: 5000, fractionDigits: 2 }),
            claimStatus: faker_1.faker.helpers.arrayElement(['eligible', 'claimed', 'received', 'rejected'])
        },
        RODTEP: {
            rate: faker_1.faker.number.float({ min: 0.1, max: 3, fractionDigits: 2 }),
            amount: faker_1.faker.number.float({ min: 100, max: 5000, fractionDigits: 2 }),
            certificateNo: `RODTEP${faker_1.faker.string.numeric(8)}`,
            claimDate: faker_1.faker.date.recent(),
            status: faker_1.faker.helpers.arrayElement(['pending', 'claimed', 'credited', 'utilized'])
        },
        profitMargin: {
            percentage: faker_1.faker.number.float({ min: 5, max: 30, fractionDigits: 2 }),
            amount: faker_1.faker.number.float({ min: 500, max: 10000, fractionDigits: 2 })
        },
        finalPrice: CIFTotal * faker_1.faker.number.float({ min: 1.1, max: 1.3, fractionDigits: 2 }),
        currency: 'USD',
        ...overrides
    };
};
exports.createCalculation = createCalculation;
//# sourceMappingURL=index.js.map