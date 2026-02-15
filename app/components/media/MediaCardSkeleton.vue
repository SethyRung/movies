<template>
  <div
    class="media-card-skeleton group relative flex-shrink-0 overflow-hidden rounded-xl bg-gray-900/50"
    :class="[
      size === 'large'
        ? 'w-[280px] md:w-[320px] aspect-video'
        : size === 'medium'
          ? 'w-[200px] md:w-[240px] aspect-video'
          : 'w-[140px] md:w-[180px] aspect-video',
    ]"
  >
    <div class="relative h-full w-full overflow-hidden">
      <div class="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-800 to-gray-900">
        <div
          class="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent"
        />
      </div>

      <div
        v-if="showRating"
        class="absolute top-2 right-2 flex h-8 w-12 items-center justify-center rounded-lg bg-gray-800/80"
      />

      <div v-if="showQuality" class="absolute top-2 left-2 h-5 w-8 rounded bg-gray-800/80" />

      <div v-if="size !== 'large'" class="absolute bottom-0 left-0 right-0 p-3 bg-gray-900/80">
        <div class="h-4 w-3/4 rounded bg-gray-700" />
        <div class="mt-2 h-3 w-1/2 rounded bg-gray-700" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: "small" | "medium" | "large";
  showRating?: boolean;
  showQuality?: boolean;
}

withDefaults(defineProps<Props>(), {
  size: "medium",
  showRating: true,
  showQuality: true,
});
</script>

<style scoped>
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>
