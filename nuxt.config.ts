import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: "2024-11-27",
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
  hub: {
    db: "postgresql",
    kv: true,
    blob: true,
  },
  nitro: {
    experimental: {
      tasks: true,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
