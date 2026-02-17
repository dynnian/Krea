import { type Timestamp, GenreType } from "./common";

export interface Media {
  id: number;
  filename: string;
  mime_type: string;
  path: string; // ruta relativa o URL
  file_size: number; // en bytes
  uploaded_at: Timestamp;
}

export interface ImageMetadata {
  id: number;
  upload_id: number; // FK a media
  file_size: number; // redundante? puede ser el mismo de media
  width: string; // podria ser number, pero el modelo dice varchar
  height: string;
  collection_id: number | null; // FK a collections

  media?: Media;
  collection?: Collections;
}

export interface MusicMetadata {
  id: number;
  upload_id: number; // FK a media
  title: string | null;
  bitrate_kbps: number | null;
  duration_sec: number | null;
  genre_id: number | null; // FK a genre
  collection_album_id: number | null; // FK a collections

  media?: Media;
  genre?: Genre;
  album?: Collections;
}

export interface TextMetadata {
  id: number;
  upload_id: number; // FK a media
  title: string | null;
  sort_title: string | null;
  subtitle: string | null;
  description: string | null;
  language: string | null;
  word_count: number | null;
  genre_id: number | null; // FK a genre
  collection_series_id: number | null; // FK a collections

  media?: Media;
  genre?: Genre;
  series?: Collections;
}

export interface Genre {
  id: number;
  name: string;
  type: GenreType; // 'music', 'literature', 'visual'
}

export interface Collections {
  id: number;
  title: string;
  image: number | null; // FK a media
  description: string | null;
  item_count: number;
  created_at: Timestamp;
  updated_at: Timestamp;

  cover?: Media;
}
