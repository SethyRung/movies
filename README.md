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

All API responses follow a standardized format:

### Response Structure

```ts
interface Response<T> {
  status: {
    code: ResponseCode; // Response status code (see below)
    message: string; // Human-readable message
    requestId: string; // Unique request identifier for debugging
    requestTime: number; // Request processing time in milliseconds
  };
  data: T; // Response payload (null on error)
  meta?: {
    // Present only for paginated list endpoints
    total: number; // Total number of records
    limit: number; // Records per page
    offset: number; // Current page offset
  };
}
```

### Response Codes

| Code               | Description                                     |
| ------------------ | ----------------------------------------------- |
| `SUCCESS`          | Request completed successfully                  |
| `ERROR`            | Generic error occurred                          |
| `NOT_FOUND`        | Requested resource not found                    |
| `VALIDATION_ERROR` | Invalid request data or missing required fields |
| `UNAUTHORIZED`     | Authentication required or invalid credentials  |
| `FORBIDDEN`        | Authenticated but lacks permission              |
| `INVALID_REQUEST`  | Malformed request syntax                        |
| `INTERNAL_ERROR`   | Server-side error                               |

### Example Responses

**Success (Single Item):**

```json
{
  "status": {
    "code": "SUCCESS",
    "message": "Movie retrieved successfully",
    "requestId": "req_abc123",
    "requestTime": 12
  },
  "data": {
    "id": 1,
    "title": "Inception",
    "status": "published"
  }
}
```

**Success (Paginated List):**

```json
{
  "status": {
    "code": "SUCCESS",
    "message": "Movies retrieved successfully",
    "requestId": "req_def456",
    "requestTime": 25
  },
  "data": [
    { "id": 1, "title": "Inception" },
    { "id": 2, "title": "The Matrix" }
  ],
  "meta": {
    "total": 100,
    "limit": 20,
    "offset": 0
  }
}
```

**Error:**

```json
{
  "status": {
    "code": "NOT_FOUND",
    "message": "Movie not found",
    "requestId": "req_ghi789",
    "requestTime": 5
  },
  "data": null
}
```

### Authentication

| Method | Endpoint               | Description                                            | Auth Required |
| ------ | ---------------------- | ------------------------------------------------------ | ------------- |
| POST   | `/api/auth/login`      | Admin login (returns `accessToken` and `refreshToken`) | No            |
| POST   | `/api/auth/refresh`    | Refresh access token using `refreshToken`              | No            |
| POST   | `/api/auth/logout`     | Logout (revoke specific refresh token)                 | No            |
| POST   | `/api/auth/logout-all` | Logout from all devices                                | Yes           |
| GET    | `/api/auth/me`         | Get current authenticated user                         | Yes           |

**Login Request Body:**

```json
{ "email": "admin@example.com", "password": "your-password" }
```

**Login/Refresh Response:**

```json
{ "accessToken": "jwt-access-token", "refreshToken": "jwt-refresh-token" }
```

**Refresh Request Body:**

```json
{ "refreshToken": "your-refresh-token" }
```

**Logout Request Body:**

```json
{ "refreshToken": "your-refresh-token" }
```

**Authorization Header (for protected routes):**

```
Authorization: Bearer <accessToken>
```

### Movies

| Method | Endpoint           | Description                               | Auth Required |
| ------ | ------------------ | ----------------------------------------- | ------------- |
| GET    | `/api/movies`      | List movies with filtering and pagination | Yes           |
| GET    | `/api/movies/[id]` | Get single movie details                  | Yes           |
| POST   | `/api/movies`      | Create a new movie                        | Yes           |
| PUT    | `/api/movies/[id]` | Update a movie                            | Yes           |
| DELETE | `/api/movies/[id]` | Delete a movie                            | Yes           |

**Query Parameters (GET /api/movies):**

- `limit` - Number of results (default: 20)
- `offset` - Pagination offset (default: 0)
- `status` - Filter by status (e.g., "published", "draft")
- `featured` - Filter featured movies (true/false)
- `search` - Search by title
- `sortBy` - Sort field (e.g., "title", "createdAt")
- `sortOrder` - Sort direction ("asc" or "desc")

### TV Series

| Method | Endpoint                         | Description                                  | Auth Required |
| ------ | -------------------------------- | -------------------------------------------- | ------------- |
| GET    | `/api/series`                    | List TV series with filtering and pagination | Yes           |
| GET    | `/api/series/[id]`               | Get series details                           | Yes           |
| POST   | `/api/series`                    | Create a new series                          | Yes           |
| PUT    | `/api/series/[id]`               | Update a series                              | Yes           |
| DELETE | `/api/series/[id]`               | Delete a series                              | Yes           |
| GET    | `/api/series/[seriesId]/seasons` | List seasons for a series                    | Yes           |
| POST   | `/api/series/[seriesId]/seasons` | Create a season for a series                 | Yes           |

**Query Parameters (GET /api/series):** Same as movies (limit, offset, status, featured, search, sortBy, sortOrder)

### Seasons

| Method | Endpoint                           | Description                    | Auth Required |
| ------ | ---------------------------------- | ------------------------------ | ------------- |
| GET    | `/api/seasons/[id]`                | Get season details             | Yes           |
| PUT    | `/api/seasons/[id]`                | Update a season                | Yes           |
| DELETE | `/api/seasons/[id]`                | Delete a season                | Yes           |
| GET    | `/api/seasons/[seasonId]/episodes` | List episodes for a season     | Yes           |
| POST   | `/api/seasons/[seasonId]/episodes` | Create an episode for a season | Yes           |

### Episodes

| Method | Endpoint             | Description         | Auth Required |
| ------ | -------------------- | ------------------- | ------------- |
| GET    | `/api/episodes/[id]` | Get episode details | Yes           |
| PUT    | `/api/episodes/[id]` | Update an episode   | Yes           |
| DELETE | `/api/episodes/[id]` | Delete an episode   | Yes           |

### Genres

| Method | Endpoint           | Description        | Auth Required |
| ------ | ------------------ | ------------------ | ------------- |
| GET    | `/api/genres`      | List all genres    | Yes           |
| GET    | `/api/genres/[id]` | Get genre details  | Yes           |
| POST   | `/api/genres`      | Create a new genre | Yes           |
| PUT    | `/api/genres/[id]` | Update a genre     | Yes           |
| DELETE | `/api/genres/[id]` | Delete a genre     | Yes           |

### Movie Views (Analytics)

| Method | Endpoint                | Description                          | Auth Required |
| ------ | ----------------------- | ------------------------------------ | ------------- |
| GET    | `/api/movie-views`      | List movie views with pagination     | Yes           |
| GET    | `/api/movie-views/[id]` | Get movie view details               | Yes           |
| POST   | `/api/movie-views`      | Create a movie view record           | Yes           |
| PUT    | `/api/movie-views/[id]` | Update a movie view (e.g., progress) | Yes           |
| DELETE | `/api/movie-views/[id]` | Delete a movie view record           | Yes           |

**Query Parameters (GET /api/movie-views):**

- `limit` - Number of results (default: 20)
- `offset` - Pagination offset (default: 0)
- `movieId` - Filter by movie ID
- `userId` - Filter by user ID

### Episode Views (Analytics)

| Method | Endpoint                  | Description                             | Auth Required |
| ------ | ------------------------- | --------------------------------------- | ------------- |
| GET    | `/api/episode-views`      | List episode views with pagination      | Yes           |
| GET    | `/api/episode-views/[id]` | Get episode view details                | Yes           |
| POST   | `/api/episode-views`      | Create an episode view record           | Yes           |
| PUT    | `/api/episode-views/[id]` | Update an episode view (e.g., progress) | Yes           |
| DELETE | `/api/episode-views/[id]` | Delete an episode view record           | Yes           |

**Query Parameters (GET /api/episode-views):**

- `limit` - Number of results (default: 20)
- `offset` - Pagination offset (default: 0)
- `episodeId` - Filter by episode ID
- `userId` - Filter by user ID

## 🛡️ License

This project is licensed under the [MIT License](LICENSE).
