<script lang="ts" setup>
import { z } from "zod";

const toast = useToast();
const route = useRoute();
const router = useRouter();

const redirect = computed(() => (route.query.redirect as string) || "/");

const schema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Invalid email"),
    password: z.string().min(6, "Min 6 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const user = useUser();
const loading = ref(false);

async function onSubmit() {
  try {
    loading.value = true;

    const res = await useApi("/api/auth/register", {
      method: "post",
      body: {
        name: state.name,
        email: state.email,
        password: state.password,
      },
    });

    if (isSuccessResponse(res)) {
      user.value = res.data;
      toast.add({
        title: "Account created!",
        color: "success",
        icon: "i-lucide:circle-check",
      });
      router.replace(redirect.value);
    } else {
      toast.add({
        title: "Registration failed",
        description: res.status.message,
        color: "error",
        icon: "i-lucide:circle-x",
      });
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <UForm :schema="schema" :state="state" @submit="onSubmit">
    <UFormField name="name" label="Name" required>
      <UInput v-model="state.name" placeholder="Your name" />
    </UFormField>

    <UFormField name="email" label="Email" required>
      <UInput v-model="state.email" type="email" placeholder="you@example.com" />
    </UFormField>

    <UFormField name="password" label="Password" required>
      <UInput v-model="state.password" type="password" placeholder="••••••••" />
    </UFormField>

    <UFormField name="confirmPassword" label="Confirm password" required>
      <UInput v-model="state.confirmPassword" type="password" placeholder="••••••••" />
    </UFormField>

    <UButton
      type="submit"
      :label="loading ? 'Creating...' : 'Create account'"
      :loading="loading"
      block
    />
  </UForm>
</template>
