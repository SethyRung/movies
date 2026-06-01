<script setup lang="ts">
import { h } from "vue";

definePageMeta({
  layout: "admin",
});

const toast = useToast();

const statusItems = [
  { label: "All", value: "all" },
  { label: "Ongoing", value: "ongoing" },
  { label: "Completed", value: "completed" },
  { label: "Draft", value: "draft" },
  { label: "Archived", value: "archived" },
];

const search = ref();
const statusFilter = ref<(typeof statusItems)[number]["value"]>(statusItems[0]!.value);
const status = computed(() => (statusFilter.value !== "all" ? statusFilter.value : undefined));

const modelOpen = ref(false);
const series = ref<any>();

const UBadge = resolveComponent("UBadge");

const { data, refresh, pending } = await useFetchApi("/api/series", {
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
          row.original.description
            ? h(
                "p",
                { class: "text-xs text-muted truncate max-w-[200px]" },
                row.original.description,
              )
            : null,
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
        ongoing: "warning",
        completed: "success",
        draft: "neutral",
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

async function handleDelete(series: any) {
  try {
    const res = await useApi(`/api/series/${series.id}`, { method: "DELETE" });

    if (res.status.code === ApiResponseCode.Success) {
      toast.add({ title: "Series deleted", color: "success", icon: "i-lucide-check-circle" });
      refresh();
    } else {
      toast.add({
        icon: "i-lucide-x-circle",
        title: "Failed to delete series",
        description: res.status.message,
        color: "error",
      });
    }
  } catch {
    toast.add({ title: "Failed to delete series", color: "error", icon: "i-lucide-x-circle" });
  }
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="TV Series">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="Search series..."
            class="w-64"
          />
        </template>
        <template #right>
          <USelect v-model="statusFilter" :items="statusItems" class="w-32" />

          <UButton
            label="Add Series"
            icon="i-lucide-plus"
            @click="
              () => {
                modelOpen = true;
                series = undefined;
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
                  onSelect: () => navigateTo(`/tv-series/${row.original.id}`),
                },
                {
                  label: 'Edit',
                  icon: 'i-lucide-pencil',
                  onSelect: () => {
                    series = row.original;
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
            <UIcon name="i-lucide-tv" class="size-12 mb-3 opacity-50" />
            <p class="text-sm">No series found</p>
          </div>
        </template>
      </UTable>
    </template>
  </UDashboardPanel>

  <AdminSeriesFormModal v-model:open="modelOpen" :series="series" @saved="refresh" />
</template>
