<!--
  Default Layout - Main layout wrapper for public pages
-->
<script setup lang="ts">
// Set default head
useHead({
  htmlAttrs: {
    lang: "en",
  },
  meta: [
    { charset: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { name: "format-detection", content: "telephone=no" },
  ],
  link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
});
</script>

<template>
  <div>
    <AppHeader />

    <UMain>
      <UContainer>
        <slot />
      </UContainer>
    </UMain>

    <AppFooter />
  </div>
</template>
