<script setup lang="ts">
import ScrollSmoother from "gsap/ScrollSmoother";

let smoother: ScrollSmoother | null = null;

onMounted(() => {
  smoother = ScrollSmoother.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    smooth: 1.25,
  });
});

onBeforeUnmount(() => {
  if (smoother) {
    smoother.kill();
    smoother = null;
  }
});
</script>

<template>
  <div id="smooth-wrapper">
    <div id="smooth-content">
      <slot></slot>
    </div>
  </div>
</template>
