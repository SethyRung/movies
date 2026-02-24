# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Netflix-inspired movie and TV series website built with Nuxt 4, featuring embedded video playback, content browsing, video progress tracking, and database-backed content management.

## Development Commands

```bash
# Start PostgreSQL database (required for local development)
docker-compose up -d

# Start development server (migrations auto-apply on startup)
pnpm dev

# Build and preview production
pnpm build
pnpm preview

# Linting and formatting
pnpm lint          # Run oxlint
pnpm lint:fix      # Run oxlint with auto-fix
pnpm fmt           # Run oxfmt
pnpm fmt:check     # Check formatting without changes

# Database commands (via NuxtHub)
pnpm exec nuxt db generate        # Generate migrations from schema
pnpm exec nuxt db migrate         # Apply migrations
pnpm exec nuxt db drop <TABLE>    # Drop specific table
pnpm exec nuxt db drop-all        # Drop all tables (destructive)
pnpm exec nuxt db sql "<QUERY>"   # Execute SQL query

# Seed database with sample data
curl http://localhost:3000/_nitro/tasks/db:seed
```

## Tech Stack

- **Framework**: Nuxt 4 with Vue 3 Composition API
- **UI**: Nuxt UI components, Tailwind CSS v4
- **Database**: PostgreSQL with Drizzle ORM (via NuxtHub)
- **State Management**: Pinia with localStorage persistence
- **Animations**: GSAP
- **Deployment**: NuxtHub (Edge deployment, HubKV cache, HubBlob storage)

## Architecture

### Directory Structure

- `app/` - Frontend application
  - `components/` - Vue components (layout, media, promo)
  - `composables/` - Vue composables for data fetching and media queries
  - `pages/` - File-based routing (index, movies, tv-series)
  - `layouts/` - Layout components
  - `assets/css/main.css` - Tailwind v4 theme configuration
- `server/` - Backend API and database
  - `api/` - REST API routes (movies, series, genres, auth, views)
  - `db/schema.ts` - Drizzle ORM schema definitions
  - `utils/` - Server utilities (auth, response helpers)
  - `tasks/` - Nitro tasks (e.g., db seeding)
- `shared/types/` - Shared TypeScript types inferred from database schema

### Key Patterns

**API Response Format**: All API endpoints use a standardized response wrapper:
```typescript
// Use createResponse utility for consistent API responses
import { createResponse } from "#build/server/utils/response";
createResponse({ code: ResponseCode.Success }, data, { total, limit, offset });
```

**Type Inference**: Database types are inferred from Drizzle schema:
```typescript
import type { Movie, TVSeries, Genre } from "#shared/types";
// Types are auto-generated from server/db/schema.ts
```

**Data Fetching**: Use the `useApiData` composable for API calls:
```typescript
const { data, isLoading, error, refresh } = useApiData<Movie>({
  endpoint: "movies",
  query: { status: "active", featured: true },
});
```

### Database Schema

Tables: `users`, `genres`, `movies`, `movieGenres`, `tvSeries`, `seriesGenres`, `seasons`, `episodes`, `movieViews`, `episodeViews`, `refreshTokens`

Key relationships:
- Movies/TVSeries have many Genres (via junction tables)
- TVSeries have many Seasons, Seasons have many Episodes
- Views track watch progress for movies and episodes

## Environment Setup

Copy `.env.example` to `.env` and configure:
- Database credentials (match docker-compose.yml)
- JWT secrets for authentication
