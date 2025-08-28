import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from './ui/GlassCard';
import { Button } from './Button';
import { api } from '../services/api';
import { X, Plus, DollarSign, TrendingUp, Calendar } from 'lucide-react';

interface ProductPricing {
  id?: string;
  priceType: 'selling' | 'procurement' | 'market';
  basePrice: number;
  effectiveFrom: string;
  effectiveTo?: string;
  margin?: number;
  notes?: string;
  isActive: boolean;
  approvedBy?: string;
}

interface ProductPricingModalProps {
  productId: string;
  productName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductPricingModal: React.FC<ProductPricingModalProps> = ({
  productId,
  productName,
  isOpen,
  onClose
}) => {
  const [pricingHistory, setPricingHistory] = useState<ProductPricing[]>([]);
  const [showAddPricing, setShowAddPricing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newPricing, setNewPricing] = useState<Partial<ProductPricing>>({
    priceType: 'selling',
    basePrice: 0,
    effectiveFrom: new Date().toISOString().split('T')[0],
    margin: 0,
    notes: ''
  });

  useEffect(() => {
    if (isOpen && productId) {
      fetchPricingHistory();
    }
  }, [isOpen, productId]);

  const fetchPricingHistory = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/product-pricing/product/${productId}/history`);
      setPricingHistory(data.data || []);
    } catch (error) {
      console.error('Failed to fetch pricing history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPricing = async () => {
    try {
      await api.post('/product-pricing', {
        productId,
        ...newPricing,
        effectiveFrom: new Date(newPricing.effectiveFrom!).toISOString()
      });
      setShowAddPricing(false);
      setNewPricing({
        priceType: 'selling',
        basePrice: 0,
        effectiveFrom: new Date().toISOString().split('T')[0],
        margin: 0,
        notes: ''
      });
      fetchPricingHistory();
    } catch (error) {
      console.error('Failed to add pricing:', error);
    }
  };

  const getPriceTypeColor = (type: string) => {
    switch (type) {
      case 'selling': return 'text-emerald-400 bg-emerald-400/10';
      case 'procurement': return 'text-blue-400 bg-blue-400/10';
      case 'market': return 'text-purple-400 bg-purple-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getPriceTypeIcon = (type: string) => {
    switch (type) {
      case 'selling': return <DollarSign className="w-4 h-4" />;
      case 'procurement': return <TrendingUp className="w-4 h-4" />;
      case 'market': return <Calendar className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-auto"
      >
        <GlassCard className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Product Pricing</h2>
              <p className="text-gray-400">{productName}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="primary"
                onClick={() => setShowAddPricing(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Pricing</span>
              </Button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Add Pricing Form */}
          {showAddPricing && (
            <GlassCard className="p-4 mb-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Add New Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Price Type
                  </label>
                  <select
                    value={newPricing.priceType}
                    onChange={(e) => setNewPricing({ ...newPricing, priceType: e.target.value as any })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                  >
                    <option value="selling">Selling Price</option>
                    <option value="procurement">Procurement Price</option>
                    <option value="market">Market Price</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Base Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPricing.basePrice}
                    onChange={(e) => setNewPricing({ ...newPricing, basePrice: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Effective From
                  </label>
                  <input
                    type="date"
                    value={newPricing.effectiveFrom}
                    onChange={(e) => setNewPricing({ ...newPricing, effectiveFrom: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Margin (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newPricing.margin}
                    onChange={(e) => setNewPricing({ ...newPricing, margin: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    placeholder="0.0"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={newPricing.notes}
                    onChange={(e) => setNewPricing({ ...newPricing, notes: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    rows={2}
                    placeholder="Additional notes about this pricing..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAddPricing(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleAddPricing}
                >
                  Add Pricing
                </Button>
              </div>
            </GlassCard>
          )}

          {/* Pricing History */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Pricing History</h3>
            
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-400">Loading pricing history...</p>
              </div>
            ) : pricingHistory.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No pricing history available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pricingHistory.map((pricing) => (
                  <GlassCard key={pricing.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getPriceTypeColor(pricing.priceType)}`}>
                          {getPriceTypeIcon(pricing.priceType)}
                          <span className="text-sm font-medium capitalize">{pricing.priceType}</span>
                        </div>
                        
                        <div>
                          <p className="text-2xl font-bold text-white">₹{pricing.basePrice.toFixed(2)}</p>
                          {pricing.margin && (
                            <p className="text-sm text-gray-400">Margin: {pricing.margin}%</p>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-white font-medium">
                          From: {new Date(pricing.effectiveFrom).toLocaleDateString()}
                        </p>
                        {pricing.effectiveTo && (
                          <p className="text-gray-400 text-sm">
                            To: {new Date(pricing.effectiveTo).toLocaleDateString()}
                          </p>
                        )}
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-block w-2 h-2 rounded-full ${pricing.isActive ? 'bg-emerald-400' : 'bg-gray-400'}`} />
                          <span className="text-xs text-gray-400">
                            {pricing.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {pricing.notes && (
                      <p className="text-gray-400 text-sm mt-3 pl-4 border-l-2 border-white/10">
                        {pricing.notes}
                      </p>
                    )}
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};