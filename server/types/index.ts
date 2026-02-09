export interface PublicRoute {
  path: string;
  methods: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
}

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

export interface CreateSeriesBody {
  title: string;
  description?: string;
  thumbnail?: string;
  poster?: string;
  firstAiredYear?: number;
  lastAiredYear?: number;
  rating?: string;
  featured?: boolean;
  status?: string;
  createdBy?: string;
}

export interface UpdateSeriesBody {
  title?: string;
  description?: string;
  thumbnail?: string;
  poster?: string;
  firstAiredYear?: number;
  lastAiredYear?: number;
  rating?: string;
  featured?: boolean;
  status?: string;
}

export interface CreateSeasonBody {
  seriesId: string;
  seasonNumber: number;
  title?: string;
  description?: string;
  thumbnail?: string;
  releaseYear?: number;
}

export interface UpdateSeasonBody {
  seasonNumber?: number;
  title?: string;
  description?: string;
  thumbnail?: string;
  releaseYear?: number;
}

export interface CreateEpisodeBody {
  seasonId: string;
  episodeNumber: number;
  duration?: number;
  embedUrl: string;
  embedType: string;
}

export interface UpdateEpisodeBody {
  episodeNumber?: number;
  duration?: number;
  embedUrl?: string;
  embedType?: string;
}

export interface CreateGenreBody {
  name: string;
  slug: string;
}

export interface UpdateGenreBody {
  name?: string;
  slug?: string;
}

export interface CreateMovieViewBody {
  movieId: string;
  progressSeconds?: number;
  completed?: boolean;
}

export interface UpdateMovieViewBody {
  progressSeconds?: number;
  completed?: boolean;
}

export interface CreateEpisodeViewBody {
  episodeId: string;
  sessionId?: string;
  progressSeconds?: number;
  completed?: boolean;
}

export interface UpdateEpisodeViewBody {
  sessionId?: string;
  progressSeconds?: number;
  completed?: boolean;
}

export interface LoginBody {
  email: string;
  password: string;
}
