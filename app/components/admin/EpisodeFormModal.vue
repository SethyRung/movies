<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import { VALID_EMBED_TYPES } from "#shared/types";

const props = defineProps<{
  seasonId: string;
  episode?: any;
}>();

const open = defineModel<boolean>("open", { default: undefined });

const emits = defineEmits<{
  saved: [];
}>();

const toast = useToast();
const saving = ref(false);
const isEdit = computed(() => !!props.episode?.id);

const schema = z.object({
  episodeNumber: z.number().int().min(1, "Episode number is required"),
  duration: z.number().optional(),
  embedUrl: z.string("Embed URL is required").min(1, "Embed URL is required"),
  embedType: z.string("Embed type is required").min(1, "Embed type is required"),
});

type Schema = z.infer<typeof schema>;

const state = reactive<Partial<Schema>>({
  episodeNumber: props.episode?.episodeNumber,
  duration: props.episode?.duration || undefined,
  embedUrl: props.episode?.embedUrl,
  embedType: props.episode?.embedType,
});

watch(
  () => props.episode,
  (episode) => {
    state.episodeNumber = episode?.episodeNumber;
    state.duration = episode?.duration || undefined;
    state.embedUrl = episode?.embedUrl;
    state.embedType = episode?.embedType;
  },
);

const EMBED_TYPE_OPTIONS = VALID_EMBED_TYPES.map((t) => ({ label: t, value: t })) as {
  label: string;
  value: string;
}[];

const formRef = useTemplateRef("formRef");

async function onSubmit(event: FormSubmitEvent<Schema>) {
  saving.value = true;
  try {
    const d = event.data;
    const body: any = {
      episodeNumber: d.episodeNumber,
      duration: d.duration,
      embedUrl: d.embedUrl,
      embedType: d.embedType,
    };

    if (isEdit.value) {
      await useApi(`/api/episodes/${props.episode?.id}`, { method: "PUT", body });
    } else {
      await useApi(`/api/seasons/${props.seasonId}/episodes`, { method: "POST", body });
    }

    toast.add({
      title: isEdit.value ? "Episode updated" : "Episode created",
      color: "success",
      icon: "i-lucide-check-circle",
    });
    open.value = false;
    emits("saved");
  } catch {
    toast.add({
      title: `Failed to ${isEdit.value ? "update" : "create"} episode`,
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
    :title="isEdit ? 'Edit Episode' : 'Create Episode'"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <div class="grid grid-cols-2 gap-4">
          <UFormField name="episodeNumber" label="Episode Number" required>
            <UInput
              v-model.number="state.episodeNumber"
              type="number"
              placeholder="1"
              class="w-full"
            />
          </UFormField>
          <UFormField name="duration" label="Duration (min)">
            <UInput v-model.number="state.duration" type="number" placeholder="45" />
          </UFormField>
        </div>

        <UFormField name="embedUrl" label="Embed URL" required>
          <UInput
            v-model="state.embedUrl"
            placeholder="https://ok.ru/videoembed/..."
            class="w-full"
          />
        </UFormField>

        <UFormField name="embedType" label="Embed Type" required>
          <USelect v-model="state.embedType" :items="EMBED_TYPE_OPTIONS" class="w-full" />
        </UFormField>
      </UForm>
    </template>

    <template #footer="{ close }">
      <UButton label="Cancel" variant="ghost" @click="close" />
      <UButton :label="isEdit ? 'Update' : 'Create'" :loading="saving" @click="formRef?.submit()" />
    </template>
  </UModal>
</template>
