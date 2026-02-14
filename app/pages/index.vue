<script setup lang="ts">
/**
 * Homepage - Enterprise Streaming Platform
 *
 * Premium Netflix/Max-style homepage with:
 * - Full-width immersive hero with cinematic effects
 * - Parallax scrolling with depth layers
 * - Staggered content rail animations
 * - Smooth page transitions with blur effects
 * - Animated section dividers
 * - Loading states with skeleton screens
 */

import type { StreamingContent } from "~/data/mockDataEnhanced";
import {
  getFeaturedContent,
  getTrendingContent,
  getNewReleases,
  getTop10,
  getContinueWatching,
} from "~/data/mockDataEnhanced";

const { $gsap: gsap } = useNuxtApp();

// ============================================================================
// FIRST VISIT TRACKING
// ============================================================================

// Track first visit to only animate entrance once
const hasVisitedBefore = ref(false);
const FIRST_VISIT_KEY = "cine-max-home-visited";

// Check if user has visited before (client-side only)
if (import.meta.client) {
  hasVisitedBefore.value = localStorage.getItem(FIRST_VISIT_KEY) === "true";
  // Mark as visited immediately for smoother reloads
  if (!hasVisitedBefore.value) {
    localStorage.setItem(FIRST_VISIT_KEY, "true");
  }
}

// ============================================================================
// HEAD & SEO
// ============================================================================

useHead({
  title: "Cine Max - Stream Movies & TV Series",
  htmlAttrs: {
    class: "scroll-smooth",
  },
  meta: [
    {
      name: "description",
      content: "Stream your favorite movies and TV series online. Watch anytime, anywhere.",
    },
  ],
});

// ============================================================================
// STATE & DATA
// ============================================================================

const isLoading = ref(true);
const featuredContent = computed(() => getFeaturedContent());
const trendingContent = computed(() => getTrendingContent(15));
const newReleases = computed(() => getNewReleases(15));
const top10Content = computed(() => getTop10());
const continueWatching = computed(() => getContinueWatching(8));

const progressMap: Record<string, number> = {
  "series-2": 65,
  "movie-3": 30,
  "series-4": 80,
  "movie-1": 45,
  "series-7": 20,
  "movie-7": 55,
};

// ============================================================================
// REFS
// ============================================================================

const pageRef = ref<HTMLElement>();
const heroSectionRef = ref<HTMLElement>();
const contentSectionsRef = ref<HTMLElement[]>([]);

// ============================================================================
// EVENT HANDLERS
// ============================================================================

const handlePlay = (content: StreamingContent) => {
  const path =
    content.type === "movie" ? `/movies/${content.id}/watch` : `/tv-series/${content.id}/watch`;
  navigateTo(path);
};

const handleMoreInfo = (content: StreamingContent) => {
  const path = content.type === "movie" ? `/movies/${content.id}` : `/tv-series/${content.id}`;
  navigateTo(path);
};

const handleContentClick = (content: StreamingContent) => {
  const path = content.type === "movie" ? `/movies/${content.id}` : `/tv-series/${content.id}`;
  navigateTo(path);
};

// ============================================================================
// ANIMATIONS
// ============================================================================

// Set up section refs for staggered animation
const setContentSectionRef = (el: unknown) => {
  const element = el as HTMLElement;
  if (element && !contentSectionsRef.value.includes(element)) {
    contentSectionsRef.value.push(element);
  }
};

// Page entrance animation with cinematic reveal
const initPageAnimations = () => {
  if (!gsap) return;

  // Skip entrance animation if visited before - just show content
  if (hasVisitedBefore.value) {
    gsap.set(pageRef.value, { opacity: 1 });
    return;
  }

  // Initial page load animation - only on first visit
  gsap.set(pageRef.value, { opacity: 0 });

  // Create timeline for entrance
  const tl = gsap.timeline({
    defaults: { ease: "power3.out" },
  });

  // Fade in the page
  tl.to(pageRef.value, {
    opacity: 1,
    duration: 0.8,
  });

  // Animate hero section with parallax effect
  if (heroSectionRef.value) {
    tl.from(
      heroSectionRef.value,
      {
        y: -100,
        scale: 1.05,
        duration: 1.2,
        ease: "power2.out",
      },
      0.2,
    );
  }

  // Animate content sections with stagger
  const sections = contentSectionsRef.value.filter(Boolean);
  if (sections.length > 0) {
    gsap.set(sections, {
      opacity: 0,
      y: 60,
    });

    // Create intersection observer for scroll-triggered animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const section = entry.target as HTMLElement;

            gsap.to(section, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power3.out",
              onComplete: () => {
                // Animate internal elements
                const cards = section.querySelectorAll(".media-card, .top10-card");
                if (cards.length > 0) {
                  gsap.fromTo(
                    cards,
                    {
                      opacity: 0,
                      y: 30,
                      scale: 0.95,
                    },
                    {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      duration: 0.5,
                      stagger: 0.05,
                      ease: "back.out(1.7)",
                    },
                  );
                }
              },
            });

            observer.unobserve(section);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px",
      },
    );

    sections.forEach((section) => observer.observe(section));

    // Cleanup on unmount
    onUnmounted(() => {
      observer.disconnect();
    });
  }
};

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(() => {
  // Reduce loading delay for smoother experience
  // Only show loading briefly on first visit for effect, skip on repeat visits
  const loadingDelay = hasVisitedBefore.value ? 100 : 400;

  setTimeout(() => {
    isLoading.value = false;
    nextTick(() => {
      initPageAnimations();
    });
  }, loadingDelay);
});
</script>

<template>
  <div
    ref="pageRef"
    class="min-h-screen bg-neutral-950 overflow-x-hidden"
    :class="{ 'opacity-0': !hasVisitedBefore }"
  >
    <!-- Hero Banner - Full Width -->
    <section ref="heroSectionRef" class="relative w-full">
      <HeroBanner
        v-if="featuredContent.length > 0"
        :content="featuredContent"
        @play="handlePlay"
        @more-info="handleMoreInfo"
      />
    </section>

    <!-- Loading State -->
    <div v-if="isLoading" class="relative z-10 min-h-[50vh] flex items-center justify-center">
      <div class="flex flex-col items-center gap-6">
        <!-- Animated Spinner -->
        <div class="relative">
          <div
            class="w-20 h-20 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"
          />
          <div
            class="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-primary-400/50 rounded-full animate-spin"
            style="animation-duration: 1.5s; animation-direction: reverse"
          />
        </div>
        <!-- Loading Text -->
        <p class="text-neutral-400 text-lg tracking-wide animate-pulse">
          Loading your experience...
        </p>
      </div>
    </div>

    <!-- Main Content - Full Width -->
    <main v-else class="relative w-full">
      <!-- Animated Section Divider -->
      <div class="relative h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent">
        <div
          class="absolute inset-0 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent animate-pulse"
        />
      </div>

      <!-- Continue Watching -->
      <section :ref="setContentSectionRef" class="media-rail-section relative">
        <MediaRail
          v-if="continueWatching.length > 0"
          title="Continue Watching"
          :content="continueWatching"
          size="landscape"
          :show-progress="true"
          :progress-map="progressMap"
          see-all-link="/my-list"
          icon="i-lucide-history"
          @play="handlePlay"
          @click="handleContentClick"
        />
      </section>

      <!-- Trending Now -->
      <section :ref="setContentSectionRef" class="media-rail-section relative">
        <MediaRail
          title="Trending Now"
          :content="trendingContent"
          see-all-link="/trending"
          icon="i-lucide-trending-up"
          @play="handlePlay"
          @click="handleContentClick"
        />
      </section>

      <!-- Top 10 Today - Premium Section -->
      <section
        :ref="setContentSectionRef"
        class="relative py-6 sm:py-8 md:py-12 bg-gradient-to-b from-neutral-950 via-neutral-900/30 to-neutral-950"
      >
        <Top10Section
          v-if="top10Content.length > 0"
          :content="top10Content"
          @play="handlePlay"
          @click="handleContentClick"
        />
      </section>

      <!-- New Releases -->
      <section :ref="setContentSectionRef" class="media-rail-section relative">
        <MediaRail
          title="New Releases"
          :content="newReleases"
          see-all-link="/new"
          icon="i-lucide-sparkles"
          @play="handlePlay"
          @click="handleContentClick"
        />
      </section>

      <!-- Promotional Billboards -->
      <section :ref="setContentSectionRef" class="relative">
        <BillboardsSection />
      </section>

      <!-- Action Movies Rail -->
      <section :ref="setContentSectionRef" class="media-rail-section relative">
        <MediaRail
          title="Action & Adventure"
          :content="trendingContent.filter((c) => c.genres.includes('Action'))"
          icon="i-lucide-flame"
          @play="handlePlay"
          @click="handleContentClick"
        />
      </section>

      <!-- Sci-Fi Rail -->
      <section :ref="setContentSectionRef" class="media-rail-section relative">
        <MediaRail
          title="Sci-Fi & Fantasy"
          :content="
            trendingContent.filter(
              (c) => c.genres.includes('Sci-Fi') || c.genres.includes('Fantasy'),
            )
          "
          icon="i-lucide-rocket"
          @play="handlePlay"
          @click="handleContentClick"
        />
      </section>

      <!-- Drama Rail -->
      <section :ref="setContentSectionRef" class="media-rail-section relative">
        <MediaRail
          title="Drama Series"
          :content="
            trendingContent.filter((c) => c.type === 'series' && c.genres.includes('Drama'))
          "
          size="landscape"
          icon="i-lucide-masks-theater"
          @play="handlePlay"
          @click="handleContentClick"
        />
      </section>
    </main>

    <!-- Bottom Fade -->
    <div
      class="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-neutral-950 to-transparent pointer-events-none z-40"
    />
  </div>
</template>

<style scoped>
/* Smooth scrolling */
:deep(html) {
  scroll-behavior: smooth;
}

/* Custom scrollbar - Premium Style */
:deep(*)::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

:deep(*)::-webkit-scrollbar-track {
  background: #0a0a0a;
}

:deep(*)::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #404040, #303030);
  border-radius: 5px;
  border: 2px solid #0a0a0a;
}

:deep(*)::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #505050, #404040);
}

/* Section transitions */
.media-rail-section {
  transition: transform 0.3s ease;
}

/* Page transitions */
.page-enter-active,
.page-leave-active {
  transition:
    opacity 0.4s ease,
    filter 0.4s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(10px);
}

/* Smooth page fade-in for returning visitors */
#app {
  transition: opacity 0.5s ease-in-out;
}

#app.fade-in {
  opacity: 1 !important;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  :deep(html) {
    scroll-behavior: auto;
  }

  * {
    transition: none !important;
    animation: none !important;
  }
}

/* Ambient background glow */
@keyframes ambient-glow {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.5;
  }
}

/* Performance optimization */
@media (prefers-reduced-motion: no-preference) {
  .media-card {
    will-change: transform;
  }
}
</style>
