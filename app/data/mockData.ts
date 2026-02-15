import type { Movie, TVSeries, Genre } from "#shared/types";

export const mockMovies: Movie[] = [
  {
    id: "movie-1",
    title: "Dune: Part Two",
    description:
      "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe.",
    poster: "https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
    thumbnail: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
    rating: "8.5",
    releaseYear: 2024,
    duration: 166,
    status: "active",
    featured: true,
    trailerUrl: "https://www.youtube.com/embed/Way9Dexny3w",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "movie-2",
    title: "Oppenheimer",
    description:
      "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.",
    poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    thumbnail: "https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
    rating: "8.9",
    releaseYear: 2023,
    duration: 180,
    status: "active",
    featured: true,
    trailerUrl: "https://www.youtube.com/embed/uYPbbksJxIg",
    createdAt: new Date("2023-07-21"),
    updatedAt: new Date("2023-07-21"),
  },
  {
    id: "movie-3",
    title: "The Batman",
    description:
      "When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city's hidden corruption.",
    poster: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fber9Tav5PXS5qG4.jpg",
    thumbnail: "https://image.tmdb.org/t/p/original/5P8SmMzSNYikXpxil6BYzJ16611.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/5P8SmMzSNYikXpxil6BYzJ16611.jpg",
    rating: "8.1",
    releaseYear: 2022,
    duration: 176,
    status: "active",
    featured: true,
    trailerUrl: "https://www.youtube.com/embed/mqqft2x_Aa4",
    createdAt: new Date("2022-03-04"),
    updatedAt: new Date("2022-03-04"),
  },
  {
    id: "movie-4",
    title: "Interstellar",
    description:
      "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival as Earth becomes uninhabitable.",
    poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    thumbnail: "https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
    rating: "8.7",
    releaseYear: 2014,
    duration: 169,
    status: "active",
    featured: false,
    trailerUrl: "https://www.youtube.com/embed/zSWdZVtXT7E",
    createdAt: new Date("2014-11-07"),
    updatedAt: new Date("2014-11-07"),
  },
  {
    id: "movie-5",
    title: "Inception",
    description:
      "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    poster: "https://image.tmdb.org/t/p/w500/ljsZTbVsrQSqZgWeep9B9iMrXfs.jpg",
    thumbnail: "https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
    rating: "8.8",
    releaseYear: 2010,
    duration: 148,
    status: "active",
    featured: false,
    trailerUrl: "https://www.youtube.com/embed/YoHD9XEInc0",
    createdAt: new Date("2010-07-16"),
    updatedAt: new Date("2010-07-16"),
  },
  {
    id: "movie-6",
    title: "The Dark Knight",
    description:
      "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.",
    poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    thumbnail: "https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg",
    rating: "9.0",
    releaseYear: 2008,
    duration: 152,
    status: "active",
    featured: false,
    trailerUrl: "https://www.youtube.com/embed/EXeTwQWrcwY",
    createdAt: new Date("2008-07-18"),
    updatedAt: new Date("2008-07-18"),
  },
  {
    id: "movie-7",
    title: "Avatar: The Way of Water",
    description:
      "Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started.",
    poster: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmPA.jpg",
    thumbnail: "https://image.tmdb.org/t/p/original/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg",
    rating: "7.8",
    releaseYear: 2022,
    duration: 192,
    status: "active",
    featured: false,
    trailerUrl: "https://www.youtube.com/embed/d9MyW72ELq0",
    createdAt: new Date("2022-12-16"),
    updatedAt: new Date("2022-12-16"),
  },
  {
    id: "movie-8",
    title: "John Wick: Chapter 4",
    description:
      "John Wick uncovers a path to defeating The High Table. But before he can earn his freedom, Wick must face off against a new enemy.",
    poster: "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",
    thumbnail: "https://image.tmdb.org/t/p/original/7I6VUdPj6tQECNHdviJkUHD2u89.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/7I6VUdPj6tQECNHdviJkUHD2u89.jpg",
    rating: "8.2",
    releaseYear: 2023,
    duration: 169,
    status: "active",
    featured: false,
    trailerUrl: "https://www.youtube.com/embed/qEVUtrk8_B4",
    createdAt: new Date("2023-03-24"),
    updatedAt: new Date("2023-03-24"),
  },
];

export const mockSeries: TVSeries[] = [
  {
    id: "series-1",
    title: "House of the Dragon",
    description:
      "The Targaryen civil war, known as the Dance of the Dragons, begins when King Viserys I breaks with tradition by naming his daughter Rhaenyra heir to the Iron Throne.",
    poster: "https://image.tmdb.org/t/p/w500/z2yahl2uefxDCl0nogcRBstwruJ.jpg",
    thumbnail: "https://image.tmdb.org/t/p/original/etj8E2o0Bud0HkONVQPjyCkIvpv.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/etj8E2o0Bud0HkONVQPjyCkIvpv.jpg",
    rating: "8.5",
    firstAiredYear: 2022,
    lastAiredYear: null,
    status: "active",
    featured: true,
    trailerUrl: "https://www.youtube.com/embed/DotnJ7tTA34",
    createdAt: new Date("2022-08-21"),
    updatedAt: new Date("2022-08-21"),
  },
  {
    id: "series-2",
    title: "The Last of Us",
    description:
      "Twenty years after a fungal outbreak ravages the planet, survivors Joel and Ellie embark on a brutal journey through the US to find a possible cure.",
    poster: "https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg",
    thumbnail: "https://image.tmdb.org/t/p/original/AjTcJWslCFvGlQr4ZGuDaZmZRAA.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/AjTcJWslCFvGlQr4ZGuDaZmZRAA.jpg",
    rating: "8.8",
    firstAiredYear: 2023,
    lastAiredYear: null,
    status: "active",
    featured: true,
    trailerUrl: "https://www.youtube.com/embed/ittT7ZblKvM",
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-01-15"),
  },
  {
    id: "series-3",
    title: "Breaking Bad",
    description:
      "A high school chemistry teacher diagnosed with lung cancer turns to manufacturing methamphetamine to secure his family's future.",
    poster: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
    thumbnail: "https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
    rating: "9.5",
    firstAiredYear: 2008,
    lastAiredYear: 2013,
    status: "active",
    featured: false,
    trailerUrl: "https://www.youtube.com/embed/HhesaQXLuRY",
    createdAt: new Date("2008-01-20"),
    updatedAt: new Date("2008-01-20"),
  },
  {
    id: "series-4",
    title: "Game of Thrones",
    description:
      "Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.",
    poster: "https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",
    thumbnail: "https://image.tmdb.org/t/p/original/suopoADq0k8YZr4dQXcU6pToj6s.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/suopoADq0k8YZr4dQXcU6pToj6s.jpg",
    rating: "8.4",
    firstAiredYear: 2011,
    lastAiredYear: 2019,
    status: "active",
    featured: false,
    trailerUrl: "https://www.youtube.com/embed/rlR4PJn8b8I",
    createdAt: new Date("2011-04-17"),
    updatedAt: new Date("2011-04-17"),
  },
  {
    id: "series-5",
    title: "Stranger Things",
    description:
      "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
    poster: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    thumbnail: "https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    rating: "8.7",
    firstAiredYear: 2016,
    lastAiredYear: null,
    status: "active",
    featured: false,
    trailerUrl: "https://www.youtube.com/embed/b9EkMc79ZSU",
    createdAt: new Date("2016-07-15"),
    updatedAt: new Date("2016-07-15"),
  },
  {
    id: "series-6",
    title: "The Witcher",
    description:
      "Geralt of Rivia, a solitary monster hunter, struggles to find his place in a world where people often prove more wicked than beasts.",
    poster: "https://image.tmdb.org/t/p/w500/7vjaCdMw15FEbXyLQTVa04URsPm.jpg",
    thumbnail: "https://image.tmdb.org/t/p/original/jBJWaqoSCiARWtfV0GlqHrcdidd.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/jBJWaqoSCiARWtfV0GlqHrcdidd.jpg",
    rating: "8.0",
    firstAiredYear: 2019,
    lastAiredYear: null,
    status: "active",
    featured: false,
    trailerUrl: "https://www.youtube.com/embed/ndl1W4ltcmg",
    createdAt: new Date("2019-12-20"),
    updatedAt: new Date("2019-12-20"),
  },
  {
    id: "series-7",
    title: "Wednesday",
    description:
      "Follows Wednesday Addams' years as a student, when she attempts to master her emerging psychic ability, thwart a killing spree, and solve the mystery.",
    poster: "https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg",
    thumbnail: "https://image.tmdb.org/t/p/original/iHSwvRVsRyxpX7FE7GbviaDvgGZ.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/iHSwvRVsRyxpX7FE7GbviaDvgGZ.jpg",
    rating: "8.2",
    firstAiredYear: 2022,
    lastAiredYear: null,
    status: "active",
    featured: false,
    trailerUrl: "https://www.youtube.com/embed/Di310WS8zLk",
    createdAt: new Date("2022-11-23"),
    updatedAt: new Date("2022-11-23"),
  },
  {
    id: "series-8",
    title: "The Mandalorian",
    description:
      "After the fall of the Empire, a lone gunfighter makes his way through the outer reaches of the lawless galaxy.",
    poster: "https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg",
    thumbnail: "https://image.tmdb.org/t/p/original/9ijMGlJKqcslswWUzTEwScm82Gs.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/9ijMGlJKqcslswWUzTEwScm82Gs.jpg",
    rating: "8.5",
    firstAiredYear: 2019,
    lastAiredYear: null,
    status: "active",
    featured: false,
    trailerUrl: "https://www.youtube.com/embed/aOC8E8k_rNw",
    createdAt: new Date("2019-11-12"),
    updatedAt: new Date("2019-11-12"),
  },
];

export const mockGenres: Genre[] = [
  {
    id: "genre-1",
    name: "Action",
    description: "High-energy films with stunts, fights, and chases",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "genre-2",
    name: "Comedy",
    description: "Films designed to make you laugh",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "genre-3",
    name: "Drama",
    description: "Serious stories with realistic characters",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "genre-4",
    name: "Horror",
    description: "Scary movies designed to frighten",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "genre-5",
    name: "Sci-Fi",
    description: "Futuristic and technology-based stories",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "genre-6",
    name: "Romance",
    description: "Love stories and romantic relationships",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "genre-7",
    name: "Thriller",
    description: "Suspenseful and exciting stories",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "genre-8",
    name: "Animation",
    description: "Animated films for all ages",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "genre-9",
    name: "Documentary",
    description: "Factual films about real subjects",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "genre-10",
    name: "Fantasy",
    description: "Magical and supernatural stories",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

export const getFeaturedMovies = (): Movie[] => {
  return mockMovies.filter((movie) => movie.featured);
};

export const getFeaturedSeries = (): TVSeries[] => {
  return mockSeries.filter((series) => series.featured);
};

export const getTrendingMovies = (limit = 10): Movie[] => {
  return [...mockMovies]
    .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
    .slice(0, limit);
};

export const getTrendingSeries = (limit = 10): TVSeries[] => {
  return [...mockSeries]
    .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
    .slice(0, limit);
};

export const getNewReleases = (limit = 10): (Movie | TVSeries)[] => {
  const movies = mockMovies
    .filter((m) => m.releaseYear && m.releaseYear >= 2023)
    .map((m) => ({ ...m, type: "movie" as const }));
  const series = mockSeries
    .filter((s) => s.firstAiredYear && s.firstAiredYear >= 2023)
    .map((s) => ({ ...s, type: "series" as const }));

  return [...movies, ...series]
    .sort((a, b) => {
      const yearA = a.releaseYear || a.firstAiredYear || 0;
      const yearB = b.releaseYear || b.firstAiredYear || 0;
      return yearB - yearA;
    })
    .slice(0, limit) as (Movie | TVSeries)[];
};

export const getContinueWatching = (limit = 6): (Movie | TVSeries)[] => {
  const items: (Movie | TVSeries)[] = [
    mockSeries[1], // The Last of Us
    mockMovies[2], // The Batman
    mockSeries[4], // Stranger Things
    mockMovies[0], // Dune: Part Two
    mockSeries[7], // The Mandalorian
    mockMovies[7], // John Wick 4
  ];

  return items.slice(0, limit);
};
