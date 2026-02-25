<script setup lang="ts">
useSeoMeta({
  title: "Cine Max - Stream Movies & TV Series",
  description: "Stream your favorite movies and TV series online. Watch anytime, anywhere.",
});

const { data, pending } = await useLazyAsyncData("homepage", async () => {
  const [featuredMoviesRes, featuredSeriesRes, trendingMoviesRes, trendingSeriesRes] =
    await Promise.all([
      $fetch("/api/movies", { query: { featured: true, limit: 5 } }),
      $fetch("/api/series", { query: { featured: true, limit: 5 } }),
      $fetch("/api/movies", {
        query: { limit: 4, sortBy: "rating", sortOrder: "desc" },
      }),
      $fetch("/api/series", {
        query: { limit: 4, sortBy: "rating", sortOrder: "desc" },
      }),
    ]);

  return {
    featuredMovies: featuredMoviesRes.data,
    featuredSeries: featuredSeriesRes.data,
    trendingMovies: trendingMoviesRes.data,
    trendingSeries: trendingSeriesRes.data,
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

      <UContainer>
        <USkeleton class="h-8 w-48 mb-4" />
        <div class="grid grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
          <USkeleton v-for="i in 8" :key="i" class="aspect-2/3 rounded-lg" />
        </div>
      </UContainer>
    </template>

    <NoContent
      v-else-if="featuredContent.length == 0 && trendingContent.length == 0"
      class="pt-[calc(var(--ui-header-height)+1rem)]"
    />

    <template v-else>
      <HeroBanner :content="featuredContent" />

      <UContainer class="py-8">
        <h2 class="text-xl font-bold text-white mb-4">Trending Now</h2>
        <div class="grid grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
          <MediaPosterCard v-for="item in trendingContent" :key="item.id" :content="item" />
        </div>
      </UContainer>
    </template>
  </div>
</template>
