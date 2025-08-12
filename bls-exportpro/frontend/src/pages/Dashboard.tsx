import React from 'react';
import { MetricCard } from '../components/ui/MetricCard';
import { GlassCard } from '../components/ui/GlassCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import {
  IndianRupee,
  Package,
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

const Dashboard: React.FC = () => {

  // Sample data
  const monthlyRevenueData = [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 52000 },
    { month: 'Mar', revenue: 48000 },
    { month: 'Apr', revenue: 61000 },
    { month: 'May', revenue: 58000 },
    { month: 'Jun', revenue: 67000 },
  ];

  const complianceData = [
    { name: 'Compliant', value: 85, color: '#10B981' },
    { name: 'Pending', value: 10, color: '#F59E0B' },
    { name: 'Non-Compliant', value: 5, color: '#EF4444' },
  ];

  const orderStatusData = [
    { status: 'Completed', count: 245, color: '#3B82F6' },
    { status: 'Processing', count: 87, color: '#8B5CF6' },
    { status: 'Pending', count: 43, color: '#F59E0B' },
    { status: 'Cancelled', count: 12, color: '#EF4444' },
  ];

  const exportValue = 101234567;
  const currencySymbol = '₹';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome to BLS ExportPro</p>
        </div>
        <div className="flex items-center space-x-4">
          <StatusBadge status="active" label="System Online" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Export Value"
          value={exportValue}
          prefix={currencySymbol}
          change={12.5}
          trend="up"
          icon={<IndianRupee className="w-6 h-6 text-blue-400" />}
          variant="purple-blue"
        />
        <MetricCard
          title="Pending Orders"
          value={43}
          change={-5.2}
          trend="down"
          icon={<Package className="w-6 h-6 text-purple-400" />}
          variant="teal-green"
        />
        <MetricCard
          title="Regulatory Compliance"
          value={85}
          suffix="%"
          change={3.1}
          trend="up"
          icon={<ShieldCheck className="w-6 h-6 text-emerald-400" />}
          variant="orange-pink"
        />
        <MetricCard
          title="Monthly Revenue"
          value={67000}
          prefix={currencySymbol}
          change={15.8}
          trend="up"
          icon={<TrendingUp className="w-6 h-6 text-indigo-400" />}
          variant="indigo-violet"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyRevenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(0,0,0,0.1)"
                className="dark:stroke-white/10"
              />
              <XAxis 
                dataKey="month" 
                tick={{ fill: '#475569' }}
                className="dark:[&_.recharts-text]:fill-white/50"
              />
              <YAxis 
                tick={{ fill: '#475569' }}
                className="dark:[&_.recharts-text]:fill-white/50"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.9)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  backdropFilter: 'blur(8px)',
                  color: 'white'
                }}
                labelStyle={{ color: 'white' }}
                formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Revenue']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Compliance Status Chart */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Compliance Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={complianceData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ cx, cy, midAngle, innerRadius, outerRadius, name, value }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  
                  return (
                    <text 
                      x={x} 
                      y={y} 
                      fill="white"
                      textAnchor={x > cx ? 'start' : 'end'} 
                      dominantBaseline="central"
                      className="text-xs font-bold"
                    >
                      {`${name}: ${value}%`}
                    </text>
                  );
                }}
                labelLine={false}
              >
                {complianceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.9)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  backdropFilter: 'blur(8px)',
                  color: 'white'
                }}
                formatter={(value: any, name: any) => [`${value}%`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Order Status */}
      <GlassCard className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Order Status Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={orderStatusData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(0,0,0,0.1)"
              className="dark:stroke-white/10" 
            />
            <XAxis 
              dataKey="status" 
              tick={{ fill: '#475569' }}
              className="dark:[&_.recharts-text]:fill-white/50"
            />
            <YAxis 
              tick={{ fill: '#475569' }}
              className="dark:[&_.recharts-text]:fill-white/50"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.9)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                backdropFilter: 'blur(8px)',
                color: 'white'
              }}
              formatter={(value: any, name: any) => [value, 'Orders']}
            />
            <Bar 
              dataKey="count" 
              radius={[8, 8, 0, 0]}
              cursor="pointer"
              activeBar={false}
            >
              {orderStatusData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  style={{ filter: 'brightness(1)', transition: 'filter 0.2s' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.filter = 'brightness(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.filter = 'brightness(1)';
                  }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* Recent Activities */}
      <GlassCard className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Activities</h2>
        <div className="space-y-3">
          {[
            { action: 'New order received', time: '2 minutes ago', trend: 'up' },
            { action: 'Invoice generated for Order #12345', time: '15 minutes ago', trend: 'up' },
            { action: 'Regulatory compliance updated', time: '1 hour ago', trend: 'up' },
            { action: 'Order #12340 cancelled', time: '2 hours ago', trend: 'down' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5 dark:bg-white/5 hover:bg-white/10 dark:hover:bg-white/10 transition-colors">
              <div className="flex items-center space-x-3">
                {activity.trend === 'up' ? (
                  <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                ) : (
                  <ArrowDownRight className="w-5 h-5 text-red-400" />
                )}
                <span className="text-gray-700 dark:text-gray-300">{activity.action}</span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

export default Dashboard;