<script setup lang="ts">
import { h } from "vue";

definePageMeta({
  layout: "admin",
});

const toast = useToast();

const statusItems = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Draft", value: "draft" },
  { label: "Archived", value: "archived" },
];

const search = ref();
const statusFilter = ref<(typeof statusItems)[number]["value"]>(statusItems[0]!.value);
const status = computed(() => (statusFilter.value !== "all" ? statusFilter.value : undefined));

const modelOpen = ref(false);
const movie = ref<Movie>();

const AdminMovieFormModal = resolveComponent("AdminMovieFormModal");
const UBadge = resolveComponent("UBadge");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UButton = resolveComponent("UButton");

const { data, refresh, pending } = await useFetchApi("/api/movies", {
  query: {
    search,
    status,
    limit: 50,
  },
  watch: [search, status],
});

const columns = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }: any) =>
      h("div", { class: "flex items-center gap-3" }, [
        row.original.thumbnail
          ? h("img", {
              src: row.original.thumbnail,
              alt: row.original.title,
              class: "size-10 rounded object-cover",
            })
          : h(
              "div",
              {
                class: "size-10 rounded bg-elevated flex items-center justify-center",
              },
              [h("span", { class: "text-xs text-muted" }, "N/A")],
            ),
        h("div", { class: "min-w-0" }, [
          h("p", { class: "font-medium truncate max-w-[200px]" }, row.original.title),
          h("p", { class: "text-xs text-muted truncate max-w-[200px]" }, row.original.embedType),
        ]),
      ]),
  },
  {
    accessorKey: "origin",
    header: "Origin",
    cell: ({ row }: any) =>
      row.original.origin
        ? h(UBadge, { label: row.original.origin, variant: "subtle", color: "neutral" })
        : h("span", { class: "text-muted" }, "—"),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: any) => {
      const colorMap: Record<string, any> = {
        active: "success",
        draft: "warning",
        archived: "neutral",
      };
      return h(UBadge, {
        label: row.original.status,
        variant: "subtle",
        color: colorMap[row.original.status] ?? "neutral",
      });
    },
  },
  {
    accessorKey: "featured",
    header: "Featured",
    cell: ({ row }: any) =>
      h(UBadge, {
        label: row.original.featured ? "Yes" : "No",
        variant: "subtle",
        color: row.original.featured ? "primary" : "neutral",
      }),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }: any) =>
      h(
        "span",
        { class: "text-sm text-muted" },
        new Date(row.original.createdAt).toLocaleDateString(),
      ),
  },
  { id: "actions" },
];

async function handleDelete(movie: any) {
  try {
    const res = await useApi(`/api/movies/${movie.id}`, { method: "DELETE" });

    if (res.status.code === ApiResponseCode.Success) {
      toast.add({ title: "Movie deleted", color: "success", icon: "i-lucide-check-circle" });
      refresh();
    } else {
      toast.add({
        icon: "i-lucide-x-circle",
        title: "Failed to delete movie",
        description: res.status.message,
        color: "error",
      });
    }
  } catch {
    toast.add({ title: "Failed to delete movie", color: "error", icon: "i-lucide-x-circle" });
  }
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Movies">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar
        :ui="{
          root: 'flex-wrap',
          right: 'flex-wrap',
        }"
      >
        <template #left>
          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="Search movies..."
            class="w-64"
          />
        </template>
        <template #right>
          <USelect v-model="statusFilter" :items="statusItems" class="w-32" />

          <UButton
            label="Add Movie"
            icon="i-lucide-plus"
            @click="
              () => {
                modelOpen = true;
                movie = undefined;
              }
            "
          />

          <UButton
            label="Import JSON"
            icon="i-lucide-upload"
            variant="outline"
            to="/admin/import"
          />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <UTable :data="data?.data ?? []" :columns="columns" :loading="pending">
        <template #actions-cell="{ row }">
          <UDropdownMenu
            :items="[
              [
                {
                  label: 'View',
                  icon: 'i-lucide-eye',
                  onSelect: () => navigateTo(`/movies/${row.original.id}`),
                },
                {
                  label: 'Edit',
                  icon: 'i-lucide-pencil',
                  onSelect: () => {
                    movie = row.original;
                    modelOpen = true;
                  },
                },
              ],
              [
                {
                  label: 'Delete',
                  icon: 'i-lucide-trash',
                  color: 'error',
                  onSelect: () => handleDelete(row.original),
                },
              ],
            ]"
          >
            <UButton icon="i-lucide-ellipsis" color="neutral" variant="ghost" />
          </UDropdownMenu>
        </template>

        <template #empty>
          <div class="flex flex-col items-center justify-center py-12 text-muted">
            <UIcon name="i-lucide-film" class="size-12 mb-3 opacity-50" />
            <p class="text-sm">No movies found</p>
          </div>
        </template>
      </UTable>
    </template>
  </UDashboardPanel>

  <AdminMovieFormModal v-model:open="modelOpen" :movie="movie" @saved="refresh" />
</template>
