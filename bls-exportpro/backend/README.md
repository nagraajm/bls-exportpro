# BLS ExportPro - Pharmaceutical Export Management System

A comprehensive Node.js/Express TypeScript backend system for managing pharmaceutical exports, including order management, invoice generation, packing lists, purchase orders, and regulatory tracking.

## Features

- **Order Management**: Complete CRUD operations for export orders
- **Invoice Generation**: Support for Proforma, Pre-shipment, and Post-shipment invoices
- **Packing List Management**: Generate and manage packing lists for shipments
- **Purchase Order System**: Track supplier orders and deliveries
- **Regulatory Compliance**: Track product registrations and compliance status
- **PDF Generation**: Generate professional PDF documents for invoices and packing lists
- **Excel Import/Export**: Import product and customer data, export reports
- **Dashboard Analytics**: Real-time metrics and business insights
- **Multi-currency Support**: Handle transactions in USD and INR
- **Tax Calculations**: Automatic IGST, Drawback, and RODTEP calculations

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Data Storage**: JSON file-based (designed for easy migration to database)
- **PDF Generation**: PDFKit
- **Excel Processing**: xlsx and ExcelJS
- **Validation**: Zod
- **Security**: Helmet, CORS
- **Authentication**: JWT (ready for implementation)

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd BLSPharmaExport

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Build the project
npm run build

# Start development server
npm run dev
```

## API Endpoints

### Orders
- `POST /api/orders/create` - Create new order
- `GET /api/orders/list` - List all orders with filtering
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order

### Invoices
- `POST /api/invoices/generate` - Generate invoice for order
- `GET /api/invoices` - List all invoices
- `GET /api/invoices/:id` - Get invoice details
- `GET /api/invoices/:id/pdf` - Download invoice PDF

### Packing Lists
- `POST /api/packing-list/generate` - Generate packing list
- `GET /api/packing-list` - List all packing lists
- `GET /api/packing-list/:id` - Get packing list details

### Purchase Orders
- `POST /api/purchase-orders/create` - Create purchase order
- `GET /api/purchase-orders` - List purchase orders
- `GET /api/purchase-orders/:id` - Get purchase order details
- `PATCH /api/purchase-orders/:id/status` - Update PO status

### Regulatory
- `POST /api/regulatory` - Create regulatory document
- `GET /api/regulatory` - List regulatory documents
- `GET /api/regulatory/status` - Get compliance status
- `PATCH /api/regulatory/:id/status` - Update document status

### Excel Operations
- `POST /api/excel/import` - Import products/customers from Excel
- `GET /api/excel/export/orders` - Export orders to Excel
- `GET /api/excel/export/invoices` - Export invoices to Excel

### Dashboard
- `GET /api/dashboard/metrics` - Get dashboard metrics

## Project Structure

```
src/
├── config/          # Configuration files and constants
├── controllers/     # Request handlers
├── middleware/      # Express middleware
├── models/          # Data models (future use)
├── repositories/    # Data access layer
├── routes/          # API route definitions
├── schemas/         # Zod validation schemas
├── services/        # Business logic
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── index.ts         # Application entry point
```

## Environment Variables

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your-secret-key-here
API_PREFIX=/api
UPLOAD_DIR=./uploads
DATA_DIR=./data
CURRENCY_API_KEY=your-currency-api-key
```

## Development

```bash
# Run in development mode
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Type check
npm run typecheck

# Lint check
npm run lint
```

## Data Storage

Currently uses JSON file storage for MVP. Repository pattern implemented for easy migration to database (MongoDB, PostgreSQL, etc.).

## Security Features

- Helmet.js for security headers
- CORS configuration
- Input validation with Zod
- Error handling middleware
- Ready for JWT authentication

## Future Enhancements

- Database integration (MongoDB/PostgreSQL)
- User authentication and authorization
- Real-time currency conversion API
- Email notifications
- Audit logging
- API rate limiting
- WebSocket for real-time updates

## License

Proprietary - BLS Trading Company