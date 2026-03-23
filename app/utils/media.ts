import type { Movie, TVSeries } from "#shared/types";

export function isMovie(content: Movie | TVSeries): content is Movie {
  return "embedUrl" in content;
}

export function getMediaDetailLink(content: Movie | TVSeries): string {
  return isMovie(content) ? `/movies/${content.id}` : `/tv-series/${content.id}`;
}

export function getMediaYear(content: Movie | TVSeries): string {
  if (isMovie(content)) {
    return content.releaseYear ? String(content.releaseYear) : "—";
  }

  const start = content.firstAiredYear;
  const end = content.lastAiredYear;

  if (start && end && end !== start) return `${start}–${end}`;
  if (start) return String(start);

  return "—";
}

export function formatDuration(durationSeconds: number | null | undefined): string | null {
  if (!durationSeconds || durationSeconds <= 0) return null;

  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);

  if (hours <= 0) return `${minutes}m`;

  const paddedMinutes = String(minutes).padStart(2, "0");
  return `${hours}h ${paddedMinutes}m`;
}
