<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const emits = defineEmits<{
  saved: [];
}>();

const toast = useToast();
const saving = ref(false);

const schema = z.object({
  name: z.string("Name is required").min(1, "Name is required"),
  slug: z.string("Slug is required").min(1, "Slug is required"),
});

type Schema = z.infer<typeof schema>;

const state = reactive<Partial<Schema>>({
  name: "",
  slug: "",
});

watch(
  () => state.name,
  (val) => {
    state.slug = (val ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  },
);

const formRef = useTemplateRef("formRef");

async function onSubmit(event: FormSubmitEvent<Schema>) {
  saving.value = true;
  try {
    await useApi("/api/genres", {
      method: "POST",
      body: { name: event.data.name, slug: event.data.slug },
    });
    toast.add({ title: "Genre created", color: "success", icon: "i-lucide-check-circle" });
    emits("saved");
  } catch {
    toast.add({ title: "Failed to create genre", color: "error", icon: "i-lucide-x-circle" });
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <UModal title="Add Genre" :ui="{ footer: 'justify-end' }">
    <template #body>
      <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField name="name" label="Name" required>
          <UInput v-model="state.name" placeholder="e.g. Action" class="w-full" />
        </UFormField>
        <UFormField name="slug" label="Slug" required>
          <UInput v-model="state.slug" placeholder="auto-generated from name" class="w-full" />
        </UFormField>
      </UForm>
    </template>

    <template #footer="{ close }">
      <UButton label="Cancel" variant="ghost" @click="close" />
      <UButton label="Create" :loading="saving" @click="formRef?.submit()" />
    </template>
  </UModal>
</template>
