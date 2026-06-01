<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const props = defineProps<{
  genre?: any;
}>();

const open = defineModel<boolean>("open", { default: undefined });

const emits = defineEmits<{
  saved: [];
}>();

const toast = useToast();
const saving = ref(false);
const isEdit = computed(() => !!props.genre?.id);

const schema = z.object({
  name: z.string("Name is required").min(1, "Name is required"),
  slug: z
    .string("Slug is required")
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Only lowercase letters, numbers, and hyphens"),
});

type Schema = z.infer<typeof schema>;

const state = reactive<Partial<Schema>>({
  name: props.genre?.name ?? undefined,
  slug: props.genre?.slug ?? undefined,
});

watch(
  () => props.genre,
  (genre) => {
    state.name = genre?.name ?? undefined;
    state.slug = genre?.slug ?? undefined;
  },
);

const formRef = useTemplateRef("formRef");

async function onSubmit(event: FormSubmitEvent<Schema>) {
  saving.value = true;
  try {
    const d = event.data;
    const body: any = {
      name: d.name,
      slug: d.slug,
    };

    if (isEdit.value) {
      await useApi(`/api/genres/${props.genre?.id}`, { method: "PUT", body });
    } else {
      await useApi("/api/genres", { method: "POST", body });
    }

    toast.add({
      title: isEdit.value ? "Genre updated" : "Genre created",
      color: "success",
      icon: "i-lucide-check-circle",
    });
    open.value = false;
    emits("saved");
  } catch {
    toast.add({
      title: `Failed to ${isEdit.value ? "update" : "create"} genre`,
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
    :title="isEdit ? 'Edit Genre' : 'Create Genre'"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField name="name" label="Name" required>
          <UInput v-model="state.name" placeholder="Genre name" class="w-full" />
        </UFormField>

        <UFormField name="slug" label="Slug" required>
          <UInput v-model="state.slug" placeholder="genre-slug" class="w-full" />
        </UFormField>
      </UForm>
    </template>

    <template #footer="{ close }">
      <UButton label="Cancel" variant="ghost" @click="close" />
      <UButton :label="isEdit ? 'Update' : 'Create'" :loading="saving" @click="formRef?.submit()" />
    </template>
  </UModal>
</template>
