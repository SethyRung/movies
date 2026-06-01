<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const props = defineProps<{
  series?: any;
}>();

const open = defineModel<boolean>("open", { default: undefined });

const emits = defineEmits<{
  saved: [];
}>();

const toast = useToast();
const saving = ref(false);
const isEdit = computed(() => !!props.series?.id);

const schema = z.object({
  title: z.string("Title is required").min(1, "Title is required"),
  description: z.string("Description is required"),
  thumbnail: z.string("Thumbnail is required"),
  poster: z.string("Poster is required"),
  origin: z.string("Origin is required"),
  firstAiredYear: z.number().int().min(1900).max(2100).optional(),
  lastAiredYear: z.number().int().min(1900).max(2100).optional(),
  rating: z.string("Rating is required"),
  featured: z.boolean(),
  status: z.string(),
});

type Schema = z.infer<typeof schema>;

const state = reactive<Partial<Schema>>({
  title: props.series?.title ?? undefined,
  description: props.series?.description || undefined,
  thumbnail: props.series?.thumbnail || undefined,
  poster: props.series?.poster || undefined,
  origin: props.series?.origin || undefined,
  firstAiredYear: props.series?.firstAiredYear || undefined,
  lastAiredYear: props.series?.lastAiredYear || undefined,
  rating: props.series?.rating || undefined,
  featured: props.series?.featured ?? false,
  status: props.series?.status ?? "ongoing",
});

watch(
  () => props.series,
  (series) => {
    state.title = series?.title ?? undefined;
    state.description = series?.description || undefined;
    state.thumbnail = series?.thumbnail || undefined;
    state.poster = series?.poster || undefined;
    state.origin = series?.origin || undefined;
    state.firstAiredYear = series?.firstAiredYear || undefined;
    state.lastAiredYear = series?.lastAiredYear || undefined;
    state.rating = series?.rating || undefined;
    state.featured = series?.featured ?? false;
    state.status = series?.status ?? "ongoing";
  },
);

const formRef = useTemplateRef("formRef");

const STATUS_OPTIONS = [
  { label: "Ongoing", value: "ongoing" },
  { label: "Completed", value: "completed" },
  { label: "Draft", value: "draft" },
  { label: "Archived", value: "archived" },
];

const ORIGIN_OPTIONS = [
  { label: "Chinese", value: "chinese" },
  { label: "Korean", value: "korean" },
  { label: "Khmer", value: "khmer" },
  { label: "Japanese", value: "japanese" },
];

async function onSubmit(event: FormSubmitEvent<Schema>) {
  saving.value = true;
  try {
    const d = event.data;
    const body: any = {
      title: d.title,
      description: d.description || undefined,
      thumbnail: d.thumbnail || undefined,
      poster: d.poster || undefined,
      origin: d.origin || undefined,
      firstAiredYear: d.firstAiredYear,
      lastAiredYear: d.lastAiredYear,
      rating: d.rating || undefined,
      featured: d.featured,
      status: d.status,
    };

    if (isEdit.value) {
      await useApi(`/api/series/${props.series?.id}`, { method: "PUT", body });
    } else {
      await useApi("/api/series", { method: "POST", body });
    }

    toast.add({
      title: isEdit.value ? "Series updated" : "Series created",
      color: "success",
      icon: "i-lucide-check-circle",
    });
    open.value = false;
    emits("saved");
  } catch {
    toast.add({
      title: `Failed to ${isEdit.value ? "update" : "create"} series`,
      color: "error",
      icon: "i-lucide-x-circle",
    });
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="isEdit ? 'Edit Series' : 'Create Series'"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField name="title" label="Title" required>
          <UInput v-model="state.title" placeholder="Series title" class="w-full" />
        </UFormField>

        <UFormField name="description" label="Description">
          <UTextarea
            v-model="state.description"
            placeholder="Description"
            :rows="3"
            class="w-full"
          />
        </UFormField>

        <div class="grid grid-cols-2 gap-4">
          <UFormField name="thumbnail" label="Thumbnail URL">
            <UInput v-model="state.thumbnail" placeholder="https://..." class="w-full" />
          </UFormField>
          <UFormField name="poster" label="Poster URL">
            <UInput v-model="state.poster" placeholder="https://..." class="w-full" />
          </UFormField>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <UFormField name="origin" label="Origin">
            <USelect v-model="state.origin" :items="ORIGIN_OPTIONS" class="w-full" />
          </UFormField>
          <UFormField name="rating" label="Rating">
            <UInput v-model="state.rating" placeholder="8.5" />
          </UFormField>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <UFormField name="firstAiredYear" label="First Aired Year">
            <UInput v-model.number="state.firstAiredYear" type="number" placeholder="2024" />
          </UFormField>
          <UFormField name="lastAiredYear" label="Last Aired Year">
            <UInput v-model.number="state.lastAiredYear" type="number" placeholder="2025" />
          </UFormField>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <UFormField name="status" label="Status">
            <USelect v-model="state.status" :items="STATUS_OPTIONS" class="w-full" />
          </UFormField>
          <UFormField name="featured" label="Featured">
            <div class="pt-1">
              <USwitch v-model="state.featured" />
            </div>
          </UFormField>
        </div>
      </UForm>
    </template>

    <template #footer="{ close }">
      <UButton label="Cancel" variant="ghost" @click="close" />
      <UButton :label="isEdit ? 'Update' : 'Create'" :loading="saving" @click="formRef?.submit()" />
    </template>
  </UModal>
</template>
