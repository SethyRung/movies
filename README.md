# Nuxt Movie

A Netflix-inspired movie and TV series website built with Nuxt 4, featuring embedded video playback from third-party sources, content browsing, video progress tracking, and database-backed content management.

## Tech Stack

- **Framework**: Nuxt 4 with App Router
- **UI**: Vue 3 Composition API, Nuxt UI components
- **Database**: PostgreSQL with Drizzle ORM
- **Deployment**: NuxtHub (Edge deployment, HubKV cache, HubBlob storage)
- **State Management**: Pinia with localStorage persistence
- **Styling**: Tailwind CSS v4
- **Animations**: GSAP

## Prerequisites

- Node.js 18+ and pnpm
- Docker (for local PostgreSQL)
- NuxtHub account (for production deployment)

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd nuxt-movie

# Install dependencies
pnpm install
```

## Database Setup

### Development (Local PostgreSQL)

```bash
# Start PostgreSQL database
docker-compose up -d

# Push schema changes (fast, for development)
pnpm db:push

# Or generate migration files (for production)
pnpm db:generate

# Seed database with sample data
pnpm db:seed

# Optional: Open Drizzle Studio GUI
pnpm db:studio
```

### Default Admin Credentials

After seeding, you can log in with:

- Email: `admin@example.com`
- Password: `admin123`

## Development

```bash
# Start development server
pnpm dev

# Open browser at http://localhost:3000
```

## Database Commands

```bash
pnpm db:push      # Push schema changes (dev)
pnpm db:generate  # Generate migration files (prod)
pnpm db:seed      # Seed database with sample data
pnpm db:studio    # Open Drizzle Studio GUI
```

## Deployment

### NuxtHub

```bash
# Link to NuxtHub project
npx nuxthub link

# Deploy to Edge
npx nuxthub deploy
```

### Production Build

```bash
pnpm build          # Build for production
pnpm preview        # Preview production build
```

## Project Structure

```
nuxt-movie/
├── app/
│   ├── components/
│   │   ├── layout/       # AppHeader, AppFooter
│   │   ├── media/        # HeroSection, BentoGrid, ContentRow, Cards
│   │   └── admin/        # Admin components
│   ├── composables/      # Vue composables
│   ├── layouts/          # Layout components
│   ├── middleware/       # Route middleware
│   ├── pages/            # File-based routing
│   ├── stores/           # Pinia stores
│   └── assets/
│       └── css/main.css  # Tailwind v4 theme
├── server/
│   ├── api/              # API routes
│   ├── db/
│   │   ├── schema.ts     # Drizzle ORM schema
│   │   └── index.ts      # Database connection
│   ├── tasks/            # Scheduled tasks
│   └── utils/            # Server utilities
└── shared/
    └── types/            # TypeScript type definitions
```

## Database Schema

- **users** - Admin authentication
- **movies** - Movie catalog
- **tvSeries** - TV series catalog
- **seasons** - Season information
- **episodes** - Episode data
- **genres** - Genre definitions
- **videoQualities** - Quality options
- **movieViews**, **episodeViews** - Analytics tracking

## API Endpoints

- `GET /api/movies` - List movies
- `GET /api/movies/[id]` - Single movie details
- `GET /api/series` - List TV series
- `GET /api/series/[id]` - Series with seasons/episodes
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/me` - Get current admin user

## 🛡️ License

This project is licensed under the [MIT License](LICENSE).

## 👨‍💻 Author

Made with ❤️ by [Sethy](https://github.com/SethyRung)
