/**
 * useMediaQuery Composable
 *
 * A composable for responsive media query detection with SSR support.
 * Useful for conditional rendering and reduced motion preferences.
 *
 * NOTE: All breakpoint values are SSR-safe and only initialize on client.
 * Use the `isReady` flag to check if client-side hydration is complete.
 */

export function useMediaQuery() {
  // SSR safety flag - only true after client mount
  const isReady = ref(false);

  /**
   * Detect if the user prefers reduced motion
   * Respects accessibility preferences
   */
  const prefersReducedMotion = computed(() => {
    if (!isReady.value) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  /**
   * Detect if the device supports hover (desktop vs mobile)
   */
  const canHover = computed(() => {
    if (!isReady.value) return false;
    return window.matchMedia("(hover: hover)").matches;
  });

  /**
   * Breakpoint detection
   * Uses ref to prevent SSR hydration mismatch
   */
  const breakpoints = ref({
    sm: false,
    md: false,
    lg: false,
    xl: false,
    "2xl": false,
  });

  /**
   * Current breakpoint name
   */
  const currentBreakpoint = ref<"sm" | "md" | "lg" | "xl" | "2xl" | null>(null);

  /**
   * Check if screen is at least a certain breakpoint
   */
  const isMinWidth = (width: number) => {
    if (!isReady.value) return false;
    return window.matchMedia(`(min-width: ${width}px)`).matches;
  };

  /**
   * Check if screen is at most a certain breakpoint
   */
  const isMaxWidth = (width: number) => {
    if (!isReady.value) return false;
    return window.matchMedia(`(max-width: ${width}px)`).matches;
  };

  /**
   * Update breakpoints based on current window size
   */
  const updateBreakpoints = () => {
    if (!import.meta.client) return;

    const width = window.innerWidth;

    breakpoints.value = {
      sm: width >= 640,
      md: width >= 768,
      lg: width >= 1024,
      xl: width >= 1280,
      "2xl": width >= 1536,
    };

    if (width >= 1536) currentBreakpoint.value = "2xl";
    else if (width >= 1280) currentBreakpoint.value = "xl";
    else if (width >= 1024) currentBreakpoint.value = "lg";
    else if (width >= 768) currentBreakpoint.value = "md";
    else if (width >= 640) currentBreakpoint.value = "sm";
    else currentBreakpoint.value = null;
  };

  // Store resize listener for cleanup
  let resizeListener: (() => void) | null = null;

  // Initialize and add resize listener
  onMounted(() => {
    isReady.value = true;
    updateBreakpoints();

    resizeListener = () => updateBreakpoints();
    window.addEventListener("resize", resizeListener, { passive: true });
  });

  onUnmounted(() => {
    if (resizeListener) {
      window.removeEventListener("resize", resizeListener);
      resizeListener = null;
    }
  });

  return {
    isReady,
    prefersReducedMotion,
    canHover,
    breakpoints,
    currentBreakpoint,
    isMinWidth,
    isMaxWidth,
  };
}
