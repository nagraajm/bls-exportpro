import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Plus, Trash2 } from 'lucide-react';

interface Product {
  id: string;
  brand_name: string;
  generic_name: string;
  unit_pack: string;
  rate_usd: number;
  batch_prefix: string;
}

interface Customer {
  id: string;
  company_name: string;
  city: string;
  country: string;
}

interface OrderItem {
  productId: string;
  quantity: number;
  productName?: string;
  rate?: number;
  amount?: number;
}

export const CreateOrder: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    customerId: '',
    orderNumber: '',
    orderDate: new Date().toISOString().split('T')[0],
    estimatedShipmentDate: ''
  });

  const [items, setItems] = useState<OrderItem[]>([
    { productId: '', quantity: 0 }
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, customersRes] = await Promise.all([
        fetch('/api/order-creation/products'),
        fetch('/api/order-creation/customers')
      ]);

      const productsData = await productsRes.json();
      const customersData = await customersRes.json();

      if (productsData.success) setProducts(productsData.data);
      if (customersData.success) setCustomers(customersData.data);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setItems([...items, { productId: '', quantity: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // If product is selected, update product details
    if (field === 'productId' && value) {
      const product = products.find(p => p.id === value);
      if (product) {
        updatedItems[index].productName = product.brand_name;
        updatedItems[index].rate = product.rate_usd;
        updatedItems[index].amount = product.rate_usd * (updatedItems[index].quantity || 0);
      }
    }

    // If quantity changes, recalculate amount
    if (field === 'quantity') {
      const item = updatedItems[index];
      if (item.rate) {
        item.amount = item.rate * value;
      }
    }

    setItems(updatedItems);
  };

  const getTotalAmount = () => {
    return items.reduce((total, item) => total + (item.amount || 0), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.customerId || !formData.orderNumber) {
      setError('Please fill in all required fields');
      return;
    }

    const validItems = items.filter(item => item.productId && item.quantity > 0);
    if (validItems.length === 0) {
      setError('Please add at least one item with valid product and quantity');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/order-creation/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          items: validItems
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(`Order created successfully! Order Number: ${data.data.orderNumber}`);
        // Reset form
        setFormData({
          customerId: '',
          orderNumber: '',
          orderDate: new Date().toISOString().split('T')[0],
          estimatedShipmentDate: ''
        });
        setItems([{ productId: '', quantity: 0 }]);
      } else {
        setError(data.message || 'Failed to create order');
      }
    } catch (err) {
      setError('Network error while creating order');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Order</h1>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-300 px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      <Card>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Order Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Customer *
                </label>
                <select
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.company_name} - {customer.city}, {customer.country}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Order Number *
                </label>
                <input
                  type="text"
                  value={formData.orderNumber}
                  onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., ORD-2025-004"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Order Date
                </label>
                <input
                  type="date"
                  value={formData.orderDate}
                  onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Estimated Shipment Date
                </label>
                <input
                  type="date"
                  value={formData.estimatedShipmentDate}
                  onChange={(e) => setFormData({ ...formData, estimatedShipmentDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Order Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Order Items</h3>
                <Button
                  type="button"
                  onClick={addItem}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                        Product
                      </label>
                      <select
                        value={item.productId}
                        onChange={(e) => updateItem(index, 'productId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
                                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Product</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.brand_name} - {product.generic_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity || ''}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                        Amount (INR)
                      </label>
                      <input
                        type="text"
                        value={item.amount ? `₹${item.amount.toFixed(2)}` : '₹0.00'}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                 bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white
                                 cursor-not-allowed"
                        readOnly
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        type="button"
                        onClick={() => removeItem(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        disabled={items.length <= 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-right">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  Total Amount: ₹{getTotalAmount().toFixed(2)}
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData({
                    customerId: '',
                    orderNumber: '',
                    orderDate: new Date().toISOString().split('T')[0],
                    estimatedShipmentDate: ''
                  });
                  setItems([{ productId: '', quantity: 0 }]);
                  setError(null);
                  setSuccess(null);
                }}
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={creating}
                className="bg-bls-primary hover:bg-bls-secondary"
              >
                {creating ? 'Creating Order...' : 'Create Order'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};