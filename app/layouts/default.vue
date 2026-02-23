<script setup lang="ts"></script>

<template>
  <div class="relative">
    <AppHeader />

    <ScrollSmootherWrapper>
      <div class="bg-neutral-950">
        <UMain>
          <slot />
        </UMain>

        <AppFooter />
      </div>
    </ScrollSmootherWrapper>
  </div>
</template>
