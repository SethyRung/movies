/**
 * Shared Mock Data
 *
 * This file contains mock data that is used by both the app and server.
 * It's placed in the shared directory so it can be imported by both.
 */

// Fixed UUIDs for mock data to ensure consistency
export const MOCK_UUIDS = {
  // Movies
  "movie-1": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "movie-2": "a1b2c3d4-e5f6-7890-abcd-ef1234567891",
  "movie-3": "a1b2c3d4-e5f6-7890-abcd-ef1234567892",
  "movie-4": "a1b2c3d4-e5f6-7890-abcd-ef1234567893",
  "movie-5": "a1b2c3d4-e5f6-7890-abcd-ef1234567894",
  "movie-6": "a1b2c3d4-e5f6-7890-abcd-ef1234567895",
  "movie-7": "a1b2c3d4-e5f6-7890-abcd-ef1234567896",
  "movie-8": "a1b2c3d4-e5f6-7890-abcd-ef1234567897",
  "movie-9": "a1b2c3d4-e5f6-7890-abcd-ef1234567898",
  "movie-10": "a1b2c3d4-e5f6-7890-abcd-ef1234567899",
  // TV Series
  "series-1": "b1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "series-2": "b1b2c3d4-e5f6-7890-abcd-ef1234567891",
  "series-3": "b1b2c3d4-e5f6-7890-abcd-ef1234567892",
  "series-4": "b1b2c3d4-e5f6-7890-abcd-ef1234567893",
  "series-5": "b1b2c3d4-e5f6-7890-abcd-ef1234567894",
  "series-6": "b1b2c3d4-e5f6-7890-abcd-ef1234567895",
  "series-7": "b1b2c3d4-e5f6-7890-abcd-ef1234567896",
  "series-8": "b1b2c3d4-e5f6-7890-abcd-ef1234567897",
} as const;

// Admin user UUID
export const ADMIN_UUID = "c1b2c3d4-e5f6-7890-abcd-ef1234567890";

export interface MockMovie {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  poster: string;
  backdrop: string;
  trailer: string | null;
  duration: number;
  releaseYear: number;
  rating: number;
  genres: string[];
  featured: boolean;
  trending: boolean;
  newRelease: boolean;
  top10: number | null;
}

export interface MockSeries {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  poster: string;
  backdrop: string;
  trailer: string | null;
  firstAiredYear: number;
  lastAiredYear: number | null;
  seasons: number;
  episodes: number;
  rating: number;
  genres: string[];
  featured: boolean;
  trending: boolean;
  newRelease: boolean;
  top10: number | null;
  status: "Running" | "Ended" | "Returning Series";
}

export const mockMovies: MockMovie[] = [
  {
    id: MOCK_UUIDS["movie-1"],
    title: "Dune: Part Two",
    description:
      "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he must prevent a terrible future only he can foresee.",
    thumbnail: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
    poster: "https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8Py05Nxl1X.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
    trailer: "Way9Dexny3w",
    duration: 166,
    releaseYear: 2024,
    rating: 8.5,
    genres: ["Sci-Fi", "Action", "Adventure", "Drama"],
    featured: true,
    trending: true,
    newRelease: true,
    top10: 1,
  },
  {
    id: MOCK_UUIDS["movie-2"],
    title: "Oppenheimer",
    description:
      "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.",
    thumbnail: "https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
    poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
    trailer: "uYPbbksJxIg",
    duration: 180,
    releaseYear: 2023,
    rating: 8.9,
    genres: ["Drama", "Biography", "History"],
    featured: true,
    trending: true,
    newRelease: false,
    top10: 3,
  },
  {
    id: MOCK_UUIDS["movie-3"],
    title: "The Batman",
    description:
      "When the Riddler, a sadistic serial killer, begins murdering key political figures in Gotham, Batman is forced to investigate the city's hidden corruption.",
    thumbnail: "https://image.tmdb.org/t/p/original/5P8SmMzSNYikXpxil6BYzJ16611.jpg",
    poster: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fber9Tav5PXS5qG4.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/5P8SmMzSNYikXpxil6BYzJ16611.jpg",
    trailer: "mqqft2x_Aa4",
    duration: 176,
    releaseYear: 2022,
    rating: 8.1,
    genres: ["Action", "Crime", "Drama"],
    featured: true,
    trending: true,
    newRelease: false,
    top10: 5,
  },
  {
    id: MOCK_UUIDS["movie-4"],
    title: "Interstellar",
    description:
      "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    thumbnail: "https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
    poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
    trailer: "zSWdZVtXT7E",
    duration: 169,
    releaseYear: 2014,
    rating: 8.7,
    genres: ["Sci-Fi", "Drama", "Adventure"],
    featured: false,
    trending: true,
    newRelease: false,
    top10: null,
  },
  {
    id: MOCK_UUIDS["movie-5"],
    title: "Inception",
    description:
      "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    thumbnail: "https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
    poster: "https://image.tmdb.org/t/p/w500/ljsZTbVsrQSqZgWeep9B9iMrXfs.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
    trailer: "YoHD9XEInc0",
    duration: 148,
    releaseYear: 2010,
    rating: 8.8,
    genres: ["Sci-Fi", "Action", "Thriller"],
    featured: false,
    trending: true,
    newRelease: false,
    top10: null,
  },
  {
    id: MOCK_UUIDS["movie-6"],
    title: "The Dark Knight",
    description:
      "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.",
    thumbnail: "https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg",
    poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg",
    trailer: "EXeTwQWrcwY",
    duration: 152,
    releaseYear: 2008,
    rating: 9.0,
    genres: ["Action", "Crime", "Drama"],
    featured: false,
    trending: true,
    newRelease: false,
    top10: 2,
  },
  {
    id: MOCK_UUIDS["movie-7"],
    title: "Avatar: The Way of Water",
    description:
      "Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns, Jake must work with Neytiri to protect their home.",
    thumbnail: "https://image.tmdb.org/t/p/original/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg",
    poster: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmPA.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg",
    trailer: "d9MyW72ELq0",
    duration: 192,
    releaseYear: 2022,
    rating: 7.8,
    genres: ["Sci-Fi", "Action", "Adventure"],
    featured: false,
    trending: true,
    newRelease: false,
    top10: null,
  },
  {
    id: MOCK_UUIDS["movie-8"],
    title: "John Wick: Chapter 4",
    description:
      "John Wick uncovers a path to defeating The High Table. But before he can earn his freedom, Wick must face off against a new enemy with powerful alliances.",
    thumbnail: "https://image.tmdb.org/t/p/original/7I6VUdPj6tQECNHdviJkUHD2u89.jpg",
    poster: "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/7I6VUdPj6tQECNHdviJkUHD2u89.jpg",
    trailer: "qEVUtrk8_B4",
    duration: 169,
    releaseYear: 2023,
    rating: 8.2,
    genres: ["Action", "Crime", "Thriller"],
    featured: false,
    trending: true,
    newRelease: false,
    top10: 8,
  },
  {
    id: MOCK_UUIDS["movie-9"],
    title: "Spider-Man: No Way Home",
    description:
      "With Spider-Man's identity now revealed, Peter asks Doctor Strange for help. When a spell goes wrong, dangerous foes from other worlds start to appear.",
    thumbnail: "https://image.tmdb.org/t/p/original/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg",
    poster: "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg",
    trailer: "JfVOs4VSpmA",
    duration: 148,
    releaseYear: 2021,
    rating: 8.4,
    genres: ["Action", "Adventure", "Sci-Fi"],
    featured: false,
    trending: false,
    newRelease: false,
    top10: null,
  },
  {
    id: MOCK_UUIDS["movie-10"],
    title: "Top Gun: Maverick",
    description:
      "After thirty years, Maverick is still pushing the envelope as a top naval aviator. He must train a group of Top Gun graduates for a specialized mission.",
    thumbnail: "https://image.tmdb.org/t/p/original/6tDt7zN35WDmC8BrqRr7o2QYYfp.jpg",
    poster: "https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/6tDt7zN35WDmC8BrqRr7o2QYYfp.jpg",
    trailer: "qSqVVqeaDqU",
    duration: 131,
    releaseYear: 2022,
    rating: 8.3,
    genres: ["Action", "Drama"],
    featured: false,
    trending: false,
    newRelease: false,
    top10: null,
  },
];

export const mockSeries: MockSeries[] = [
  {
    id: MOCK_UUIDS["series-1"],
    title: "House of the Dragon",
    description:
      "The Targaryen civil war, known as the Dance of the Dragons, begins when King Viserys I breaks with tradition by naming his daughter Rhaenyra heir to the Iron Throne.",
    thumbnail: "https://image.tmdb.org/t/p/original/etj8E2o0Bud0HkONVQPjyCkIvpv.jpg",
    poster: "https://image.tmdb.org/t/p/w500/z2yahl2uefxDCl0nogcRBstwruJ.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/etj8E2o0Bud0HkONVQPjyCkIvpv.jpg",
    trailer: "DotnJ7tTA34",
    firstAiredYear: 2022,
    lastAiredYear: null,
    seasons: 2,
    episodes: 18,
    rating: 8.5,
    genres: ["Drama", "Fantasy", "Action"],
    featured: true,
    trending: true,
    newRelease: true,
    top10: 4,
    status: "Returning Series",
  },
  {
    id: MOCK_UUIDS["series-2"],
    title: "The Last of Us",
    description:
      "Twenty years after a fungal outbreak ravages the planet, survivors Joel and Ellie embark on a brutal journey through the US to find a possible cure.",
    thumbnail: "https://image.tmdb.org/t/p/original/AjTcJWslCFvGlQr4ZGuDaZmZRAA.jpg",
    poster: "https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/AjTcJWslCFvGlQr4ZGuDaZmZRAA.jpg",
    trailer: "ittT7ZblKvM",
    firstAiredYear: 2023,
    lastAiredYear: null,
    seasons: 2,
    episodes: 18,
    rating: 8.8,
    genres: ["Drama", "Action", "Adventure"],
    featured: true,
    trending: true,
    newRelease: true,
    top10: 6,
    status: "Returning Series",
  },
  {
    id: MOCK_UUIDS["series-3"],
    title: "Breaking Bad",
    description:
      "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine to secure his family's future.",
    thumbnail: "https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
    poster: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
    trailer: "HhesaQXLuRY",
    firstAiredYear: 2008,
    lastAiredYear: 2013,
    seasons: 5,
    episodes: 62,
    rating: 9.5,
    genres: ["Drama", "Crime", "Thriller"],
    featured: false,
    trending: true,
    newRelease: false,
    top10: 7,
    status: "Ended",
  },
  {
    id: MOCK_UUIDS["series-4"],
    title: "Game of Thrones",
    description:
      "Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.",
    thumbnail: "https://image.tmdb.org/t/p/original/suopoADq0k8YZr4dQXcU6pToj6s.jpg",
    poster: "https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/suopoADq0k8YZr4dQXcU6pToj6s.jpg",
    trailer: "rlR4PJn8b8I",
    firstAiredYear: 2011,
    lastAiredYear: 2019,
    seasons: 8,
    episodes: 73,
    rating: 8.4,
    genres: ["Drama", "Fantasy", "Action"],
    featured: false,
    trending: true,
    newRelease: false,
    top10: null,
    status: "Ended",
  },
  {
    id: MOCK_UUIDS["series-5"],
    title: "Stranger Things",
    description:
      "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.",
    thumbnail: "https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    poster: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    trailer: "b9EkMc79ZSU",
    firstAiredYear: 2016,
    lastAiredYear: null,
    seasons: 5,
    episodes: 42,
    rating: 8.7,
    genres: ["Drama", "Fantasy", "Horror"],
    featured: false,
    trending: true,
    newRelease: true,
    top10: null,
    status: "Returning Series",
  },
  {
    id: MOCK_UUIDS["series-6"],
    title: "The Witcher",
    description:
      "Geralt of Rivia, a solitary monster hunter, struggles to find his place in a world where people often prove more wicked than beasts.",
    thumbnail: "https://image.tmdb.org/t/p/original/jBJWaqoSCiARWtfV0GlqHrcdidd.jpg",
    poster: "https://image.tmdb.org/t/p/w500/7vjaCdMw15FEbXyLQTVa04URsPm.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/jBJWaqoSCiARWtfV0GlqHrcdidd.jpg",
    trailer: "ndl1W4ltcmg",
    firstAiredYear: 2019,
    lastAiredYear: null,
    seasons: 3,
    episodes: 24,
    rating: 8.0,
    genres: ["Drama", "Fantasy", "Action"],
    featured: false,
    trending: false,
    newRelease: false,
    top10: null,
    status: "Returning Series",
  },
  {
    id: MOCK_UUIDS["series-7"],
    title: "Wednesday",
    description:
      "Follows Wednesday Addams' years as a student, when she attempts to master her emerging psychic ability, thwart and solve the mystery that embroiled her parents.",
    thumbnail: "https://image.tmdb.org/t/p/original/iHSwvRVsRyxpX7FE7GbviaDvgGZ.jpg",
    poster: "https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/iHSwvRVsRyxpX7FE7GbviaDvgGZ.jpg",
    trailer: "Di310WS8zLk",
    firstAiredYear: 2022,
    lastAiredYear: null,
    seasons: 2,
    episodes: 16,
    rating: 8.2,
    genres: ["Comedy", "Crime", "Fantasy"],
    featured: false,
    trending: false,
    newRelease: true,
    top10: null,
    status: "Returning Series",
  },
  {
    id: MOCK_UUIDS["series-8"],
    title: "The Mandalorian",
    description:
      "After the fall of the Empire, a lone gunfighter makes his way through the outer reaches of the lawless galaxy.",
    thumbnail: "https://image.tmdb.org/t/p/original/9ijMGlJKqcslswWUzTEwScm82Gs.jpg",
    poster: "https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/9ijMGlJKqcslswWUzTEwScm82Gs.jpg",
    trailer: "aOC8E8k_rNw",
    firstAiredYear: 2019,
    lastAiredYear: null,
    seasons: 3,
    episodes: 24,
    rating: 8.5,
    genres: ["Action", "Adventure", "Sci-Fi"],
    featured: false,
    trending: true,
    newRelease: true,
    top10: 9,
    status: "Returning Series",
  },
];
