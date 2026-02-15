<script setup lang="ts">
const { $gsap: gsap } = useNuxtApp();

const hoverAnimations = ref<Map<HTMLElement, GSAPTween>>(new Map());

interface GenreWithColor {
  id: string;
  name: string;
  description: string;
  gradient: string;
  icon: string;
  itemCount: number;
}

const genres = ref<GenreWithColor[]>([
  {
    id: "action",
    name: "Action",
    description: "Adrenaline-pumping adventures",
    gradient: "from-red-500 to-orange-600",
    icon: "i-lucide-sword",
    itemCount: 234,
  },
  {
    id: "comedy",
    name: "Comedy",
    description: "Laugh out loud moments",
    gradient: "from-yellow-400 to-orange-500",
    icon: "i-lucide-smile",
    itemCount: 189,
  },
  {
    id: "drama",
    name: "Drama",
    description: "Captivating emotional stories",
    gradient: "from-blue-500 to-indigo-600",
    icon: "i-lucide-masks-theatrical",
    itemCount: 312,
  },
  {
    id: "horror",
    name: "Horror",
    description: "Spine-tingling thrills",
    gradient: "from-gray-700 to-gray-900",
    icon: "i-lucide-ghost",
    itemCount: 145,
  },
  {
    id: "sci-fi",
    name: "Sci-Fi",
    description: "Futuristic worlds & technology",
    gradient: "from-cyan-500 to-blue-600",
    icon: "i-lucide-rocket",
    itemCount: 178,
  },
  {
    id: "romance",
    name: "Romance",
    description: "Love stories & heartwarming tales",
    gradient: "from-pink-400 to-rose-600",
    icon: "i-lucide-heart",
    itemCount: 156,
  },
  {
    id: "thriller",
    name: "Thriller",
    description: "Edge-of-your-seat suspense",
    gradient: "from-purple-500 to-violet-700",
    icon: "i-lucide-bolt",
    itemCount: 201,
  },
  {
    id: "animation",
    name: "Animation",
    description: "Magical worlds for all ages",
    gradient: "from-green-400 to-emerald-600",
    icon: "i-lucide-wand-2",
    itemCount: 134,
  },
  {
    id: "documentary",
    name: "Documentary",
    description: "Real stories & insights",
    gradient: "from-amber-500 to-yellow-700",
    icon: "i-lucide-film",
    itemCount: 98,
  },
  {
    id: "fantasy",
    name: "Fantasy",
    description: "Magical realms & creatures",
    gradient: "from-violet-500 to-purple-700",
    icon: "i-lucide-sparkles",
    itemCount: 167,
  },
]);

const sectionRef = ref<HTMLElement>();
const cardRefs = ref<HTMLElement[]>([]);
const gsapCtx = ref<ReturnType<typeof gsap.context> | null>(null);

const setCardRef = (el: unknown) => {
  const element = el as HTMLElement;
  if (element && !cardRefs.value.includes(element)) {
    cardRefs.value.push(element);
  }
};

const animateCardHover = (element: HTMLElement | null, entering: boolean) => {
  if (!element || !gsap) return;

  const existing = hoverAnimations.value.get(element);
  if (existing) {
    existing.kill();
  }

  const tween = gsap.to(element, {
    scale: entering ? 1.05 : 1,
    y: entering ? -5 : 0,
    duration: 0.3,
    ease: "power2.out",
  });

  hoverAnimations.value.set(element, tween);
};

onMounted(() => {
  if (!gsap) {
    console.warn("GSAP plugin not available, skipping animations");
    return;
  }

  gsapCtx.value = gsap.context();

  nextTick(() => {
    if (sectionRef.value) {
      const title = sectionRef.value.querySelector(".section-title");
      if (title) {
        gsap.fromTo(
          title,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
        );
      }
    }

    if (cardRefs.value.length > 0) {
      gsap.fromTo(
        cardRefs.value,
        { opacity: 0, y: 30, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.05,
          ease: "power2.out",
        }
      );
    }
  });
});

onUnmounted(() => {
  hoverAnimations.value.forEach((tween) => tween.kill());
  hoverAnimations.value.clear();

  if (gsapCtx.value) {
    gsapCtx.value.revert();
    gsapCtx.value = null;
  }

  cardRefs.value = [];
});
</script>

<template>
  <section ref="sectionRef" class="relative py-12 md:py-16 overflow-hidden">
    <div
      class="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background"
    />
    <div
      class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.1),transparent_50%)]"
    />

    <div class="relative container mx-auto px-4 md:px-8 lg:px-12">
      <div class="section-title mb-8 md:mb-12">
        <div class="flex items-center gap-2 mb-2">
          <UIcon name="i-lucide-compass" class="w-5 h-5 text-primary-500" />
          <h2 class="text-2xl md:text-3xl lg:text-4xl font-bold">
            Browse by
            <span
              class="bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
            >
              Category
            </span>
          </h2>
        </div>
        <p class="text-muted-foreground max-w-2xl">
          Find exactly what you're looking for with our curated genre collections.
        </p>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        <NuxtLink
          v-for="genre in genres"
          :key="genre.id"
          :ref="setCardRef"
          :to="`/movies?genre=${genre.id}`"
          class="group relative overflow-hidden rounded-xl p-4 md:p-6 cursor-pointer"
          :class="`bg-gradient-to-br ${genre.gradient}`"
          @mouseenter="animateCardHover($event.currentTarget as HTMLElement, true)"
          @mouseleave="animateCardHover($event.currentTarget as HTMLElement, false)"
        >
          <div class="absolute inset-0 opacity-20">
            <div
              class="absolute inset-0"
              style="
                background-image: radial-gradient(circle, white 1px, transparent 1px);
                background-size: 10px 10px;
              "
            />
          </div>

          <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          <div class="relative z-10">
            <div class="mb-3 flex items-center justify-between">
              <div
                class="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center"
              >
                <UIcon :name="genre.icon" class="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div
                class="text-xs text-white/80 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full"
              >
                {{ genre.itemCount }}
              </div>
            </div>

            <h3
              class="text-lg md:text-xl font-bold text-white mb-1 group-hover:text-white transition-colors"
            >
              {{ genre.name }}
            </h3>

            <p class="text-xs md:text-sm text-white/80 line-clamp-2">
              {{ genre.description }}
            </p>
          </div>

          <div
            class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />

          <div
            class="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />
        </NuxtLink>
      </div>

      <div class="mt-8 text-center">
        <UButton to="/genres" size="lg" color="neutral" variant="ghost" class="gap-2">
          <template #leading>
            <UIcon name="i-lucide-grid" class="w-5 h-5" />
          </template>
          View All Genres
          <template #trailing>
            <UIcon name="i-lucide-arrow-right" class="w-4 h-4" />
          </template>
        </UButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (prefers-reduced-motion: reduce) {
  .group-hover\:translate-x-\[100\%] {
    transition: none;
  }
}
</style>
