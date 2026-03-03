<script setup lang="ts">
defineEmits<{
  click: [];
}>();
</script>

<template>
  <button
    class="group relative px-10 py-4 overflow-hidden transition-all duration-500"
    @click="$emit('click')"
  >
    <div
      class="absolute inset-0 bg-linear-to-r from-primary-600 via-primary-500 to-primary-600 transition-all duration-500 group-hover:opacity-90"
    />

    <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
      <div
        class="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
      />
    </div>

    <div class="absolute inset-0 border border-primary-400/30" />

    <span
      class="relative z-10 flex items-center gap-3 text-primary-950 tracking-[0.25em] text-sm uppercase font-medium"
    >
      <UIcon name="i-lucide-play" class="w-5 h-5" />
      <slot>Begin Screening</slot>
    </span>
  </button>
</template>
