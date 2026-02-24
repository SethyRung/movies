export default defineAppConfig({
  ui: {
    colors: {
      neutral: "neutral",
      primary: "sky",
    },
    header: {
      slots: {
        root: "bg-default/75 backdrop-blur border-b border-default h-(--ui-header-height) sticky top-0 z-50",
        container: "flex items-center justify-between gap-3 h-full",
        left: "lg:flex-1 flex items-center gap-1.5",
        center: "hidden lg:flex",
        right: "flex items-center justify-end lg:flex-1 gap-1.5",
        title: "shrink-0 font-bold text-xl text-highlighted flex items-end gap-1.5",
        toggle: "lg:hidden",
        content: "lg:hidden",
        overlay: "lg:hidden fixed inset-0 z-[51] bg-elevated/75",
        header: "px-4 sm:px-6 h-(--ui-header-height) shrink-0 flex items-center justify-between gap-3 relative z-[52]",
        body: "p-4 sm:p-6 overflow-y-auto relative z-[52]",
      },
    },
    slideover: {
      slots: {
        overlay: "fixed inset-0 z-[51] bg-elevated/75",
        content: "fixed bg-default divide-y divide-default sm:ring ring-default sm:shadow-lg flex flex-col focus:outline-none z-[52]",
        header: "flex items-center gap-1.5 p-4 sm:px-6 min-h-16 relative z-[53]",
        body: "flex-1 overflow-y-auto p-4 sm:p-6 relative z-[53]",
      },
    },
  },
});
