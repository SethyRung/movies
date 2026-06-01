export default defineNuxtPlugin({
  name: "auth",
  dependsOn: ["fetch"],
  async setup() {
    const user = useUser();

    const res = await useApi<ApiResponse<AuthUser>>("/api/auth/me");

    if (res.status.code === ApiResponseCode.Success) {
      user.value = res.data;
    }
  },
});
