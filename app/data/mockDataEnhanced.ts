/**
 * Enhanced Mock Data for Streaming Website
 *
 * Comprehensive mock data matching real streaming platform metadata
 * including genres, cast, directors, maturity ratings, and more.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface CastMember {
  id: string;
  name: string;
  character: string;
  image: string | null;
}

export interface VideoMetadata {
  duration: number; // in seconds
  quality: "4K" | "1080p" | "720p";
  audio: ["Dolby Atmos", ...string[]];
  subtitles: string[];
}

export interface StreamingMovie {
  id: string;
  title: string;
  type: "movie";
  description: string;
  shortDescription: string;
  poster: string;
  thumbnail: string;
  backdrop: string;
  logo: string | null;
  trailer: string | null;
  rating: number; // 0-10
  voteCount: number;
  releaseYear: number;
  duration: number; // in minutes
  maturityRating: "G" | "PG" | "PG-13" | "R" | "NC-17" | "TV-MA" | "TV-14" | "TV-PG";
  genres: string[];
  cast: CastMember[];
  director: string;
  featured: boolean;
  trending: boolean;
  newRelease: boolean;
  top10: number | null;
  videoMetadata: VideoMetadata;
  addedDate: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StreamingSeries {
  id: string;
  title: string;
  type: "series";
  description: string;
  shortDescription: string;
  poster: string;
  thumbnail: string;
  backdrop: string;
  logo: string | null;
  trailer: string | null;
  rating: number;
  voteCount: number;
  firstAiredYear: number;
  lastAiredYear: number | null;
  seasons: number;
  episodes: number;
  maturityRating: "G" | "PG" | "PG-13" | "R" | "NC-17" | "TV-MA" | "TV-14" | "TV-PG";
  genres: string[];
  cast: CastMember[];
  creators: string[];
  featured: boolean;
  trending: boolean;
  newRelease: boolean;
  top10: number | null;
  videoMetadata: VideoMetadata;
  addedDate: string;
  status: "Running" | "Ended" | "Returning Series";
  createdAt: Date;
  updatedAt: Date;
}

export type StreamingContent = StreamingMovie | StreamingSeries;

// ============================================================================
// CAST DATA
// ============================================================================

const castDatabase: Record<string, CastMember[]> = {
  "movie-1": [
    {
      id: "c1",
      name: "Timothée Chalamet",
      character: "Paul Atreides",
      image: "https://image.tmdb.org/t/p/w200/jrJ1bREXjB2GjEqsEuaXN208M9.jpg",
    },
    {
      id: "c2",
      name: "Zendaya",
      character: "Chani",
      image: "https://image.tmdb.org/t/p/w200/ndL2Tk43DA6IWI0oNSJDrrG0uYa.jpg",
    },
    {
      id: "c3",
      name: "Rebecca Ferguson",
      character: "Lady Jessica",
      image: "https://image.tmdb.org/t/p/w200/rMWiLpNISYXEUOnp2SUxTEwiu4t.jpg",
    },
    {
      id: "c4",
      name: "Josh Brolin",
      character: "Gurney Halleck",
      image: "https://image.tmdb.org/t/p/w200/bf7iPSvxOY775wv0BKXpMLFzfTQ.jpg",
    },
  ],
  "movie-2": [
    {
      id: "c5",
      name: "Cillian Murphy",
      character: "J. Robert Oppenheimer",
      image: "https://image.tmdb.org/t/p/w200/gHoXqvu37XlsanmrL1eIwDhO3X4.jpg",
    },
    {
      id: "c6",
      name: "Emily Blunt",
      character: "Kitty Oppenheimer",
      image: "https://image.tmdb.org/t/p/w200/A7oByLSLPZ4yTWZW37VQP7yA4k.jpg",
    },
    {
      id: "c7",
      name: "Robert Downey Jr.",
      character: "Lewis Strauss",
      image: "https://image.tmdb.org/t/p/w200/im9SAqJPZKEbVZGmjXuLI4O7RvM.jpg",
    },
  ],
  "movie-3": [
    { id: "c8", name: "Christian Bale", character: "Bruce Wayne / Batman", image: null },
    { id: "c9", name: "Heath Ledger", character: "Joker", image: null },
    { id: "c10", name: "Aaron Eckhart", character: "Harvey Dent", image: null },
  ],
  "movie-4": [
    { id: "c11", name: "Matthew McConaughey", character: "Cooper", image: null },
    { id: "c12", name: "Anne Hathaway", character: "Brand", image: null },
    { id: "c13", name: "Jessica Chastain", character: "Murph", image: null },
  ],
  "movie-5": [
    { id: "c14", name: "Leonardo DiCaprio", character: "Cobb", image: null },
    { id: "c15", name: "Joseph Gordon-Levitt", character: "Arthur", image: null },
    { id: "c16", name: "Ellen Page", character: "Ariadne", image: null },
  ],
  "movie-6": [
    { id: "c17", name: "Christian Bale", character: "Bruce Wayne / Batman", image: null },
    { id: "c18", name: "Heath Ledger", character: "The Joker", image: null },
    { id: "c19", name: "Aaron Eckhart", character: "Harvey Dent", image: null },
  ],
  "series-1": [
    { id: "c20", name: "Matt Smith", character: "Daemon Targaryen", image: null },
    { id: "c21", name: "Emma D'Arcy", character: "Rhaenyra Targaryen", image: null },
    { id: "c22", name: "Olivia Cooke", character: "Alicent Hightower", image: null },
  ],
  "series-2": [
    { id: "c23", name: "Pedro Pascal", character: "Joel", image: null },
    { id: "c24", name: "Bella Ramsey", character: "Ellie", image: null },
    { id: "c25", name: "Nick Offerman", character: "Bill", image: null },
  ],
  "series-3": [
    { id: "c26", name: "Bryan Cranston", character: "Walter White", image: null },
    { id: "c27", name: "Aaron Paul", character: "Jesse Pinkman", image: null },
  ],
  "series-4": [
    { id: "c28", name: "Emilia Clarke", character: "Daenerys Targaryen", image: null },
    { id: "c29", name: "Kit Harington", character: "Jon Snow", image: null },
  ],
  "series-5": [
    { id: "c30", name: "Millie Bobby Brown", character: "Eleven", image: null },
    { id: "c31", name: "Finn Wolfhard", character: "Mike", image: null },
  ],
};

// ============================================================================
// VIDEO METADATA
// ============================================================================

const videoMetadata4K: VideoMetadata = {
  duration: 7200,
  quality: "4K",
  audio: ["Dolby Atmos", "English 5.1"],
  subtitles: ["English", "Spanish", "French", "German", "Japanese"],
};

const videoMetadata1080p: VideoMetadata = {
  duration: 7200,
  quality: "1080p",
  audio: ["English 5.1"],
  subtitles: ["English", "Spanish"],
};

// ============================================================================
// MOVIES DATA
// ============================================================================

export const enhancedMovies: StreamingMovie[] = [
  {
    id: "movie-1",
    title: "Dune: Part Two",
    type: "movie",
    description:
      "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he must prevent a terrible future only he can foresee.",
    shortDescription:
      "Paul Atreides unites with Chani and the Fremen on a warpath of revenge against the conspirators who destroyed his family.",
    poster: "https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8Py05Nxl1X.jpg",
    thumbnail: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
    logo: null,
    trailer: "Way9Dexny3w",
    rating: 8.5,
    voteCount: 8432,
    releaseYear: 2024,
    duration: 166,
    maturityRating: "PG-13",
    genres: ["Sci-Fi", "Action", "Adventure", "Drama"],
    cast: castDatabase["movie-1"] || [],
    director: "Denis Villeneuve",
    featured: true,
    trending: true,
    newRelease: true,
    top10: 1,
    videoMetadata: videoMetadata4K,
    addedDate: "2024-03-01",
    createdAt: "2024-03-01T00:00:00.000Z",
    updatedAt: "2024-03-01T00:00:00.000Z",
  },
  {
    id: "movie-2",
    title: "Oppenheimer",
    type: "movie",
    description:
      "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II. A epic biographical thriller that explores the complex moral dilemmas faced by the father of the atomic age.",
    shortDescription:
      "The story of J. Robert Oppenheimer and his role in developing the atomic bomb during World War II.",
    poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    thumbnail: "https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
    logo: null,
    trailer: "uYPbbksJxIg",
    rating: 8.9,
    voteCount: 12543,
    releaseYear: 2023,
    duration: 180,
    maturityRating: "R",
    genres: ["Drama", "Biography", "History"],
    cast: castDatabase["movie-2"] || [],
    director: "Christopher Nolan",
    featured: true,
    trending: true,
    newRelease: false,
    top10: 3,
    videoMetadata: videoMetadata4K,
    addedDate: "2023-11-21",
    createdAt: "2023-11-21",
    updatedAt: "2023-11-21",
  },
  {
    id: "movie-3",
    title: "The Batman",
    type: "movie",
    description:
      "When the Riddler, a sadistic serial killer, begins murdering key political figures in Gotham, Batman is forced to investigate the city's hidden corruption and question his family's involvement.",
    shortDescription:
      "Batman investigates Gotham's hidden corruption while hunting the Riddler serial killer.",
    poster: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fber9Tav5PXS5qG4.jpg",
    thumbnail: "https://image.tmdb.org/t/p/original/5P8SmMzSNYikXpxil6BYzJ16611.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/5P8SmMzSNYikXpxil6BYzJ16611.jpg",
    logo: null,
    trailer: "mqqft2x_Aa4",
    rating: 8.1,
    voteCount: 9876,
    releaseYear: 2022,
    duration: 176,
    maturityRating: "PG-13",
    genres: ["Action", "Crime", "Drama"],
    cast: castDatabase["movie-3"] || [],
    director: "Matt Reeves",
    featured: true,
    trending: true,
    newRelease: false,
    top10: 5,
    videoMetadata: videoMetadata4K,
    addedDate: "2022-04-18",
    createdAt: "2022-04-18",
    updatedAt: "2022-04-18",
  },
  {
    id: "movie-4",
    title: "Interstellar",
    type: "movie",
    description:
      "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival as Earth becomes increasingly uninhabitable due to crop blights and dust storms.",
    shortDescription: "Explorers travel through a wormhole to find a new home for humanity.",
    poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    thumbnail: "https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
    logo: null,
    trailer: "zSWdZVtXT7E",
    rating: 8.7,
    voteCount: 21543,
    releaseYear: 2014,
    duration: 169,
    maturityRating: "PG-13",
    genres: ["Sci-Fi", "Drama", "Adventure"],
    cast: castDatabase["movie-4"] || [],
    director: "Christopher Nolan",
    featured: false,
    trending: true,
    newRelease: false,
    top10: null,
    videoMetadata: videoMetadata4K,
    addedDate: "2020-01-01",
    createdAt: "2020-01-01",
    updatedAt: "2020-01-01",
  },
  {
    id: "movie-5",
    title: "Inception",
    type: "movie",
    description:
      "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project.",
    shortDescription: "A thief enters dreams to plant an idea instead of stealing secrets.",
    poster: "https://image.tmdb.org/t/p/w500/ljsZTbVsrQSqZgWeep9B9iMrXfs.jpg",
    thumbnail: "https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
    logo: null,
    trailer: "YoHD9XEInc0",
    rating: 8.8,
    voteCount: 34521,
    releaseYear: 2010,
    duration: 148,
    maturityRating: "PG-13",
    genres: ["Sci-Fi", "Action", "Thriller"],
    cast: castDatabase["movie-5"] || [],
    director: "Christopher Nolan",
    featured: false,
    trending: true,
    newRelease: false,
    top10: null,
    videoMetadata: videoMetadata4K,
    addedDate: "2020-01-01",
    createdAt: "2020-01-01",
    updatedAt: "2020-01-01",
  },
  {
    id: "movie-6",
    title: "The Dark Knight",
    type: "movie",
    description:
      "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    shortDescription: "Batman faces the Joker in a battle for Gotham's soul.",
    poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    thumbnail: "https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg",
    logo: null,
    trailer: "EXeTwQWrcwY",
    rating: 9.0,
    voteCount: 45678,
    releaseYear: 2008,
    duration: 152,
    maturityRating: "PG-13",
    genres: ["Action", "Crime", "Drama"],
    cast: castDatabase["movie-6"] || [],
    director: "Christopher Nolan",
    featured: false,
    trending: true,
    newRelease: false,
    top10: 2,
    videoMetadata: videoMetadata4K,
    addedDate: "2020-01-01",
    createdAt: "2020-01-01",
    updatedAt: "2020-01-01",
  },
  {
    id: "movie-7",
    title: "Avatar: The Way of Water",
    type: "movie",
    description:
      "Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na'vi race to protect their home.",
    shortDescription: "Jake Sully and his family fight to protect Pandora from a familiar threat.",
    poster: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmPA.jpg",
    thumbnail: "https://image.tmdb.org/t/p/original/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg",
    logo: null,
    trailer: "d9MyW72ELq0",
    rating: 7.8,
    voteCount: 18976,
    releaseYear: 2022,
    duration: 192,
    maturityRating: "PG-13",
    genres: ["Sci-Fi", "Action", "Adventure"],
    cast: [],
    director: "James Cameron",
    featured: false,
    trending: true,
    newRelease: false,
    top10: null,
    videoMetadata: videoMetadata4K,
    addedDate: "2023-06-01",
    createdAt: "2023-06-01",
    updatedAt: "2023-06-01",
  },
  {
    id: "movie-8",
    title: "John Wick: Chapter 4",
    type: "movie",
    description:
      "John Wick uncovers a path to defeating The High Table. But before he can earn his freedom, Wick must face off against a new enemy with powerful alliances across the globe.",
    shortDescription: "John Wick battles the High Table in his most personal mission yet.",
    poster: "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",
    thumbnail: "https://image.tmdb.org/t/p/original/7I6VUdPj6tQECNHdviJkUHD2u89.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/7I6VUdPj6tQECNHdviJkUHD2u89.jpg",
    logo: null,
    trailer: "qEVUtrk8_B4",
    rating: 8.2,
    voteCount: 12345,
    releaseYear: 2023,
    duration: 169,
    maturityRating: "R",
    genres: ["Action", "Crime", "Thriller"],
    cast: [],
    director: "Chad Stahelski",
    featured: false,
    trending: true,
    newRelease: false,
    top10: 8,
    videoMetadata: videoMetadata4K,
    addedDate: "2023-06-01",
    createdAt: "2023-06-01",
    updatedAt: "2023-06-01",
  },
  {
    id: "movie-9",
    title: "Spider-Man: No Way Home",
    type: "movie",
    description:
      "With Spider-Man's identity now revealed, Peter asks Doctor Strange for help. When a spell goes wrong, dangerous foes from other worlds start to appear, forcing Peter to discover what it truly means to be Spider-Man.",
    shortDescription: "Spider-Man faces multiverse threats in his biggest challenge yet.",
    poster: "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
    thumbnail: "https://image.tmdb.org/t/p/original/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg",
    logo: null,
    trailer: "JfVOs4VSpmA",
    rating: 8.4,
    voteCount: 28765,
    releaseYear: 2021,
    duration: 148,
    maturityRating: "PG-13",
    genres: ["Action", "Adventure", "Sci-Fi"],
    cast: [],
    director: "Jon Watts",
    featured: false,
    trending: false,
    newRelease: false,
    top10: null,
    videoMetadata: videoMetadata4K,
    addedDate: "2022-03-01",
    createdAt: "2022-03-01",
    updatedAt: "2022-03-01",
  },
  {
    id: "movie-10",
    title: "Top Gun: Maverick",
    type: "movie",
    description:
      "After thirty years, Maverick is still pushing the envelope as a top naval aviator. He must train a group of Top Gun graduates for a specialized mission while confronting his past.",
    shortDescription: "Maverick trains a new generation of pilots for an impossible mission.",
    poster: "https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
    thumbnail: "https://image.tmdb.org/t/p/original/6tDt7zN35WDmC8BrqRr7o2QYYfp.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/6tDt7zN35WDmC8BrqRr7o2QYYfp.jpg",
    logo: null,
    trailer: "qSqVVqeaDqU",
    rating: 8.3,
    voteCount: 15678,
    releaseYear: 2022,
    duration: 131,
    maturityRating: "PG-13",
    genres: ["Action", "Drama"],
    cast: [],
    director: "Joseph Kosinski",
    featured: false,
    trending: false,
    newRelease: false,
    top10: null,
    videoMetadata: videoMetadata4K,
    addedDate: "2022-06-01",
    createdAt: "2022-06-01",
    updatedAt: "2022-06-01",
  },
];

// ============================================================================
// TV SERIES DATA
// ============================================================================

export const enhancedSeries: StreamingSeries[] = [
  {
    id: "series-1",
    title: "House of the Dragon",
    type: "series",
    description:
      "The Targaryen civil war, known as the Dance of the Dragons, begins when King Viserys I breaks with tradition by naming his daughter Rhaenyra heir to the Iron Throne. The kingdom is torn apart as families choose sides.",
    shortDescription: "The prequel to Game of Thrones explores the Targaryen civil war.",
    poster: "https://image.tmdb.org/t/p/w500/z2yahl2uefxDCl0nogcRBstwruJ.jpg",
    thumbnail: "https://image.tmdb.org/t/p/original/etj8E2o0Bud0HkONVQPjyCkIvpv.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/etj8E2o0Bud0HkONVQPjyCkIvpv.jpg",
    logo: null,
    trailer: "DotnJ7tTA34",
    rating: 8.5,
    voteCount: 12453,
    firstAiredYear: 2022,
    lastAiredYear: null,
    seasons: 2,
    episodes: 18,
    maturityRating: "TV-MA",
    genres: ["Drama", "Fantasy", "Action"],
    cast: castDatabase["series-1"] || [],
    creators: ["Ryan J. Condal", "George R.R. Martin"],
    featured: true,
    trending: true,
    newRelease: true,
    top10: 4,
    videoMetadata: videoMetadata4K,
    addedDate: "2024-06-16",
    status: "Returning Series",
    createdAt: "2022-08-21",
    updatedAt: "2022-08-21",
  },
  {
    id: "series-2",
    title: "The Last of Us",
    type: "series",
    description:
      "Twenty years after a fungal outbreak ravages the planet, survivors Joel and Ellie embark on a brutal journey through the US to find a possible cure. What begins as a small job becomes a brutal cross-country journey.",
    shortDescription: "A smuggler and a teenager journey across a post-apocalyptic America.",
    poster: "https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg",
    thumbnail: "https://image.tmdb.org/t/p/original/AjTcJWslCFvGlQr4ZGuDaZmZRAA.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/AjTcJWslCFvGlQr4ZGuDaZmZRAA.jpg",
    logo: null,
    trailer: "ittT7ZblKvM",
    rating: 8.8,
    voteCount: 15678,
    firstAiredYear: 2023,
    lastAiredYear: null,
    seasons: 2,
    episodes: 18,
    maturityRating: "TV-MA",
    genres: ["Drama", "Action", "Adventure"],
    cast: castDatabase["series-2"] || [],
    creators: ["Craig Mazin", "Neil Druckmann"],
    featured: true,
    trending: true,
    newRelease: true,
    top10: 6,
    videoMetadata: videoMetadata4K,
    addedDate: "2024-01-15",
    status: "Returning Series",
    createdAt: "2023-01-15",
    updatedAt: "2023-01-15",
  },
  {
    id: "series-3",
    title: "Breaking Bad",
    type: "series",
    description:
      "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine to secure his family's future. Partnering with a former student, he descends into the criminal underworld.",
    shortDescription:
      "A chemistry teacher turned meth manufacturer faces the consequences of his choices.",
    poster: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
    thumbnail: "https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
    logo: null,
    trailer: "HhesaQXLuRY",
    rating: 9.5,
    voteCount: 54321,
    firstAiredYear: 2008,
    lastAiredYear: 2013,
    seasons: 5,
    episodes: 62,
    maturityRating: "TV-MA",
    genres: ["Drama", "Crime", "Thriller"],
    cast: castDatabase["series-3"] || [],
    creators: ["Vince Gilligan"],
    featured: false,
    trending: true,
    newRelease: false,
    top10: 7,
    videoMetadata: videoMetadata1080p,
    addedDate: "2020-01-01",
    status: "Ended",
    createdAt: "2020-01-01",
    updatedAt: "2020-01-01",
  },
  {
    id: "series-4",
    title: "Game of Thrones",
    type: "series",
    description:
      "Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia. Based on the bestselling book series by George R.R. Martin.",
    shortDescription: "Noble families wage war for the Iron Throne while an ancient evil awakens.",
    poster: "https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",
    thumbnail: "https://image.tmdb.org/t/p/original/suopoADq0k8YZr4dQXcU6pToj6s.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/suopoADq0k8YZr4dQXcU6pToj6s.jpg",
    logo: null,
    trailer: "rlR4PJn8b8I",
    rating: 8.4,
    voteCount: 45678,
    firstAiredYear: 2011,
    lastAiredYear: 2019,
    seasons: 8,
    episodes: 73,
    maturityRating: "TV-MA",
    genres: ["Drama", "Fantasy", "Action"],
    cast: castDatabase["series-4"] || [],
    creators: ["David Benioff", "D.B. Weiss"],
    featured: false,
    trending: true,
    newRelease: false,
    top10: null,
    videoMetadata: videoMetadata4K,
    addedDate: "2020-01-01",
    status: "Ended",
    createdAt: "2020-01-01",
    updatedAt: "2020-01-01",
  },
  {
    id: "series-5",
    title: "Stranger Things",
    type: "series",
    description:
      "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl. A love letter to the '80s classics that captivated a generation.",
    shortDescription: "Kids uncover government secrets and supernatural forces in 1980s Indiana.",
    poster: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    thumbnail: "https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    logo: null,
    trailer: "b9EkMc79ZSU",
    rating: 8.7,
    voteCount: 32145,
    firstAiredYear: 2016,
    lastAiredYear: null,
    seasons: 5,
    episodes: 42,
    maturityRating: "TV-14",
    genres: ["Drama", "Fantasy", "Horror"],
    cast: castDatabase["series-5"] || [],
    creators: ["The Duffer Brothers"],
    featured: false,
    trending: true,
    newRelease: true,
    top10: null,
    videoMetadata: videoMetadata4K,
    addedDate: "2022-05-27",
    status: "Returning Series",
    createdAt: "2022-05-27",
    updatedAt: "2022-05-27",
  },
  {
    id: "series-6",
    title: "The Witcher",
    type: "series",
    description:
      "Geralt of Rivia, a solitary monster hunter, struggles to find his place in a world where people often prove more wicked than beasts. But when destiny hurtles him toward a powerful sorceress and a young princess, the three must navigate the increasingly volatile Continent together.",
    shortDescription:
      "A monster hunter struggles to find his place in a world of treacherous humans.",
    poster: "https://image.tmdb.org/t/p/w500/7vjaCdMw15FEbXyLQTVa04URsPm.jpg",
    thumbnail: "https://image.tmdb.org/t/p/original/jBJWaqoSCiARWtfV0GlqHrcdidd.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/jBJWaqoSCiARWtfV0GlqHrcdidd.jpg",
    logo: null,
    trailer: "ndl1W4ltcmg",
    rating: 8.0,
    voteCount: 18765,
    firstAiredYear: 2019,
    lastAiredYear: null,
    seasons: 3,
    episodes: 24,
    maturityRating: "TV-MA",
    genres: ["Drama", "Fantasy", "Action"],
    cast: [],
    creators: ["Lauren Schmidt Hissrich"],
    featured: false,
    trending: false,
    newRelease: false,
    top10: null,
    videoMetadata: videoMetadata1080p,
    addedDate: "2020-01-01",
    status: "Returning Series",
    createdAt: "2020-01-01",
    updatedAt: "2020-01-01",
  },
  {
    id: "series-7",
    title: "Wednesday",
    type: "series",
    description:
      "Follows Wednesday Addams' years as a student, when she attempts to master her emerging psychic ability, thwart and solve the mystery that embroiled her parents. All while navigating her new relationships at Nevermore Academy.",
    shortDescription:
      "Wednesday Addams investigates a murder mystery while attending Nevermore Academy.",
    poster: "https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg",
    thumbnail: "https://image.tmdb.org/t/p/original/iHSwvRVsRyxpX7FE7GbviaDvgGZ.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/iHSwvRVsRyxpX7FE7GbviaDvgGZ.jpg",
    logo: null,
    trailer: "Di310WS8zLk",
    rating: 8.2,
    voteCount: 14321,
    firstAiredYear: 2022,
    lastAiredYear: null,
    seasons: 2,
    episodes: 16,
    maturityRating: "TV-14",
    genres: ["Comedy", "Crime", "Fantasy"],
    cast: [],
    creators: ["Alfred Gough", "Miles Millar"],
    featured: false,
    trending: false,
    newRelease: true,
    top10: null,
    videoMetadata: videoMetadata1080p,
    addedDate: "2022-11-23",
    status: "Returning Series",
    createdAt: "2022-11-23",
    updatedAt: "2022-11-23",
  },
  {
    id: "series-8",
    title: "The Mandalorian",
    type: "series",
    description:
      "After the fall of the Empire, a lone gunfighter makes his way through the outer reaches of the lawless galaxy. He is hired to retrieve a child, but ends up protecting him from those who wish to harm him.",
    shortDescription:
      "A bounty hunter protects a mysterious child in the outer reaches of the galaxy.",
    poster: "https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg",
    thumbnail: "https://image.tmdb.org/t/p/original/9ijMGlJKqcslswWUzTEwScm82Gs.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/9ijMGlJKqcslswWUzTEwScm82Gs.jpg",
    logo: null,
    trailer: "aOC8E8k_rNw",
    rating: 8.5,
    voteCount: 16789,
    firstAiredYear: 2019,
    lastAiredYear: null,
    seasons: 3,
    episodes: 24,
    maturityRating: "TV-14",
    genres: ["Action", "Adventure", "Sci-Fi"],
    cast: [],
    creators: ["Jon Favreau"],
    featured: false,
    trending: true,
    newRelease: true,
    top10: 9,
    videoMetadata: videoMetadata4K,
    addedDate: "2023-03-01",
    status: "Returning Series",
    createdAt: "2020-01-01",
    updatedAt: "2020-01-01",
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const getFeaturedContent = (): StreamingContent[] => {
  return [...getFeaturedMovies(), ...getFeaturedSeries()];
};

export const getAllContent = (): StreamingContent[] => {
  return [...enhancedMovies, ...enhancedSeries];
};

export const getFeaturedMovies = (): StreamingMovie[] => {
  return enhancedMovies.filter((m) => m.featured);
};

export const getFeaturedSeries = (): StreamingSeries[] => {
  return enhancedSeries.filter((s) => s.featured);
};

export const getTrendingContent = (limit = 10): StreamingContent[] => {
  return [...enhancedMovies, ...enhancedSeries]
    .filter((c) => c.trending)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
};

export const getNewReleases = (limit = 12): StreamingContent[] => {
  return [...enhancedMovies, ...enhancedSeries]
    .filter((c) => c.newRelease)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
};

export const getTop10 = (): StreamingContent[] => {
  return [...enhancedMovies, ...enhancedSeries]
    .filter((c) => c.top10 !== null)
    .sort((a, b) => (a.top10 || 999) - (b.top10 || 999))
    .slice(0, 10);
};

export const getContinueWatching = (limit = 6): StreamingContent[] => {
  // Mock continue watching with progress
  const items: StreamingContent[] = [
    enhancedSeries[1], // The Last of Us
    enhancedMovies[2], // The Batman
    enhancedSeries[4], // Stranger Things
    enhancedMovies[0], // Dune: Part Two
    enhancedSeries[7], // The Mandalorian
    enhancedMovies[7], // John Wick 4
  ];
  return items.slice(0, limit);
};

export const getContentById = (id: string): StreamingContent | undefined => {
  return getAllContent().find((c) => c.id === id);
};

export const getContentByGenre = (genre: string): StreamingContent[] => {
  return getAllContent().filter((c) => c.genres.includes(genre));
};

// ============================================================================
// GENRE DATA
// ============================================================================

export const allGenres = [
  { id: "action", name: "Action", color: "from-red-500 to-orange-600", icon: "i-lucide-zap" },
  { id: "sci-fi", name: "Sci-Fi", color: "from-cyan-500 to-blue-600", icon: "i-lucide-rocket" },
  {
    id: "drama",
    name: "Drama",
    color: "from-blue-500 to-indigo-600",
    icon: "i-lucide-masks-theatrical",
  },
  { id: "comedy", name: "Comedy", color: "from-yellow-400 to-orange-500", icon: "i-lucide-smile" },
  { id: "horror", name: "Horror", color: "from-gray-700 to-gray-900", icon: "i-lucide-ghost" },
  {
    id: "thriller",
    name: "Thriller",
    color: "from-purple-500 to-violet-700",
    icon: "i-lucide-bolt",
  },
  { id: "romance", name: "Romance", color: "from-pink-400 to-rose-600", icon: "i-lucide-heart" },
  {
    id: "animation",
    name: "Animation",
    color: "from-green-400 to-emerald-600",
    icon: "i-lucide-wand-2",
  },
  {
    id: "fantasy",
    name: "Fantasy",
    color: "from-violet-500 to-purple-700",
    icon: "i-lucide-sparkles",
  },
  { id: "crime", name: "Crime", color: "from-slate-600 to-zinc-800", icon: "i-lucide-shield" },
  {
    id: "adventure",
    name: "Adventure",
    color: "from-emerald-500 to-teal-600",
    icon: "i-lucide-compass",
  },
  {
    id: "biography",
    name: "Biography",
    color: "from-amber-500 to-yellow-700",
    icon: "i-lucide-book-open",
  },
];
