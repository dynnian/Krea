import ancientGirl from "../../assets/Album/ancient girl.mp3";
import bigFeelings from "../../assets/Album/b i g f e e l i n g s.mp3";
import betweenIAndShe from "../../assets/Album/between i and she.mp3";
import down from "../../assets/Album/down.mp3";
import falseSelf from "../../assets/Album/false self.mp3";
import home from "../../assets/Album/home.mp3";
import iKnowThatFace from "../../assets/Album/I know that face..mp3";
import noWords from "../../assets/Album/no words 1 & 2.mp3";
import painForFun from "../../assets/Album/pain for fun.mp3";
import run from "../../assets/Album/run!.mp3";
import symptomOfLife from "../../assets/Album/symptom of life.mp3";
import theFearIsNotReal from "../../assets/Album/the fear is not real.mp3";


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
  audioUrl: string;
};

export type MusicAlbum = {
  id: string;
  title: string;
  releaseDate: string;
  songsCount: number;
  coverUrl: string;
  tracks: AlbumTrack[];
};

export const musicSongsMock: MusicSong[] = [
  {
    id: "song-1",
    title: "Cancion 1",
    genre: "Alternative, Indie",
    coverUrl:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=700&q=80",
    audioUrl: ancientGirl,
  },
  
  {
    id: "song-2",
    title: "Cancion 2",
    genre: "Alternative, Indie",
    coverUrl:
      "https://images.unsplash.com/photo-1501612780327-45045538702b?auto=format&fit=crop&w=700&q=80",
    audioUrl: down,
  },

  {
    id: "song-3",
    title: "Cancion 3",
    genre: "Alternative, Indie",
    coverUrl:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=700&q=80",
    audioUrl: symptomOfLife,
  },
];

export const musicAlbumsMock: MusicAlbum[] = [
  {
    id: "album-1",
    title: "Título del album",
    releaseDate: "Nov 10, 2024",
    songsCount: 12,
    coverUrl:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=700&q=80",
    tracks: [
      { id: "t1", number: 1, title: "Canción 1", duration: "2:13", audioUrl: ancientGirl },
      { id: "t2", number: 2, title: "Canción 2", duration: "1:30", audioUrl: bigFeelings },
      { id: "t3", number: 3, title: "Canción 3", duration: "3:56", audioUrl: betweenIAndShe },
      { id: "t4", number: 4, title: "Canción 4", duration: "4:13", audioUrl: down },
      { id: "t5", number: 5, title: "Canción 5", duration: "1:46", audioUrl: falseSelf },
      { id: "t6", number: 6, title: "Canción 6", duration: "3:02", audioUrl: home },
      { id: "t7", number: 7, title: "Canción 7", duration: "2:47", audioUrl: iKnowThatFace },
      { id: "t8", number: 8, title: "Canción 8", duration: "4:01", audioUrl: noWords },
      { id: "t9", number: 9, title: "Canción 9", duration: "3:20", audioUrl: painForFun },
      { id: "t10", number: 10, title: "Canción 10", duration: "2:55", audioUrl: run },
      { id: "t11", number: 11, title: "Canción 11", duration: "3:18", audioUrl: symptomOfLife },
      { id: "t12", number: 12, title: "Canción 12", duration: "4:09", audioUrl: theFearIsNotReal },
    ],
  },

  {
    id: "album-2",
    title: "Título del album 2",
    releaseDate: "Nov 10, 2024",
    songsCount: 12,
    coverUrl:
      "https://images.unsplash.com/photo-1501612780327-45045538702b?auto=format&fit=crop&w=700&q=80",
    tracks: [
      { id: "t1", number: 1, title: "Canción 1", duration: "2:13", audioUrl: ancientGirl },
      { id: "t2", number: 2, title: "Canción 2", duration: "1:30", audioUrl: bigFeelings },
      { id: "t3", number: 3, title: "Canción 3", duration: "3:56", audioUrl: betweenIAndShe },
      { id: "t4", number: 4, title: "Canción 4", duration: "4:13", audioUrl: down },
      { id: "t5", number: 5, title: "Canción 5", duration: "1:46", audioUrl: falseSelf },
      { id: "t6", number: 6, title: "Canción 6", duration: "3:02", audioUrl: home },
      { id: "t7", number: 7, title: "Canción 7", duration: "2:47", audioUrl: iKnowThatFace },
      { id: "t8", number: 8, title: "Canción 8", duration: "4:01", audioUrl: noWords },
      { id: "t9", number: 9, title: "Canción 9", duration: "3:20", audioUrl: painForFun },
      { id: "t10", number: 10, title: "Canción 10", duration: "2:55", audioUrl: run },
      { id: "t11", number: 11, title: "Canción 11", duration: "3:18", audioUrl: symptomOfLife },
      { id: "t12", number: 12, title: "Canción 12", duration: "4:09", audioUrl: theFearIsNotReal },
    ],
  },
];