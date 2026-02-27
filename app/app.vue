<script setup lang="ts">
import gsap from "gsap";
import ScrollSmoother from "gsap/ScrollSmoother";
import ScrollTrigger from "gsap/ScrollTrigger";
import SplitText from "gsap/SplitText";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

onMounted(() => {
  gsap.registerPlugin(ScrollSmoother, ScrollTrigger, SplitText, ScrollToPlugin);
});
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
