<script setup lang="ts">
useSeoMeta({
  title: "Cine Max - Stream Movies & TV Series",
  description: "Stream your favorite movies and TV series online. Watch anytime, anywhere.",
});
</script>

<template>
  <div class="relative font-sans">
    <AppHeader />

    <ScrollSmootherWrapper>
      <div class="bg-background">
        <UMain>
          <slot />
        </UMain>

        <AppFooter />
      </div>
    </ScrollSmootherWrapper>
  </div>
</template>
