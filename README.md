# Ethereum Block Dashboard

A TypeScript monorepo for real-time Ethereum blockchain monitoring and analysis, built with Express.js, Prisma, React, and Vite.

## 🏗️ Architecture

- **Backend**: Express.js with TypeScript, Prisma ORM, PostgreSQL
- **Frontend**: React with TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Database**: PostgreSQL 13 with Redis for caching
- **Infrastructure**: Docker Compose for local development

## 📁 Project Structure

```
ethereum-block-dashboard/
├── backend/
│   ├── src/
│   │   ├── app.ts              # Express app configuration
│   │   └── server.ts           # Server entry point
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page components
│   │   ├── lib/                # Utility functions
│   │   ├── types/              # TypeScript type definitions
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
├── docker/
│   └── init.sql                # Database initialization script
├── docker-compose.yml          # PostgreSQL and Redis containers
├── package.json                # Root monorepo configuration
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm 8+
- Docker and Docker Compose

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd ethereum-block-dashboard
npm install
```

### 2. Start Database Services

```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379 (if configured)

### 3. Configure Environment Variables

```bash
# Backend environment
cp backend/.env.example backend/.env

# Frontend environment
cp frontend/.env.example frontend/.env
```

Update the environment files with your actual configuration:
- Add your Ethereum RPC URL to the backend .env file
- Configure any API keys needed for external services

### 4. Setup Database

```bash
cd backend
npm run db:generate
npm run db:push
```

### 5. Start Development Servers

```bash
# Start both backend and frontend
npm run dev

# Or start individually
npm run dev:backend  # Runs on port 3001
npm run dev:frontend # Runs on port 3000
```

### Alternative: Using Docker Compose

```bash
# Start everything (database + services)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## 🗄️ Database Schema

The application uses PostgreSQL with the following main entities:

### Blocks
- Block number, hash, parent hash
- Miner, difficulty, gas limits
- Timestamp, transaction count
- EIP-1559 base fee (for post-London blocks)

### Transactions
- Transaction hash, block reference
- From/to addresses, value, gas data
- EIP-1559 fee structure
- Status, receipt information

## 🛠️ Available Scripts

### Root Level
- `npm run dev` - Start both backend and frontend
- `npm run build` - Build both applications
- `npm run docker:up` - Start PostgreSQL and Redis
- `npm run docker:down` - Stop containers

### Backend
- `npm run dev` - Start development server with tsx
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Prisma Studio

### Frontend
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test:e2e` - Run E2E tests with Playwright
- `npm run test:e2e:ui` - Run E2E tests with UI
- `npm run test:e2e:debug` - Debug E2E tests
- `npm run test:e2e:codegen` - Generate Playwright tests

## 🔧 Development

### Database Operations

```bash
# View database in Prisma Studio
cd backend && npm run db:studio

# Reset database
cd backend && npm run db:push --force-reset

# Run migrations
cd backend && npm run db:migrate
```

### Testing

#### End-to-End Testing with Playwright

```bash
# Run all E2E tests
cd frontend && npm run test:e2e

# Run tests with UI for better debugging
cd frontend && npm run test:e2e:ui

# Debug tests step by step
cd frontend && npm run test:e2e:debug

# Generate new tests by recording interactions
cd frontend && npm run test:e2e:codegen
```

The E2E tests cover:
- Dashboard data loading and rendering
- Theme switching (light/dark mode)
- Color theme cycling (Default/Blue/Gray)
- Auto-poll functionality
- Manual refresh functionality
- Responsive layout testing
- Error handling
- Chart rendering
- Data table interactions

### API Endpoints

- `GET /api/health` - Health check
- `GET /api/blocks` - Get latest blocks
- `GET /api/blocks/latest` - Get latest block with summary stats
- `GET /api/blocks/:id` - Get specific block details
- `GET /api/stats/top-senders` - Get top transaction senders
- `GET /api/stats/top-receivers` - Get top transaction receivers
- `GET /api/stats/top-gas-spenders` - Get addresses with highest gas fees
- `GET /api/charts/volume-per-block` - Get volume statistics for charting

## 📚 Technology Stack

### Backend
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 13
- **ORM**: Prisma
- **Cache**: Redis
- **Ethereum**: ethers.js (planned)

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Routing**: React Router
- **Data Visualization**: Recharts (Line, Bar, Area charts)
- **Date Formatting**: date-fns
- **State Management**: React Context
- **Theming**: Multi-theme support (Default, Blue, Gray, Dark modes)

### DevOps
- **Containerization**: Docker & Docker Compose
- **Package Manager**: npm workspaces
- **Build Tool**: TypeScript Compiler

## 🌐 Access Points

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Database: localhost:5432
- Redis: localhost:6379
- Prisma Studio: http://localhost:5555

## 📝 Features Implemented

### ✅ Completed Features
- **Backend API**: Complete Express.js API with PostgreSQL
- **Real-time Data**: Automatic polling every 30 seconds
- **Data Visualization**: Line, Bar, and Area charts with Recharts
- **Responsive Design**: Mobile-first layout with Tailwind CSS
- **Multi-theme Support**: Blue, Gray, and Default themes with dark mode
- **Advanced Dashboard**: Block info, KPI cards, data tables, and charts
- **Error Handling**: Global error boundary and graceful error recovery
- **E2E Testing**: Comprehensive Playwright test suite
- **Statistics**: Top senders, receivers, and gas spenders
- **Gas Analytics**: Gas usage trends and visualization

## 📝 Next Steps

- [ ] Add WebSocket support for real-time updates
- [ ] Implement advanced filtering and search functionality
- [ ] Add transaction detail pages and address exploration
- [ ] Set up production deployment with CI/CD
- [ ] Add user authentication and saved preferences
- [ ] Implement data export features (CSV, JSON)
- [ ] Add network status indicators and connection monitoring
- [ ] Implement caching strategies for better performance

## 📄 License

This project is licensed under the MIT License.