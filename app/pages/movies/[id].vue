<script setup lang="ts">
import gsap from "gsap";

import type { Response } from "#shared/types";

const route = useRoute();
const router = useRouter();

const movieId = computed(() => route.params.id as string);

const contentRef = ref<HTMLElement>();
const leftCurtain = useTemplateRef("leftCurtain");
const rightCurtain = useTemplateRef("rightCurtain");
const spotlightRef = ref<HTMLElement>();

const leftCurtainEl = computed(() => leftCurtain.value?.root);
const rightCurtainEl = computed(() => rightCurtain.value?.root);

const { data, pending } = await useLazyAsyncData<Response<Movie>>(`movie-${movieId.value}`, () =>
  $fetch<Response<Movie>>(`/api/movies/${movieId.value}`),
);

const movie = computed(() => data.value?.data ?? null);

const formattedDuration = computed(() => {
  if (!movie.value?.duration) return undefined;
  const hours = Math.floor(movie.value.duration / 60);
  const mins = movie.value.duration % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
});

const formattedRating = computed(() => {
  if (!movie.value?.rating) return null;
  return Number(movie.value.rating).toFixed(1);
});

const backdropUrl = computed(() => movie.value?.poster || movie.value?.thumbnail || "");

const videoConfig = computed(() => {
  if (!movie.value?.embedUrl || !movie.value?.embedType) return null;
  return {
    src: movie.value.embedUrl,
    embedType: movie.value.embedType as "youtube" | "vimeo" | "mp4" | "direct",
    videoId: movie.value.id,
    poster: movie.value.thumbnail || movie.value.poster || undefined,
  };
});

const goBack = () => router.back();

const scrollToPlayer = () => {
  document.getElementById("video-player")?.scrollIntoView({ behavior: "smooth" });
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
  tl.from(
    ".animate-card",
    { y: 40, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" },
    1.5,
  );
}

watch(pending, (value) => {
  if (value) return;
  nextTick(() => runAnimations());
});

onMounted(() => {
  if (!pending.value) runAnimations();
});

onUnmounted(() => tl.kill());

useSeoMeta({
  title: movie.value ? `${movie.value.title} - Cine Max` : "Movie - Cine Max",
  description: movie.value?.description || "Watch this movie on Cine Max",
});
</script>

<template>
  <div class="min-h-screen bg-[#080808] overflow-x-hidden">
    <Loading v-if="pending || !movie" />

    <div v-else ref="contentRef" class="min-h-screen opacity-0">
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

        <div
          class="absolute top-0 left-0 w-32 h-32 pointer-events-none opacity-20"
          aria-hidden="true"
        >
          <svg viewBox="0 0 128 128" class="w-full h-full text-primary-500">
            <path d="M0 0 L128 0 L128 8 L8 8 L8 128 L0 128 Z" fill="currentColor" />
            <path d="M16 16 L48 16 L48 20 L20 20 L20 48 L16 48 Z" fill="currentColor" />
          </svg>
        </div>
        <div
          class="absolute top-0 right-0 w-32 h-32 pointer-events-none opacity-20 rotate-90"
          aria-hidden="true"
        >
          <svg viewBox="0 0 128 128" class="w-full h-full text-primary-500">
            <path d="M0 0 L128 0 L128 8 L8 8 L8 128 L0 128 Z" fill="currentColor" />
            <path d="M16 16 L48 16 L48 20 L20 20 L20 48 L16 48 Z" fill="currentColor" />
          </svg>
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
                  <MovieDetailPoster :src="movie.poster" :alt="`Poster for ${movie.title}`" />

                  <div class="flex-1 pb-4">
                    <div v-if="movie.releaseYear" class="animate-meta mb-4">
                      <span
                        class="inline-block px-4 py-1.5 border border-primary-500/30 text-primary-500/80 tracking-[0.3em] text-xs uppercase"
                      >
                        {{ movie.releaseYear }}
                      </span>
                    </div>

                    <h1
                      class="animate-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-primary-50 leading-[1.1] tracking-tight mb-6"
                    >
                      {{ movie.title }}
                    </h1>

                    <div class="animate-meta flex flex-wrap items-center gap-4 mb-8">
                      <span v-if="formattedDuration" class="flex items-center gap-2 text-stone-400">
                        <UIcon name="i-lucide-clock" class="w-4 h-4 text-primary-500/60" />
                        <span>{{ formattedDuration }}</span>
                      </span>
                      <span class="text-stone-600">◈</span>
                      <span class="text-stone-400">Motion Picture</span>
                      <template v-if="movie.status === 'active'">
                        <span class="text-stone-600">◈</span>
                        <span class="text-emerald-500/80 tracking-wider text-xs uppercase"
                          >Now Showing</span
                        >
                      </template>
                    </div>

                    <p
                      v-if="movie.description"
                      class="animate-description text-lg text-stone-400 leading-relaxed max-w-2xl mb-10"
                    >
                      {{ movie.description }}
                    </p>

                    <div class="animate-actions">
                      <MovieDetailButton @click="scrollToPlayer" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </UContainer>
      </div>

      <section class="relative py-20 px-6 md:px-12 lg:px-20">
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
                Watch {{ movie.title }}
              </h2>
            </div>
            <div class="hidden md:flex items-center gap-2 text-stone-600">
              <div class="w-8 h-px bg-stone-700" />
              <UIcon name="i-lucide-projector" class="w-5 h-5" />
              <div class="w-8 h-px bg-stone-700" />
            </div>
          </div>

          <div class="animate-theater relative">
            <div
              class="absolute -inset-1 bg-linear-to-r from-primary-500/10 via-primary-500/5 to-primary-500/10 pointer-events-none"
            />
            <div class="absolute -inset-2 border border-primary-500/10 pointer-events-none" />

            <div
              id="video-player"
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
                :poster="videoConfig.poster"
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
          </div>
        </div>
      </section>

      <section class="relative py-16 px-6 md:px-12 lg:px-20">
        <div class="max-w-7xl mx-auto">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <MovieDetailCard v-if="movie.releaseYear" label="Released">
              <p class="text-primary-50 text-2xl font-medium">{{ movie.releaseYear }}</p>
            </MovieDetailCard>

            <MovieDetailCard v-if="formattedDuration" label="Duration">
              <p class="text-primary-50 text-2xl font-medium">{{ formattedDuration }}</p>
            </MovieDetailCard>

            <MovieDetailCard v-if="formattedRating" label="Audience Score">
              <div class="flex items-center gap-3">
                <UIcon name="i-lucide-star" class="w-6 h-6 text-primary-500 fill-primary-500" />
                <span class="text-primary-50 text-2xl font-medium">{{ formattedRating }}</span>
                <span class="text-stone-600 text-sm">/10</span>
              </div>
            </MovieDetailCard>

            <MovieDetailCard label="Availability">
              <div class="flex items-center gap-2">
                <div
                  class="w-2 h-2 rounded-full"
                  :class="movie.status === 'active' ? 'bg-emerald-500' : 'bg-stone-600'"
                />
                <p class="text-primary-50 text-2xl font-medium">
                  {{ movie.status === "active" ? "Available" : movie.status }}
                </p>
              </div>
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
              <span class="text-xs tracking-wider">Feature ID: {{ movie.id }}</span>
            </div>
            <p v-if="movie.createdAt" class="text-xs tracking-wider">
              Added to Collection •
              {{
                new Date(movie.createdAt).toLocaleDateString("en-US", {
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
