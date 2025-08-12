# BLS ExportPro - Pharmaceutical Export Management System

A comprehensive pharmaceutical export management system designed for Bohra Lifescience Private Limited.

## Features

- 📦 **Order Management** - Complete order lifecycle management
- 📄 **Document Generation** - Invoices, Packing Lists, Purchase Orders
- 📊 **MIS Reporting** - 5 comprehensive report types with visualizations
- 🏭 **Product Management** - Pharmaceutical-specific fields and batch tracking
- 📋 **Regulatory Compliance** - Cambodia registration tracking
- 📈 **Dashboard Analytics** - Real-time metrics and charts
- 🌓 **Theme Support** - Light and dark theme with glassmorphism design

## Tech Stack

### Backend
- Node.js & Express.js
- TypeScript
- SQLite (with JSON file fallback)
- PDFKit for document generation
- ExcelJS for Excel operations
- Chart.js for report visualizations

### Frontend
- React 19 with TypeScript
- Vite for fast development
- Tailwind CSS with glassmorphism design
- Recharts for data visualization
- React Router for navigation

## Quick Start

### Prerequisites
- Node.js 20.11.1 or higher
- npm 10.2.4 or higher

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/bls-exportpro.git
cd bls-exportpro
```

2. Install backend dependencies:
```bash
cd bls-exportpro/backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Set up environment variables:
```bash
cd ../backend
cp .env.example .env
# Edit .env file with your configuration
```

### Running the Application

1. Start the backend server:
```bash
cd bls-exportpro/backend
npm run dev
```

2. In a new terminal, start the frontend:
```bash
cd bls-exportpro/frontend
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
bls-exportpro/
├── backend/          # Node.js/Express API
├── frontend/         # React application
├── shared/           # Shared TypeScript types
├── documentation/    # Project documentation
└── docs-info/       # Reference documents
```

## Available Scripts

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Run production build
- `npm run seed` - Seed database with sample data

### Frontend
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Configuration

See `CLAUDE.md` for detailed development guidelines and configuration options.

## License

Proprietary - Bohra Lifescience Private Limited

## Support

For support, please contact the development team.