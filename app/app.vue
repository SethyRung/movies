<script setup lang="ts">
import gsap from "gsap";
import ScrollSmoother from "gsap/ScrollSmoother";
import ScrollTrigger from "gsap/ScrollTrigger";

onMounted(() => {
  gsap.registerPlugin(ScrollSmoother, ScrollTrigger);
});
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
