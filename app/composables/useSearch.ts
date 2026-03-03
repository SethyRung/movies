import type { Movie, TVSeries } from "#shared/types";
import type { Response } from "#shared/types";

interface SearchFilters {
  genre?: string;
  year?: number;
  type?: "movie" | "series";
}

interface SearchResult {
  movies: Movie[];
  series: TVSeries[];
  total: number;
}

interface SearchState {
  query: string;
  filters: SearchFilters;
  results: SearchResult;
  isLoading: boolean;
  error: string | null;
}

const searchState = reactive<SearchState>({
  query: "",
  filters: {},
  results: { movies: [], series: [], total: 0 },
  isLoading: false,
  error: null,
});

/**
 * Composable for search functionality
 */
export function useSearch() {
  const debounceTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Search for content across movies and TV series
   */
  const search = async (query: string, filters: SearchFilters = {}): Promise<void> => {
    searchState.query = query;
    searchState.filters = filters;

    if (!query.trim()) {
      searchState.results = { movies: [], series: [], total: 0 };
      return;
    }

    searchState.isLoading = true;
    searchState.error = null;

    try {
      // Build query params for movies API
      const moviesParams = new URLSearchParams();
      moviesParams.set("search", query.trim());
      moviesParams.set("limit", "50");

      // Build query params for series API
      const seriesParams = new URLSearchParams();
      seriesParams.set("search", query.trim());
      seriesParams.set("limit", "50");

      // Fetch movies and series in parallel
      const moviesPromise = $fetch<Response<Movie[]>>(`/api/movies?${moviesParams.toString()}`);
      const seriesPromise = $fetch<Response<TVSeries[]>>(`/api/series?${seriesParams.toString()}`);

      const [moviesResponse, seriesResponse] = await Promise.all([moviesPromise, seriesPromise]);

      const movies = moviesResponse.status.code === "SUCCESS" ? moviesResponse.data : [];
      const series = seriesResponse.status.code === "SUCCESS" ? seriesResponse.data : [];

      // Apply type filter if specified
      const filteredMovies = filters.type === "series" ? [] : movies;
      const filteredSeries = filters.type === "movie" ? [] : series;

      searchState.results = {
        movies: filteredMovies,
        series: filteredSeries,
        total: filteredMovies.length + filteredSeries.length,
      };
    } catch (err) {
      searchState.error = err instanceof Error ? err.message : "Search failed";
      searchState.results = { movies: [], series: [], total: 0 };
    } finally {
      searchState.isLoading = false;
    }
  };

  /**
   * Debounced search for use in input handlers
   */
  const debouncedSearch = (query: string, filters: SearchFilters = {}, delay = 300): void => {
    if (debounceTimeout.value) {
      clearTimeout(debounceTimeout.value);
    }

    debounceTimeout.value = setTimeout(() => {
      search(query, filters);
    }, delay);
  };

  /**
   * Clear search results and reset state
   */
  const clearSearch = (): void => {
    searchState.query = "";
    searchState.filters = {};
    searchState.results = { movies: [], series: [], total: 0 };
    searchState.error = null;
  };

  /**
   * Get all results as a combined array with type info
   */
  const combinedResults = computed(() => {
    const moviesWithType = searchState.results.movies.map((movie) => ({
      ...movie,
      mediaType: "movie" as const,
    }));
    const seriesWithType = searchState.results.series.map((series) => ({
      ...series,
      mediaType: "series" as const,
    }));
    return [...moviesWithType, ...seriesWithType];
  });

  return {
    // State
    query: computed(() => searchState.query),
    filters: computed(() => searchState.filters),
    results: computed(() => searchState.results),
    isLoading: computed(() => searchState.isLoading),
    error: computed(() => searchState.error),
    combinedResults,

    // Actions
    search,
    debouncedSearch,
    clearSearch,
  };
}
