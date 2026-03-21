import bigFeelings from "../../assets/Album/b i g f e e l i n g s.mp3";

export type ExploreFeaturedTrack = {
  artist: string;
  title: string;
  coverUrl: string;
  audioUrl: string;
  genres: string[];
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
  genres: string;
};

export const featuredTrackMock: ExploreFeaturedTrack = {
  artist: "Willow",
  title: "b i g f e e l i n g s",
  coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=900&q=80",
  audioUrl: bigFeelings,
  genres: ["Jazz", "Rock"],
  duration: "3:42"
};

export const newAlbumsMock: ExploreAlbum[] = [
 // ...
];

export const latestSongsMock: ExploreSong[] = [
 // ...
];

export const trendingGenresMock = ["Jazz", "Rock", "Pop"];
export const trendingArtistsMock = ["Willow", "Toby Fox"];