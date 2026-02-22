<script setup lang="ts">
import { titleCase } from "scule";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

import type { StreamingContent } from "~/data/mockDataEnhanced";

const props = defineProps<{
  content: StreamingContent[];
}>();

const sectionRef = useTemplateRef("sectionRef");
const slideRefs = useTemplateRef("slideRefs");
const activeIndex = ref(0);
const isAnimating = ref(false);

const totalItems = computed(() => props.content.length);

function getDurationText(item: StreamingContent): string {
  if (item.type === "movie") {
    const hours = Math.floor(item.duration / 60);
    const mins = item.duration % 60;
    return `${hours}h ${mins}m`;
  }
  return `${item.seasons} Season${item.seasons > 1 ? "s" : ""}`;
}

const { x: mouseX, y: mouseY } = useMouseInElement(sectionRef);

let xTo: ReturnType<typeof gsap.quickTo> | null = null;
let yTo: ReturnType<typeof gsap.quickTo> | null = null;

watch([mouseX, mouseY], () => {
  if (!sectionRef.value || !xTo || !yTo) return;

  const centerX = sectionRef.value.clientWidth;
  const centerY = sectionRef.value.clientHeight;
  const deltaX = (mouseX.value - centerX) / centerX;
  const deltaY = (mouseY.value - centerY) / centerY;

  xTo(deltaX * 15);
  yTo(deltaY * 15);
});

function animateIn(slideEl: HTMLElement | undefined): void {
  if (!slideEl) return;

  isAnimating.value = true;

  gsap.set(slideEl, { opacity: 1 });

  const title = slideEl.querySelector(".animate-title");
  const meta = slideEl.querySelector(".animate-meta");
  const description = slideEl.querySelector(".animate-description");
  const buttons = slideEl.querySelector(".animate-buttons");
  const bgImage = slideEl.querySelector(".animate-bg");

  if (bgImage) {
    gsap.fromTo(
      bgImage,
      { scale: 1.25, filter: "brightness(0.85) saturate(1.1)" },
      { scale: 1.1, filter: "brightness(1.15) saturate(1.2)", duration: 2, ease: "power2.out" },
    );
  }

  const tl = gsap.timeline({
    onComplete: () => {
      isAnimating.value = false;
    },
  });

  if (title) {
    tl.fromTo(
      title,
      { y: 60, opacity: 0, rotationX: 15 },
      { y: 0, opacity: 1, rotationX: 0, duration: 1, ease: "power3.out" },
      0.3,
    );
  }

  if (meta) {
    const badges = meta.querySelectorAll(".meta-badge");
    if (badges.length > 0) {
      tl.fromTo(
        badges,
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "power2.out" },
        0.6,
      );
    }
  }

  if (description) {
    const split = new SplitText(description, { type: "words" });
    tl.fromTo(
      split.words,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.02, ease: "power2.out" },
      0.75,
    );
  }

  if (buttons) {
    tl.fromTo(
      buttons,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "back.out(1.7)" },
      0.85,
    );
  }
}

function animateOut(slideEl: HTMLElement | undefined, callback: () => void): void {
  if (!slideEl) {
    callback();
    return;
  }

  const title = slideEl.querySelector(".animate-title");
  const meta = slideEl.querySelector(".animate-meta");
  const description = slideEl.querySelector(".animate-description");
  const buttons = slideEl.querySelector(".animate-buttons");
  const bgImage = slideEl.querySelector(".animate-bg");

  const tl = gsap.timeline({ onComplete: callback });

  if (title) {
    tl.to(title, { y: -30, opacity: 0, duration: 0.4, ease: "power2.in" }, 0);
  }

  if (meta) {
    const badges = meta.querySelectorAll(".meta-badge");
    if (badges.length > 0) {
      tl.to(badges, { y: -20, opacity: 0, duration: 0.35, stagger: 0.03, ease: "power2.in" }, 0.05);
    }
  }

  if (description) {
    const split = new SplitText(description, { type: "words" });
    tl.to(
      split.words,
      { y: -15, opacity: 0, duration: 0.3, stagger: 0.015, ease: "power2.in" },
      0.1,
    );
  }

  if (buttons) {
    tl.to(
      buttons,
      {
        y: -20,
        opacity: 0,
        duration: 0.35,
        ease: "power2.in",
      },
      0.15,
    );
  }

  if (bgImage) {
    tl.to(
      bgImage,
      { scale: 1.2, filter: "brightness(0.7) saturate(1)", duration: 0.5, ease: "power2.in" },
      0,
    );
  }

  tl.to(slideEl, { opacity: 0, duration: 0.3, ease: "power2.in" }, 0.2);
}

async function goToSlide(index: number): Promise<void> {
  if (isAnimating.value || index === activeIndex.value) return;

  isAnimating.value = true;
  const slides = slideRefs.value;
  const currentSlide = slides?.[activeIndex.value];

  await new Promise<void>((resolve) => {
    animateOut(currentSlide, resolve);
  });

  activeIndex.value = index;

  await nextTick();

  const newSlide = slides?.[index];
  animateIn(newSlide);
}

function prev(): void {
  const prevIndex = (activeIndex.value - 1 + totalItems.value) % totalItems.value;
  goToSlide(prevIndex);
}

function next(): void {
  const nextIndex = (activeIndex.value + 1) % totalItems.value;
  goToSlide(nextIndex);
}

function scrollTo(index: number): void {
  goToSlide(index);
}

defineShortcuts({
  arrowleft: () => prev(),
  arrowright: () => next(),
});

onMounted(() => {
  const slides = slideRefs.value;
  if (!slides) return;

  gsap.set(slides, { opacity: 0 });

  xTo = gsap.quickTo(".animate-bg", "x", { duration: 1, ease: "power2.out" });
  yTo = gsap.quickTo(".animate-bg", "y", { duration: 1, ease: "power2.out" });

  animateIn(slides[0]);
});

onUnmounted(() => {
  gsap.killTweensOf(slideRefs.value);
});
</script>

<template>
  <section ref="sectionRef" class="relative w-full h-screen overflow-hidden bg-neutral-950">
    <div
      v-for="item in content"
      :key="item.id"
      ref="slideRefs"
      class="h-full absolute inset-0 opacity-0"
    >
      <div class="absolute inset-0">
        <div
          v-if="item"
          class="animate-bg absolute inset-0 bg-cover bg-center will-change-transform"
          :style="{
            backgroundImage: `url('${item.backdrop}')`,
          }"
        ></div>

        <div
          class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.25)_60%,rgba(0,0,0,0.5)_100%)]"
        ></div>

        <div
          class="absolute inset-0 bg-linear-to-r from-neutral-950/90 via-neutral-950/60 via-50% to-transparent md:via-neutral-950/45 md:via-40% lg:via-neutral-950/30 lg:via-30%"
        ></div>

        <div
          class="absolute inset-0 bg-linear-to-t from-neutral-950 via-neutral-950/30 to-transparent via-75%"
        ></div>

        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            class="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-500/15 rounded-full blur-[100px]"
          ></div>
          <div
            class="absolute bottom-1/4 left-1/3 w-80 h-80 bg-purple-500/15 rounded-full blur-[80px]"
          ></div>
          <div
            class="absolute top-1/2 left-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-[90px]"
          ></div>
        </div>
      </div>

      <UContainer class="h-full relative z-10 flex flex-col justify-center">
        <div class="lg:max-w-3xl">
          <h1
            class="animate-title text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight"
            style="text-shadow: 0 4px 30px rgba(0, 0, 0, 0.5)"
          >
            {{ item.title }}
          </h1>

          <div
            class="animate-meta flex flex-wrap items-center gap-3 my-4 text-white text-sm font-medium"
          >
            <UBadge class="meta-badge" :label="titleCase(item.type)" size="md" variant="subtle" />

            <span class="meta-badge text-white/30">•</span>

            <span class="meta-badge">
              {{ item.type === "movie" ? item.releaseYear : item.firstAiredYear }}
            </span>

            <span class="meta-badge text-white/30">•</span>

            <span class="meta-badge">{{ getDurationText(item) }}</span>

            <span class="meta-badge text-white/30">•</span>

            <span class="meta-badge text-yellow-400">
              {{ item.rating }}
            </span>
          </div>

          <p
            class="animate-description text-sm sm:text-base md:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 md:mb-10 line-clamp-2 sm:line-clamp-3 max-w-full sm:max-w-md md:max-w-xl lg:max-w-2xl leading-relaxed drop-shadow-lg"
          >
            {{ item.description }}
          </p>

          <div class="animate-buttons flex items-center gap-4">
            <UButton icon="i-lucide-play" label="Play" size="xl" class="hover:scale-110" />

            <UButton
              icon="i-lucide-info"
              label="More Info"
              size="xl"
              color="neutral"
              variant="ghost"
              class="bg-muted hover:scale-110"
            />
          </div>
        </div>

        <UContainer
          class="flex items-center justify-center sm:justify-end absolute left-0 bottom-8"
        >
          <div class="flex items-center gap-2">
            <UButton
              icon="i-lucide-chevron-left"
              color="neutral"
              variant="ghost"
              :disabled="isAnimating"
              class="bg-neutral-900/90 hover:bg-neutral-800 backdrop-blur-md border border-neutral-600/50 rounded-full shadow-xl transition-all duration-300 hover:scale-110"
              @click="prev()"
            />

            <div
              class="flex items-center bg-neutral-900/60 backdrop-blur-md rounded-full px-3 py-2 border border-neutral-700/50"
            >
              <button
                v-for="(_, index) in totalItems"
                :key="index"
                :data-active="index === activeIndex || undefined"
                class="w-8 h-2 rounded-full transition-transform duration-500 bg-accented hover:bg-default/50 data-active:bg-linear-to-r data-active:from-primary-500 data-active:to-primary-400 data-active:shadow-lg data-active:shadow-primary-500/50 scale-x-25 data-active:scale-x-100"
                @click="scrollTo(index)"
              />
            </div>

            <UButton
              icon="i-lucide-chevron-right"
              color="neutral"
              variant="ghost"
              :disabled="isAnimating"
              class="bg-neutral-900/90 hover:bg-neutral-800 backdrop-blur-md border border-neutral-600/50 rounded-full shadow-xl transition-all duration-300 hover:scale-110"
              @click="next()"
            />
          </div>
        </UContainer>
      </UContainer>
    </div>
  </section>
</template>
