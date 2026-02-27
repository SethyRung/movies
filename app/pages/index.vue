<script setup lang="ts">
useSeoMeta({
  title: "Cine Max - Stream Movies & TV Series",
  description: "Stream your favorite movies and TV series online. Watch anytime, anywhere.",
});

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
    $fetch("/api/movies", { query: { featured: true, limit: 5 } }),
    $fetch("/api/series", { query: { featured: true, limit: 5 } }),
    $fetch("/api/movies", {
      query: { limit: 4, sortBy: "rating", sortOrder: "desc" },
    }),
    $fetch("/api/series", {
      query: { limit: 4, sortBy: "rating", sortOrder: "desc" },
    }),
    $fetch("/api/movies", {
      query: { limit: 10, sortBy: "createdAt", sortOrder: "desc" },
    }),
    $fetch("/api/series", {
      query: { limit: 10, sortBy: "createdAt", sortOrder: "desc" },
    }),
    $fetch("/api/genres", { query: { limit: 20 } }),
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
        <section>
          <USkeleton class="h-8 w-48 mb-4" />
          <div class="grid grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
            <USkeleton v-for="i in 8" :key="i" class="aspect-2/3 rounded-lg" />
          </div>
        </section>

        <section>
          <USkeleton class="h-8 w-48 mb-4" />
          <div class="flex gap-3">
            <USkeleton v-for="i in 10" :key="i" class="h-10 w-24 rounded-full shrink-0" />
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
