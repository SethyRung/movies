import gsap from "gsap";

export default defineNuxtPlugin((nuxtApp) => {
  // Provide GSAP to the Nuxt app
  nuxtApp.provide("gsap", gsap);

  // Also make it available globally for components that use it directly
  if (import.meta.client) {
    (window as Window & { gsap: typeof gsap }).gsap = gsap;
  }
});

// TypeScript declarations
declare module "#app" {
  interface NuxtApp {
    $gsap: typeof gsap;
  }
}

declare global {
  interface Window {
    gsap: typeof import("gsap");
  }
  const gsap: typeof import("gsap");
}
