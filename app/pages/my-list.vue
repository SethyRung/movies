<script setup lang="ts">
import type { Movie, TVSeries } from "#shared/types";
import type { Response } from "#shared/types";

const { items, isLoaded, isInList, removeFromList } = useMyList();

// Fetch movies and series data for items in list
const movieIds = computed(() =>
  items.value.filter((id) => id.startsWith("movie-") || !id.includes("-")).slice(0, 50),
);
const seriesIds = computed(() => items.value.filter((id) => id.startsWith("series-")).slice(0, 50));

const { data: moviesData, isLoading: moviesLoading } = useApiData<Movie>({
  endpoint: "movies",
  immediate: true,
});

const { data: seriesData, isLoading: seriesLoading } = useApiData<TVSeries>({
  endpoint: "series",
  immediate: true,
});

// Filter to only show items in list
const myListMovies = computed(() => {
  if (!moviesData.value) return [];
  return moviesData.value.filter((movie) => isInList(movie.id));
});

const myListSeries = computed(() => {
  if (!seriesData.value) return [];
  return seriesData.value.filter((series) => isInList(series.id));
});

const isLoading = computed(() => !isLoaded.value || moviesLoading.value || seriesLoading.value);
const hasItems = computed(() => myListMovies.value.length > 0 || myListSeries.value.length > 0);

// SEO
useHead({
  title: "My List - Cine Max",
});
</script>

<template>
  <div class="min-h-screen bg-background pt-[var(--ui-header-height)]">
    <!-- Header -->
    <div class="px-4 sm:px-6 md:px-8 lg:px-12 pt-8 pb-6">
      <div class="flex items-center gap-4">
        <div
          class="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg"
        >
          <UIcon name="i-lucide-bookmark" class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        </div>
        <div>
          <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-white">My List</h1>
          <p class="text-sm text-white/60 mt-1">
            {{ myListMovies.length + myListSeries.length }} titles saved
          </p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="px-4 sm:px-6 md:px-8 lg:px-12 py-8">
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        <div
          v-for="i in 12"
          :key="i"
          class="aspect-[2/3] rounded-xl bg-neutral-800 animate-pulse"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!hasItems"
      class="flex flex-col items-center justify-center px-4 py-16 sm:py-24"
    >
      <div
        class="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-neutral-800/50 flex items-center justify-center mb-6"
      >
        <UIcon name="i-lucide-bookmark" class="w-12 h-12 sm:w-16 sm:h-16 text-neutral-600" />
      </div>
      <h2 class="text-xl sm:text-2xl font-semibold text-white mb-2">Your list is empty</h2>
      <p class="text-white/60 text-center max-w-md mb-6">
        Browse movies and TV shows, then click the + button to add them to your list.
      </p>
      <UButton to="/" color="primary" size="lg">
        <template #leading>
          <UIcon name="i-lucide-compass" class="w-5 h-5" />
        </template>
        Browse Content
      </UButton>
    </div>

    <!-- Content -->
    <div v-else class="px-4 sm:px-6 md:px-8 lg:px-12 pb-16">
      <!-- Movies Section -->
      <section v-if="myListMovies.length > 0" class="mb-10">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <UIcon name="i-lucide-film" class="w-5 h-5 text-primary-400" />
            Movies
            <span class="text-sm font-normal text-white/50">({{ myListMovies.length }})</span>
          </h2>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          <NuxtLink
            v-for="movie in myListMovies"
            :key="movie.id"
            :to="`/movies/${movie.id}`"
            class="group relative aspect-[2/3] rounded-xl overflow-hidden bg-neutral-800"
          >
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
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div class="absolute bottom-0 left-0 right-0 p-3">
              <h3 class="text-white font-medium text-sm line-clamp-2">{{ movie.title }}</h3>
              <p v-if="movie.releaseYear" class="text-white/60 text-xs mt-1">
                {{ movie.releaseYear }}
              </p>
            </div>
            <!-- Remove button -->
            <button
              class="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              @click.prevent="removeFromList(movie.id)"
            >
              <UIcon name="i-lucide-x" class="w-4 h-4 text-white" />
            </button>
          </NuxtLink>
        </div>
      </section>

      <!-- TV Series Section -->
      <section v-if="myListSeries.length > 0">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <UIcon name="i-lucide-tv" class="w-5 h-5 text-secondary-400" />
            TV Series
            <span class="text-sm font-normal text-white/50">({{ myListSeries.length }})</span>
          </h2>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          <NuxtLink
            v-for="series in myListSeries"
            :key="series.id"
            :to="`/tv-series/${series.id}`"
            class="group relative aspect-[2/3] rounded-xl overflow-hidden bg-neutral-800"
          >
            <NuxtImg
              v-if="series.poster"
              :src="series.poster"
              :alt="series.title"
              width="300"
              height="450"
              format="webp"
              loading="lazy"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div class="absolute bottom-0 left-0 right-0 p-3">
              <h3 class="text-white font-medium text-sm line-clamp-2">{{ series.title }}</h3>
              <p v-if="series.firstAiredYear" class="text-white/60 text-xs mt-1">
                {{ series.firstAiredYear }}
                <span v-if="series.lastAiredYear && series.lastAiredYear !== series.firstAiredYear">
                  - {{ series.lastAiredYear }}
                </span>
              </p>
            </div>
            <!-- Remove button -->
            <button
              class="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              @click.prevent="removeFromList(series.id)"
            >
              <UIcon name="i-lucide-x" class="w-4 h-4 text-white" />
            </button>
          </NuxtLink>
        </div>
      </section>
    </div>
  </div>
</template>
