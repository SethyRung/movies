<script setup lang="ts">
const root = ref<HTMLElement>();

defineProps<{
  side: "left" | "right";
}>();

defineExpose({ root });
</script>

<template>
  <div
    ref="root"
    class="fixed inset-y-0 w-1/2 z-50 pointer-events-none"
    :class="side === 'left' ? 'left-0' : 'right-0'"
    aria-hidden="true"
  >
    <div class="absolute inset-0 bg-linear-to-r from-[#1a0a0a] via-[#2d0f0f] to-[#1a0a0a]">
      <div
        class="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(90deg,transparent,transparent_40px,rgba(139,21,56,0.1)_40px,rgba(139,21,56,0.1)_80px)]"
      />
      <div
        class="absolute inset-0"
        :class="
          side === 'left'
            ? 'bg-linear-to-r from-transparent via-transparent to-black/50'
            : 'bg-linear-to-l from-transparent via-transparent to-black/50'
        "
      />
    </div>
  </div>
</template>
