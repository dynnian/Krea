import axiosClient from "../lib/axios.ts";

export type GenreType = "Image" | "Music" | "Text";

export type GenreDto = {
  id: string;
  name: string;
  type: number;
};

export const genresApi = {
  getAll: async () => {
    const res = await axiosClient.get<GenreDto[]>("/Posts/genres");
    return res.data;
  },
};