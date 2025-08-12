import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/Button';
import { api } from '../services/api';
import {
  FileText,
  Download,
  Eye,
  Plus,
  Search,
  Filter,
  FileSpreadsheet,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Calendar,
  Building,
  Package
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceType: 'proforma' | 'pre-shipment' | 'post-shipment';
  orderId: string;
  customerName: string;
  customerCountry: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  currency: 'USD' | 'INR';
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
}

interface InvoiceItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerCountry: string;
  totalAmount: number;
  currency: 'USD' | 'INR';
  status: string;
}

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    fetchInvoices();
    fetchOrders();
  }, []);

  const fetchInvoices = async () => {
    try {
      const data = await api.get<Invoice[]>('/invoices');
      setInvoices(data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const data = await api.get<{ orders: Order[] }>('/orders/list');
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleGenerateInvoice = async (orderId: string, invoiceType: string) => {
    try {
      const response = await api.post<{ invoice: Invoice; pdfUrl: string }>('/invoices/generate', {
        orderId,
        invoiceType
      });
      
      await fetchInvoices();
      setShowGenerateForm(false);
      setSelectedInvoice(response.invoice);
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating invoice:', error);
    }
  };

  const handleDownloadPDF = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`);
      if (!response.ok) throw new Error('Failed to download PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await fetch('/api/reports/export/invoices', {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) throw new Error('Failed to export Excel');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoices-export-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting Excel:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-emerald-400';
      case 'pending': return 'text-yellow-400';
      case 'overdue': return 'text-red-400';
      case 'draft': return 'text-gray-400';
      case 'cancelled': return 'text-gray-500';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'overdue': return <AlertCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    const matchesType = filterType === 'all' || invoice.invoiceType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Invoices</h1>
          <p className="text-gray-400 mt-1">Manage and generate export invoices</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={handleExportExcel}
            className="flex items-center space-x-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowGenerateForm(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Invoice</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Invoices</p>
              <p className="text-2xl font-bold text-white">{invoices.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-400" />
          </div>
        </GlassCard>
        
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Paid</p>
              <p className="text-2xl font-bold text-emerald-400">
                {invoices.filter(i => i.status === 'paid').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
        </GlassCard>
        
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-2xl font-bold text-yellow-400">
                {invoices.filter(i => i.status === 'pending').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </GlassCard>
        
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Overdue</p>
              <p className="text-2xl font-bold text-red-400">
                {invoices.filter(i => i.status === 'overdue').length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-400" />
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
                placeholder="Search by invoice number or customer..."
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
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
          >
            <option value="all">All Types</option>
            <option value="proforma">Proforma</option>
            <option value="pre-shipment">Pre-shipment</option>
            <option value="post-shipment">Post-shipment</option>
          </select>
        </div>
      </GlassCard>

      {/* Invoices Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-gray-400 font-medium">Invoice Number</th>
                <th className="text-left p-4 text-gray-400 font-medium">Type</th>
                <th className="text-left p-4 text-gray-400 font-medium">Customer</th>
                <th className="text-left p-4 text-gray-400 font-medium">Date</th>
                <th className="text-left p-4 text-gray-400 font-medium">Amount</th>
                <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-gray-400">Loading...</td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-gray-400">No invoices found</td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <motion.tr
                    key={invoice.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-white font-medium">{invoice.invoiceNumber}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-300 capitalize">
                        {invoice.invoiceType.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-white">{invoice.customerName}</p>
                        <p className="text-sm text-gray-400">{invoice.customerCountry}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2 text-gray-300">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(invoice.invoiceDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-1">
                        <span className="text-white font-medium">
                          {invoice.currency === 'USD' ? '$' : '₹'}
                          {invoice.totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className={`flex items-center space-x-2 ${getStatusColor(invoice.status)}`}>
                        {getStatusIcon(invoice.status)}
                        <span className="capitalize">{invoice.status}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setShowPreview(true);
                          }}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(invoice.id)}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4 text-gray-400" />
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

      {/* Generate Invoice Modal */}
      {showGenerateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <GlassCard className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Generate Invoice</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Order
                  </label>
                  <select
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    onChange={(e) => {
                      // Handle order selection
                    }}
                  >
                    <option value="">Choose an order...</option>
                    {orders.map((order) => (
                      <option key={order.id} value={order.id}>
                        {order.orderNumber} - {order.customerName} ({order.currency} {order.totalAmount})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Invoice Type
                  </label>
                  <select
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                  >
                    <option value="proforma">Proforma Invoice</option>
                    <option value="pre-shipment">Pre-shipment Invoice</option>
                    <option value="post-shipment">Post-shipment Invoice</option>
                  </select>
                </div>
                
                <div className="flex justify-end space-x-4 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowGenerateForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      // Handle invoice generation
                      handleGenerateInvoice('order-id', 'proforma');
                    }}
                  >
                    Generate Invoice
                  </Button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}

      {/* Invoice Preview Modal */}
      {showPreview && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl max-h-[90vh] overflow-auto"
          >
            <GlassCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Invoice Preview</h2>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
              
              <div className="bg-white/5 rounded-lg p-6 space-y-6">
                {/* Invoice Header */}
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">BLS Trading Company</h3>
                    <p className="text-gray-400">Export Division</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{selectedInvoice.invoiceNumber}</p>
                    <p className="text-gray-400 capitalize">{selectedInvoice.invoiceType.replace('-', ' ')} Invoice</p>
                  </div>
                </div>
                
                {/* Customer Details */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Bill To</h4>
                    <p className="text-white font-medium">{selectedInvoice.customerName}</p>
                    <p className="text-gray-300">{selectedInvoice.customerCountry}</p>
                  </div>
                  <div className="text-right">
                    <div className="space-y-1">
                      <p className="text-gray-400">Invoice Date: <span className="text-white">{new Date(selectedInvoice.invoiceDate).toLocaleDateString()}</span></p>
                      <p className="text-gray-400">Due Date: <span className="text-white">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</span></p>
                    </div>
                  </div>
                </div>
                
                {/* Invoice Items */}
                <div>
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
                      {selectedInvoice.items.map((item, index) => (
                        <tr key={index} className="border-b border-white/10">
                          <td className="p-2 text-white">{item.productName}</td>
                          <td className="p-2 text-right text-gray-300">{item.quantity}</td>
                          <td className="p-2 text-right text-gray-300">
                            {selectedInvoice.currency === 'USD' ? '$' : '₹'}{item.unitPrice}
                          </td>
                          <td className="p-2 text-right text-white">
                            {selectedInvoice.currency === 'USD' ? '$' : '₹'}{item.totalPrice}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} className="p-2 text-right text-gray-400">Total Amount:</td>
                        <td className="p-2 text-right text-xl font-bold text-white">
                          {selectedInvoice.currency === 'USD' ? '$' : '₹'}{selectedInvoice.totalAmount.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(false)}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleDownloadPDF(selectedInvoice.id)}
                  className="flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Invoices;