import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Table } from '../components/Table';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';

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

interface CambodiaProduct {
  productCode: string;
  brandName: string;
  genericName: string;
  strength: string;
  dosageForm: string;
  packSize: string;
  registrationNumber: string;
  registrationStatus: string;
  registrationExpiry: string;
  manufacturingSite: string;
}

export const InvoiceGenerator: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Excel upload states
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [cambodiaProducts, setCambodiaProducts] = useState<CambodiaProduct[]>([]);
  const [showExcelUpload, setShowExcelUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchOrders();
    fetchCambodiaProducts();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/invoice-generator/orders');
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
      } else {
        setError('Failed to fetch orders');
      }
    } catch (err) {
      setError('Network error while fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchCambodiaProducts = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/cambodia-excel/products');
      const data = await response.json();
      if (data.success) {
        setCambodiaProducts(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch Cambodia products:', err);
    }
  };

  const fetchOrderDetails = async (orderId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/api/invoice-generator/orders/${orderId}`);
      const data = await response.json();
      if (data.success) {
        setSelectedOrder(data.data);
      } else {
        setError('Failed to fetch order details');
      }
    } catch (err) {
      setError('Network error while fetching order details');
    } finally {
      setLoading(false);
    }
  };

  const generateInvoice = async (orderId: string, type: 'PROFORMA INVOICE' | 'INVOICE') => {
    setGenerating(true);
    try {
      const response = await fetch(`http://localhost:5001/api/invoice-generator/orders/${orderId}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });
      
      const data = await response.json();
      if (data.success) {
        // Open the PDF in a new tab
        window.open(`http://localhost:5001${data.data.downloadUrl}`, '_blank');
      } else {
        setError('Failed to generate invoice');
      }
    } catch (err) {
      setError('Network error while generating invoice');
    } finally {
      setGenerating(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent