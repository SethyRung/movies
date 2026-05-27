<script setup lang="ts">
import gsap from "gsap";

import { isSuccessResponse } from "#shared/types";

const NuxtLink = resolveComponent("NuxtLink");

const user = useUser();

const menuOpen = ref(false);

const menuRef = useTemplateRef("menuRef");

const route = useRoute();

const navItems = computed(() => [
  { icon: "i-lucide-home", label: "Home", to: "/" },
  { icon: "i-lucide-film", label: "Movies", to: "/movies" },
  { icon: "i-lucide-tv", label: "TV Series", to: "/tv-series" },
]);

const userItems = computed(() => [
  { label: "My List", icon: "i-lucide:bookmark", to: "/my-list" },
  { label: "Watch History", icon: "i-lucide:history", to: "/history" },
  { label: "Sign Out", icon: "i-lucide:log-out", onSelect: logout },
]);

const { y } = useWindowScroll();
const locked = useScrollLock(window);

const scrolled = computed(() => y.value >= 56);

const [DefineTemplate, ReuseTemplate] = createReusableTemplate<{
  item: {
    icon: string;
    label: string;
    to?: string;
    onSelect?: () => void;
  };
}>();

function checkActiveLink(to: string | undefined) {
  if (!to) return false;

  return route.path === to || (to !== "/" && route.path.startsWith(to));
}

async function logout() {
  const res = await useApi("/api/auth/logout", { method: "POST" });
  if (isSuccessResponse(res)) {
    user.value = null;
    await navigateTo("/");
  }
  menuOpen.value = false;
}

let tl: gsap.core.Timeline | null = null;

function animateMobileMenu(open: boolean) {
  locked.value = open;
  menuOpen.value = open;

  if (open) {
    tl?.play();
  } else {
    tl?.reverse();
  }
}

onMounted(() => {
  if (menuRef.value) {
    tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    tl.to(".menu-overlay", {
      display: "block",
      opacity: 1,
      duration: 0.1,
    });

    tl.to(menuRef.value, { display: "block", height: "auto", opacity: 1, duration: 0.4 });

    tl.from(".menu-item", { x: -30, opacity: 0, duration: 0.4, stagger: 0.06 }, 0.1);

    tl.fromTo(".menu-divider", { scaleX: 0 }, { scaleX: 1, duration: 0.3 }, 0.2);

    tl.pause();
  }
});

onUnmounted(() => {
  tl?.reverse();
});
</script>

<template>
  <DefineTemplate v-slot="{ item }">
    <component
      :is="item.to ? NuxtLink : 'button'"
      :to="item.to ?? ''"
      class="menu-item w-full px-4 py-3 flex items-center gap-3 text-sm tracking-widest uppercase transition-colors cursor-pointer"
      :class="[
        checkActiveLink(item.to)
          ? 'text-primary-500 bg-primary-500/5'
          : 'text-stone-400 hover:text-primary-400',
      ]"
      @click="
        () => {
          if (item.onSelect) {
            item.onSelect();
          }
          animateMobileMenu(false);
        }
      "
    >
      <UIcon :name="item.icon" />
      {{ item.label }}
    </component>
  </DefineTemplate>

  <header class="w-full fixed top-0 left-0 z-100 transition-all">
    <div
      class="w-full absolute top-0 left-0 z-100"
      :class="
        scrolled || menuOpen
          ? 'bg-background/85 backdrop-blur-md shadow-lg shadow-black/30'
          : 'bg-transparent'
      "
    >
      <div class="px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-14">
          <NuxtLink to="/" class="group flex items-center gap-3">
            <div class="relative">
              <div
                class="w-8 h-8 border border-primary-500/40 group-hover:border-primary-500 rotate-45 flex items-center justify-center transition-colors duration-300"
              >
                <UIcon name="i-lucide-clapperboard" class="w-4 h-4 text-primary-500 -rotate-45" />
              </div>
            </div>
            <p
              class="text-xl font-bold tracking-[0.15em] group-hover:text-primary-400 transition-colors"
            >
              <span class="text-primary-50"> CINE </span>
              <span class="text-primary-500"> MAX </span>
            </p>
          </NuxtLink>

          <nav class="hidden md:flex items-center gap-1">
            <NuxtLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              class="relative px-4 py-2 text-sm tracking-widest uppercase transition-colors duration-300"
              :class="[
                checkActiveLink(item.to)
                  ? 'text-primary-500'
                  : 'text-stone-400 hover:text-primary-400',
              ]"
            >
              <span class="flex items-center gap-2">
                <UIcon :name="item.icon" class="w-4 h-4" />
                {{ item.label }}
              </span>
              <div
                v-if="checkActiveLink(item.to)"
                class="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary-500"
              />
            </NuxtLink>
          </nav>

          <div class="flex items-center gap-2">
            <UButton
              icon="i-lucide-search"
              to="/search"
              variant="ghost"
              class="text-stone-400 hover:text-primary-400"
            />

            <UDropdownMenu v-if="user" :items="userItems">
              <UButton
                icon="i-lucide-user"
                variant="ghost"
                class="text-stone-400 hover:text-primary-400 hidden md:inline-flex"
              />
            </UDropdownMenu>

            <UButton
              v-else
              to="/auth"
              variant="ghost"
              class="text-stone-400 hover:text-primary-400 tracking-widest text-xs uppercase"
            >
              <UIcon name="i-lucide-log-in" class="w-4 h-4" />
              <span class="hidden sm:inline">Sign In</span>
            </UButton>

            <UButton
              variant="ghost"
              class="text-stone-400 hover:text-primary-400 md:hidden"
              @click="animateMobileMenu(!menuOpen)"
            >
              <UIcon :name="menuOpen ? 'i-lucide-x' : 'i-lucide-menu'" class="w-5 h-5" />
            </UButton>
          </div>
        </div>
      </div>

      <div
        ref="menuRef"
        class="hidden h-0 opacity-0 md:hidden bg-background/85 backdrop-blur-md shadow-lg shadow-black/30"
      >
        <nav class="px-4 py-4 space-y-2">
          <ReuseTemplate v-for="item in navItems" :key="item.to" :item="item" />

          <div class="menu-divider h-px bg-stone-800/50 my-2 origin-left" />

          <template v-if="user">
            <ReuseTemplate v-for="item in userItems" :key="item.to" :item="item" />
          </template>

          <ReuseTemplate
            v-else
            :item="{
              icon: 'i-lucide:log-in',
              label: 'Sign In',
              to: '/auth',
            }"
          />
        </nav>
      </div>
    </div>

    <div
      class="menu-overlay hidden w-screen h-screen bg-background/50 backdrop-blur opacity-0 absolute top-0 left-0 z-99"
      @click="animateMobileMenu(false)"
    ></div>
  </header>
</template>
