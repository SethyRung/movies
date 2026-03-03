<script setup lang="ts">
defineProps<{
  message?: string;
}>();
</script>

<template>
  <div class="min-h-screen flex items-center justify-center relative">
    <div class="flex flex-col items-center gap-8">
      <div class="relative">
        <div class="w-24 h-24 relative">
          <div class="absolute inset-0 border-2 border-primary-500/20 rotate-45"></div>
          <div
            class="absolute inset-2 border-2 border-primary-500/30 -rotate-12 animate-spin"
            style="animation-duration: 3s"
          ></div>
          <div
            class="absolute inset-4 border-2 border-primary-500/40 rotate-45 animate-spin"
            style="animation-duration: 2s; animation-direction: reverse"
          ></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <UIcon name="i-lucide-film" class="w-6 h-6 text-primary-500/60" />
          </div>
        </div>
      </div>
      <p class="text-primary-500/70 text-lg tracking-[0.3em] font-light animate-pulse">
        {{ message ?? "Preparing Your Experience" }}
      </p>
    </div>
  </div>
</template>
