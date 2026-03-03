import { db, schema } from "@nuxthub/db";
import bcrypt from "bcryptjs";
import { ADMIN_CREDENTIALS, GENRES, MOVIES, SERIES } from "#server/data";

export default defineTask({
  meta: {
    name: "db:seed",
    description:
      "Seed database with initial data (users, genres, movies, TV series, seasons, episodes)",
  },
  async run() {
    try {
      await clearDatabase();

      const userId = await seedUser();
      const genreIds = await seedGenres();

      await seedMovies(userId, genreIds);
      await seedSeries(userId, genreIds);

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
      genreIds[genre.slug] = inserted.id;
    }
  }

  console.info(`Created ${Object.keys(genreIds).length} genres`);
  return genreIds;
}

async function seedMovies(userId: string, genreIds: Record<string, string>) {
  console.info("Seeding movies...");

  const movieGenresData: { movieId: string; genreId: string }[] = [];

  const moviesInserted = await db
    .insert(schema.movies)
    .values(
      MOVIES.map((movie) => ({
        title: movie.title,
        description: movie.description,
        thumbnail: movie.thumbnail,
        poster: movie.poster,
        duration: movie.duration,
        embedUrl: movie.embedUrl,
        embedType: movie.embedType,
        releaseYear: movie.releaseYear,
        rating: movie.rating,
        featured: movie.featured,
        status: movie.status,
        createdBy: userId,
      })),
    )
    .returning();

  // Create genre associations
  for (const movie of moviesInserted) {
    const movieData = MOVIES.find((m) => m.title === movie.title);
    if (!movieData) continue;

    for (const genreSlug of movieData.genres) {
      const genreId = genreIds[genreSlug];
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

async function seedSeries(userId: string, genreIds: Record<string, string>) {
  console.info("Seeding TV series...");

  const seriesGenresData: { seriesId: string; genreId: string }[] = [];

  const seriesInserted = await db
    .insert(schema.tvSeries)
    .values(
      SERIES.map((series) => ({
        title: series.title,
        description: series.description,
        thumbnail: series.thumbnail,
        poster: series.poster,
        firstAiredYear: series.firstAiredYear,
        lastAiredYear: series.lastAiredYear,
        rating: series.rating,
        featured: series.featured,
        status: series.status,
        createdBy: userId,
      })),
    )
    .returning();

  // Create genre associations and seasons/episodes
  for (const series of seriesInserted) {
    const seriesData = SERIES.find((s) => s.title === series.title);
    if (!seriesData) continue;

    // Create genre associations
    for (const genreSlug of seriesData.genres) {
      const genreId = genreIds[genreSlug];
      if (genreId) {
        seriesGenresData.push({ seriesId: series.id, genreId });
      }
    }

    // Create seasons and episodes
    if (seriesData.seasons.length > 0) {
      await seedSeasonsAndEpisodes(series.id, seriesData.seasons);
    }
  }

  await db.insert(schema.seriesGenres).values(seriesGenresData);
  console.info(
    `Created ${seriesInserted.length} TV series with ${seriesGenresData.length} genre associations`,
  );
}

async function seedSeasonsAndEpisodes(seriesId: string, seasons: (typeof SERIES)[0]["seasons"]) {
  for (const seasonData of seasons) {
    const [season] = await db
      .insert(schema.seasons)
      .values({
        seriesId,
        seasonNumber: seasonData.seasonNumber,
        title: seasonData.title,
        description: seasonData.description,
        thumbnail: seasonData.thumbnail,
        releaseYear: seasonData.releaseYear,
        episodeCount: seasonData.episodeCount ?? seasonData.episodes.length,
      })
      .returning();

    if (!season) continue;

    await db.insert(schema.episodes).values(
      seasonData.episodes.map((episode) => ({
        seasonId: season.id,
        episodeNumber: episode.episodeNumber,
        duration: episode.duration,
        embedUrl: episode.embedUrl,
        embedType: episode.embedType,
        status: episode.status,
      })),
    );
  }

  const totalEpisodes = seasons.reduce((sum, s) => sum + s.episodes.length, 0);
  console.info(`Created ${seasons.length} seasons with ${totalEpisodes} episodes`);
}
