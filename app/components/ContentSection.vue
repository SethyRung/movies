<script lang="ts">
interface ContentSectionProps {
  title?: string;
  subtitle?: string;
  items?: (Movie | TVSeries)[];
}
</script>

<script setup lang="ts">
import gsap from "gsap";
import { useScroll } from "@vueuse/core";

const props = withDefaults(defineProps<ContentSectionProps>(), {
  items: () => [],
});

const scrollContainerRef = useTemplateRef("scrollContainerRef");

const { arrivedState, x } = useScroll(scrollContainerRef);

const showLeftArrow = computed(() => !arrivedState.left);
const showRightArrow = computed(() => !arrivedState.right);

function scroll(direction: "left" | "right") {
  const container = scrollContainerRef.value;
  if (!container) return;

  const scrollAmount = container.clientWidth * 0.8;

  gsap.to(container, {
    scrollTo: {
      x: direction === "left" ? x.value - scrollAmount : x.value + scrollAmount,
    },
    duration: 0.5,
    ease: "power2.out",
  });
}

onUnmounted(() => {
  gsap.killTweensOf(scrollContainerRef.value);
});
</script>

<template>
  <div class="relative">
    <div class="flex items-baseline gap-3 mb-4">
      <h2 v-if="title" class="text-xl font-bold text-white">{{ title }}</h2>
      <span v-if="subtitle" class="text-sm text-neutral-400">{{ subtitle }}</span>
    </div>

    <div class="relative">
      <div
        v-if="showLeftArrow"
        class="p-1 absolute left-0 top-0 bottom-0 hover:bg-linear-to-r from-neutral-950 to-transparent z-10 flex items-center justify-center"
      >
        <UButton
          icon="i-lucide-chevron-left"
          color="neutral"
          size="md"
          class="rounded-full"
          @click="scroll('left')"
        />
      </div>

      <div ref="scrollContainerRef" class="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        <slot v-for="item in props.items" :key="item.id" :item="item" />
      </div>

      <div
        v-if="showRightArrow"
        class="p-1 absolute right-0 top-0 bottom-0 hover:bg-linear-to-l from-neutral-950 to-transparent z-10 flex items-center justify-center"
      >
        <UButton
          icon="i-lucide-chevron-right"
          color="neutral"
          size="md"
          class="rounded-full"
          @click="scroll('right')"
        />
      </div>
    </div>
  </div>
</template>
