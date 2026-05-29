<script setup lang="ts">
import gsap from "gsap";

const props = defineProps<{
  content: Movie | TVSeries;
  progressPercent?: number;
}>();

const imgSrc = computed(() => props.content.poster || props.content.thumbnail);

const year = computed(() =>
  isMovie(props.content) ? props.content.releaseYear : props.content.firstAiredYear,
);

const formattedRating = computed(() => {
  if (!props.content.rating) return null;
  return Number(props.content.rating).toFixed(1);
});

const imageRef = useTemplateRef("imageRef");
const overlayRef = useTemplateRef("overlayRef");
const borderRef = useTemplateRef("borderRef");
const ratingBadgeRef = useTemplateRef("ratingBadgeRef");

const imageError = ref(false);

function onEnter() {
  gsap.to(imageRef.value, {
    scale: 1.05,
    duration: 0.7,
    ease: "power2.out",
  });

  gsap.to(overlayRef.value, {
    opacity: 1,
    duration: 0.4,
    ease: "power2.out",
  });

  if (ratingBadgeRef.value) {
    gsap.to(ratingBadgeRef.value, {
      scale: 1,
      duration: 0.3,
      ease: "back.out(2)",
    });
  }

  if (borderRef.value) {
    gsap.to(borderRef.value, {
      opacity: 1,
      duration: 0.3,
      ease: "power2.out",
    });
  }
}

function onLeave() {
  gsap.to(imageRef.value, {
    scale: 1,
    duration: 0.5,
    ease: "power2.out",
  });

  gsap.to(overlayRef.value, {
    opacity: 0,
    duration: 0.3,
    ease: "power2.out",
  });

  if (ratingBadgeRef.value) {
    gsap.to(ratingBadgeRef.value, {
      scale: 0.9,
      duration: 0.3,
      ease: "power2.out",
    });
  }

  if (borderRef.value) {
    gsap.to(borderRef.value, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.out",
    });
  }
}

onUnmounted(() => {
  gsap.killTweensOf([imageRef.value, overlayRef.value, ratingBadgeRef.value, borderRef.value]);
});
</script>

<template>
  <NuxtLink
    ref="cardRef"
    class="w-40 sm:w-48 group cursor-pointer shrink-0 relative grid grid-rows-[1fr_20%] gap-2"
    :to="getMediaDetailLink(content)"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
  >
    <div
      ref="borderRef"
      class="absolute -inset-1 border-2 border-primary-500/15 pointer-events-none opacity-0"
    >
      <div class="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-primary-500/40" />
      <div class="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-primary-500/40" />
      <div class="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-primary-500/40" />
      <div
        class="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-primary-500/40"
      />
    </div>

    <div class="size-full relative overflow-hidden">
      <div
        ref="imageRef"
        class="w-full aspect-2/3 overflow-hidden bg-linear-to-br from-neutral-900 to-neutral-950"
      >
        <NuxtImg
          v-if="!imageError && imgSrc"
          :src="imgSrc"
          :alt="content.title"
          class="size-full object-cover"
          loading="lazy"
          @error="() => (imageError = true)"
        />

        <div
          v-else
          class="size-full flex flex-col items-center justify-center bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(212,175,55,0.03)_10px,rgba(212,175,55,0.03)_20px)]"
        >
          <UIcon name="i-lucide-film" class="size-10 text-stone-700" />
        </div>
      </div>

      <div
        ref="overlayRef"
        class="size-full absolute top-0 left-0 bg-linear-to-t from-black/80 via-black/30 to-transparent opacity-0"
      />

      <div
        v-if="formattedRating"
        ref="ratingBadgeRef"
        class="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm border border-primary-500/20 scale-90"
      >
        <UIcon name="i-lucide-star" class="w-3 h-3 text-primary-500 fill-primary-500" />
        <span class="text-xs text-primary-200 font-medium">{{ formattedRating }}</span>
      </div>
    </div>

    <div class="text-sm font-mono">
      <p class="text-primary/70 group-hover:text-primary-300 transition-colors duration-300">
        {{ content.title }}
      </p>

      <p class="text-dimmed">{{ year }}</p>
    </div>
  </NuxtLink>
</template>
