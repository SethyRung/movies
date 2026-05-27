<script setup lang="ts"></script>

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
