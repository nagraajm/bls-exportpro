import React, { useEffect, useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/Button';
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
  Pill
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  brandName: string;
  genericName: string;
  strength: string;
  dosageForm: string;
  packSize: string;
  category: string;
  price: number;
  currency: string;
  hsCode: string;
  manufacturingSite: string;
  stock: number;
  status: 'active' | 'inactive' | 'discontinued';
  cambodiaRegistrationStatus?: 'registered' | 'pending' | 'expired' | 'not-registered';
  cambodiaRegistrationNumber?: string;
  cambodiaRegistrationExpiry?: string;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showProductForm, setShowProductForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await api.get<Product[]>('/products');
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      // Mock data for demonstration
      setProducts([
        {
          id: '1',
          name: 'DOLO 650',
          brandName: 'DOLO 650',
          genericName: 'Paracetamol',
          strength: '650mg',
          dosageForm: 'Tablets',
          packSize: '10x10 Blisters',
          category: 'Analgesics',
          price: 45,
          currency: 'USD',
          hsCode: '3004.90.99',
          manufacturingSite: 'Site A - India',
          stock: 15000,
          status: 'active',
          cambodiaRegistrationStatus: 'registered',
          cambodiaRegistrationNumber: 'KH-1234-2023',
          cambodiaRegistrationExpiry: '2026-12-31'
        },
        {
          id: '2',
          name: 'AMOXICLAV 625',
          brandName: 'AMOXICLAV 625',
          genericName: 'Amoxicillin + Clavulanic Acid',
          strength: '500mg + 125mg',
          dosageForm: 'Tablets',
          packSize: '6x1x10 Strips',
          category: 'Antibiotics',
          price: 120,
          currency: 'USD',
          hsCode: '3004.10.00',
          manufacturingSite: 'Site B - India',
          stock: 8000,
          status: 'active',
          cambodiaRegistrationStatus: 'pending',
          cambodiaRegistrationNumber: '',
          cambodiaRegistrationExpiry: ''
        }
      ]);
    } finally {
      setLoading(false);
    }
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

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.hsCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Pharmaceutical Products</h1>
          <p className="text-gray-400 mt-1">Manage product master data and registrations</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowProductForm(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <p className="text-gray-400 text-sm">Active</p>
              <p className="text-2xl font-bold text-emerald-400">
                {products.filter(p => p.status === 'active').length}
              </p>
            </div>
            <Pill className="w-8 h-8 text-emerald-400" />
          </div>
        </GlassCard>
        
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Registered in Cambodia</p>
              <p className="text-2xl font-bold text-blue-400">
                {products.filter(p => p.cambodiaRegistrationStatus === 'registered').length}
              </p>
            </div>
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
        </GlassCard>
        
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Stock</p>
              <p className="text-2xl font-bold text-purple-400">
                {products.reduce((sum, p) => sum + p.stock, 0).toLocaleString()}
              </p>
            </div>
            <Package className="w-8 h-8 text-purple-400" />
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
                placeholder="Search by brand name, generic name, or HS code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
              />
            </div>
          </div>
          
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
                <th className="text-left p-4 text-gray-400 font-medium">Brand Name</th>
                <th className="text-left p-4 text-gray-400 font-medium">Generic Name</th>
                <th className="text-left p-4 text-gray-400 font-medium">Strength</th>
                <th className="text-left p-4 text-gray-400 font-medium">Pack Size</th>
                <th className="text-left p-4 text-gray-400 font-medium">HS Code</th>
                <th className="text-left p-4 text-gray-400 font-medium">Mfg Site</th>
                <th className="text-left p-4 text-gray-400 font-medium">Cambodia Reg.</th>
                <th className="text-left p-4 text-gray-400 font-medium">Stock</th>
                <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center p-8 text-gray-400">Loading...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center p-8 text-gray-400">No products found</td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4">
                      <div>
                        <p className="text-white font-medium">{product.brandName}</p>
                        <p className="text-sm text-gray-400">{product.dosageForm}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-gray-300">{product.genericName}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-gray-300">{product.strength}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-gray-300">{product.packSize}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-gray-300 font-mono text-sm">{product.hsCode}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-gray-300 text-sm">{product.manufacturingSite}</p>
                    </td>
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
                    <td className="p-4">
                      <p className="text-white font-medium">{product.stock.toLocaleString()}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowProductForm(true);
                          }}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                          title="View Registration"
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
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Brand Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      placeholder="e.g., DOLO 650"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Generic Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      placeholder="e.g., Paracetamol"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Strength
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      placeholder="e.g., 650mg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Dosage Form
                    </label>
                    <select className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40">
                      <option value="Tablets">Tablets</option>
                      <option value="Capsules">Capsules</option>
                      <option value="Syrup">Syrup</option>
                      <option value="Injection">Injection</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Pack Size
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      placeholder="e.g., 10x10 Blisters"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      HS Code
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      placeholder="e.g., 3004.90.99"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowProductForm(false);
                      setSelectedProduct(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button variant="primary">
                    {selectedProduct ? 'Update Product' : 'Add Product'}
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

export default Products;