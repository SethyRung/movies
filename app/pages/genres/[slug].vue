<script setup lang="ts">
import type { Movie, TVSeries, Genre } from "#shared/types";

const route = useRoute();
const router = useRouter();
const slug = computed(() => route.params.slug as string);

// Fetch genres to get the current genre info
const { data: genres } = useApiData<Genre>({
  endpoint: "genres",
  immediate: true,
});

// Find current genre
const currentGenre = computed(() => {
  return genres.value.find((g) => g.slug === slug.value || g.id === slug.value);
});

// Fetch movies by genre
const { data: movies, isLoading: moviesLoading } = useApiData<Movie>({
  endpoint: "movies",
  query: computed(() => (currentGenre.value ? { genre: currentGenre.value.id } : {})),
  immediate: true,
});

// Fetch series by genre
const { data: series, isLoading: seriesLoading } = useApiData<TVSeries>({
  endpoint: "series",
  query: computed(() => (currentGenre.value ? { genre: currentGenre.value.id } : {})),
  immediate: true,
});

const isLoading = computed(() => moviesLoading.value || seriesLoading.value);
const totalResults = computed(() => (movies.value?.length || 0) + (series.value?.length || 0));

// Filter options
const selectedType = ref<"all" | "movie" | "series">("all");

const filteredMovies = computed(() => {
  if (selectedType.value === "series") return [];
  return movies.value || [];
});

const filteredSeries = computed(() => {
  if (selectedType.value === "movie") return [];
  return series.value || [];
});

// SEO
useHead({
  title: computed(() =>
    currentGenre.value ? `${currentGenre.value.name} - Cine Max` : "Genre - Cine Max"
  ),
});
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <div class="px-4 sm:px-6 md:px-8 lg:px-12 pt-8 pb-6">
      <div class="flex items-center gap-4">
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          class="text-white/70"
          @click="router.push('/genres')"
        >
          <template #leading>
            <UIcon name="i-lucide-arrow-left" class="w-5 h-5" />
          </template>
          Back to Genres
        </UButton>
      </div>

      <div class="mt-4 flex items-center gap-4">
        <div
          class="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg"
        >
          <UIcon name="i-lucide-hash" class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        </div>
        <div>
          <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
            {{ currentGenre?.name || "Loading..." }}
          </h1>
          <p class="text-sm text-white/60 mt-1">
            {{ totalResults }} titles
          </p>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex items-center gap-3 mt-6">
        <span class="text-sm text-white/60">Filter:</span>
        <div class="flex gap-2">
          <button
            :class="[
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              selectedType === 'all'
                ? 'bg-primary-500 text-white'
                : 'bg-neutral-800 text-white/70 hover:bg-neutral-700',
            ]"
            @click="selectedType = 'all'"
          >
            All
          </button>
          <button
            :class="[
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              selectedType === 'movie'
                ? 'bg-primary-500 text-white'
                : 'bg-neutral-800 text-white/70 hover:bg-neutral-700',
            ]"
            @click="selectedType = 'movie'"
          >
            Movies
          </button>
          <button
            :class="[
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              selectedType === 'series'
                ? 'bg-primary-500 text-white'
                : 'bg-neutral-800 text-white/70 hover:bg-neutral-700',
            ]"
            @click="selectedType = 'series'"
          >
            TV Series
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="px-4 sm:px-6 md:px-8 lg:px-12 py-8">
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        <div
          v-for="i in 12"
          :key="i"
          class="aspect-[2/3] rounded-xl bg-neutral-800 animate-pulse"
        />
      </div>
    </div>

    <!-- Content -->
    <div v-else class="px-4 sm:px-6 md:px-8 lg:px-12 pb-16">
      <!-- Movies -->
      <section v-if="filteredMovies.length > 0" class="mb-10">
        <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <UIcon name="i-lucide-film" class="w-5 h-5 text-primary-400" />
          Movies ({{ filteredMovies.length }})
        </h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          <NuxtLink
            v-for="movie in filteredMovies"
            :key="movie.id"
            :to="`/movies/${movie.id}`"
            class="group"
          >
            <div class="aspect-[2/3] rounded-xl overflow-hidden bg-neutral-800 mb-2">
              <NuxtImg
                v-if="movie.poster"
                :src="movie.poster"
                :alt="movie.title"
                width="300"
                height="450"
                format="webp"
                loading="lazy"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <h3 class="text-white font-medium text-sm line-clamp-2 group-hover:text-primary-400 transition-colors">
              {{ movie.title }}
            </h3>
            <p v-if="movie.releaseYear" class="text-white/50 text-xs mt-1">
              {{ movie.releaseYear }}
            </p>
          </NuxtLink>
        </div>
      </section>

      <!-- TV Series -->
      <section v-if="filteredSeries.length > 0">
        <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <UIcon name="i-lucide-tv" class="w-5 h-5 text-secondary-400" />
          TV Series ({{ filteredSeries.length }})
        </h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          <NuxtLink
            v-for="s in filteredSeries"
            :key="s.id"
            :to="`/tv-series/${s.id}`"
            class="group"
          >
            <div class="aspect-[2/3] rounded-xl overflow-hidden bg-neutral-800 mb-2">
              <NuxtImg
                v-if="s.poster"
                :src="s.poster"
                :alt="s.title"
                width="300"
                height="450"
                format="webp"
                loading="lazy"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <h3 class="text-white font-medium text-sm line-clamp-2 group-hover:text-secondary-400 transition-colors">
              {{ s.title }}
            </h3>
            <p v-if="s.firstAiredYear" class="text-white/50 text-xs mt-1">
              {{ s.firstAiredYear }}
            </p>
          </NuxtLink>
        </div>
      </section>

      <!-- Empty state -->
      <div
        v-if="totalResults === 0"
        class="flex flex-col items-center justify-center py-16"
      >
        <UIcon name="i-lucide-film" class="w-16 h-16 text-neutral-600 mx-auto mb-4" />
        <h2 class="text-xl font-semibold text-white mb-2">No content found</h2>
        <p class="text-white/60">
          No {{ currentGenre?.name || "genre" }} content available yet
        </p>
      </div>
    </div>
  </div>
</template>
