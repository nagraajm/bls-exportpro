import React, { useEffect, useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ProductPricingModal } from '../components/ProductPricingModal';
import { ProductApprovalModal } from '../components/ProductApprovalModal';
import { api } from '../services/api';
import {
  Plus,
  Search,
  Filter,
  Package,
  Edit,
  Trash2,
  FileText,
  Shield,
  Calendar,
  Pill,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Settings
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Product {
  id: string;
  productCode: string;
  brandName: string;
  genericName: string;
  strength: string;
  dosageForm: string;
  packSize: string;
  manufacturer: string;
  hsnCode: string;
  category?: string;
  unitPrice?: number;
  currency?: string;
  manufacturingSite?: string;
  stock?: number;
  status?: 'active' | 'inactive' | 'discontinued';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvalDate?: string;
  cambodiaRegistrationStatus?: 'registered' | 'pending' | 'expired' | 'not-registered';
  cambodiaRegistrationNumber?: string;
  cambodiaRegistrationExpiry?: string;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterApprovalStatus, setFilterApprovalStatus] = useState('all');
  const [showProductForm, setShowProductForm] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [userRole, setUserRole] = useState<string>('admin'); // Set to admin for testing
  const [formData, setFormData] = useState({
    productCode: '',
    brandName: '',
    genericName: '',
    strength: '',
    dosageForm: 'Tablet',
    packSize: '',
    manufacturer: '',
    hsnCode: '',
    therapeuticCategory: '',
    unitPrice: '',
    storageConditions: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await api.get<Product[]>('/products');
      // Transform API data to match frontend interface
      const transformedData = data.map((product: any) => ({
        id: product.id,
        productCode: product.productCode || product.id.substring(0, 8),
        brandName: product.brand_name || product.brandName || 'N/A',
        genericName: product.generic_name || product.genericName || 'N/A',
        strength: product.strength || 'N/A',
        dosageForm: product.dosage_form || product.dosageForm || 'Tablet',
        packSize: product.unit_pack || product.packSize || product.pack_size || 'N/A',
        manufacturer: product.manufacturer || 'N/A',
        hsnCode: product.hs_code || product.hsnCode || 'N/A',
        category: product.therapeutic_category || product.category,
        unitPrice: (product.rate_usd || product.unitPrice) ? parseFloat(product.rate_usd || product.unitPrice) : undefined,
        currency: 'INR',
        approvalStatus: product.approvalStatus || 'approved', // Default to approved for existing data
        createdBy: product.createdBy || 'System',
        createdAt: product.createdAt || product.created_at || new Date().toISOString(),
        updatedAt: product.updatedAt || new Date().toISOString(),
        cambodiaRegistrationStatus: product.cambodiaRegistrationStatus,
        cambodiaRegistrationNumber: product.cambodiaRegistrationNumber,
        cambodiaRegistrationExpiry: product.cambodiaRegistrationExpiry
      }));
      setProducts(transformedData);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      // Mock data for demonstration with new structure
      setProducts([
        {
          id: '1',
          productCode: 'PAR650',
          brandName: 'DOLO 650',
          genericName: 'Paracetamol',
          strength: '650mg',
          dosageForm: 'Tablets',
          packSize: '10x10 Blisters',
          manufacturer: 'Micro Labs Ltd',
          hsnCode: '30049099',
          category: 'Analgesics',
          unitPrice: 45,
          currency: 'INR',
          stock: 15000,
          status: 'active',
          approvalStatus: 'approved',
          createdBy: 'Manager User',
          createdAt: '2025-01-15T10:00:00Z',
          updatedAt: '2025-01-15T10:00:00Z',
          approvedBy: 'Admin User',
          approvalDate: '2025-01-15T11:00:00Z',
          cambodiaRegistrationStatus: 'registered',
          cambodiaRegistrationNumber: 'KH-1234-2023',
          cambodiaRegistrationExpiry: '2026-12-31'
        },
        {
          id: '2',
          productCode: 'AMX625',
          brandName: 'AMOXICLAV 625',
          genericName: 'Amoxicillin + Clavulanic Acid',
          strength: '500mg + 125mg',
          dosageForm: 'Tablets',
          packSize: '6x1x10 Strips',
          manufacturer: 'Cipla Ltd',
          hsnCode: '30041020',
          category: 'Antibiotics',
          unitPrice: 120,
          currency: 'INR',
          stock: 8000,
          status: 'active',
          approvalStatus: 'pending',
          createdBy: 'Manager User',
          createdAt: '2025-01-20T09:00:00Z',
          updatedAt: '2025-01-20T09:00:00Z',
          cambodiaRegistrationStatus: 'pending',
          cambodiaRegistrationNumber: '',
          cambodiaRegistrationExpiry: ''
        },
        {
          id: '3',
          productCode: 'CIP500',
          brandName: 'CIPLOX 500',
          genericName: 'Ciprofloxacin',
          strength: '500mg',
          dosageForm: 'Tablets',
          packSize: '10x10 Strips',
          manufacturer: 'Cipla Ltd',
          hsnCode: '30042090',
          category: 'Antibiotics',
          unitPrice: 85,
          currency: 'INR',
          stock: 12000,
          status: 'active',
          approvalStatus: 'rejected',
          createdBy: 'Manager User',
          createdAt: '2025-01-18T14:00:00Z',
          updatedAt: '2025-01-18T15:30:00Z',
          cambodiaRegistrationStatus: 'not-registered'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        unitPrice: formData.unitPrice ? parseFloat(formData.unitPrice) : undefined,
        shelfLife: 24 // Default shelf life
      };

      if (selectedProduct) {
        // Update existing product
        await api.put(`/products/${selectedProduct.id}`, productData);
      } else {
        // Create new product
        await api.post('/products', productData);
      }

      // Refresh products list
      await fetchProducts();
      
      // Close form and reset
      setShowProductForm(false);
      setSelectedProduct(null);
      setFormData({
        productCode: '',
        brandName: '',
        genericName: '',
        strength: '',
        dosageForm: 'Tablet',
        packSize: '',
        manufacturer: '',
        hsnCode: '',
        therapeuticCategory: '',
        unitPrice: '',
        storageConditions: ''
      });
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Failed to save product. Please try again.');
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      productCode: product.productCode || '',
      brandName: product.brandName || '',
      genericName: product.genericName || '',
      strength: product.strength || '',
      dosageForm: product.dosageForm || 'Tablet',
      packSize: product.packSize || '',
      manufacturer: product.manufacturer || '',
      hsnCode: product.hsnCode || '',
      therapeuticCategory: product.category || '',
      unitPrice: product.unitPrice ? product.unitPrice.toString() : '',
      storageConditions: ''
    });
    setShowProductForm(true);
  };

  const handleCloseForm = () => {
    setShowProductForm(false);
    setSelectedProduct(null);
    setFormData({
      productCode: '',
      brandName: '',
      genericName: '',
      strength: '',
      dosageForm: 'Tablet',
      packSize: '',
      manufacturer: '',
      hsnCode: '',
      therapeuticCategory: '',
      unitPrice: '',
      storageConditions: ''
    });
  };

  const getRegistrationStatusColor = (status?: string) => {
    switch (status) {
      case 'registered': return 'text-emerald-400';
      case 'pending': return 'text-yellow-400';
      case 'expired': return 'text-red-400';
      case 'not-registered': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getRegistrationStatusIcon = (status?: string) => {
    switch (status) {
      case 'registered': return <Shield className="w-4 h-4" />;
      case 'pending': return <Calendar className="w-4 h-4" />;
      case 'expired': return <Calendar className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getApprovalStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <AlertCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredProducts = products.filter(product => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (product.brandName || '').toLowerCase().includes(searchTermLower) ||
      (product.genericName || '').toLowerCase().includes(searchTermLower) ||
      (product.hsnCode || '').toLowerCase().includes(searchTermLower) ||
      (product.productCode || '').toLowerCase().includes(searchTermLower);
    const matchesCategory = filterCategory === 'all' || (product.category && product.category === filterCategory);
    const matchesApprovalStatus = filterApprovalStatus === 'all' || (product.approvalStatus && product.approvalStatus === filterApprovalStatus);
    return matchesSearch && matchesCategory && matchesApprovalStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Pharmaceutical Products</h1>
          <p className="text-gray-400 mt-1">Manage product master data, pricing, and registrations</p>
        </div>
        <div className="flex items-center space-x-3">
          {userRole === 'admin' && (
            <Button
              variant="outline"
              onClick={() => setShowApprovalModal(true)}
              className="flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>Manage Approvals</span>
            </Button>
          )}
          {(userRole === 'admin' || userRole === 'manager') && (
            <Button
              variant="primary"
              onClick={() => setShowProductForm(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Products</p>
              <p className="text-2xl font-bold text-white">{products.length}</p>
            </div>
            <Package className="w-8 h-8 text-blue-400" />
          </div>
        </GlassCard>
        
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Approved</p>
              <p className="text-2xl font-bold text-emerald-400">
                {products.filter(p => p?.approvalStatus === 'approved').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
        </GlassCard>
        
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending Approval</p>
              <p className="text-2xl font-bold text-yellow-400">
                {products.filter(p => p?.approvalStatus === 'pending').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </GlassCard>
        
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Cambodia Registered</p>
              <p className="text-2xl font-bold text-blue-400">
                {products.filter(p => p?.cambodiaRegistrationStatus === 'registered').length}
              </p>
            </div>
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
        </GlassCard>
        
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">With Pricing</p>
              <p className="text-2xl font-bold text-purple-400">
                {products.filter(p => p?.unitPrice && p.unitPrice > 0).length}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-400" />
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
                placeholder="Search by brand name, generic name, product code, or HS code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
              />
            </div>
          </div>
          
          <select
            value={filterApprovalStatus}
            onChange={(e) => setFilterApprovalStatus(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
          >
            <option value="all">All Categories</option>
            <option value="Analgesics">Analgesics</option>
            <option value="Antibiotics">Antibiotics</option>
            <option value="Cardiovascular">Cardiovascular</option>
            <option value="Diabetes">Diabetes</option>
          </select>
        </div>
      </GlassCard>

      {/* Products Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-gray-400 font-medium">Product Details</th>
                <th className="text-left p-4 text-gray-400 font-medium">Specifications</th>
                <th className="text-left p-4 text-gray-400 font-medium">Manufacturer</th>
                <th className="text-left p-4 text-gray-400 font-medium">Approval Status</th>
                <th className="text-left p-4 text-gray-400 font-medium">Pricing</th>
                <th className="text-left p-4 text-gray-400 font-medium">Cambodia Reg.</th>
                <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-gray-400">Loading...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-gray-400">No products found</td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    {/* Product Details */}
                    <td className="p-4">
                      <div>
                        <p className="text-white font-medium">{product.brandName || 'N/A'}</p>
                        <p className="text-sm text-gray-400">{product.genericName || 'N/A'}</p>
                        <p className="text-xs text-gray-500">Code: {product.productCode || 'N/A'}</p>
                      </div>
                    </td>

                    {/* Specifications */}
                    <td className="p-4">
                      <div className="text-sm">
                        <p className="text-gray-300">{(product.strength || 'N/A')} | {(product.dosageForm || 'N/A')}</p>
                        <p className="text-gray-400">{product.packSize || 'N/A'}</p>
                        <p className="text-gray-400 font-mono">HS: {product.hsnCode || 'N/A'}</p>
                      </div>
                    </td>

                    {/* Manufacturer */}
                    <td className="p-4">
                      <p className="text-gray-300 text-sm">{product.manufacturer || 'N/A'}</p>
                    </td>

                    {/* Approval Status */}
                    <td className="p-4">
                      <StatusBadge 
                        variant={getApprovalStatusColor(product.approvalStatus || 'pending')}
                        icon={getApprovalStatusIcon(product.approvalStatus || 'pending')}
                      >
                        {product.approvalStatus || 'pending'}
                      </StatusBadge>
                    </td>

                    {/* Pricing */}
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        {product.unitPrice ? (
                          <div>
                            <p className="text-white font-medium">₹{product.unitPrice.toFixed(2)}</p>
                            <p className="text-xs text-gray-400">Current Price</p>
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">No pricing</p>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowPricingModal(true);
                          }}
                          className="flex items-center space-x-1"
                        >
                          <DollarSign className="w-4 h-4" />
                          <span>Manage Pricing</span>
                        </Button>
                      </div>
                    </td>

                    {/* Cambodia Registration */}
                    <td className="p-4">
                      <div className={`flex items-center space-x-2 ${getRegistrationStatusColor(product.cambodiaRegistrationStatus)}`}>
                        {getRegistrationStatusIcon(product.cambodiaRegistrationStatus)}
                        <div>
                          <p className="capitalize text-sm">{product.cambodiaRegistrationStatus || 'Not registered'}</p>
                          {product.cambodiaRegistrationNumber && (
                            <p className="text-xs text-gray-500">{product.cambodiaRegistrationNumber}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        {(userRole === 'admin' || userRole === 'manager') && (
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-gray-400" />
                          </button>
                        )}
                        <button
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                          title="View Details"
                        >
                          <FileText className="w-4 h-4 text-gray-400" />
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

      {/* Product Form Modal */}
      {showProductForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-auto"
          >
            <GlassCard className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                {selectedProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Product Code *
                    </label>
                    <input
                      type="text"
                      value={formData.productCode}
                      onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 placeholder-gray-400"
                      placeholder="e.g., PAR650"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Brand Name *
                    </label>
                    <input
                      type="text"
                      value={formData.brandName}
                      onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 placeholder-gray-400"
                      placeholder="e.g., DOLO 650"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Generic Name *
                    </label>
                    <input
                      type="text"
                      value={formData.genericName}
                      onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 placeholder-gray-400"
                      placeholder="e.g., Paracetamol"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Strength *
                    </label>
                    <input
                      type="text"
                      value={formData.strength}
                      onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 placeholder-gray-400"
                      placeholder="e.g., 650mg"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Dosage Form *
                    </label>
                    <select 
                      value={formData.dosageForm}
                      onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      required
                    >
                      <option value="Tablet">Tablet</option>
                      <option value="Capsule">Capsule</option>
                      <option value="Syrup">Syrup</option>
                      <option value="Injection">Injection</option>
                      <option value="Cream">Cream</option>
                      <option value="Ointment">Ointment</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Pack Size *
                    </label>
                    <input
                      type="text"
                      value={formData.packSize}
                      onChange={(e) => setFormData({ ...formData, packSize: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 placeholder-gray-400"
                      placeholder="e.g., 10x10 Blisters"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Manufacturer *
                    </label>
                    <input
                      type="text"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 placeholder-gray-400"
                      placeholder="e.g., Cipla Ltd"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      HSN Code *
                    </label>
                    <input
                      type="text"
                      value={formData.hsnCode}
                      onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 placeholder-gray-400"
                      placeholder="e.g., 30049099"
                      pattern="[0-9]{4,8}"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Therapeutic Category
                    </label>
                    <select 
                      value={formData.therapeuticCategory}
                      onChange={(e) => setFormData({ ...formData, therapeuticCategory: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    >
                      <option value="">Select Category</option>
                      <option value="Analgesics">Analgesics</option>
                      <option value="Antibiotics">Antibiotics</option>
                      <option value="Cardiovascular">Cardiovascular</option>
                      <option value="Diabetes">Diabetes</option>
                      <option value="Respiratory">Respiratory</option>
                      <option value="Dermatology">Dermatology</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Unit Price (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.unitPrice}
                      onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 placeholder-gray-400"
                      placeholder="e.g., 45.50"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseForm}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    variant="primary"
                  >
                    {selectedProduct ? 'Update Product' : 'Add Product'}
                  </Button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      )}

      {/* Pricing Modal */}
      <ProductPricingModal
        productId={selectedProduct?.id || ''}
        productName={selectedProduct?.brandName || ''}
        isOpen={showPricingModal}
        onClose={() => {
          setShowPricingModal(false);
          setSelectedProduct(null);
        }}
      />

      {/* Approval Modal */}
      <ProductApprovalModal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        userRole={userRole}
      />
    </div>
  );
};

export default Products;