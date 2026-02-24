<script setup lang="ts">
import type { StreamingContent } from "~/data/mockDataEnhanced";
import {
  getFeaturedContent,
  getTrendingContent,
  getNewReleases,
  getTop10,
  getContinueWatching,
} from "~/data/mockDataEnhanced";

const { $gsap: gsap } = useNuxtApp();

const hasVisitedBefore = ref(false);
const FIRST_VISIT_KEY = "cine-max-home-visited";

if (import.meta.client) {
  hasVisitedBefore.value = localStorage.getItem(FIRST_VISIT_KEY) === "true";
  if (!hasVisitedBefore.value) {
    localStorage.setItem(FIRST_VISIT_KEY, "true");
  }
}

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

const pageRef = ref<HTMLElement>();
const heroSectionRef = ref<HTMLElement>();
const contentSectionsRef = ref<HTMLElement[]>([]);

const handlePlay = (content: StreamingContent) => {
  const path = content.type === "movie" ? `/movies/${content.id}` : `/tv-series/${content.id}`;
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

const setContentSectionRef = (el: unknown) => {
  const element = el as HTMLElement;
  if (element && !contentSectionsRef.value.includes(element)) {
    contentSectionsRef.value.push(element);
  }
};

const initPageAnimations = () => {
  if (!gsap) return;

  if (hasVisitedBefore.value) {
    gsap.set(pageRef.value, { opacity: 1 });
    return;
  }

  gsap.set(pageRef.value, { opacity: 0 });

  const tl = gsap.timeline({
    defaults: { ease: "power3.out" },
  });

  tl.to(pageRef.value, {
    opacity: 1,
    duration: 0.8,
  });

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

  const sections = contentSectionsRef.value.filter(Boolean);
  if (sections.length > 0) {
    gsap.set(sections, {
      opacity: 0,
      y: 60,
    });

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

    onUnmounted(() => {
      observer.disconnect();
    });
  }
};

onMounted(() => {
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
    <section ref="heroSectionRef" class="relative w-full">
      <HeroBanner
        v-if="featuredContent.length > 0"
        :content="featuredContent"
        @play="handlePlay"
        @more-info="handleMoreInfo"
      />
    </section>

    <div v-if="isLoading" class="relative z-10 min-h-[50vh] flex items-center justify-center">
      <div class="flex flex-col items-center gap-6">
        <div class="relative">
          <div
            class="w-20 h-20 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin motion-reduce:animate-none"
          />
          <div
            class="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-primary-400/50 rounded-full animate-[spin_1.5s_linear_reverse] motion-reduce:animate-none"
          />
        </div>
        <p class="text-neutral-400 text-lg tracking-wide animate-pulse motion-reduce:animate-none">
          Loading your experience...
        </p>
      </div>
    </div>

    <main v-else class="relative w-full">
      <div class="relative h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent">
        <div
          class="absolute inset-0 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent animate-pulse"
        />
      </div>

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

      <section :ref="setContentSectionRef" class="relative">
        <BillboardsSection />
      </section>

      <section :ref="setContentSectionRef" class="media-rail-section relative">
        <MediaRail
          title="Action & Adventure"
          :content="trendingContent.filter((c) => c.genres.includes('Action'))"
          icon="i-lucide-flame"
          @play="handlePlay"
          @click="handleContentClick"
        />
      </section>

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

    <div
      class="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-neutral-950 to-transparent pointer-events-none z-40"
    />
  </div>
</template>
