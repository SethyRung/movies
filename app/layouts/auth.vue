<template>
  <div
    class="max-w-screen min-h-screen overflow-x-hidden overflow-y-auto relative font-sans flex justify-center sm:items-center"
  >
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#080808_70%)]"
      />
      <div class="absolute inset-0 opacity-[0.03] mix-blend-overlay">
        <UIcon name="i-cinemax-noise" class="w-full h-full text-white" />
      </div>
    </div>

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
