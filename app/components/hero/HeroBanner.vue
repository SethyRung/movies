<script setup lang="ts">
/**
 * HeroBanner Component - Premium Edition
 *
 * Enterprise-grade immersive hero banner with:
 * - Parallax mouse movement effects
 * - Staggered text entrance animations with GSAP
 * - Smooth carousel transitions with fade/slide effects
 * - Video background support option
 * - Subtle floating particle effects
 * - Progressive gradient overlays
 * - Premium typography with animated underlines
 * - Enhanced button hover states with scale and glow effects
 * - Animated progress bar
 */

import type { StreamingContent, StreamingMovie, StreamingSeries } from "~/data/mockDataEnhanced";

interface Props {
  content: StreamingContent[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  enableParallax?: boolean;
  enableParticles?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  autoPlay: true,
  autoPlayInterval: 8000,
  enableParallax: true,
  enableParticles: true,
});

const emit = defineEmits<{
  play: [content: StreamingContent];
  moreInfo: [content: StreamingContent];
}>();

const { $gsap: gsap } = useNuxtApp();

// State
const currentIndex = ref(0);
const isAnimating = ref(false);
const isPaused = ref(false);
const autoPlayTimer = ref<ReturnType<typeof setInterval> | null>(null);
const progressValue = ref(0);
const mousePosition = ref({ x: 0, y: 0 });
const particles = ref<
  Array<{ id: number; x: number; y: number; size: number; duration: number; delay: number }>
>([]);

// GSAP context
const heroRef = ref<HTMLElement>();
const containerRef = ref<HTMLElement>();
const titleRef = ref<HTMLElement>();
const titleUnderlineRef = ref<HTMLElement>();
const metaRef = ref<HTMLElement>();
const descRef = ref<HTMLElement>();
const buttonsRef = ref<HTMLElement>();
const bgRef = ref<HTMLElement>();
const bgImageRef = ref<HTMLElement>();
const progressBarRef = ref<HTMLElement>();
const particlesContainerRef = ref<HTMLElement>();
const gsapCtx = ref<ReturnType<typeof gsap.context> | null>(null);

// Computed
const currentItem = computed(() => props.content[currentIndex.value] ?? null);
const totalItems = computed(() => props.content.length);

// Helper to check if movie
const isMovie = (item: StreamingContent): item is StreamingMovie => {
  return item.type === "movie";
};

// Helper to get duration text
const getDurationText = (item: StreamingContent): string => {
  if (isMovie(item)) {
    const hours = Math.floor(item.duration / 60);
    const mins = item.duration % 60;
    return `${hours}h ${mins}m`;
  } else {
    return `${item.seasons} Season${item.seasons > 1 ? "s" : ""}`;
  }
};

// Helper to get quality badge
const getQualityBadge = (item: StreamingContent): string => {
  return item.videoMetadata.quality;
};

// Generate particles
const generateParticles = () => {
  if (!props.enableParticles) return;
  particles.value = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 2,
  }));
};

// Animate particles
const animateParticles = () => {
  if (!gsap || !props.enableParticles) return;

  const particles = particlesContainerRef.value?.querySelectorAll(".particle");
  if (!particles || particles.length === 0) return;

  particles.forEach((particle) => {
    gsap.to(particle, {
      y: "-=100",
      opacity: 0,
      duration: parseFloat(particle.dataset.duration || "3"),
      delay: parseFloat(particle.dataset.delay || "0"),
      repeat: -1,
      ease: "none",
    });
  });
};

// Parallax effect on mouse move
const handleMouseMove = (e: MouseEvent) => {
  if (!props.enableParallax || !bgImageRef.value) return;

  const rect = heroRef.value?.getBoundingClientRect();
  if (!rect) return;

  const x = (e.clientX - rect.left) / rect.width - 0.5;
  const y = (e.clientY - rect.top) / rect.height - 0.5;

  mousePosition.value = { x: x * 20, y: y * 20 };

  gsap.to(bgImageRef.value, {
    x: mousePosition.value.x,
    y: mousePosition.value.y,
    duration: 1,
    ease: "power2.out",
  });
};

// Reset parallax on mouse leave
const handleMouseLeave = () => {
  if (!gsap || !bgImageRef.value) return;

  gsap.to(bgImageRef.value, {
    x: 0,
    y: 0,
    duration: 1,
    ease: "power2.out",
  });
};

// Animate progress bar
const animateProgress = () => {
  if (!gsap || !progressBarRef.value) return;

  gsap.fromTo(
    progressBarRef.value,
    { width: "0%" },
    {
      width: "100%",
      duration: props.autoPlayInterval / 1000,
      ease: "linear",
      onComplete: () => {
        if (!isPaused.value) {
          nextSlide();
        }
      },
    },
  );
};

// Animation timeline - premium entrance
const animateIn = () => {
  if (!gsap || !currentItem.value) return;

  isAnimating.value = true;

  // Kill any existing animations on all tracked elements
  const trackedElements = [
    titleRef.value,
    titleUnderlineRef.value,
    metaRef.value,
    descRef.value,
    buttonsRef.value,
    bgRef.value,
    bgImageRef.value,
  ].filter(Boolean);

  trackedElements.forEach((el) => gsap.killTweensOf(el));

  // Reset progress
  progressValue.value = 0;

  // Background dramatic zoom effect - enhanced brightness for vivid appearance
  if (bgImageRef.value) {
    gsap.fromTo(
      bgImageRef.value,
      { scale: 1.15, filter: "brightness(0.85) saturate(1.1)" },
      { scale: 1, filter: "brightness(1.15) saturate(1.2)", duration: 2, ease: "power2.out" },
    );
  }

  // Create timeline for content animations
  const tl = gsap.timeline({
    onComplete: () => {
      isAnimating.value = false;
      if (!isPaused.value) {
        animateProgress();
      }
    },
  });

  // Title animation - slide up with reveal
  if (titleRef.value) {
    gsap.set(titleRef.value, { y: 60, opacity: 0, rotationX: 15 });
    tl.to(
      titleRef.value,
      {
        y: 0,
        opacity: 1,
        rotationX: 0,
        duration: 1,
        ease: "power3.out",
      },
      0.3,
    );

    // Animated underline
    if (titleUnderlineRef.value) {
      gsap.set(titleUnderlineRef.value, { scaleX: 0 });
      tl.to(
        titleUnderlineRef.value,
        {
          scaleX: 1,
          duration: 0.8,
          ease: "power2.out",
        },
        0.8,
      );
    }
  }

  // Meta badges animation - stagger from left
  if (metaRef.value) {
    const badges = metaRef.value.querySelectorAll(".meta-badge");
    if (badges.length > 0) {
      gsap.set(badges, { x: -20, opacity: 0 });
      tl.to(
        badges,
        {
          x: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: "power2.out",
        },
        0.6,
      );
    }
  }

  // Description animation - fade in with blur
  if (descRef.value) {
    gsap.set(descRef.value, { y: 30, opacity: 0, filter: "blur(10px)" });
    tl.to(
      descRef.value,
      {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.8,
        ease: "power2.out",
      },
      0.75,
    );
  }

  // Buttons animation - use fromTo for proper control
  if (buttonsRef.value) {
    const buttons = buttonsRef.value.querySelectorAll("button");
    if (buttons.length > 0) {
      // Use fromTo to animate from hidden state to visible
      tl.fromTo(
        buttons,
        { y: 20, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "back.out(1.7)",
        },
        0.85,
      );
    }
  }
};

const animateOut = (callback: () => void) => {
  if (!gsap) {
    callback();
    return;
  }

  const tl = gsap.timeline({
    onComplete: callback,
  });

  // Animate out all content elements with proper timing
  if (titleRef.value) {
    tl.to(
      titleRef.value,
      {
        y: -30,
        opacity: 0,
        duration: 0.4,
        ease: "power2.in",
      },
      0,
    );
  }

  if (metaRef.value) {
    const badges = metaRef.value.querySelectorAll(".meta-badge");
    if (badges.length > 0) {
      tl.to(
        badges,
        {
          y: -20,
          opacity: 0,
          duration: 0.35,
          stagger: 0.03,
          ease: "power2.in",
        },
        0.05,
      );
    }
  }

  if (descRef.value) {
    tl.to(
      descRef.value,
      {
        y: -20,
        opacity: 0,
        duration: 0.35,
        ease: "power2.in",
      },
      0.1,
    );
  }

  if (buttonsRef.value) {
    const buttons = buttonsRef.value.querySelectorAll("button");
    if (buttons.length > 0) {
      tl.to(
        buttons,
        {
          y: -15,
          opacity: 0,
          scale: 0.9,
          duration: 0.3,
          stagger: 0.05,
          ease: "power2.in",
        },
        0.15,
      );
    }
  }

  // Fade out background
  if (bgImageRef.value) {
    tl.to(
      bgImageRef.value,
      {
        scale: 1.1,
        filter: "brightness(0.7) saturate(1)",
        duration: 0.5,
        ease: "power2.in",
      },
      0,
    );
  }
};

// Navigation
const goToSlide = async (index: number) => {
  if (isAnimating.value || index === currentIndex.value) return;

  // Set animating flag to prevent double clicks
  isAnimating.value = true;

  // First animate out current content
  await new Promise<void>((resolve) => {
    animateOut(() => resolve());
  });

  // Update the index
  currentIndex.value = index;

  // Wait for DOM to update with new content
  await nextTick();

  // Small additional delay to ensure Vue has rendered everything
  await new Promise((resolve) => setTimeout(resolve, 50));

  // Animate in the new content
  animateIn();
};

const nextSlide = () => {
  const nextIndex = (currentIndex.value + 1) % totalItems.value;
  goToSlide(nextIndex);
};

const prevSlide = () => {
  const prevIndex = (currentIndex.value - 1 + totalItems.value) % totalItems.value;
  goToSlide(prevIndex);
};

// Auto-play
const startAutoPlay = () => {
  stopAutoPlay();
  if (props.autoPlay && !isPaused.value && totalItems.value > 1) {
    animateProgress();
  }
};

const stopAutoPlay = () => {
  if (autoPlayTimer.value) {
    clearInterval(autoPlayTimer.value);
    autoPlayTimer.value = null;
  }
  if (gsap && progressBarRef.value) {
    gsap.killTweensOf(progressBarRef.value);
  }
};

const pause = () => {
  isPaused.value = true;
  if (gsap && progressBarRef.value) {
    gsap.pause(progressBarRef.value);
  }
};

const resume = () => {
  isPaused.value = false;
  if (gsap && progressBarRef.value) {
    gsap.resume(progressBarRef.value);
  }
};

// Keyboard navigation
const handleKeydown = (e: KeyboardEvent) => {
  if (totalItems.value <= 1) return;

  switch (e.key) {
    case "ArrowLeft":
      e.preventDefault();
      prevSlide();
      break;
    case "ArrowRight":
      e.preventDefault();
      nextSlide();
      break;
  }
};

// Lifecycle
onMounted(() => {
  if (!gsap) {
    console.warn("GSAP plugin not available");
    return;
  }

  // Generate particles
  generateParticles();

  // Create GSAP context
  gsapCtx.value = gsap.context(() => {
    // Initial animation
    nextTick(() => {
      animateIn();
      animateParticles();
    });
  }, heroRef.value);

  // Keyboard listeners
  window.addEventListener("keydown", handleKeydown);

  // Mouse move for parallax
  if (props.enableParallax && heroRef.value) {
    heroRef.value.addEventListener("mousemove", handleMouseMove);
    heroRef.value.addEventListener("mouseleave", handleMouseLeave);
  }
});

onUnmounted(() => {
  stopAutoPlay();
  window.removeEventListener("keydown", handleKeydown);

  if (props.enableParallax && heroRef.value) {
    heroRef.value.removeEventListener("mousemove", handleMouseMove);
    heroRef.value.removeEventListener("mouseleave", handleMouseLeave);
  }

  // Kill all active tweens
  gsap.killTweensOf([
    titleRef.value,
    titleUnderlineRef.value,
    metaRef.value,
    descRef.value,
    buttonsRef.value,
    bgRef.value,
    bgImageRef.value,
    progressBarRef.value,
  ]);

  // Clean up GSAP
  if (gsapCtx.value) {
    gsapCtx.value.revert();
    gsapCtx.value = null;
  }
});

// Watch for content changes
watch(
  () => props.content.length,
  () => {
    nextTick(() => {
      currentIndex.value = 0;
      animateIn();
    });
  },
);
</script>

<template>
  <section
    ref="heroRef"
    class="relative w-full h-[70vh] sm:h-[80vh] md:h-[95vh] lg:h-[110vh] xl:h-[120vh] overflow-hidden bg-neutral-950"
    @mouseenter="pause"
    @mouseleave="resume"
    role="region"
    aria-label="Featured content"
  >
    <!-- Background with Video/Image Support -->
    <div ref="bgRef" class="absolute inset-0">
      <!-- Animated Background Gradient - Cinematic Color Bleed (reduced opacity) -->
      <div
        class="absolute inset-0 bg-gradient-to-br from-primary-950/10 via-neutral-950/50 to-purple-950/10 animate-color-shift"
      />

      <!-- Background Image with Parallax - enhanced visibility -->
      <div
        v-if="currentItem"
        ref="bgImageRef"
        class="absolute inset-[-5%] bg-cover bg-center will-change-transform"
        :style="{
          backgroundImage: `url('${currentItem.backdrop}')`,
          filter: 'brightness(1.15) saturate(1.2)',
        }"
      />

      <!-- Multi-layered Gradient Overlays for Premium Feel (lighter) -->
      <!-- Vignette effect (subtle) -->
      <div
        class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.25)_60%,rgba(0,0,0,0.5)_100%)]"
      />

      <!-- Left-to-right gradient for text readability - cinematic (lighter) -->
      <div
        class="absolute inset-0 bg-gradient-to-r from-neutral-950/90 via-neutral-950/60 via-50% to-transparent md:via-neutral-950/45 md:via-40% lg:via-neutral-950/30 lg:via-30%"
      />

      <!-- Bottom gradient (lighter) -->
      <div
        class="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-transparent via-75%"
      />

      <!-- Top fade for header blend (lighter) -->
      <div
        class="absolute top-0 left-0 right-0 h-28 md:h-36 bg-gradient-to-b from-neutral-950/80 to-transparent"
      />

      <!-- Cinematic color overlay based on content (enhanced) -->
      <div
        class="absolute inset-0 mix-blend-color-dodge opacity-[0.05] bg-gradient-to-br from-amber-500/30 via-primary-500/10 to-transparent"
      />

      <!-- Subtle animated grain overlay (minimal impact on brightness) -->
      <div class="absolute inset-0 opacity-[0.02] mix-blend-soft-light pointer-events-none">
        <svg class="w-full h-full">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>

      <!-- Floating light orbs (enhanced for brighter appearance) -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          class="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-500/15 rounded-full blur-[100px] animate-pulse-slow"
        />
        <div
          class="absolute bottom-1/4 left-1/3 w-80 h-80 bg-purple-500/15 rounded-full blur-[80px] animate-pulse-slow"
          style="animation-delay: 1s"
        />
        <div
          class="absolute top-1/2 left-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-[90px] animate-pulse-slow"
          style="animation-delay: 2s"
        />
      </div>
    </div>

    <!-- Floating Particles -->
    <div
      v-if="enableParticles"
      ref="particlesContainerRef"
      class="absolute inset-0 overflow-hidden pointer-events-none z-5"
    >
      <div
        v-for="particle in particles"
        :key="particle.id"
        class="particle absolute rounded-full bg-white/20"
        :class="`w-[${particle.size}px] h-[${particle.size}px]`"
        :style="{
          left: `${particle.x}%`,
          bottom: '-20px',
          width: `${particle.size}px`,
          height: `${particle.size}px`,
        }"
        :data-duration="particle.duration"
        :data-delay="particle.delay"
      />
    </div>

    <!-- Loading State -->
    <div v-if="!currentItem" class="absolute inset-0 flex items-center justify-center z-20">
      <div class="flex flex-col items-center gap-6">
        <div class="relative">
          <div
            class="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"
          />
          <div
            class="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-primary-400/50 rounded-full animate-spin"
            style="animation-duration: 1.5s; animation-direction: reverse"
          />
        </div>
        <p class="text-neutral-400 text-lg tracking-wide">Loading featured content...</p>
      </div>
    </div>

    <!-- Content -->
    <div
      v-if="currentItem"
      ref="containerRef"
      class="relative z-10 h-full flex items-center perspective-1000"
    >
      <!-- Add side padding to account for navigation buttons -->
      <div class="w-full px-2 sm:px-4 md:px-6 lg:px-8 xl:pl-16 xl:pr-16">
        <div class="max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl">
          <!-- Top Badges Row -->
          <div class="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-5">
            <!-- Maturity Badge with Glow -->
            <span class="relative group">
              <span
                class="absolute inset-0 bg-white/20 blur-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
              />
              <span
                class="relative inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-neutral-800/90 backdrop-blur-md text-white border border-neutral-600/50 shadow-lg"
              >
                {{ currentItem.maturityRating }}
              </span>
            </span>

            <!-- New Release Badge -->
            <span
              v-if="currentItem.newRelease"
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-red-600/90 backdrop-blur-md text-white shadow-lg"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              NEW
            </span>

            <!-- Top 10 Badge -->
            <span
              v-if="currentItem.top10 && currentItem.top10 <= 10"
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg"
            >
              <UIcon name="i-lucide-trophy" class="w-3 h-3" />
              #{{ currentItem.top10 }}
            </span>
          </div>

          <!-- Title with Animated Underline -->
          <div class="relative mb-4 sm:mb-5 md:mb-6">
            <h1
              ref="titleRef"
              class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-white leading-tight tracking-tight"
              style="text-shadow: 0 4px 30px rgba(0, 0, 0, 0.5)"
            >
              {{ currentItem.title }}
            </h1>
            <div
              ref="titleUnderlineRef"
              class="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-primary-500 via-primary-400 to-transparent origin-left"
            />
          </div>

          <!-- Meta Badges - Fixed height row for consistent layout -->
          <div
            ref="metaRef"
            class="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-5 md:mb-6 min-h-[28px] sm:min-h-[32px]"
          >
            <!-- Content Type Badge (Movie/Series) - Always first -->
            <span
              class="meta-badge inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide"
              :class="
                isMovie(currentItem)
                  ? 'bg-emerald-600/90 text-white'
                  : 'bg-violet-600/90 text-white'
              "
            >
              {{ isMovie(currentItem) ? "Movie" : "Series" }}
            </span>

            <!-- Divider -->
            <span class="meta-badge text-white/30">•</span>

            <!-- Year -->
            <span class="meta-badge text-sm sm:text-base text-white/90 font-medium">{{
              isMovie(currentItem) ? currentItem.releaseYear : currentItem.firstAiredYear
            }}</span>

            <!-- Divider -->
            <span class="meta-badge text-white/30">•</span>

            <!-- Duration/Seasons -->
            <span class="meta-badge text-sm sm:text-base text-white/90 font-medium">{{
              getDurationText(currentItem)
            }}</span>

            <!-- Divider -->
            <span class="meta-badge text-white/30">•</span>

            <!-- Match Score with Ring -->
            <div class="meta-badge flex items-center">
              <div class="relative w-7 h-7 sm:w-8 sm:h-8">
                <svg class="w-full h-full -rotate-90" viewBox="0 0 32 32">
                  <circle
                    cx="16"
                    cy="16"
                    r="14"
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    stroke-width="3"
                  />
                  <circle
                    cx="16"
                    cy="16"
                    r="14"
                    fill="none"
                    :stroke="
                      currentItem.rating >= 0.8
                        ? '#22c55e'
                        : currentItem.rating >= 0.6
                          ? '#eab308'
                          : '#ef4444'
                    "
                    stroke-width="3"
                    :stroke-dasharray="`${currentItem.rating * 88} 88`"
                    stroke-linecap="round"
                  />
                </svg>
                <span
                  class="absolute inset-0 flex items-center justify-center text-[10px] sm:text-[11px] font-bold text-white"
                >
                  {{ Math.round(currentItem.rating * 10) }}
                </span>
              </div>
            </div>

            <!-- Divider -->
            <span class="meta-badge text-white/30">•</span>

            <!-- Quality Badge with HD/4K/8D indicator -->
            <span class="meta-badge relative group inline-flex items-center">
              <span
                class="absolute inset-0 bg-blue-500/20 blur-md rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
              />
              <span
                class="relative inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-600/90 backdrop-blur-sm text-white border border-blue-400/30"
              >
                {{ getQualityBadge(currentItem) }}
              </span>
            </span>

            <!-- Divider -->
            <span class="meta-badge text-white/30">•</span>

            <!-- Genres (first 2) -->
            <span
              v-for="genre in (currentItem.genres || []).slice(0, 2)"
              :key="genre"
              class="meta-badge text-sm sm:text-base text-white/70"
            >
              {{ genre }}
            </span>
          </div>

          <!-- Description with enhanced typography -->
          <p
            ref="descRef"
            class="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 md:mb-10 line-clamp-2 sm:line-clamp-3 max-w-full sm:max-w-md md:max-w-xl lg:max-w-2xl leading-relaxed drop-shadow-lg hidden xs:block"
          >
            {{ currentItem.shortDescription || currentItem.description }}
          </p>

          <!-- Action Buttons with Enhanced Effects -->
          <div ref="buttonsRef" class="flex flex-wrap items-center gap-3 sm:gap-4">
            <!-- Play Button with Glow Effect -->
            <UButton
              size="xl"
              color="white"
              variant="solid"
              class="group relative overflow-hidden gap-2 px-6 sm:px-8 md:px-10 py-3 sm:py-4 min-h-[52px] sm:min-h-[56px] bg-white text-black hover:bg-neutral-100 text-base sm:text-lg font-semibold shadow-xl shadow-white/10 hover:shadow-2xl hover:shadow-white/20 transition-all duration-300"
              @click="emit('play', currentItem)"
            >
              <template #leading>
                <UIcon
                  name="i-lucide-play"
                  class="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform"
                />
              </template>
              Play
              <span
                class="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-shimmer"
              />
            </UButton>

            <!-- More Info Button -->
            <UButton
              size="xl"
              color="neutral"
              variant="ghost"
              class="group relative overflow-hidden gap-2 px-5 sm:px-7 md:px-9 py-3 sm:py-4 min-h-[52px] sm:min-h-[56px] bg-neutral-800/70 hover:bg-neutral-700/80 backdrop-blur-md border border-neutral-600/50 text-white text-base sm:text-lg font-medium shadow-lg transition-all duration-300 hover:scale-105"
              @click="emit('moreInfo', currentItem)"
            >
              <template #leading>
                <UIcon name="i-lucide-info" class="w-5 h-5 sm:w-6 sm:h-6" />
              </template>
              <span class="hidden sm:inline">More Info</span>
              <span class="sm:hidden">Info</span>
            </UButton>

            <!-- My List Button with Tooltip -->
            <UButton
              size="xl"
              color="neutral"
              variant="ghost"
              class="group w-12 h-12 sm:w-14 sm:h-14 min-w-[48px] min-h-[48px] sm:min-w-[56px] sm:min-h-[56px] rounded-full bg-neutral-800/70 hover:bg-neutral-700/80 backdrop-blur-md border border-neutral-600/50 shadow-lg transition-all duration-300 hover:scale-110 hover:border-neutral-500 flex items-center justify-center"
              aria-label="Add to My List"
            >
              <UIcon name="i-lucide-plus" class="w-5 h-5 sm:w-6 sm:h-6 text-white flex-shrink-0" />
            </UButton>
          </div>

          <!-- Cast Preview (if available) -->
          <div
            v-if="currentItem.cast && currentItem.cast.length > 0"
            class="mt-6 sm:mt-8 flex items-center gap-2 text-sm text-white/60"
          >
            <span class="text-white/80">Starring:</span>
            <span class="text-white/60">{{
              currentItem.cast
                .slice(0, 3)
                .map((c) => c.name)
                .join(", ")
            }}</span>
            <span v-if="currentItem.cast.length > 3" class="text-white/40"
              >+{{ currentItem.cast.length - 3 }} more</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Premium Navigation Controls -->
    <div
      v-if="totalItems > 1"
      class="absolute bottom-6 sm:bottom-8 md:bottom-10 right-2 sm:right-4 md:right-6 flex items-center gap-3 sm:gap-4 z-30"
    >
      <!-- Prev Button - Always Visible -->
      <UButton
        icon="i-lucide-chevron-left"
        color="neutral"
        variant="ghost"
        size="md"
        class="bg-neutral-900/90 hover:bg-neutral-800 backdrop-blur-md text-white border border-neutral-600/50 w-10 h-10 sm:w-11 sm:h-11 min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] rounded-full shadow-xl transition-all duration-300 hover:scale-110 hover:border-primary-500/50"
        :disabled="isAnimating"
        aria-label="Previous slide"
        @click="prevSlide"
      />

      <!-- Dots with Active Indicator -->
      <div
        class="flex items-center gap-1.5 sm:gap-2 bg-neutral-900/60 backdrop-blur-md rounded-full px-3 py-2 border border-neutral-700/50"
      >
        <button
          v-for="(_, index) in totalItems"
          :key="index"
          type="button"
          :aria-label="`Go to slide ${index + 1}`"
          :class="[
            'h-2 rounded-full transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-neutral-900',
            index === currentIndex
              ? 'w-8 sm:w-10 bg-gradient-to-r from-primary-500 to-primary-400 shadow-lg shadow-primary-500/50'
              : 'w-2 bg-white/30 hover:bg-white/50',
          ]"
          :disabled="isAnimating"
          @click="goToSlide(index)"
        />
      </div>

      <!-- Next Button - Always Visible -->
      <UButton
        icon="i-lucide-chevron-right"
        color="neutral"
        variant="ghost"
        size="md"
        class="bg-neutral-900/90 hover:bg-neutral-800 backdrop-blur-md text-white border border-neutral-600/50 w-10 h-10 sm:w-11 sm:h-11 min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] rounded-full shadow-xl transition-all duration-300 hover:scale-110 hover:border-primary-500/50"
        :disabled="isAnimating"
        aria-label="Next slide"
        @click="nextSlide"
      />
    </div>

    <!-- Large Side Navigation Buttons - Always Visible -->
    <template v-if="totalItems > 1">
      <!-- Left Nav Button - Positioned outside content padding zone -->
      <button
        class="absolute left-0 sm:left-2 md:left-4 top-1/2 -translate-y-1/2 z-25 w-10 h-10 sm:w-12 sm:h-12 min-w-[40px] min-h-[40px] sm:min-w-[48px] sm:min-h-[48px] rounded-full bg-neutral-900/80 hover:bg-neutral-800/90 backdrop-blur-md border border-neutral-600/50 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-xl group"
        :disabled="isAnimating"
        aria-label="Previous slide"
        @click="prevSlide"
      >
        <div
          class="absolute inset-0 bg-primary-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        />
        <UIcon
          name="i-lucide-chevron-left"
          class="w-5 h-5 sm:w-6 sm:h-6 text-white relative z-10"
        />
      </button>

      <!-- Right Nav Button - Positioned outside content padding zone -->
      <button
        class="absolute right-0 sm:right-2 md:right-4 top-1/2 -translate-y-1/2 z-25 w-10 h-10 sm:w-12 sm:h-12 min-w-[40px] min-h-[40px] sm:min-w-[48px] sm:min-h-[48px] rounded-full bg-neutral-900/80 hover:bg-neutral-800/90 backdrop-blur-md border border-neutral-600/50 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-xl group"
        :disabled="isAnimating"
        aria-label="Next slide"
        @click="nextSlide"
      >
        <div
          class="absolute inset-0 bg-primary-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        />
        <UIcon
          name="i-lucide-chevron-right"
          class="w-5 h-5 sm:w-6 sm:h-6 text-white relative z-10"
        />
      </button>
    </template>

    <!-- Animated Progress Bar -->
    <div
      v-if="totalItems > 1"
      class="absolute bottom-0 left-0 right-0 h-1 bg-neutral-800/80 z-30 overflow-hidden"
      aria-hidden="true"
    >
      <div
        ref="progressBarRef"
        class="h-full bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
      />
    </div>

    <!-- Bottom Fade for Content Transition -->
    <div
      class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent pointer-events-none z-15"
    />

    <!-- Slide Counter -->
    <div class="absolute bottom-6 sm:bottom-8 md:bottom-10 left-2 sm:left-4 md:left-6 z-30">
      <div
        class="flex items-center gap-3 bg-neutral-900/60 backdrop-blur-md rounded-full px-4 py-2 border border-neutral-700/50"
      >
        <span class="text-white font-bold text-lg">{{ currentIndex + 1 }}</span>
        <span class="text-white/40">/</span>
        <span class="text-white/60 text-sm">{{ totalItems }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Custom breakpoint for extra small screens */
@screen xs {
  .xs\:block {
    display: block;
  }
  .xs\:inline {
    display: inline;
  }
}

@media (min-width: 375px) {
  .xs\:block {
    display: block;
  }
  .xs\:inline {
    display: inline;
  }
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

/* Meta badges consistent styling */
.meta-badge {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

/* Show navigation buttons on hover - REMOVED for always-visible navigation */

/* Shimmer animation for play button */
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 1.5s infinite;
}

/* Perspective for 3D effects */
.perspective-1000 {
  perspective: 1000px;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .transition-all,
  .transition-transform,
  .transition-opacity {
    transition: none !important;
  }
  .animate-shimmer {
    animation: none;
  }
}

/* Will change optimization for animations */
.will-change-transform {
  will-change: transform;
}

/* Background image enhancement */
.absolute.inset-\[-5\%\] {
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}

/* Particle animations */
.particle {
  will-change: transform, opacity;
}

/* Z-index layering */
.z-5 {
  z-index: 5;
}

.z-15 {
  z-index: 15;
}

.z-25 {
  z-index: 25;
}

/* Custom scrollbar for horizontal scroll areas */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Color shift animation */
@keyframes color-shift {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-color-shift {
  animation: color-shift 8s ease-in-out infinite;
}

/* Slow pulse animation */
@keyframes pulse-slow {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.1);
  }
}

.animate-pulse-slow {
  animation: pulse-slow 6s ease-in-out infinite;
}
</style>
