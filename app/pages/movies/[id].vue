<script setup lang="ts">
import type { Response, Movie } from "#shared/types";

const route = useRoute();
const router = useRouter();
const { $gsap: gsap } = useNuxtApp();
const { isInList, toggleListItem } = useMyList();

const movieId = computed(() => route.params.id as string);

const pageRef = ref<HTMLElement>();
const contentRef = ref<HTMLElement>();

const prefersReducedMotion = ref(false);
onMounted(() => {
  prefersReducedMotion.value = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
});

const {
  data: response,
  pending: isLoading,
  error: fetchError,
  refresh,
} = await useAsyncData<Response<Movie>>(
  `movie-${movieId.value}`,
  () => $fetch<Response<Movie>>(`/api/movies/${movieId.value}`),
  {
    watch: [movieId],
  },
);

const movie = computed(() => response.value?.data ?? null);
const error = computed(() => {
  if (fetchError.value) {
    return fetchError.value.message || "Failed to fetch movie";
  }
  if (response.value?.status.code !== "SUCCESS" && response.value?.status.code) {
    return response.value.status.message || "Failed to load movie details";
  }
  return null;
});

const statusCode = computed(() => response.value?.status.code ?? null);

const formattedDuration = computed(() => {
  if (!movie.value?.duration) return null;
  const hours = Math.floor(movie.value.duration / 60);
  const mins = movie.value.duration % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
});

const formattedRating = computed(() => {
  if (!movie.value?.rating) return null;
  return Number(movie.value.rating).toFixed(1);
});

const backdropUrl = computed(() => {
  return movie.value?.poster || movie.value?.thumbnail || "";
});

// Video player configuration
const videoConfig = computed(() => {
  if (!movie.value?.embedUrl || !movie.value?.embedType) return null;
  return {
    src: movie.value.embedUrl,
    embedType: movie.value.embedType as "youtube" | "vimeo" | "mp4" | "direct",
    videoId: movie.value.id,
    poster: movie.value.thumbnail || movie.value.poster || undefined,
  };
});

const goBack = () => {
  router.back();
};

const scrollToPlayer = () => {
  const player = document.getElementById("video-player");
  player?.scrollIntoView({ behavior: prefersReducedMotion.value ? "auto" : "smooth" });
};

const isInWatchlist = computed(() => {
  if (!movie.value) return false;
  return isInList(movie.value.id);
});

const handleToggleWatchlist = () => {
  if (!movie.value) return;
  toggleListItem(movie.value);
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
    ".animate-player",
    {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    },
    0.6,
  );
};

onMounted(() => {
  watch(
    () => !isLoading.value && movie.value,
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
  title: movie.value ? `${movie.value.title} - Cine Max` : "Movie - Cine Max",
  meta: [
    {
      name: "description",
      content: movie.value?.description || "Watch this movie on Cine Max",
    },
    {
      property: "og:title",
      content: movie.value?.title || "Movie",
    },
    {
      property: "og:description",
      content: movie.value?.description || "",
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
          Loading movie details...
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
          {{ statusCode === "NOT_FOUND" ? "Movie Not Found" : "Error Loading Movie" }}
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
          <UButton size="lg" icon="i-lucide-home" to="/"> Back to Home </UButton>
        </div>
      </div>
    </div>

    <div v-else-if="movie" ref="contentRef" class="min-h-screen">
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
                      v-if="movie.poster"
                      :src="movie.poster"
                      :alt="`Poster for ${movie.title}`"
                      class="w-full h-full object-cover"
                      width="400"
                      height="600"
                      format="webp"
                      :modifiers="{ quality: 90 }"
                      loading="eager"
                    />
                    <div
                      v-else-if="movie.thumbnail"
                      class="w-full h-full flex items-center justify-center"
                    >
                      <NuxtImg
                        :src="movie.thumbnail"
                        :alt="`Thumbnail for ${movie.title}`"
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
                      <UIcon name="i-lucide-film" class="w-24 h-24 text-neutral-700" />
                    </div>
                  </div>
                </div>

                <div class="lg:w-2/3 flex flex-col justify-end pb-8">
                  <h1
                    class="animate-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-4"
                  >
                    {{ movie.title }}
                  </h1>

                  <div class="animate-meta flex flex-wrap items-center gap-3 mb-6">
                    <UBadge
                      v-if="formattedRating"
                      size="lg"
                      variant="subtle"
                      color="yellow"
                      class="flex items-center gap-1"
                      :aria-label="`Rating: ${formattedRating} out of 10`"
                    >
                      <template #leading>
                        <UIcon
                          name="i-lucide-star"
                          class="w-4 h-4 text-yellow-400 fill-yellow-400"
                        />
                      </template>
                      {{ formattedRating }}
                    </UBadge>

                    <span class="text-neutral-500" aria-hidden="true">•</span>

                    <span v-if="movie.releaseYear" class="text-neutral-300 font-medium">
                      {{ movie.releaseYear }}
                    </span>

                    <span v-if="formattedDuration" class="text-neutral-500" aria-hidden="true"
                      >•</span
                    >

                    <span v-if="formattedDuration" class="text-neutral-300 font-medium">
                      {{ formattedDuration }}
                    </span>

                    <span class="text-neutral-500" aria-hidden="true">•</span>

                    <UBadge label="Movie" size="lg" variant="subtle" color="primary" />
                  </div>

                  <p
                    v-if="movie.description"
                    class="animate-description text-base sm:text-lg text-neutral-300 leading-relaxed max-w-2xl"
                  >
                    {{ movie.description }}
                  </p>

                  <div class="animate-actions flex flex-wrap items-center gap-3 mt-8">
                    <UButton
                      size="xl"
                      color="primary"
                      icon="i-lucide-play"
                      class="shadow-lg shadow-primary-500/25"
                      aria-label="Scroll to video player and watch movie"
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
                        aria-label="Add this movie to your watchlist"
                        @click="handleToggleWatchlist"
                      >
                        {{ isInWatchlist ? "In My List" : "My List" }}
                      </UButton>
                    </UTooltip>
                  </div>
                </div>
              </div>
            </div>
          </UContainer>
        </div>
      </div>

      <section class="relative z-10 -mt-8">
        <UContainer>
          <div
            class="animate-player bg-neutral-900/50 backdrop-blur-xl rounded-2xl border border-neutral-800/50 overflow-hidden shadow-2xl"
          >
            <div class="p-4 border-b border-neutral-800/50">
              <h2 class="text-xl font-semibold text-white flex items-center gap-2">
                <UIcon name="i-lucide-play-circle" class="text-primary-400" />
                Watch Movie
              </h2>
            </div>

            <div id="video-player" class="relative w-full aspect-video bg-black">
              <MediaVideoPlayer
                v-if="videoConfig"
                :src="videoConfig.src"
                :embed-type="videoConfig.embedType"
                :video-id="videoConfig.videoId"
                :poster="videoConfig.poster"
              />
              <div v-else class="w-full h-full flex items-center justify-center bg-neutral-900">
                <div class="text-center">
                  <UIcon
                    name="i-lucide-video-off"
                    class="w-16 h-16 text-neutral-700 mx-auto mb-4"
                  />
                  <p class="text-neutral-500">Video not available</p>
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
              v-if="movie.releaseYear"
              class="bg-neutral-900/30 backdrop-blur-sm rounded-xl p-6 border border-neutral-800/50"
            >
              <p class="text-neutral-500 text-sm mb-1">Release Year</p>
              <p class="text-white text-lg font-semibold">{{ movie.releaseYear }}</p>
            </div>

            <div
              v-if="formattedDuration"
              class="bg-neutral-900/30 backdrop-blur-sm rounded-xl p-6 border border-neutral-800/50"
            >
              <p class="text-neutral-500 text-sm mb-1">Duration</p>
              <p class="text-white text-lg font-semibold">{{ formattedDuration }}</p>
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
              <p class="text-neutral-500 text-sm mb-1">Status</p>
              <p class="text-white text-lg font-semibold">
                {{ movie.status === "active" ? "Available" : movie.status }}
              </p>
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
              <p class="text-neutral-500 text-sm">Movie ID: {{ movie.id }}</p>
              <p v-if="movie.createdAt" class="text-neutral-600 text-sm">
                Added {{ new Date(movie.createdAt).toLocaleDateString() }}
              </p>
            </div>
          </div>
        </UContainer>
      </section>
    </div>
  </div>
</template>
