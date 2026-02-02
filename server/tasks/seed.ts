import { db, schema } from "@nuxthub/db";
import bcrypt from "bcryptjs";

const ADMIN_CREDENTIALS = {
  name: "Admin User",
  email: "admin@example.com",
  password: "admin123",
};

const GENRES = [
  { name: "Action", slug: "action" },
  { name: "Comedy", slug: "comedy" },
  { name: "Drama", slug: "drama" },
  { name: "Horror", slug: "horror" },
  { name: "Sci-Fi", slug: "sci-fi" },
  { name: "Thriller", slug: "thriller" },
  { name: "Romance", slug: "romance" },
  { name: "Documentary", slug: "documentary" },
  { name: "Animation", slug: "animation" },
  { name: "Fantasy", slug: "fantasy" },
  { name: "Adventure", slug: "adventure" },
  { name: "Crime", slug: "crime" },
  { name: "Family", slug: "family" },
  { name: "Music", slug: "music" },
];

const MOVIES = [
  {
    title: "Interstellar",
    description:
      "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    thumbnail:
      "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    duration: 169,
    embedUrl: "https://www.youtube.com/embed/zSWdZVtXT7E",
    embedType: "youtube" as const,
    releaseYear: 2014,
    rating: "8.7",
    featured: true,
    genres: ["sci-fi", "adventure", "drama"],
  },
  {
    title: "The Dark Knight",
    description:
      "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    thumbnail:
      "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    duration: 152,
    embedUrl: "https://www.youtube.com/embed/EXeTwQWrcwY",
    embedType: "youtube" as const,
    releaseYear: 2008,
    rating: "9.0",
    featured: true,
    genres: ["action", "crime", "drama"],
  },
  {
    title: "Inception",
    description:
      "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    thumbnail:
      "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    poster: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    duration: 148,
    embedUrl: "https://www.youtube.com/embed/YoHD9XEInc0",
    embedType: "youtube" as const,
    releaseYear: 2010,
    rating: "8.8",
    featured: true,
    genres: ["sci-fi", "action", "thriller"],
  },
  {
    title: "Pulp Fiction",
    description:
      "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
    thumbnail:
      "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    poster: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    duration: 154,
    embedUrl: "https://www.youtube.com/embed/s7EdQ4FqbhY",
    embedType: "youtube" as const,
    releaseYear: 1994,
    rating: "8.9",
    genres: ["crime", "drama"],
  },
  {
    title: "The Matrix",
    description:
      "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
    thumbnail:
      "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    poster: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    duration: 136,
    embedUrl: "https://www.youtube.com/embed/vKQi3bBA1y8",
    embedType: "youtube" as const,
    releaseYear: 1999,
    rating: "8.7",
    genres: ["sci-fi", "action"],
  },
  {
    title: "Parasite",
    description:
      "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
    thumbnail:
      "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    poster: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    duration: 132,
    embedUrl: "https://www.youtube.com/embed/5xH0HfJHsaY",
    embedType: "youtube" as const,
    releaseYear: 2019,
    rating: "8.6",
    genres: ["thriller", "drama", "comedy"],
  },
  {
    title: "Spirited Away",
    description:
      "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits.",
    thumbnail:
      "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
    poster: "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
    duration: 125,
    embedUrl: "https://www.youtube.com/embed/ByXuk9QqQkk",
    embedType: "youtube" as const,
    releaseYear: 2001,
    rating: "8.6",
    genres: ["animation", "fantasy", "family"],
  },
  {
    title: "The Shawshank Redemption",
    description:
      "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    thumbnail:
      "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    poster: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    duration: 142,
    embedUrl: "https://www.youtube.com/embed/6hB3S9bIaco",
    embedType: "youtube" as const,
    releaseYear: 1994,
    rating: "9.3",
    genres: ["drama"],
  },
];

const SERIES = [
  {
    title: "Breaking Bad",
    description:
      "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family's future.",
    thumbnail: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
    poster: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
    firstAiredYear: 2008,
    lastAiredYear: 2013,
    rating: "9.5",
    featured: true,
    status: "completed" as const,
    genres: ["crime", "drama", "thriller"],
    seasons: [
      {
        seasonNumber: 1,
        title: "Season 1",
        description:
          "Walter White, a chemistry teacher, discovers that he has cancer and decides to enter the drug trade to provide for his family.",
        thumbnail:
          "https://image.tmdb.org/t/p/w500/gFZjCcQ6eIvHdJLYCdyA83mFLQc.jpg",
        releaseYear: 2008,
        episodes: [
          {
            episodeNumber: 1,
            duration: 58,
            embedUrl: "https://www.youtube.com/embed/eHjWw85hWm0",
          },
          {
            episodeNumber: 2,
            duration: 48,
            embedUrl: "https://www.youtube.com/embed/YjAIpKVGpLQ",
          },
          {
            episodeNumber: 3,
            duration: 48,
            embedUrl: "https://www.youtube.com/embed/OPj_KXcGHgQ",
          },
          {
            episodeNumber: 4,
            duration: 48,
            embedUrl: "https://www.youtube.com/embed/rljY5EVKYd8",
          },
          {
            episodeNumber: 5,
            duration: 48,
            embedUrl: "https://www.youtube.com/embed/o8ZfU-cZSPs",
          },
          {
            episodeNumber: 6,
            duration: 48,
            embedUrl: "https://www.youtube.com/embed/CP__7Q3Y4D0",
          },
          {
            episodeNumber: 7,
            duration: 48,
            embedUrl: "https://www.youtube.com/embed/hCdkA27_1rM",
          },
        ],
      },
      {
        seasonNumber: 2,
        title: "Season 2",
        description:
          "Walter and Jesse continue their drug operation while facing personal and professional complications.",
        thumbnail:
          "https://image.tmdb.org/t/p/w500/2BHmx5AZvHanS2qwoq9Nu4VkaH5.jpg",
        releaseYear: 2009,
        episodes: [
          {
            episodeNumber: 1,
            duration: 48,
            embedUrl: "https://www.youtube.com/embed/KH69-jGbQIA",
          },
          {
            episodeNumber: 2,
            duration: 48,
            embedUrl: "https://www.youtube.com/embed/9I6pJ4fKYWs",
          },
          {
            episodeNumber: 3,
            duration: 48,
            embedUrl: "https://www.youtube.com/embed/mJcOtM_-B28",
          },
        ],
      },
      {
        seasonNumber: 3,
        title: "Season 3",
        description:
          "The third season follows Walter and Jesse as they expand their operation and face new enemies.",
        thumbnail:
          "https://image.tmdb.org/t/p/w500/saeEzXRKFvERKF1wG4qjJJ3fGZL.jpg",
        releaseYear: 2010,
        episodes: [
          {
            episodeNumber: 1,
            duration: 48,
            embedUrl: "https://www.youtube.com/embed/Po2oCQAAGHk",
          },
          {
            episodeNumber: 2,
            duration: 48,
            embedUrl: "https://www.youtube.com/embed/KW4FKtB9DwE",
          },
          {
            episodeNumber: 3,
            duration: 48,
            embedUrl: "https://www.youtube.com/embed/pQeW2JQ2CxQ",
          },
        ],
      },
    ],
  },
  {
    title: "Stranger Things",
    description:
      "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.",
    thumbnail:
      "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    poster: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    firstAiredYear: 2016,
    rating: "8.7",
    featured: true,
    status: "ongoing" as const,
    genres: ["sci-fi", "horror", "drama"],
    seasons: [],
  },
  {
    title: "Game of Thrones",
    description:
      "Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.",
    thumbnail:
      "https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",
    poster: "https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",
    firstAiredYear: 2011,
    lastAiredYear: 2019,
    rating: "8.4",
    featured: true,
    status: "completed" as const,
    genres: ["fantasy", "action", "drama"],
    seasons: [],
  },
  {
    title: "The Office",
    description:
      "A mockumentary on a group of typical office workers, where the workday consists of ego clashes, inappropriate behavior, and tedium.",
    thumbnail:
      "https://image.tmdb.org/t/p/w500/kCMFurqQzJsrLNBsDyTFbVaJhg.jpg",
    poster: "https://image.tmdb.org/t/p/w500/kCMFurqQzJsrLNBsDyTFbVaJhg.jpg",
    firstAiredYear: 2005,
    lastAiredYear: 2013,
    rating: "8.9",
    featured: false,
    status: "completed" as const,
    genres: ["comedy"],
    seasons: [
      {
        seasonNumber: 1,
        title: "Season 1",
        description: "The first season of the mockumentary sitcom.",
        thumbnail:
          "https://image.tmdb.org/t/p/w500/pxr3cIEHQjNz2zLxEq7eH8Tm17Q.jpg",
        releaseYear: 2005,
        episodes: [
          {
            episodeNumber: 1,
            duration: 23,
            embedUrl: "https://www.youtube.com/embed/WJmgcFiAjvE",
          },
          {
            episodeNumber: 2,
            duration: 23,
            embedUrl: "https://www.youtube.com/embed/J2nLrMsPwBM",
          },
          {
            episodeNumber: 3,
            duration: 23,
            embedUrl: "https://www.youtube.com/embed/UH_E6lJYPGk",
          },
        ],
      },
    ],
  },
  {
    title: "The Crown",
    description:
      "Follows the political rivalries and romance of Queen Elizabeth II's reign and the events that shaped the second half of the 20th century.",
    thumbnail:
      "https://image.tmdb.org/t/p/w500/1M876KPjulVwppEpldhdc8V4o68.jpg",
    poster: "https://image.tmdb.org/t/p/w500/1M876KPjulVwppEpldhdc8V4o68.jpg",
    firstAiredYear: 2016,
    lastAiredYear: 2023,
    rating: "8.1",
    featured: false,
    status: "completed" as const,
    genres: ["drama"],
    seasons: [],
  },
  {
    title: "The Mandalorian",
    description:
      "After the fall of the Empire, a lone gunfighter makes his way through the outer reaches of the lawless galaxy.",
    thumbnail:
      "https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg",
    poster: "https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg",
    firstAiredYear: 2019,
    rating: "8.5",
    featured: true,
    status: "ongoing" as const,
    genres: ["sci-fi", "action", "fantasy"],
    seasons: [
      {
        seasonNumber: 1,
        title: "Season 1",
        description: "The Mandalorian travels to the outer reaches of the galaxy.",
        thumbnail:
          "https://image.tmdb.org/t/p/w500/9ijMGlJKqcslswWUzTEwScm82Gs.jpg",
        releaseYear: 2019,
        episodes: [
          {
            episodeNumber: 1,
            duration: 40,
            embedUrl: "https://www.youtube.com/embed/aOC8E8k_rJE",
          },
          {
            episodeNumber: 2,
            duration: 35,
            embedUrl: "https://www.youtube.com/embed/0j8fC1e8sVU",
          },
          {
            episodeNumber: 3,
            duration: 38,
            embedUrl: "https://www.youtube.com/embed/KR8kMQF-5nk",
          },
        ],
      },
    ],
  },
];

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
        status: "active",
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

async function seedSeasonsAndEpisodes(
  seriesId: string,
  seasons: (typeof SERIES)[0]["seasons"],
) {
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
        episodeCount: seasonData.episodes.length,
      })
      .returning();

    if (!season) continue;

    await db.insert(schema.episodes).values(
      seasonData.episodes.map((episode) => ({
        seasonId: season.id,
        episodeNumber: episode.episodeNumber,
        duration: episode.duration,
        embedUrl: episode.embedUrl,
        embedType: "youtube",
      })),
    );
  }

  const totalEpisodes = seasons.reduce((sum, s) => sum + s.episodes.length, 0);
  console.info(
    `Created ${seasons.length} seasons with ${totalEpisodes} episodes`,
  );
}
