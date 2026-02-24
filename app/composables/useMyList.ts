import type { Movie, TVSeries } from "#shared/types";

const MY_LIST_STORAGE_KEY = "cine-max-my-list";

export type MediaItem = Movie | TVSeries;

interface MyListState {
  items: string[];
}

/**
 * Composable for managing user's watchlist (My List) using localStorage
 */
export function useMyList() {
  const items = ref<string[]>([]);
  const isLoaded = ref(false);

  // Load from localStorage on client
  const loadFromStorage = () => {
    if (!import.meta.client) return;

    try {
      const stored = localStorage.getItem(MY_LIST_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as MyListState;
        items.value = parsed.items || [];
      }
    } catch (error) {
      console.error("Failed to load My List from localStorage:", error);
      items.value = [];
    }
    isLoaded.value = true;
  };

  // Save to localStorage
  const saveToStorage = () => {
    if (!import.meta.client) return;

    try {
      const state: MyListState = { items: items.value };
      localStorage.setItem(MY_LIST_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save My List to localStorage:", error);
    }
  };

  // Check if item is in list
  const isInList = (mediaId: string): boolean => {
    return items.value.includes(mediaId);
  };

  // Add item to list
  const addToList = (media: MediaItem): void => {
    if (!items.value.includes(media.id)) {
      items.value = [...items.value, media.id];
      saveToStorage();
    }
  };

  // Remove item from list
  const removeFromList = (mediaId: string): void => {
    if (items.value.includes(mediaId)) {
      items.value = items.value.filter((id) => id !== mediaId);
      saveToStorage();
    }
  };

  // Toggle item in list
  const toggleListItem = (media: MediaItem): boolean => {
    if (isInList(media.id)) {
      removeFromList(media.id);
      return false;
    } else {
      addToList(media);
      return true;
    }
  };

  // Clear all items
  const clearList = (): void => {
    items.value = [];
    saveToStorage();
  };

  // Get count of items
  const itemCount = computed(() => items.value.length);

  // Load on mount (client-side only)
  onMounted(() => {
    loadFromStorage();
  });

  // Initialize if on client
  if (import.meta.client && !isLoaded.value) {
    loadFromStorage();
  }

  return {
    items: readonly(items),
    isLoaded,
    isInList,
    addToList,
    removeFromList,
    toggleListItem,
    clearList,
    itemCount,
  };
}
