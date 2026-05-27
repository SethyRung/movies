<template>
  <div
    class="max-w-screen min-h-screen bg-background overflow-x-hidden overflow-y-auto relative font-sans flex justify-center sm:items-center"
  >
    <div class="absolute top-0 left-0 pointer-events-none opacity-20" aria-hidden="true">
      <UIcon name="i-cinemax-corner-left" :size="128" class="text-primary-500" />
    </div>
    <div class="absolute top-0 right-0 pointer-events-none opacity-20" aria-hidden="true">
      <UIcon name="i-cinemax-corner-right" :size="128" class="text-primary-500" />
    </div>

    <div class="w-full max-w-md mx-auto px-6 z-10">
      <NuxtPage />
    </div>
  </div>
</template>
