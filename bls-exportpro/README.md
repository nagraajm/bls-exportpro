# BLS ExportPro - Pharmaceutical Export Management System

MVP for Bohra Lifescience Private Limited to manage pharmaceutical exports.

## Project Structure

```
/bls-exportpro
  /backend         - Node.js/Express backend with TypeScript
  /frontend        - React frontend with TypeScript and Vite
  /shared          - Shared TypeScript types
  /docs-info       - Excel files with Cambodia registration data
```

## What's Been Implemented

### Backend (Node.js/Express with TypeScript)
- ✅ Express server setup with security middleware (helmet, cors, compression, morgan)
- ✅ TypeScript configuration with nodemon for development
- ✅ RESTful API structure:
  - `/api/products` - Product management endpoints
  - `/api/customers` - Customer management endpoints
  - `/health` - Health check endpoint
- ✅ MVC architecture with:
  - Controllers: `productController.ts`, `customerController.ts`
  - Models: `Product.ts`, `Customer.ts` (in-memory data storage)
  - Routes: Organized route structure with index router
- ✅ Configuration management with dotenv
- ✅ Sample data for products and customers

### Frontend (React with TypeScript and Vite)
- ✅ Vite configuration for fast development and building
- ✅ React Router DOM for navigation
- ✅ TypeScript configuration with path aliases
- ✅ TailwindCSS v3 with custom configuration:
  - Glassmorphism effects (`.glass` utility classes)
  - Gradient shadows
  - Custom color palette
- ✅ Component library:
  - `Layout.tsx` - Main layout with navigation
  - `Card.tsx` - Reusable card component with glass effect
  - `Button.tsx` - Styled button component with variants
  - `Table.tsx` - Generic table component with TypeScript generics
- ✅ Pages:
  - `Dashboard.tsx` - Statistics overview
  - `Products.tsx` - Product listing with API integration
- ✅ API service layer for backend communication
- ✅ Responsive design with mobile support

### Shared Types
- ✅ TypeScript interfaces for all entities:
  - Product, Customer, Order, OrderItem
  - Shipment, ShipmentDocument
  - Registration, RegistrationDocument
- ✅ Shared between frontend and backend for type safety

## Getting Started

### Prerequisites
- Node.js v20.11.1 or higher
- npm v10.2.4 or higher

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

Backend runs on http://localhost:5000

API Endpoints available:
- GET `/health` - Health check
- GET `/api/products` - List all products
- GET `/api/products/:id` - Get product by ID
- POST `/api/products` - Create new product
- PUT `/api/products/:id` - Update product
- DELETE `/api/products/:id` - Delete product
- Same CRUD endpoints for `/api/customers`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173

## Features Implemented

- ✅ Product Management (View products list)
- ✅ Customer Management (API ready, UI pending)
- ✅ Dashboard with statistics
- ✅ Responsive navigation
- ✅ Glassmorphism UI design
- ✅ TypeScript throughout
- ✅ API proxy configuration

## Technology Stack

- **Backend**: 
  - Node.js, Express 5.1.0, TypeScript 5.9.2
  - Security: Helmet, CORS
  - Development: Nodemon, ts-node
- **Frontend**: 
  - React 19.1.1, TypeScript 5.9.2
  - Build: Vite 5.4.11
  - Routing: React Router DOM 7.7.1
  - Styling: TailwindCSS 3.4.17, PostCSS, Autoprefixer
- **Shared**: TypeScript interfaces for type safety
- **Data**: In-memory storage (structured for future PostgreSQL/MongoDB migration)

## Development Notes

### Version Compatibility
- Using Vite 5.4.11 and @vitejs/plugin-react 4.3.4 for stability
- TailwindCSS v3 (v4 requires different PostCSS setup)
- Frontend package.json uses `"type": "module"` for ESM support

### Next Steps
- Implement remaining pages (Customers, Orders, Registrations)
- Add form components for CRUD operations
- Implement authentication and authorization
- Add data persistence with PostgreSQL/MongoDB
- Implement file upload for documents
- Add search and filtering capabilities
- Deploy to production environment