export type ExploreFeaturedBook = {
  title: string;
  author: string;
  handle: string;
  coverUrl: string;
  genres: string[];
  synopsis: string;
  chaptersCount: number;
};

export type ExploreTrendingBook = {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
};

export type ExploreRecentBook = {
  id: string;
  title: string;
  author: string;
  handle: string;
  coverUrl: string;
  genre: string;
  description: string;
  chaptersCount: number;
};

export const featuredBookMock: ExploreFeaturedBook = {
  title: "Harrow la Novena",
  author: "Tamsyn Muir",
  handle: "TamsynMuir",
  coverUrl:
    "https://m.media-amazon.com/images/I/81hHdbD2rOL._UF1000,1000_QL80_.jpg",
  genres: ["Fantasia", "Ciencia ficción"],
  synopsis:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis. olor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt. ",
  chaptersCount: 12,
};

export const trendingBooksMock: ExploreTrendingBook[] = [
  {
    id: "1",
    title: "Seis de cuervos",
    author: "Leigh Bardugo",
    coverUrl:
      "https://m.media-amazon.com/images/I/91-JO-S2bFL._AC_UF1000,1000_QL80_.jpg",
  },
  {
    id: "2",
    title: "Empire of Silence",
    author: "Christopher Ruocchio",
    coverUrl:
      "https://m.media-amazon.com/images/I/81IIc433V7L._AC_UF1000,1000_QL80_.jpg",
  },
  {
    id: "3",
    title: "Assassin’s Apprentice",
    author: "Robin Hobb",
    coverUrl:
      "https://i5.walmartimages.com/seo/Farseer-Trilogy-Assassin-s-Apprentice-the-Illustrated-Edition-The-Farseer-Trilogy-Book-1-Book-1-Hardcover-9781984817853_f5584cf9-52bb-4749-ae17-c001564afcb2.865d02770b9629dd474c5f95f99965f4.jpeg",
  },
  {
    id: "4",
    title: "El Problema de los Tres Cuerpos",
    author: "Liu Cixin",
    coverUrl:
      "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1415428227i/20518872.jpg",
  },
  {
    id: "5",
    title: "House of Earth and Blood",
    author: "Sarah J. Maas",
    coverUrl:
      "https://scontent.fhex4-1.fna.fbcdn.net/v/t1.6435-9/61481465_2388198891456024_4317191393819754496_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=13d280&_nc_eui2=AeGyTc4GJ4Tg3-KbXAldrJOSl1Si8Mcudu2XVKLwxy527UAjgAP7mpPGB8OjgU6Gx-68V8I1b7-c2I851AHNHyxo&_nc_ohc=Tba3sWkhcl8Q7kNvwHAKtb9&_nc_oc=Adoq-rkJTflYR7zygThwhUSBcx0G18A4klxqoZCXqmzIuRGaiX3tc43gJm5hC_QOLCwbGhXDDXPyM65fpmPe1JYU&_nc_zt=23&_nc_ht=scontent.fhex4-1.fna&_nc_gid=uzrRFWovwO1S3-GmGIltlA&_nc_ss=7a30f&oh=00_AfxbpaVMQuFZfHbUrJhnNjFbi8k7bGFXiJ-vYsr4kB2iLw&oe=69E5E940",
  },
];

export const recentBooksMock: ExploreRecentBook[] = [
  {
    id: "1",
    title: "Título de la obra",
    author: "Autor",
    handle: "dominio",
    coverUrl:
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=900&q=80",
    genre: "Fantasia, Romance, etc...",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis. olor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
    chaptersCount: 12,
  },
  {
    id: "2",
    title: "Título de la obra",
    author: "Autor",
    handle: "dominio",
    coverUrl:
      "https://images.unsplash.com/photo-1521056787327-2f9ff1b3f1db?auto=format&fit=crop&w=900&q=80",
    genre: "Fantasia, Romance, etc...",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis. olor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
    chaptersCount: 8,
  },
  {
    id: "3",
    title: "Título de la obra",
    author: "Autor",
    handle: "dominio",
    coverUrl:
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=900&q=80",
    genre: "Fantasia, Romance, etc...",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis. olor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
    chaptersCount: 15,
  },
];

export const trendingLiteratureGenresMock = [
  "Fantasia",
  "Ciencia ficción",
  "Thriller",
  "Romance",
  "Paranormal",
  "Mistery",
];

export const trendingAuthorsMock = [
  "Steven Erikson",
  "Brandon Sanderson",
  "Robert Jordan",
  "George R. R. Martin",
  "Tamsyn Muir",
  "Tolkien",
];