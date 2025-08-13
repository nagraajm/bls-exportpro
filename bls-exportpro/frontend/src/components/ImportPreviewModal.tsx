import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from './ui/GlassCard';
import { Button } from './Button';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

interface ImportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data: Array<{
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
  }>;
  loading?: boolean;
}

export const ImportPreviewModal: React.FC<ImportPreviewModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  data,
  loading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-6xl max-h-[90vh] overflow-auto"
      >
        <GlassCard className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Import Preview</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span className="text-white font-medium">
                {data.length} invoices ready to import
              </span>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4 mb-4">
              <p className="text-gray-300 text-sm">
                Please review the data below before confirming the import. 
                Any duplicate invoice numbers will be skipped.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-3 text-gray-400 font-medium">Invoice #</th>
                  <th className="text-left p-3 text-gray-400 font-medium">Type</th>
                  <th className="text-left p-3 text-gray-400 font-medium">Customer</th>
                  <th className="text-left p-3 text-gray-400 font-medium">Date</th>
                  <th className="text-left p-3 text-gray-400 font-medium">Amount</th>
                  <th className="text-left p-3 text-gray-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((invoice, index) => (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-3 text-white font-medium">{invoice.invoiceNumber}</td>
                    <td className="p-3 text-gray-300 capitalize">
                      {invoice.invoiceType.replace('-', ' ')}
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="text-white">{invoice.customerName}</p>
                        <p className="text-sm text-gray-400">{invoice.customerCountry}</p>
                      </div>
                    </td>
                    <td className="p-3 text-gray-300">
                      {new Date(invoice.invoiceDate).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-white">
                      {invoice.currency === 'USD' ? '$' : '₹'}
                      {invoice.totalAmount.toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs capitalize ${
                        invoice.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' :
                        invoice.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        invoice.status === 'overdue' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={onConfirm}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirm Import</span>
                </>
              )}
            </Button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

