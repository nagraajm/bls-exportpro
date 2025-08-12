import { repositories } from '../repositories';
import { v4 as uuidv4 } from 'uuid';

async function seedData() {
  console.log('🌱 Starting seed data creation...');
  
  // Create Customers
  const customers = [
    {
      companyName: 'Cambodia Pharma Ltd',
      contactPerson: 'John Doe',
      email: 'john@cambodiapharma.com',
      phone: '+855 23 123 456',
      address: {
        street: '123 Norodom Blvd',
        city: 'Phnom Penh',
        state: 'Phnom Penh',
        country: 'Cambodia',
        postalCode: '12000',
      },
      taxId: 'KH123456789',
      currency: 'USD' as const,
    },
    {
      companyName: 'Vietnam Medical Supplies',
      contactPerson: 'Nguyen Van A',
      email: 'nguyen@vnmedical.vn',
      phone: '+84 28 1234 5678',
      address: {
        street: '456 Le Duan St',
        city: 'Ho Chi Minh City',
        state: 'Ho Chi Minh',
        country: 'Vietnam',
        postalCode: '700000',
      },
      taxId: 'VN987654321',
      currency: 'USD' as const,
    },
  ];
  
  const createdCustomers = [];
  for (const customer of customers) {
    const created = await repositories.customer.create(customer);
    createdCustomers.push(created);
    console.log(`✅ Created customer: ${created.companyName}`);
  }
  
  // Create Products
  const products = [
    {
      productCode: 'PAR-500',
      brandName: 'Paracip',
      genericName: 'Paracetamol',
      strength: '500mg',
      dosageForm: 'Tablet',
      packSize: '10x10',
      manufacturer: 'Cipla Ltd',
      hsnCode: '30049099',
      unitPrice: 0.05,
      currency: 'USD' as const,
    },
    {
      productCode: 'AMX-500',
      brandName: 'Amoxil',
      genericName: 'Amoxicillin',
      strength: '500mg',
      dosageForm: 'Capsule',
      packSize: '10x10',
      manufacturer: 'GSK',
      hsnCode: '30041020',
      unitPrice: 0.08,
      currency: 'USD' as const,
    },
    {
      productCode: 'CIP-500',
      brandName: 'Ciplox',
      genericName: 'Ciprofloxacin',
      strength: '500mg',
      dosageForm: 'Tablet',
      packSize: '10x10',
      manufacturer: 'Cipla Ltd',
      hsnCode: '30042090',
      unitPrice: 0.10,
      currency: 'USD' as const,
    },
  ];
  
  const createdProducts = [];
  for (const product of products) {
    const created = await repositories.product.create(product);
    createdProducts.push(created);
    console.log(`✅ Created product: ${created.brandName} (${created.genericName})`);
  }
  
  // Create Suppliers
  const suppliers = [
    {
      companyName: 'Cipla Ltd',
      contactPerson: 'Rajesh Kumar',
      email: 'rajesh@cipla.com',
      phone: '+91 22 1234 5678',
      address: {
        street: 'Peninsula Business Park',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        postalCode: '400013',
      },
      taxId: 'AAACI1207E',
    },
    {
      companyName: 'GSK India',
      contactPerson: 'Priya Sharma',
      email: 'priya@gsk.com',
      phone: '+91 22 2345 6789',
      address: {
        street: 'Dr. Annie Besant Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        postalCode: '400030',
      },
      taxId: 'AAACG0569C',
    },
  ];
  
  const createdSuppliers = [];
  for (const supplier of suppliers) {
    const created = await repositories.supplier.create(supplier);
    createdSuppliers.push(created);
    console.log(`✅ Created supplier: ${created.companyName}`);
  }
  
  // Create Sample Order
  const sampleOrder = {
    customerId: createdCustomers[0].id,
    deliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    items: [
      {
        productId: createdProducts[0].id,
        quantity: 1000,
        unitPrice: 0.05,
        batchNumber: 'PAR2024001',
        expiryDate: new Date('2026-12-31'),
      },
      {
        productId: createdProducts[1].id,
        quantity: 500,
        unitPrice: 0.08,
        batchNumber: 'AMX2024001',
        expiryDate: new Date('2026-06-30'),
      },
    ],
    currency: 'USD' as const,
    shippingMarks: 'CAMBODIA PHARMA LTD\nPHNOM PENH\nFRAGILE - HANDLE WITH CARE',
    specialInstructions: 'Keep in cool and dry place',
  };
  
  // Create order using the order service (which will calculate totals)
  const { orderService } = await import('../services/order.service');
  const createdOrder = await orderService.createOrder(sampleOrder);
  console.log(`✅ Created sample order: ${createdOrder.orderNumber}`);
  
  console.log('\n🎉 Seed data created successfully!');
  console.log('\nYou can now test the APIs with:');
  console.log(`- Customer IDs: ${createdCustomers.map(c => c.id).join(', ')}`);
  console.log(`- Product IDs: ${createdProducts.map(p => p.id).join(', ')}`);
  console.log(`- Order ID: ${createdOrder.id}`);
}

// Run seed if called directly
if (require.main === module) {
  seedData()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Error seeding data:', error);
      process.exit(1);
    });
}

export default seedData;