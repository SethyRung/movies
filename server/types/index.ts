export interface CreateMovieBody {
  title: string;
  description?: string;
  thumbnail?: string;
  poster?: string;
  duration?: number;
  embedUrl: string;
  embedType: string;
  releaseYear?: number;
  rating?: string;
  featured?: boolean;
  status?: string;
  createdBy?: string;
}

export interface UpdateMovieBody {
  title?: string;
  description?: string;
  thumbnail?: string;
  poster?: string;
  duration?: number;
  embedUrl?: string;
  embedType?: string;
  releaseYear?: number;
  rating?: string;
  featured?: boolean;
  status?: string;
}
