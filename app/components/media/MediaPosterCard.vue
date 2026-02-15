<script setup lang="ts">
import type { StreamingContent, StreamingMovie, StreamingSeries } from "~/data/mockDataEnhanced";

type CardSize = "portrait" | "landscape" | "wide";

interface Props {
  content: StreamingContent;
  size?: CardSize;
  showProgress?: boolean;
  progress?: number;
  priority?: boolean;
  index?: number;
  enable3D?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: "portrait",
  showProgress: false,
  progress: 0,
  priority: false,
  index: 0,
  enable3D: true,
});

const emit = defineEmits<{
  click: [content: StreamingContent];
  play: [content: StreamingContent];
}>();

const { $gsap: gsap } = useNuxtApp();

// Refs
const cardRef = ref<HTMLElement>();
const cardInnerRef = ref<HTMLElement>();
const imageRef = ref<HTMLElement>();
const infoRef = ref<HTMLElement>();
const glowRef = ref<HTMLElement>();
const playButtonRef = ref<HTMLElement>();
const gsapCtx = ref<ReturnType<typeof gsap.context> | null>(null);

// State
const isHovered = ref(false);
const imageLoaded = ref(false);
const imageError = ref(false);
const tiltX = ref(0);
const tiltY = ref(0);

// Computed
const isMovie = (item: StreamingContent): item is StreamingMovie => {
  return item.type === "movie";
};

const getYear = (item: StreamingContent): number => {
  return isMovie(item) ? item.releaseYear : item.firstAiredYear;
};

const getDurationText = (item: StreamingContent): string => {
  if (isMovie(item)) {
    const hours = Math.floor(item.duration / 60);
    const mins = item.duration % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }
  return `${item.seasons} Season${item.seasons > 1 ? "s" : ""}`;
};

// Aspect ratio based on size
const aspectRatio = computed(() => {
  const ratios = {
    portrait: "aspect-[2/3]",
    landscape: "aspect-video",
    wide: "aspect-[2/1]",
  };
  return ratios[props.size];
});

// Card dimensions
const cardClass = computed(() => {
  const sizes = {
    portrait: "w-[100px] xs:w-[110px] sm:w-[120px] md:w-[140px] lg:w-[160px] xl:w-[180px]",
    landscape: "w-[160px] xs:w-[180px] sm:w-[200px] md:w-[240px] lg:w-[280px] xl:w-[320px]",
    wide: "w-[220px] xs:w-[240px] sm:w-[280px] md:w-[320px] lg:w-[400px] xl:w-[450px]",
  };
  return sizes[props.size];
});

// Rating color class
const ratingColorClass = computed(() => {
  const rating = props.content.rating;
  if (rating >= 0.8) return "from-green-500 to-green-600";
  if (rating >= 0.6) return "from-yellow-500 to-yellow-600";
  return "from-red-500 to-red-600";
});

// 3D Tilt effect on mouse move
const handleMouseMove = (e: MouseEvent) => {
  if (!props.enable3D || !cardRef.value) return;

  const rect = cardRef.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  const rotateX = (y - centerY) / 10;
  const rotateY = (centerX - x) / 10;

  tiltX.value = Math.max(-10, Math.min(10, rotateX));
  tiltY.value = Math.max(-10, Math.min(10, rotateY));

  if (gsap && cardInnerRef.value) {
    gsap.to(cardInnerRef.value, {
      rotateX: `${tiltX.value}deg`,
      rotateY: `${tiltY.value}deg`,
      scale: 1.08,
      duration: 0.3,
      ease: "power2.out",
    });
  }
};

// Reset tilt on mouse leave
const resetTilt = () => {
  if (!gsap || !cardInnerRef.value) return;

  gsap.to(cardInnerRef.value, {
    rotateX: "0deg",
    rotateY: "0deg",
    scale: 1,
    duration: 0.4,
    ease: "power2.out",
  });
};

// Enhanced GSAP hover animation
const handleMouseEnter = () => {
  if (!gsap || !cardRef.value) return;
  isHovered.value = true;

  // Create glow effect
  if (gsap && glowRef.value) {
    gsap.fromTo(
      glowRef.value,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" },
    );
  }

  // Animate info overlay
  if (infoRef.value) {
    const elements = infoRef.value.querySelectorAll(".animate-item");
    gsap.fromTo(
      elements,
      { y: 10, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.3,
        stagger: 0.05,
        ease: "power2.out",
      },
    );
  }

  // Play button bounce
  if (playButtonRef.value) {
    gsap.fromTo(
      playButtonRef.value,
      { scale: 0.8 },
      { scale: 1, duration: 0.4, ease: "back.out(1.7)" },
    );
  }
};

const handleMouseLeave = () => {
  if (!gsap || !cardRef.value) return;
  isHovered.value = false;

  resetTilt();

  // Fade out glow
  if (glowRef.value) {
    gsap.to(glowRef.value, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.out",
    });
  }

  // Fade out info
  if (infoRef.value) {
    gsap.to(infoRef.value, {
      opacity: 0,
      duration: 0.2,
      ease: "power2.out",
    });
  }
};

// Handle image load
const handleImageLoad = () => {
  imageLoaded.value = true;
  if (gsap && imageRef.value) {
    gsap.fromTo(
      imageRef.value,
      { scale: 1.1, filter: "brightness(0.9)" },
      { scale: 1, filter: "brightness(1.1)", duration: 0.6, ease: "power2.out" },
    );
  }
};

const handleImageError = () => {
  imageError.value = true;
};

// Click handler
const handleClick = () => {
  emit("click", props.content);
};

const handlePlay = (e: Event) => {
  e.stopPropagation();
  emit("play", props.content);
};

// Check if user has visited before for animation
const hasVisitedBefore = ref(false);

// Only check on client side
if (import.meta.client) {
  hasVisitedBefore.value = localStorage.getItem("cine-max-home-visited") === "true";
}

// Stagger animation on mount with scroll reveal
onMounted(() => {
  if (!gsap) return;

  // Skip animation if user has visited before for smoother experience
  if (hasVisitedBefore.value) {
    return;
  }

  gsapCtx.value = gsap.context(() => {
    if (cardRef.value) {
      gsap.fromTo(
        cardRef.value,
        {
          opacity: 0,
          y: 40,
          rotateX: -15,
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.6,
          delay: Math.min(props.index * 0.06, 0.5),
          ease: "power3.out",
        },
      );
    }
  }, cardRef.value);
});

// Cleanup
onUnmounted(() => {
  if (gsapCtx.value) {
    gsapCtx.value.revert();
    gsapCtx.value = null;
  }
});
</script>

<template>
  <div
    ref="cardRef"
    :class="['media-card media-poster-card group relative flex-shrink-0 cursor-pointer', cardClass]"
    style="perspective: 1000px"
    :tabindex="0"
    role="button"
    :aria-label="`${content.type === 'movie' ? 'Movie' : 'TV Series'}: ${content.title}`"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @mousemove="handleMouseMove"
    @click="handleClick"
    @keydown.enter="handleClick"
  >
    <!-- 3D Card Inner -->
    <div
      ref="cardInnerRef"
      class="relative w-full rounded-xl overflow-hidden transition-transform duration-500 ease-out bg-neutral-900 shadow-2xl"
      :class="['will-change-transform', 'hover:shadow-[0_20px_60px_-15px_rgba(99,102,241,0.3)]']"
      style="transform-style: preserve-3d"
    >
      <!-- Glow Effect on Hover -->
      <div
        ref="glowRef"
        class="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-purple-500/20 opacity-0 pointer-events-none z-10"
        style="mix-blend-mode: screen"
      />

      <!-- Poster Image Container -->
      <div :class="['relative w-full overflow-hidden', aspectRatio]">
        <!-- Image -->
        <NuxtImg
          v-if="!imageError"
          ref="imageRef"
          :src="content.poster"
          :alt="content.title"
          :width="size === 'portrait' ? 400 : 600"
          :height="size === 'portrait' ? 600 : 400"
          :loading="priority ? 'eager' : 'lazy'"
          :placeholder="[50, 50, 50, 5]"
          format="webp"
          class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 will-change-transform brightness-110"
          @load="handleImageLoad"
          @error="handleImageError"
        />

        <!-- Fallback -->
        <div
          v-else
          class="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center"
        >
          <div class="text-center">
            <UIcon name="i-lucide-film" class="w-12 h-12 text-neutral-600 mx-auto mb-2" />
            <span class="text-neutral-600 text-xs">{{ content.title }}</span>
          </div>
        </div>

        <!-- Premium Loading Skeleton -->
        <Transition name="skeleton-fade">
          <div
            v-if="!imageLoaded && !imageError"
            class="absolute inset-0 bg-gradient-to-br from-neutral-800 via-neutral-750 to-neutral-800"
          >
            <div
              class="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-700/30 to-transparent animate-skeleton-shimmer"
            />
          </div>
        </Transition>

        <!-- Gradient Overlay for Always-On Subtle Shadow -->
        <div
          class="absolute inset-0 bg-gradient-to-b from-white/[0.02] via-transparent to-gray-900/30 opacity-100 transition-opacity duration-500"
        />

        <!-- Top Badges -->
        <div class="absolute top-2 left-2 sm:top-3 sm:left-3 flex gap-1.5 sm:gap-2 z-20">
          <!-- Top 10 Badge -->
          <div
            v-if="content.top10 && content.top10 <= 10"
            class="flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 shadow-lg"
          >
            <UIcon name="i-lucide-trophy" class="w-3 h-3 text-white" />
            <span class="text-xs sm:text-sm font-bold text-white">#{{ content.top10 }}</span>
          </div>

          <!-- New Badge -->
          <div
            v-if="content.newRelease"
            class="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-600 shadow-lg"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span class="text-xs font-semibold text-white">NEW</span>
          </div>
        </div>

        <!-- Match Score (Top Right) with Ring -->
        <div v-if="content.rating >= 0.7" class="absolute top-2 right-2 sm:top-3 sm:right-3 z-20">
          <div class="relative w-8 h-8 sm:w-10 sm:h-10">
            <svg class="w-full h-full -rotate-90" viewBox="0 0 32 32">
              <circle
                cx="16"
                cy="16"
                r="14"
                fill="none"
                stroke="rgba(0,0,0,0.5)"
                stroke-width="3"
              />
              <circle
                cx="16"
                cy="16"
                r="14"
                fill="none"
                class="stroke-current"
                :class="[ratingColorClass, 'drop-shadow-lg']"
                stroke-width="3"
                :stroke-dasharray="`${content.rating * 88} 88`"
                stroke-linecap="round"
              />
            </svg>
            <span
              class="absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs font-bold text-white drop-shadow-md"
            >
              {{ Math.round(content.rating * 10) }}%
            </span>
          </div>
        </div>

        <!-- Premium Hover Info Overlay -->
        <div
          ref="infoRef"
          class="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent opacity-0 transition-opacity duration-300 z-30 flex flex-col justify-end"
        >
          <div class="p-3 sm:p-4">
            <!-- Title -->
            <h3
              class="animate-item text-white font-bold text-sm sm:text-base mb-2 line-clamp-2 drop-shadow-lg"
            >
              {{ content.title }}
            </h3>

            <!-- Meta Info -->
            <div class="animate-item flex items-center gap-2 text-xs text-white/90 mb-2">
              <span class="font-medium">{{ getYear(content) }}</span>
              <span class="w-1 h-1 rounded-full bg-white/50" />
              <span>{{ getDurationText(content) }}</span>
              <span
                v-if="content.maturityRating"
                class="px-1.5 py-0.5 rounded border border-white/40 text-[10px]"
              >
                {{ content.maturityRating }}
              </span>
            </div>

            <!-- Genres -->
            <div class="animate-item flex flex-wrap gap-1.5 mb-3">
              <span
                v-for="genre in content.genres.slice(0, 3)"
                :key="genre"
                class="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-[10px] text-white/90"
              >
                {{ genre }}
              </span>
            </div>

            <!-- Action Buttons -->
            <div class="animate-item flex items-center gap-2">
              <UButton
                ref="playButtonRef"
                size="sm"
                color="white"
                variant="solid"
                icon="i-lucide-play"
                class="flex-1 h-9 min-h-[36px] bg-white text-black hover:bg-neutral-100 text-xs font-semibold shadow-lg"
                aria-label="Play"
                @click="handlePlay"
              />
              <UButton
                size="sm"
                color="neutral"
                variant="soft"
                icon="i-lucide-plus"
                class="w-9 h-9 min-w-[36px] bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30"
                aria-label="Add to list"
              />
              <UButton
                size="sm"
                color="neutral"
                variant="soft"
                icon="i-lucide-chevron-down"
                class="w-9 h-9 min-w-[36px] bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30"
                aria-label="More options"
              />
            </div>
          </div>
        </div>

        <!-- Quick Play Button on Hover (Center) -->
        <Transition name="quick-play">
          <div
            v-if="isHovered"
            class="absolute inset-0 flex items-center justify-center z-25 pointer-events-none"
          >
            <div
              class="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-2xl pointer-events-auto hover:scale-110 transition-transform cursor-pointer"
              @click="handlePlay"
            >
              <UIcon name="i-lucide-play" class="w-6 h-6 text-black ml-1" />
            </div>
          </div>
        </Transition>

        <!-- Progress Bar -->
        <Transition name="progress-slide">
          <div
            v-if="showProgress && progress > 0 && progress < 100"
            class="absolute bottom-0 left-0 right-0 h-1 bg-neutral-800/90 z-40"
          >
            <div
              class="h-full bg-gradient-to-r from-red-500 via-red-400 to-red-500 relative overflow-hidden"
              :style="{ width: `${progress}%` }"
            >
              <div
                class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-progress-shimmer"
              />
            </div>
          </div>
        </Transition>

        <!-- Shimmer Effect on Hover -->
        <div
          class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-card-shimmer pointer-events-none z-10"
        />
      </div>
    </div>

    <!-- Reflection Effect -->
    <div
      class="absolute -bottom-4 left-1 right-1 h-8 bg-gradient-to-b from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl rounded-b-xl"
    />
  </div>
</template>

<style scoped>
/* Skeleton shimmer animation */
@keyframes skeleton-shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-skeleton-shimmer {
  animation: skeleton-shimmer 2s infinite;
}

/* Card shimmer effect */
@keyframes card-shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-card-shimmer {
  animation: card-shimmer 1.5s ease-out;
}

/* Progress shimmer */
@keyframes progress-shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-progress-shimmer {
  animation: progress-shimmer 2s infinite;
}

/* Skeleton fade transition */
.skeleton-fade-enter-active,
.skeleton-fade-leave-active {
  transition: opacity 0.3s ease;
}

.skeleton-fade-leave-to {
  opacity: 0;
}

/* Quick play button transition */
.quick-play-enter-active {
  transition: all 0.3s ease-out;
}

.quick-play-leave-active {
  transition: all 0.2s ease-in;
}

.quick-play-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.quick-play-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* Progress bar slide */
.progress-slide-enter-active,
.progress-slide-leave-active {
  transition: all 0.3s ease;
}

.progress-slide-enter-from,
.progress-slide-leave-to {
  opacity: 0;
  transform: translateY(2px);
}

/* Line clamp utility */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Will change optimization */
.will-change-transform {
  will-change: transform;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .media-poster-card,
  .media-poster-card img,
  .media-poster-card * {
    transition: none !important;
    animation: none !important;
  }

  .animate-skeleton-shimmer,
  .animate-card-shimmer,
  .animate-progress-shimmer {
    animation: none;
  }
}
</style>
