import type { Movie, TVSeries, Episode, MovieView, EpisodeView, Season } from "#shared/types";

interface ContinueWatchingItem {
  id: string;
  mediaId: string;
  mediaType: "movie" | "series";
  title: string;
  poster: string | null;
  thumbnail: string | null;
  progress: number;
  lastWatched: Date;
  // For series
  episodeId?: string;
  episodeNumber?: number;
  seasonId?: string;
  seasonNumber?: number;
}

const CONTINUE_WATCHING_KEY = "cine-max-continue-watching";

/**
 * Composable for managing continue watching state
 */
export function useContinueWatching() {
  const items = ref<ContinueWatchingItem[]>([]);
  const isLoaded = ref(false);

  // Load from localStorage
  const loadFromStorage = () => {
    if (!import.meta.client) return;

    try {
      const stored = localStorage.getItem(CONTINUE_WATCHING_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ContinueWatchingItem[];
        items.value = parsed.map((item) => ({
          ...item,
          lastWatched: new Date(item.lastWatched),
        }));
      }
    } catch (error) {
      console.error("Failed to load continue watching from localStorage:", error);
      items.value = [];
    }
    isLoaded.value = true;
  };

  // Save to localStorage
  const saveToStorage = () => {
    if (!import.meta.client) return;

    try {
      localStorage.setItem(CONTINUE_WATCHING_KEY, JSON.stringify(items.value));
    } catch (error) {
      console.error("Failed to save continue watching to localStorage:", error);
    }
  };

  // Add or update movie progress
  const updateMovieProgress = (
    movie: Movie,
    progress: number,
    viewData?: MovieView,
  ): void => {
    const existingIndex = items.value.findIndex(
      (item) => item.mediaId === movie.id && item.mediaType === "movie",
    );

    const newItem: ContinueWatchingItem = {
      id: `movie-${movie.id}`,
      mediaId: movie.id,
      mediaType: "movie",
      title: movie.title,
      poster: movie.poster,
      thumbnail: movie.thumbnail,
      progress,
      lastWatched: new Date(),
    };

    if (existingIndex >= 0) {
      items.value[existingIndex] = newItem;
    } else {
      items.value = [newItem, ...items.value];
    }

    // Sort by last watched
    items.value.sort(
      (a, b) => new Date(b.lastWatched).getTime() - new Date(a.lastWatched).getTime(),
    );

    saveToStorage();
  };

  // Add or update episode progress
  const updateEpisodeProgress = (
    series: TVSeries,
    episode: Episode,
    progress: number,
    season?: Season,
    viewData?: EpisodeView,
  ): void => {
    const existingIndex = items.value.findIndex(
      (item) => item.mediaId === series.id && item.episodeId === episode.id,
    );

    const newItem: ContinueWatchingItem = {
      id: `series-${series.id}-episode-${episode.id}`,
      mediaId: series.id,
      mediaType: "series",
      title: series.title,
      poster: series.poster,
      thumbnail: series.thumbnail,
      progress,
      lastWatched: new Date(),
      episodeId: episode.id,
      episodeNumber: episode.episodeNumber,
      seasonId: episode.seasonId,
      seasonNumber: season?.seasonNumber,
    };

    if (existingIndex >= 0) {
      items.value[existingIndex] = newItem;
    } else {
      items.value = [newItem, ...items.value];
    }

    // Sort by last watched
    items.value.sort(
      (a, b) => new Date(b.lastWatched).getTime() - new Date(a.lastWatched).getTime(),
    );

    saveToStorage();
  };

  // Remove item from continue watching
  const removeFromContinueWatching = (id: string): void => {
    items.value = items.value.filter((item) => item.id !== id);
    saveToStorage();
  };

  // Clear all continue watching items
  const clearContinueWatching = (): void => {
    items.value = [];
    saveToStorage();
  };

  // Get progress for specific media
  const getProgress = (mediaId: string, mediaType: "movie" | "series"): number => {
    const item = items.value.find(
      (i) => i.mediaId === mediaId && i.mediaType === mediaType,
    );
    return item?.progress || 0;
  };

  // Get recent items (limit)
  const getRecentItems = (limit = 10): ContinueWatchingItem[] => {
    return items.value.slice(0, limit);
  };

  // Count
  const itemCount = computed(() => items.value.length);

  // Load on mount
  onMounted(() => {
    loadFromStorage();
  });

  // Initialize if on client
  if (import.meta.client && !isLoaded.value) {
    loadFromStorage();
  }

  return {
    items: readonly(items),
    isLoaded,
    updateMovieProgress,
    updateEpisodeProgress,
    removeFromContinueWatching,
    clearContinueWatching,
    getProgress,
    getRecentItems,
    itemCount,
  };
}
