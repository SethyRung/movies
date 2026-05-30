<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const user = useUser();

const items = computed<NavigationMenuItem[]>(() => [
  [
    {
      label: "Dashboard",
      icon: "i-lucide-layout-dashboard",
      to: "/admin",
    },
    {
      label: "Movies",
      icon: "i-lucide-film",
      to: "/admin/movies",
    },
    {
      label: "TV Series",
      icon: "i-lucide-tv",
      to: "/admin/series",
    },
    {
      label: "Genres",
      icon: "i-lucide-tags",
      to: "/admin/genres",
    },
    {
      label: "Import",
      icon: "i-lucide-upload",
      to: "/admin/import",
    },
  ],
  [
    {
      label: "Back to Site",
      icon: "i-lucide-arrow-left",
      to: "/",
    },
  ],
]);

const handleSignOut = async () => {
  await useApi("/api/auth/logout", { method: "POST" });
  const currentUser = useUser();
  currentUser.value = null;
  navigateTo("/auth");
};
</script>

<template>
  <UDashboardGroup>
    <UDashboardSidebar collapsible resizable>
      <template #header="{ collapsed }">
        <div class="flex items-center p-2">
          <UIcon name="i-lucide-clapperboard" class="size-6 text-primary shrink-0" />
          <span v-if="!collapsed" class="ml-2 font-semibold text-sm truncate">CineMax</span>
        </div>
      </template>

      <template #default="{ collapsed }">
        <UNavigationMenu :collapsed="collapsed" :items="items" orientation="vertical" />
      </template>

      <template #footer="{ collapsed }">
        <UAvatar icon="i-lucide:user" :alt="user?.name" />

        <div v-if="!collapsed" class="flex-1 min-w-0">
          <p class="truncate text-sm font-medium text-default">
            {{ user?.name }}
          </p>
          <p class="truncate text-xs text-muted">{{ user?.email }}</p>
        </div>
      </template>
    </UDashboardSidebar>

    <slot />
  </UDashboardGroup>
</template>
