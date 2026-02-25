<script lang="ts">
import type { ComponentConfig } from "@nuxt/ui";

const theme = {
  slots: {
    root: "text-center",
    base: "flex flex-col items-center gap-4",
    leadingIcon: "text-highlighted",
    wrapper: "space-y-2",
    title: "text-xl font-semibold text-highlighted",
    description: "text-muted",
  },
};

type NoContent = ComponentConfig<typeof theme, {}, "NoContent">;

interface NoContentProps {
  icon?: string;
  title?: string;
  description?: string;
  class?: any;
  ui?: NoContent["slots"];
}
</script>

<script setup lang="ts">
import { tv } from "tailwind-variants";

const props = withDefaults(defineProps<NoContentProps>(), {
  icon: "lucide:film",
  title: "No content found",
  description: "Check back later for new releases.",
});

const ui = computed(() => tv({ extend: theme })());
</script>

<template>
  <UContainer :class="ui.root({ class: [props.class, props.ui?.root] })">
    <div :class="ui.base({ class: props.ui?.base })">
      <UIcon
        :name="props.icon"
        size="64"
        :class="ui.leadingIcon({ class: props.ui?.leadingIcon })"
      />

      <div :class="ui.wrapper({ class: props.ui?.wrapper })">
        <h2 :class="ui.title({ class: props.ui?.title })">{{ props.title }}</h2>
        <p :class="ui.description({ class: props.ui?.description })">{{ props.description }}</p>
      </div>
    </div>
  </UContainer>
</template>
