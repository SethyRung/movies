<script setup lang="ts">
import type { ApiResponse } from "#shared/types";

useSeoMeta({
  title: "My List - Cine Max",
  description: "Your saved movies and TV series to watch later.",
});

const user = useUser();

const { data, pending, refresh } = await useLazyAsyncData("watchlist", async () => {
  if (!user.value) return { items: [] };

  const res = await $fetch<
    ApiResponse<
      Array<{
        id: string;
        contentType: string;
        contentId: string;
        title: string;
        poster: string | null;
        thumbnail: string | null;
      }>
    >
  >("/api/watchlist");

  if (!isSuccessResponse(res)) return { items: [] };
  return { items: res.data };
});

const items = computed(() => data.value?.items ?? []);

async function removeFromWatchlist(id: string) {
  try {
    await useApi(`/api/watchlist/${id}`, { method: "DELETE" });
    await refresh();
    const toast = useToast();
    toast.add({ title: "Removed from your list", color: "success" });
  } catch {}
}
</script>

<template>
  <div class="min-h-screen bg-[#080808] pt-[calc(var(--ui-header-height)+2rem)]">
    <UContainer>
      <div class="mb-8">
        <p class="text-primary-500/60 tracking-[0.3em] text-xs uppercase mb-2">Your Collection</p>
        <h1 class="text-3xl md:text-4xl font-medium text-primary-50">My List</h1>
        <p class="text-stone-500 mt-2">Movies and series you've saved to watch later.</p>
      </div>

      <Loading v-if="pending" />

      <div
        v-else-if="items.length === 0"
        class="flex flex-col items-center justify-center py-32 text-center"
      >
        <div
          class="w-24 h-24 border border-stone-800 rotate-45 flex items-center justify-center mb-8"
        >
          <UIcon name="i-lucide-bookmark" class="w-8 h-8 text-stone-600 -rotate-45" />
        </div>
        <h2 class="text-xl text-stone-400 mb-2">Your list is empty</h2>
        <p class="text-stone-600 mb-6">Start adding movies and series to your watchlist.</p>
        <UButton to="/" label="Browse Content" color="neutral" variant="outline" />
      </div>

      <div
        v-else
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-16"
      >
        <div v-for="item in items" :key="item.id" class="group relative">
          <NuxtLink
            :to="
              item.contentType === 'movie'
                ? `/movies/${item.contentId}`
                : `/tv-series/${item.contentId}`
            "
            class="block"
          >
            <div class="relative rounded-lg overflow-hidden cursor-pointer">
              <div class="w-full aspect-2/3">
                <NuxtImg
                  v-if="item.poster"
                  :src="item.poster"
                  :alt="item.title"
                  class="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div
                  v-else
                  class="size-full bg-neutral-800 flex flex-col items-center justify-center gap-2"
                >
                  <UIcon name="i-mdi:movie-open" class="size-16 text-neutral-600" />
                  <span class="font-semibold text-center text-neutral-400">{{ item.title }}</span>
                </div>
              </div>
            </div>
            <p class="mt-2 text-sm text-white truncate">{{ item.title }}</p>
          </NuxtLink>
          <button
            class="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-black/70 hover:bg-red-500/80 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Remove from list"
            @click.prevent="removeFromWatchlist(item.id)"
          >
            <UIcon name="i-lucide-x" class="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </UContainer>
  </div>
</template>
