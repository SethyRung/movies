<script setup lang="ts">
const props = defineProps<{
  genres: Genre[];
}>();

const selectedGenre = ref<Genre | null>(null);

watchEffect(() => {
  if (props.genres.length > 0 && !selectedGenre.value) {
    selectedGenre.value = props.genres[0] ?? null;
  }
});

const { data: genreContent, pending } = await useLazyAsyncData(
  () => `genre-content-${selectedGenre.value?.id}`,
  async () => {
    if (!selectedGenre.value) return { movies: [], series: [] };

    const [moviesRes, seriesRes] = await Promise.all([
      $fetch("/api/movies", {
        query: { genre: selectedGenre.value!.id, limit: 20 },
      }),
      $fetch("/api/series", {
        query: { genre: selectedGenre.value!.id, limit: 20 },
      }),
    ]);

    return {
      movies: moviesRes.data,
      series: seriesRes.data,
    };
  },
  {
    watch: [selectedGenre],
  },
);

const genreFilteredContent = computed(() => {
  const movies = genreContent.value?.movies ?? [];
  const series = genreContent.value?.series ?? [];
  return [...movies, ...series];
});
</script>

<template>
  <div class="space-y-8">
    <div>
      <div class="flex items-center gap-3 mb-1">
        <div class="w-8 h-px bg-primary-500/30" />
        <p class="text-primary-500/60 tracking-[0.3em] text-xs uppercase">Explore content</p>
      </div>
      <div class="flex items-center gap-3">
        <h2 class="text-2xl md:text-3xl font-medium text-primary-50">Browse by Genre</h2>
        <div class="hidden md:flex items-center gap-2 text-stone-600">
          <div class="w-8 h-px bg-stone-800" />
          <div class="w-1 h-1 rotate-45 border border-stone-700" />
        </div>
      </div>
    </div>

    <div class="flex gap-2 flex-wrap">
      <button
        v-for="genre in genres"
        :key="genre.id"
        :data-active="selectedGenre?.id === genre.id || undefined"
        class="px-4 py-2 text-xs tracking-[0.15em] uppercase border transition-all duration-300"
        :class="
          selectedGenre?.id === genre.id
            ? 'border-primary-500/50 bg-primary-500/10 text-primary-400'
            : 'border-stone-800 text-stone-500 hover:border-stone-600 hover:text-stone-300'
        "
        @click="selectedGenre = genre"
      >
        {{ genre.name }}
      </button>
    </div>

    <div v-if="pending" class="space-y-4">
      <USkeleton class="h-8 w-48" />
      <div class="flex gap-4 overflow-x-auto no-scrollbar">
        <USkeleton v-for="i in 6" :key="i" class="shrink-0 w-40 sm:w-48 aspect-2/3" />
      </div>
    </div>

    <ContentSection
      v-else-if="selectedGenre && genreFilteredContent.length > 0"
      :items="genreFilteredContent"
      v-slot="{ item }"
    >
      <MediaPosterCard :key="item.id" :content="item" class="shrink-0 w-40 sm:w-48" />
    </ContentSection>

    <NoContent v-else />
  </div>
</template>
