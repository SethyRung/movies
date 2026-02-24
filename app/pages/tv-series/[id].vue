<script setup lang="ts">
import type { Response, TVSeries, Season, Episode } from "#shared/types";

const route = useRoute();
const router = useRouter();
const { $gsap: gsap } = useNuxtApp();

const seriesId = computed(() => route.params.id as string);

const pageRef = ref<HTMLElement>();
const contentRef = ref<HTMLElement>();
const playerRef = ref<HTMLElement>();

const prefersReducedMotion = ref(false);
onMounted(() => {
  prefersReducedMotion.value = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
});

const {
  data: seriesResponse,
  pending: isLoading,
  error: fetchError,
  refresh,
} = await useAsyncData<Response<TVSeries>>(
  `series-${seriesId.value}`,
  () => $fetch<Response<TVSeries>>(`/api/series/${seriesId.value}`),
  {
    watch: [seriesId],
  },
);

const series = computed(() => seriesResponse.value?.data ?? null);
const statusCode = computed(() => seriesResponse.value?.status.code ?? null);
const error = computed(() => {
  if (fetchError.value) {
    return fetchError.value.message || "Failed to fetch series";
  }
  if (seriesResponse.value?.status.code !== "SUCCESS" && seriesResponse.value?.status.code) {
    return seriesResponse.value.status.message || "Failed to load series details";
  }
  return null;
});

const { data: seasonsResponse, pending: isLoadingSeasons } = await useAsyncData<Response<Season[]>>(
  `series-${seriesId.value}-seasons`,
  () => $fetch<Response<Season[]>>(`/api/series/${seriesId.value}/seasons`),
  {
    watch: [seriesId],
  },
);

const seasons = computed(() => seasonsResponse.value?.data ?? []);

const selectedSeason = ref<Season | null>(null);
const selectedSeasonId = ref<string>("0");

const seasonTabs = computed(() =>
  seasons.value.map((season, index) => ({
    label: `Season ${season.seasonNumber}`,
    value: String(index),
  })),
);

const onSeasonTabChange = (value: string | number) => {
  const index = Number(value);
  const season = seasons.value[index];
  if (season) {
    selectSeason(season);
  }
};
const selectedEpisode = ref<Episode | null>(null);

const {
  data: episodesResponse,
  pending: isLoadingEpisodes,
  execute: fetchEpisodes,
} = useLazyAsyncData<Response<Episode[]>>(
  `season-episodes`,
  () => {
    if (!selectedSeason.value)
      return Promise.resolve({
        status: { code: "SUCCESS" as const, message: "", requestId: "", requestTime: 0 },
        data: [],
      });
    return $fetch<Response<Episode[]>>(`/api/seasons/${selectedSeason.value.id}/episodes`);
  },
  {
    immediate: false,
    watch: [selectedSeason],
  },
);

const episodes = computed(() => episodesResponse.value?.data ?? []);

const selectSeason = async (season: Season) => {
  selectedSeason.value = season;
  const seasonIndex = seasons.value.findIndex((s) => s.id === season.id);
  if (seasonIndex !== -1) {
    selectedSeasonId.value = String(seasonIndex);
  }
  selectedEpisode.value = null;
  await fetchEpisodes();

  if (episodes.value.length > 0) {
    selectEpisode(episodes.value[0]);
  }
};

const selectEpisode = (episode: Episode) => {
  selectedEpisode.value = episode;

  nextTick(() => {
    if (playerRef.value) {
      playerRef.value.scrollIntoView({
        behavior: prefersReducedMotion.value ? "auto" : "smooth",
        block: "center",
      });
      playerRef.value.focus({ preventScroll: true });
    }
  });
};

const formattedRating = computed(() => {
  if (!series.value?.rating) return null;
  return Number(series.value.rating).toFixed(1);
});

const backdropUrl = computed(() => {
  return series.value?.poster || series.value?.thumbnail || "";
});

// Video player configuration
const videoConfig = computed(() => {
  if (!selectedEpisode.value?.embedUrl || !selectedEpisode.value?.embedType) return null;
  return {
    src: selectedEpisode.value.embedUrl,
    embedType: selectedEpisode.value.embedType as "youtube" | "vimeo" | "mp4" | "direct",
    videoId: selectedEpisode.value.id,
  };
});

const yearRange = computed(() => {
  if (!series.value) return "";
  const { firstAiredYear, lastAiredYear } = series.value;

  if (firstAiredYear && lastAiredYear && firstAiredYear !== lastAiredYear) {
    return `${firstAiredYear} - ${lastAiredYear}`;
  }
  if (firstAiredYear) {
    return `${firstAiredYear}`;
  }
  return "";
});

const seriesStatus = computed(() => {
  if (!series.value?.status) return "";
  return series.value.status.charAt(0).toUpperCase() + series.value.status.slice(1).toLowerCase();
});

const goBack = () => {
  router.back();
};

const scrollToPlayer = () => {
  if (playerRef.value) {
    playerRef.value.scrollIntoView({
      behavior: prefersReducedMotion.value ? "auto" : "smooth",
      block: "center",
    });
  }
};

const isInWatchlist = ref(false);

const toggleWatchlist = () => {
  isInWatchlist.value = !isInWatchlist.value;
};

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  return mins > 0 ? `${mins}m` : `${seconds}s`;
};

const initAnimations = () => {
  if (prefersReducedMotion.value || !gsap || !contentRef.value) return;

  gsap.set(contentRef.value, { opacity: 0 });

  const tl = gsap.timeline({
    defaults: { ease: "power3.out" },
  });

  tl.to(contentRef.value, {
    opacity: 1,
    duration: 0.6,
  });

  tl.from(
    ".animate-hero-poster",
    {
      scale: 1.05,
      filter: "brightness(0.8)",
      duration: 1,
      ease: "power2.out",
    },
    0,
  );

  tl.from(
    ".animate-title",
    {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    },
    0.3,
  );

  tl.from(
    ".animate-meta",
    {
      y: 20,
      opacity: 0,
      duration: 0.6,
      stagger: 0.05,
      ease: "power2.out",
    },
    0.5,
  );

  tl.from(
    ".animate-description",
    {
      y: 20,
      opacity: 0,
      duration: 0.6,
      ease: "power2.out",
    },
    0.7,
  );

  tl.from(
    ".animate-actions",
    {
      y: 20,
      opacity: 0,
      duration: 0.5,
      ease: "back.out(1.7)",
    },
    0.85,
  );

  tl.from(
    ".animate-seasons",
    {
      y: 40,
      opacity: 0,
      duration: 0.6,
      ease: "power3.out",
    },
    0.9,
  );

  tl.from(
    ".animate-episodes",
    {
      y: 20,
      opacity: 0,
      duration: 0.6,
      stagger: 0.03,
      ease: "power2.out",
    },
    1.0,
  );

  tl.from(
    ".animate-player",
    {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    },
    1.1,
  );
};

onMounted(() => {
  watch(
    () => !isLoading.value && !isLoadingSeasons.value && seasons.value.length > 0,
    (isReady) => {
      if (isReady && !selectedSeason.value) {
        selectedSeason.value = seasons.value[0];
      }
    },
    { immediate: true },
  );

  watch(
    () => !isLoadingEpisodes.value && episodes.value.length > 0,
    (isReady) => {
      if (isReady && !selectedEpisode.value) {
        selectedEpisode.value = episodes.value[0];
      }
    },
    { immediate: true },
  );

  watch(
    () => !isLoading.value && series.value,
    (isLoaded) => {
      if (isLoaded) {
        nextTick(() => {
          initAnimations();
        });
      }
    },
    { immediate: true },
  );
});

useHead(() => ({
  title: series.value ? `${series.value.title} - Cine Max` : "TV Series - Cine Max",
  meta: [
    {
      name: "description",
      content: series.value?.description || "Watch this TV series on Cine Max",
    },
    {
      property: "og:title",
      content: series.value?.title || "TV Series",
    },
    {
      property: "og:description",
      content: series.value?.description || "",
    },
    {
      property: "og:image",
      content: backdropUrl.value,
    },
  ],
}));
</script>

<template>
  <div ref="pageRef" class="min-h-screen bg-neutral-950">
    <div v-if="isLoading" class="min-h-screen flex items-center justify-center">
      <div class="flex flex-col items-center gap-6">
        <div class="relative">
          <div
            class="w-20 h-20 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin motion-reduce:animate-none"
          />
          <div
            class="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-primary-400/50 rounded-full animate-[spin_1.5s_linear_reverse] motion-reduce:animate-none"
          />
        </div>
        <p class="text-neutral-400 text-lg tracking-wide animate-pulse motion-reduce:animate-none">
          Loading series details...
        </p>
      </div>
    </div>

    <div v-else-if="error" class="min-h-screen flex items-center justify-center px-4">
      <div class="text-center max-w-md">
        <div class="mb-6 inline-flex">
          <div class="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center">
            <UIcon name="i-lucide-alert-circle" class="w-12 h-12 text-red-400" />
          </div>
        </div>
        <h1 class="text-2xl font-bold text-white mb-2">
          {{ statusCode === "NOT_FOUND" ? "Series Not Found" : "Error Loading Series" }}
        </h1>
        <p class="text-neutral-400 mb-8">{{ error }}</p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <UButton
            size="lg"
            color="neutral"
            variant="ghost"
            icon="i-lucide-arrow-left"
            @click="goBack"
          >
            Go Back
          </UButton>
          <UButton size="lg" icon="i-lucide-home" to="/">
            Back to Home
          </UButton>
        </div>
      </div>
    </div>

    <div v-else-if="series" ref="contentRef" class="min-h-screen">
      <div class="relative">
        <div class="absolute inset-0 h-[60vh] md:h-[70vh] overflow-hidden">
          <div
            v-if="backdropUrl"
            class="animate-hero-poster absolute inset-0 bg-cover bg-center"
            :style="{ backgroundImage: `url('${backdropUrl}')` }"
          />

          <div
            class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(20,20,20,0.3)_0%,rgba(3,3,3,0.8)_70%,rgba(3,3,3,1)_100%)]"
          />

          <div
            class="absolute inset-0 bg-gradient-to-b from-neutral-950/60 via-neutral-950/80 to-neutral-950"
          />

          <div class="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              class="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px]"
            />
            <div
              class="absolute bottom-1/3 left-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px]"
            />
          </div>
        </div>

        <div class="relative z-10">
          <UContainer class="pt-20 md:pt-32 pb-8 md:pb-16">
            <div class="max-w-5xl">
              <div class="flex items-start gap-3 mb-6">
                <UButton
                  size="md"
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-arrow-left"
                  class="backdrop-blur-md bg-neutral-900/50 border border-neutral-700/50"
                  aria-label="Go back to previous page"
                  @click="goBack"
                >
                  Back
                </UButton>
              </div>

              <div class="flex flex-col lg:flex-row gap-8 lg:gap-12">
                <div class="lg:w-1/3">
                  <div
                    class="aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-neutral-800/50 bg-neutral-900/50 backdrop-blur-sm"
                  >
                    <NuxtImg
                      v-if="series.poster"
                      :src="series.poster"
                      :alt="`Poster for ${series.title}`"
                      class="w-full h-full object-cover"
                      width="400"
                      height="600"
                      format="webp"
                      :modifiers="{ quality: 90 }"
                      loading="eager"
                    />
                    <div
                      v-else-if="series.thumbnail"
                      class="w-full h-full flex items-center justify-center"
                    >
                      <NuxtImg
                        :src="series.thumbnail"
                        :alt="`Thumbnail for ${series.title}`"
                        class="w-full h-full object-cover"
                        width="400"
                        height="600"
                        format="webp"
                        :modifiers="{ quality: 90 }"
                        loading="eager"
                      />
                    </div>
                    <div
                      v-else
                      class="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center"
                      role="img"
                      aria-label="No poster available"
                    >
                      <UIcon name="i-lucide-tv" class="w-24 h-24 text-neutral-700" />
                    </div>
                  </div>
                </div>

                <div class="lg:w-2/3 flex flex-col justify-end pb-8">
                  <h1
                    class="animate-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-4"
                  >
                    {{ series.title }}
                  </h1>

                  <div class="animate-meta flex flex-wrap items-center gap-3 mb-6">
                    <UBadge
                      v-if="formattedRating"
                      size="lg"
                      variant="subtle"
                      color="yellow"
                      class="flex items-center gap-1"
                    >
                      <template #leading>
                        <UIcon
                          name="i-lucide-star"
                          class="w-4 h-4 text-yellow-400 fill-yellow-400"
                        />
                      </template>
                      {{ formattedRating }}
                    </UBadge>

                    <span class="text-neutral-500">•</span>

                    <span v-if="yearRange" class="text-neutral-300 font-medium">
                      {{ yearRange }}
                    </span>

                    <span class="text-neutral-500">•</span>

                    <UBadge
                      :label="seriesStatus"
                      size="lg"
                      :color="series.status === 'ongoing' ? 'green' : 'blue'"
                      variant="subtle"
                    />

                    <span class="text-neutral-500">•</span>

                    <UBadge label="TV Series" size="lg" variant="subtle" color="primary" />
                  </div>

                  <p
                    v-if="series.description"
                    class="animate-description text-base sm:text-lg text-neutral-300 leading-relaxed max-w-2xl"
                  >
                    {{ series.description }}
                  </p>

                  <div class="animate-actions flex flex-wrap items-center gap-3 mt-8">
                    <UButton
                      size="xl"
                      color="primary"
                      icon="i-lucide-play"
                      class="shadow-lg shadow-primary-500/25"
                      :disabled="episodes.length === 0"
                      aria-label="Scroll to video player and watch series"
                      @click="scrollToPlayer"
                    >
                      Watch Now
                    </UButton>

                    <UTooltip
                      :text="isInWatchlist ? 'Remove from My List' : 'Add to My List'"
                      :content="{ side: 'top' }"
                    >
                      <UButton
                        size="xl"
                        :color="isInWatchlist ? 'primary' : 'neutral'"
                        :variant="isInWatchlist ? 'soft' : 'outline'"
                        :icon="isInWatchlist ? 'i-lucide-check' : 'i-lucide-plus'"
                        aria-label="Add this series to your watchlist"
                        @click="toggleWatchlist"
                      >
                        {{ isInWatchlist ? 'In My List' : 'My List' }}
                      </UButton>
                    </UTooltip>
                  </div>
                </div>
              </div>
            </div>
          </UContainer>
        </div>
      </div>

      <section class="relative z-10 py-8">
        <UContainer>
          <div
            class="animate-seasons bg-neutral-900/50 backdrop-blur-xl rounded-2xl border border-neutral-800/50 overflow-hidden shadow-2xl"
          >
            <div class="p-6 border-b border-neutral-800/50">
              <h2 class="text-xl font-semibold text-white flex items-center gap-2">
                <UIcon name="i-lucide-list-video" class="text-primary-400" />
                Seasons
              </h2>
            </div>

            <div v-if="isLoadingSeasons" class="p-8 flex justify-center">
              <div class="flex gap-2">
                <div
                  class="w-3 h-3 bg-primary-500 rounded-full animate-bounce motion-reduce:animate-none"
                  style="animation-delay: 0ms"
                />
                <div
                  class="w-3 h-3 bg-primary-500 rounded-full animate-bounce motion-reduce:animate-none"
                  style="animation-delay: 150ms"
                />
                <div
                  class="w-3 h-3 bg-primary-500 rounded-full animate-bounce motion-reduce:animate-none"
                  style="animation-delay: 300ms"
                />
              </div>
            </div>

            <div v-else-if="seasons.length === 0" class="p-8 text-center text-neutral-500">
              <UIcon name="i-lucide-folder-open" class="w-12 h-12 mx-auto mb-3" />
              <p>No seasons available</p>
            </div>

            <div v-else class="p-4">
              <UTabs
                v-model="selectedSeasonId"
                :items="seasonTabs"
                :content="false"
                class="w-full"
                @update:model-value="onSeasonTabChange"
              />
            </div>
          </div>
        </UContainer>
      </section>

      <section v-if="selectedSeason" class="relative z-10 py-8">
        <UContainer>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 space-y-4">
              <div
                class="bg-neutral-900/50 backdrop-blur-xl rounded-2xl border border-neutral-800/50 overflow-hidden shadow-2xl"
              >
                <div class="p-4 border-b border-neutral-800/50 flex items-center justify-between">
                  <h2 class="text-xl font-semibold text-white flex items-center gap-2">
                    <UIcon name="i-lucide-film" class="text-primary-400" />
                    Episodes
                  </h2>
                  <span v-if="selectedSeason.episodeCount" class="text-neutral-400 text-sm">
                    {{ selectedSeason.episodeCount }} episodes
                  </span>
                </div>

                <div v-if="isLoadingEpisodes" class="p-8 flex justify-center">
                  <div class="flex flex-col items-center gap-4">
                    <div class="flex gap-2">
                      <div
                        class="w-3 h-3 bg-primary-500 rounded-full animate-bounce motion-reduce:animate-none"
                        style="animation-delay: 0ms"
                      />
                      <div
                        class="w-3 h-3 bg-primary-500 rounded-full animate-bounce motion-reduce:animate-none"
                        style="animation-delay: 150ms"
                      />
                      <div
                        class="w-3 h-3 bg-primary-500 rounded-full animate-bounce motion-reduce:animate-none"
                        style="animation-delay: 300ms"
                      />
                    </div>
                    <p class="text-neutral-500">Loading episodes...</p>
                  </div>
                </div>

                <div v-else-if="episodes.length === 0" class="p-8 text-center text-neutral-500">
                  <UIcon name="i-lucide-video-off" class="w-12 h-12 mx-auto mb-3" />
                  <p>No episodes available</p>
                </div>

                <div v-else class="divide-y divide-neutral-800/50 max-h-[500px] overflow-y-auto">
                  <button
                    v-for="episode in episodes"
                    :key="episode.id"
                    :class="[
                      'w-full flex items-center gap-4 p-4 transition-all hover:bg-neutral-800/50 animate-episodes',
                      selectedEpisode?.id === episode.id
                        ? 'bg-neutral-800/70 border-l-4 border-l-primary-500'
                        : '',
                    ]"
                    :aria-label="`Play Episode ${episode.episodeNumber}, ${episode.duration ? formatDuration(episode.duration) : ''}`"
                    :aria-pressed="selectedEpisode?.id === episode.id"
                    @click="selectEpisode(episode)"
                  >
                    <div
                      class="flex-shrink-0 w-12 h-12 rounded-lg bg-neutral-800 flex items-center justify-center"
                    >
                      <span class="text-white font-bold text-lg">{{ episode.episodeNumber }}</span>
                    </div>

                    <div class="flex-1 text-left min-w-0">
                      <p class="text-white font-medium truncate">
                        Episode {{ episode.episodeNumber }}
                      </p>
                      <div class="flex items-center gap-3 text-sm text-neutral-500">
                        <span v-if="episode.duration" class="flex items-center gap-1">
                          <UIcon name="i-lucide-clock" class="w-3 h-3" />
                          {{ formatDuration(episode.duration) }}
                        </span>
                        <span
                          v-if="episode.status"
                          :class="[
                            'px-2 py-0.5 rounded text-xs',
                            episode.status === 'active'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-neutral-700 text-neutral-400',
                          ]"
                        >
                          {{ episode.status }}
                        </span>
                      </div>
                    </div>

                    <div class="flex-shrink-0">
                      <div
                        :class="[
                          'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                          selectedEpisode?.id === episode.id
                            ? 'bg-primary-500 text-white'
                            : 'bg-neutral-800 text-neutral-400 hover:bg-primary-500/20 hover:text-primary-400',
                        ]"
                        aria-hidden="true"
                      >
                        <UIcon name="i-lucide-play" class="w-5 h-5" />
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div class="lg:col-span-1">
              <div
                ref="playerRef"
                tabindex="-1"
                class="animate-player bg-neutral-900/50 backdrop-blur-xl rounded-2xl border border-neutral-800/50 overflow-hidden shadow-2xl sticky top-4 md:top-20"
              >
                <div class="p-4 border-b border-neutral-800/50">
                  <h2 class="text-lg font-semibold text-white flex items-center gap-2">
                    <UIcon name="i-lucide-play-circle" class="text-primary-400" />
                    Now Playing
                  </h2>
                </div>

                <div v-if="selectedEpisode" class="p-4">
                  <p class="text-neutral-300 mb-3">
                    <span class="font-semibold text-white"
                      >Season {{ selectedSeason.seasonNumber }}</span
                    >, Episode {{ selectedEpisode.episodeNumber }}
                  </p>

                  <div class="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
                    <MediaVideoPlayer
                      v-if="videoConfig"
                      :src="videoConfig.src"
                      :embed-type="videoConfig.embedType"
                      :video-id="videoConfig.videoId"
                    />
                    <div
                      v-else
                      class="w-full h-full flex items-center justify-center bg-neutral-900"
                    >
                      <div class="text-center">
                        <UIcon
                          name="i-lucide-video-off"
                          class="w-12 h-12 text-neutral-700 mx-auto mb-3"
                        />
                        <p class="text-neutral-500">Video not available</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else class="p-8 text-center text-neutral-500">
                  <UIcon name="i-lucide-tv-2" class="w-12 h-12 mx-auto mb-3" />
                  <p>Select an episode to play</p>
                </div>
              </div>
            </div>
          </div>
        </UContainer>
      </section>

      <section class="relative z-10 py-16">
        <UContainer>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              v-if="yearRange"
              class="bg-neutral-900/30 backdrop-blur-sm rounded-xl p-6 border border-neutral-800/50"
            >
              <p class="text-neutral-500 text-sm mb-1">Aired</p>
              <p class="text-white text-lg font-semibold">{{ yearRange }}</p>
            </div>

            <div
              v-if="seriesStatus"
              class="bg-neutral-900/30 backdrop-blur-sm rounded-xl p-6 border border-neutral-800/50"
            >
              <p class="text-neutral-500 text-sm mb-1">Status</p>
              <p class="text-white text-lg font-semibold">
                {{ seriesStatus }}
              </p>
            </div>

            <div
              v-if="formattedRating"
              class="bg-neutral-900/30 backdrop-blur-sm rounded-xl p-6 border border-neutral-800/50"
            >
              <p class="text-neutral-500 text-sm mb-1">Rating</p>
              <p class="text-white text-lg font-semibold flex items-center gap-2">
                <UIcon name="i-lucide-star" class="w-5 h-5 text-yellow-400 fill-yellow-400" />
                {{ formattedRating }}
              </p>
            </div>

            <div
              class="bg-neutral-900/30 backdrop-blur-sm rounded-xl p-6 border border-neutral-800/50"
            >
              <p class="text-neutral-500 text-sm mb-1">Seasons</p>
              <p class="text-white text-lg font-semibold">{{ seasons.length }}</p>
            </div>
          </div>
        </UContainer>
      </section>

      <section class="relative z-10 pb-16">
        <UContainer>
          <div class="border-t border-neutral-800 pt-8">
            <div
              class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <p class="text-neutral-500 text-sm">Series ID: {{ series.id }}</p>
              <p v-if="series.createdAt" class="text-neutral-600 text-sm">
                Added {{ new Date(series.createdAt).toLocaleDateString() }}
              </p>
            </div>
          </div>
        </UContainer>
      </section>
    </div>
  </div>
</template>
