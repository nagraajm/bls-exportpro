import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from './ui/GlassCard';
import { Button } from './Button';
import { StatusBadge } from './ui/StatusBadge';
import { api } from '../services/api';
import { X, CheckCircle, XCircle, Clock, User } from 'lucide-react';

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
  approvalStatus: 'pending' | 'approved' | 'rejected';
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvalDate?: string;
  rejectionReason?: string;
}

interface ProductApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
}

export const ProductApprovalModal: React.FC<ProductApprovalModalProps> = ({
  isOpen,
  onClose,
  userRole
}) => {
  const [pendingProducts, setPendingProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (isOpen && userRole === 'admin') {
      fetchPendingProducts();
    }
  }, [isOpen, userRole]);

  const fetchPendingProducts = async () => {
    setLoading(true);
    try {
      const data = await api.get('/products/admin/pending-approvals');
      setPendingProducts(data.data || []);
    } catch (error) {
      console.error('Failed to fetch pending products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (productId: string) => {
    try {
      await api.patch(`/products/${productId}/approve`);
      await fetchPendingProducts();
      setSelectedProduct(null);
    } catch (error) {
      console.error('Failed to approve product:', error);
    }
  };

  const handleReject = async (productId: string) => {
    try {
      await api.patch(`/products/${productId}/reject`, {
        reason: rejectionReason
      });
      await fetchPendingProducts();
      setSelectedProduct(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Failed to reject product:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (!isOpen || userRole !== 'admin') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-6xl max-h-[90vh] overflow-auto"
      >
        <GlassCard className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Product Approvals</h2>
              <p className="text-gray-400">Review and approve pending product entries</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Loading pending products...</p>
            </div>
          ) : pendingProducts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              <p className="text-white text-lg font-medium">All caught up!</p>
              <p className="text-gray-400">No products pending approval</p>
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <GlassCard className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Pending Approval</p>
                      <p className="text-2xl font-bold text-yellow-400">{pendingProducts.length}</p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-400" />
                  </div>
                </GlassCard>
              </div>

              {/* Products Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-4 text-gray-400 font-medium">Product Details</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Specifications</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Created By</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingProducts.map((product) => (
                      <tr key={product.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div>
                            <p className="text-white font-medium">{product.brandName}</p>
                            <p className="text-gray-400 text-sm">{product.genericName}</p>
                            <p className="text-gray-500 text-xs">Code: {product.productCode}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            <p className="text-gray-300">{product.strength} | {product.dosageForm}</p>
                            <p className="text-gray-400">{product.packSize}</p>
                            <p className="text-gray-400">HS: {product.hsnCode}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-gray-300 text-sm">{product.createdBy}</p>
                              <p className="text-gray-500 text-xs">
                                {new Date(product.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <StatusBadge 
                            variant={getStatusColor(product.approvalStatus)}
                            icon={getStatusIcon(product.approvalStatus)}
                          >
                            {product.approvalStatus}
                          </StatusBadge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleApprove(product.id)}
                              className="flex items-center space-x-1"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>Approve</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedProduct(product)}
                              className="flex items-center space-x-1"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Reject</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Rejection Modal */}
          {selectedProduct && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md mx-4"
              >
                <GlassCard className="p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Reject Product</h3>
                  <p className="text-gray-400 mb-4">
                    Are you sure you want to reject "{selectedProduct.brandName}"?
                  </p>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Rejection Reason
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      rows={3}
                      placeholder="Please provide a reason for rejection..."
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedProduct(null);
                        setRejectionReason('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => handleReject(selectedProduct.id)}
                      disabled={!rejectionReason.trim()}
                    >
                      Reject Product
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
};