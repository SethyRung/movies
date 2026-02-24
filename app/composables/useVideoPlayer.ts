import type { EmbedType } from "~/utils/embedHtml";

export interface VideoPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  isFullscreen: boolean;
  isBuffering: boolean;
  isPiP: boolean;
  error: string | null;
}

const VOLUME_KEY = "cine-max-video-volume";
const PLAYBACK_RATE_KEY = "cine-max-video-playback-rate";

/**
 * Composable for video player state management
 */
export function useVideoPlayer(videoId: string, embedType: EmbedType = "mp4") {
  const videoRef = ref<HTMLVideoElement | null>(null);
  const containerRef = ref<HTMLElement | null>(null);

  // Player state
  const state = reactive<VideoPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    playbackRate: 1,
    isFullscreen: false,
    isBuffering: false,
    isPiP: false,
    error: null,
  });

  // Controls visibility
  const showControls = ref(true);
  const controlsTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

  // Load saved preferences
  const loadPreferences = () => {
    if (!import.meta.client) return;

    try {
      const savedVolume = localStorage.getItem(VOLUME_KEY);
      if (savedVolume) {
        state.volume = parseFloat(savedVolume);
      }

      const savedRate = localStorage.getItem(PLAYBACK_RATE_KEY);
      if (savedRate) {
        state.playbackRate = parseFloat(savedRate);
      }
    } catch (e) {
      console.error("Failed to load video preferences:", e);
    }
  };

  // Save preferences
  const savePreferences = () => {
    if (!import.meta.client) return;

    try {
      localStorage.setItem(VOLUME_KEY, state.volume.toString());
      localStorage.setItem(PLAYBACK_RATE_KEY, state.playbackRate.toString());
    } catch (e) {
      console.error("Failed to save video preferences:", e);
    }
  };

  // Progress for localStorage
  const progressKey = computed(() => `cine-max-video-progress-${videoId}`);

  const saveProgress = () => {
    if (!import.meta.client || !state.currentTime || !state.duration) return;

    try {
      localStorage.setItem(
        progressKey.value,
        JSON.stringify({
          currentTime: state.currentTime,
          duration: state.duration,
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
        const { currentTime } = JSON.parse(saved);
        return currentTime;
      }
    } catch (e) {
      console.error("Failed to load video progress:", e);
    }
    return 0;
  };

  // Video event handlers
  const onTimeUpdate = () => {
    if (videoRef.value) {
      state.currentTime = videoRef.value.currentTime;
    }
  };

  const onLoadedMetadata = () => {
    if (videoRef.value) {
      state.duration = videoRef.value.duration;

      // Restore saved progress
      const savedTime = loadProgress();
      if (savedTime > 0 && savedTime < state.duration) {
        videoRef.value.currentTime = savedTime;
      }

      // Apply saved volume and playback rate
      videoRef.value.volume = state.volume;
      videoRef.value.playbackRate = state.playbackRate;
    }
  };

  const onPlay = () => {
    state.isPlaying = true;
    state.error = null;
  };

  const onPause = () => {
    state.isPlaying = false;
    saveProgress();
  };

  const onEnded = () => {
    state.isPlaying = false;
    saveProgress();
  };

  const onVolumeChange = () => {
    if (videoRef.value) {
      state.volume = videoRef.value.volume;
      state.isMuted = videoRef.value.muted;
      savePreferences();
    }
  };

  const onWaiting = () => {
    state.isBuffering = true;
  };

  const onCanPlay = () => {
    state.isBuffering = false;
  };

  const onError = () => {
    state.error = "Failed to load video";
    state.isPlaying = false;
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
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const seek = (time: number) => {
    if (videoRef.value) {
      videoRef.value.currentTime = Math.max(0, Math.min(time, state.duration));
    }
  };

  const seekRelative = (seconds: number) => {
    seek(state.currentTime + seconds);
  };

  const setVolume = (volume: number) => {
    if (videoRef.value) {
      videoRef.value.volume = Math.max(0, Math.min(1, volume));
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
      state.playbackRate = rate;
      savePreferences();
    }
  };

  const cyclePlaybackRate = () => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(state.playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    setPlaybackRate(rates[nextIndex]);
  };

  const toggleFullscreen = async () => {
    if (!containerRef.value) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.value.requestFullscreen();
        state.isFullscreen = true;
      } else {
        await document.exitFullscreen();
        state.isFullscreen = false;
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
        state.isPiP = false;
      } else if (document.pictureInPictureEnabled) {
        await videoRef.value.requestPictureInPicture();
        state.isPiP = true;
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
      if (state.isPlaying) {
        showControls.value = false;
      }
    }, 3000);
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
        setVolume(state.volume + 0.1);
        break;
      case "arrowdown":
        event.preventDefault();
        setVolume(state.volume - 0.1);
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
        seek(state.duration * percent);
        break;
      case "home":
        event.preventDefault();
        seek(0);
        break;
      case "end":
        event.preventDefault();
        seek(state.duration);
        break;
    }

    showControlsTemporarily();
  };

  // Progress percentage
  const progress = computed(() => {
    if (!state.duration) return 0;
    return (state.currentTime / state.duration) * 100;
  });

  // Formatted time strings
  const formattedCurrentTime = computed(() => formatTimeDisplay(state.currentTime));
  const formattedDuration = computed(() => formatTimeDisplay(state.duration));

  // Is native video (can have full custom controls)
  const isNativeVideo = computed(() => embedType === "mp4" || embedType === "direct");

  // Initialize
  onMounted(() => {
    loadPreferences();

    // Listen for fullscreen changes
    document.addEventListener("fullscreenchange", () => {
      state.isFullscreen = !!document.fullscreenElement;
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

  return {
    // Refs
    videoRef,
    containerRef,

    // State
    state: readonly(state),
    showControls,
    progress,
    formattedCurrentTime,
    formattedDuration,
    isNativeVideo,

    // Methods
    play,
    pause,
    togglePlay,
    seek,
    seekRelative,
    setVolume,
    toggleMute,
    setPlaybackRate,
    cyclePlaybackRate,
    toggleFullscreen,
    togglePiP,
    showControlsTemporarily,

    // Event handlers
    onTimeUpdate,
    onLoadedMetadata,
    onPlay,
    onPause,
    onEnded,
    onVolumeChange,
    onWaiting,
    onCanPlay,
    onError,
  };
}

/**
 * Format seconds to MM:SS or HH:MM:SS
 */
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
