import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NavigationSidebar } from './components/layout/NavigationSidebar';
import { Login } from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Invoices from './pages/Invoices';
import Orders from './pages/Orders';
import Reports from './pages/Reports';
import PackingLists from './pages/PackingLists';
import { InvoiceGenerator } from './pages/InvoiceGenerator';
import { CreateOrder } from './pages/CreateOrder';

const ProtectedRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex h-screen">
      <NavigationSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/create-order" element={<CreateOrder />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/invoice-generator" element={<InvoiceGenerator />} />
          <Route path="/packing-lists" element={<PackingLists />} />
          <Route path="/regulatory" element={<div className="p-6"><h1 className="text-3xl font-bold">Regulatory Page (Coming Soon)</h1></div>} />
          <Route path="/inventory" element={<div className="p-6"><h1 className="text-3xl font-bold">Inventory Page (Coming Soon)</h1></div>} />
          <Route path="/purchase-orders" element={<div className="p-6"><h1 className="text-3xl font-bold">Purchase Orders Page (Coming Soon)</h1></div>} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/products" element={<Products />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ProtectedRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;