<script setup lang="ts">
import { h } from "vue";

definePageMeta({
  layout: "admin",
});

const route = useRoute();
const toast = useToast();
const seriesId = route.params.id as string;

const UBadge = resolveComponent("UBadge");

const seasonModalOpen = ref(false);
const selectedSeason = ref<Season>();
const episodeModalOpen = ref(false);
const selectedEpisode = ref<Episode>();
const activeSeasonId = ref<string>();

const { data: seriesRes } = await useFetchApi(`/api/series/${seriesId}`);
const { data: seasonsRes, refresh: refreshSeasons } = await useFetchApi(
  `/api/series/${seriesId}/seasons`,
);

const series = computed(() => seriesRes.value?.data);
const seasons = computed(() => seasonsRes.value?.data ?? []);

watch(
  seasons,
  (newSeasons) => {
    if (!activeSeasonId.value && newSeasons.length > 0) {
      activeSeasonId.value = newSeasons[0]!.id;
    } else if (newSeasons.length === 0) {
      activeSeasonId.value = undefined;
    }
  },
  { immediate: true },
);

const epUrl = computed(() => `/api/seasons/${activeSeasonId.value}/episodes` as const);

const {
  data: episodesData,
  refresh: refreshEpisodes,
  pending: episodesPending,
} = await useFetchApi(epUrl.value);

const episodes = computed(() => episodesData.value?.data ?? []);

const seasonColumns = [
  {
    accessorKey: "seasonNumber",
    header: "#",
    cell: ({ row }: any) =>
      h(UBadge, { label: `S${row.original.seasonNumber}`, variant: "subtle", color: "neutral" }),
  },
  { accessorKey: "title", header: "Title" },
  {
    accessorKey: "episodeCount",
    header: "Episodes",
    cell: ({ row }: any) =>
      h("span", { class: "text-sm text-muted" }, `${row.original.episodeCount ?? 0} eps`),
  },
  {
    accessorKey: "releaseYear",
    header: "Year",
    cell: ({ row }: any) =>
      row.original.releaseYear
        ? h("span", { class: "text-sm text-muted" }, row.original.releaseYear)
        : h("span", { class: "text-muted" }, "—"),
  },
  { id: "actions" },
];

const episodeColumns = [
  {
    accessorKey: "episodeNumber",
    header: "#",
    cell: ({ row }: any) =>
      h(
        "span",
        { class: "text-sm font-medium" },
        `E${String(row.original.episodeNumber).padStart(2, "0")}`,
      ),
  },
  {
    accessorKey: "embedType",
    header: "Type",
    cell: ({ row }: any) =>
      h(UBadge, { label: row.original.embedType, variant: "subtle", color: "neutral" }),
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }: any) =>
      row.original.duration
        ? h("span", { class: "text-sm text-muted" }, `${row.original.duration} min`)
        : h("span", { class: "text-muted" }, "—"),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: any) => {
      const colorMap: Record<string, any> = { active: "success", draft: "warning" };
      return h(UBadge, {
        label: row.original.status,
        variant: "subtle",
        color: colorMap[row.original.status] ?? "neutral",
      });
    },
  },
  { id: "actions" },
];

async function handleDeleteSeason(season: Season) {
  try {
    const res = await useApi(`/api/seasons/${season.id}`, { method: "DELETE" });
    if (res.status.code === ApiResponseCode.Success) {
      toast.add({ title: "Season deleted", color: "success", icon: "i-lucide-check-circle" });

      if (season.id === activeSeasonId.value) {
        activeSeasonId.value = undefined;
      }

      refreshSeasons();
      refreshEpisodes();
    } else {
      toast.add({
        icon: "i-lucide-x-circle",
        title: "Failed to delete season",
        description: res.status.message,
        color: "error",
      });
    }
  } catch {
    toast.add({ title: "Failed to delete season", color: "error", icon: "i-lucide-x-circle" });
  }
}

async function handleDeleteEpisode(episode: any) {
  try {
    const res = await useApi(`/api/episodes/${episode.id}`, { method: "DELETE" });
    if (res.status.code === ApiResponseCode.Success) {
      toast.add({ title: "Episode deleted", color: "success", icon: "i-lucide-check-circle" });
      refreshEpisodes();
      refreshSeasons();
    } else {
      toast.add({
        icon: "i-lucide-x-circle",
        title: "Failed to delete episode",
        description: res.status.message,
        color: "error",
      });
    }
  } catch {
    toast.add({ title: "Failed to delete episode", color: "error", icon: "i-lucide-x-circle" });
  }
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar :title="series?.title ?? 'Series Detail'">
        <template #leading>
          <UDashboardSidebarCollapse />
          <UButton icon="i-lucide-arrow-left" color="neutral" variant="ghost" to="/admin/series" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="space-y-6">
        <section>
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-lg font-semibold">Seasons</h2>
            <UButton
              label="Add Season"
              icon="i-lucide-plus"
              size="sm"
              @click="
                () => {
                  selectedSeason = undefined;
                  seasonModalOpen = true;
                }
              "
            />
          </div>

          <UTable :data="seasons" :columns="seasonColumns">
            <template #actions-cell="{ row }">
              <UDropdownMenu
                :items="[
                  [
                    {
                      label: 'Edit',
                      icon: 'i-lucide-pencil',
                      onSelect: () => {
                        selectedSeason = row.original;
                        seasonModalOpen = true;
                      },
                    },
                    {
                      label: 'Manage Episodes',
                      icon: 'i-lucide-list',
                      onSelect: () => {
                        activeSeasonId = row.original.id;
                      },
                    },
                  ],
                  [
                    {
                      label: 'Delete',
                      icon: 'i-lucide-trash',
                      color: 'error',
                      onSelect: () => handleDeleteSeason(row.original),
                    },
                  ],
                ]"
              >
                <UButton icon="i-lucide-ellipsis" color="neutral" variant="ghost" />
              </UDropdownMenu>
            </template>

            <template #empty>
              <div class="flex flex-col items-center justify-center py-8 text-muted">
                <UIcon name="i-lucide-layers" class="size-10 mb-2 opacity-50" />
                <p class="text-sm">No seasons yet</p>
              </div>
            </template>
          </UTable>
        </section>

        <section v-if="activeSeasonId">
          <USeparator class="mb-6" />

          <div class="flex items-center justify-between mb-3">
            <h2 class="text-lg font-semibold">
              Episodes
              <span class="text-sm font-normal text-muted">
                (Season {{ seasons.find((s: any) => s.id === activeSeasonId)?.seasonNumber }})
              </span>
            </h2>
            <UButton
              label="Add Episode"
              icon="i-lucide-plus"
              size="sm"
              @click="
                () => {
                  selectedEpisode = undefined;
                  episodeModalOpen = true;
                }
              "
            />
          </div>

          <UTable :data="episodes" :columns="episodeColumns" :loading="episodesPending">
            <template #actions-cell="{ row }">
              <UDropdownMenu
                :items="[
                  [
                    {
                      label: 'Edit',
                      icon: 'i-lucide-pencil',
                      onSelect: () => {
                        selectedEpisode = row.original;
                        episodeModalOpen = true;
                      },
                    },
                  ],
                  [
                    {
                      label: 'Delete',
                      icon: 'i-lucide-trash',
                      color: 'error',
                      onSelect: () => handleDeleteEpisode(row.original),
                    },
                  ],
                ]"
              >
                <UButton icon="i-lucide-ellipsis" color="neutral" variant="ghost" />
              </UDropdownMenu>
            </template>

            <template #empty>
              <div class="flex flex-col items-center justify-center py-8 text-muted">
                <UIcon name="i-lucide-play-circle" class="size-10 mb-2 opacity-50" />
                <p class="text-sm">No episodes yet</p>
              </div>
            </template>
          </UTable>
        </section>
      </div>
    </template>
  </UDashboardPanel>

  <AdminSeasonFormModal
    v-model:open="seasonModalOpen"
    :series-id="seriesId"
    :season="selectedSeason"
    @saved="
      () => {
        refreshSeasons();
        refreshEpisodes();
      }
    "
  />

  <AdminEpisodeFormModal
    v-if="activeSeasonId"
    v-model:open="episodeModalOpen"
    :season-id="activeSeasonId"
    :episode="selectedEpisode"
    @saved="
      refreshEpisodes();
      refreshSeasons();
    "
  />
</template>
