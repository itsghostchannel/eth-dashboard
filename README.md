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
npm run docker:up
```

### 3. Configure Environment Variables

```bash
# Root environment
cp .env.example .env

# Backend environment
cp backend/.env.example backend/.env

# Frontend environment
cp frontend/.env.example frontend/.env
```

Update the environment files with your actual configuration:
- Add your Infura Project ID to the backend and frontend .env files
- Add your Etherscan API key to the backend .env file

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

### API Endpoints

- `GET /api/health` - Health check
- `GET /api/blocks` - Get latest blocks
- `GET /api/blocks/:id` - Get specific block details
- `GET /api/transactions` - Get transactions (planned)
- `GET /api/transactions/:hash` - Get transaction details (planned)

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
- **State Management**: React Context (planned)

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

## 📝 Next Steps

- [ ] Connect to Ethereum RPC provider
- [ ] Implement real-time WebSocket connections
- [ ] Add transaction monitoring
- [ ] Build comprehensive UI components
- [ ] Add authentication and user preferences
- [ ] Implement advanced filtering and search
- [ ] Add data visualization charts
- [ ] Set up production deployment

## 📄 License

This project is licensed under the MIT License.