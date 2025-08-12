export * from './base.repository';
export * from './order.repository';
export * from './invoice.repository';
export * from './product.repository';
export * from './customer.repository';
export * from './packing-list.repository';
export * from './purchase-order.repository';
export * from './regulatory.repository';
export * from './supplier.repository';

import { OrderRepository } from './order.repository';
import { InvoiceRepository } from './invoice.repository';
import { ProductRepository } from './product.repository';
import { CustomerRepository } from './customer.repository';
import { PackingListRepository } from './packing-list.repository';
import { PurchaseOrderRepository } from './purchase-order.repository';
import { RegulatoryRepository } from './regulatory.repository';
import { SupplierRepository } from './supplier.repository';

export const repositories = {
  order: new OrderRepository(),
  invoice: new InvoiceRepository(),
  product: new ProductRepository(),
  customer: new CustomerRepository(),
  packingList: new PackingListRepository(),
  purchaseOrder: new PurchaseOrderRepository(),
  regulatory: new RegulatoryRepository(),
  supplier: new SupplierRepository(),
};