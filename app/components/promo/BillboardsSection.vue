<script setup lang="ts">
import type { StreamingContent } from "~/data/mockDataEnhanced";

interface Billboard {
  id: string;
  title: string;
  description: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  badge?: string;
  endDate?: string;
}

interface Props {
  billboards?: Billboard[];
}

const props = withDefaults(defineProps<Props>(), {
  billboards: () => [
    {
      id: "promo-1",
      title: "Stream Premium Originals",
      description: "Exclusive content you won't find anywhere else. Start your free trial today.",
      image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&h=400&fit=crop",
      ctaText: "Start Free Trial",
      ctaLink: "/signup",
      badge: "Limited Time Offer",
    },
  ],
});

const { $gsap: gsap } = useNuxtApp();

// State
const timeLeft = ref({ days: 7, hours: 23, minutes: 59, seconds: 59 });

// Refs for cleanup
const countdownInterval = ref<ReturnType<typeof setInterval> | null>(null);
const observer = ref<IntersectionObserver | null>(null);
const billboardRefs = ref<HTMLElement[]>([]);

// Set billboard refs
const setBillboardRef = (el: unknown, index: number) => {
  const element = el as HTMLElement;
  if (element && !billboardRefs.value.includes(element)) {
    billboardRefs.value[index] = element;
  }
};

// Countdown timer with animated digits
const updateCountdown = () => {
  const now = new Date();
  const end = new Date();
  end.setDate(now.getDate() + 7);
  end.setHours(23, 59, 59, 999);

  const diff = end.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  timeLeft.value = { days, hours, minutes, seconds };
};

// Animate on mount with intersection observer
onMounted(() => {
  // Update countdown every second
  countdownInterval.value = setInterval(updateCountdown, 1000);
  updateCountdown();

  // Animate billboards on scroll
  observer.value = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && gsap) {
          const content = entry.target.querySelector(".billboard-content");
          if (content) {
            gsap.fromTo(
              content,
              { opacity: 0, y: 40, scale: 0.95 },
              { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" },
            );
          }

          // Animate badge
          const badge = entry.target.querySelector(".billboard-badge");
          if (badge) {
            gsap.fromTo(
              badge,
              { opacity: 0, x: -20, rotateY: -90 },
              { opacity: 1, x: 0, rotateY: 0, duration: 0.6, delay: 0.2, ease: "back.out(1.7)" },
            );
          }

          // Animate button
          const button = entry.target.querySelector(".billboard-button");
          if (button) {
            gsap.fromTo(
              button,
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0, duration: 0.5, delay: 0.4, ease: "power2.out" },
            );
          }

          observer.value?.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 },
  );

  nextTick(() => {
    const billboards = document.querySelectorAll(".billboard-item");
    billboards.forEach((b) => observer.value?.observe(b));
  });
});

onUnmounted(() => {
  // Cleanup countdown
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value);
    countdownInterval.value = null;
  }

  // Cleanup observer
  observer.value?.disconnect();
  observer.value = null;
});
</script>

<template>
  <section class="py-6 sm:py-8 md:py-12 overflow-hidden">
    <!-- Section Title -->
    <div class="px-2 sm:px-4 md:px-6 lg:px-8 mb-4 sm:mb-6">
      <div class="flex items-center gap-3">
        <!-- Sparkle Icon -->
        <div class="relative">
          <div
            class="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 blur-lg opacity-40"
          />
          <div
            class="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg"
          >
            <UIcon name="i-lucide-sparkles" class="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
        </div>

        <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-white">Featured</h2>
      </div>
    </div>

    <!-- Billboards Container -->
    <div
      class="flex gap-4 sm:gap-6 overflow-x-auto px-2 sm:px-4 md:px-6 lg:px-8 pb-4 scrollbar-hide"
    >
      <div
        v-for="(billboard, index) in props.billboards"
        :key="billboard.id"
        :ref="(el) => setBillboardRef(el, index)"
        class="billboard-item relative flex-shrink-0 w-full min-w-[300px] xs:min-w-[350px] sm:min-w-[450px] md:w-[650px] lg:w-[750px] h-[180px] xs:h-[200px] sm:h-[240px] md:h-[300px] rounded-2xl overflow-hidden group cursor-pointer"
        @click="navigateTo(billboard.ctaLink)"
      >
        <!-- Background Image with Zoom Effect -->
        <div
          class="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
          :style="{ backgroundImage: `url('${billboard.image}')` }"
        />

        <!-- Multi-layer Gradient Overlays -->
        <div class="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/30" />
        <div
          class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
        />

        <!-- Animated Gradient Border on Hover -->
        <div
          class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        >
          <div
            class="absolute inset-0 bg-gradient-to-r from-primary-500/40 via-purple-500/40 to-pink-500/40 mix-blend-overlay"
          />
        </div>

        <!-- Content -->
        <div
          class="billboard-content relative z-10 h-full flex flex-col justify-center p-6 sm:p-8 md:p-10 lg:p-12"
        >
          <!-- Badge -->
          <Transition name="badge-pop">
            <UBadge
              v-if="billboard.badge"
              variant="subtle"
              color="primary"
              size="md"
              class="billboard-badge w-fit mb-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white border-0 text-xs sm:text-sm shadow-lg shadow-primary-500/30"
            >
              <span class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                {{ billboard.badge }}
              </span>
            </UBadge>
          </Transition>

          <!-- Title -->
          <h3
            class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 drop-shadow-xl"
          >
            {{ billboard.title }}
          </h3>

          <!-- Description -->
          <p
            class="text-white/90 text-sm sm:text-base md:text-lg mb-5 sm:mb-6 line-clamp-2 max-w-full sm:max-w-lg drop-shadow-lg"
          >
            {{ billboard.description }}
          </p>

        </div>

        <!-- Countdown (if applicable) -->
        <div
          v-if="billboard.endDate"
          class="absolute top-4 sm:top-6 right-4 sm:right-6 flex gap-2 sm:gap-3 bg-black/70 backdrop-blur-xl rounded-2xl px-4 py-3 sm:px-5 sm:py-4 border border-white/10 shadow-2xl"
        >
          <!-- Days -->
          <div class="text-center min-w-[50px]">
            <div class="relative">
              <div
                class="absolute inset-0 bg-gradient-to-br from-primary-500 to-purple-500 blur-lg opacity-30"
              />
              <div
                class="relative text-xl sm:text-2xl md:text-3xl font-bold text-white tabular-nums"
              >
                {{ String(timeLeft.days).padStart(2, "0") }}
              </div>
            </div>
            <div class="text-[10px] sm:text-xs text-white/60 uppercase tracking-wider mt-1">
              Days
            </div>
          </div>

          <div class="text-white/40 self-center text-lg">:</div>

          <!-- Hours -->
          <div class="text-center min-w-[50px]">
            <div class="relative">
              <div
                class="absolute inset-0 bg-gradient-to-br from-primary-500 to-purple-500 blur-lg opacity-30"
              />
              <div
                class="relative text-xl sm:text-2xl md:text-3xl font-bold text-white tabular-nums"
              >
                {{ String(timeLeft.hours).padStart(2, "0") }}
              </div>
            </div>
            <div class="text-[10px] sm:text-xs text-white/60 uppercase tracking-wider mt-1">
              Hrs
            </div>
          </div>

          <div class="text-white/40 self-center text-lg hidden sm:block">:</div>

          <!-- Minutes (hidden on very small screens) -->
          <div class="text-center min-w-[50px] hidden sm:block">
            <div class="relative">
              <div
                class="absolute inset-0 bg-gradient-to-br from-primary-500 to-purple-500 blur-lg opacity-30"
              />
              <div
                class="relative text-xl sm:text-2xl md:text-3xl font-bold text-white tabular-nums"
              >
                {{ String(timeLeft.minutes).padStart(2, "0") }}
              </div>
            </div>
            <div class="text-[10px] sm:text-xs text-white/60 uppercase tracking-wider mt-1">
              Mins
            </div>
          </div>
        </div>

        <!-- Shimmer Effect on Hover -->
        <div
          class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Scrollbar hide */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Line clamp */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Shimmer animation */
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 1.5s ease-out;
}

/* Badge pop animation */
.badge-pop-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.badge-pop-leave-active {
  transition: all 0.2s ease-in;
}

.badge-pop-enter-from {
  opacity: 0;
  transform: translateX(-20px) rotateY(-90deg);
}

.badge-pop-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-shimmer {
    animation: none;
  }

  .badge-pop-enter-active,
  .badge-pop-leave-active {
    transition: none;
  }

  .billboard-item {
    transition: none !important;
  }
}

/* Tabular nums for countdown */
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
