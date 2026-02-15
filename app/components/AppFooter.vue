<script setup lang="ts">
const currentYear = computed(() => new Date().getFullYear());

const linkSections = [
  {
    title: "Browse",
    links: [
      { label: "Home", to: "/" },
      { label: "Movies", to: "/movies" },
      { label: "TV Series", to: "/tv-series" },
      { label: "New & Popular", to: "/new" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Account", to: "/account" },
      { label: "Support", to: "/support" },
      { label: "Devices", to: "/devices" },
      { label: "Contact Us", to: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Use", to: "/terms" },
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Cookie Preferences", to: "/cookies" },
      { label: "Corporate Information", to: "/corporate" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Blog", to: "/blog", external: true },
      { label: "Forum", to: "/forum", external: true },
      { label: "Developer API", to: "/api", external: true },
    ],
  },
];

const socialLinks = [
  { icon: "i-simple-icons-facebook", label: "Facebook", href: "https://facebook.com" },
  { icon: "i-simple-icons-instagram", label: "Instagram", href: "https://instagram.com" },
  { icon: "i-simple-icons-x", label: "X (Twitter)", href: "https://x.com" },
  { icon: "i-simple-icons-youtube", label: "YouTube", href: "https://youtube.com" },
  { icon: "i-simple-icons-discord", label: "Discord", href: "https://discord.com" },
];
</script>

<template>
  <footer class="bg-neutral-900 text-white mt-8 sm:mt-12">
    <div class="container mx-auto px-4 sm:px-6 md:px-8 lg:px-16 py-8 sm:py-10 md:py-12">
      <div class="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <UButton
          v-for="social in socialLinks"
          :key="social.label"
          :icon="social.icon"
          :to="social.href"
          :aria-label="social.label"
          target="_blank"
          rel="noopener noreferrer"
          color="neutral"
          variant="ghost"
          class="w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] rounded-full bg-neutral-800 hover:bg-neutral-700 text-white flex-shrink-0"
        />
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
        <div v-for="section in linkSections" :key="section.title">
          <h3 class="text-xs sm:text-sm font-semibold text-white mb-3 sm:mb-4">
            {{ section.title }}
          </h3>
          <ul class="space-y-1.5 sm:space-y-2">
            <li v-for="link in section.links" :key="link.to">
              <NuxtLink
                :to="link.to"
                :target="link.external ? '_blank' : undefined"
                :rel="link.external ? 'noopener noreferrer' : undefined"
                class="text-xs sm:text-sm text-neutral-400 hover:text-white transition-colors"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <div class="mb-4 sm:mb-6">
        <UButton
          color="neutral"
          variant="ghost"
          class="text-neutral-400 hover:text-white border border-neutral-700 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm min-h-[36px] sm:min-h-[40px]"
        >
          Service Code
        </UButton>
      </div>

      <div class="text-xs sm:text-sm text-neutral-500 space-y-1.5 sm:space-y-2">
        <p>© {{ currentYear }} Cine Max, Inc.</p>
        <p class="text-[10px] sm:text-xs">
          This is a demo project for educational purposes. All movie and TV show data is from TMDB.
          Images and trademarks are property of their respective owners.
        </p>
      </div>
    </div>

    <div class="border-t border-neutral-800">
      <div class="container mx-auto px-4 sm:px-6 md:px-8 lg:px-16 py-3 sm:py-4">
        <div
          class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4"
        >
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-globe" class="w-4 h-4 text-neutral-500 flex-shrink-0" />
            <select
              class="bg-transparent text-xs sm:text-sm text-neutral-400 border-none focus:outline-none cursor-pointer pr-6"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="ja">日本語</option>
              <option value="ko">한국어</option>
            </select>
          </div>

          <div
            class="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 text-xs sm:text-sm text-neutral-500"
          >
            <NuxtLink to="/privacy" class="hover:text-white transition-colors"> Privacy </NuxtLink>
            <span class="hidden sm:inline text-neutral-700">|</span>
            <NuxtLink to="/terms" class="hover:text-white transition-colors"> Terms </NuxtLink>
            <span class="hidden sm:inline text-neutral-700">|</span>
            <NuxtLink to="/cookies" class="hover:text-white transition-colors"> Cookies </NuxtLink>
            <span class="hidden sm:inline text-neutral-700">|</span>
            <NuxtLink to="/corporate" class="hover:text-white transition-colors">
              Corporate
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1rem;
  padding-right: 2rem;
}

select:focus {
  outline: none;
}
</style>
