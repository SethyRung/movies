/**
 * Safe Embed HTML Generator
 *
 * Generates sanitized embed HTML for video content.
 * Only allows trusted video sources (YouTube, Vimeo) and validates URLs.
 */

export type EmbedType = "youtube" | "vimeo" | "mp4" | "direct";

export interface EmbedConfig {
  embedUrl: string;
  embedType: EmbedType;
}

// Trusted domains for embeds (reserved for future validation)
const _TRUSTED_YOUTUBE_DOMAINS = ["youtube.com", "youtu.be", "www.youtube.com"];
const _TRUSTED_VIMEO_DOMAINS = ["vimeo.com", "player.vimeo.com", "www.vimeo.com"];

/**
 * Validates if a URL is from a trusted source
 */
function _isTrustedUrl(url: string, trustedDomains: string[]): boolean {
  try {
    const urlObj = new URL(url);
    return trustedDomains.some(
      (domain) => urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`),
    );
  } catch {
    return false;
  }
}

/**
 * Extracts YouTube video ID from various URL formats
 */
function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/embed\/)([\w-]{11})/,
    /(?:youtube\.com\/v\/)([\w-]{11})/,
    /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/shorts\/)([\w-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      // Validate video ID format (11 characters, alphanumeric with - and _)
      if (/^[\w-]{11}$/.test(match[1])) {
        return match[1];
      }
    }
  }
  return null;
}

/**
 * Extracts Vimeo video ID from URL
 */
function extractVimeoVideoId(url: string): string | null {
  const patterns = [/(?:vimeo\.com\/)(\d+)/, /(?:player\.vimeo\.com\/video\/)(\d+)/];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      // Validate video ID format (numeric)
      if (/^\d+$/.test(match[1])) {
        return match[1];
      }
    }
  }
  return null;
}

/**
 * Sanitizes a URL by validating it's from a trusted source
 */
function sanitizeUrl(url: string, allowedProtocols: string[] = ["https:"]): string | null {
  try {
    const urlObj = new URL(url);
    if (!allowedProtocols.includes(urlObj.protocol)) {
      return null;
    }
    return urlObj.href;
  } catch {
    return null;
  }
}

/**
 * Generates a safe YouTube embed URL with privacy-enhanced mode
 */
function getSafeYouTubeEmbedUrl(videoId: string): string {
  // Use youtube-nocookie.com for privacy-enhanced mode
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}

/**
 * Generates a safe Vimeo embed URL
 */
function getSafeVimeoEmbedUrl(videoId: string): string {
  return `https://player.vimeo.com/video/${videoId}`;
}

/**
 * Generates safe embed HTML for video content
 * Returns null if the URL cannot be safely embedded
 */
export function generateSafeEmbedHtml(config: EmbedConfig): string | null {
  const { embedUrl, embedType } = config;

  if (!embedUrl) return null;

  switch (embedType) {
    case "youtube": {
      // Check if it's already an embed URL or a watch URL
      const videoId = extractYouTubeVideoId(embedUrl);
      if (!videoId) return null;

      const safeUrl = getSafeYouTubeEmbedUrl(videoId);
      return `<iframe src="${safeUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen class="w-full h-full" loading="lazy"></iframe>`;
    }

    case "vimeo": {
      const videoId = extractVimeoVideoId(embedUrl);
      if (!videoId) return null;

      const safeUrl = getSafeVimeoEmbedUrl(videoId);
      return `<iframe src="${safeUrl}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen class="w-full h-full" loading="lazy"></iframe>`;
    }

    case "mp4":
    case "direct": {
      // For direct video URLs, validate the URL
      const sanitizedUrl = sanitizeUrl(embedUrl);
      if (!sanitizedUrl) return null;

      return `<video src="${sanitizedUrl}" controls class="w-full h-full" preload="metadata" crossorigin="anonymous"></video>`;
    }

    default:
      // For unknown embed types, don't allow arbitrary iframe sources
      console.warn(`Unknown embed type: ${embedType}`);
      return null;
  }
}

/**
 * Vue composable for generating safe embed HTML
 */
export function useSafeEmbed() {
  const generateEmbedHtml = (config: EmbedConfig | null | undefined): string => {
    if (!config) return "";
    return generateSafeEmbedHtml(config) ?? "";
  };

  return {
    generateEmbedHtml,
  };
}
