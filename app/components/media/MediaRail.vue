<script setup lang="ts">
import type { StreamingContent } from "~/data/mockDataEnhanced";

type CardSize = "portrait" | "landscape" | "wide";

interface Props {
  title: string;
  content: StreamingContent[];
  size?: CardSize;
  seeAllLink?: string;
  showProgress?: boolean;
  progressMap?: Record<string, number>;
  icon?: string;
  showSkeleton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: "portrait",
  seeAllLink: "",
  showProgress: false,
  progressMap: () => ({}),
  icon: "i-lucide-film",
  showSkeleton: false,
});

const emit = defineEmits<{
  play: [content: StreamingContent];
  click: [content: StreamingContent];
}>();

const { $gsap: gsap } = useNuxtApp();

// Refs
const railRef = ref<HTMLElement>();
const titleRef = ref<HTMLElement>();
const trackRef = ref<HTMLElement>();
const leftArrowRef = ref<HTMLElement>();
const rightArrowRef = ref<HTMLElement>();
const gsapCtx = ref<ReturnType<typeof gsap.context> | null>(null);

// State
const canScrollLeft = ref(false);
const canScrollRight = ref(true);
const isDragging = ref(false);
const startX = ref(0);
const scrollStartPosition = ref(0);
const isHovering = ref(false);

// Computed
const hasContent = computed(() => props.content.length > 0);
const isLoading = computed(() => props.showSkeleton && props.content.length === 0);

// Scroll methods with momentum
const scrollLeft = () => {
  if (!trackRef.value) return;

  const scrollAmount = Math.max(trackRef.value.clientWidth * 0.85, 400);
  trackRef.value.scrollBy({
    left: -scrollAmount,
    behavior: "smooth",
  });
};

const scrollRight = () => {
  if (!trackRef.value) return;

  const scrollAmount = Math.max(trackRef.value.clientWidth * 0.85, 400);
  trackRef.value.scrollBy({
    left: scrollAmount,
    behavior: "smooth",
  });
};

// Check scroll position with smooth state updates
const checkScroll = () => {
  if (!trackRef.value) return;

  const scrollLeft = trackRef.value.scrollLeft;
  const maxScroll = trackRef.value.scrollWidth - trackRef.value.clientWidth;

  canScrollLeft.value = scrollLeft > 10;
  canScrollRight.value = scrollLeft < maxScroll - 10;
};

// Enhanced drag to scroll with momentum
const handleDragStart = (e: MouseEvent) => {
  if (!trackRef.value) return;

  isDragging.value = true;
  startX.value = e.pageX - trackRef.value.offsetLeft;
  scrollStartPosition.value = trackRef.value.scrollLeft;
  trackRef.value.style.cursor = "grabbing";
  trackRef.value.style.scrollBehavior = "auto";
};

const handleDragMove = (e: MouseEvent) => {
  if (!isDragging.value || !trackRef.value) return;

  e.preventDefault();
  const x = e.pageX - trackRef.value.offsetLeft;
  const walk = (x - startX.value) * 2.5; // Increased for faster drag
  trackRef.value.scrollLeft = scrollStartPosition.value - walk;
};

const handleDragEnd = () => {
  if (!trackRef.value) return;

  isDragging.value = false;
  trackRef.value.style.cursor = "";
  trackRef.value.style.scrollBehavior = "smooth";
};

// Touch handling with momentum
const touchStartPos = ref(0);
const touchStartTime = ref(0);

const handleTouchStart = (e: TouchEvent) => {
  if (!trackRef.value) return;

  touchStartPos.value = e.touches[0].pageX;
  touchStartTime.value = Date.now();
  scrollStartPosition.value = trackRef.value.scrollLeft;
};

const handleTouchMove = (e: TouchEvent) => {
  if (!trackRef.value) return;

  const x = e.touches[0].pageX;
  const diff = touchStartPos.value - x;
  trackRef.value.scrollLeft = scrollStartPosition.value + diff;
};

const handleTouchEnd = (e: TouchEvent) => {
  if (!trackRef.value) return;

  const touchEndX = e.changedTouches[0].pageX;
  const touchDuration = Date.now() - touchStartTime.value;
  const swipeDistance = touchStartPos.value - touchEndX;

  // Add momentum swipe
  if (swipeDistance !== 0 && touchDuration < 300) {
    const momentum = Math.abs(swipeDistance) * 2;
    trackRef.value.scrollBy({
      left: swipeDistance > 0 ? momentum : -momentum,
      behavior: "smooth",
    });
  }
};

// Event handlers
const handlePlay = (content: StreamingContent) => {
  emit("play", content);
};

const handleClick = (content: StreamingContent) => {
  emit("click", content);
};

// Get progress for content
const getProgress = (content: StreamingContent): number => {
  return props.progressMap[content.id] || 0;
};

// Generate skeleton cards
const skeletonCount = computed(() => (props.showSkeleton ? 8 : 0));

// Check if user has visited before for animation
const hasVisitedBefore = ref(false);

// Only check on client side
if (import.meta.client) {
  hasVisitedBefore.value = localStorage.getItem("cine-max-home-visited") === "true";
}

// Animate rail on mount with intersection observer
onMounted(() => {
  if (!gsap || !railRef.value) return;

  // Skip entrance animation if user has visited before
  if (!hasVisitedBefore.value) {
    gsapCtx.value = gsap.context(() => {
      // Animate title
      if (titleRef.value) {
        gsap.fromTo(
          titleRef.value,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" },
        );
      }

      // Animate rail container
      gsap.fromTo(
        railRef.value,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.1 },
      );
    }, railRef.value);
  }

  // Initial scroll check
  nextTick(() => checkScroll());

  // Set up scroll listener for position updates
  if (trackRef.value) {
    trackRef.value.addEventListener("scroll", checkScroll, { passive: true });
  }
});

// Cleanup
onUnmounted(() => {
  if (gsapCtx.value) {
    gsapCtx.value.revert();
    gsapCtx.value = null;
  }

  if (trackRef.value) {
    trackRef.value.removeEventListener("scroll", checkScroll);
  }
});
</script>

<template>
  <section
    v-if="hasContent || isLoading"
    ref="railRef"
    class="media-rail relative py-4 sm:py-5 md:py-8 overflow-hidden"
    @mouseenter="isHovering = true"
    @mouseleave="isHovering = false"
  >
    <!-- Premium Header -->
    <div class="px-2 sm:px-4 md:px-6 lg:px-8 mb-3 sm:mb-4">
      <div class="flex items-end justify-between gap-4">
        <div ref="titleRef" class="flex items-center gap-3 sm:gap-4">
          <!-- Icon with Glow -->
          <div class="relative group/icon">
            <div
              class="absolute inset-0 bg-primary-500/20 blur-lg rounded-full opacity-0 group-hover/icon:opacity-100 transition-opacity duration-300"
            />
            <div
              class="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg"
            >
              <UIcon :name="icon" class="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>

          <!-- Title -->
          <div>
            <h2
              class="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white tracking-tight"
            >
              {{ title }}
            </h2>
            <p class="text-xs sm:text-sm text-white/50 mt-0.5 hidden sm:block">
              {{ content.length }} {{ content.length === 1 ? "title" : "titles" }} available
            </p>
          </div>
        </div>

        <!-- See All Link with Hover Effect -->
        <NuxtLink
          v-if="seeAllLink"
          :to="seeAllLink"
          class="group/link flex items-center gap-1.5 sm:gap-2 px-4 py-2 rounded-lg bg-neutral-800/50 hover:bg-neutral-700/80 transition-all duration-300"
        >
          <span class="text-xs sm:text-sm text-white/80 group-hover/link:text-white font-medium"
            >See All</span
          >
          <UIcon
            name="i-lucide-chevron-right"
            class="w-4 h-4 text-white/60 group-hover/link:text-white group-hover/link:translate-x-1 transition-all"
          />
        </NuxtLink>
      </div>
    </div>

    <!-- Scroll Container -->
    <div class="relative group/rail" @mouseenter="() => checkScroll()">
      <!-- Left Arrow - Always Visible When Scrollable -->
      <button
        v-show="canScrollLeft"
        ref="leftArrowRef"
        class="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-12 sm:w-16 md:w-20 h-full bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent flex items-center justify-start pl-2 transition-opacity duration-300"
        :class="canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'"
        aria-label="Scroll left"
        @click="scrollLeft"
      >
        <div class="group/arrow relative">
          <div
            class="absolute inset-0 bg-primary-500/30 blur-md rounded-full opacity-0 group-hover/arrow:opacity-100 transition-opacity"
          />
          <div
            class="relative w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] rounded-full bg-neutral-800/95 hover:bg-neutral-700 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-xl border border-neutral-600/50"
          >
            <UIcon name="i-lucide-chevron-left" class="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
        </div>
      </button>

      <!-- Right Arrow - Always Visible When Scrollable -->
      <button
        v-show="canScrollRight"
        ref="rightArrowRef"
        class="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-12 sm:w-16 md:w-20 h-full bg-gradient-to-l from-neutral-950 via-neutral-950/80 to-transparent flex items-center justify-end pr-2 transition-opacity duration-300"
        :class="canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'"
        aria-label="Scroll right"
        @click="scrollRight"
      >
        <div class="group/arrow relative">
          <div
            class="absolute inset-0 bg-primary-500/30 blur-md rounded-full opacity-0 group-hover/arrow:opacity-100 transition-opacity"
          />
          <div
            class="relative w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] rounded-full bg-neutral-800/95 hover:bg-neutral-700 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-xl border border-neutral-600/50"
          >
            <UIcon name="i-lucide-chevron-right" class="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
        </div>
      </button>

      <!-- Track with Enhanced Scroll Behavior -->
      <div
        ref="trackRef"
        class="flex gap-2 sm:gap-2.5 overflow-x-auto px-2 sm:px-4 md:px-6 lg:px-8 pb-4 scrollbar-hide"
        :class="{ 'cursor-grab': !isDragging, 'cursor-grabbing': isDragging }"
        @scroll="checkScroll"
        @mousedown="handleDragStart"
        @mousemove="handleDragMove"
        @mouseup="handleDragEnd"
        @mouseleave="handleDragEnd"
        @touchstart.passive="handleTouchStart"
        @touchmove.passive="handleTouchMove"
        @touchend.passive="handleTouchEnd"
      >
        <!-- Content Cards -->
        <MediaPosterCard
          v-for="(item, index) in content"
          :key="item.id"
          :content="item"
          :size="size"
          :show-progress="showProgress"
          :progress="getProgress(item)"
          :index="index"
          @play="handlePlay"
          @click="handleClick"
        />

        <!-- Skeleton Loading Cards -->
        <template v-if="isLoading">
          <div
            v-for="i in skeletonCount"
            :key="`skeleton-${i}`"
            :class="[
              'flex-shrink-0 rounded-xl overflow-hidden bg-neutral-900/50',
              size === 'portrait'
                ? 'w-[100px] xs:w-[110px] sm:w-[120px] md:w-[140px] lg:w-[160px] xl:w-[180px] aspect-[2/3]'
                : '',
              size === 'landscape'
                ? 'w-[160px] xs:w-[180px] sm:w-[200px] md:w-[240px] lg:w-[280px] xl:w-[320px] aspect-video'
                : '',
              size === 'wide'
                ? 'w-[220px] xs:w-[240px] sm:w-[280px] md:w-[320px] lg:w-[400px] xl:w-[450px] aspect-[2/1]'
                : '',
            ]"
          >
            <div class="relative w-full h-full">
              <!-- Skeleton Shimmer -->
              <div class="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900">
                <div
                  class="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-700/30 to-transparent animate-skeleton-shimmer"
                />
              </div>
              <!-- Badge placeholders -->
              <div class="absolute top-2 left-2 w-10 h-5 rounded bg-neutral-700/50" />
              <div class="absolute top-2 right-2 w-8 h-8 rounded-full bg-neutral-700/50" />
            </div>
          </div>
        </template>

        <!-- Spacer for peek effect -->
        <div class="w-4 sm:w-6 md:w-8 flex-shrink-0" />
      </div>
    </div>

    <!-- Progress Indicator at Bottom -->
    <div
      v-if="trackRef && !isLoading"
      class="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-800/50 overflow-hidden"
    >
      <div
        class="h-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-300"
        :style="{
          width: canScrollRight ? '30%' : '100%',
          marginLeft: canScrollLeft
            ? `${(trackRef.scrollLeft / (trackRef.scrollWidth - trackRef.clientWidth)) * 70}%`
            : '0',
        }"
      />
    </div>
  </section>
</template>

<style scoped>
/* Hide scrollbar but allow scroll */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Enhanced arrow transitions */
.arrow-fade-enter-active,
.arrow-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.arrow-fade-enter-from,
.arrow-fade-leave-to {
  opacity: 0;
  transform: translateY(-50%) scale(0.9);
}

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

/* Smooth scroll behavior override during drag */
.cursor-grabbing {
  cursor: grabbing !important;
}

.cursor-grab {
  cursor: grab;
}

/* Custom scrollbar fallback */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .scrollbar-hide {
    scroll-behavior: auto;
  }

  .animate-skeleton-shimmer {
    animation: none;
  }

  .arrow-fade-enter-active,
  .arrow-fade-leave-active {
    transition: opacity 0.2s ease;
  }
}

/* Perspective for 3D effects */
.media-rail {
  perspective: 1000px;
}

/* Hover glow effect enhancement */
@media (hover: hover) {
  .group\/rail:hover .opacity-0 {
    opacity: 1;
  }
}

/* Custom focus styles for accessibility */
button:focus-visible {
  outline: 2px solid rgb(99 102 241);
  outline-offset: 2px;
}

button:focus:not(:focus-visible) {
  outline: none;
}
</style>
