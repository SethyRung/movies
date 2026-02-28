<script setup lang="ts">
import type { EmbedType } from "~/utils/embedHtml";

interface Props {
  src: string;
  embedType: EmbedType;
  videoId: string;
  poster?: string;
  autoplay?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  autoplay: false,
  embedType: "mp4",
});

const emit = defineEmits<{
  play: [];
  pause: [];
  ended: [];
  timeUpdate: [currentTime: number, duration: number];
  error: [error: string];
}>();

// Player state
const videoRef = ref<HTMLVideoElement | null>(null);
const containerRef = ref<HTMLElement | null>(null);

const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const volume = ref(1);
const isMuted = ref(false);
const playbackRate = ref(1);
const isFullscreen = ref(false);
const isBuffering = ref(false);
const isPiP = ref(false);
const error = ref<string | null>(null);

// Controls visibility
const showControls = ref(true);
const controlsTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

// Is native video (can have full custom controls)
const isNativeVideo = computed(() => props.embedType === "mp4" || props.embedType === "direct");

// Is iframe video (YouTube/Vimeo)
const isIframe = computed(() => props.embedType === "youtube" || props.embedType === "vimeo");

// Generate iframe embed HTML
const iframeSrc = computed(() => {
  if (!isIframe.value) return "";

  if (props.embedType === "youtube") {
    // Extract video ID
    const patterns = [
      /(?:youtube\.com\/embed\/)([\w-]{11})/,
      /(?:youtube\.com\/v\/)([\w-]{11})/,
      /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
      /(?:youtu\.be\/)([\w-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = props.src.match(pattern);
      if (match?.[1]) {
        const params = new URLSearchParams({
          autoplay: props.autoplay ? "1" : "0",
          controls: "1",
          rel: "0",
          modestbranding: "1",
        });
        return `https://www.youtube-nocookie.com/embed/${match[1]}?${params.toString()}`;
      }
    }
  }

  if (props.embedType === "vimeo") {
    const match = props.src.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
    if (match?.[1]) {
      return `https://player.vimeo.com/video/${match[1]}?autoplay=${props.autoplay ? 1 : 0}`;
    }
  }

  return "";
});

// Progress percentage
const progress = computed(() => {
  if (!duration.value) return 0;
  return (currentTime.value / duration.value) * 100;
});

// Formatted time strings
const formattedCurrentTime = computed(() => formatTimeDisplay(currentTime.value));
const formattedDuration = computed(() => formatTimeDisplay(duration.value));

// Playback rate options
const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];
const showRateMenu = ref(false);

// Progress bar interaction
const progressRef = ref<HTMLElement | null>(null);
const isDraggingProgress = ref(false);

// Load saved preferences
const loadPreferences = () => {
  if (!import.meta.client) return;

  try {
    const savedVolume = localStorage.getItem("cine-max-video-volume");
    if (savedVolume) {
      volume.value = parseFloat(savedVolume);
    }

    const savedRate = localStorage.getItem("cine-max-video-playback-rate");
    if (savedRate) {
      playbackRate.value = parseFloat(savedRate);
    }
  } catch (e) {
    console.error("Failed to load video preferences:", e);
  }
};

// Save preferences
const savePreferences = () => {
  if (!import.meta.client) return;

  try {
    localStorage.setItem("cine-max-video-volume", volume.value.toString());
    localStorage.setItem("cine-max-video-playback-rate", playbackRate.value.toString());
  } catch (e) {
    console.error("Failed to save video preferences:", e);
  }
};

// Progress for localStorage
const progressKey = computed(() => `cine-max-video-progress-${props.videoId}`);

const saveProgress = () => {
  if (!import.meta.client || !currentTime.value || !duration.value) return;

  try {
    localStorage.setItem(
      progressKey.value,
      JSON.stringify({
        currentTime: currentTime.value,
        duration: duration.value,
        timestamp: Date.now(),
      }),
    );
  } catch (e) {
    console.error("Failed to save video progress:", e);
  }
};

const loadProgress = (): number => {
  if (!import.meta.client) return 0;

  try {
    const saved = localStorage.getItem(progressKey.value);
    if (saved) {
      const { currentTime: savedTime } = JSON.parse(saved);
      return savedTime;
    }
  } catch (e) {
    console.error("Failed to load video progress:", e);
  }
  return 0;
};

// Video event handlers
const onTimeUpdate = () => {
  if (videoRef.value) {
    currentTime.value = videoRef.value.currentTime;
  }
};

const onLoadedMetadata = () => {
  if (videoRef.value) {
    duration.value = videoRef.value.duration;

    // Restore saved progress
    const savedTime = loadProgress();
    if (savedTime > 0 && savedTime < duration.value) {
      videoRef.value.currentTime = savedTime;
    }

    // Apply saved volume and playback rate
    videoRef.value.volume = volume.value;
    videoRef.value.playbackRate = playbackRate.value;
  }
};

const onVideoPlay = () => {
  isPlaying.value = true;
  error.value = null;
  emit("play");
};

const onVideoPause = () => {
  isPlaying.value = false;
  saveProgress();
  emit("pause");
};

const onVideoEnded = () => {
  isPlaying.value = false;
  saveProgress();
  emit("ended");
};

const onVolumeChange = () => {
  if (videoRef.value) {
    volume.value = videoRef.value.volume;
    isMuted.value = videoRef.value.muted;
    savePreferences();
  }
};

const onWaiting = () => {
  isBuffering.value = true;
};

const onCanPlay = () => {
  isBuffering.value = false;
};

const onVideoError = () => {
  error.value = "Failed to load video";
  isPlaying.value = false;
  emit("error", error.value);
};

// Control methods
const play = async () => {
  if (videoRef.value) {
    try {
      await videoRef.value.play();
    } catch (e) {
      console.error("Failed to play video:", e);
    }
  }
};

const pause = () => {
  if (videoRef.value) {
    videoRef.value.pause();
  }
};

const togglePlay = () => {
  if (isPlaying.value) {
    pause();
  } else {
    play();
  }
};

const seek = (time: number) => {
  if (videoRef.value) {
    videoRef.value.currentTime = Math.max(0, Math.min(time, duration.value));
  }
};

const seekRelative = (seconds: number) => {
  seek(currentTime.value + seconds);
};

const setVolume = (newVolume: number) => {
  if (videoRef.value) {
    videoRef.value.volume = Math.max(0, Math.min(1, newVolume));
  }
};

const toggleMute = () => {
  if (videoRef.value) {
    videoRef.value.muted = !videoRef.value.muted;
  }
};

const setPlaybackRate = (rate: number) => {
  if (videoRef.value) {
    videoRef.value.playbackRate = rate;
    playbackRate.value = rate;
    savePreferences();
  }
};

const cyclePlaybackRate = () => {
  const currentIndex = playbackRates.indexOf(playbackRate.value);
  const nextIndex = (currentIndex + 1) % playbackRates.length;
  setPlaybackRate(playbackRates[nextIndex]);
};

const toggleFullscreen = async () => {
  if (!containerRef.value) return;

  try {
    if (!document.fullscreenElement) {
      await containerRef.value.requestFullscreen();
      isFullscreen.value = true;
    } else {
      await document.exitFullscreen();
      isFullscreen.value = false;
    }
  } catch (e) {
    console.error("Fullscreen error:", e);
  }
};

const togglePiP = async () => {
  if (!videoRef.value) return;

  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
      isPiP.value = false;
    } else if (document.pictureInPictureEnabled) {
      await videoRef.value.requestPictureInPicture();
      isPiP.value = true;
    }
  } catch (e) {
    console.error("PiP error:", e);
  }
};

// Controls visibility
const showControlsTemporarily = () => {
  showControls.value = true;

  if (controlsTimeout.value) {
    clearTimeout(controlsTimeout.value);
  }

  controlsTimeout.value = setTimeout(() => {
    if (isPlaying.value) {
      showControls.value = false;
    }
  }, 3000);
};

// Progress bar interactions
const handleProgressClick = (event: MouseEvent) => {
  if (!progressRef.value || !duration.value) return;

  const rect = progressRef.value.getBoundingClientRect();
  const percent = (event.clientX - rect.left) / rect.width;
  seek(percent * duration.value);
};

const handleProgressDrag = (event: MouseEvent) => {
  if (!isDraggingProgress.value || !progressRef.value || !duration.value) return;

  const rect = progressRef.value.getBoundingClientRect();
  const percent = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  seek(percent * duration.value);
};

// Keyboard shortcuts
const handleKeydown = (event: KeyboardEvent) => {
  // Don't handle if typing in an input
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
    return;
  }

  switch (event.key.toLowerCase()) {
    case " ":
    case "k":
      event.preventDefault();
      togglePlay();
      break;
    case "arrowleft":
    case "j":
      event.preventDefault();
      seekRelative(-10);
      break;
    case "arrowright":
    case "l":
      event.preventDefault();
      seekRelative(10);
      break;
    case "arrowup":
      event.preventDefault();
      setVolume(volume.value + 0.1);
      break;
    case "arrowdown":
      event.preventDefault();
      setVolume(volume.value - 0.1);
      break;
    case "m":
      event.preventDefault();
      toggleMute();
      break;
    case "f":
      event.preventDefault();
      toggleFullscreen();
      break;
    case "p":
      event.preventDefault();
      togglePiP();
      break;
    case ">":
      event.preventDefault();
      cyclePlaybackRate();
      break;
    case "0":
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
    case "7":
    case "8":
    case "9":
      event.preventDefault();
      const percent = parseInt(event.key) / 10;
      seek(duration.value * percent);
      break;
    case "home":
      event.preventDefault();
      seek(0);
      break;
    case "end":
      event.preventDefault();
      seek(duration.value);
      break;
  }

  showControlsTemporarily();
};

// Helper function
function formatTimeDisplay(seconds: number): string {
  if (!seconds || seconds < 0) return "0:00";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const padZero = (n: number) => n.toString().padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${padZero(minutes)}:${padZero(secs)}`;
  }
  return `${minutes}:${padZero(secs)}`;
}

// Initialize
onMounted(() => {
  loadPreferences();

  // Listen for fullscreen changes
  document.addEventListener("fullscreenchange", () => {
    isFullscreen.value = !!document.fullscreenElement;
  });

  // Add keyboard listener
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  saveProgress();
  document.removeEventListener("keydown", handleKeydown);

  if (controlsTimeout.value) {
    clearTimeout(controlsTimeout.value);
  }
});

// Emit timeUpdate
watch([currentTime, duration], ([time, dur]) => {
  emit("timeUpdate", time, dur);
});
</script>

<template>
  <div
    ref="containerRef"
    class="video-player relative w-full h-full bg-black group"
    :class="{ 'cursor-none': isPlaying && !showControls }"
    @mousemove="showControlsTemporarily"
    @mouseleave="isPlaying && (showControls = false)"
  >
    <!-- Native HTML5 Video -->
    <video
      v-if="isNativeVideo"
      ref="videoRef"
      :src="src"
      :poster="poster"
      :autoplay="autoplay"
      class="w-full h-full object-contain"
      preload="metadata"
      playsinline
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
      @play="onVideoPlay"
      @pause="onVideoPause"
      @ended="onVideoEnded"
      @volumechange="onVolumeChange"
      @waiting="onWaiting"
      @canplay="onCanPlay"
      @error="onVideoError"
    />

    <!-- iframe Embed (YouTube/Vimeo) -->
    <iframe
      v-else-if="isIframe && iframeSrc"
      :src="iframeSrc"
      class="w-full h-full"
      frameborder="0"
      allow="
        accelerometer;
        autoplay;
        clipboard-write;
        encrypted-media;
        gyroscope;
        picture-in-picture;
        web-share;
      "
      allowfullscreen
    />

    <!-- Loading Spinner -->
    <Transition name="fade">
      <div
        v-if="isBuffering"
        class="absolute inset-0 flex items-center justify-center bg-black/30 z-10"
      >
        <div class="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    </Transition>

    <!-- Error State -->
    <div
      v-if="error"
      class="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20"
    >
      <UIcon name="i-lucide-alert-circle" class="w-16 h-16 text-red-400 mb-4" />
      <p class="text-white text-lg mb-2">Video Error</p>
      <p class="text-neutral-400 text-sm">{{ error }}</p>
    </div>

    <!-- Custom Controls (Native Video Only) -->
    <Transition name="fade">
      <div v-if="isNativeVideo && showControls" class="absolute inset-0 z-20">
        <!-- Top Gradient -->
        <div
          class="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/70 to-transparent"
        />

        <!-- Bottom Controls -->
        <div class="absolute bottom-0 left-0 right-0">
          <!-- Bottom Gradient -->
          <div
            class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
          />

          <div class="relative p-4">
            <!-- Progress Bar -->
            <div
              ref="progressRef"
              class="relative h-1 group/progress cursor-pointer mb-4"
              @click="handleProgressClick"
              @mousedown="isDraggingProgress = true"
              @mouseup="isDraggingProgress = false"
              @mousemove="handleProgressDrag"
            >
              <!-- Progress Background -->
              <div
                class="absolute inset-0 bg-white/30 rounded-full group-hover/progress:h-1.5 transition-all"
              />

              <!-- Progress Fill -->
              <div
                class="absolute inset-y-0 left-0 bg-primary-500 rounded-full group-hover/progress:h-1.5 transition-all"
                :style="{ width: `${progress}%` }"
              />

              <!-- Progress Handle -->
              <div
                class="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity"
                :style="{ left: `calc(${progress}% - 6px)` }"
              />
            </div>

            <!-- Controls Row -->
            <div class="flex items-center justify-between gap-4">
              <!-- Left Controls -->
              <div class="flex items-center gap-2">
                <!-- Play/Pause -->
                <button
                  class="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  :aria-label="isPlaying ? 'Pause' : 'Play'"
                  @click="togglePlay"
                >
                  <UIcon
                    :name="isPlaying ? 'i-lucide-pause' : 'i-lucide-play'"
                    class="w-5 h-5 text-white"
                  />
                </button>

                <!-- Volume -->
                <div class="flex items-center gap-1 group/volume">
                  <button
                    class="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                    :aria-label="isMuted ? 'Unmute' : 'Mute'"
                    @click="toggleMute"
                  >
                    <UIcon
                      :name="
                        isMuted || volume === 0
                          ? 'i-lucide-volume-x'
                          : volume < 0.5
                            ? 'i-lucide-volume-1'
                            : 'i-lucide-volume-2'
                      "
                      class="w-4 h-4 text-white"
                    />
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    :value="volume"
                    class="w-0 group-hover/volume:w-20 transition-all duration-200 h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                    @input="(e) => setVolume(parseFloat((e.target as HTMLInputElement).value))"
                  />
                </div>

                <!-- Time -->
                <span class="text-white text-sm ml-2">
                  {{ formattedCurrentTime }} / {{ formattedDuration }}
                </span>
              </div>

              <!-- Right Controls -->
              <div class="flex items-center gap-2">
                <!-- Playback Rate -->
                <div class="relative">
                  <button
                    class="px-2 py-1 rounded text-white text-sm font-medium hover:bg-white/10 transition-colors"
                    :aria-label="`Playback speed: ${playbackRate}x`"
                    @click="showRateMenu = !showRateMenu"
                  >
                    {{ playbackRate }}x
                  </button>

                  <!-- Rate Menu -->
                  <Transition name="fade">
                    <div
                      v-if="showRateMenu"
                      class="absolute bottom-full right-0 mb-2 py-1 bg-neutral-900/95 rounded-lg border border-neutral-700 shadow-xl"
                    >
                      <button
                        v-for="rate in playbackRates"
                        :key="rate"
                        :class="[
                          'block w-full px-4 py-1 text-sm text-left hover:bg-white/10',
                          playbackRate === rate ? 'text-primary-400' : 'text-white',
                        ]"
                        @click="
                          setPlaybackRate(rate);
                          showRateMenu = false;
                        "
                      >
                        {{ rate }}x
                      </button>
                    </div>
                  </Transition>
                </div>

                <!-- Picture in Picture -->
                <button
                  v-if="!isFullscreen"
                  class="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                  :aria-label="isPiP ? 'Exit Picture in Picture' : 'Picture in Picture'"
                  @click="togglePiP"
                >
                  <UIcon name="i-lucide-picture-in-picture-2" class="w-4 h-4 text-white" />
                </button>

                <!-- Fullscreen -->
                <button
                  class="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                  :aria-label="isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'"
                  @click="toggleFullscreen"
                >
                  <UIcon
                    :name="isFullscreen ? 'i-lucide-minimize' : 'i-lucide-maximize'"
                    class="w-4 h-4 text-white"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Center Play Button (when paused) -->
        <Transition name="scale">
          <button
            v-if="!isPlaying && !isBuffering"
            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110"
            aria-label="Play"
            @click="togglePlay"
          >
            <UIcon name="i-lucide-play" class="w-10 h-10 text-white ml-1" />
          </button>
        </Transition>
      </div>
    </Transition>

    <!-- Keyboard Shortcuts Hint (for iframe) -->
    <div v-if="isIframe" class="absolute bottom-2 right-2 text-white/40 text-xs z-10">
      Use player controls
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.2s ease;
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.8);
}
</style>
