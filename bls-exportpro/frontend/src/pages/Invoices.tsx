import React, { useState, useEffect, useRef } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/Button';
import { ImportPreviewModal } from '../components/ImportPreviewModal';
import { api } from '../services/api';
import * as XLSX from 'xlsx';
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
  Package,
  Upload
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

interface ImportData {
  invoiceNumber: string;
  invoiceType: string;
  customerName: string;
  customerCountry: string;
  invoiceDate: string;
  dueDate?: string;
  totalAmount: number;
  currency: string;
  status: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
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
  
  // Import states
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [importData, setImportData] = useState<ImportData[]>([]);
  const [importLoading, setImportLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchInvoices();
    fetchOrders();
  }, []);

  const fetchInvoices = async () => {
    try {
      const resp = await api.get<any>('/invoice-generator/invoices');
      const rawList: any[] = Array.isArray(resp) ? resp : (resp?.invoices ?? resp?.data ?? []);
      const normalized: Invoice[] = rawList.map((inv: any) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber ?? inv.invoice_number ?? 'INV',
        invoiceType: (inv.invoiceType ?? inv.invoice_type ?? 'proforma') as any,
        orderId: inv.orderId ?? inv.order_id,
        customerName: inv.customerName ?? inv.customer_name ?? inv.order?.customerName ?? '—',
        customerCountry: inv.customerCountry ?? inv.customer_country ?? inv.order?.customerCountry ?? '—',
        invoiceDate: (inv.invoiceDate ?? inv.invoice_date ?? inv.createdAt ?? inv.created_at ?? new Date()).toString().split('T')[0],
        dueDate: (inv.dueDate ?? inv.due_date ?? new Date()).toString().split('T')[0],
        totalAmount: inv.totalAmount ?? inv.total_amount ?? inv.amount ?? 0,
        currency: (inv.currency ?? 'USD') as 'USD' | 'INR',
        status: (inv.status ?? 'pending') as any,
        items: (inv.items ?? []).map((it: any) => ({
          productName: it.productName ?? it.product?.brandName ?? it.brand_name ?? 'Item',
          quantity: it.quantity ?? 0,
          unitPrice: it.unitPrice ?? it.rate_usd ?? 0,
          totalPrice: it.totalPrice ?? it.amount ?? (it.quantity ?? 0) * (it.unitPrice ?? it.rate_usd ?? 0)
        }))
      }));

      setInvoices(normalized);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      // Fallback to mock data if API fails
      setInvoices([
        {
          id: '1',
          invoiceNumber: 'INV/2024/001',
          invoiceType: 'proforma',
          orderId: '1',
          customerName: 'Mock Customer',
          customerCountry: 'Mock Country',
          invoiceDate: '2024-12-15',
          dueDate: '2024-12-30',
          totalAmount: 12500,
          currency: 'USD',
          status: 'pending',
          items: [
            { productName: 'Mock Item 1', quantity: 10, unitPrice: 100, totalPrice: 1000 },
            { productName: 'Mock Item 2', quantity: 5, unitPrice: 200, totalPrice: 1000 }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      // Prefer SQLite-backed endpoint
      const resp = await api.get<any>('/invoice-generator/orders');
      const rawList = Array.isArray(resp) ? resp : (resp?.data ?? []);
      const mapped: Order[] = (rawList as any[]).map((o: any) => ({
        id: o.id,
        orderNumber: o.order_number ?? o.orderNumber,
        customerName: o.customer_name ?? o.customerName,
        customerCountry: o.customer_country ?? o.customerCountry,
        totalAmount: o.total_amount ?? o.totalAmount ?? 0,
        currency: o.currency ?? 'INR',
        status: o.status ?? 'pending',
      }));
      setOrders(mapped);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleImportExcel = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/invoices/import/template');
      if (!response.ok) throw new Error('Failed to download template');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'invoice-import-template.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading template:', error);
      alert('Error downloading template. Please try again.');
    }
  };

  const parseExcelFile = (file: File): Promise<ImportData[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          // Skip header row and parse data
          const parsedData: ImportData[] = [];
          
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i] as any[];
            if (!row[0]) continue; // Skip empty rows
            
            const invoiceData: ImportData = {
              invoiceNumber: String(row[0] || '').trim(),
              invoiceType: String(row[1] || 'proforma').toLowerCase(),
              customerName: String(row[2] || '').trim(),
              customerCountry: String(row[3] || '').trim(),
              invoiceDate: String(row[4] || new Date().toISOString().split('T')[0]),
              dueDate: row[5] ? String(row[5]) : undefined,
              totalAmount: Number(row[6]) || 0,
              currency: String(row[7] || 'USD').toUpperCase(),
              status: String(row[8] || 'pending').toLowerCase(),
              items: []
            };
            
            // Parse items if available (columns 9+)
            if (row[9]) {
              invoiceData.items.push({
                productName: String(row[9] || '').trim(),
                quantity: Number(row[10]) || 0,
                unitPrice: Number(row[11]) || 0,
                totalPrice: Number(row[12]) || 0
              });
            }
            
            parsedData.push(invoiceData);
          }
          
          resolve(parsedData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      alert('Please select a valid Excel file (.xlsx or .xls)');
      return;
    }
    
    try {
      const parsedData = await parseExcelFile(file);
      setImportData(parsedData);
      setShowImportPreview(true);
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      alert('Error parsing Excel file. Please check the file format.');
    }
    
    // Reset file input
    event.target.value = '';
  };

  const handleConfirmImport = async () => {
    setImportLoading(true);
    
    try {
      const response = await api.post<{
        success: boolean;
        totalRecords: number;
        successfulRecords: number;
        failedRecords: number;
        errors?: Array<{
          row: number;
          field: string;
          message: string;
        }>;
      }>('/invoices/import', {
        invoices: importData
      });
      
      if (response.success) {
        alert(`Successfully imported ${response.successfulRecords} invoices. ${response.failedRecords} failed.`);
        await fetchInvoices(); // Refresh the invoice list
        setShowImportPreview(false);
        setImportData([]);
      } else {
        alert('Import failed. Please check the data and try again.');
      }
    } catch (error) {
      console.error('Error importing invoices:', error);
      alert('Error importing invoices. Please try again.');
    } finally {
      setImportLoading(false);
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
            onClick={handleImportExcel}
            className="flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Import Excel</span>
          </Button>
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

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileSelect}
        className="hidden"
      />

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

      {/* Import Preview Modal */}
      <ImportPreviewModal
        isOpen={showImportPreview}
        onClose={() => setShowImportPreview(false)}
        onConfirm={handleConfirmImport}
        data={importData}
        loading={importLoading}
      />
    </div>
  );
};

export default Invoices;