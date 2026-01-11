<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const route = useRoute();

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
    label: "TV Series",
    to: "/tv-series",
  },
]);
</script>

<template>
  <UHeader>
    <template #title>
      <div class="flex items-center gap-2 group">
        <div
          class="w-8 h-8 rounded bg-linear-to-br from-primary to-red-600 flex items-center justify-center"
        >
          <span class="text-white font-bold text-lg">M</span>
        </div>
        <span class="text-xl font-bold"> MovieStream </span>
      </div>
    </template>

    <UNavigationMenu :items="navigations" />

    <template #right>
      <UColorModeButton />

      <UTooltip text="Open on GitHub" :kbds="['meta', 'G']">
        <UButton
          color="neutral"
          variant="ghost"
          to="#"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
        />
      </UTooltip>
    </template>

    <template #body>
      <UNavigationMenu
        :items="navigations"
        orientation="vertical"
        class="-mx-2.5"
      />
    </template>
  </UHeader>
</template>
