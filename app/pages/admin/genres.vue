<script setup lang="ts">
import { h } from "vue";

definePageMeta({
  layout: "admin",
});

const toast = useToast();

const modelOpen = ref(false);
const genre = ref<any>();

const { data, refresh, pending } = await useFetchApi("/api/genres", {
  query: { limit: 100 },
});

const columns = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "slug", header: "Slug" },
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

async function handleDelete(genre: any) {
  try {
    const res = await useApi(`/api/genres/${genre.id}`, { method: "DELETE" });

    if (res.status.code === ApiResponseCode.Success) {
      toast.add({ title: "Genre deleted", color: "success", icon: "i-lucide-check-circle" });
      refresh();
    } else {
      toast.add({
        icon: "i-lucide-x-circle",
        title: "Failed to delete genre",
        description: res.status.message,
        color: "error",
      });
    }
  } catch {
    toast.add({ title: "Failed to delete genre", color: "error", icon: "i-lucide-x-circle" });
  }
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Genres">
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
        <template #right>
          <UButton
            label="Add Genre"
            icon="i-lucide-plus"
            @click="
              () => {
                modelOpen = true;
                genre = undefined;
              }
            "
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
                  label: 'Edit',
                  icon: 'i-lucide-pencil',
                  onSelect: () => {
                    genre = row.original;
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
            <UIcon name="i-lucide-tags" class="size-12 mb-3 opacity-50" />
            <p class="text-sm">No genres found</p>
          </div>
        </template>
      </UTable>
    </template>
  </UDashboardPanel>

  <AdminGenreFormModal v-model:open="modelOpen" :genre="genre" @saved="refresh" />
</template>
