import bigFeelings from "../../assets/Album/b i g f e e l i n g s.mp3";

export type ExploreFeaturedTrack = {
  artist: string;
  title: string;
  coverUrl: string;
  audioUrl: string;
  genre: string[];
  duration: string;
};

export type ExploreAlbum = {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
};

export type ExploreSong = {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string;
  genre: string;
};

export const featuredTrackMock: ExploreFeaturedTrack = {
  artist: "Willow",
  title: "b i g f e e l i n g s",
  coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=900&q=80",
  audioUrl: bigFeelings,
  genre: ["Jazz", "Rock"],
  duration: "3:42"
};

export const newAlbumsMock: ExploreAlbum[] = [
  {
    id: "1",
    title: "Empathogen",
    artist: "Willow",
    coverUrl: "https://upload.wikimedia.org/wikipedia/en/1/12/Empathogen_%28album%29.jpg",
  },
  {
    id: "2",
    title: "The Shape of Punk to Come",
    artist: "Refused",
    coverUrl: "https://upload.wikimedia.org/wikipedia/en/7/7e/TheShapeOfPunkToCome.jpeg",
  },
  {
    id: "3",
    title: "Zanmu",
    artist: "Ado",
    coverUrl: "https://upload.wikimedia.org/wikipedia/en/d/da/Ado_-_Zanmu.png",
  },
  {
    id: "4",
    title: "Collide with the Sky",
    artist: "Pierce the Veil",
    coverUrl: "https://i.scdn.co/image/ab67616d0000b273077cac00c2d9075e6f742570",
  },
];

export const latestSongsMock: ExploreSong[] = [
  {
    id: "1",
    title: "b i g f e e l i n g s",
    artist: "Willow",
    coverUrl: "https://upload.wikimedia.org/wikipedia/en/1/12/Empathogen_%28album%29.jpg",
    audioUrl: bigFeelings,
    genre: "Jazz, Rock",
  },
  {
    id: "2",
    title: "Flowers and You",
    artist: "Touché Amoré",
    coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80",
    audioUrl: bigFeelings,
    genre: "Post-Hardcore, Emo",
  },
  {
    id: "3",
    title: "New Noise",
    artist: "Refused",
    coverUrl: "https://upload.wikimedia.org/wikipedia/en/7/7e/TheShapeOfPunkToCome.jpeg",
    audioUrl: bigFeelings,
    genre: "Punk, Hardcore",
  },
  {
    id: "4",
    title: "Usseewa",
    artist: "Ado",
    coverUrl: "https://upload.wikimedia.org/wikipedia/en/d/da/Ado_-_Zanmu.png",
    audioUrl: bigFeelings,
    genre: "J-Rock, Pop",
  },
];

export const trendingGenresMock = ["Jazz", "Rock", "Pop"];
export const trendingArtistsMock = ["Willow", "Toby Fox"];