# Discord Bot Dashboard

A comprehensive dashboard for monitoring and managing your Discord bot's performance, statistics, and user interactions.

## 🚀 Features

- **Real-time Statistics**: Total servers, members, matches, and commands executed
- **Performance Metrics**: Success rate, average response time, and error tracking
- **Server Management**: Configuration overview and member statistics
- **Match Tracking**: Comprehensive match database with filtering
- **Command Analytics**: Track all bot command executions and usage patterns
- **Support Tickets**: User support request management
- **Team Popularity**: Most used teams and usage statistics

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Recharts
- **Backend**: Node.js, Express, Prisma ORM, PostgreSQL
- **Authentication**: Discord OAuth2 with JWT sessions

## 🔐 Authentication

This dashboard uses Discord OAuth2 for authentication. Only authorized users can access the dashboard.

### Setup Discord OAuth2

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to OAuth2 section
4. Add redirect URI: `http://localhost:5000/auth/callback` (development)
5. Copy Client ID and Client Secret

### Environment Variables

Create a `.env` file with:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
PORT=5000
NODE_ENV=production

# Discord OAuth2
VITE_DISCORD_CLIENT_ID="YOUR_CLIENT_ID"
VITE_DISCORD_CLIENT_SECRET="YOUR_CLIENT_SECRET"
VITE_DISCORD_REDIRECT_URI="http://localhost:5000/auth/callback"

# Application URL
BASE_URL="http://localhost:3000"

# Security
JWT_SECRET="YOUR_JWT_SECRET"
AUTHORIZED_USER_IDS="YOUR_USER_ID"

# Redis (for session store)
REDIS_URL="redis://localhost:6379"
```

### User Authorization

Add Discord User IDs to `AUTHORIZED_USER_IDS` (comma-separated) to control access:

```env
AUTHORIZED_USER_IDS="123456789,987654321"
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

```bash
npx prisma generate
npx prisma migrate dev
```

### 3. Start Development

```bash
npm run dev
```

Access the dashboard at `http://localhost:3000`

## 🗄️ Database Schema

### Core Models

- **Match**: Match data with scores, teams, and status
- **GuildSettings**: Server configurations and settings
- **CommandStat**: Command execution tracking
- **Ticket**: Support ticket management
- **PerformanceMetric**: Bot performance data
- **TeamPopularity**: Team usage analytics

## 🔌 API Endpoints

- `GET /api/stats` - Dashboard statistics
- `GET /api/servers` - Server configurations
- `GET /api/matches` - Match data
- `GET /api/command-stats` - Command analytics
- `GET /api/tickets` - Support tickets
- `GET /api/team-popularity` - Team usage

## 🐳 Deployment

### Docker

```bash
docker build -t discord-bot-dashboard .
docker run -p 5000:5000 discord-bot-dashboard
```

### Coolify

Use the provided `coolify.yaml` for deployment.

## 📄 License

MIT License
