import { db, schema } from "@nuxthub/db";
import { ApiResponseCode } from "#shared/types";
import { z } from "zod";
import { VALID_EMBED_TYPES } from "#shared/types";

export default defineEventHandler(async (event) => {
  try {
    const embedTypeEnum = z.enum([...VALID_EMBED_TYPES]);

    const movieImportItemSchema = z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      thumbnail: z.string().optional(),
      poster: z.string().optional(),
      duration: z.number().int().min(0).optional(),
      embedUrl: z.string().min(1),
      embedType: embedTypeEnum,
      origin: z.string().optional(),
      releaseYear: z.number().int().min(1900).max(2100).optional(),
      rating: z.string().optional(),
      featured: z.boolean().optional(),
      status: z.enum(["active", "draft", "archived"]).optional(),
    });

    const seriesImportItemSchema = z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      thumbnail: z.string().optional(),
      poster: z.string().optional(),
      firstAiredYear: z.number().int().min(1900).max(2100).optional(),
      lastAiredYear: z.number().int().min(1900).max(2100).optional(),
      rating: z.string().optional(),
      origin: z.string().optional(),
      featured: z.boolean().optional(),
      status: z.enum(["ongoing", "completed", "draft", "archived"]).optional(),
      seasons: z
        .array(
          z.object({
            seasonNumber: z.number().int().min(1),
            title: z.string().optional(),
            description: z.string().optional(),
            thumbnail: z.string().optional(),
            releaseYear: z.number().int().min(1900).max(2100).optional(),
            episodes: z
              .array(
                z.object({
                  episodeNumber: z.number().int().min(1),
                  duration: z.number().int().min(0).optional(),
                  embedUrl: z.string().min(1),
                  embedType: embedTypeEnum,
                  status: z.enum(["active", "draft"]).optional(),
                }),
              )
              .min(1),
          }),
        )
        .min(1),
    });

    const importBodySchema = z.union([
      z.object({
        type: z.literal("movies"),
        origin: z.string().optional(),
        movies: z.array(movieImportItemSchema).min(1),
      }),
      z.object({
        type: z.literal("series"),
        origin: z.string().optional(),
        series: z.array(seriesImportItemSchema).min(1),
      }),
    ]);

    const userId = event.context.user?.userId;

    if (!userId) {
      return createResponse({ code: ApiResponseCode.Unauthorized, message: "Unauthorized" }, null);
    }

    const body = await readBody(event);
    const parsed = importBodySchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");

      return createResponse({ code: ApiResponseCode.ValidationError, message }, null);
    }

    const data = parsed.data;
    const results = { created: 0, episodes: 0, errors: 0 };

    if (data.type === "movies") {
      const moviesData = data.movies.map((item) => ({
        title: item.title,
        description: item.description ?? null,
        thumbnail: item.thumbnail ?? null,
        poster: item.poster ?? null,
        duration: item.duration ?? null,
        embedUrl: item.embedUrl,
        embedType: item.embedType,
        origin: data.origin ?? item.origin ?? null,
        releaseYear: item.releaseYear ?? null,
        rating: item.rating ?? null,
        featured: item.featured ?? false,
        status: item.status ?? "active",
        createdBy: userId,
      }));

      const inserted = await db.insert(schema.movies).values(moviesData).returning();
      results.created = inserted.length;
    }

    if (data.type === "series") {
      for (const item of data.series) {
        try {
          const [series] = await db
            .insert(schema.tvSeries)
            .values({
              title: item.title,
              description: item.description ?? null,
              thumbnail: item.thumbnail ?? null,
              poster: item.poster ?? null,
              firstAiredYear: item.firstAiredYear ?? null,
              lastAiredYear: item.lastAiredYear ?? null,
              rating: item.rating ?? null,
              featured: item.featured ?? false,
              status: item.status ?? "ongoing",
              origin: data.origin ?? item.origin ?? null,
              createdBy: userId,
            })
            .returning();

          if (!series) {
            results.errors++;
            continue;
          }

          results.created++;

          for (const seasonData of item.seasons) {
            const totalEpisodes = seasonData.episodes.length;

            const [season] = await db
              .insert(schema.seasons)
              .values({
                seriesId: series.id,
                seasonNumber: seasonData.seasonNumber,
                title: seasonData.title ?? `Season ${seasonData.seasonNumber}`,
                description: seasonData.description ?? null,
                thumbnail: seasonData.thumbnail ?? item.thumbnail ?? null,
                releaseYear: seasonData.releaseYear ?? null,
                episodeCount: totalEpisodes,
              })
              .returning();

            if (!season) continue;

            const episodesValues = seasonData.episodes.map((ep) => ({
              seasonId: season.id,
              episodeNumber: ep.episodeNumber,
              duration: ep.duration ?? null,
              embedUrl: ep.embedUrl,
              embedType: ep.embedType,
              status: ep.status ?? "active",
            }));

            await db.insert(schema.episodes).values(episodesValues);
            results.episodes += episodesValues.length;
          }
        } catch {
          results.errors++;
        }
      }
    }

    return createResponse({ code: ApiResponseCode.Success, message: "Import completed" }, results);
  } catch {
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to import data" },
      null,
    );
  }
});
