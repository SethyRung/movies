<script setup lang="ts">
const navItems = [
  { label: "Home", to: "/" },
  { label: "Motion Pictures", to: "/movies" },
  { label: "TV Series", to: "/tv-series" },
  { label: "My List", to: "/my-list" },
];

const socialItems = [
  { label: "GitHub", icon: "i-simple-icons-github", href: "https://github.com/sethyrung" },
  { label: "X / Twitter", icon: "i-simple-icons-x", href: "https://x.com/SethyRung" },
  {
    label: "Discord",
    icon: "i-simple-icons-discord",
    href: "https://discord.com/users/573740048978280458",
  },
  { label: "About", icon: "i-lucide-globe", href: "https://sethyrung.com" },
];
</script>

<template>
  <footer class="relative bg-background pt-16 pb-8 overflow-hidden">
    <div
      class="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-primary-500/20 to-transparent"
    />
    <div
      class="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border border-primary-500/30"
    />

    <div class="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
        <div class="md:col-span-5">
          <NuxtLink to="/" class="group inline-flex items-center gap-3 mb-6">
            <div class="relative">
              <div
                class="w-10 h-10 border border-primary-500/40 group-hover:border-primary-500 rotate-45 flex items-center justify-center transition-colors duration-300"
              >
                <UIcon name="i-lucide-clapperboard" class="w-5 h-5 text-primary-500 -rotate-45" />
              </div>
            </div>
            <p
              class="text-2xl font-bold tracking-[0.15em] group-hover:text-primary-400 transition-colors"
            >
              <span class="text-primary-50"> CINE </span>
              <span class="text-primary-500"> MAX </span>
            </p>
          </NuxtLink>

          <p class="text-stone-500 text-sm leading-relaxed max-w-sm mb-6">
            Your premium destination for movies and TV series. Experience cinema-quality streaming
            anytime, anywhere.
          </p>

          <div class="flex items-center gap-2 text-stone-600 text-xs tracking-wider">
            <div class="w-8 h-px bg-stone-800" />
            <span>ENTERTAINMENT REDEFINED</span>
            <div class="w-8 h-px bg-stone-800" />
          </div>
        </div>

        <div class="md:col-span-3 md:col-start-7">
          <p class="text-primary-500/60 tracking-[0.3em] text-xs uppercase mb-4">Navigate</p>
          <nav class="space-y-3">
            <NuxtLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              class="block text-stone-400 hover:text-primary-400 transition-colors text-sm tracking-wide"
            >
              {{ item.label }}
            </NuxtLink>
          </nav>
        </div>

        <div class="md:col-span-3">
          <p class="text-primary-500/60 tracking-[0.3em] text-xs uppercase mb-4">Connect</p>
          <div class="space-y-3">
            <a
              v-for="item in socialItems"
              :key="item.href"
              :href="item.href"
              target="_blank"
              class="flex items-center gap-3 text-stone-400 hover:text-primary-400 transition-colors text-sm tracking-wide"
            >
              <UIcon :name="item.icon" class="w-4 h-4" />
              {{ item.label }}
            </a>
          </div>
        </div>
      </div>

      <div class="relative">
        <div
          class="absolute top-0 left-20 right-20 h-px bg-linear-to-r from-transparent via-stone-800 to-transparent"
        />
        <div
          class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-4"
        >
          <div class="w-12 h-px bg-stone-800" />
          <div class="w-2 h-2 rotate-45 border border-stone-700" />
          <div class="w-12 h-px bg-stone-800" />
        </div>
      </div>

      <div class="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="text-stone-600 text-xs tracking-wider">
          &copy; {{ new Date().getFullYear() }} Cine Max. All rights reserved.
        </p>
        <div class="flex items-center gap-2 text-stone-600 text-xs tracking-wider">
          <div class="w-1 h-1 rotate-45 bg-primary-500/20" />
          <span>Built with passion for cinema</span>
          <div class="w-1 h-1 rotate-45 bg-primary-500/20" />
        </div>
      </div>
    </div>
  </footer>
</template>
