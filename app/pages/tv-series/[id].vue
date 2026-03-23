<script setup lang="ts">
import gsap from "gsap";

import type { Response } from "#shared/types";
import { ResponseCode } from "#shared/types";

const route = useRoute();
const router = useRouter();

const seriesId = computed(() => route.params.id as string);

const contentRef = ref<HTMLElement>();
const leftCurtain = useTemplateRef("leftCurtain");
const rightCurtain = useTemplateRef("rightCurtain");
const spotlightRef = ref<HTMLElement>();
const playerRef = ref<HTMLElement>();

const leftCurtainEl = computed(() => leftCurtain.value?.root);
const rightCurtainEl = computed(() => rightCurtain.value?.root);

const { data: seriesResponse, pending: isLoading } = await useAsyncData<Response<TVSeries>>(
  `series-${seriesId.value}`,
  () => $fetch<Response<TVSeries>>(`/api/series/${seriesId.value}`),
  { watch: [seriesId] },
);

const series = computed(() => seriesResponse.value?.data ?? null);
const statusCode = computed(() => seriesResponse.value?.status.code ?? null);
const error = computed(() => {
  if (seriesResponse.value?.status.code !== "SUCCESS" && seriesResponse.value?.status.code) {
    return seriesResponse.value.status.message || "Failed to load series details";
  }
  return null;
});

const { data: seasonsResponse, pending: isLoadingSeasons } = await useAsyncData<Response<Season[]>>(
  `series-${seriesId.value}-seasons`,
  () => $fetch<Response<Season[]>>(`/api/series/${seriesId.value}/seasons`),
  { watch: [seriesId] },
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
  if (season) selectSeason(season);
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
        status: { code: ResponseCode.Success, message: "", requestId: "", requestTime: 0 },
        data: [],
      });
    return $fetch<Response<Episode[]>>(`/api/seasons/${selectedSeason.value.id}/episodes`);
  },
  { immediate: false, watch: [selectedSeason] },
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
    selectEpisode(episodes.value[0]!);
  }
};

const selectEpisode = (episode: Episode) => {
  selectedEpisode.value = episode;
  nextTick(() => {
    playerRef.value?.scrollIntoView({ behavior: "smooth", block: "center" });
    playerRef.value?.focus({ preventScroll: true });
  });
};

const formattedRating = computed(() => {
  if (!series.value?.rating) return null;
  return Number(series.value.rating).toFixed(1);
});

const backdropUrl = computed(() => series.value?.poster || series.value?.thumbnail || "");

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
  if (firstAiredYear) return `${firstAiredYear}`;
  return "";
});

const seriesStatus = computed(() => {
  if (!series.value?.status) return "";
  return series.value.status.charAt(0).toUpperCase() + series.value.status.slice(1).toLowerCase();
});

const goBack = () => router.back();

const scrollToPlayer = () => {
  playerRef.value?.scrollIntoView({ behavior: "smooth", block: "center" });
};

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  return mins > 0 ? `${mins}m` : `${seconds}s`;
};

const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

function runAnimations() {
  if (!contentRef.value || !leftCurtainEl.value || !rightCurtainEl.value) return;

  gsap.set(contentRef.value, { opacity: 0 });

  tl.to(leftCurtainEl.value, { x: "-100%", duration: 1.2, ease: "power4.inOut" }, 0);
  tl.to(rightCurtainEl.value, { x: "100%", duration: 1.2, ease: "power4.inOut" }, 0);
  tl.to(contentRef.value, { opacity: 1, duration: 0.8 }, 0.4);

  if (spotlightRef.value) {
    tl.from(spotlightRef.value, { opacity: 0, scale: 0.8, duration: 1, ease: "power2.out" }, 0.6);
  }

  tl.from(".animate-poster", { scale: 1.1, opacity: 0, duration: 1.2, ease: "power3.out" }, 0.5);
  tl.from(".animate-title", { y: 60, opacity: 0, duration: 1, ease: "power3.out" }, 0.7);
  tl.from(
    ".animate-meta",
    { y: 30, opacity: 0, duration: 0.6, stagger: 0.08, ease: "power2.out" },
    0.9,
  );
  tl.from(".animate-description", { y: 20, opacity: 0, duration: 0.8, ease: "power2.out" }, 1.1);
  tl.from(".animate-actions", { scale: 0.9, opacity: 0, duration: 0.6, ease: "back.out(2)" }, 1.3);
  tl.from(".animate-seasons", { y: 40, opacity: 0, duration: 0.8, ease: "power3.out" }, 1.4);
  tl.from(
    ".animate-card",
    { y: 40, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" },
    1.5,
  );
}

onMounted(() => {
  watch(
    () => !isLoading.value && !isLoadingSeasons.value && seasons.value.length > 0,
    (isReady) => {
      if (isReady && !selectedSeason.value) {
        selectedSeason.value = seasons.value[0] ?? null;
      }
    },
    { immediate: true },
  );

  watch(
    () => !isLoadingEpisodes.value && episodes.value.length > 0,
    (isReady) => {
      if (isReady && !selectedEpisode.value) {
        selectedEpisode.value = episodes.value[0] ?? null;
      }
    },
    { immediate: true },
  );

  watch(
    () => !isLoading.value && series.value,
    (isLoaded) => {
      if (isLoaded) {
        nextTick(() => runAnimations());
      }
    },
    { immediate: true },
  );
});

onUnmounted(() => tl.kill());

useSeoMeta({
  title: series.value ? `${series.value.title} - Cine Max` : "TV Series - Cine Max",
  description: series.value?.description || "Watch this TV series on Cine Max",
});
</script>

<template>
  <div class="min-h-screen bg-[#080808] overflow-x-hidden">
    <Loading v-if="isLoading" />

    <div v-else-if="error" class="min-h-screen flex items-center justify-center px-4">
      <div class="text-center max-w-md">
        <div class="mb-6 inline-flex">
          <div
            class="w-24 h-24 border border-red-500/30 rotate-45 flex items-center justify-center"
          >
            <UIcon name="i-lucide-alert-circle" class="w-10 h-10 text-red-400 -rotate-45" />
          </div>
        </div>
        <h1 class="text-2xl font-bold text-primary-50 mb-2">
          {{ statusCode === "NOT_FOUND" ? "Series Not Found" : "Error Loading Series" }}
        </h1>
        <p class="text-stone-400 mb-8">{{ error }}</p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            class="group flex items-center gap-2 px-6 py-3 border border-stone-700 hover:border-primary-500/50 text-stone-300 hover:text-primary-500 transition-colors"
            @click="goBack"
          >
            <UIcon
              name="i-lucide-arrow-left"
              class="group-hover:-translate-x-0.5 transition-transform"
            />
            Go Back
          </button>
          <NuxtLink
            to="/"
            class="flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-primary-950 hover:bg-primary-400 transition-colors"
          >
            <UIcon name="i-lucide-home" />
            Back to Home
          </NuxtLink>
        </div>
      </div>
    </div>

    <div v-else-if="series" ref="contentRef" class="min-h-screen opacity-0">
      <MovieDetailCurtain ref="leftCurtain" side="left" />
      <MovieDetailCurtain ref="rightCurtain" side="right" />

      <div class="relative min-h-screen">
        <div class="absolute inset-0 overflow-hidden">
          <div
            v-if="backdropUrl"
            class="animate-poster absolute inset-0 bg-cover bg-center scale-105"
            :style="{ backgroundImage: `url('${backdropUrl}')` }"
          />
          <div
            class="absolute inset-0 bg-linear-to-t from-[#080808] via-[#080808]/90 to-[#080808]/70"
          />
          <div
            class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#080808_70%)]"
          />
          <div
            class="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('data:image/svg+xml,%3Csvg_viewBox=&quot;0_0_256_256&quot;_xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cfilter_id=&quot;noise&quot;%3E%3CfeTurbulence_type=&quot;fractalNoise&quot;_baseFrequency=&quot;0.9&quot;_numOctaves=&quot;4&quot;_stitchTiles=&quot;stitch&quot;/%3E%3C/filter%3E%3Crect_width=&quot;100%25&quot;_height=&quot;100%25&quot;_filter=&quot;url(%23noise)&quot;/%3E%3C/svg%3E')]"
          />
        </div>

        <div
          ref="spotlightRef"
          class="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-150 pointer-events-none opacity-0"
          aria-hidden="true"
        >
          <div
            class="absolute inset-0 bg-linear-to-b from-primary-500/5 via-primary-500/2 to-transparent"
            style="clip-path: polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%)"
          />
        </div>

        <div class="absolute top-0 left-0 pointer-events-none opacity-20" aria-hidden="true">
          <UIcon name="i-cinemax-corner-left" :size="128" class="text-primary-500" />
        </div>
        <div class="absolute top-0 right-0 pointer-events-none opacity-20" aria-hidden="true">
          <UIcon name="i-cinemax-corner-right" :size="128" class="text-primary-500" />
        </div>

        <UContainer>
          <div class="relative z-10 min-h-screen flex flex-col">
            <div class="mt-[calc(var(--ui-header-height)+1.5rem)]">
              <button
                class="group flex items-center gap-3 text-toned hover:text-primary-500 transition-colors"
                @click="goBack"
              >
                <div class="p-1.5 relative flex items-center justify-center">
                  <div
                    class="absolute inset-0 border border-stone-700 group-hover:border-primary-500/50 rotate-45 transition-colors"
                  />
                  <UIcon
                    name="i-lucide-arrow-left"
                    class="group-hover:-translate-x-0.5 transition-transform"
                  />
                </div>
                <span class="tracking-[0.2em] text-xs uppercase">Return to Lobby</span>
              </button>
            </div>

            <div class="pb-16 pt-20">
              <div class="w-full max-w-7xl mx-auto">
                <div class="flex flex-col lg:flex-row gap-10 lg:gap-16">
                  <MovieDetailPoster :src="series.poster" :alt="`Poster for ${series.title}`" />

                  <div class="flex-1 pb-4">
                    <div v-if="yearRange" class="animate-meta mb-4">
                      <span
                        class="inline-block px-4 py-1.5 border border-primary-500/30 text-primary-500/80 tracking-[0.3em] text-xs uppercase"
                      >
                        {{ yearRange }}
                      </span>
                    </div>

                    <h1
                      class="animate-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-primary-50 leading-[1.1] tracking-tight mb-6"
                    >
                      {{ series.title }}
                    </h1>

                    <div class="animate-meta flex flex-wrap items-center gap-4 mb-8">
                      <span class="text-stone-400">TV Series</span>
                      <span class="text-stone-600">◈</span>
                      <span v-if="seriesStatus" class="text-stone-400">{{ seriesStatus }}</span>
                      <template v-if="series.status === 'ongoing'">
                        <span class="text-stone-600">◈</span>
                        <span class="text-emerald-500/80 tracking-wider text-xs uppercase"
                          >Now Airing</span
                        >
                      </template>
                    </div>

                    <p
                      v-if="series.description"
                      class="animate-description text-lg text-stone-400 leading-relaxed max-w-2xl mb-10"
                    >
                      {{ series.description }}
                    </p>

                    <div class="animate-actions">
                      <MovieDetailButton :disabled="episodes.length === 0" @click="scrollToPlayer">
                        <template v-if="episodes.length === 0">No Episodes</template>
                      </MovieDetailButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </UContainer>
      </div>

      <section v-if="seasons.length > 0" class="relative py-12 px-6 md:px-12 lg:px-20">
        <div
          class="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-primary-500/20 to-transparent"
        />
        <div
          class="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border border-primary-500/30"
        />

        <div class="max-w-7xl mx-auto">
          <div class="animate-seasons">
            <div class="flex items-center justify-between mb-6">
              <div>
                <p class="text-primary-500/60 tracking-[0.3em] text-xs uppercase mb-2">Browse</p>
                <h2 class="text-2xl md:text-3xl font-medium text-primary-50">Seasons</h2>
              </div>
              <div class="hidden md:flex items-center gap-2 text-stone-600">
                <div class="w-8 h-px bg-stone-700" />
                <UIcon name="i-lucide-list-video" class="w-5 h-5" />
                <div class="w-8 h-px bg-stone-700" />
              </div>
            </div>

            <div class="relative">
              <div
                class="absolute -inset-1 bg-linear-to-r from-primary-500/5 via-primary-500/2 to-primary-500/5 pointer-events-none"
              />
              <div class="relative border border-stone-800/50 p-4">
                <UTabs
                  v-model="selectedSeasonId"
                  :items="seasonTabs"
                  :content="false"
                  class="w-full"
                  @update:model-value="onSeasonTabChange"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section v-if="selectedSeason" class="relative py-12 px-6 md:px-12 lg:px-20">
        <div class="max-w-7xl mx-auto">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 space-y-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-primary-500/60 tracking-[0.3em] text-xs uppercase mb-2">
                    Season {{ selectedSeason.seasonNumber }}
                  </p>
                  <h2 class="text-2xl font-medium text-primary-50">Episodes</h2>
                </div>
                <span v-if="selectedSeason.episodeCount" class="text-stone-500 text-sm">
                  {{ selectedSeason.episodeCount }} episodes
                </span>
              </div>

              <Loading v-if="isLoadingEpisodes" />

              <div
                v-else-if="episodes.length === 0"
                class="text-center py-16 border border-stone-800/50"
              >
                <div
                  class="w-16 h-16 border border-stone-800 rotate-45 flex items-center justify-center mx-auto mb-4"
                >
                  <UIcon name="i-lucide-video-off" class="w-6 h-6 text-stone-600 -rotate-45" />
                </div>
                <p class="text-stone-500">No episodes available</p>
              </div>

              <div v-else class="space-y-3">
                <button
                  v-for="episode in episodes"
                  :key="episode.id"
                  :class="[
                    'w-full flex items-center gap-4 p-4 border transition-all',
                    selectedEpisode?.id === episode.id
                      ? 'border-primary-500/30 bg-primary-500/5'
                      : 'border-stone-800/50 hover:border-stone-700',
                  ]"
                  @click="selectEpisode(episode)"
                >
                  <div
                    class="flex-shrink-0 w-12 h-12 border border-stone-800 flex items-center justify-center"
                  >
                    <span class="text-primary-50 font-bold text-lg">{{
                      episode.episodeNumber
                    }}</span>
                  </div>

                  <div class="flex-1 text-left min-w-0">
                    <p class="text-primary-50 font-medium">Episode {{ episode.episodeNumber }}</p>
                    <div class="flex items-center gap-3 text-sm text-stone-500">
                      <span v-if="episode.duration" class="flex items-center gap-1">
                        <UIcon name="i-lucide-clock" class="w-3 h-3" />
                        {{ formatDuration(episode.duration) }}
                      </span>
                      <span
                        v-if="episode.status"
                        :class="[
                          'px-2 py-0.5 text-xs',
                          episode.status === 'active' ? 'text-emerald-500/80' : 'text-stone-500',
                        ]"
                      >
                        {{ episode.status }}
                      </span>
                    </div>
                  </div>

                  <div class="flex-shrink-0">
                    <div
                      :class="[
                        'w-10 h-10 border flex items-center justify-center transition-all',
                        selectedEpisode?.id === episode.id
                          ? 'border-primary-500 bg-primary-500 text-primary-950'
                          : 'border-stone-800 text-stone-500 hover:border-primary-500/50 hover:text-primary-500',
                      ]"
                    >
                      <UIcon name="i-lucide-play" class="w-4 h-4" />
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div class="lg:col-span-1">
              <div
                ref="playerRef"
                tabindex="-1"
                class="sticky top-20 border border-stone-800/50 overflow-hidden"
              >
                <div class="p-4 border-b border-stone-800/50 flex items-center justify-between">
                  <div>
                    <p class="text-primary-500/60 tracking-[0.2em] text-xs uppercase mb-1">
                      Now Playing
                    </p>
                    <h3 v-if="selectedEpisode" class="text-lg font-medium text-primary-50">
                      Episode {{ selectedEpisode.episodeNumber }}
                    </h3>
                  </div>
                  <UIcon name="i-lucide-tv" class="w-5 h-5 text-stone-600" />
                </div>

                <div v-if="selectedEpisode" class="p-4">
                  <p class="text-stone-400 text-sm mb-4">
                    Season {{ selectedSeason.seasonNumber }}, Episode
                    {{ selectedEpisode.episodeNumber }}
                  </p>

                  <div class="relative w-full aspect-video bg-[#050505] overflow-hidden">
                    <MediaVideoPlayer
                      v-if="videoConfig"
                      :src="videoConfig.src"
                      :embed-type="videoConfig.embedType"
                      :video-id="videoConfig.videoId"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <div class="text-center">
                        <div
                          class="w-16 h-16 border border-stone-800 rotate-45 flex items-center justify-center mx-auto mb-4"
                        >
                          <UIcon
                            name="i-lucide-video-off"
                            class="w-6 h-6 text-stone-600 -rotate-45"
                          />
                        </div>
                        <p class="text-stone-500">Video unavailable</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else class="p-8 text-center">
                  <div
                    class="w-16 h-16 border border-stone-800 rotate-45 flex items-center justify-center mx-auto mb-4"
                  >
                    <UIcon name="i-lucide-tv-2" class="w-6 h-6 text-stone-600 -rotate-45" />
                  </div>
                  <p class="text-stone-500">Select an episode</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="relative py-16 px-6 md:px-12 lg:px-20">
        <div class="max-w-7xl mx-auto">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <MovieDetailCard v-if="yearRange" label="Aired">
              <p class="text-primary-50 text-2xl font-medium">{{ yearRange }}</p>
            </MovieDetailCard>

            <MovieDetailCard v-if="seriesStatus" label="Status">
              <p class="text-primary-50 text-2xl font-medium">{{ seriesStatus }}</p>
            </MovieDetailCard>

            <MovieDetailCard v-if="formattedRating" label="Audience Score">
              <div class="flex items-center gap-3">
                <UIcon name="i-lucide-star" class="w-6 h-6 text-primary-500 fill-primary-500" />
                <span class="text-primary-50 text-2xl font-medium">{{ formattedRating }}</span>
                <span class="text-stone-600 text-sm">/10</span>
              </div>
            </MovieDetailCard>

            <MovieDetailCard label="Seasons">
              <p class="text-primary-50 text-2xl font-medium">{{ seasons.length }}</p>
            </MovieDetailCard>
          </div>
        </div>
      </section>

      <section class="relative py-12 px-6 md:px-12 lg:px-20">
        <div
          class="absolute top-0 left-20 right-20 h-px bg-linear-to-r from-transparent via-stone-800 to-transparent"
        />
        <div
          class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-4"
        >
          <div class="w-12 h-px bg-stone-800" />
          <div class="w-2 h-2 rotate-45 border border-stone-700" />
          <div class="w-12 h-px bg-stone-800" />
        </div>

        <div class="max-w-7xl mx-auto">
          <div
            class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-stone-600"
          >
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-hash" class="w-3 h-3" />
              <span class="text-xs tracking-wider">Series ID: {{ series.id }}</span>
            </div>
            <p v-if="series.createdAt" class="text-xs tracking-wider">
              Added to Collection •
              {{
                new Date(series.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              }}
            </p>
          </div>
        </div>
      </section>

      <div class="relative h-8 overflow-hidden" aria-hidden="true">
        <div class="absolute inset-0 flex justify-center items-center gap-2">
          <div class="w-20 h-px bg-linear-to-r from-transparent to-primary-500/20" />
          <div class="w-1 h-1 rotate-45 bg-primary-500/20" />
          <div class="w-16 h-px bg-primary-500/20" />
          <div class="w-2 h-2 border border-primary-500/20 rotate-45" />
          <div class="w-16 h-px bg-primary-500/20" />
          <div class="w-1 h-1 rotate-45 bg-primary-500/20" />
          <div class="w-20 h-px bg-linear-to-l from-transparent to-primary-500/20" />
        </div>
      </div>
    </div>
  </div>
</template>
