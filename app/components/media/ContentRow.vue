<template>
  <section
    ref="sectionRef"
    class="content-row relative py-6 md:py-8"
    :class="{ 'opacity-0': !hasAnimatedIn }"
  >
    <div class="mb-4 flex items-end justify-between px-4 md:px-8 lg:px-12">
      <h2 class="text-xl font-bold md:text-2xl lg:text-3xl" :class="titleGradientClass">
        {{ title }}
      </h2>

      <NuxtLink
        v-if="seeAllLink && !isLoading && data.length > 0"
        :to="seeAllLink"
        class="group flex items-center gap-1 text-sm font-medium text-gray-400 transition-colors hover:text-white"
      >
        <span>See All</span>
        <Icon
          name="i-lucide-chevron-right"
          class="h-4 w-4 transition-transform group-hover:translate-x-0.5"
        />
      </NuxtLink>
    </div>

    <div
      ref="containerRef"
      class="group/row relative"
      @mouseenter="showArrows = true"
      @mouseleave="showArrows = false"
    >
      <Transition name="fade-slide">
        <button
          v-show="showLeftArrow && showArrows && !isLoading && data.length > 0"
          :class="arrowClasses('left')"
          :disabled="isAtStart"
          @click="scrollLeft"
          aria-label="Scroll left"
        >
          <Icon name="i-lucide-chevron-left" class="h-6 w-6" />
        </button>
      </Transition>

      <Transition name="fade-slide">
        <button
          v-show="showRightArrow && showArrows && !isLoading && data.length > 0"
          :class="arrowClasses('right')"
          :disabled="isAtEnd"
          @click="scrollRight"
          aria-label="Scroll right"
        >
          <Icon name="i-lucide-chevron-right" class="h-6 w-6" />
        </button>
      </Transition>

      <div
        ref="trackRef"
        class="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-4 transition-all duration-300 ease-out md:gap-4 md:px-8 md:pb-6 lg:px-12"
        :class="{
          'cursor-grab active:cursor-grabbing': !isLoading && data.length > 0 && canDrag,
        }"
        @scroll="handleScroll"
        @mousedown="handleDragStart"
        @touchstart.passive="handleTouchStart"
        @mousemove="handleDragMove"
        @touchmove="handleTouchMove"
        @mouseup="handleDragEnd"
        @touchend="handleTouchEnd"
        @mouseleave="handleDragEnd"
      >
        <template v-if="isLoading">
          <MediaCardSkeleton
            v-for="i in skeletonCount"
            :key="`skeleton-${i}`"
            :size="skeletonCardSize"
          />
        </template>

        <div v-else-if="error" class="flex w-full items-center justify-center py-8 text-gray-500">
          <div class="text-center">
            <Icon name="i-lucide-alert-circle" class="mx-auto mb-2 h-8 w-8" />
            <p>{{ error }}</p>
            <button class="mt-2 text-sm text-gray-400 underline hover:text-white" @click="refresh">
              Try again
            </button>
          </div>
        </div>

        <div
          v-else-if="data.length === 0"
          class="flex w-full items-center justify-center py-8 text-gray-500"
        >
          <p>No content available</p>
        </div>

        <template v-else>
          <div
            v-for="(item, index) in displayData"
            :key="item.id"
            :ref="(el) => setCardRef(el, index)"
            class="card-item flex-shrink-0 opacity-0"
            :style="cardWidthStyle"
          >
            <MediaCard :media="item" :type="type" :size="mediaCardSize" />
          </div>
        </template>

        <div
          v-if="hasMore && !isLoading && data.length > 0 && infiniteScroll"
          class="flex flex-shrink-0 items-center justify-center px-4"
        >
          <button
            class="rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 disabled:opacity-50"
            @click="loadMore"
            :disabled="isLoadingMore"
          >
            <Icon
              name="i-lucide-loader-2"
              class="h-5 w-5"
              :class="{ 'animate-spin': isLoadingMore }"
            />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Movie, TVSeries } from "#shared/types";

type MediaType = "movie" | "series";
type CardSize = "small" | "medium" | "large";
type MediaCardSize = "sm" | "md" | "lg";

interface Props {
  /** Section title */
  title: string;
  /** API endpoint to fetch data from (e.g., 'movies', 'series') - not used if data prop is provided */
  endpoint?: string;
  /** Direct data array - if provided, endpoint will be ignored */
  data?: (Movie | TVSeries)[];
  /** Query parameters for the API */
  query?: Record<string, string | number | boolean | undefined>;
  /** Type of content - 'movie' or 'series' */
  type: MediaType;
  /** Size of cards in the row */
  cardSize?: CardSize;
  /** Number of skeleton cards to show during loading */
  skeletonCount?: number;
  /** Link for the "See All" button */
  seeAllLink?: string;
  /** Enable infinite scroll loading */
  infiniteScroll?: boolean;
  /** Amount to scroll when clicking navigation arrows */
  scrollAmount?: number;
  /** Enable drag-to-scroll functionality */
  enableDragScroll?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  endpoint: "",
  query: () => ({}),
  cardSize: "medium",
  skeletonCount: 6,
  seeAllLink: "",
  infiniteScroll: false,
  scrollAmount: 400,
  enableDragScroll: true,
});

const { $gsap: gsap } = useNuxtApp();

const sectionRef = ref<HTMLElement>();
const containerRef = ref<HTMLElement>();
const trackRef = ref<HTMLElement>();
const cardRefs = ref<Map<number, HTMLElement>>(new Map());
const ctx = ref<ReturnType<typeof gsap.context> | null>(null);

const showArrows = ref(false);
const showLeftArrow = ref(false);
const showRightArrow = ref(true);
const isAtStart = ref(true);
const isAtEnd = ref(false);
const isDragging = ref(false);
const startPos = ref({ x: 0, y: 0 });
const scrollStartPos = ref(0);
const hasAnimatedIn = ref(false);
const isLoadingMore = ref(false);

const { canHover } = useMediaQuery();
const canDrag = computed(() => props.enableDragScroll && canHover.value);

const mediaCardSize = computed<MediaCardSize>(() => {
  const sizeMap: Record<CardSize, MediaCardSize> = {
    small: "sm",
    medium: "md",
    large: "lg",
  };
  return sizeMap[props.cardSize];
});

const skeletonCardSize = computed<CardSize>(() => props.cardSize);

const cardWidthStyle = computed(() => {
  const widths = {
    small: { mobile: "160px", tablet: "200px", desktop: "240px" },
    medium: { mobile: "200px", tablet: "260px", desktop: "300px" },
    large: { mobile: "280px", tablet: "340px", desktop: "400px" },
  };
  return {};
});

const setCardRef = (el: any, index: number) => {
  if (el) {
    cardRefs.value.set(index, el as HTMLElement);
  }
};

const shouldFetch = computed(() => !props.data && props.endpoint);

const apiData = useApiData<Movie | TVSeries>({
  endpoint: props.endpoint || "",
  query: props.query,
  immediate: shouldFetch.value,
});

const internalData = ref<(Movie | TVSeries)[]>([]);
const internalMeta = ref<{ total: number; limit: number; offset: number } | null>(null);
const internalError = ref<string | null>(null);
const internalIsLoading = ref(false);

// Sync API data when fetching
watch(
  () => apiData.data.value,
  (newData) => {
    if (shouldFetch.value && newData) {
      internalData.value = [...newData];
      internalMeta.value = apiData.meta.value;
      internalError.value = apiData.error.value;
      internalIsLoading.value = apiData.isLoading.value;
    }
  },
  { immediate: true },
);

const data = computed(() => props.data || internalData.value);
const isLoading = computed(() => (props.data ? false : internalIsLoading.value));
const error = computed(() => (props.data ? null : internalError.value));
const meta = computed(() => (props.data ? null : internalMeta.value));

const refresh = () => {
  if (props.data) return;
  apiData.refresh();
};

const displayData = computed(() => data.value);
const hasMore = computed(() => {
  if (props.data) return false;
  if (!internalMeta.value) return false;
  return internalMeta.value.offset + internalMeta.value.limit < internalMeta.value.total;
});

const titleGradientClass = computed(() => {
  const gradients: Record<MediaType, string> = {
    movie:
      "bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent",
    series:
      "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent",
  };
  return gradients[props.type];
});

const arrowClasses = (direction: "left" | "right") => {
  const base = [
    "absolute top-1/2 z-10 -translate-y-1/2 rounded-full",
    "bg-black/60 text-white backdrop-blur-sm",
    "flex h-10 w-10 items-center justify-center",
    "transition-all duration-200",
    "disabled:opacity-30 disabled:cursor-not-allowed",
    "hover:bg-black/80 hover:scale-110 active:scale-95",
  ];

  const position =
    direction === "left" ? "left-2 md:left-4 lg:left-8" : "right-2 md:right-4 lg:right-8";

  return [...base, position];
};

const handleScroll = () => {
  if (!trackRef.value) return;

  const { scrollLeft: currentScroll, scrollWidth, clientWidth } = trackRef.value;

  isAtStart.value = currentScroll < 10;
  isAtEnd.value = currentScroll + clientWidth >= scrollWidth - 10;
  showLeftArrow.value = currentScroll > 10;
  showRightArrow.value = currentScroll + clientWidth < scrollWidth - 10;
};

const scrollLeft = () => {
  if (!trackRef.value) return;

  trackRef.value.scrollBy({
    left: -props.scrollAmount,
    behavior: "smooth",
  });
};

const scrollRight = () => {
  if (!trackRef.value) return;

  trackRef.value.scrollBy({
    left: props.scrollAmount,
    behavior: "smooth",
  });
};

const handleDragStart = (e: MouseEvent) => {
  if (!trackRef.value || !canDrag.value) return;

  isDragging.value = true;
  startPos.value = { x: e.pageX - trackRef.value.offsetLeft, y: e.pageY };
  scrollStartPos.value = trackRef.value.scrollLeft;
};

const handleDragMove = (e: MouseEvent) => {
  if (!isDragging.value || !trackRef.value) return;

  e.preventDefault();
  const x = e.pageX - trackRef.value.offsetLeft;
  const walk = (x - startPos.value.x) * 1.5;
  trackRef.value.scrollLeft = scrollStartPos.value - walk;
};

const handleDragEnd = () => {
  isDragging.value = false;
};

const touchStartY = ref(0);
const isHorizontalScroll = ref(false);

const handleTouchStart = (e: TouchEvent) => {
  if (!trackRef.value) return;

  touchStartY.value = e.touches[0].pageY;
  startPos.value = {
    x: e.touches[0].pageX - trackRef.value.offsetLeft,
    y: e.touches[0].pageY,
  };
  scrollStartPos.value = trackRef.value.scrollLeft;
  isHorizontalScroll.value = false;
};

const handleTouchMove = (e: TouchEvent) => {
  if (!trackRef.value) return;

  const deltaX = Math.abs(e.touches[0].pageX - startPos.value.x);
  const deltaY = Math.abs(e.touches[0].pageY - touchStartY.value);

  // Only intercept touch if horizontal movement exceeds vertical by threshold
  if (deltaX > deltaY && deltaX > 10) {
    isHorizontalScroll.value = true;
    const x = e.touches[0].pageX - trackRef.value.offsetLeft;
    const walk = (x - startPos.value.x) * 1.5;
    trackRef.value.scrollLeft = scrollStartPos.value - walk;
  }
};

const handleTouchEnd = () => {
};

const loadMore = async () => {
  if (isLoadingMore.value || !internalMeta.value || props.data) return;

  isLoadingMore.value = true;

  try {
    const newOffset = internalMeta.value.offset + internalMeta.value.limit;
    const response = await $fetch(`/api/${props.endpoint}`, {
      query: {
        ...props.query,
        offset: newOffset,
        limit: internalMeta.value.limit,
      },
    });

    if (response.status?.code === "SUCCESS" && Array.isArray(response.data)) {
      internalData.value.push(...response.data);
      internalMeta.value = response.meta;
    }
  } finally {
    isLoadingMore.value = false;
  }
};

const animateSection = () => {
  if (!sectionRef.value) return;

  gsap.fromTo(
    sectionRef.value,
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out",
      onStart: () => {
        hasAnimatedIn.value = true;
      },
    },
  );
};

const animateCards = () => {
  if (isLoading.value || cardRefs.value.size === 0) return;

  const cardsArray = Array.from(cardRefs.value.values()).filter(Boolean);
  if (cardsArray.length === 0) return;

  gsap.set(cardsArray, { opacity: 0, y: 20 });

  gsap.to(cardsArray, {
    opacity: 1,
    y: 0,
    duration: 0.4,
    stagger: 0.05,
    ease: "power2.out",
    delay: 0.1,
  });
};

watch(
  () => [isLoading.value, displayData.value.length],
  ([loading]) => {
    if (!loading) {
      nextTick(() => {
        animateCards();
      });
    }
  },
  { immediate: true },
);

onMounted(() => {
  if (gsap && sectionRef.value) {
    ctx.value = gsap.context(() => {}, sectionRef.value);
  }

  nextTick(() => {
    handleScroll();
    animateSection();
  });
});

onUnmounted(() => {
  if (ctx.value) {
    ctx.value.revert();
    ctx.value = null;
  }
});

defineExpose({
  scrollLeft,
  scrollRight,
  refresh,
});
</script>

<style scoped>
.content-row {
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-50%);
}

.fade-slide-enter-to,
.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.card-item {
  width: 160px;
}

@media (min-width: 640px) {
  .card-item {
    width: 200px;
  }
}

@media (min-width: 768px) {
  .card-item {
    width: 240px;
  }
}

.card-item:has(.media-card:has([data-size="large"])) {
  width: 220px;
}

@media (min-width: 640px) {
  .card-item:has(.media-card:has([data-size="large"])) {
    width: 280px;
  }
}

@media (min-width: 768px) {
  .card-item:has(.media-card:has([data-size="large"])) {
    width: 320px;
  }
}

.card-item:has(.media-card:has([data-size="small"])) {
  width: 140px;
}

@media (min-width: 640px) {
  .card-item:has(.media-card:has([data-size="small"])) {
    width: 180px;
  }
}

@media (min-width: 768px) {
  .card-item:has(.media-card:has([data-size="small"])) {
    width: 200px;
  }
}

@supports (-webkit-touch-callout: none) {
  .no-scrollbar {
    -webkit-overflow-scrolling: touch;
  }
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .card-item {
    transition: none !important;
  }

  .fade-slide-enter-active,
  .fade-slide-leave-active {
    transition: none !important;
  }
}
</style>
