<script lang="ts" setup>
definePageMeta({ layout: "auth" });

const user = useUser();

watchEffect(() => {
  if (user.value) {
    navigateTo("/");
  }
});

const activeTab = ref("login");

const tabs = [
  { label: "Sign in", value: "login" },
  { label: "Sign up", value: "signup" },
];
</script>

<template>
  <div class="py-20 space-y-4">
    <div
      class="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-primary-500/20 to-transparent"
    />
    <div
      class="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border border-primary-500/30"
    />

    <div class="text-center mb-10">
      <p class="text-primary-500/60 tracking-[0.3em] text-xs uppercase mb-3">Authentication</p>
      <h1 class="text-3xl md:text-4xl font-medium text-primary-50 tracking-tight">
        CINE<span class="text-primary-500">MAX</span>
      </h1>
      <p class="text-stone-500 text-sm mt-2">Sign in to your account or create a new one</p>
    </div>

    <UTabs
      v-model="activeTab"
      :items="tabs"
      size="xl"
      variant="link"
      :ui="{
        list: 'w-fit gap-6 border-none',
        trigger: 'data-[state=active]:text-primary-500 uppercase',
        indicator: 'bg-primary-500',
      }"
    />

    <USeparator
      icon="i-lucide:astroid"
      :ui="{
        icon: 'size-3',
      }"
    />

    <UTheme
      :props="{
        button: {
          size: 'xl',
          ui: {
            base: 'py-3 rounded-xs bg-primary-500',
          },
        },
        form: {
          ui: {
            base: 'space-y-8',
          },
        },
        input: {
          size: 'xl',
          ui: {
            root: 'w-full',
            base: 'py-3 rounded-xs',
          },
        },
      }"
    >
      <AuthLoginForm v-if="activeTab === 'login'" />

      <AuthSignupForm v-else />
    </UTheme>
  </div>
</template>
