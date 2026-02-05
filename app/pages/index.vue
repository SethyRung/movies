<script setup lang="ts">
useHead({
  title: "MovieStream - Watch Movies & TV Series Online",
  meta: [
    {
      name: "description",
      content:
        "Stream your favorite movies and TV series online. Watch anytime, anywhere.",
    },
  ],
});

const { status, data } = useAsyncData(
  "home",
  async () => {
    const [movies, featuredMovies, series, featuredSeries] = await Promise.all([
      $fetch("/api/movies", {
        query: {
          status: "active",
        },
      }),
      $fetch("/api/movies", {
        query: {
          featured: true,
        },
      }),
      $fetch("/api/series", {
        query: {
          status: "active",
        },
      }),
      $fetch("/api/series", {
        query: {
          featured: true,
        },
      }),
    ]);

    return {
      movies,
      featuredMovies,
      series,
      featuredSeries,
    };
  },
  {
    lazy: true,
  },
);
</script>

<template>
  <div class="min-h-screen bg-background">
    <NoContent />
  </div>
</template>
