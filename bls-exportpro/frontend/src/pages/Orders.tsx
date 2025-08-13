import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/Button';
import { api } from '../services/api';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  FileText,
  Calendar,
  Building,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  Ship
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerCountry: string;
  orderDate: string;
  deliveryDate?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'partial' | 'paid';
  totalAmount: number;
  currency: 'USD' | 'INR';
  items: OrderItem[];
  shippingAddress: string;
  billingAddress: string;
  notes?: string;
}

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  hsCode?: string;
}

interface Customer {
  id: string;
  name: string;
  country: string;
  email: string;
  phone: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  hsCode: string;
  stock: number;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [formData, setFormData] = useState<Partial<Order>>({
    customerId: '',
    items: [],
    currency: 'USD',
    status: 'pending',
    paymentStatus: 'pending'
  });

  useEffect(() => {
    fetchOrders();
    fetchCustomers();
    fetchProducts();
  }, []);

  const fetchOrders = async () => {
    try {
      const resp = await api.get<any>('/invoice-generator/orders');
      // Backend returns { status, data, pagination }. API client unwraps to data.
      // Support both an array or object with array under common keys.
      const list: any[] = Array.isArray(resp)
        ? resp
        : (resp?.orders ?? resp?.data ?? resp?.results ?? []);

      const normalized: Order[] = (list as any[]).map((o: any) => ({
        id: o.id,
        orderNumber: o.orderNumber ?? o.order_number ?? o.number ?? 'ORD',
        customerId: o.customerId ?? o.customer_id,
        customerName: o.customerName ?? o.customer?.companyName ?? o.customer_name ?? '—',
        customerCountry: o.customerCountry ?? o.customer?.address?.country ?? o.customer_country ?? '—',
        orderDate: (o.orderDate ?? o.order_date ?? o.createdAt ?? o.created_at ?? new Date()).toString().split('T')[0],
        status: o.status ?? 'pending',
        totalAmount: o.totalAmount ?? o.total_amount ?? o.amount ?? 0,
        items: o.items ?? [],
        paymentStatus: o.paymentStatus ?? 'pending',
        currency: o.currency ?? 'USD',
        shippingAddress: o.shippingAddress ?? '—',
        billingAddress: o.billingAddress ?? '—'
      }));

      setOrders(normalized);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Fallback to mock data if API fails
      setOrders([
        {
          id: '1',
          orderNumber: 'ORD/2024/001',
          customerId: '1',
          customerName: 'Cambodia Pharma Ltd',
          customerCountry: 'Cambodia',
          orderDate: '2024-12-15',
          status: 'pending',
          totalAmount: 12500,
          items: [],
          paymentStatus: 'pending',
          currency: 'USD',
          shippingAddress: '—',
          billingAddress: '—'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const data = await api.get<Customer[]>('/customers');
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await api.get<Product[]>('/products');
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleCreateOrder = async () => {
    try {
      const orderData = {
        ...formData,
        orderDate: new Date().toISOString(),
        totalAmount: formData.items?.reduce((sum, item) => sum + item.totalPrice, 0) || 0
      };
      
      await api.post('/orders/create', orderData);
      await fetchOrders();
      setShowOrderForm(false);
      resetForm();
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await api.delete(`/orders/${orderId}`);
        await fetchOrders();
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    }
  };

  const handleGenerateInvoice = async (orderId: string) => {
    try {
      // Prefer SQLite-backed generator for PDF + record
      await api.post(`/invoice-generator/orders/${orderId}/generate`, { type: 'PROFORMA INVOICE' });
      alert('Invoice generated successfully!');
    } catch (error) {
      console.error('Error generating invoice:', error);
      // Fallback to repository based generation
      try {
        await api.post('/invoices/generate', { orderId, invoiceType: 'proforma' });
        alert('Invoice generated successfully!');
      } catch (e) {
        console.error('Fallback invoice generation failed:', e);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      items: [],
      currency: 'USD',
      status: 'pending',
      paymentStatus: 'pending'
    });
  };

  const addItemToOrder = () => {
    setFormData({
      ...formData,
      items: [
        ...(formData.items || []),
        {
          id: Date.now().toString(),
          productId: '',
          productName: '',
          quantity: 1,
          unitPrice: 0,
          totalPrice: 0
        }
      ]
    });
  };

  const updateOrderItem = (index: number, field: string, value: any) => {
    const newItems = [...(formData.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      if (product) {
        newItems[index].productName = product.name;
        newItems[index].unitPrice = product.price;
        newItems[index].hsCode = product.hsCode;
      }
    }
    
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].totalPrice = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const removeOrderItem = (index: number) => {
    const newItems = [...(formData.items || [])];
    newItems.splice(index, 1);
    setFormData({ ...formData, items: newItems });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-emerald-400';
      case 'shipped': return 'text-blue-400';
      case 'processing': return 'text-purple-400';
      case 'confirmed': return 'text-indigo-400';
      case 'pending': return 'text-yellow-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'shipped': return <Ship className="w-4 h-4" />;
      case 'processing': return <Package className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Orders</h1>
          <p className="text-gray-400 mt-1">Manage export orders and shipments</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="primary"
            onClick={() => setShowOrderForm(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Order</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-white">{orders.length}</p>
            </div>
            <Package className="w-8 h-8 text-blue-400" />
          </div>
        </GlassCard>
        
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Processing</p>
              <p className="text-2xl font-bold text-purple-400">
                {orders.filter(o => o.status === 'processing').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-purple-400" />
          </div>
        </GlassCard>
        
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Shipped</p>
              <p className="text-2xl font-bold text-blue-400">
                {orders.filter(o => o.status === 'shipped').length}
              </p>
            </div>
            <Ship className="w-8 h-8 text-blue-400" />
          </div>
        </GlassCard>
        
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Delivered</p>
              <p className="text-2xl font-bold text-emerald-400">
                {orders.filter(o => o.status === 'delivered').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
        </GlassCard>
      </div>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order number or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
              />
            </div>
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </GlassCard>

      {/* Orders Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-gray-400 font-medium">Order Number</th>
                <th className="text-left p-4 text-gray-400 font-medium">Customer</th>
                <th className="text-left p-4 text-gray-400 font-medium">Date</th>
                <th className="text-left p-4 text-gray-400 font-medium">Amount</th>
                <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                <th className="text-left p-4 text-gray-400 font-medium">Payment</th>
                <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-gray-400">Loading...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-gray-400">No orders found</td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-white font-medium">{order.orderNumber}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-white">{order.customerName}</p>
                        <p className="text-sm text-gray-400">{order.customerCountry}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2 text-gray-300">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(order.orderDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-1">
                        <span className="text-white font-medium">
                          {order.currency === 'USD' ? '$' : '₹'}
                          {order.totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className={`flex items-center space-x-2 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <StatusBadge 
                        status={order.paymentStatus === 'paid' ? 'active' : order.paymentStatus === 'partial' ? 'pending' : 'inactive'} 
                        label={order.paymentStatus}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowDetails(true);
                          }}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleGenerateInvoice(order.id)}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                          title="Generate Invoice"
                        >
                          <FileText className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                          title="Delete Order"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Create Order Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl max-h-[90vh] overflow-auto"
          >
            <GlassCard className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Create New Order</h2>
              
              <div className="space-y-6">
                {/* Customer Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Customer
                    </label>
                    <select
                      value={formData.customerId}
                      onChange={(e) => {
                        const customer = customers.find(c => c.id === e.target.value);
                        setFormData({ 
                          ...formData, 
                          customerId: e.target.value,
                          customerName: customer?.name || '',
                          customerCountry: customer?.country || ''
                        });
                      }}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    >
                      <option value="">Select a customer...</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} - {customer.country}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Currency
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value as 'USD' | 'INR' })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    >
                      <option value="USD">USD</option>
                      <option value="INR">INR</option>
                    </select>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-white">Order Items</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addItemToOrder}
                      className="flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Item</span>
                    </Button>
                  </div>
                  
                  {formData.items && formData.items.length > 0 ? (
                    <div className="space-y-4">
                      {formData.items.map((item, index) => (
                        <div key={item.id} className="bg-white/5 rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-2">
                              <label className="block text-sm text-gray-400 mb-1">Product</label>
                              <select
                                value={item.productId}
                                onChange={(e) => updateOrderItem(index, 'productId', e.target.value)}
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-white/40"
                              >
                                <option value="">Select product...</option>
                                {products.map((product) => (
                                  <option key={product.id} value={product.id}>
                                    {product.name} - {product.currency} {product.price}
                                  </option>
                                ))}
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-sm text-gray-400 mb-1">Quantity</label>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-white/40"
                              />
                            </div>
                            
                            <div className="flex items-end">
                              <div className="flex-1">
                                <label className="block text-sm text-gray-400 mb-1">Total</label>
                                <div className="px-3 py-2 bg-white/5 rounded-lg text-white">
                                  {formData.currency === 'USD' ? '$' : '₹'}{item.totalPrice.toLocaleString()}
                                </div>
                              </div>
                              <button
                                onClick={() => removeOrderItem(index)}
                                className="ml-2 p-2 text-red-400 hover:bg-white/10 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      No items added. Click "Add Item" to start.
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="flex justify-end">
                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-gray-400 mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-white">
                      {formData.currency === 'USD' ? '$' : '₹'}
                      {(formData.items?.reduce((sum, item) => sum + item.totalPrice, 0) || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowOrderForm(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleCreateOrder}
                    disabled={!formData.customerId || !formData.items?.length}
                  >
                    Create Order
                  </Button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}

      {/* Order Details Modal */}
      {showDetails && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl max-h-[90vh] overflow-auto"
          >
            <GlassCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Order Details</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Order Header */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Order Number</p>
                    <p className="text-white font-medium">{selectedOrder.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Order Date</p>
                    <p className="text-white">{new Date(selectedOrder.orderDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Status</p>
                    <div className={`flex items-center space-x-2 ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)}
                      <span className="capitalize">{selectedOrder.status}</span>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-3">Customer Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Name</p>
                      <p className="text-white">{selectedOrder.customerName}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Country</p>
                      <p className="text-white">{selectedOrder.customerCountry}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">Order Items</h3>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-left p-2 text-gray-400">Product</th>
                        <th className="text-right p-2 text-gray-400">Quantity</th>
                        <th className="text-right p-2 text-gray-400">Unit Price</th>
                        <th className="text-right p-2 text-gray-400">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, index) => (
                        <tr key={index} className="border-b border-white/10">
                          <td className="p-2 text-white">{item.productName}</td>
                          <td className="p-2 text-right text-gray-300">{item.quantity}</td>
                          <td className="p-2 text-right text-gray-300">
                            {selectedOrder.currency === 'USD' ? '$' : '₹'}{item.unitPrice}
                          </td>
                          <td className="p-2 text-right text-white">
                            {selectedOrder.currency === 'USD' ? '$' : '₹'}{item.totalPrice}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} className="p-2 text-right text-gray-400">Total Amount:</td>
                        <td className="p-2 text-right text-xl font-bold text-white">
                          {selectedOrder.currency === 'USD' ? '$' : '₹'}{selectedOrder.totalAmount.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowDetails(false)}
                  >
                    Close
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      handleGenerateInvoice(selectedOrder.id);
                      setShowDetails(false);
                    }}
                    className="flex items-center space-x-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Generate Invoice</span>
                  </Button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Orders;