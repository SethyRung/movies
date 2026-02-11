<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const route = useRoute();
const searchQuery = ref("");

const navigations = computed<NavigationMenuItem[]>(() => [
  {
    label: "Home",
    to: "/",
  },
  {
    label: "Movies",
    to: "/movies",
  },
  {
    label: "TV Shows",
    to: "/tv-series",
  },
]);
</script>

<template>
  <UHeader>
    <template #title>
      <div class="flex items-center gap-2 group">
        <div
          class="w-8 h-8 rounded bg-linear-to-br from-primary-500 to-primary-600 flex items-center justify-center"
        >
          <span class="text-white font-bold text-lg">C</span>
        </div>
        <span class="text-xl font-bold text-primary-500">CINE MAX</span>
      </div>
    </template>

    <UNavigationMenu :items="navigations" />

    <template #right>
      <UButton
        icon="i-heroicons-magnifying-glass"
        color="neutral"
        variant="ghost"
        aria-label="Search"
      />

      <UColorModeButton />
    </template>

    <template #body>
      <UNavigationMenu :items="navigations" orientation="vertical" class="-mx-2.5" />
    </template>
  </UHeader>
</template>
