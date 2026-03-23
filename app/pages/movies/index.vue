<script setup lang="ts">
import gsap from "gsap";
import { watchDebounced } from "@vueuse/core";
import { useRouteQuery } from "@vueuse/router";

import type { Response } from "#shared/types";

const limit = 20;

const offset = useRouteQuery<number>("offset", 0, {
  transform: {
    get: (value) => {
      const single = Array.isArray(value) ? value[0] : value;
      const parsed = Number(single ?? 0);
      return Number.isFinite(parsed) ? parsed : 0;
    },
    set: (value) => (Number.isFinite(value) ? value : 0),
  },
});

const search = useRouteQuery<string | undefined, string>("search", "", {
  transform: {
    get: (value) => (Array.isArray(value) ? (value[0] ?? "") : value) ?? "",
    set: (value) => {
      const normalized = (value ?? "").trim();
      return normalized || undefined;
    },
  },
});

const sortBy = useRouteQuery<string>("sortBy", "createdAt", {
  transform: {
    get: (value) => (Array.isArray(value) ? (value[0] ?? "createdAt") : value) || "createdAt",
    set: (value) => value || "createdAt",
  },
});

const sortOrder = useRouteQuery<string>("sortOrder", "desc", {
  transform: {
    get: (value) => (Array.isArray(value) ? (value[0] ?? "desc") : value) || "desc",
    set: (value) => value || "desc",
  },
});

const { data, pending } = await useLazyAsyncData<Response<Movie[]>>(
  "movies-list",
  () =>
    $fetch<Response<Movie[]>>("/api/movies", {
      query: {
        limit,
        offset: offset.value,
        search: search.value || undefined,
        sortBy: sortBy.value,
        sortOrder: sortOrder.value,
      },
    }),
  { watch: [offset, search, sortBy, sortOrder] },
);

const movies = computed(() => data.value?.data ?? []);
const total = computed(() => data.value?.meta?.total ?? 0);
const totalPages = computed(() => Math.ceil(total.value / limit));
const currentPage = computed(() => Math.floor(offset.value / limit) + 1);

const searchInput = ref(search.value);
const lastCommittedSearch = ref<string>(search.value);

const sortOptions = [
  { label: "Recently Added", value: "createdAt" },
  { label: "Title", value: "title" },
  { label: "Rating", value: "rating" },
  { label: "Release Year", value: "releaseYear" },
];

const selectedSort = ref(sortBy.value);
const selectedSortOrder = ref(sortOrder.value);

watch(search, (value) => {
  lastCommittedSearch.value = value;
  if (searchInput.value !== value) searchInput.value = value;
});

watchDebounced(
  searchInput,
  (value) => {
    const normalized = (value ?? "").trim();
    if (normalized === lastCommittedSearch.value) return;
    lastCommittedSearch.value = normalized;
    if (offset.value !== 0) offset.value = 0;
    search.value = normalized;
  },
  { debounce: 400, maxWait: 1000 },
);

watch(sortBy, (value) => {
  if (selectedSort.value !== value) selectedSort.value = value;
});

watch(sortOrder, (value) => {
  if (selectedSortOrder.value !== value) selectedSortOrder.value = value;
});

watch(selectedSort, (value) => {
  if (value === sortBy.value) return;
  if (offset.value !== 0) offset.value = 0;
  sortBy.value = value;
});

watch(selectedSortOrder, (value) => {
  if (value === sortOrder.value) return;
  if (offset.value !== 0) offset.value = 0;
  sortOrder.value = value;
});

function toggleSortOrder() {
  selectedSortOrder.value = selectedSortOrder.value === "desc" ? "asc" : "desc";
}

function goToPage(page: number) {
  if (page === currentPage.value) return;
  const newOffset = (page - 1) * limit;
  if (newOffset === offset.value) return;
  offset.value = newOffset;
}

const contentRef = ref<HTMLElement>();
const leftCurtain = useTemplateRef("leftCurtain");
const rightCurtain = useTemplateRef("rightCurtain");

const leftCurtainEl = computed(() => leftCurtain.value?.root);
const rightCurtainEl = computed(() => rightCurtain.value?.root);

let tl: gsap.core.Timeline | null = null;

function animations() {
  if (!contentRef.value || !leftCurtainEl.value || !rightCurtainEl.value) return;

  tl?.kill();
  tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  const q = gsap.utils.selector(contentRef.value);

  tl.to(leftCurtainEl.value, { x: "-100%", duration: 1.2, ease: "power4.inOut" }, 0);
  tl.to(rightCurtainEl.value, { x: "100%", duration: 1.2, ease: "power4.inOut" }, 0);
  tl.from(q(".animate-title"), { y: 60, opacity: 0, duration: 1, ease: "power3.out" }, 0.6);
  tl.from(q(".animate-controls"), { y: 30, opacity: 0, duration: 0.6, ease: "power2.out" }, 0.8);
  tl.from(
    q(".animate-card"),
    { y: 40, opacity: 0, duration: 0.5, stagger: 0.05, ease: "power2.out" },
    1,
  );
  tl.from(q(".animate-pagination"), { y: 20, opacity: 0, duration: 0.6, ease: "power2.out" }, 1.5);
}

onMounted(() => {
  animations();
});

onUnmounted(() => tl?.kill());

useSeoMeta({
  title: "Browse Movies - Cine Max",
  description: "Explore our collection of movies at Cine Max",
});
</script>

<template>
  <div class="min-h-screen overflow-x-hidden">
    <MovieDetailCurtain ref="leftCurtain" side="left" />
    <MovieDetailCurtain ref="rightCurtain" side="right" />

    <UIcon
      name="i-cinemax-corner-left"
      :size="128"
      class="text-primary-500 absolute top-0 left-0 pointer-events-none opacity-20"
    />
    <UIcon
      name="i-cinemax-corner-right"
      :size="128"
      class="text-primary-500 absolute top-0 right-0 pointer-events-none opacity-20"
    />

    <div ref="contentRef" class="h-full">
      <UContainer>
        <div class="pt-[calc(var(--ui-header-height)+2rem)] pb-8">
          <div class="max-w-7xl mx-auto">
            <div class="mb-10">
              <p class="text-primary-500/60 tracking-[0.3em] text-xs uppercase mb-3">Browse</p>
              <h1
                class="animate-title text-4xl sm:text-5xl md:text-6xl font-medium text-primary-50 leading-tight tracking-tight"
              >
                Motion Pictures
              </h1>
            </div>

            <div class="animate-controls flex flex-col sm:flex-row gap-4 mb-10">
              <UInput
                v-model="searchInput"
                icon="i-lucide-search"
                placeholder="Search movies..."
                variant="outline"
                size="lg"
                class="flex-1"
                :ui="{
                  base: 'bg-transparent border-stone-800 text-primary-50 placeholder-stone-500 focus:border-primary-500/50',
                }"
              />

              <div class="flex gap-3">
                <USelect
                  v-model="selectedSort"
                  :items="sortOptions"
                  value-key="value"
                  variant="outline"
                  size="lg"
                  class="min-w-44"
                  :ui="{
                    base: 'bg-transparent border-stone-800 text-primary-50',
                  }"
                />

                <UButton
                  variant="outline"
                  size="lg"
                  color="neutral"
                  icon
                  class="border-stone-800 text-stone-400 hover:text-primary-500 hover:border-primary-500/50"
                  @click="toggleSortOrder"
                >
                  <UIcon
                    :name="
                      selectedSortOrder === 'desc' ? 'i-lucide-arrow-down' : 'i-lucide-arrow-up'
                    "
                    class="w-5 h-5"
                  />
                </UButton>
              </div>
            </div>

            <div v-if="pending" class="mt-6">
              <div class="flex items-center justify-between mb-6 text-stone-500 text-sm">
                <USkeleton class="h-4 w-24" />
                <USkeleton class="h-4 w-32" />
              </div>

              <div
                class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"
              >
                <div v-for="i in 10" :key="i" class="animate-skeleton-card">
                  <USkeleton class="w-full aspect-2/3 rounded-lg" />
                </div>
              </div>

              <div class="mt-12 flex items-center justify-center gap-2">
                <USkeleton class="h-10 w-10 rounded-md" />
                <USkeleton class="h-10 w-10 rounded-md" />
                <USkeleton class="h-10 w-10 rounded-md" />
              </div>
            </div>

            <div v-else-if="movies.length === 0" class="text-center py-20">
              <div
                class="w-20 h-20 border border-stone-800 rotate-45 flex items-center justify-center mx-auto mb-6"
              >
                <UIcon name="i-lucide-film" class="w-8 h-8 text-stone-600 -rotate-45" />
              </div>
              <p class="text-stone-400 text-lg mb-2">No movies found</p>
              <p class="text-stone-600 text-sm">Try adjusting your search or filters</p>
            </div>

            <template v-else>
              <div class="flex items-center justify-between mb-6 text-stone-500 text-sm">
                <span>{{ total }} movies</span>
                <span>Page {{ currentPage }} of {{ totalPages }}</span>
              </div>

              <div
                class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"
              >
                <MediaPosterCard v-for="movie in movies" :key="movie.id" :content="movie" />
              </div>

              <UPagination
                v-if="totalPages > 1"
                class="animate-pagination mt-12 flex items-center justify-center"
                :page="currentPage"
                :total="total"
                :items-per-page="limit"
                :sibling-count="1"
                :show-edges="true"
                size="sm"
                variant="outline"
                color="neutral"
                active-variant="outline"
                active-color="primary"
                :ui="{ list: 'flex items-center gap-2' }"
                @update:page="goToPage"
              />
            </template>
          </div>
        </div>
      </UContainer>

      <DecorativeDivider class="mt-16" />
    </div>
  </div>
</template>
