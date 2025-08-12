import { Product, BatchInfo, Customer, Supplier, Invoice, Registration, ExchangeRate, Calculation } from '../index';
export declare const createProduct: (overrides?: Partial<Product>) => Product;
export declare const createBatchInfo: (productId?: string, overrides?: Partial<BatchInfo>) => BatchInfo;
export declare const createCustomer: (overrides?: Partial<Customer>) => Customer;
export declare const createSupplier: (overrides?: Partial<Supplier>) => Supplier;
export declare const createInvoice: (customerId?: string, overrides?: Partial<Invoice>) => Invoice;
export declare const createRegistration: (productId?: string, overrides?: Partial<Registration>) => Registration;
export declare const createExchangeRate: (overrides?: Partial<ExchangeRate>) => ExchangeRate;
export declare const createCalculation: (overrides?: Partial<Calculation>) => Calculation;
//# sourceMappingURL=index.d.ts.map