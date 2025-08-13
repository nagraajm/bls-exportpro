import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Table } from '../components/Table';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_city: string;
  customer_country: string;
  total_amount: number;
  order_date: string;
  status: string;
  items_count: number;
}

interface OrderDetails {
  order: Order & {
    company_name: string;
    address: string;
    city: string;
    country: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    rate_usd: number;
    amount: number;
    brand_name: string;
    generic_name: string;
    unit_pack: string;
    batch_number: string;
  }>;
  customer: {
    company_name: string;
    contact_person: string;
    address: string;
    city: string;
    country: string;
  };
}

export const InvoiceGenerator: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/invoice-generator/orders');
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
      } else {
        setError('Failed to fetch orders');
      }
    } catch (err) {
      setError('Network error while fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/invoice-generator/orders/${orderId}`);
      const data = await response.json();
      if (data.success) {
        setSelectedOrder(data.data);
      } else {
        setError('Failed to fetch order details');
      }
    } catch (err) {
      setError('Network error while fetching order details');
    } finally {
      setLoading(false);
    }
  };

  const generateInvoice = async (orderId: string, type: 'PROFORMA INVOICE' | 'INVOICE') => {
    setGenerating(true);
    try {
      const response = await fetch(`/api/invoice-generator/orders/${orderId}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });
      
      const data = await response.json();
      if (data.success) {
        // Open the PDF in a new tab
        window.open(`${data.data.downloadUrl}`, '_blank');
      } else {
        setError('Failed to generate invoice');
      }
    } catch (err) {
      setError('Network error while generating invoice');
    } finally {
      setGenerating(false);
    }
  };

  const orderColumns = [
    { key: 'order_number', label: 'Order Number' },
    { key: 'customer_name', label: 'Customer' },
    { key: 'customer_country', label: 'Country' },
    { key: 'total_amount', label: 'Amount (INR)', render: (value: number) => `₹${value.toFixed(2)}` },
    { key: 'order_date', label: 'Order Date', render: (value: string) => new Date(value).toLocaleDateString() },
    { key: 'status', label: 'Status' },
    { key: 'items_count', label: 'Items' },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, row: Order) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => fetchOrderDetails(row.id)}
          >
            View Details
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => generateInvoice(row.id, 'PROFORMA INVOICE')}
            disabled={generating}
          >
            {generating ? 'Generating...' : 'Proforma Invoice'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => generateInvoice(row.id, 'INVOICE')}
            disabled={generating}
          >
            {generating ? 'Generating...' : 'Commercial Invoice'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Invoice Generator</h1>
        <Button onClick={fetchOrders} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh Orders'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 px-4 py-3 rounded-md">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          >
            ✕
          </button>
        </div>
      )}

      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Available Orders</h2>
          <Table
            data={orders}
            columns={orderColumns}
            loading={loading}
            emptyMessage="No orders found"
          />
        </div>
      </Card>

      {selectedOrder && (
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Order Details</h2>
              <Button
                variant="outline"
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Order Information</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Order Number:</span> {selectedOrder.order.order_number}</p>
                  <p><span className="font-medium">Date:</span> {new Date(selectedOrder.order.order_date).toLocaleDateString()}</p>
                  <p><span className="font-medium">Status:</span> {selectedOrder.order.status}</p>
                  <p><span className="font-medium">Total:</span> ₹{selectedOrder.order.total_amount.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Customer Information</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Company:</span> {selectedOrder.customer.company_name}</p>
                  <p><span className="font-medium">Contact:</span> {selectedOrder.customer.contact_person}</p>
                  <p><span className="font-medium">Address:</span> {selectedOrder.customer.address}</p>
                  <p><span className="font-medium">City:</span> {selectedOrder.customer.city}</p>
                  <p><span className="font-medium">Country:</span> {selectedOrder.customer.country}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Order Items</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Pack</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate (INR)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedOrder.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.brand_name}
                          <br />
                          <span className="text-gray-500 font-normal">({item.generic_name})</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.unit_pack}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{item.rate_usd.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{item.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                onClick={() => generateInvoice(selectedOrder.order.id, 'PROFORMA INVOICE')}
                disabled={generating}
                className="flex-1"
              >
                {generating ? 'Generating...' : 'Generate Proforma Invoice'}
              </Button>
              <Button
                onClick={() => generateInvoice(selectedOrder.order.id, 'INVOICE')}
                disabled={generating}
                variant="outline"
                className="flex-1"
              >
                {generating ? 'Generating...' : 'Generate Commercial Invoice'}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};