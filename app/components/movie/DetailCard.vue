<script setup lang="ts">
defineProps<{
  label: string;
  icon?: string;
}>();
</script>

<template>
  <div class="animate-card group">
    <div
      class="relative h-full p-6 bg-linear-to-b from-stone-900/50 to-transparent border border-stone-800/50 hover:border-primary-500/20 transition-colors duration-300"
    >
      <div class="absolute top-0 left-6 w-8 h-px bg-primary-500/30" />
      <p class="text-stone-500 text-xs tracking-[0.2em] uppercase mb-3">{{ label }}</p>
      <slot />
    </div>
  </div>
</template>
