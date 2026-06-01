import { db, schema } from "@nuxthub/db";

export default defineTask({
  meta: {
    name: "db:clear",
    description: "Clears the database",
  },
  async run() {
    try {
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

      return { result: "Database cleared successfully!" };
    } catch (error) {
      console.error("Error clearing database:", error);
      throw error;
    }
  },
});
