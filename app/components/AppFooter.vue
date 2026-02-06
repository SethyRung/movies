<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const items: NavigationMenuItem[] = [
  {
    label: "About",
    to: "https://sethyrung.com",
    target: "_blank",
  },
];
</script>

<template>
  <UFooter>
    <template #left>
      <div class="md:col-span-2">
        <div class="flex items-center gap-2 mb-4">
          <div
            class="w-8 h-8 rounded bg-linear-to-br from-primary-500 to-primary-600 flex items-center justify-center"
          >
            <span class="text-white font-bold text-lg">C</span>
          </div>
          <span class="text-xl font-bold text-primary-500">CINE MAX</span>
        </div>
        <p class="text-muted-foreground text-sm max-w-80">
          Your ultimate destination for movies and TV series. Stream your favorite content anytime,
          anywhere.
        </p>
      </div>
    </template>

    <UNavigationMenu :items="items" variant="link" />

    <template #right>
      <UButton
        icon="i-simple-icons-discord"
        color="neutral"
        variant="ghost"
        to="https://discord.com/users/573740048978280458"
        target="_blank"
        aria-label="Discord"
      />
      <UButton
        icon="i-simple-icons-x"
        color="neutral"
        variant="ghost"
        to="https://x.com/SethyRung"
        target="_blank"
        aria-label="X"
      />
      <UButton
        icon="i-simple-icons-github"
        color="neutral"
        variant="ghost"
        to="https://github.com/sethyrung"
        target="_blank"
        aria-label="GitHub"
      />
    </template>
  </UFooter>
</template>
