import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: "2026-01-01",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  runtimeConfig: {
    jwt: {
      access: {
        secret: "",
        expiresIn: "",
      },
      refresh: {
        secret: "",
        expiresIn: "",
      },
    },
  },
  modules: [
    "@nuxt/ui",
    "@pinia/nuxt",
    "@vueuse/nuxt",
    "@nuxt/fonts",
    "@nuxt/image",
    "@nuxthub/core",
  ],
  icon: {
    customCollections: [
      {
        prefix: "cinemax",
        dir: "./app/assets/icons/cinemax",
      },
    ],
  },
  hub: {
    db: {
      dialect: "postgresql",
      driver: process.env.DATABASE_DRIVER as "postgres-js" | "neon-http",
    },
  },
  colorMode: {
    preference: "dark",
  },
  nitro: {
    experimental: {
      tasks: true,
    },
  },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        "gsap",
        "gsap/ScrollSmoother",
        "gsap/ScrollTrigger",
        "gsap/SplitText",
        "gsap/ScrollToPlugin",
        "tailwind-variants",
      ],
    },
  },
});
