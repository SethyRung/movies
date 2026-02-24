<script setup lang="ts">
import type { Genre } from "#shared/types";

const { data: genres, isLoading } = useApiData<Genre>({
  endpoint: "genres",
  immediate: true,
});

// Genre color mapping for visual variety
const genreColors: Record<string, string> = {
  Action: "from-red-500 to-orange-500",
  Comedy: "from-yellow-400 to-amber-500",
  Drama: "from-purple-500 to-pink-500",
  Horror: "from-gray-700 to-gray-900",
  "Sci-Fi": "from-blue-500 to-cyan-500",
  Thriller: "from-red-600 to-red-800",
  Romance: "from-pink-400 to-rose-500",
  Documentary: "from-green-500 to-emerald-600",
  Animation: "from-indigo-400 to-purple-500",
  Adventure: "from-teal-500 to-green-500",
  Fantasy: "from-violet-500 to-purple-600",
  Mystery: "from-slate-600 to-slate-800",
};

const getGenreColor = (name: string): string => {
  return genreColors[name] || "from-neutral-600 to-neutral-700";
};

// SEO
useHead({
  title: "Browse by Genre - Cine Max",
});
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <div class="px-4 sm:px-6 md:px-8 lg:px-12 pt-8 pb-6">
      <div class="flex items-center gap-4">
        <div
          class="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg"
        >
          <UIcon name="i-lucide-layers" class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        </div>
        <div>
          <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Browse by Genre</h1>
          <p class="text-sm text-white/60 mt-1">
            {{ genres?.length || 0 }} genres available
          </p>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="px-4 sm:px-6 md:px-8 lg:px-12 py-8">
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        <div
          v-for="i in 12"
          :key="i"
          class="aspect-[4/3] rounded-xl bg-neutral-800 animate-pulse"
        />
      </div>
    </div>

    <!-- Genres Grid -->
    <div v-else class="px-4 sm:px-6 md:px-8 lg:px-12 pb-16">
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        <NuxtLink
          v-for="genre in genres"
          :key="genre.id"
          :to="`/genres/${genre.slug || genre.id}`"
          class="group relative aspect-[4/3] rounded-xl overflow-hidden"
        >
          <!-- Background gradient -->
          <div
            :class="[
              'absolute inset-0 bg-gradient-to-br transition-transform duration-500 group-hover:scale-110',
              getGenreColor(genre.name),
            ]"
          />

          <!-- Overlay -->
          <div class="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

          <!-- Content -->
          <div class="absolute inset-0 flex flex-col items-center justify-center p-4">
            <h2 class="text-white font-bold text-lg sm:text-xl text-center">
              {{ genre.name }}
            </h2>
            <p v-if="genre.description" class="text-white/70 text-xs text-center mt-1 line-clamp-2">
              {{ genre.description }}
            </p>
          </div>

          <!-- Hover effect -->
          <div
            class="absolute inset-0 border-2 border-white/0 group-hover:border-white/30 rounded-xl transition-colors"
          />
        </NuxtLink>
      </div>

      <!-- Empty state -->
      <div
        v-if="!genres || genres.length === 0"
        class="flex flex-col items-center justify-center py-16"
      >
        <UIcon name="i-lucide-layers" class="w-16 h-16 text-neutral-600 mx-auto mb-4" />
        <h2 class="text-xl font-semibold text-white mb-2">No genres found</h2>
        <p class="text-white/60">Check back later for content updates</p>
      </div>
    </div>
  </div>
</template>
