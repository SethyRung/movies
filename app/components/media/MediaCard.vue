<script setup lang="ts">
import type { Movie, TVSeries } from "#imports";

/**
 * MediaCard Component
 *
 * A versatile card component for displaying movies and TV series with:
 * - Multiple size variants (sm, md, lg)
 * - GSAP-powered hover animations
 * - Skeleton loading state
 * - Progress bar for continue watching
 * - Responsive design with dark theme
 */

// ============================================================================
// TYPES
// ============================================================================

type MediaType = "movie" | "series";
type CardSize = "sm" | "md" | "lg";

interface MediaCardProps {
  /** The media object (movie or series) */
  media: Movie | TVSeries | null;
  /** Type of media - 'movie' or 'series' */
  type: MediaType;
  /** Size variant - 'sm' (compact), 'md' (standard), 'lg' (large with overlay) */
  size?: CardSize;
  /** Optional: Progress percentage for continue watching (0-100) */
  progressPercent?: number;
  /** Optional: Click handler callback */
  onClick?: (media: Movie | TVSeries) => void;
  /** Optional: Loading state */
  loading?: boolean;
}

// ============================================================================
// PROPS & EMITS
// ============================================================================

const props = withDefaults(defineProps<MediaCardProps>(), {
  size: "md",
  progressPercent: undefined,
  onClick: undefined,
  loading: false,
});

const emit = defineEmits<{
  click: [media: Movie | TVSeries];
}>();

// ============================================================================
// COMPOSABLES
// ============================================================================

const { prefersReducedMotion } = useMediaQuery();
// Get GSAP from Nuxt app
const { $gsap: gsap } = useNuxtApp();

// ============================================================================
// COMPUTED
// ============================================================================

/**
 * Get the image source - prefers thumbnail, falls back to poster
 */
const imageSrc = computed(() => {
  if (!props.media) return "";
  return props.media.thumbnail || props.media.poster || "";
});

/**
 * Get the release year based on media type
 */
const releaseYear = computed(() => {
  if (!props.media) return undefined;
  if (props.type === "movie") {
    return (props.media as Movie).releaseYear;
  }
  return (props.media as TVSeries).firstAiredYear;
});

/**
 * Get the rating as a number
 */
const rating = computed(() => {
  if (!props.media?.rating) return undefined;
  return Number(props.media.rating);
});

/**
 * Generate CSS classes based on size variant
 */
const cardClasses = computed(() => {
  const base =
    "media-card group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300";

  const sizeClasses = {
    sm: "flex flex-row w-full max-w-md",
    md: "flex flex-col w-full",
    lg: "flex flex-col w-full",
  };

  return `${base} ${sizeClasses[props.size]}`;
});

/**
 * Container classes for the image wrapper
 */
const imageWrapperClasses = computed(() => {
  const base = "relative overflow-hidden bg-gray-800";

  const sizeClasses = {
    sm: "w-32 h-20 flex-shrink-0 rounded-l-xl",
    md: "w-full aspect-video rounded-t-xl",
    lg: "w-full aspect-video rounded-xl",
  };

  return `${base} ${sizeClasses[props.size]}`;
});

/**
 * Content layout classes
 */
const contentClasses = computed(() => {
  const sizeClasses = {
    sm: "flex-1 p-3 flex flex-col justify-center",
    md: "p-3",
    lg: "absolute inset-0 p-6 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300",
  };

  return sizeClasses[props.size];
});

/**
 * Title text classes
 */
const titleClasses = computed(() => {
  const sizeClasses = {
    sm: "text-sm font-semibold line-clamp-1",
    md: "text-sm font-semibold line-clamp-2 group-hover:text-primary-400 transition-colors",
    lg: "text-xl font-bold line-clamp-2",
  };

  return `${sizeClasses[props.size]} text-white`;
});

/**
 * Description snippet (only for lg size on hover)
 */
const descriptionSnippet = computed(() => {
  if (!props.media?.description) return "";
  const maxLength = props.size === "lg" ? 120 : 80;
  if (props.media.description.length <= maxLength) {
    return props.media.description;
  }
  return props.media.description.slice(0, maxLength) + "...";
});

// ============================================================================
// GSAP ANIMATIONS
// ============================================================================

const cardRef = ref<HTMLElement>();
const imageRef = ref<HTMLElement>();
const overlayRef = ref<HTMLElement>();

// GSAP context for proper cleanup
let gsapCtx: ReturnType<typeof gsap.context> | null = null;
// Store animation references for cleanup
let cardAnimation: ReturnType<typeof gsap.to> | null = null;
let imageAnimation: ReturnType<typeof gsap.to> | null = null;
let overlayAnimation: ReturnType<typeof gsap.to> | null = null;

// Event handler references for cleanup
const handleMouseEnter = () => {
  if (props.size === "lg" && overlayAnimation) {
    overlayAnimation.play();
  }
  cardAnimation?.play();
  imageAnimation?.play();
};

const handleMouseLeave = () => {
  if (props.size === "lg" && overlayAnimation) {
    overlayAnimation.reverse();
  }
  cardAnimation?.reverse();
  imageAnimation?.reverse();
};

onMounted(() => {
  if (!cardRef.value || prefersReducedMotion.value) return;

  // Create GSAP context for this component
  gsapCtx = gsap.context(() => {
    // Initial state
    if (overlayRef.value) {
      gsap.set(overlayRef.value, { y: 20, opacity: 0 });
    }

    // Hover animation for the card
    cardAnimation = gsap.to(cardRef.value, {
      scale: 1.03,
      y: -4,
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4), 0 0 40px rgba(99, 102, 241, 0.15)",
      duration: 0.4,
      ease: "power2.out",
      paused: true,
    });

    // Image zoom effect
    if (imageRef.value) {
      imageAnimation = gsap.to(imageRef.value, {
        scale: 1.1,
        duration: 0.5,
        ease: "power2.out",
        paused: true,
      });
    }

    // Overlay content fade in
    if (overlayRef.value) {
      overlayAnimation = gsap.to(overlayRef.value, {
        y: 0,
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
        paused: true,
      });
    }
  }, cardRef.value);

  // Set up hover event listeners with proper cleanup
  if (cardRef.value) {
    cardRef.value.addEventListener("mouseenter", handleMouseEnter);
    cardRef.value.addEventListener("mouseleave", handleMouseLeave);
  }
});

onUnmounted(() => {
  // Kill all animations
  cardAnimation?.kill();
  imageAnimation?.kill();
  overlayAnimation?.kill();
  cardAnimation = null;
  imageAnimation = null;
  overlayAnimation = null;

  // Revert GSAP context
  if (gsapCtx) {
    gsapCtx.revert();
    gsapCtx = null;
  }

  // Remove event listeners
  if (cardRef.value) {
    cardRef.value.removeEventListener("mouseenter", handleMouseEnter);
    cardRef.value.removeEventListener("mouseleave", handleMouseLeave);
  }
});

// ============================================================================
// EVENT HANDLERS
// ============================================================================

function handleClick() {
  if (props.media) {
    if (props.onClick) {
      props.onClick(props.media);
    }
    emit("click", props.media);
  }
}
</script>

<template>
  <!--
    MEDIA CARD COMPONENT

    Size Variants:
    - sm: Compact horizontal card (thumbnail + side content)
    - md: Standard vertical card (thumbnail + content below)
    - lg: Large card with overlay content on hover
  -->

  <!-- Loading State (Skeleton) -->
  <div v-if="loading" :class="cardClasses">
    <div :class="imageWrapperClasses">
      <div class="skeleton-pulse w-full h-full bg-gray-800" />
    </div>
    <div v-if="size !== 'lg'" class="p-3 w-full">
      <div class="skeleton-pulse h-4 w-3/4 bg-gray-800 rounded mb-2" />
      <div class="skeleton-pulse h-3 w-1/2 bg-gray-800 rounded" />
    </div>
  </div>

  <!-- Actual Card -->
  <div
    v-else-if="media"
    ref="cardRef"
    :class="cardClasses"
    role="button"
    :tabindex="0"
    :aria-label="`${type === 'movie' ? 'Movie' : 'TV Series'}: ${media.title}`"
    @click="handleClick"
    @keydown.enter="handleClick"
  >
    <!-- Image Container -->
    <div :class="imageWrapperClasses">
      <!-- Media Image -->
      <NuxtImg
        v-if="imageSrc"
        ref="imageRef"
        :src="imageSrc"
        :alt="media.title"
        class="w-full h-full object-cover"
        width="400"
        height="225"
        loading="lazy"
        format="webp"
        :modifiers="{
          format: 'webp',
          quality: 80,
        }"
      />
      <div
        v-else
        class="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center"
      >
        <Icon name="i-lucide-film" class="w-12 h-12 text-gray-600" />
      </div>

      <!-- Subtle Gradient Overlay for Dark Thumbnails -->
      <div
        class="absolute inset-0 bg-gradient-to-b from-white/[0.02] via-transparent to-gray-900/20 pointer-events-none"
      />

      <!-- Badges Overlay (Top Right) -->
      <div class="absolute top-2 right-2 flex gap-2 z-10">
        <!-- Rating Badge -->
        <div
          v-if="rating"
          class="flex items-center gap-1 px-2 py-1 rounded-md bg-black/70 backdrop-blur-sm"
        >
          <Icon name="i-lucide-star" class="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span class="text-xs font-semibold text-white">{{ rating }}</span>
        </div>
      </div>

      <!-- Year Badge (Top Left) -->
      <div v-if="releaseYear" class="absolute top-2 left-2 z-10">
        <div class="px-2 py-1 rounded-md bg-black/70 backdrop-blur-sm">
          <span class="text-xs font-medium text-white">{{ releaseYear }}</span>
        </div>
      </div>

      <!-- Large size overlay content (appears on hover) -->
      <div
        v-if="size === 'lg'"
        ref="overlayRef"
        class="absolute inset-0 p-6 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/50 to-transparent"
      >
        <!-- Description snippet -->
        <p v-if="descriptionSnippet" class="text-sm text-gray-300 line-clamp-3 mb-3">
          {{ descriptionSnippet }}
        </p>

        <!-- Action buttons -->
        <div class="flex gap-2">
          <UButton icon="i-lucide-play" size="sm" color="primary" variant="solid" class="flex-1">
            {{ type === "movie" ? "Watch" : "Play" }}
          </UButton>
          <UButton icon="i-lucide-plus" size="sm" color="neutral" variant="soft" />
        </div>
      </div>

      <!-- Progress Bar (Continue Watching) -->
      <div
        v-if="progressPercent !== undefined && progressPercent > 0 && progressPercent < 100"
        class="absolute bottom-0 left-0 right-0 h-1 bg-black/50"
      >
        <div
          class="h-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-300"
          :style="{ width: `${progressPercent}%` }"
        />
      </div>
    </div>

    <!-- Content Section (not for lg - it uses overlay) -->
    <div v-if="size !== 'lg'" :class="contentClasses">
      <!-- Title -->
      <h3 :class="titleClasses">
        {{ media.title }}
      </h3>

      <!-- Small size: Additional info below title -->
      <template v-if="size === 'sm'">
        <div class="flex items-center gap-2 mt-1">
          <!-- Rating (inline for sm) -->
          <span v-if="rating" class="flex items-center gap-1 text-xs text-gray-400">
            <Icon name="i-lucide-star" class="w-3 h-3 text-yellow-400 fill-yellow-400" />
            {{ rating }}
          </span>
          <!-- Year (inline for sm) -->
          <span v-if="releaseYear" class="text-xs text-gray-400">
            {{ releaseYear }}
          </span>
        </div>
        <!-- Progress bar for sm size (below content) -->
        <div
          v-if="progressPercent !== undefined && progressPercent > 0 && progressPercent < 100"
          class="mt-2 h-0.5 bg-gray-700 rounded-full overflow-hidden"
        >
          <div
            class="h-full bg-primary-500 rounded-full transition-all duration-300"
            :style="{ width: `${progressPercent}%` }"
          />
        </div>
      </template>

      <!-- Medium size: Description snippet and badges below -->
      <template v-if="size === 'md'">
        <p v-if="descriptionSnippet" class="text-xs text-gray-400 line-clamp-2 mt-1">
          {{ descriptionSnippet }}
        </p>

        <!-- Rating and Year inline for md -->
        <div class="flex items-center gap-3 mt-2">
          <span v-if="rating" class="flex items-center gap-1 text-xs text-gray-400">
            <Icon name="i-lucide-star" class="w-3 h-3 text-yellow-400 fill-yellow-400" />
            {{ rating }}
          </span>
          <span v-if="releaseYear" class="text-xs text-gray-400">
            {{ releaseYear }}
          </span>
          <span class="text-xs text-gray-500 uppercase tracking-wide">
            {{ type === "movie" ? "Movie" : "TV Series" }}
          </span>
        </div>

        <!-- Progress bar for md size -->
        <div
          v-if="progressPercent !== undefined && progressPercent > 0 && progressPercent < 100"
          class="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden"
        >
          <div
            class="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-300"
            :style="{ width: `${progressPercent}%` }"
          />
        </div>
      </template>
    </div>
  </div>

  <!-- Empty State -->
  <div v-else :class="cardClasses" class="opacity-50 pointer-events-none">
    <div :class="imageWrapperClasses">
      <div class="w-full h-full bg-gray-800 flex items-center justify-center">
        <Icon name="i-lucide-image-off" class="w-8 h-8 text-gray-600" />
      </div>
    </div>
    <div v-if="size !== 'lg'" class="p-3">
      <div class="h-4 w-3/4 bg-gray-800 rounded" />
    </div>
  </div>
</template>

<style scoped>
/* Skeleton loading animation */
@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.skeleton-pulse {
  animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Line clamping utilities */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .media-card {
    transition: none !important;
  }

  .skeleton-pulse {
    animation: none !important;
  }
}

/* Glow effect on hover for large cards */
@media (hover: hover) {
  .media-card.group:hover .media-card-glow {
    opacity: 1;
  }
}

/* Focus styles for accessibility */
.media-card:focus-visible {
  outline: 2px solid rgb(99 102 241);
  outline-offset: 2px;
}

/* Smooth image transition */
.media-card img {
  transition: transform 0.3s ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .media-card img {
    transition: none;
  }
}
</style>
