import React, { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/Button';
import { api } from '../services/api';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  ShieldCheck,
  DollarSign,
  Package,
  Receipt,
  BarChart3,
  PieChart,
  LineChart,
  FileSpreadsheet,
  Clock,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ReportConfig {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  endpoint: string;
  color: string;
  filters: string[];
}

const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [generating, setGenerating] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'pdf' | 'excel'>('excel');

  const reports: ReportConfig[] = [
    {
      id: 'sales-analysis',
      title: 'Sales Analysis Report',
      description: 'Product-wise, country-wise, and customer performance metrics with trend analysis',
      icon: <TrendingUp className="w-6 h-6" />,
      endpoint: '/mis-reports/sales-analysis',
      color: 'text-blue-400',
      filters: ['dateRange', 'customer', 'product', 'country']
    },
    {
      id: 'regulatory-compliance',
      title: 'Regulatory Compliance Dashboard',
      description: 'Registration status, expiry tracking, and country-wise compliance rates',
      icon: <ShieldCheck className="w-6 h-6" />,
      endpoint: '/mis-reports/regulatory-compliance',
      color: 'text-emerald-400',
      filters: ['country', 'status', 'product']
    },
    {
      id: 'payment-outstanding',
      title: 'Payment Outstanding Report',
      description: 'Aging analysis, customer dues, and overdue payment alerts',
      icon: <DollarSign className="w-6 h-6" />,
      endpoint: '/mis-reports/payment-outstanding',
      color: 'text-yellow-400',
      filters: ['customer', 'currency', 'agingDays']
    },
    {
      id: 'inventory-movement',
      title: 'Inventory Movement Report',
      description: 'Stock tracking, batch analysis, and expiry management',
      icon: <Package className="w-6 h-6" />,
      endpoint: '/mis-reports/inventory-movement',
      color: 'text-purple-400',
      filters: ['dateRange', 'product', 'movementType']
    },
    {
      id: 'drawback-claims',
      title: 'Drawback/RODTEP Claims Report',
      description: 'Claim status tracking, amount analysis, and monthly trends',
      icon: <Receipt className="w-6 h-6" />,
      endpoint: '/mis-reports/drawback-claims',
      color: 'text-indigo-400',
      filters: ['dateRange', 'status', 'claimType']
    }
  ];

  const handleGenerateReport = async (report: ReportConfig) => {
    setGenerating(true);
    try {
      const response = await fetch(`/api${report.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          format: downloadFormat,
          includeCharts: true
        })
      });

      if (!response.ok) throw new Error('Failed to generate report');

      if (downloadFormat === 'excel') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report.id}-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const data = await response.json();
        // Handle JSON response - could open a preview modal
        console.log('Report data:', data);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGenerating(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">MIS Reports</h1>
          <p className="text-gray-400 mt-1">Generate comprehensive business intelligence reports</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-glass-light rounded-lg p-2">
            <button
              onClick={() => setDownloadFormat('excel')}
              className={`px-3 py-1 rounded-md transition-colors ${
                downloadFormat === 'excel' 
                  ? 'bg-primary text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDownloadFormat('pdf')}
              className={`px-3 py-1 rounded-md transition-colors ${
                downloadFormat === 'pdf' 
                  ? 'bg-primary text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <GlassCard className="p-4">
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex items-center space-x-2 text-gray-400">
            <Calendar className="w-5 h-5" />
            <span>Date Range:</span>
          </div>
          <div className="flex items-center space-x-4">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
            />
          </div>
        </div>
      </GlassCard>

      {/* Reports Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {reports.map((report) => (
          <motion.div key={report.id} variants={itemVariants}>
            <GlassCard
              className="h-full cursor-pointer group"
              hover={true}
              blur="3xl"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-white/10 ${report.color}`}>
                    {report.icon}
                  </div>
                  <div className="flex space-x-2">
                    {report.filters.includes('dateRange') && (
                      <Clock className="w-4 h-4 text-gray-400" />
                    )}
                    {report.filters.includes('customer') && (
                      <Filter className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-primary transition-colors">
                  {report.title}
                </h3>
                
                <p className="text-gray-400 text-sm mb-4 flex-1">
                  {report.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <CheckCircle className="w-4 h-4" />
                    <span>Ready to generate</span>
                  </div>
                  
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleGenerateReport(report)}
                    disabled={generating}
                    className="flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>{generating ? 'Generating...' : 'Generate'}</span>
                  </Button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Stats */}
      <GlassCard>
        <h2 className="text-xl font-semibold text-white mb-4">Report Generation Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white/5 rounded-lg">
            <BarChart3 className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">156</p>
            <p className="text-sm text-gray-400">Reports Generated</p>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-lg">
            <PieChart className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">5</p>
            <p className="text-sm text-gray-400">Report Types</p>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-lg">
            <LineChart className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">98%</p>
            <p className="text-sm text-gray-400">Accuracy Rate</p>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-lg">
            <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">2.3s</p>
            <p className="text-sm text-gray-400">Avg. Generation Time</p>
          </div>
        </div>
      </GlassCard>

      {/* Scheduled Reports Info */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Scheduled Reports</h2>
          <Button variant="outline" size="sm">
            Configure Schedules
          </Button>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-white">Weekly Sales Analysis</p>
                <p className="text-sm text-gray-400">Every Monday at 9:00 AM</p>
              </div>
            </div>
            <span className="text-sm text-emerald-400">Active</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-white">Monthly Payment Outstanding</p>
                <p className="text-sm text-gray-400">1st of every month at 8:00 AM</p>
              </div>
            </div>
            <span className="text-sm text-emerald-400">Active</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default Reports;