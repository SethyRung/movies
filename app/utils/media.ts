import type { Movie, TVSeries } from "#shared/types";

/**
 * Media type discriminator for Movie
 */
export function isMovie(media: Movie | TVSeries): media is Movie {
  return "duration" in media && "releaseYear" in media;
}

/**
 * Media type discriminator for TVSeries
 */
export function isTVSeries(media: Movie | TVSeries): media is TVSeries {
  return "seasons" in media && "firstAiredYear" in media;
}

/**
 * Format duration from minutes to human-readable string
 * @param minutes - Duration in minutes
 * @returns Formatted string like "2h 30m" or "45m"
 */
export function formatDuration(minutes: number | null | undefined): string {
  if (!minutes) return "";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  }
  return `${mins}m`;
}

/**
 * Get year display for media content
 * @param media - Movie or TVSeries object
 * @returns Year string
 */
export function getMediaYear(media: Movie | TVSeries): string {
  if (isMovie(media)) {
    return media.releaseYear?.toString() || "";
  }
  if (media.firstAiredYear && media.lastAiredYear) {
    return `${media.firstAiredYear} - ${media.lastAiredYear}`;
  }
  return media.firstAiredYear?.toString() || "";
}

/**
 * Calculate progress percentage
 * @param currentTime - Current playback time in seconds
 * @param totalTime - Total duration in seconds
 * @returns Progress percentage (0-100)
 */
export function calculateProgress(currentTime: number, totalTime: number): number {
  if (!totalTime || totalTime <= 0) return 0;
  return Math.min(100, Math.max(0, (currentTime / totalTime) * 100));
}

/**
 * Format time from seconds to MM:SS or HH:MM:SS
 * @param seconds - Time in seconds
 * @returns Formatted time string
 */
export function formatTime(seconds: number): string {
  if (!seconds || seconds < 0) return "0:00";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const padZero = (n: number) => n.toString().padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${padZero(minutes)}:${padZero(secs)}`;
  }
  return `${minutes}:${padZero(secs)}`;
}

/**
 * Get the detail page link for media content
 * @param media - Movie or TVSeries object
 * @returns Route path string
 */
export function getMediaDetailLink(media: Movie | TVSeries): string {
  if (isMovie(media)) {
    return `/movies/${media.id}`;
  }
  return `/tv-series/${media.id}`;
}

/**
 * Format rating for display
 * @param rating - Rating string (e.g., "8.5" or "8.5/10")
 * @returns Formatted rating string
 */
export function formatRating(rating: string | null | undefined): string | null {
  if (!rating) return null;
  return rating.includes("/") ? rating : `${rating}/10`;
}

/**
 * Get media type label
 * @param media - Movie or TVSeries object
 * @returns Type label string
 */
export function getMediaTypeLabel(media: Movie | TVSeries): string {
  return isMovie(media) ? "Movie" : "TV Series";
}

/**
 * Get duration or seasons text for media
 * @param media - Movie or TVSeries object
 * @returns Duration/seasons text
 */
export function getMediaDurationText(media: Movie | TVSeries): string {
  if (isMovie(media)) {
    return formatDuration(media.duration);
  }
  const seasons = media.seasons || 0;
  return `${seasons} Season${seasons !== 1 ? "s" : ""}`;
}

/**
 * Sanitize URL to prevent XSS
 * @param url - URL string to sanitize
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return url;
    }
  } catch {
    return "";
  }
  return "";
}
