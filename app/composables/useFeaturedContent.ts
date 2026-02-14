import type { Movie, TVSeries, Response } from "#shared/types";

export const useFeaturedContent = () => {
  const featuredMovies = ref<Movie[]>([]);
  const featuredSeries = ref<TVSeries[]>([]);
  const isLoading = ref(true);
  const error = ref<string | null>(null);

  const fetchFeaturedContent = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const [moviesResponse, seriesResponse] = await Promise.all([
        $fetch<Response<Movie[]>>("/api/movies", {
          query: { featured: "true", status: "active", limit: "10" },
        }),
        $fetch<Response<TVSeries[]>>("/api/series", {
          query: { featured: "true", status: "active", limit: "10" },
        }),
      ]);

      // Handle movies response
      if (moviesResponse.status.code === "SUCCESS" && moviesResponse.data) {
        featuredMovies.value = Array.isArray(moviesResponse.data) ? moviesResponse.data : [];
      } else {
        featuredMovies.value = [];
        console.warn("Failed to fetch featured movies:", moviesResponse.status.message);
      }

      // Handle series response
      if (seriesResponse.status.code === "SUCCESS" && seriesResponse.data) {
        featuredSeries.value = Array.isArray(seriesResponse.data) ? seriesResponse.data : [];
      } else {
        featuredSeries.value = [];
        console.warn("Failed to fetch featured series:", seriesResponse.status.message);
      }

      // Set error if both failed
      if (featuredMovies.value.length === 0 && featuredSeries.value.length === 0) {
        error.value = "No featured content available";
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to load featured content";
      console.error("Error fetching featured content:", err);
      featuredMovies.value = [];
      featuredSeries.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const refresh = async () => {
    await fetchFeaturedContent();
  };

  // Fetch on mount
  onMounted(() => {
    fetchFeaturedContent();
  });

  return {
    featuredMovies,
    featuredSeries,
    isLoading,
    error,
    refresh,
  };
};
