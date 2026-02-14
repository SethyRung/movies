<script setup lang="ts">
/**
 * Top10Section Component - Premium Edition
 *
 * Netflix-style Top 10 ranking section with:
 * - Large numbered cards (1-10) with premium styling
 * - Staggered scale effect
 * - Enhanced hover animations with 3D effects
 * - Horizontal scroll with momentum
 * - Animated section header
 * - Golden gradient for top 3
 */

import type { StreamingContent } from "~/data/mockDataEnhanced";

interface Props {
  content: StreamingContent[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  click: [content: StreamingContent];
  play: [content: StreamingContent];
}>();

const { $gsap: gsap } = useNuxtApp();

// Refs
const sectionRef = ref<HTMLElement>();
const titleRef = ref<HTMLElement>();
const trackRef = ref<HTMLElement>();
const cardRefs = ref<HTMLElement[]>([]);
const gsapCtx = ref<ReturnType<typeof gsap.context> | null>(null);

// State
const hoveredIndex = ref<number | null>(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(true);

// Set card refs safely
const setCardRef = (el: unknown, index: number) => {
  const element = el as HTMLElement;
  if (element && !cardRefs.value.includes(element)) {
    cardRefs.value[index] = element;
  }
};

// Get rank styling
const getRankColor = (index: number) => {
  if (index === 0)
    return { bg: "from-yellow-400 to-amber-500", text: "text-yellow-400", stroke: "#fbbf24" };
  if (index === 1)
    return { bg: "from-gray-300 to-gray-400", text: "text-gray-300", stroke: "#d1d5db" };
  if (index === 2)
    return { bg: "from-amber-600 to-amber-700", text: "text-amber-600", stroke: "#92400e" };
  return { bg: "from-neutral-500 to-neutral-600", text: "text-neutral-500", stroke: "#6b7280" };
};

// Event handlers
const handleMouseEnter = (index: number) => {
  hoveredIndex.value = index;
};

const handleMouseLeave = () => {
  hoveredIndex.value = null;
};

const handleClick = (content: StreamingContent) => {
  emit("click", content);
};

const handlePlay = (content: StreamingContent, e: Event) => {
  e.stopPropagation();
  emit("play", content);
};

// Scroll handlers
const scrollLeft = () => {
  if (!trackRef.value) return;
  const scrollAmount = Math.max(trackRef.value.clientWidth * 0.8, 300);
  trackRef.value.scrollBy({ left: -scrollAmount, behavior: "smooth" });
};

const scrollRight = () => {
  if (!trackRef.value) return;
  const scrollAmount = Math.max(trackRef.value.clientWidth * 0.8, 300);
  trackRef.value.scrollBy({ left: scrollAmount, behavior: "smooth" });
};

const checkScroll = () => {
  if (!trackRef.value) return;
  const scrollLeft = trackRef.value.scrollLeft;
  const maxScroll = trackRef.value.scrollWidth - trackRef.value.clientWidth;
  canScrollLeft.value = scrollLeft > 10;
  canScrollRight.value = scrollLeft < maxScroll - 10;
};

// Animate on mount
onMounted(() => {
  if (!gsap || !sectionRef.value) return;

  gsapCtx.value = gsap.context(() => {
    // Animate title
    if (titleRef.value) {
      gsap.fromTo(
        titleRef.value,
        { opacity: 0, x: -30, rotateY: -15 },
        { opacity: 1, x: 0, rotateY: 0, duration: 0.7, ease: "power3.out" },
      );
    }

    // Animate section in
    gsap.fromTo(
      sectionRef.value,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
    );

    // Stagger animate cards with 3D effect
    nextTick(() => {
      const cards = cardRefs.value.filter(Boolean);
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          {
            opacity: 0,
            x: -50,
            y: 30,
            rotateY: -20,
            scale: 0.8,
          },
          {
            opacity: 1,
            x: 0,
            y: 0,
            rotateY: 0,
            scale: (i) => {
              const scaleMap = [1.08, 1.04, 1, 0.96, 0.92, 0.88, 0.84, 0.8, 0.76, 0.72];
              return scaleMap[i] || 1;
            },
            duration: 0.6,
            stagger: 0.1,
            ease: "back.out(1.7)",
            delay: 0.3,
          },
        );
      }
    });
  }, sectionRef.value);

  // Set up scroll listener
  if (trackRef.value) {
    trackRef.value.addEventListener("scroll", checkScroll, { passive: true });
  }
  nextTick(() => checkScroll());
});

// Cleanup
onUnmounted(() => {
  if (gsapCtx.value) {
    gsapCtx.value.revert();
    gsapCtx.value = null;
  }
  cardRefs.value = [];
  if (trackRef.value) {
    trackRef.value.removeEventListener("scroll", checkScroll);
  }
});
</script>

<template>
  <section
    v-if="content.length > 0"
    ref="sectionRef"
    class="relative py-5 sm:py-6 md:py-10 overflow-hidden"
  >
    <!-- Premium Title -->
    <div class="px-2 sm:px-4 md:px-6 lg:px-8 mb-4 sm:mb-6">
      <div ref="titleRef" class="flex items-center gap-4">
        <!-- Trophy Icon with Glow -->
        <div class="relative">
          <div
            class="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 blur-lg opacity-50"
          />
          <div
            class="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-xl"
          >
            <span class="text-2xl sm:text-3xl">🏆</span>
          </div>
        </div>

        <!-- Title -->
        <h2 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
          <span
            class="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 bg-clip-text text-transparent"
          >
            Top 10
          </span>
          <span class="text-white/70 ml-2 text-lg sm:text-xl md:text-2xl font-medium">Today</span>
        </h2>
      </div>
    </div>

    <!-- Scroll Container -->
    <div class="relative group/rail">
      <!-- Left Arrow -->
      <Transition name="arrow-fade">
        <button
          v-if="canScrollLeft"
          class="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-14 sm:w-16 md:w-20 h-full bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent flex items-center justify-start pl-2 sm:pl-4"
          :class="{ 'opacity-0 group-hover/rail:opacity-100': canScrollLeft }"
          aria-label="Scroll left"
          @click="scrollLeft"
        >
          <div class="group/arrow relative">
            <div
              class="absolute inset-0 bg-white/20 blur-md rounded-full opacity-0 group-hover/arrow:opacity-100 transition-opacity"
            />
            <div
              class="relative w-10 h-10 rounded-full bg-neutral-800/90 hover:bg-neutral-700 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-xl border border-neutral-600/50"
            >
              <UIcon name="i-lucide-chevron-left" class="w-5 h-5 text-white" />
            </div>
          </div>
        </button>
      </Transition>

      <!-- Track -->
      <div
        ref="trackRef"
        class="flex gap-2 sm:gap-3 overflow-x-auto px-2 sm:px-4 md:px-6 lg:px-8 pb-4 scrollbar-hide scroll-smooth"
        style="perspective: 1000px"
      >
        <div
          v-for="(item, index) in content.slice(0, 10)"
          :key="item.id"
          :ref="(el) => setCardRef(el, index)"
          class="relative flex-shrink-0 cursor-pointer transition-all duration-500"
          :class="[
            'top10-card',
            index === 0
              ? 'w-[110px] xs:w-[120px] sm:w-[140px] md:w-[180px] lg:w-[200px] xl:w-[240px]'
              : '',
            index === 1
              ? 'w-[100px] xs:w-[110px] sm:w-[130px] md:w-[160px] lg:w-[180px] xl:w-[220px]'
              : '',
            index === 2
              ? 'w-[90px] xs:w-[100px] sm:w-[120px] md:w-[150px] lg:w-[160px] xl:w-[200px]'
              : '',
            index >= 3 && index < 6
              ? 'w-[80px] xs:w-[90px] sm:w-[110px] md:w-[140px] lg:w-[160px] xl:w-[180px]'
              : '',
            index >= 6
              ? 'w-[70px] xs:w-[80px] sm:w-[100px] md:w-[130px] lg:w-[150px] xl:w-[160px]'
              : '',
          ]"
          :style="{
            transform: hoveredIndex === index ? 'scale(1.05) translateY(-8px)' : '',
            transformOrigin: 'bottom center',
            zIndex: hoveredIndex === index ? 10 : 1,
          }"
          @mouseenter="handleMouseEnter(index)"
          @mouseleave="handleMouseLeave"
          @click="handleClick(item)"
        >
          <!-- Poster Container with 3D Effect -->
          <div
            class="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl transition-all duration-500"
            :class="[
              'will-change-transform',
              hoveredIndex === index
                ? 'shadow-[0_20px_60px_-15px_rgba(251,191,36,0.4)]'
                : 'shadow-xl',
            ]"
          >
            <!-- Poster Image -->
            <NuxtImg
              :src="item.poster"
              :alt="item.title"
              width="400"
              height="600"
              loading="lazy"
              format="webp"
              class="w-full h-full object-cover transition-transform duration-700"
              :class="{ 'scale-110': hoveredIndex === index }"
            />

            <!-- Gradient Overlay -->
            <div
              class="absolute inset-0 bg-gradient-to-b from-white/[0.02] via-transparent to-black/40 transition-opacity duration-300"
              :class="{
                'opacity-100': hoveredIndex === index,
                'opacity-80': hoveredIndex !== index,
              }"
            />

            <!-- Rank Number with Premium Styling -->
            <div
              class="absolute bottom-0 left-0 right-0 flex items-end justify-center pb-2 sm:pb-3"
            >
              <div class="relative">
                <!-- Glow effect for top 3 -->
                <div
                  v-if="index < 3"
                  class="absolute inset-0 blur-xl opacity-60"
                  :class="[
                    'bg-gradient-to-r',
                    index === 0 ? 'from-yellow-400 to-amber-500' : '',
                    index === 1 ? 'from-gray-300 to-gray-400' : '',
                    index === 2 ? 'from-amber-600 to-amber-700' : '',
                  ]"
                />
                <span
                  class="relative text-5xl xs:text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-transparent bg-clip-text"
                  :style="{
                    WebkitTextStroke: '2.5px white',
                    WebkitTextStrokeColor: getRankColor(index).stroke,
                    textShadow: index < 3 ? `0 0 30px ${getRankColor(index).stroke}80` : 'none',
                  }"
                >
                  {{ index + 1 }}
                </span>
              </div>
            </div>

            <!-- Hover Overlay with Play Button -->
            <Transition name="hover-overlay">
              <div
                v-if="hoveredIndex === index"
                class="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm"
              >
                <div class="transform transition-all duration-300">
                  <UButton
                    size="lg"
                    color="white"
                    variant="solid"
                    icon="i-lucide-play"
                    class="w-14 h-14 sm:w-16 sm:h-16 bg-white text-black hover:bg-neutral-200 rounded-full shadow-2xl"
                    aria-label="Play"
                    @click="(e) => handlePlay(item, e)"
                  />
                </div>
              </div>
            </Transition>

            <!-- New Badge -->
            <div
              v-if="item.newRelease"
              class="absolute top-2 left-2 px-2 py-1 rounded-lg bg-red-600/90 backdrop-blur-sm text-white text-xs font-semibold shadow-lg"
            >
              NEW
            </div>

            <!-- Rank Badge on Top -->
            <div
              class="absolute top-2 right-2 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base shadow-lg"
              :class="[
                'bg-gradient-to-br',
                getRankColor(index).bg,
                'text-white border-2 border-white/30',
              ]"
            >
              #{{ index + 1 }}
            </div>
          </div>
        </div>

        <!-- Spacer -->
        <div class="w-6 sm:w-8 md:w-10 flex-shrink-0" />
      </div>

      <!-- Right Arrow -->
      <Transition name="arrow-fade">
        <button
          v-if="canScrollRight"
          class="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-14 sm:w-16 md:w-20 h-full bg-gradient-to-l from-neutral-950 via-neutral-950/80 to-transparent flex items-center justify-end pr-2 sm:pr-4"
          :class="{ 'opacity-0 group-hover/rail:opacity-100': canScrollRight }"
          aria-label="Scroll right"
          @click="scrollRight"
        >
          <div class="group/arrow relative">
            <div
              class="absolute inset-0 bg-white/20 blur-md rounded-full opacity-0 group-hover/arrow:opacity-100 transition-opacity"
            />
            <div
              class="relative w-10 h-10 rounded-full bg-neutral-800/90 hover:bg-neutral-700 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-xl border border-neutral-600/50"
            >
              <UIcon name="i-lucide-chevron-right" class="w-5 h-5 text-white" />
            </div>
          </div>
        </button>
      </Transition>
    </div>
  </section>
</template>

<style scoped>
/* Custom breakpoint for extra small screens */
@media (min-width: 375px) {
  .xs\:block {
    display: block;
  }
}

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

/* Hover overlay transition */
.hover-overlay-enter-active,
.hover-overlay-leave-active {
  transition: all 0.3s ease;
}

.hover-overlay-enter-from,
.hover-overlay-leave-to {
  opacity: 0;
}

.hover-overlay-enter-from div,
.hover-overlay-leave-to div {
  transform: scale(0.8);
}

/* 3D card hover effect */
.top10-card {
  transform-style: preserve-3d;
  will-change: transform;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .top10-card {
    transition: none !important;
    transform: none !important;
  }

  .hover-overlay-enter-active,
  .hover-overlay-leave-active {
    transition: none;
  }
}

/* Glow animations */
@keyframes pulse-glow {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}
</style>
