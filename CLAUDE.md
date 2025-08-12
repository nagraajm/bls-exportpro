# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BLS ExportPro is a pharmaceutical export management system for Bohra Lifescience Private Limited with a TypeScript-based monorepo structure:
- **Backend**: Node.js/Express API with TypeScript
- **Frontend**: React with TypeScript, Vite, and Tailwind CSS  
- **Shared**: Common TypeScript types used by both backend and frontend
- **Currency**: INR (₹) only - no USD support
- **Theme**: Glassmorphism design with light/dark mode support

## Common Commands

### Backend Development
```bash
cd bls-exportpro/backend
npm install              # Install dependencies
npm run dev              # Start development server (uses nodemon on port 5001)
npm run build            # Compile TypeScript to JavaScript
npm run start            # Run production build from dist/
npm run seed             # Seed database with sample data
tsc --noEmit            # Type check without building
```

### Frontend Development
```bash
cd bls-exportpro/frontend
npm install              # Install dependencies
npm run dev              # Start Vite dev server (port 5173)
npm run build            # Build for production (tsc && vite build)
npm run preview          # Preview production build
tsc --noEmit            # Type check without building
```

### Database Setup
```bash
cd bls-exportpro/backend
npm run seed             # Seed JSON files with sample data
ts-node src/scripts/seed-sqlite.ts  # Initialize SQLite database (pharma.db)
```

## Architecture Overview

### Backend Architecture
- **Repository Pattern**: Data access layer abstracts storage (currently JSON files + SQLite, designed for easy database migration)
- **Service Layer**: Business logic separated from controllers
- **Controllers**: Handle HTTP requests/responses using express-async-handler
- **Middleware**: Authentication (currently disabled), validation (Zod), error handling
- **Routes**: Organized by feature modules under `/api` prefix

### Frontend Architecture
- **Pages**: Route-based components (Dashboard, Products, Orders, etc.)
- **Components**: Reusable UI components with glassmorphism design
- **Services**: API communication layer using axios
- **Styling**: TailwindCSS with custom glass effects and gradient utilities
- **State Management**: React Context for auth and theme

### Type System
The project uses a shared types directory (`/shared/types/`) with modular type definitions:
- `business/`: Customer, Supplier entities
- `documents/`: Invoice, PackingList, PurchaseOrder
- `product/`: Product definitions
- `regulatory/`: Registration, compliance types
- `financial/`: Payment, pricing types  
- `reports/`: MIS report structures

**Note**: There's a legacy `/shared/types.ts` file that conflicts with the new modular types - prefer using the modular types in `/shared/types/`.

## Key Features Implementation

### Excel/MIS Module
- **Excel Import**: `/api/excel/import/*` endpoints for bulk data import (products, cambodia registration, historical orders, financial MIS)
- **MIS Reports**: 5 report types (Sales Analysis, Regulatory Compliance, Payment Outstanding, Inventory Movement, Drawback Claims)
- **Report Features**: Chart generation (Chart.js), Excel export (ExcelJS), caching (NodeCache), scheduled generation (node-cron)
- **Documentation**: See `/backend/docs/EXCEL_MIS_MODULE_IMPLEMENTATION.md` for detailed implementation

### Document Generation
- **PDF Generation**: PDFKit for invoices, packing lists, purchase orders
- **Excel Export**: ExcelJS with formatting and multiple sheets
- **Email Templates**: Handlebars templates with inline CSS (juice)
- **Storage**: Files saved to `/uploads/` directory structure
- **Invoice Types**: Proforma, Pre-shipment, Post-shipment

### Pharmaceutical Features
- **Product Fields**: Brand name, Generic name, Strength, Dosage form, Pack size
- **Batch Coding**: Batch number, Manufacturing date, Expiry date tracking
- **Cambodia Registration**: Status tracking with registration numbers and expiry dates
- **Manufacturing Sites**: Multiple site tracking per product

### API Structure
All APIs follow RESTful conventions under `/api` prefix:
- Orders: `/api/orders/*` - Order management
- Invoices: `/api/invoices/*` - Invoice CRUD and generation
- Packing Lists: `/api/packing-list/*` - Packing list management
- Purchase Orders: `/api/purchase-orders/*` - PO management
- Regulatory: `/api/regulatory/*` - Registration tracking
- Dashboard: `/api/dashboard/*` - Analytics data
- Documents: `/api/documents/*` - Document generation/export
- Excel Import: `/api/excel/import/*` - Bulk data import
- MIS Reports: `/api/mis-reports/*` - Business intelligence reports

## Development Guidelines

### File Organization
- Use feature-based organization (e.g., all invoice-related files together)
- Keep controllers thin, business logic in services
- Repositories handle data access (abstract storage layer)
- Shared types in `/shared/types/` directory

### Error Handling
- Use Zod schemas for input validation
- Async error handling with express-async-handler wrapper
- Centralized error middleware returns consistent error format
- Validation errors include field-level details

### Security Considerations
- Helmet.js for security headers
- CORS configured for frontend origin
- File upload validation with multer
- JWT authentication implemented but currently disabled

### Known Issues & Limitations
1. **Type System**: Mismatch between old `/shared/types.ts` and new modular types - some `as any` assertions used
2. **Authentication**: Auth middleware disabled for testing - needs to be re-enabled for production
3. **Routes**: Some Excel/MIS routes temporarily commented in index.ts
4. **Database**: Currently using JSON files + SQLite - needs migration to production database
5. **Testing**: No automated tests implemented yet
6. **UI Theme**: Light theme contrast was fixed in January 2025 - ensure proper CSS variables are used
7. **Charts**: Use dark tooltips with explicit white text for visibility in both themes

## Environment Configuration
Backend `.env` file configuration:
```
PORT=5001                            # Server port
NODE_ENV=development                 # Environment (development/production)
CORS_ORIGIN=http://localhost:5173    # Frontend URL for CORS
JWT_SECRET=your-secret-key-here      # JWT signing secret
API_PREFIX=/api                      # API route prefix
UPLOAD_DIR=./uploads                 # File upload directory
DATA_DIR=./data                      # JSON data files directory
CURRENCY_API_KEY=your-api-key        # Currency conversion API key
```

## File Upload Structure
```
uploads/
├── excel/           # Excel import files
├── invoices/        # Generated invoice PDFs
├── packing-lists/   # Generated packing list PDFs
├── purchase-orders/ # Generated PO PDFs
└── temp/           # Temporary files
```

## Data Storage
Currently using hybrid storage:
- **JSON Files**: Primary data storage in `/data/` directory
  - customers.json, products.json, invoices.json, orders.json, suppliers.json
- **SQLite Database**: `pharma.db` for future migration
- **Repository Pattern**: Abstracts storage implementation for easy migration

## Frontend Routes
- `/` - Dashboard with metrics and charts (Revenue, Compliance, Orders)
- `/products` - Product management with pharmaceutical fields
- `/orders` - Order management with status workflow
- `/create-order` - New order creation form
- `/invoices` - Invoice management (Proforma, Pre/Post-shipment)
- `/invoice-generator` - Invoice creation and PDF generation
- `/packing-lists` - Packing list management with batch coding
- `/reports` - MIS reports interface with 5 report types
- `/login` - Authentication (UI only)

## UI/UX Guidelines

### Glassmorphism Design
- **Glass Effects**: Use `bg-white/10` with `backdrop-blur-xl`
- **Borders**: White borders at 10-20% opacity
- **Shadows**: Custom glass shadows for depth
- **Hover States**: Subtle opacity changes, avoid animations

### Theme Support
- **Light Theme**: High contrast with dark text on light backgrounds
- **Dark Theme**: Traditional dark mode with proper contrast
- **Chart Tooltips**: Always use dark backgrounds with white text
- **Theme Toggle**: Available in sidebar profile section

### Component Standards
- **Metric Cards**: Static gradients, no animations
- **Tables**: Striped rows with hover effects
- **Buttons**: Glass, primary, outline variants available
- **Status Badges**: Color-coded with proper contrast

## Development Workflow

### Adding New Features
1. Check existing patterns in similar files
2. Use TypeScript interfaces from `/shared/types/`
3. Follow repository pattern for data access
4. Keep business logic in service layer
5. Add proper error handling with Zod validation

### Common Pitfalls to Avoid
- Don't use USD currency - system is INR-only
- Avoid complex animations that cause flickering
- Don't mix old and new type definitions
- Always handle both light and dark themes
- Test chart visibility in both themes

## Recent Updates (January 2025)
- Fixed light theme visibility issues
- Standardized to INR currency only
- Enhanced chart tooltips for better contrast
- Improved sidebar profile layout
- Added order creation functionality
- Fixed invoice download routes