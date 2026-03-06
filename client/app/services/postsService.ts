// app/services/postsService.ts
import axiosClient from "../lib/axiosClient"; // ajusta el path al tuyo

export interface PostsQuery {
  page?: number;
  pageSize?: number;
}

export async function getPosts(query: PostsQuery = {}) {
  const params = {
    page: query.page ?? 1,
    pageSize: query.pageSize ?? 20,
  };

  const res = await axiosClient.get("/api/Posts", { params });
  return res.data; // aquí luego tipas el array con tu Post[]
}