import gsap from "gsap";

export default defineNuxtPlugin((nuxtApp) => {
  // Provide GSAP to the Nuxt app
  nuxtApp.provide("gsap", gsap);

  // Also make it available globally for components that use it directly
  if (import.meta.client) {
    (window as any).gsap = gsap;
  }
});

// TypeScript declarations
declare module "#app" {
  interface NuxtApp {
    $gsap: typeof gsap;
  }
}

declare global {
  const gsap: typeof import("gsap");
}
