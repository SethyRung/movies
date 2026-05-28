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

const sectionRef = useTemplateRef("sectionRef");
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
  <div ref="sectionRef" class="relative">
    <div class="mb-6">
      <div class="flex items-center gap-3 mb-1">
        <div class="w-8 h-px bg-primary-500/30" />
        <p v-if="subtitle" class="text-primary-500/60 tracking-[0.3em] text-xs uppercase">
          {{ subtitle }}
        </p>
      </div>
      <div class="flex items-center gap-3">
        <h2 v-if="title" class="text-2xl md:text-3xl font-medium text-primary-50">
          {{ title }}
        </h2>
        <div class="hidden md:flex items-center gap-2 text-stone-600">
          <div class="w-8 h-px bg-stone-800" />
          <div class="w-1 h-1 rotate-45 border border-stone-700" />
        </div>
      </div>
    </div>

    <div class="relative">
      <div
        v-if="showLeftArrow"
        class="absolute left-0 top-0 bottom-0 w-16 bg-linear-to-r from-[#080808] to-transparent z-10 flex items-center justify-center"
      >
        <button
          class="w-9 h-9 flex items-center justify-center border border-stone-700 hover:border-primary-500/50 text-stone-500 hover:text-primary-400 transition-all"
          @click="scroll('left')"
        >
          <UIcon name="i-lucide-chevron-left" class="w-4 h-4" />
        </button>
      </div>

      <div ref="scrollContainerRef" class="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        <slot v-for="item in props.items" :key="item.id" :item="item" />
      </div>

      <div
        v-if="showRightArrow"
        class="absolute right-0 top-0 bottom-0 w-16 bg-linear-to-l from-[#080808] to-transparent z-10 flex items-center justify-center"
      >
        <button
          class="w-9 h-9 flex items-center justify-center border border-stone-700 hover:border-primary-500/50 text-stone-500 hover:text-primary-400 transition-all"
          @click="scroll('right')"
        >
          <UIcon name="i-lucide-chevron-right" class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>
