<script setup lang="ts">
definePageMeta({
  layout: "admin",
});

const toast = useToast();
const importType = ref<"movies" | "series">("series");
const origin = ref("");
const file = ref<File | null>(null);
const parsedData = ref<any[] | null>(null);
const importing = ref(false);
const previewExpanded = ref(false);
const parseError = ref("");

const ORIGIN_OPTIONS = [
  { label: "Chinese", value: "chinese" },
  { label: "Korean", value: "korean" },
  { label: "Khmer", value: "khmer" },
  { label: "Japanese", value: "japanese" },
  { label: "Other", value: "other" },
];

const stats = computed(() => {
  if (!parsedData.value) return null;

  if (importType.value === "movies") {
    return { items: parsedData.value.length };
  }

  const totalSeasons = parsedData.value.reduce(
    (sum: number, item: any) => sum + (item.seasons?.length ?? 0),
    0,
  );
  const totalEpisodes = parsedData.value.reduce(
    (sum: number, item: any) =>
      sum +
      (item.seasons?.reduce((s: number, ssn: any) => s + (ssn.episodes?.length ?? 0), 0) ?? 0),
    0,
  );
  return { items: parsedData.value.length, seasons: totalSeasons, episodes: totalEpisodes };
});

watch(file, (newFile: File | null) => {
  if (!newFile) return;

  parseError.value = "";

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const json = JSON.parse(e.target?.result as string);

      if (json.movies && Array.isArray(json.movies)) {
        importType.value = "movies";
        parsedData.value = json.movies;
      } else if (json.series && Array.isArray(json.series)) {
        importType.value = "series";
        parsedData.value = json.series;
      } else {
        parseError.value = 'Invalid format: expected { "movies": [...] } or { "series": [...] }';
        parsedData.value = null;
        file.value = null;
        return;
      }

      const count = parsedData.value?.length || 0;
      const label = importType.value === "movies" ? "movies" : "series";
      toast.add({
        title: `Parsed ${count} ${label}`,
        color: "success",
        icon: "i-lucide-check-circle",
      });
    } catch {
      parseError.value = "Failed to parse JSON file";
      parsedData.value = null;
      file.value = null;
    }
  };
  reader.readAsText(newFile);
});

async function handleImport() {
  if (!parsedData.value) return;

  importing.value = true;
  try {
    const body: Record<string, any> = {
      type: importType.value,
      ...(origin.value ? { origin: origin.value } : {}),
    };

    if (importType.value === "movies") {
      body.movies = parsedData.value;
    } else {
      body.series = parsedData.value;
    }

    const result = await useApi("/api/admin/import", {
      method: "POST",
      body,
    });

    const data = (result as any)?.data;
    toast.add({
      title: "Import successful",
      description: `Created: ${data?.created ?? 0}${data?.episodes ? `, Episodes: ${data.episodes}` : ""}, Errors: ${data?.errors ?? 0}`,
      color: "success",
      icon: "i-lucide-check-circle",
      duration: 8000,
    });

    handleReset();
  } catch {
    toast.add({ title: "Import failed", color: "error", icon: "i-lucide-x-circle" });
  } finally {
    importing.value = false;
  }
}

async function handleReset() {
  parsedData.value = null;
  parseError.value = "";
  file.value = null;
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Import JSON">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-4 space-y-6">
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Import Data</h3>
          </template>

          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Content Type">
                <USelect
                  v-model="importType"
                  :items="[
                    { label: 'Movies', value: 'movies' },
                    { label: 'TV Series', value: 'series' },
                  ]"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="Origin">
                <USelect
                  v-model="origin"
                  :items="ORIGIN_OPTIONS"
                  placeholder="Select origin"
                  class="w-full"
                />
              </UFormField>
            </div>

            <UFormField label="JSON File">
              <UFileUpload
                v-model="file"
                icon="i-lucide-file-json"
                layout="list"
                position="outside"
                accept=".json"
                label="Drop a JSON file here or click to browse"
                description="Must match the movies or series import schema"
                :ui="{ base: 'min-h-40' }"
              />
            </UFormField>

            <p v-if="parseError" class="text-sm text-error flex items-center gap-1.5">
              <UIcon name="i-lucide-x-circle" class="size-4" />
              {{ parseError }}
            </p>
          </div>
        </UCard>

        <UCard v-if="parsedData">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">Preview ({{ stats?.items }} items)</h3>
              <UButton
                :label="previewExpanded ? 'Collapse' : 'Expand'"
                :icon="previewExpanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                variant="ghost"
                size="sm"
                @click="previewExpanded = !previewExpanded"
              />
            </div>
          </template>

          <div v-if="previewExpanded" class="space-y-3 max-h-96 overflow-y-auto">
            <template v-if="importType === 'movies'">
              <div
                v-for="(movie, index) in parsedData"
                :key="index"
                class="flex items-center gap-3 p-2 rounded-lg bg-elevated/50"
              >
                <img
                  v-if="movie.thumbnail"
                  :src="movie.thumbnail"
                  :alt="movie.title"
                  class="size-12 rounded object-cover shrink-0"
                />
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium truncate">{{ movie.title }}</p>
                  <p class="text-xs text-muted">
                    {{ movie.embedType }} · {{ movie.status ?? "active" }}
                  </p>
                </div>
              </div>
            </template>

            <template v-else>
              <div
                v-for="(item, index) in parsedData"
                :key="index"
                class="p-2 rounded-lg bg-elevated/50"
              >
                <div class="flex items-center gap-3">
                  <img
                    v-if="item.thumbnail"
                    :src="item.thumbnail"
                    :alt="item.title"
                    class="size-12 rounded object-cover shrink-0"
                  />
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-medium truncate">{{ item.title }}</p>
                    <p class="text-xs text-muted">
                      {{ item.seasons?.length ?? 0 }} season(s) ·
                      {{
                        item.seasons?.reduce(
                          (s: number, ssn: any) => s + (ssn.episodes?.length ?? 0),
                          0,
                        ) ?? 0
                      }}
                      episode(s)
                    </p>
                  </div>
                </div>
              </div>
            </template>
          </div>
          <div v-else class="text-sm text-muted">
            {{ stats?.items }}
            {{ importType === "movies" ? "movies" : "series" }}
            <template v-if="importType === 'series'">
              with {{ stats?.seasons }} seasons and {{ stats?.episodes }} episodes
            </template>
          </div>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton label="Cancel" variant="ghost" @click="handleReset" />
              <UButton
                label="Import"
                icon="i-lucide-upload"
                :loading="importing"
                @click="handleImport"
              />
            </div>
          </template>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">Expected JSON Format</h3>
              <UButton
                label="View Schema"
                icon="i-lucide-external-link"
                variant="ghost"
                size="sm"
                :to="`/schemas/${importType === 'movies' ? 'movies' : 'series'}.json`"
                target="_blank"
              />
            </div>
          </template>

          <template v-if="importType === 'movies'">
            <pre class="text-xs text-muted bg-elevated/50 rounded-lg p-4 overflow-x-auto">
                <code>
{
    "$schema": "/schemas/movies.json",
    "movies": [
        {
        "title": "My Movie",
        "embedUrl": "https://example.com/embed/12345",
        "embedType": "youtube",
        "description": "Movie description",
        "thumbnail": "https://example.com/poster.jpg",
        "duration": 120,
        "releaseYear": 2024,
        "rating": "8.5",
        "featured": false,
        "status": "active"
        }
    ]
}
                </code>
            </pre>
          </template>
          <template v-else>
            <pre class="text-xs text-muted bg-elevated/50 rounded-lg p-4 overflow-x-auto">
                <code>
{
    "$schema": "/schemas/series.json",
    "series": [
        {
        "title": "My Series",
        "seasons": [
            {
            "seasonNumber": 1,
            "title": "Season 1",
            "episodes": [
                {
                "episodeNumber": 1,
                "embedUrl": "https://example.com/embed/12345",
                "embedType": "okru",
                "duration": 45,
                "status": "active"
                }
            ]
            }
        ],
        "description": "Series description",
        "thumbnail": "https://example.com/poster.jpg",
        "rating": "9.0",
        "status": "ongoing"
        }
    ]
}
                </code>
            </pre>
          </template>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
