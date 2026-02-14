/**
 * MediaCard Component Types
 *
 * Shared types and interfaces for MediaCard and related components.
 */

import type { Movie, TVSeries } from "#imports";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type MediaType = "movie" | "series";
export type CardSize = "sm" | "md" | "lg";

/**
 * Union type for media items that can be displayed in MediaCard
 */
export type MediaItem = Movie | TVSeries;

/**
 * Props interface for MediaCard component
 */
export interface MediaCardProps {
  /** The media object (movie or series) */
  media: MediaItem | null;
  /** Type of media - 'movie' or 'series' */
  type: MediaType;
  /** Size variant - 'sm' (compact), 'md' (standard), 'lg' (large with overlay) */
  size?: CardSize;
  /** Optional: Progress percentage for continue watching (0-100) */
  progressPercent?: number;
  /** Optional: Click handler callback */
  onClick?: (media: MediaItem) => void;
  /** Optional: Loading state */
  loading?: boolean;
}

/**
 * Size configuration for each card variant
 */
export interface CardSizeConfig {
  width: string;
  aspectRatio: string;
  titleLines: number;
  descriptionLines: number;
  descriptionLength: number;
}

/**
 * Card size configurations
 */
export const CARD_SIZE_CONFIGS: Record<CardSize, CardSizeConfig> = {
  sm: {
    width: "100%",
    aspectRatio: "16/9",
    titleLines: 1,
    descriptionLines: 0,
    descriptionLength: 0,
  },
  md: {
    width: "100%",
    aspectRatio: "16/9",
    titleLines: 2,
    descriptionLines: 2,
    descriptionLength: 80,
  },
  lg: {
    width: "100%",
    aspectRatio: "16/9",
    titleLines: 2,
    descriptionLines: 3,
    descriptionLength: 120,
  },
};

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Check if media is a movie
 */
export function isMovie(media: MediaItem): media is Movie {
  return "releaseYear" in media && "duration" in media;
}

/**
 * Check if media is a TV series
 */
export function isSeries(media: MediaItem): media is TVSeries {
  return "firstAiredYear" in media;
}

/**
 * Get the release year for a media item
 */
export function getReleaseYear(media: MediaItem): number | undefined {
  if (isMovie(media)) {
    return media.releaseYear ?? undefined;
  }
  return media.firstAiredYear ?? undefined;
}

/**
 * Get the rating as a number
 */
export function getRating(media: MediaItem): number | undefined {
  return media.rating ? Number(media.rating) : undefined;
}

/**
 * Get the thumbnail image source
 */
export function getImageSrc(media: MediaItem): string {
  return media.thumbnail || media.poster || "";
}
