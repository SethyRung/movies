<script setup lang="ts">
import type { ContinueWatchingItem, ApiResponse } from "#shared/types";

useSeoMeta({
  title: "Cine Max - Stream Movies & TV Series",
  description: "Stream your favorite movies and TV series online. Watch anytime, anywhere.",
});

const user = useUser();

const { data, pending } = await useLazyAsyncData("homepage", async () => {
  const [
    featuredMoviesRes,
    featuredSeriesRes,
    trendingMoviesRes,
    trendingSeriesRes,
    newMoviesRes,
    newSeriesRes,
    genresRes,
  ] = await Promise.all([
    useApi("/api/movies", { query: { featured: true, limit: 5 } }),
    useApi("/api/series", { query: { featured: true, limit: 5 } }),
    useApi("/api/movies", {
      query: { limit: 4, sortBy: "rating", sortOrder: "desc" },
    }),
    useApi("/api/series", {
      query: { limit: 4, sortBy: "rating", sortOrder: "desc" },
    }),
    useApi("/api/movies", {
      query: { limit: 10, sortBy: "createdAt", sortOrder: "desc" },
    }),
    useApi("/api/series", {
      query: { limit: 10, sortBy: "createdAt", sortOrder: "desc" },
    }),
    useApi("/api/genres", { query: { limit: 20 } }),
  ]);

  return {
    featuredMovies: featuredMoviesRes.data,
    featuredSeries: featuredSeriesRes.data,
    trendingMovies: trendingMoviesRes.data,
    trendingSeries: trendingSeriesRes.data,
    newMovies: newMoviesRes.data,
    newSeries: newSeriesRes.data,
    genres: genresRes.data,
  };
});

const { data: continueWatchingData } = await useLazyAsyncData<ApiResponse<
  ContinueWatchingItem[]
> | null>("continue-watching", () => {
  if (!user.value) return Promise.resolve(null);
  return useApi<ApiResponse<ContinueWatchingItem[]>>("/api/continue-watching", {
    query: { limit: 10 },
  });
});

const continueWatching = computed<ContinueWatchingItem[]>(() => {
  if (!continueWatchingData.value || !isSuccessResponse(continueWatchingData.value)) return [];
  return continueWatchingData.value.data;
});

const featuredContent = computed(() => {
  const movies = data.value?.featuredMovies ?? [];
  const series = data.value?.featuredSeries ?? [];
  return [...movies, ...series];
});

const trendingContent = computed(() => {
  const movies = data.value?.trendingMovies ?? [];
  const series = data.value?.trendingSeries ?? [];
  return [...movies, ...series]
    .sort((a, b) => parseFloat(b.rating || "0") - parseFloat(a.rating || "0"))
    .slice(0, 8);
});

const newReleases = computed(() => {
  const movies = data.value?.newMovies ?? [];
  const series = data.value?.newSeries ?? [];
  return [...movies, ...series]
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    })
    .slice(0, 10);
});

const genres = computed(() => data.value?.genres ?? []);
</script>

<template>
  <div>
    <template v-if="pending">
      <section class="relative w-screen h-screen">
        <USkeleton class="size-full" />

        <UContainer class="absolute inset-0 flex flex-col justify-center">
          <div class="lg:max-w-3xl space-y-4">
            <USkeleton class="h-14 w-2/3 rounded" />

            <div class="flex gap-3">
              <USkeleton class="h-6 w-20 rounded-full" />
              <USkeleton class="h-6 w-16 rounded-full" />
              <USkeleton class="h-6 w-24 rounded-full" />
            </div>

            <USkeleton class="h-20 w-full max-w-xl rounded" />

            <div class="flex gap-4 pt-2">
              <USkeleton class="h-12 w-28 rounded-md" />
              <USkeleton class="h-12 w-32 rounded-md" />
            </div>
          </div>
        </UContainer>
      </section>

      <UContainer class="py-8 space-y-10">
        <section class="space-y-4">
          <USkeleton class="h-8 w-48" />
          <div class="flex gap-4 overflow-x-auto no-scrollbar">
            <USkeleton v-for="i in 6" :key="i" class="shrink-0 w-40 sm:w-48 aspect-2/3" />
          </div>
        </section>

        <section class="space-y-4">
          <USkeleton class="h-8 w-48" />
          <div class="flex gap-3">
            <USkeleton v-for="i in 10" :key="i" class="h-10 w-24 rounded-full shrink-0" />
          </div>
          <div class="flex gap-4 overflow-x-auto no-scrollbar">
            <USkeleton v-for="i in 6" :key="i" class="shrink-0 w-40 sm:w-48 aspect-2/3" />
          </div>
        </section>
      </UContainer>
    </template>

    <NoContent
      v-else-if="featuredContent.length === 0 && trendingContent.length === 0"
      class="pt-[calc(var(--ui-header-height)+1rem)]"
    />

    <template v-else>
      <HeroBanner :content="featuredContent" />

      <UContainer class="py-8 space-y-10">
        <section v-if="continueWatching.length > 0" class="relative">
          <div class="flex items-baseline gap-3 mb-4">
            <h2 class="text-xl font-bold text-white">Continue Watching</h2>
            <span class="text-sm text-neutral-400">Pick up where you left off</span>
          </div>
          <div class="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            <NuxtLink
              v-for="cw in continueWatching"
              :key="cw.contentId"
              :to="
                cw.contentType === 'movie'
                  ? `/movies/${cw.contentId}`
                  : `/tv-series/${cw.contentId}`
              "
              class="shrink-0 w-40 sm:w-48 group cursor-pointer"
            >
              <div class="relative aspect-video rounded-lg overflow-hidden">
                <NuxtImg
                  v-if="cw.thumbnail"
                  :src="cw.thumbnail"
                  :alt="cw.title"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div v-else class="w-full h-full bg-neutral-800 flex items-center justify-center">
                  <UIcon name="i-lucide-play" class="w-8 h-8 text-neutral-600" />
                </div>
                <div
                  class="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"
                />
                <div
                  class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <div
                    class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                  >
                    <UIcon name="i-lucide-play" class="w-5 h-5 text-white ml-0.5" />
                  </div>
                </div>
                <div class="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                  <div
                    class="h-full bg-primary-500 transition-all"
                    :style="{ width: `${cw.progressPercent}%` }"
                  />
                </div>
              </div>
              <p class="mt-2 text-sm text-white truncate">{{ cw.title }}</p>
              <p class="text-xs text-neutral-500">{{ Math.round(cw.progressPercent) }}% watched</p>
            </NuxtLink>
          </div>
        </section>

        <ContentSection
          title="Trending Now"
          subtitle="What's hot right now"
          :items="trendingContent"
          v-slot="{ item }"
        >
          <MediaPosterCard :key="item.id" :content="item" class="shrink-0 w-40 sm:w-48" />
        </ContentSection>

        <ContentSection
          v-if="newReleases.length > 0"
          title="New Releases"
          subtitle="Freshly added content"
          :items="newReleases"
          v-slot="{ item }"
        >
          <MediaPosterCard :key="item.id" :content="item" class="shrink-0 w-40 sm:w-48" />
        </ContentSection>

        <GenreShowcase :genres="genres" />
      </UContainer>
    </template>
  </div>
</template>
