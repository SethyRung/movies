<script setup lang="ts">
import gsap from "gsap";

import type { StreamingContent } from "~/data/mockDataEnhanced";

const props = defineProps<{
  content: StreamingContent;
}>();

const year = computed(() =>
  props.content.type === "movie" ? props.content.releaseYear : props.content.firstAiredYear,
);

const imageRef = useTemplateRef("imageRef");
const overlayRef = useTemplateRef("overlayRef");
const playButtonRef = useTemplateRef("playButtonRef");
const yearRef = useTemplateRef("yearRef");
const ratingRef = useTemplateRef("ratingRef");

const imageError = ref(false);

function onEnter() {
  gsap.to(imageRef.value, {
    scale: 1.1,
    duration: 0.5,
    ease: "power2.out",
  });

  gsap.to(overlayRef.value, {
    opacity: 1,
    ease: "power2.out",
  });

  gsap.to(playButtonRef.value, {
    scale: 1,
    ease: "power2.out",
  });

  gsap.to([yearRef.value, ratingRef.value], {
    opacity: 1,
    y: 0,
    ease: "power2.out",
  });
}

function onLeave() {
  gsap.to(imageRef.value, {
    scale: 1,
    duration: 0.5,
    ease: "power2.out",
  });

  gsap.to(overlayRef.value, {
    opacity: 0,
    ease: "power2.out",
  });

  gsap.to(playButtonRef.value, {
    scale: 0,
    ease: "power2.out",
  });

  gsap.to([yearRef.value, ratingRef.value], {
    opacity: 0,
    y: -10,
    ease: "power2.out",
  });
}

onUnmounted(() => {
  gsap.killTweensOf([
    imageRef.value,
    overlayRef.value,
    playButtonRef.value,
    yearRef.value,
    ratingRef.value,
  ]);
});
</script>

<template>
  <div
    ref="cardRef"
    class="relative cursor-pointer rounded-lg overflow-hidden"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
  >
    <div ref="imageRef" class="size-full">
      <NuxtImg
        v-if="!imageError"
        :src="content.poster"
        :alt="content.title"
        class="size-full object-cover"
        loading="lazy"
        @error="() => (imageError = true)"
      />

      <div v-else class="size-full bg-muted flex flex-col items-center justify-center gap-2">
        <UIcon name="i-mdi:movie-open" class="size-16 text-toned" />
        <span class="font-semibold">{{ content.title }}</span>
      </div>
    </div>

    <div ref="overlayRef" class="size-full absolute top-0 left-0 bg-accented/50 opacity-0"></div>

    <div
      ref="yearRef"
      class="absolute top-2 left-2 px-2 py-1 bg-black/70 rounded text-white text-sm font-medium opacity-0 -translate-y-2"
    >
      {{ year }}
    </div>

    <div
      ref="ratingRef"
      class="absolute top-2 right-2 px-2 py-1 bg-black/70 rounded text-white text-sm font-medium opacity-0 -translate-y-2 flex items-center gap-1"
    >
      <UIcon name="i-mdi:star" class="size-4 text-yellow-400" />
      {{ content.rating.toFixed(1) }}
    </div>

    <div
      ref="playButtonRef"
      class="size-full absolute top-0 left-0 flex items-center justify-center scale-0"
    >
      <UButton
        icon="i-mdi:play"
        size="xl"
        color="neutral"
        :ui="{
          base: 'rounded-full p-3',
          leadingIcon: 'size-8',
        }"
        :to="
          props.content.type === 'movie'
            ? `/movies/${props.content.id}`
            : `/tv-series/${props.content.id}`
        "
      />
    </div>
  </div>
</template>
