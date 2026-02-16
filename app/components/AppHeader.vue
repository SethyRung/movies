<script setup lang="ts">
const route = useRoute();

const isScrolled = ref(false);
const isSearchOpen = ref(false);
const isMobileMenuOpen = ref(false);
const searchQuery = ref("");

const navItems = [
  { label: "Home", to: "/" },
  { label: "Movies", to: "/movies" },
  { label: "TV Series", to: "/tv-series" },
  { label: "New & Popular", to: "/new" },
];

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

const toggleSearch = () => {
  isSearchOpen.value = !isSearchOpen.value;
  if (isSearchOpen.value) {
    nextTick(() => {
      const input = document.querySelector("#search-input") as HTMLInputElement;
      input?.focus();
    });
  }
};

const closeSearch = () => {
  isSearchOpen.value = false;
  searchQuery.value = "";
};

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const handleKeydown = (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "k") {
    e.preventDefault();
    toggleSearch();
  }
  if (e.key === "Escape" && isSearchOpen.value) {
    closeSearch();
  }
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  window.addEventListener("keydown", handleKeydown);
  handleScroll();
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  window.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <header
    :class="[
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      isScrolled
        ? 'bg-neutral-950/95 backdrop-blur-md shadow-lg'
        : 'bg-gradient-to-b from-neutral-950/80 via-neutral-950/40 to-transparent',
    ]"
  >
    <div class="container mx-auto px-4 md:px-8 lg:px-16">
      <div class="flex items-center justify-between h-16 md:h-20">
        <div class="flex items-center gap-6 md:gap-8">
          <NuxtLink to="/" class="flex items-center gap-2 group" aria-label="Cine Max Home">
            <div
              class="w-8 h-8 md:w-10 md:h-10 rounded bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center transition-transform group-hover:scale-110"
            >
              <span class="text-white font-bold text-lg md:text-xl">C</span>
            </div>
            <span class="hidden sm:block text-xl md:text-2xl font-bold text-white">
              CINE<span class="text-primary-500">MAX</span>
            </span>
          </NuxtLink>

          <nav class="hidden lg:flex items-center gap-6">
            <NuxtLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              class="text-sm text-white/80 hover:text-white transition-colors relative group"
              active-class="text-white font-semibold"
            >
              {{ item.label }}
              <span
                class="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"
                :class="{ 'scale-x-100': route.path === item.to }"
              />
            </NuxtLink>
          </nav>
        </div>

        <div class="flex items-center justify-center gap-2 sm:gap-3 md:gap-4">
          <UButton
            icon="i-lucide-search"
            color="neutral"
            variant="ghost"
            class="flex items-center justify-center text-white hover:bg-white/10 w-10 h-10 sm:w-11 sm:h-11"
            aria-label="Search"
            @click="toggleSearch"
          />

          <UButton
            icon="i-lucide-menu"
            color="neutral"
            variant="ghost"
            class="lg:hidden flex items-center justify-center text-white hover:bg-white/10 w-10 h-10 sm:w-11 sm:h-11"
            aria-label="Menu"
            @click="toggleMobileMenu"
          />
        </div>
      </div>
    </div>

    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="isSearchOpen"
        class="absolute top-full left-0 right-0 bg-neutral-900/98 backdrop-blur-lg border-b border-neutral-800"
      >
        <div class="container mx-auto px-3 sm:px-4 md:px-8 lg:px-16 py-3 sm:py-4">
          <div class="relative max-w-2xl mx-auto">
            <UIcon
              name="i-lucide-search"
              class="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-neutral-400"
            />
            <input
              id="search-input"
              v-model="searchQuery"
              type="text"
              placeholder="Titles, people, genres"
              class="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm sm:text-base min-h-[44px]"
              @keydown.escape="closeSearch"
            />
            <UButton
              v-if="searchQuery"
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white w-8 h-8 min-w-[32px] min-h-[32px]"
              aria-label="Clear search"
              @click="closeSearch"
            />
          </div>

          <div v-if="searchQuery" class="mt-3 sm:mt-4 max-w-2xl mx-auto">
            <div
              class="flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-neutral-800/50 cursor-pointer"
            >
              <div
                class="w-10 h-14 rounded bg-neutral-800 flex items-center justify-center flex-shrink-0"
              >
                <UIcon name="i-lucide-search" class="w-5 h-5 text-neutral-500" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-white text-sm truncate">
                  Search for "<span class="text-primary-400">{{ searchQuery }}</span
                  >"
                </p>
                <p class="text-xs sm:text-sm text-neutral-500">See all results</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </header>

  <Transition
    enter-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-150"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isMobileMenuOpen"
      class="fixed inset-0 z-40 bg-black/80 lg:hidden"
      @click="toggleMobileMenu"
    />
  </Transition>

  <Transition
    enter-active-class="transition-transform duration-200 ease-out"
    enter-from-class="-translate-x-full"
    enter-to-class="translate-x-0"
    leave-active-class="transition-transform duration-150 ease-in"
    leave-from-class="translate-x-0"
    leave-to-class="-translate-x-full"
  >
    <div
      v-if="isMobileMenuOpen"
      class="fixed top-0 left-0 bottom-0 w-[280px] sm:w-80 max-w-full z-50 bg-neutral-900 lg:hidden"
    >
      <div class="flex items-center justify-between h-14 sm:h-16 px-4 border-b border-neutral-800">
        <span class="text-lg sm:text-xl font-bold text-white">Menu</span>
        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          class="text-white min-w-[40px] min-h-[40px]"
          aria-label="Close menu"
          @click="toggleMobileMenu"
        />
      </div>

      <nav class="p-4 space-y-1 sm:space-y-2 overflow-y-auto max-h-[calc(100vh-8rem)]">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-4 py-3 sm:py-3.5 min-h-[48px] rounded-lg text-white hover:bg-neutral-800 transition-colors"
          active-class="bg-neutral-800"
          @click="toggleMobileMenu"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

    </div>
  </Transition>

  <div
    v-if="!isSearchOpen && !isScrolled"
    class="fixed top-20 right-4 hidden lg:flex items-center gap-2 px-3 py-1.5 rounded bg-neutral-900/80 backdrop-blur-sm text-xs text-neutral-400 opacity-0 hover:opacity-100 transition-opacity"
  >
    <span>Search</span>
    <kbd class="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">⌘K</kbd>
  </div>
</template>

<style scoped>
a {
  position: relative;
}

*:focus-visible {
  outline: 2px solid rgb(99 102 241);
  outline-offset: 2px;
}

*:focus:not(:focus-visible) {
  outline: none;
}
</style>
