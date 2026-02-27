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
    <div class="flex items-baseline gap-3 mb-4">
      <h2 class="text-xl font-bold text-white">Browse by Genre</h2>
      <span class="text-sm text-neutral-400">Explore content by category</span>
    </div>

    <div class="flex gap-2 flex-wrap">
      <UButton
        v-for="genre in genres"
        :key="genre.id"
        :label="genre.name"
        :variant="selectedGenre?.id === genre.id ? 'solid' : 'outline'"
        class="rounded-full"
        @click="
          () => {
            selectedGenre = genre;
          }
        "
      />
    </div>

    <div v-if="pending" class="py-8">
      <div class="grid grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
        <USkeleton v-for="i in 8" :key="i" class="aspect-2/3 rounded-lg" />
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
