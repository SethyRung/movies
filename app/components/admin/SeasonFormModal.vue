<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const props = defineProps<{
  seriesId: string;
  season?: any;
}>();

const open = defineModel<boolean>("open", { default: undefined });

const emits = defineEmits<{
  saved: [];
}>();

const toast = useToast();
const saving = ref(false);
const isEdit = computed(() => !!props.season?.id);

const schema = z.object({
  seasonNumber: z.number().int().min(1, "Season number is required"),
  title: z.string().optional(),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
  releaseYear: z.number().int().min(1900).max(2100).optional(),
});

type Schema = z.infer<typeof schema>;

const state = reactive<Partial<Schema>>({
  seasonNumber: props.season?.seasonNumber,
  title: props.season?.title || undefined,
  description: props.season?.description || undefined,
  thumbnail: props.season?.thumbnail || undefined,
  releaseYear: props.season?.releaseYear || undefined,
});

watch(
  () => props.season,
  (season) => {
    state.seasonNumber = season?.seasonNumber;
    state.title = season?.title || undefined;
    state.description = season?.description || undefined;
    state.thumbnail = season?.thumbnail || undefined;
    state.releaseYear = season?.releaseYear || undefined;
  },
);

const formRef = useTemplateRef("formRef");

async function onSubmit(event: FormSubmitEvent<Schema>) {
  saving.value = true;
  try {
    const d = event.data;
    const body: any = {
      seasonNumber: d.seasonNumber,
      title: d.title || undefined,
      description: d.description || undefined,
      thumbnail: d.thumbnail || undefined,
      releaseYear: d.releaseYear,
    };

    if (isEdit.value) {
      await useApi(`/api/seasons/${props.season?.id}`, { method: "PUT", body });
    } else {
      await useApi(`/api/series/${props.seriesId}/seasons`, { method: "POST", body });
    }

    toast.add({
      title: isEdit.value ? "Season updated" : "Season created",
      color: "success",
      icon: "i-lucide-check-circle",
    });
    open.value = false;
    emits("saved");
  } catch {
    toast.add({
      title: `Failed to ${isEdit.value ? "update" : "create"} season`,
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
    :title="isEdit ? 'Edit Season' : 'Create Season'"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField name="seasonNumber" label="Season Number" required>
          <UInput
            v-model.number="state.seasonNumber"
            type="number"
            placeholder="1"
            class="w-full"
          />
        </UFormField>

        <UFormField name="title" label="Title">
          <UInput v-model="state.title" placeholder="Season title" class="w-full" />
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
          <UFormField name="releaseYear" label="Release Year">
            <UInput v-model.number="state.releaseYear" type="number" placeholder="2024" />
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
