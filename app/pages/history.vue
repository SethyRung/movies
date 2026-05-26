<script setup lang="ts">
import type { ApiResponse } from "#shared/types";

useSeoMeta({
  title: "Watch History - Cine Max",
  description: "Your viewing history and watch progress.",
});

const user = useUser();

const activeTab = ref<"all" | "in-progress" | "completed">("all");

const {
  data: movieViewsData,
  pending: loadingMovies,
  refresh: refreshMovies,
} = useLazyAsyncData("history-movies", async () => {
  if (!user.value) return [];
  const res = await $fetch<
    ApiResponse<
      Array<{
        id: string;
        movieId: string;
        progressSeconds: number | null;
        completed: boolean;
        viewedAt: string | null;
        movie?: {
          title: string;
          poster: string | null;
          thumbnail: string | null;
          duration: number | null;
        };
      }>
    >
  >("/api/movie-views", {
    query: { limit: 50, sortOrder: "desc" },
  });
  if (!isSuccessResponse(res)) return [];
  return res.data;
});

const {
  data: episodeViewsData,
  pending: loadingEpisodes,
  refresh: refreshEpisodes,
} = useLazyAsyncData("history-episodes", async () => {
  if (!user.value) return [];
  const res = await $fetch<
    ApiResponse<
      Array<{
        id: string;
        episodeId: string;
        progressSeconds: number | null;
        completed: boolean;
        viewedAt: string | null;
      }>
    >
  >("/api/episode-views", {
    query: { limit: 50, sortOrder: "desc" },
  });
  if (!isSuccessResponse(res)) return [];
  return res.data;
});

interface HistoryItem {
  id: string;
  contentType: "movie" | "series";
  contentId: string;
  title: string;
  poster: string | null;
  thumbnail: string | null;
  progressSeconds: number | null;
  duration: number | null;
  completed: boolean;
  viewedAt: string | null;
  progressPercent: number;
}

const historyItems = computed<HistoryItem[]>(() => {
  const movies =
    movieViewsData.value?.map((v) => {
      const durationSeconds = (v as any).movie?.duration ? (v as any).movie.duration * 60 : null;
      const progressPercent =
        durationSeconds && v.progressSeconds
          ? Math.min((v.progressSeconds / durationSeconds) * 100, 100)
          : 0;
      return {
        id: v.id,
        contentType: "movie" as const,
        contentId: v.movieId,
        title: (v as any).movie?.title ?? "Unknown Movie",
        poster: (v as any).movie?.poster ?? null,
        thumbnail: (v as any).movie?.thumbnail ?? null,
        progressSeconds: v.progressSeconds,
        duration: durationSeconds,
        completed: v.completed,
        viewedAt: v.viewedAt,
        progressPercent,
      };
    }) ?? [];

  const episodes =
    episodeViewsData.value?.map((v) => ({
      id: v.id,
      contentType: "series" as const,
      contentId: v.episodeId,
      title: "Episode",
      poster: null,
      thumbnail: null,
      progressSeconds: v.progressSeconds,
      duration: null,
      completed: v.completed,
      viewedAt: v.viewedAt,
      progressPercent: 0,
    })) ?? [];

  return [...movies, ...episodes].sort((a, b) => {
    const dateA = a.viewedAt ? new Date(a.viewedAt).getTime() : 0;
    const dateB = b.viewedAt ? new Date(b.viewedAt).getTime() : 0;
    return dateB - dateA;
  });
});

const filteredItems = computed(() => {
  if (activeTab.value === "in-progress") return historyItems.value.filter((i) => !i.completed);
  if (activeTab.value === "completed") return historyItems.value.filter((i) => i.completed);
  return historyItems.value;
});

const pending = computed(() => loadingMovies.value || loadingEpisodes.value);

const formatProgress = (seconds: number | null) => {
  if (!seconds) return "0m";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `${hours}h ${remainMins}m`;
};
</script>

<template>
  <div class="min-h-screen bg-[#080808] pt-[calc(var(--ui-header-height)+2rem)]">
    <UContainer>
      <div class="mb-8">
        <p class="text-primary-500/60 tracking-[0.3em] text-xs uppercase mb-2">Your Activity</p>
        <h1 class="text-3xl md:text-4xl font-medium text-primary-50">Watch History</h1>
        <p class="text-stone-500 mt-2">Track what you've been watching.</p>
      </div>

      <div class="flex gap-2 mb-6">
        <button
          v-for="tab in [
            { key: 'all', label: 'All' },
            { key: 'in-progress', label: 'In Progress' },
            { key: 'completed', label: 'Completed' },
          ]"
          :key="tab.key"
          class="px-4 py-2 rounded-lg text-sm transition-colors"
          :class="
            activeTab === tab.key
              ? 'bg-primary-500 text-white'
              : 'bg-neutral-800/50 text-stone-400 hover:bg-neutral-800'
          "
          @click="activeTab = tab.key as any"
        >
          {{ tab.label }}
        </button>
      </div>

      <Loading v-if="pending" />

      <div
        v-else-if="filteredItems.length === 0"
        class="flex flex-col items-center justify-center py-32 text-center"
      >
        <div
          class="w-24 h-24 border border-stone-800 rotate-45 flex items-center justify-center mb-8"
        >
          <UIcon name="i-lucide-clock" class="w-8 h-8 text-stone-600 -rotate-45" />
        </div>
        <h2 class="text-xl text-stone-400 mb-2">No history yet</h2>
        <p class="text-stone-600 mb-6">Start watching movies or series to see your history.</p>
        <UButton to="/" label="Browse Content" color="neutral" variant="outline" />
      </div>

      <div v-else class="space-y-3 pb-16">
        <NuxtLink
          v-for="item in filteredItems"
          :key="item.id"
          :to="
            item.contentType === 'movie'
              ? `/movies/${item.contentId}`
              : `/tv-series/${item.contentId}`
          "
          class="flex items-center gap-4 p-3 rounded-lg bg-neutral-900/50 hover:bg-neutral-800/50 transition-colors group"
        >
          <div class="shrink-0 w-28 aspect-video rounded overflow-hidden bg-neutral-800">
            <NuxtImg
              v-if="item.thumbnail"
              :src="item.thumbnail"
              :alt="item.title"
              class="w-full h-full object-cover"
              loading="lazy"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <UIcon name="i-lucide-film" class="w-6 h-6 text-neutral-600" />
            </div>
          </div>

          <div class="flex-1 min-w-0">
            <p
              class="text-white font-medium truncate group-hover:text-primary-400 transition-colors"
            >
              {{ item.title }}
            </p>
            <div class="flex items-center gap-3 mt-1 text-sm text-stone-500">
              <span class="uppercase tracking-wider text-xs">
                {{ item.contentType === "movie" ? "Movie" : "Series" }}
              </span>
              <span class="text-stone-700">•</span>
              <span v-if="item.completed" class="text-emerald-500/80">Completed</span>
              <span v-else>{{ formatProgress(item.progressSeconds) }} watched</span>
              <span v-if="item.viewedAt" class="text-stone-700">•</span>
              <span v-if="item.viewedAt">
                {{ new Date(item.viewedAt).toLocaleDateString() }}
              </span>
            </div>
            <div
              v-if="!item.completed && item.progressPercent > 0"
              class="mt-2 h-1 bg-neutral-700 rounded-full overflow-hidden"
            >
              <div
                class="h-full bg-primary-500 rounded-full transition-all"
                :style="{ width: `${item.progressPercent}%` }"
              />
            </div>
          </div>

          <UIcon
            name="i-lucide-chevron-right"
            class="w-5 h-5 text-stone-600 group-hover:text-stone-400 transition-colors"
          />
        </NuxtLink>
      </div>
    </UContainer>
  </div>
</template>
