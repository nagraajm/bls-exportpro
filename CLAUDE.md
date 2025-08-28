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
npm run prod:start       # Start production server with NODE_ENV=production
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

### Testing
```bash
cd bls-exportpro/backend
# Jest is configured with test files in tests/api/ directory
# Comprehensive test suite includes API, integration, and performance tests
npm run test             # Run tests (currently shows "no test specified" - needs Jest script)
./run-tests.sh          # Test script (exists but empty)
```

### Database Setup
```bash
cd bls-exportpro/backend
npm run seed             # Seed SQLite database with sample data
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
- `factories/`: Type factories and test data generation

Shared types package: `@bls-exportpro/types` with own package.json and build system.

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
5. **Testing**: Jest configured with test files in `/tests/api/` but tests are empty - framework ready for implementation
6. **UI Theme**: Light theme contrast was fixed in January 2025 - ensure proper CSS variables are used
7. **Charts**: Use dark tooltips with explicit white text for visibility in both themes
8. **Build Scripts**: Empty shell scripts (run-tests.sh, build.sh) exist but need implementation

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

## Production Deployment Fixes (August 2025)

### Critical Server-Level Issues Resolved
During production deployment, several critical issues were identified and fixed directly on the production server:

1. **TypeScript Compilation Dependencies Missing**
   - **Issue**: Missing @types packages causing build failures in production
   - **Error**: `Cannot find module '@types/express'` and similar for all middleware
   - **Fix**: Install all required TypeScript type definitions
   ```bash
   npm install --save-dev @types/express @types/cors @types/morgan @types/compression @types/helmet @types/bcryptjs @types/jsonwebtoken @types/multer @types/sqlite3 @types/pdfkit
   ```

2. **Invoice Template Files Not Deployed**
   - **Issue**: Template files missing in dist directory causing 500 errors on invoice generation
   - **Error**: `ENOENT: no such file or directory, open '/var/www/blsexport/backend/dist/templates/invoice-template.html'`
   - **Fix**: Copy template directory to dist after TypeScript build
   ```bash
   npm run build
   cp -r src/templates dist/
   ```

3. **Missing Data Directory and Files**
   - **Issue**: PM2 failing to start due to missing product-pricing.json file
   - **Error**: `ENOENT: no such file or directory, open '/var/www/blsexport/data/product-pricing.json'`
   - **Fix**: Create missing data directory structure and files
   ```bash
   mkdir -p data
   echo '[]' > data/product-pricing.json
   ```

4. **Frontend Build Missing**
   - **Issue**: No frontend dist folder causing 500 internal server error on main website
   - **Error**: Nginx serving empty directory instead of built React app
   - **Fix**: Build frontend with production configuration
   ```bash
   cd frontend
   npx vite build --mode production
   ```

5. **SQLite Database Empty**
   - **Issue**: Database file exists but empty (0 bytes) causing SQLITE_CANTOPEN errors
   - **Error**: `SQLITE_CANTOPEN: unable to open database file`
   - **Fix**: Seed database with sample data
   ```bash
   npm run seed
   ```

6. **Route Registration Issues**
   - **Issue**: Product pricing routes missing causing API endpoint failures
   - **Fix**: Ensure all route modules are properly imported and registered in main routes file

### Production Deployment Command Sequence
**Essential commands that must be executed after each deployment:**

```bash
# Backend setup (run in /var/www/blsexport/backend)
npm install --save-dev @types/express @types/cors @types/morgan @types/compression @types/helmet @types/bcryptjs @types/jsonwebtoken @types/multer @types/sqlite3 @types/pdfkit
npm run build
cp -r src/templates dist/
mkdir -p data && echo '[]' > data/product-pricing.json
npm run seed

# Frontend setup (run in /var/www/blsexport/frontend)  
npm install
npx vite build --mode production

# Process restart
pm2 restart bls-export-backend
```

### API Health Verification
Commands to verify all functionality after deployment:

```bash
# Test main endpoints
curl -X GET https://blsexport.nmdevai.com/api/products
curl -X GET https://blsexport.nmdevai.com/api/orders

# Test invoice generation with required parameters
curl -X POST https://blsexport.nmdevai.com/api/invoices/ORD-2024-001/generate \
  -H "Content-Type: application/json" \
  -d '{"type":"proforma"}'

# Test PDF download
curl -X GET "https://blsexport.nmdevai.com/api/invoices/ORD-2024-001/download?type=proforma"
```

### Known Production-Specific Issues
1. **Invoice API Parameter Requirements**: Invoice generation requires explicit `type` parameter (`proforma` or `commercial`)
2. **Template File Dependencies**: Templates must be manually copied to dist/ after each build
3. **Data File Initialization**: Missing data files cause PM2 startup failures
4. **TypeScript Compilation**: Production builds require all @types packages even though not used at runtime
5. **Database State**: Empty SQLite files cause application crashes - always seed after deployment

## Recent Updates (August 2025)

### Major Bug Fixes & Features (Latest)
- **Order Management System Overhaul**: Fixed complete order workflow with approval buttons and status transitions
- **Invoice Generation System**: Completely fixed PDF generation, download functionality, and SQLite schema mapping
- **Create Order Functionality**: Added missing order number field and fixed API endpoint routing
- **Currency Standardization**: Enforced INR-only system throughout frontend and backend
- **Order Approval Workflow**: Added visual status indicators and proper state transitions (pending → confirmed → processing → shipped → delivered)
- **PDF Services**: Fixed null safety issues and database integration for invoice/packing list generation
- **Product Management**: Added product pricing approval modal and batch management features

### Database & Backend Updates
- **SQLite Schema Fixes**: Resolved column mapping issues between application and database
- **Repository Pattern**: Enhanced invoice service with hybrid JSON/SQLite data access
- **API Endpoints**: Fixed order creation endpoint routing from `/orders/create` to `/order-creation/create`
- **Error Handling**: Improved null safety in PDF generation and invoice repository
- **PM2 Configuration**: Fixed process management for production deployment

### Frontend Improvements  
- **Order Forms**: Added required order number validation and INR-only display
- **Status Badges**: Enhanced visual indicators for order status with proper theming
- **Form Validation**: Improved create order form with complete field validation
- **Currency Display**: Standardized all currency displays to show ₹ symbol consistently

### Deployment & Infrastructure
- **Production Deployment**: Successfully deployed to https://blsexport.nmdevai.com with SSL
- **Server Configuration**: Hetzner server (157.180.18.119) with Nginx, PM2, and UFW firewall
- **File Organization**: Cleaned deploy directory and archived unused deployment scripts
- **Git Management**: Proper commit messages and branch management

### Previous Updates
- Complete deployment sync and configuration updates
- Fixed invoice generation and added BLS branding
- Added comprehensive test suite for API testing
- Implemented logging and upload functionality
- Refactored deployment scripts and updated deployment guide for Render integration
- Fixed light theme visibility issues (January 2025)
- Enhanced chart tooltips for better contrast
- Improved sidebar profile layout