<script setup lang="ts">
import type { Movie, TVSeries } from "#shared/types";

// Get GSAP from Nuxt app
const { $gsap: gsap } = useNuxtApp();

interface FeaturedItem {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  poster: string | null;
  rating: string | null;
  releaseYear: number | null;
  firstAiredYear: number | null;
  lastAiredYear: number | null;
  duration: number | null;
  type: "movie" | "series";
}

const props = defineProps<{
  featuredMovies?: Movie[];
  featuredSeries?: TVSeries[];
}>();

const currentIndex = ref(0);
const isAnimating = ref(false);
const autoRotateInterval = ref<ReturnType<typeof setInterval> | null>(null);
const isPaused = ref(false);

// GSAP context for proper cleanup
let gsapCtx: ReturnType<typeof gsap.context> | null = null;
let animationTimeline: ReturnType<typeof gsap.timeline> | null = null;

// Combine and shuffle featured content
const featuredItems = computed<FeaturedItem[]>(() => {
  const movies = (props.featuredMovies || []).map(
    (item): FeaturedItem => ({
      id: item.id,
      title: item.title,
      description: item.description,
      thumbnail: item.thumbnail,
      poster: item.poster,
      rating: item.rating,
      releaseYear: item.releaseYear,
      firstAiredYear: null,
      lastAiredYear: null,
      duration: item.duration,
      type: "movie" as const,
    }),
  );
  const series = (props.featuredSeries || []).map(
    (item): FeaturedItem => ({
      id: item.id,
      title: item.title,
      description: item.description,
      thumbnail: item.thumbnail,
      poster: item.poster,
      rating: item.rating,
      releaseYear: null,
      firstAiredYear: item.firstAiredYear,
      lastAiredYear: item.lastAiredYear,
      duration: null,
      type: "series" as const,
    }),
  );

  const allItems = [...movies, ...series];

  // Fisher-Yates shuffle for variety
  const shuffled = [...allItems];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j] ?? temp;
    shuffled[j] = temp;
  }

  return shuffled;
});

const currentItem = computed(() => featuredItems.value[currentIndex.value] ?? null);
const totalItems = computed(() => featuredItems.value.length);

// GSAP animation references
const heroRef = ref<HTMLElement | null>(null);
const titleRef = ref<HTMLElement | null>(null);
const metaRef = ref<HTMLElement | null>(null);
const descRef = ref<HTMLElement | null>(null);
const buttonsRef = ref<HTMLElement | null>(null);
const bgImageRef = ref<HTMLElement | null>(null);

// Sanitize URL to prevent injection
const sanitizeUrl = (url: string | null): string => {
  if (!url) return "";
  // Only allow http/https URLs from trusted domains
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return url;
    }
  } catch {
    return "";
  }
  return "";
};

const backgroundImageUrl = computed(() => {
  if (!currentItem.value) return "";
  const url = sanitizeUrl(currentItem.value.thumbnail || currentItem.value.poster);
  return url ? `url('${url}')` : "";
});

const animateIn = () => {
  if (!heroRef.value || !gsapCtx) return;

  isAnimating.value = true;

  // Kill existing timeline
  if (animationTimeline) {
    animationTimeline.kill();
    animationTimeline = null;
  }

  animationTimeline = gsap.timeline({
    onComplete: () => {
      isAnimating.value = false;
    },
  });

  // Background image scale animation
  if (bgImageRef.value) {
    gsap.set(bgImageRef.value, { scale: 1.1 });
    animationTimeline.to(
      bgImageRef.value,
      {
        scale: 1,
        duration: 1.5,
        ease: "power2.out",
      },
      0,
    );
  }

  // Staggered content animations
  if (titleRef.value) {
    gsap.set(titleRef.value, { y: 30, opacity: 0 });
    animationTimeline.to(
      titleRef.value,
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
      0.2,
    );
  }

  if (metaRef.value) {
    gsap.set(metaRef.value, { y: 20, opacity: 0 });
    animationTimeline.to(
      metaRef.value,
      { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
      0.4,
    );
  }

  if (descRef.value) {
    gsap.set(descRef.value, { y: 20, opacity: 0 });
    animationTimeline.to(
      descRef.value,
      { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
      0.55,
    );
  }

  if (buttonsRef.value) {
    gsap.set(buttonsRef.value, { y: 20, opacity: 0 });
    animationTimeline.to(
      buttonsRef.value,
      { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
      0.7,
    );
  }
};

const goToSlide = (index: number) => {
  if (isAnimating.value || index === currentIndex.value) return;

  const direction = index > currentIndex.value ? 1 : -1;

  // Animate out
  if (animationTimeline) {
    animationTimeline.kill();
    animationTimeline = null;
  }

  animationTimeline = gsap.timeline({
    onComplete: () => {
      currentIndex.value = index;
      nextTick(() => animateIn());
    },
  });

  const exitElements = [titleRef.value, metaRef.value, descRef.value, buttonsRef.value].filter(
    (el): el is HTMLElement => el !== null,
  );

  animationTimeline.to(exitElements, {
    x: -50 * direction,
    opacity: 0,
    duration: 0.4,
    stagger: 0.05,
    ease: "power2.in",
  });
};

const nextSlide = () => {
  const nextIndex = (currentIndex.value + 1) % totalItems.value;
  goToSlide(nextIndex);
};

const prevSlide = () => {
  const prevIndex = (currentIndex.value - 1 + totalItems.value) % totalItems.value;
  goToSlide(prevIndex);
};

// Keyboard navigation
const handleKeydown = (event: KeyboardEvent) => {
  if (totalItems.value <= 1) return;

  switch (event.key) {
    case "ArrowLeft":
      event.preventDefault();
      prevSlide();
      break;
    case "ArrowRight":
      event.preventDefault();
      nextSlide();
      break;
    case "Home":
      event.preventDefault();
      goToSlide(0);
      break;
    case "End":
      event.preventDefault();
      goToSlide(totalItems.value - 1);
      break;
  }
};

// Auto-rotation
const startAutoRotate = () => {
  stopAutoRotate();
  if (!isPaused.value && totalItems.value > 1) {
    autoRotateInterval.value = window.setInterval(() => {
      nextSlide();
    }, 8000);
  }
};

const stopAutoRotate = () => {
  if (autoRotateInterval.value) {
    clearInterval(autoRotateInterval.value);
    autoRotateInterval.value = null;
  }
};

const pauseRotation = () => {
  isPaused.value = true;
  stopAutoRotate();
};

const resumeRotation = () => {
  isPaused.value = false;
  startAutoRotate();
};

// Lifecycle hooks
onMounted(() => {
  // Create GSAP context for this component
  gsapCtx = gsap.context(() => {}, heroRef.value ?? undefined);

  nextTick(() => {
    animateIn();
    startAutoRotate();
  });

  // Add keyboard listener
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  // Clean up GSAP context and all animations
  if (gsapCtx) {
    gsapCtx.revert();
    gsapCtx = null;
  }

  if (animationTimeline) {
    animationTimeline.kill();
    animationTimeline = null;
  }

  stopAutoRotate();
  window.removeEventListener("keydown", handleKeydown);
});

// Watch for data changes - use shallow watch
watch(
  () => [props.featuredMovies?.length, props.featuredSeries?.length],
  () => {
    nextTick(() => {
      currentIndex.value = 0;
      animateIn();
    });
  },
);

// Generate display year
const displayYear = computed(() => {
  if (!currentItem.value) return "";
  if (currentItem.value.type === "movie") {
    return currentItem.value.releaseYear?.toString() || "";
  } else {
    return currentItem.value.firstAiredYear?.toString() || "";
  }
});

// Format rating
const displayRating = computed(() => {
  if (!currentItem.value?.rating) return null;
  const rating = currentItem.value.rating;
  return rating.includes("/") ? rating : `${rating}/10`;
});
</script>

<template>
  <div
    ref="heroRef"
    class="relative w-full h-[70vh] md:h-[85vh] overflow-hidden group"
    @mouseenter="pauseRotation"
    @mouseleave="resumeRotation"
    role="region"
    aria-label="Featured content carousel"
    :aria-roledescription="`Slide ${currentIndex + 1} of ${totalItems}`"
  >
    <!-- Background Image -->
    <div class="absolute inset-0 bg-neutral-950">
      <div
        v-if="currentItem && backgroundImageUrl"
        ref="bgImageRef"
        class="absolute inset-0 bg-cover bg-center transition-transform duration-[1500ms]"
        :style="{ backgroundImage: backgroundImageUrl }"
      />
      <!-- Gradient Overlays -->
      <div
        class="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"
      />
      <div
        class="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent md:from-background/70"
      />
      <div class="absolute inset-0 bg-black/20" />
    </div>

    <!-- Loading Skeleton -->
    <div
      v-if="!currentItem"
      class="absolute inset-0 flex items-center justify-center bg-neutral-900"
    >
      <div class="flex flex-col items-center gap-4">
        <div
          class="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"
        />
        <p class="text-neutral-400 text-sm">Loading featured content...</p>
      </div>
    </div>

    <!-- Content Container -->
    <div v-if="currentItem" class="relative h-full flex items-center">
      <div class="container mx-auto px-4 md:px-8 lg:px-12">
        <div class="max-w-2xl md:max-w-3xl">
          <!-- Type Badge -->
          <div class="inline-flex items-center gap-2 mb-4">
            <UBadge
              variant="subtle"
              :color="currentItem.type === 'movie' ? 'primary' : 'secondary'"
              size="md"
              class="uppercase tracking-wider font-semibold text-xs"
            >
              {{ currentItem.type === "movie" ? "Movie" : "TV Series" }}
            </UBadge>
            <UBadge v-if="displayYear" variant="soft" color="neutral" size="md" class="font-mono">
              {{ displayYear }}
            </UBadge>
            <UBadge v-if="displayRating" variant="soft" color="warning" size="md" class="font-mono">
              <span class="flex items-center gap-1">
                <UIcon name="i-heroicons-star" class="w-3 h-3" />
                {{ displayRating }}
              </span>
            </UBadge>
          </div>

          <!-- Title -->
          <h1
            ref="titleRef"
            class="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 leading-tight drop-shadow-2xl"
          >
            {{ currentItem.title }}
          </h1>

          <!-- Meta Info -->
          <div ref="metaRef" class="flex items-center gap-4 mb-4 text-neutral-300">
            <span
              v-if="currentItem.type === 'movie' && currentItem.duration"
              class="flex items-center gap-1 text-sm"
            >
              <UIcon name="i-heroicons-clock" class="w-4 h-4" />
              {{ Math.floor(currentItem.duration / 60) }}h {{ currentItem.duration % 60 }}m
            </span>
            <span
              v-if="currentItem.type === 'series' && currentItem.lastAiredYear"
              class="flex items-center gap-1 text-sm"
            >
              <UIcon name="i-heroicons-calendar-days" class="w-4 h-4" />
              {{ currentItem.firstAiredYear }} - {{ currentItem.lastAiredYear }}
            </span>
          </div>

          <!-- Description -->
          <p
            ref="descRef"
            class="text-base md:text-lg text-neutral-200 mb-8 line-clamp-3 md:line-clamp-4 max-w-xl drop-shadow-lg"
          >
            {{ currentItem.description || "No description available." }}
          </p>

          <!-- Buttons -->
          <div ref="buttonsRef" class="flex flex-wrap items-center gap-4">
            <UButton
              size="lg"
              color="primary"
              variant="solid"
              :to="
                currentItem.type === 'movie'
                  ? `/movies/${currentItem.id}`
                  : `/tv-series/${currentItem.id}`
              "
              class="gap-2 px-8 backdrop-blur-sm bg-white/10 hover:bg-white/20"
            >
              <template #leading>
                <UIcon name="i-heroicons-play-solid" class="w-5 h-5" />
              </template>
              Play Now
            </UButton>
            <UButton
              size="lg"
              color="neutral"
              variant="ghost"
              :to="
                currentItem.type === 'movie'
                  ? `/movies/${currentItem.id}`
                  : `/tv-series/${currentItem.id}`
              "
              class="gap-2 px-6 backdrop-blur-sm bg-black/20 hover:bg-black/30 border border-white/10"
            >
              <template #leading>
                <UIcon name="i-heroicons-information-circle" class="w-5 h-5" />
              </template>
              More Info
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Dots -->
    <div
      v-if="totalItems > 1"
      class="absolute bottom-8 right-4 md:right-8 flex items-center gap-2"
      role="tablist"
      aria-label="Carousel navigation"
    >
      <!-- Prev Button -->
      <UButton
        icon="i-heroicons-chevron-left"
        color="neutral"
        variant="ghost"
        size="md"
        class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm bg-black/30 hover:bg-black/50"
        :disabled="isAnimating"
        aria-label="Previous slide"
        @click="prevSlide"
      />
      <!-- Dots -->
      <div class="flex items-center gap-2 px-2">
        <button
          v-for="(_, index) in totalItems"
          :key="index"
          type="button"
          role="tab"
          :aria-label="`Go to slide ${index + 1}`"
          :aria-selected="index === currentIndex"
          :tabindex="index === currentIndex ? 0 : -1"
          :class="[
            'h-1 rounded-full transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            index === currentIndex ? 'w-8 bg-primary-500' : 'w-2 bg-white/40 hover:bg-white/60',
          ]"
          :disabled="isAnimating"
          @click="goToSlide(index)"
        />
      </div>
      <!-- Next Button -->
      <UButton
        icon="i-heroicons-chevron-right"
        color="neutral"
        variant="ghost"
        size="md"
        class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm bg-black/30 hover:bg-black/50"
        :disabled="isAnimating"
        aria-label="Next slide"
        @click="nextSlide"
      />
    </div>

    <!-- ARIA Live Region for screen readers -->
    <div
      v-if="totalItems > 1 && currentItem"
      class="sr-only"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      Now showing: {{ currentItem.title }}, Slide {{ currentIndex + 1 }} of {{ totalItems }}
    </div>

    <!-- Progress Bar for Auto-rotation -->
    <div
      v-if="totalItems > 1"
      class="absolute bottom-0 left-0 right-0 h-1 bg-neutral-800"
      aria-hidden="true"
    >
      <div
        class="h-full bg-gradient-to-r from-primary-500 to-primary-400 origin-left animate-progress"
        :style="{
          animationDuration: '8000ms',
          animationPlayState: isPaused ? 'paused' : 'running',
        }"
      />
    </div>

    <!-- Bottom Fade -->
    <div
      class="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none"
    />
  </div>
</template>

<style scoped>
@keyframes progress {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

.animate-progress {
  animation-name: progress;
  animation-timing-function: linear;
  animation-iteration-count: 1;
}

/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-4 {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
