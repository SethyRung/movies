<script setup lang="ts">
defineProps<{
  src?: string | null;
  alt: string;
}>();
</script>

<template>
  <div class="animate-poster shrink-0 w-full max-w-xs lg:max-w-sm mx-auto">
    <div class="relative group">
      <div class="absolute -inset-3 border border-primary-500/20 pointer-events-none">
        <div class="absolute -top-1 -left-1 w-4 h-4 border-t border-l border-primary-500/40" />
        <div class="absolute -top-1 -right-1 w-4 h-4 border-t border-r border-primary-500/40" />
        <div class="absolute -bottom-1 -left-1 w-4 h-4 border-b border-l border-primary-500/40" />
        <div class="absolute -bottom-1 -right-1 w-4 h-4 border-b border-r border-primary-500/40" />
      </div>

      <div class="aspect-2/3 overflow-hidden bg-linear-to-br from-stone-900 to-stone-950 shadow-2xl shadow-black/50">
        <NuxtImg
          v-if="src"
          :src="src"
          :alt="alt"
          class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          width="400"
          height="600"
          format="webp"
          :modifiers="{ quality: 90 }"
          loading="eager"
        />
        <div
          v-else
          class="w-full h-full flex items-center justify-center bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(212,175,55,0.03)_10px,rgba(212,175,55,0.03)_20px)]"
        >
          <UIcon name="i-lucide-film" class="w-20 h-20 text-stone-700" />
        </div>
      </div>
    </div>
  </div>
</template>
