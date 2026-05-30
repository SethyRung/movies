<script setup lang="ts">
definePageMeta({
  layout: "admin",
});

const { data, pending } = await useFetchApi("/api/stats");

const stats = computed(() => data.value);

const statsCards = computed(() => [
  {
    title: "Total Movies",
    value: stats.value?.data?.totalMovies ?? 0,
    icon: "i-lucide-film",
    color: "primary" as const,
    to: "/admin/movies",
  },
  {
    title: "Total TV Series",
    value: stats.value?.data?.totalSeries ?? 0,
    icon: "i-lucide-tv",
    color: "secondary" as const,
    to: "/admin/series",
  },
  {
    title: "Genres",
    value: stats.value?.data?.genres.length ?? 0,
    icon: "i-lucide-tags",
    color: "success" as const,
    to: "/admin/genres",
  },
]);
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Dashboard">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        <NuxtLink v-for="card in statsCards" :key="card.title" :to="card.to" class="block">
          <UCard class="hover:bg-elevated/50 transition-colors" :ui="{ body: 'p-4 sm:p-4' }">
            <div class="flex items-center gap-4">
              <div
                class="size-12 rounded-lg flex items-center justify-center"
                :class="{
                  'bg-primary/10 text-primary': card.color === 'primary',
                  'bg-secondary/10 text-secondary': card.color === 'secondary',
                  'bg-success/10 text-success': card.color === 'success',
                }"
              >
                <UIcon :name="card.icon" class="size-6" />
              </div>
              <div>
                <p class="text-sm text-muted">{{ card.title }}</p>
                <p class="text-2xl font-bold">
                  <USkeleton v-if="pending" class="h-8 w-16" />
                  <template v-else>{{ card.value }}</template>
                </p>
              </div>
            </div>
          </UCard>
        </NuxtLink>
      </div>

      <div class="px-4 pb-4">
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Quick Actions</h3>
          </template>
          <div class="flex flex-wrap gap-3">
            <UButton label="Import JSON" icon="i-lucide-upload" to="/admin/import" />
            <UButton label="Add Movie" icon="i-lucide-plus" variant="outline" to="/admin/movies" />
            <UButton label="Add Series" icon="i-lucide-plus" variant="outline" to="/admin/series" />
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
