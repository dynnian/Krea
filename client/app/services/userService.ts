import axiosClient from "../lib/axios";

export interface PublicUserProfile {
  id: string;
  username: string;
  displayName: string;
  biography: string | null;
  languageCode: string;
  timeZoneId: string;
  followersCount: number;
  followingCount: number;
  profilePictureUrl: string | null;
  isFollowing?: boolean; // Solo presente cuando lo solicita un usuario autenticado
}

// app/services/userService.ts
export interface FollowUserResponse {
  id: string;
  username: string;
  displayName: string;
  biography: string | null;   // ← agregar
  profilePictureUrl: string | null;
  isFollowing: boolean;        // ← agregar
}

export const userService = {
  // Obtener perfil público de un usuario (incluye isFollowing si el visitante está autenticado)
  getPublicProfile: (userId: string) =>
    axiosClient.get<PublicUserProfile>(`/users/${userId}/profile`),

  // Seguir a un usuario
  follow: (targetId: string) => axiosClient.post(`/users/${targetId}/follow`),

  // Dejar de seguir
  unfollow: (targetId: string) =>
    axiosClient.delete(`/users/${targetId}/unfollow`),

  // Lista de seguidores (paginado)
  getFollowers: (userId: string, page = 1, pageSize = 20) =>
    axiosClient.get<{
      users: FollowUserResponse[];
      page: number;
      pageSize: number;
      totalCount: number;
    }>(`/users/${userId}/followers`, { params: { page, pageSize } }),

  // Lista de seguidos (paginado)
  getFollowing: (userId: string, page = 1, pageSize = 20) =>
    axiosClient.get<{
      users: FollowUserResponse[];
      page: number;
      pageSize: number;
      totalCount: number;
    }>(`/users/${userId}/following`, { params: { page, pageSize } }),
};
