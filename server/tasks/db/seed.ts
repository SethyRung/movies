import { db, schema } from "@nuxthub/db";
import bcrypt from "bcryptjs";
import { mockMovies, mockSeries, ADMIN_UUID } from "#shared/mockData";

const ADMIN_CREDENTIALS = {
  name: "Admin User",
  email: "admin@example.com",
  password: "admin123",
};

// Genre mapping from mock data names to slugs
const GENRE_NAME_TO_SLUG: Record<string, string> = {
  Action: "action",
  Comedy: "comedy",
  Drama: "drama",
  Horror: "horror",
  "Sci-Fi": "sci-fi",
  Thriller: "thriller",
  Romance: "romance",
  Documentary: "documentary",
  Animation: "animation",
  Fantasy: "fantasy",
  Adventure: "adventure",
  Crime: "crime",
  Family: "family",
  Music: "music",
  Biography: "biography",
  History: "history",
};

// Extract unique genres from mock data
function extractGenres(): { name: string; slug: string }[] {
  const genreSet = new Set<string>();

  mockMovies.forEach((movie) => {
    movie.genres.forEach((g) => genreSet.add(g));
  });

  mockSeries.forEach((series) => {
    series.genres.forEach((g) => genreSet.add(g));
  });

  return Array.from(genreSet)
    .map((name) => ({
      name,
      slug: GENRE_NAME_TO_SLUG[name] || name.toLowerCase(),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

const GENRES = extractGenres();

export default defineTask({
  meta: {
    name: "db:seed",
    description: "Seed database with mock data from shared/mockData.ts",
  },
  async run() {
    try {
      await clearDatabase();

      const userId = await seedUser();
      const genreIds = await seedGenres();

      await seedMovies(userId, genreIds);
      await seedSeries(userId, genreIds);

      console.info("\n=== Seeding Complete ===");

      return { result: "Database seeded successfully!" };
    } catch (error) {
      console.error("Error seeding database:", error);
      throw error;
    }
  },
});

async function clearDatabase() {
  console.info("Clearing existing data...");

  // Delete in order of dependencies (children first)
  await db.delete(schema.movieGenres);
  await db.delete(schema.movieViews);
  await db.delete(schema.movies);

  await db.delete(schema.seriesGenres);
  await db.delete(schema.episodeViews);
  await db.delete(schema.episodes);
  await db.delete(schema.seasons);
  await db.delete(schema.tvSeries);

  await db.delete(schema.users);
  await db.delete(schema.genres);
}

async function seedUser(): Promise<string> {
  console.info("Seeding admin user...");

  const passwordHash = await bcrypt.hash(ADMIN_CREDENTIALS.password, 10);

  const [user] = await db
    .insert(schema.users)
    .values({
      id: ADMIN_UUID,
      name: ADMIN_CREDENTIALS.name,
      email: ADMIN_CREDENTIALS.email,
      passwordHash,
    })
    .returning();

  if (!user) {
    throw new Error("Failed to create admin user");
  }

  console.info(`Created admin user: ${user.id}`);
  return user.id;
}

async function seedGenres(): Promise<Record<string, string>> {
  console.info("Seeding genres...");

  const genreIds: Record<string, string> = {};

  for (const genre of GENRES) {
    const [inserted] = await db.insert(schema.genres).values(genre).returning();

    if (inserted) {
      genreIds[genre.name] = inserted.id;
      genreIds[genre.slug] = inserted.id;
    }
  }

  console.info(`Created ${Object.keys(genreIds).length / 2} genres`);
  return genreIds;
}

async function seedMovies(userId: string, genreIds: Record<string, string>): Promise<void> {
  console.info("Seeding movies...");

  const movieGenresData: { movieId: string; genreId: string }[] = [];

  const moviesInserted = await db
    .insert(schema.movies)
    .values(
      mockMovies.map((movie) => ({
        id: movie.id,
        title: movie.title,
        description: movie.description,
        thumbnail: movie.thumbnail,
        poster: movie.poster,
        duration: movie.duration,
        embedUrl: movie.trailer
          ? `https://www.youtube.com/embed/${movie.trailer}`
          : "https://www.youtube.com/embed/dQw4w9WgXcQ",
        embedType: "youtube",
        releaseYear: movie.releaseYear,
        rating: movie.rating.toString(),
        featured: movie.featured,
        status: "active",
        createdBy: userId,
      })),
    )
    .returning();

  // Create genre associations
  for (const movie of moviesInserted) {
    const movieData = mockMovies.find((m) => m.id === movie.id);
    if (!movieData) continue;

    for (const genreName of movieData.genres) {
      const genreId = genreIds[genreName];
      if (genreId) {
        movieGenresData.push({ movieId: movie.id, genreId });
      }
    }
  }

  await db.insert(schema.movieGenres).values(movieGenresData);
  console.info(
    `Created ${moviesInserted.length} movies with ${movieGenresData.length} genre associations`,
  );
}

async function seedSeries(userId: string, genreIds: Record<string, string>): Promise<void> {
  console.info("Seeding TV series...");

  const seriesGenresData: { seriesId: string; genreId: string }[] = [];

  const seriesInserted = await db
    .insert(schema.tvSeries)
    .values(
      mockSeries.map((series) => ({
        id: series.id,
        title: series.title,
        description: series.description,
        thumbnail: series.thumbnail,
        poster: series.poster,
        firstAiredYear: series.firstAiredYear,
        lastAiredYear: series.lastAiredYear,
        rating: series.rating.toString(),
        featured: series.featured,
        status:
          series.status === "Running"
            ? "ongoing"
            : series.status === "Ended"
              ? "completed"
              : "ongoing",
        createdBy: userId,
      })),
    )
    .returning();

  // Create genre associations and seasons/episodes
  for (const series of seriesInserted) {
    const seriesData = mockSeries.find((s) => s.id === series.id);
    if (!seriesData) continue;

    // Create genre associations
    for (const genreName of seriesData.genres) {
      const genreId = genreIds[genreName];
      if (genreId) {
        seriesGenresData.push({ seriesId: series.id, genreId });
      }
    }

    // Create mock seasons and episodes based on series data
    await seedMockSeasonsAndEpisodes(series.id, seriesData.seasons, seriesData.episodes);
  }

  await db.insert(schema.seriesGenres).values(seriesGenresData);
  console.info(
    `Created ${seriesInserted.length} TV series with ${seriesGenresData.length} genre associations`,
  );
}

async function seedMockSeasonsAndEpisodes(
  seriesId: string,
  seasonCount: number,
  episodeCount: number,
) {
  const episodesPerSeason = Math.ceil(episodeCount / seasonCount);

  for (let seasonNum = 1; seasonNum <= seasonCount; seasonNum++) {
    const episodesInThisSeason =
      seasonNum === seasonCount
        ? episodeCount - episodesPerSeason * (seasonNum - 1)
        : episodesPerSeason;

    const [season] = await db
      .insert(schema.seasons)
      .values({
        seriesId,
        seasonNumber: seasonNum,
        title: `Season ${seasonNum}`,
        description: `Season ${seasonNum} of the series.`,
        episodeCount: episodesInThisSeason,
      })
      .returning();

    if (!season) continue;

    // Create episodes for this season
    const episodesData = [];
    for (let epNum = 1; epNum <= episodesInThisSeason; epNum++) {
      episodesData.push({
        seasonId: season.id,
        episodeNumber: epNum,
        duration: 45 * 60, // 45 minutes in seconds
        embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        embedType: "youtube",
        status: "active",
      });
    }

    if (episodesData.length > 0) {
      await db.insert(schema.episodes).values(episodesData);
    }
  }

  console.info(`Created ${seasonCount} seasons with ${episodeCount} episodes`);
}
