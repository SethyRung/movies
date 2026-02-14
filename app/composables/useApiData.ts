import type { Response, ResponseCode } from "#shared/types";

interface ApiDataOptions<T> {
  endpoint: string;
  query?: Record<string, string | number | boolean | undefined>;
  immediate?: boolean;
  transform?: (data: T[]) => T[];
}

interface ApiDataState<T> {
  data: Ref<T[]>;
  isLoading: Ref<boolean>;
  error: Ref<string | null>;
  statusCode: Ref<ResponseCode | null>;
  meta: Ref<{ total: number; limit: number; offset: number } | null>;
  refresh: () => Promise<void>;
}

export function useApiData<T = unknown>(options: ApiDataOptions<T>): ApiDataState<T> {
  const { endpoint, query = {}, immediate = true, transform } = options;

  const data = ref<T[]>([]) as Ref<T[]>;
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const statusCode = ref<ResponseCode | null>(null);
  const meta = ref<{ total: number; limit: number; offset: number } | null>(null);

  const fetchData = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      // Build query string
      const queryString = Object.entries(query)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
        .join("&");

      const url = queryString ? `/api/${endpoint}?${queryString}` : `/api/${endpoint}`;

      const response = await $fetch<Response<T[]>>(url);

      statusCode.value = response.status.code;

      if (response.status.code === "SUCCESS") {
        const rawData = Array.isArray(response.data) ? response.data : [];
        data.value = transform ? transform(rawData) : rawData;
        meta.value = response.meta || null;
      } else {
        error.value = response.status.message || "An error occurred";
        data.value = [];
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to fetch data";
      data.value = [];
      statusCode.value = "INTERNAL_ERROR";
    } finally {
      isLoading.value = false;
    }
  };

  // Fetch immediately if enabled
  if (immediate) {
    fetchData();
  }

  return {
    data,
    isLoading,
    error,
    statusCode,
    meta,
    refresh: fetchData,
  };
}
