

export type MusicSong = {
  id: string;
  title: string;
  genre: string;
  coverUrl: string;
  audioUrl: string;
};

export type AlbumTrack = {
  id: string;
  number: number;
  title: string;
  duration: string;
};

export type MusicAlbum = {
  id: string;
  title: string;
  releaseDate: string;
  songsCount: number;
  coverUrl: string;
  audioUrl: string;
  tracks: AlbumTrack[];
};

export const musicSongsMock: MusicSong[] = [
  {
    id: "song-1",
    title: "Canción",
    genre: "Jazz, Rock",
    coverUrl: "https://images.unsplash.com/photo-1501612780327-45045538702b?auto=format&fit=crop&w=600&q=80",
    audioUrl: "/assets/audio-sample.mp3",
  },
  {
    id: "song-2",
    title: "Canción",
    genre: "Jazz, Rock",
    coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80",
    audioUrl: "/assets/audio-sample.mp3",
  },
  {
    id: "song-3",
    title: "Canción",
    genre: "Jazz, Rock",
    coverUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=600&q=80",
    audioUrl: "/assets/audio-sample.mp3",
  },
];

export const musicAlbumsMock: MusicAlbum[] = [
  {
    id: "album-1",
    title: "Título del album",
    releaseDate: "Nov 10, 2024",
    songsCount: 5,
    coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=700&q=80",
    audioUrl: "/assets/audio-sample.mp3",
    tracks: [
      { id: "t1", number: 1, title: "Canción", duration: "2:13" },
      { id: "t2", number: 2, title: "Canción", duration: "1:30" },
      { id: "t3", number: 3, title: "Canción", duration: "3:56" },
      { id: "t4", number: 4, title: "Canción", duration: "4:13" },
      { id: "t5", number: 5, title: "Canción", duration: "1:46" },
    ],
  },
  {
    id: "album-2",
    title: "Título del album",
    releaseDate: "Nov 10, 2024",
    songsCount: 5,
    coverUrl: "https://images.unsplash.com/photo-1501612780327-45045538702b?auto=format&fit=crop&w=700&q=80",
    audioUrl: "/assets/audio-sample.mp3",
    tracks: [
      { id: "t6", number: 1, title: "Canción", duration: "2:13" },
      { id: "t7", number: 2, title: "Canción", duration: "1:30" },
      { id: "t8", number: 3, title: "Canción", duration: "3:56" },
      { id: "t9", number: 4, title: "Canción", duration: "4:13" },
      { id: "t10", number: 5, title: "Canción", duration: "1:46" },
    ],
  },
];