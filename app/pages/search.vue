<script setup lang="ts">
import type { Movie, TVSeries } from "#shared/types";

const route = useRoute();
const router = useRouter();

const {
  query,
  results,
  isLoading,
  error,
  search,
  clearSearch,
} = useSearch();

// Get query from URL
const searchQuery = computed({
  get: () => query.value,
  set: (value: string) => {
    // Update URL
    const url = new URL(window.location.href);
    if (value) {
      url.searchParams.set("q", value);
    } else {
      url.searchParams.delete("q");
    }
    router.replace(url.pathname + url.search);
  },
});

// Filter options
const selectedType = ref<"all" | "movie" | "series">("all");
const selectedGenre = ref<string>("");

// Filtered results
const filteredMovies = computed(() => {
  if (selectedType.value === "series") return [];
  return results.value.movies;
});

const filteredSeries = computed(() => {
  if (selectedType.value === "movie") return [];
  return results.value.series;
});

const totalResults = computed(() => filteredMovies.value.length + filteredSeries.value.length);

// Handle search
const handleSearch = (value: string) => {
  searchQuery.value = value;
  if (value.trim()) {
    search(value, {
      type: selectedType.value === "all" ? undefined : selectedType.value,
      genre: selectedGenre.value || undefined,
    });
  }
};

// Initialize from URL on mount
onMounted(() => {
  const q = route.query.q as string;
  if (q) {
    search(q);
  }
});

// Watch for URL changes
watch(() => route.query.q, (newQuery) => {
  if (newQuery && typeof newQuery === "string") {
    search(newQuery);
  }
});

// SEO
useHead({
  title: computed(() => query.value ? `Search: ${query.value} - Cine Max` : "Search - Cine Max"),
});
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Search Header -->
    <div class="sticky top-[var(--ui-header-height)] z-30 bg-background/95 backdrop-blur-sm border-b border-white/10">
      <div class="px-4 sm:px-6 md:px-8 lg:px-12 py-4 pt-6">
        <div class="max-w-4xl mx-auto">
          <!-- Search Input -->
          <div class="relative">
            <UIcon
              name="i-lucide-search"
              class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search movies and TV shows..."
              class="w-full h-12 sm:h-14 pl-12 pr-12 rounded-xl bg-neutral-800/80 text-white placeholder-white/50 text-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              @input="(e) => handleSearch((e.target as HTMLInputElement).value)"
            />
            <button
              v-if="searchQuery"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
              @click="() => { searchQuery = ''; clearSearch(); }"
            >
              <UIcon name="i-lucide-x" class="w-5 h-5" />
            </button>
          </div>

          <!-- Filters -->
          <div class="flex items-center gap-3 mt-4 flex-wrap">
            <span class="text-sm text-white/60 shrink-0">Filter:</span>
            <div class="flex gap-2 flex-wrap">
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
      </div>
    </div>

    <!-- Content -->
    <div class="px-4 sm:px-6 md:px-8 lg:px-12 py-8">
      <div class="max-w-6xl mx-auto">
        <!-- Loading -->
        <div v-if="isLoading" class="flex items-center justify-center py-16">
          <div class="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>

        <!-- Error -->
        <div v-else-if="error" class="text-center py-16">
          <UIcon name="i-lucide-alert-circle" class="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p class="text-white/70">{{ error }}</p>
          <UButton color="primary" class="mt-4" @click="() => search(query)">
            Try Again
          </UButton>
        </div>

        <!-- Empty - No Search Yet -->
        <div v-else-if="!query" class="text-center py-16">
          <UIcon name="i-lucide-search" class="w-16 h-16 text-neutral-600 mx-auto mb-4" />
          <h2 class="text-xl font-semibold text-white mb-2">Search for content</h2>
          <p class="text-white/60">Enter a search term to find movies and TV shows</p>
        </div>

        <!-- Empty - No Results -->
        <div v-else-if="totalResults === 0" class="text-center py-16">
          <UIcon name="i-lucide-frown" class="w-16 h-16 text-neutral-600 mx-auto mb-4" />
          <h2 class="text-xl font-semibold text-white mb-2">No results found</h2>
          <p class="text-white/60">We couldn't find any matches for "{{ query }}"</p>
        </div>

        <!-- Results -->
        <div v-else>
          <p class="text-white/60 mb-6">
            Found {{ totalResults }} result{{ totalResults !== 1 ? "s" : "" }} for "{{ query }}"
          </p>

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
                v-for="series in filteredSeries"
                :key="series.id"
                :to="`/tv-series/${series.id}`"
                class="group"
              >
                <div class="aspect-[2/3] rounded-xl overflow-hidden bg-neutral-800 mb-2">
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
                </div>
                <h3 class="text-white font-medium text-sm line-clamp-2 group-hover:text-secondary-400 transition-colors">
                  {{ series.title }}
                </h3>
                <p v-if="series.firstAiredYear" class="text-white/50 text-xs mt-1">
                  {{ series.firstAiredYear }}
                </p>
              </NuxtLink>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>
