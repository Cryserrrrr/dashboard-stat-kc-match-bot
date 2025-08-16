# Discord Bot Dashboard

A comprehensive dashboard for monitoring and managing your Discord bot's performance, statistics, and user interactions.

## 🚀 Features

### 📊 Dashboard Overview

- **Real-time Statistics**: Total servers, members, matches, and commands executed
- **Performance Metrics**: Success rate, average response time, and error tracking
- **Configuration Insights**: Server settings and notification preferences
- **Team Popularity**: Most used teams and usage statistics
- **Support Management**: Ticket tracking and resolution status

### 🖥️ Pages & Sections

#### **Overview Dashboard**

- Total servers and members across all Discord servers
- Match statistics by status and KC team
- Command execution metrics and performance
- Recent matches with detailed information
- Team popularity rankings
- Support ticket statistics

#### **Servers Management**

- Complete server configuration overview
- Member counts and join dates
- Notification settings (pre-match and score updates)
- Team filtering configurations
- Ping role management
- Most filtered teams analysis

#### **Matches Tracking**

- Comprehensive match database with filtering
- Search by status, KC team, and date
- Pagination for large datasets
- Match details including scores, opponents, and tournaments

#### **Command Statistics** ⭐ NEW

- Track all bot command executions
- User interaction analytics
- Command popularity and usage patterns
- Team argument tracking for team-specific commands
- Search and filter capabilities

#### **Support Tickets** ⭐ NEW

- User support request management
- Bug reports and improvement suggestions
- Ticket status tracking (Open, In Progress, Resolved, Closed)
- User and server association
- Description and resolution tracking

## 🛠️ Tech Stack

### Frontend

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Lucide React** for icons
- **Vite** for build tooling

### Backend

- **Node.js** with Express
- **Prisma ORM** for database management
- **PostgreSQL** database
- **TypeScript** for type safety

### Development Tools

- **Concurrently** for running multiple processes
- **TSX** for TypeScript execution
- **ESLint** for code quality

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database
- Discord Bot Token (for bot integration)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd discord-bot-dashboard
npm install
```

### 2. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev
```

### 3. Environment Configuration

Create a `.env` file:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
PORT=5000
```

### 4. Start Development

```bash
# Start both frontend and backend
npm run dev

# Or start separately
npm run dev:server  # Backend on port 5000
npm run dev:client  # Frontend on port 3000
```

## 🗄️ Database Schema

### Core Models

#### **Match**

```prisma
model Match {
  id              String   @id // PandaScore ID
  kcTeam          String   // KC team name (KC, KCB, KCBS, etc.)
  kcId            String   // KC team ID
  opponent        String   // Opponent team name
  opponentImage   String?  // Opponent team image URL
  leagueName      String   // League name
  leagueImage     String?  // League image URL
  serieName       String   // Serie name
  tournamentName  String   // Tournament name
  tournamentId    String?  // Tournament ID from PandaScore
  hasBracket      Boolean  @default(false)
  numberOfGames   Int      // Number of games in the match
  beginAt         DateTime // Match date/time
  status          String   @default("scheduled") // scheduled, pre-announced, live, finished, announced
  score           String?  // Match score (e.g., "2-1", "3-0")
  createdAt       DateTime @default(now())
}
```

#### **GuildSettings** (Enhanced)

```prisma
model GuildSettings {
  guildId                    String @id
  name                       String // Server name
  memberCount                Int    @default(0) // Number of members
  channelId                  String // Discord channel ID
  pingRoles                  String[] @default([]) // Array of role IDs to ping
  filteredTeams              String[] @default([]) // Array of team IDs to filter matches
  enablePreMatchNotifications Boolean @default(true) // Enable/disable 30-minute pre-match notifications
  enableScoreNotifications    Boolean @default(true) // Enable/disable score notifications
  joinedAt                   DateTime @default(now())
  updatedAt                  DateTime @updatedAt

  // Relations
  commandStats    CommandStat[]
  tickets         Ticket[]
  performanceMetrics PerformanceMetric[]
}
```

### New Analytics Models ⭐

#### **CommandStat**

```prisma
model CommandStat {
  id        String   @id @default(cuid())
  guildId   String   // Discord Guild ID
  commandName String // Command name (nextmatch, standing, etc.)
  userId    String   // Discord User ID
  username  String   // Username
  teamArg   String?  // Team argument used
  executedAt DateTime @default(now())

  guild     GuildSettings? @relation(fields: [guildId], references: [guildId])
}
```

#### **Ticket**

```prisma
model Ticket {
  id          String   @id @default(cuid())
  guildId     String   // Discord Guild ID
  userId      String   // Discord User ID
  username    String   // Username
  type        TicketType // BUG or IMPROVEMENT
  status      TicketStatus @default(OPEN) // OPEN, IN_PROGRESS, RESOLVED, CLOSED
  description String?  // Optional description
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  guild       GuildSettings @relation(fields: [guildId], references: [guildId])
}
```

#### **PerformanceMetric**

```prisma
model PerformanceMetric {
  id              String   @id @default(cuid())
  guildId         String?  // Discord Guild ID (can be null for global metrics)
  commandName     String   // Command name
  responseTime    Int      // Response time in milliseconds
  success         Boolean  // Success status
  errorMessage    String?  // Error message if failed
  executedAt      DateTime @default(now())

  guild           GuildSettings? @relation(fields: [guildId], references: [guildId])
}
```

#### **TeamPopularity**

```prisma
model TeamPopularity {
  id          String   @id @default(cuid())
  teamId      String   // Team ID (KC, KCB, etc.)
  teamName    String   // Team name
  usageCount  Int      @default(0) // Usage count
  lastUsed    DateTime @default(now())
}
```

## 🔌 API Endpoints

### Core Endpoints

- `GET /api/health` - Health check
- `GET /api/stats` - Dashboard statistics
- `GET /api/servers` - Server configurations
- `GET /api/matches` - Match data with pagination

### New Analytics Endpoints ⭐

- `GET /api/command-stats` - Command execution statistics
- `GET /api/tickets` - Support ticket management
- `GET /api/team-popularity` - Team usage analytics
- `GET /api/performance-metrics` - Bot performance data

## 🐳 Deployment

### Docker

```bash
# Build and run with Docker
docker build -t discord-bot-dashboard .
docker run -p 5000:5000 discord-bot-dashboard
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Coolify Deployment

Use the provided `coolify.yaml` for easy deployment on Coolify platform.

## 📈 Analytics & Insights

### Performance Tracking

- **Response Time Monitoring**: Track command execution speed
- **Success Rate Analysis**: Monitor bot reliability
- **Error Tracking**: Identify and resolve issues quickly
- **Usage Patterns**: Understand user behavior

### User Engagement

- **Command Popularity**: See which commands are most used
- **Team Preferences**: Track which teams users are most interested in
- **Server Activity**: Monitor server engagement levels
- **Support Requests**: Manage user feedback and issues

### Configuration Management

- **Server Settings**: Overview of all server configurations
- **Notification Preferences**: Track notification settings
- **Team Filtering**: Monitor team filtering usage
- **Member Statistics**: Track server growth and activity

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

**Database Connection Error**

- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database exists and is accessible

**Prisma Client Issues**

- Run `npx prisma generate` after schema changes
- Check for migration conflicts

**Build Errors**

- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript compilation: `npm run build`

**API Endpoint Errors**

- Verify server is running on correct port
- Check CORS configuration
- Ensure database tables exist

For more help, check the issues section or create a new one.
