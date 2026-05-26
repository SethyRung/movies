<script setup lang="ts">
import gsap from "gsap";

const route = useRoute();
const user = useUser();

const navItems = [
  { label: "Home", to: "/" },
  { label: "Movies", to: "/movies" },
  { label: "TV Series", to: "/tv-series" },
];

const { y: scrollY } = useWindowScroll();

async function logout() {
  const res = await useApi("/api/auth/logout", { method: "POST" });
  if (isSuccessResponse(res)) {
    user.value = null;
    await navigateTo("/");
  }
}

const userMenuItems = [
  [
    { label: "My List", icon: "i-lucide-bookmark", to: "/my-list" },
    { label: "History", icon: "i-lucide-clock", to: "/history" },
  ],
  [{ label: "Logout", icon: "i-lucide-log-out", onSelect: logout }],
];

function animateMobileMenu(value: boolean) {
  if (value) {
    nextTick(() => {
      gsap.fromTo(
        ".menu-item",
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          stagger: 0.08,
          delay: 0.1,
          ease: "power2.out",
        },
      );
    });
  }
}

onBeforeUnmount(() => {
  gsap.killTweensOf(".menu-item");
});
</script>

<template>
  <UHeader
    mode="slideover"
    :ui="{
      root: [
        'w-full fixed border-b-0',
        scrollY > 50
          ? 'bg-neutral-950 shadow-lg'
          : 'bg-gradient-to-b from-neutral-950/80 via-neutral-950/40 to-transparent backdrop-blur-none',
      ],
      container: 'gap-6 md:gap-8',
      left: 'lg:flex-none',
      content: 'bg-neutral-950',
    }"
    @update:open="animateMobileMenu"
  >
    <template #left>
      <NuxtLink to="/" class="flex items-center gap-2 group" aria-label="Cine Max Home">
        <div
          class="w-8 h-8 md:w-10 md:h-10 rounded bg-linear-to-br from-primary-500 to-primary-600 flex items-center justify-center transition-transform group-hover:scale-110"
        >
          <span class="text-white font-bold text-lg md:text-xl">C</span>
        </div>
        <span class="hidden sm:block text-xl md:text-2xl font-bold text-white">
          CINE<span class="text-primary-500">MAX</span>
        </span>
      </NuxtLink>
    </template>

    <nav class="hidden lg:flex items-center gap-6">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="relative text-sm text-white/80 hover:text-white transition-colors group"
        active-class="text-white font-semibold"
      >
        {{ item.label }}
        <span
          class="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"
          :class="{ 'scale-x-100': route.path === item.to }"
        />
      </NuxtLink>
    </nav>

    <template #right>
      <UButton icon="i-lucide:search" color="neutral" variant="ghost" />

      <UDropdownMenu v-if="user" :items="userMenuItems" :content="{ align: 'end', sideOffset: 8 }">
        <UButton variant="ghost" color="neutral" class="p-0">
          <UAvatar :alt="user.name" size="sm" />
        </UButton>
      </UDropdownMenu>

      <UButton v-else label="Sign in" to="/auth" size="sm" />
    </template>

    <template #body>
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="menu-item flex items-center px-3.5 py-2.5 rounded-lg text-white hover:bg-neutral-800"
        active-class="bg-neutral-800"
      >
        {{ item.label }}
      </NuxtLink>

      <div class="menu-item border-t border-neutral-800 mt-2 pt-2">
        <template v-if="user">
          <UButton
            label="My List"
            to="/my-list"
            color="neutral"
            variant="ghost"
            icon="i-lucide-bookmark"
            block
          />
          <UButton
            label="History"
            to="/history"
            color="neutral"
            variant="ghost"
            icon="i-lucide-clock"
            block
          />
          <UButton
            label="Sign out"
            color="neutral"
            variant="ghost"
            icon="i-lucide-log-out"
            block
            @click="logout"
          />
        </template>
        <UButton v-else label="Sign in" to="/auth" block />
      </div>
    </template>
  </UHeader>
</template>
