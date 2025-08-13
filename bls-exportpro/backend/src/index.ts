import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';

import orderRoutes from './routes/order.routes';
import invoiceRoutes from './routes/invoice.routes';
import packingListRoutes from './routes/packing-list.routes';
import purchaseOrderRoutes from './routes/purchase-order.routes';
import regulatoryRoutes from './routes/regulatory.routes';
import dashboardRoutes from './routes/dashboard.routes';
import excelRoutes from './routes/excel.routes';
import customerRoutes from './routes/customers';
import productRoutes from './routes/products';
import documentRoutes from './routes/document.routes';
import misReportsRoutes from './routes/mis-reports.routes';

import { errorHandler, notFound } from './middleware/error.middleware';
import { reportSchedulerService } from './services/scheduler/report-scheduler.service';
import { initDatabase } from './config/sqlite.config';
import invoiceGeneratorRoutes from './routes/invoice-generator.routes';
import orderCreationRoutes from './routes/order-creation.routes';
import excelImportRoutes from './routes/excel-import.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const API_PREFIX = process.env.API_PREFIX || '/api';

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    service: 'BLS ExportPro Backend'
  });
});

app.use(`${API_PREFIX}/orders`, orderRoutes);
app.use(`${API_PREFIX}/invoices`, invoiceRoutes);
app.use(`${API_PREFIX}/packing-list`, packingListRoutes);
app.use(`${API_PREFIX}/purchase-orders`, purchaseOrderRoutes);
app.use(`${API_PREFIX}/regulatory`, regulatoryRoutes);
app.use(`${API_PREFIX}/dashboard`, dashboardRoutes);
// Temporarily disabled problematic routes
// app.use(`${API_PREFIX}/excel`, excelRoutes);
app.use(`${API_PREFIX}/reports/export`, excelRoutes);
app.use(`${API_PREFIX}/customers`, customerRoutes);
app.use(`${API_PREFIX}/products`, productRoutes);
app.use(`${API_PREFIX}/documents`, documentRoutes);
app.use(`${API_PREFIX}/invoice-generator`, invoiceGeneratorRoutes);
app.use(`${API_PREFIX}/order-creation`, orderCreationRoutes);
app.use(`${API_PREFIX}/excel-import`, excelImportRoutes);
// app.use(`${API_PREFIX}/mis-reports`, misReportsRoutes);

app.use(notFound);
app.use(errorHandler);

const server = app.listen(PORT, async () => {
  console.log(`🚀 BLS ExportPro Server running on port ${PORT}`);
  console.log(`📍 API available at http://localhost:${PORT}${API_PREFIX}`);
  console.log(`🏥 Health check at http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  
  // Initialize SQLite database
  try {
    await initDatabase();
    console.log('✅ SQLite database initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize SQLite database:', error);
  }
  
  // Start the report scheduler
  // reportSchedulerService.startScheduler(); // Temporarily disabled
});

process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Rejection:', err);
  // reportSchedulerService.stopScheduler(); // Temporarily disabled
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  // reportSchedulerService.stopScheduler(); // Temporarily disabled
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;