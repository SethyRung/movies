<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import { VALID_EMBED_TYPES } from "#shared/types";

const props = defineProps<{
  movie?: Movie;
}>();

const emits = defineEmits<{
  saved: [];
}>();

const toast = useToast();
const saving = ref(false);
const isEdit = computed(() => !!props.movie);

const schema = z.object({
  title: z.string("Title is required").min(1, "Title is required"),
  description: z.string("Description is required"),
  thumbnail: z.string("Thumbnail is required"),
  poster: z.string("Poster is required"),
  embedUrl: z.string("Embed URL is required").min(1, "Embed URL is required"),
  embedType: z.string("Embed type is required").min(1, "Embed type is required"),
  origin: z.string("Origin is required"),
  duration: z.number().optional(),
  releaseYear: z.number().int().min(1900).max(2100).optional(),
  rating: z.string("Rating is required"),
  featured: z.boolean(),
  status: z.string(),
});

type Schema = z.infer<typeof schema>;

const state = reactive<Partial<Schema>>({
  title: props.movie?.title,
  description: props.movie?.description || undefined,
  thumbnail: props.movie?.thumbnail || undefined,
  poster: props.movie?.poster || undefined,
  embedUrl: props.movie?.embedUrl,
  embedType: props.movie?.embedType,
  origin: props.movie?.origin || undefined,
  duration: props.movie?.duration || undefined,
  releaseYear: props.movie?.releaseYear || undefined,
  rating: props.movie?.rating || undefined,
  featured: props.movie?.featured ?? false,
  status: props.movie?.status ?? "active",
});

const formRef = useTemplateRef("formRef");

const EMBED_TYPE_OPTIONS = VALID_EMBED_TYPES.map((t) => ({ label: t, value: t })) as {
  label: string;
  value: string;
}[];

const STATUS_OPTIONS = [
  { label: "Active", value: "active" },
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
      embedUrl: d.embedUrl,
      embedType: d.embedType,
      origin: d.origin || undefined,
      duration: d.duration,
      releaseYear: d.releaseYear,
      rating: d.rating || undefined,
      featured: d.featured,
      status: d.status,
    };

    if (isEdit.value) {
      await useApi(`/api/movies/${props.movie?.id}`, { method: "PUT", body });
    } else {
      await useApi("/api/movies", { method: "POST", body });
    }

    toast.add({
      title: isEdit.value ? "Movie updated" : "Movie created",
      color: "success",
      icon: "i-lucide-check-circle",
    });
    emits("saved");
  } catch {
    toast.add({
      title: `Failed to ${isEdit.value ? "update" : "create"} movie`,
      color: "error",
      icon: "i-lucide-x-circle",
    });
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <UModal :title="isEdit ? 'Edit Movie' : 'Create Movie'" :ui="{ footer: 'justify-end' }">
    <slot></slot>

    <template #body>
      <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField name="title" label="Title" required>
          <UInput v-model="state.title" placeholder="Movie title" class="w-full" />
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

        <UFormField name="embedUrl" label="Embed URL" required>
          <UInput
            v-model="state.embedUrl"
            placeholder="https://ok.ru/videoembed/..."
            class="w-full"
          />
        </UFormField>

        <div class="grid grid-cols-2 gap-4">
          <UFormField name="embedType" label="Embed Type" required>
            <USelect v-model="state.embedType" :items="EMBED_TYPE_OPTIONS" class="w-full" />
          </UFormField>

          <UFormField name="origin" label="Origin">
            <USelect v-model="state.origin" :items="ORIGIN_OPTIONS" class="w-full" />
          </UFormField>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <UFormField name="duration" label="Duration (min)">
            <UInput v-model="state.duration" type="number" placeholder="120" />
          </UFormField>
          <UFormField name="releaseYear" label="Release Year">
            <UInput v-model="state.releaseYear" type="number" placeholder="2024" />
          </UFormField>
          <UFormField name="rating" label="Rating">
            <UInput v-model="state.rating" placeholder="8.5" />
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

      <UButton
        form="movie-form"
        :label="isEdit ? 'Update' : 'Create'"
        :loading="saving"
        @click="formRef?.submit()"
      />
    </template>
  </UModal>
</template>
