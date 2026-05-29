<script setup lang="ts">
import gsap from "gsap";

const route = useRoute();
const router = useRouter();

const seriesId = computed(() => route.params.id as string);

const contentRef = useTemplateRef("contentRef");
const leftCurtain = useTemplateRef("leftCurtain");
const rightCurtain = useTemplateRef("rightCurtain");
const spotlightRef = useTemplateRef("spotlightRef");
const playerRef = useTemplateRef("playerRef");

const leftCurtainEl = computed(() => leftCurtain.value?.root);
const rightCurtainEl = computed(() => rightCurtain.value?.root);

const { data: seriesResponse, pending: isLoading } = await useFetch(
  `/api/series/${seriesId.value}`,
  { watch: [seriesId] },
);

const series = computed(() => seriesResponse.value?.data ?? null);
const statusCode = computed(() => seriesResponse.value?.status.code ?? null);
const error = computed(() => {
  const code = seriesResponse.value?.status.code;
  if (code && code !== ApiResponseCode.Success) {
    return seriesResponse.value?.status.message || "Failed to load series details";
  }
  return null;
});

const { data: seasonsResponse, pending: isLoadingSeasons } = await useFetch<ApiResponse<Season[]>>(
  `/api/series/${seriesId.value}/seasons`,
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
} = useLazyAsyncData<ApiResponse<Episode[]>>(
  `season-episodes`,
  () => {
    if (!selectedSeason.value)
      return Promise.resolve({
        status: { code: ApiResponseCode.Success, message: "", requestId: "", requestTime: 0 },
        data: [],
      });
    return $fetch<ApiResponse<Episode[]>>(`/api/seasons/${selectedSeason.value.id}/episodes`);
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
  tl.from(".animate-theater", { y: 80, opacity: 0, duration: 1, ease: "power3.out" }, 1.2);
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
      if (isLoaded) nextTick(() => runAnimations());
    },
    { immediate: true },
  );
});

onUnmounted(() => tl.kill());

const user = useUser();
const inWatchlist = ref(false);
const watchlistId = ref<string | null>(null);

const checkWatchlist = async () => {
  if (!user.value || !series.value) return;
  try {
    const res = await useApi<ApiResponse<{ inWatchlist: boolean; watchlistId: string | null }>>(
      "/api/watchlist/check",
      {
        query: { contentType: "series", contentId: series.value.id },
      },
    );
    if (isSuccessResponse(res)) {
      inWatchlist.value = res.data.inWatchlist;
      watchlistId.value = res.data.watchlistId;
    }
  } catch {}
};

const toggleWatchlist = async () => {
  if (!user.value) return navigateTo("/auth");
  const toast = useToast();

  try {
    if (inWatchlist.value && watchlistId.value) {
      await useApi(`/api/watchlist/${watchlistId.value}`, { method: "DELETE" });
      inWatchlist.value = false;
      watchlistId.value = null;
      toast.add({ title: "Removed from your list", color: "success" });
    } else {
      const res = await useApi<ApiResponse<{ id: string }>>("/api/watchlist", {
        method: "POST",
        body: { contentType: "series", contentId: series.value!.id },
      });
      if (isSuccessResponse(res)) {
        inWatchlist.value = true;
        watchlistId.value = res.data.id;
        toast.add({ title: "Added to your list", color: "success" });
      }
    }
  } catch {}
};

watch(seriesId, () => {
  inWatchlist.value = false;
  watchlistId.value = null;
  checkWatchlist();
});

watch(
  () => user.value && series.value,
  (active) => {
    if (active) checkWatchlist();
  },
  { immediate: true },
);

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
          <div class="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none">
            <UIcon name="i-cinemax-noise" class="w-full h-full text-white" />
          </div>
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
                  <MovieDetailPoster
                    :src="series.poster || series.thumbnail"
                    :alt="`Poster for ${series.title}`"
                  />

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
                      <template v-if="formattedRating">
                        <span class="text-stone-600">◈</span>
                        <span class="flex items-center gap-2 text-stone-400">
                          <UIcon
                            name="i-lucide-star"
                            class="w-4 h-4 text-primary-500 fill-primary-500"
                          />
                          {{ formattedRating }}
                        </span>
                      </template>
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

                    <div class="animate-actions flex items-center gap-4">
                      <MovieDetailButton :disabled="episodes.length === 0" @click="scrollToPlayer">
                        <template v-if="episodes.length === 0">No Episodes</template>
                      </MovieDetailButton>
                      <button
                        v-if="user"
                        class="flex items-center gap-2 px-4 py-2.5 border border-stone-700 hover:border-primary-500/50 text-stone-400 hover:text-primary-400 transition-colors tracking-[0.1em] text-xs uppercase"
                        @click="toggleWatchlist"
                      >
                        <UIcon
                          :name="inWatchlist ? 'i-lucide-bookmark-check' : 'i-lucide-bookmark'"
                          class="w-4 h-4"
                        />
                        {{ inWatchlist ? "In My List" : "Add to List" }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </UContainer>
      </div>

      <section v-if="seasons.length > 0" class="relative py-20 px-6 md:px-12 lg:px-20">
        <div
          class="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-primary-500/20 to-transparent"
        />
        <div
          class="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border border-primary-500/30"
        />

        <div class="max-w-7xl mx-auto">
          <div class="animate-theater mb-10 flex items-center justify-between">
            <div>
              <p class="text-primary-500/60 tracking-[0.3em] text-xs uppercase mb-2">
                Screening Room
              </p>
              <h2 class="text-2xl md:text-3xl font-medium text-primary-50">
                Watch {{ series.title }}
              </h2>
            </div>
            <div class="hidden md:flex items-center gap-2 text-stone-600">
              <div class="w-8 h-px bg-stone-700" />
              <UIcon name="i-lucide-tv" class="w-5 h-5" />
              <div class="w-8 h-px bg-stone-700" />
            </div>
          </div>

          <div ref="playerRef" class="animate-theater relative">
            <div
              class="absolute -inset-1 bg-linear-to-r from-primary-500/10 via-primary-500/5 to-primary-500/10 pointer-events-none"
            />
            <div class="absolute -inset-2 border border-primary-500/10 pointer-events-none" />

            <div
              class="relative w-full aspect-video bg-[#050505] overflow-hidden shadow-2xl shadow-black/50"
            >
              <div class="absolute inset-0 pointer-events-none z-10">
                <div class="absolute inset-0 bg-linear-to-b from-white/2 to-transparent" />
              </div>

              <MediaVideoPlayer
                v-if="videoConfig"
                :src="videoConfig.src"
                :embed-type="videoConfig.embedType"
                :video-id="videoConfig.videoId"
                content-type="episode"
                :content-id="selectedEpisode!.id"
              />

              <div v-else class="w-full h-full flex items-center justify-center">
                <div class="text-center">
                  <div class="relative inline-block mb-6">
                    <div
                      class="w-24 h-24 border border-stone-800 rotate-45 flex items-center justify-center"
                    >
                      <UIcon name="i-lucide-video-off" class="w-8 h-8 text-stone-600 -rotate-45" />
                    </div>
                  </div>
                  <p class="text-stone-500 tracking-wide">
                    This screening is currently unavailable
                  </p>
                  <p class="text-stone-600 text-sm mt-2">Please check back later</p>
                </div>
              </div>
            </div>

            <div
              v-if="selectedEpisode"
              class="mt-4 flex items-center justify-between text-sm text-stone-500"
            >
              <span>
                Season {{ selectedSeason?.seasonNumber }}, Episode
                {{ selectedEpisode.episodeNumber }}
              </span>
              <span v-if="selectedEpisode.duration" class="flex items-center gap-1">
                <UIcon name="i-lucide-clock" class="w-3 h-3" />
                {{ formatDuration(selectedEpisode.duration) }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section v-if="seasons.length > 0" class="relative py-12 px-6 md:px-12 lg:px-20">
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
          <div class="flex items-center justify-between mb-6">
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

          <div v-else class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
            <button
              v-for="episode in episodes"
              :key="episode.id"
              class="group text-left border transition-all duration-300"
              :class="
                selectedEpisode?.id === episode.id
                  ? 'border-primary-500/30 bg-primary-500/5'
                  : 'border-stone-800/50 hover:border-stone-700'
              "
              @click="selectEpisode(episode)"
            >
              <div class="flex items-center justify-between p-3">
                <span
                  class="text-sm font-bold font-mono"
                  :class="
                    selectedEpisode?.id === episode.id
                      ? 'text-primary-400'
                      : 'text-stone-500 group-hover:text-stone-300'
                  "
                >
                  EP {{ String(episode.episodeNumber).padStart(2, "0") }}
                </span>

                <span v-if="episode.duration" class="text-xs text-stone-600">
                  {{ formatDuration(episode.duration) }}
                </span>
              </div>
            </button>
          </div>
        </div>
      </section>

      <DecorativeDivider class="mt-8" />

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
              Added to Collection &bull;
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
    </div>
  </div>
</template>
