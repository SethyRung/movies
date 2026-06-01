<script setup lang="ts">
type EmbedType = (typeof VALID_EMBED_TYPES)[number];

const props = defineProps<{
  src: string;
  embedType: EmbedType | string;
}>();

const iframeAllow = computed(() => {
  switch (props.embedType) {
    case "youtube":
      return "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    case "vimeo":
      return "autoplay; fullscreen; picture-in-picture";
    case "dailymotion":
      return "autoplay; fullscreen";
    case "okru":
      return "autoplay; fullscreen; screen-wake-lock";
    case "facebook":
      return "autoplay; encrypted-media; picture-in-picture";
    case "gdrive":
      return "autoplay";
    default:
      return "autoplay; fullscreen; encrypted-media";
  }
});

const iframeSandbox = computed(() => {
  switch (props.embedType) {
    case "direct":
      return undefined;
    default:
      return "allow-scripts allow-same-origin allow-popups allow-forms";
  }
});

const computedSrc = computed(() => {
  if (!props.src) return "";

  if (props.embedType === "facebook") {
    const encoded = encodeURIComponent(props.src);
    return `https://www.facebook.com/plugins/video.php?href=${encoded}&show_text=false&autoplay=true`;
  }

  return props.src;
});
</script>

<template>
  <div class="relative size-full bg-black overflow-hidden">
    <iframe
      v-if="props.embedType !== 'mp4'"
      ref="iframeRef"
      :src="computedSrc"
      :allow="iframeAllow"
      :sandbox="iframeSandbox"
      class="absolute inset-0 size-full border-0"
    />

    <video
      v-else
      ref="videoRef"
      controls
      autoplay
      playsinline
      class="absolute inset-0 size-full object-contain"
    >
      <source :src="src" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  </div>
</template>
