<script setup lang="ts">
const props = defineProps<{
  content: Movie;
}>();

const formattedDuration = computed(() => {
  if (!props.content.duration) return null;
  const hours = Math.floor(props.content.duration / 60);
  const mins = props.content.duration % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
});

const formattedRating = computed(() => {
  if (!props.content.rating) return null;
  return Number(props.content.rating).toFixed(1);
});
</script>

<template>
  <section class="relative w-full h-[85vh] min-h-150 overflow-hidden bg-background">
    <div class="absolute inset-0">
      <div
        v-if="content.thumbnail"
        class="absolute inset-0 bg-cover bg-center"
        :style="{ backgroundImage: `url('${content.thumbnail}')` }"
      />
      <div
        class="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent"
      />
      <div
        class="absolute inset-0 bg-linear-to-r from-background/80 via-transparent to-transparent"
      />
      <div class="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none">
        <UIcon name="i-cinemax-noise" class="w-full h-full text-white" />
      </div>
    </div>

    <div class="absolute inset-0 flex flex-col justify-end">
      <div class="pb-16 md:pb-20 px-6 md:px-12 lg:px-20">
        <div class="max-w-3x space-y-4">
          <UBadge
            label="Featured"
            size="xl"
            variant="outline"
            class="rounded-xs tracking-[0.3em] text-xs font-normal uppercase"
          />

          <h1
            class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-primary-50 tracking-tight"
          >
            {{ content.title }}
          </h1>

          <div class="flex flex-wrap items-center gap-4">
            <span v-if="content.releaseYear" class="flex items-center gap-2 text-stone-400">
              <UIcon name="i-lucide-calendar" class="w-4 h-4 text-primary-500/60" />
              {{ content.releaseYear }}
            </span>

            <template v-if="formattedDuration">
              <span class="text-stone-600">&#9670;</span>
              <span class="flex items-center gap-2 text-stone-400">
                <UIcon name="i-lucide-clock" class="w-4 h-4 text-primary-500/60" />
                {{ formattedDuration }}
              </span>
            </template>

            <template v-if="formattedRating">
              <span class="text-stone-600">&#9670;</span>
              <span class="flex items-center gap-2 text-stone-400">
                <UIcon name="i-lucide-star" class="w-4 h-4 text-primary-500 fill-primary-500" />
                {{ formattedRating }}
              </span>
            </template>

            <template v-if="content.status === 'active'">
              <span class="text-stone-600">&#9670;</span>
              <span class="text-emerald-500 tracking-wider text-xs uppercase">Now Showing</span>
            </template>
          </div>

          <p
            v-if="content.description"
            class="text-base md:text-lg text-stone-400 leading-relaxed max-w-2xl line-clamp-2 md:line-clamp-3"
          >
            {{ content.description }}
          </p>

          <UButton
            icon="i-lucide:play"
            label="Watch Now"
            size="xl"
            class="px-6 md:px-10 py-3 rounded-xs text-sm uppercase font-medium"
            :to="`/movies/${content.id}`"
          />
        </div>
      </div>
    </div>

    <div class="absolute bottom-0 left-0 right-0 h-px bg-primary-500/10" />
  </section>
</template>
