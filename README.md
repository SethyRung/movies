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

## Development Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Start PostgreSQL Database (Local Development)

```bash
docker-compose up -d
```

### 3. Start Development Server

```bash
pnpm dev
```

> **Note:** Migrations are automatically applied when starting the dev server.

Open browser at http://localhost:3000

### 4. (Optional) Seed Database with Sample Data

> **Note:** This step is optional. Skip it if you want to start with an empty database or have already seeded before.

```bash
curl http://localhost:3000/_nitro/tasks/db:seed
```

#### Default Admin Credentials

After seeding, you can log in with:

- Email: `admin@example.com`
- Password: `admin123`

## Database Commands

```bash
# Migrations
pnpm exec nuxt db generate           # Generate migrations from schema
pnpm exec nuxt db migrate            # Apply migrations to database
pnpm exec nuxt db drop <TABLE>       # Drop a specific table
pnpm exec nuxt db drop-all           # Drop all tables (destructive!)
pnpm exec nuxt db sql "<QUERY>"      # Execute SQL query
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
│   │   └── schema.ts     # Drizzle ORM schema (connection via NuxtHub)
│   ├── tasks/            # Scheduled tasks (seeding, etc.)
│   ├── types/            # Server type definitions
│   └── utils/            # Server utilities
└── shared/
    └── types/            # TypeScript type definitions
```

## Database Schema

- **users** - Admin authentication
- **genres** - Genre definitions
- **movies** - Movie catalog
- **movieGenres** - Movie-genre associations
- **tvSeries** - TV series catalog
- **seriesGenres** - Series-genre associations
- **seasons** - Season information
- **episodes** - Episode data
- **movieViews** - Movie analytics tracking
- **episodeViews** - Episode analytics tracking

## API Endpoints

### Movies

- `GET /api/movies` - List movies (with filtering: status, featured, search, sortBy, sortOrder)
- `GET /api/movies/[id]` - Single movie details
- `POST /api/movies` - Create movie
- `PUT /api/movies/[id]` - Update movie
- `DELETE /api/movies/[id]` - Delete movie

### TV Series

- `GET /api/series` - List TV series
- `GET /api/series/[id]` - Series details
- `POST /api/series` - Create series
- `PUT /api/series/[id]` - Update series
- `DELETE /api/series/[id]` - Delete series
- `GET /api/series/[seriesId]/seasons` - List seasons for a series
- `POST /api/series/[seriesId]/seasons` - Create season

### Seasons & Episodes

- `GET /api/seasons/[id]` - Season details
- `PUT /api/seasons/[id]` - Update season
- `DELETE /api/seasons/[id]` - Delete season
- `GET /api/seasons/[seasonId]/episodes` - List episodes for a season
- `POST /api/seasons/[seasonId]/episodes` - Create episode
- `GET /api/episodes/[id]` - Episode details
- `PUT /api/episodes/[id]` - Update episode
- `DELETE /api/episodes/[id]` - Delete episode

### Genres

- `GET /api/genres` - List genres
- `GET /api/genres/[id]` - Genre details
- `POST /api/genres` - Create genre
- `PUT /api/genres/[id]` - Update genre
- `DELETE /api/genres/[id]` - Delete genre

### Views (Analytics)

- `GET /api/movie-views` - List movie views
- `GET /api/movie-views/[id]` - Movie view details
- `POST /api/movie-views` - Create movie view
- `PUT /api/movie-views/[id]` - Update movie view
- `DELETE /api/movie-views/[id]` - Delete movie view
- `GET /api/episode-views` - List episode views
- `GET /api/episode-views/[id]` - Episode view details
- `POST /api/episode-views` - Create episode view
- `PUT /api/episode-views/[id]` - Update episode view
- `DELETE /api/episode-views/[id]` - Delete episode view

## 🛡️ License

This project is licensed under the [MIT License](LICENSE).
