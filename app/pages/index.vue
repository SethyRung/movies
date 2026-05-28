<script setup lang="ts">
const { data: res, pending } = await useFetchApi("/api/stats", { lazy: true });

const data = computed(() => (isSuccessResponse(res.value) ? res.value.data : null));

const total = computed(() => (data.value ? data.value.totalMovies + data.value.totalSeries : 0));

const featuredMovie = computed(() => data.value?.featuredMovies[0] ?? data.value?.newMovies[0]);
const trendingMovies = computed(() => data.value?.trendingMovies ?? []);
const trendingSeries = computed(() => data.value?.trendingSeries ?? []);
const newMovies = computed(() => data.value?.newMovies ?? []);
const newSeries = computed(() => data.value?.newSeries ?? []);
const genres = computed(() => data.value?.genres ?? []);
</script>

<template>
  <div class="min-h-screen bg-[#080808] overflow-x-hidden pb-10">
    <template v-if="pending">
      <section class="relative w-screen h-screen bg-[#080808]">
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="relative">
            <div class="w-24 h-24 relative">
              <div class="absolute inset-0 border-2 border-primary-500/20 rotate-45" />
              <div
                class="absolute inset-2 border-2 border-primary-500/30 -rotate-12 animate-spin"
                style="animation-duration: 3s"
              />
              <div
                class="absolute inset-4 border-2 border-primary-500/40 rotate-45 animate-spin"
                style="animation-duration: 2s; animation-direction: reverse"
              />
              <div class="absolute inset-0 flex items-center justify-center">
                <UIcon name="i-lucide-film" class="w-6 h-6 text-primary-500/60" />
              </div>
            </div>
          </div>
        </div>

        <UContainer class="absolute inset-0 flex flex-col justify-center">
          <div class="lg:max-w-3xl space-y-4">
            <USkeleton class="h-14 w-2/3 rounded-none bg-stone-800/50" />
            <div class="flex gap-3">
              <USkeleton class="h-6 w-20 rounded-none bg-stone-800/50" />
              <USkeleton class="h-6 w-16 rounded-none bg-stone-800/50" />
              <USkeleton class="h-6 w-24 rounded-none bg-stone-800/50" />
            </div>
            <USkeleton class="h-20 w-full max-w-xl rounded-none bg-stone-800/50" />
            <div class="flex gap-4 pt-2">
              <USkeleton class="h-12 w-28 rounded-none bg-stone-800/50" />
              <USkeleton class="h-12 w-32 rounded-none bg-stone-800/50" />
            </div>
          </div>
        </UContainer>
      </section>
    </template>

    <NoContent v-else-if="total == 0" class="pt-[calc(var(--ui-header-height)+1rem)]" />

    <template v-else>
      <HeroBanner v-if="featuredMovie" :content="featuredMovie" />

      <UContainer class="space-y-14 py-14">
        <DecorativeDivider />

        <ContentSection
          v-if="trendingMovies.length"
          title="Trending Movies"
          subtitle="Popular now"
          :items="trendingMovies"
          v-slot="{ item }"
        >
          <MediaPosterCard :content="item" />
        </ContentSection>

        <ContentSection
          v-if="trendingSeries.length"
          title="Trending Series"
          subtitle="Binge worthy"
          :items="trendingSeries"
          v-slot="{ item }"
        >
          <MediaPosterCard :content="item" />
        </ContentSection>

        <DecorativeDivider />

        <ContentSection
          v-if="newMovies.length"
          title="New Movies"
          subtitle="Just added"
          :items="newMovies"
          v-slot="{ item }"
        >
          <MediaPosterCard :content="item" />
        </ContentSection>

        <ContentSection
          v-if="newSeries.length"
          title="New Series"
          subtitle="Fresh episodes"
          :items="newSeries"
          v-slot="{ item }"
        >
          <MediaPosterCard :content="item" />
        </ContentSection>

        <template v-if="genres.length">
          <DecorativeDivider />
          <GenreShowcase :genres="genres" />
        </template>
      </UContainer>
    </template>
  </div>
</template>
