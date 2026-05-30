const PUBLIC_ROUTES = ["/auth", "/movies", "/tv-series", "/search"];

export default defineNuxtRouteMiddleware((to) => {
  if (to.path.startsWith("/admin")) {
    const user = useUser();
    if (!user.value || user.value.role !== "admin") {
      return navigateTo("/");
    }
    return;
  }

  if (PUBLIC_ROUTES.some((route) => to.path === "/" || to.path.startsWith(route))) {
    return;
  }

  const user = useUser();

  if (!user.value) {
    return navigateTo("/auth");
  }
});
