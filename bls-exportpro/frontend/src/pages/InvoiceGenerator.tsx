import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Table } from '../components/Table';
import { GlassCard } from '../components/ui/GlassCard';
import { DataGrid } from '../components/DataGrid';
import { api } from '../services/api';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle, 
  X,
  BarChart3,
  FileText,
  Package,
  Globe
} from 'lucide-react';

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
  const [success, setSuccess] = useState<string | null>(null);
  
  // Status file upload states
  const [isUploading, setIsUploading] = useState(false);
  const [showStatusUpload, setShowStatusUpload] = useState(false);
  const [uploadedData, setUploadedData] = useState<any>(null);
  const [uploadSummary, setUploadSummary] = useState<any>(null);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchOrders();
    fetchUploadedData();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<any>('/orders/list?status=confirmed');
      // Handle different response formats and ensure we always get an array
      const orderData = Array.isArray(response) ? response :
                       Array.isArray(response?.data) ? response.data :
                       Array.isArray(response?.orders) ? response.orders :
                       response?.data?.orders && Array.isArray(response.data.orders) ? response.data.orders : [];
      
      setOrders(orderData);
    } catch (err: any) {
      console.error('Failed to fetch orders:', err);
      setError(err?.message || 'Network error while fetching orders');
      setOrders([]); // Set empty array to prevent undefined
    } finally {
      setLoading(false);
    }
  };

  const fetchUploadedData = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/status-upload/data');
      const data = await response.json();
      if (data.success) {
        setUploadedData(data.data);
        setUploadSummary(data.summary);
        
        // Set first sheet as default if available
        if (data.data && Object.keys(data.data).length > 0) {
          setSelectedSheet(Object.keys(data.data)[0]);
        }
        
        // Fetch dashboard data
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Failed to fetch uploaded data:', err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/status-upload/dashboard');
      const data = await response.json();
      if (data.success) {
        setDashboardData(data.dashboard);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    }
  };

  const fetchOrderDetails = async (orderId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<any>(`/orders/${orderId}`);
      // Handle different response formats
      const orderData = response?.data ? response.data :
                       response?.order ? response.order : null;
                       
      if (!orderData) {
        throw new Error('Invalid order data received');
      }
      
      setSelectedOrder(orderData);
    } catch (err) {
      console.error('Failed to fetch order details:', err);
      setError('Network error while fetching order details');
      setSelectedOrder(null); // Clear selected order on error
    } finally {
      setLoading(false);
    }
  };

  const generateInvoice = async (orderId: string, type: 'PROFORMA INVOICE' | 'INVOICE') => {
    setGenerating(true);
    try {
      const data = await api.post<{ downloadUrl: string }>(`/orders/${orderId}/generate-invoice`, { type });
      // Open the PDF in a new tab
      window.open(`${API_BASE_URL}${data.downloadUrl}`, '_blank');
    } catch (err) {
      console.error('Failed to generate invoice:', err);
      setError('Network error while generating invoice');
    } finally {
      setGenerating(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5001/api/status-upload/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        setUploadedData(data.data);
        setUploadSummary(data.summary);
        
        // Set first sheet as selected
        if (data.data && Object.keys(data.data).length > 0) {
          setSelectedSheet(Object.keys(data.data)[0]);
        }
        
        setSuccess(`Successfully processed ${data.summary.totalRows} records from ${data.summary.totalSheets} sheets!`);
        fetchDashboardData();
        
        setTimeout(() => {
          setSuccess(null);
        }, 5000);
      } else {
        setError(data.message || 'Failed to upload file');
      }
    } catch (err) {
      setError('Network error while uploading file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
          <Button size="sm" onClick={() => fetchOrderDetails(row.id)}>
            View
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => generateInvoice(row.id, 'PROFORMA INVOICE')}
            disabled={generating}
          >
            Proforma
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => generateInvoice(row.id, 'INVOICE')}
            disabled={generating}
          >
            Invoice
          </Button>
        </div>
      ),
    },
  ];

  // Dynamic columns based on uploaded data
  const getUploadedDataColumns = () => {
    if (!uploadedData || !selectedSheet || !uploadedData[selectedSheet]?.length) {
      return [];
    }
    
    const firstRow = uploadedData[selectedSheet][0];
    const priorityFields = ['brandName', 'genericName', 'strength', 'dosageForm', 'status', 'registrationNumber'];
    const columns: any[] = [];
    
    // Add priority fields first
    priorityFields.forEach(field => {
      if (firstRow[field] !== undefined) {
        columns.push({
          key: field,
          label: field.replace(/([A-Z])/g, ' $1').trim().toUpperCase(),
          render: field === 'status' ? (value: string) => (
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              value === 'registered' || value === 'active' || value === 'approved' ? 'bg-green-100 text-green-800' :
              value === 'pending' || value === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
              value === 'expired' || value === 'rejected' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {value}
            </span>
          ) : undefined
        });
      }
    });
    
    // Add remaining fields (limit to prevent overflow)
    Object.keys(firstRow).forEach(key => {
      if (!priorityFields.includes(key) && 
          !['rowNumber', 'sheetName'].includes(key) && 
          columns.length < 8) {
        columns.push({
          key,
          label: key.replace(/([A-Z])/g, ' $1').trim().toUpperCase()
        });
      }
    });
    
    return columns;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Invoice Generator</h1>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowStatusUpload(!showStatusUpload)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Upload Status File
          </Button>
          <Button onClick={fetchOrders} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh Orders'}
          </Button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 px-4 py-3 rounded-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
          <button onClick={() => setError(null)} className="text-red-500 dark:text-red-400 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-300 px-4 py-3 rounded-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {success}
          </div>
          <button onClick={() => setSuccess(null)} className="text-green-500 dark:text-green-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Status File Upload Section */}
      {showStatusUpload && (
        <GlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5" />
                Upload Status File
              </h2>
              <Button variant="outline" size="sm" onClick={() => setShowStatusUpload(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Upload any Excel file with status data
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                    Supports .xlsx, .xls, and .csv files (up to 50MB)
                  </p>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="status-upload"
                  />
                  
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-2 mx-auto"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Choose File
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Dashboard Summary */}
              {dashboardData && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <h3 className="font-medium">Total Sheets</h3>
                    </div>
                    <p className="text-2xl font-bold">{dashboardData.overview?.totalSheets || 0}</p>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-5 h-5 text-green-600" />
                      <h3 className="font-medium">Total Records</h3>
                    </div>
                    <p className="text-2xl font-bold">{dashboardData.overview?.totalRecords || 0}</p>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                      <h3 className="font-medium">Status Types</h3>
                    </div>
                    <p className="text-2xl font-bold">{Object.keys(dashboardData.statusBreakdown || {}).length}</p>
                  </div>
                  
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-5 h-5 text-orange-600" />
                      <h3 className="font-medium">Last Updated</h3>
                    </div>
                    <p className="text-sm">
                      {dashboardData.overview?.lastUpdated 
                        ? new Date(dashboardData.overview.lastUpdated).toLocaleString()
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              )}

              {/* Sheet Selector and Data Display */}
              {uploadedData && Object.keys(uploadedData).length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="font-medium">Select Sheet:</label>
                    <select
                      value={selectedSheet}
                      onChange={(e) => setSelectedSheet(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                               bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      {Object.keys(uploadedData).map(sheetName => (
                        <option key={sheetName} value={sheetName}>
                          {sheetName} ({uploadedData[sheetName].length} records)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Data Table with new DataGrid component */}
                  {selectedSheet && uploadedData[selectedSheet] && (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <DataGrid
                        data={uploadedData[selectedSheet]}
                        title={`${selectedSheet} (${uploadedData[selectedSheet].length} records)`}
                        showSearch={true}
                        showExport={true}
                        pageSize={25}
                      />
                    </div>
                  )}

                  {/* Status Breakdown */}
                  {dashboardData?.statusBreakdown && Object.keys(dashboardData.statusBreakdown).length > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                      <h3 className="font-medium mb-3">Status Summary</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {Object.entries(dashboardData.statusBreakdown).map(([status, count]) => (
                          <div key={status} className="flex justify-between items-center p-2 
                                                     bg-white dark:bg-gray-900 rounded">
                            <span className="text-sm capitalize">{status}:</span>
                            <span className="font-bold">{count as number}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      )}

      {/* Orders Table */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Available Orders</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-500">Loading orders...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={fetchOrders}>Retry</Button>
            </div>
          ) : (
            <Table
              data={orders}
              columns={orderColumns}
              loading={loading}
              emptyMessage="No orders found"
            />
          )}
        </div>
      </Card>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Order Details</h2>
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Order Information</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Order Number:</span> {selectedOrder.order.order_number}</p>
                  <p><span className="font-medium">Date:</span> {new Date(selectedOrder.order.order_date).toLocaleDateString()}</p>
                  <p><span className="font-medium">Status:</span> {selectedOrder.order.status}</p>
                  <p><span className="font-medium">Total:</span> ₹{selectedOrder.order.total_amount.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Customer Information</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Company:</span> {selectedOrder.customer.company_name}</p>
                  <p><span className="font-medium">Contact:</span> {selectedOrder.customer.contact_person}</p>
                  <p><span className="font-medium">Address:</span> {selectedOrder.customer.address}</p>
                  <p><span className="font-medium">City:</span> {selectedOrder.customer.city}</p>
                  <p><span className="font-medium">Country:</span> {selectedOrder.customer.country}</p>
                </div>
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