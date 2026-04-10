using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using Krea.Domain.Entities;

namespace Krea.Application.Features.Favorites.Dto;

public sealed class FavoritePostDto
{
    [JsonPropertyName("id")]
    public Guid Id { get; init; }

    [JsonPropertyName("authorPostId")]
    public Guid AuthorPostId { get; init; }

    [JsonPropertyName("authorName")]
    public string AuthorName { get; init; } = string.Empty;

    [JsonPropertyName("title")]
    public string Title { get; init; } = string.Empty;

    [JsonPropertyName("content")]
    public string? Content { get; init; }

    [JsonPropertyName("uploadedAt")]
    public DateTime UploadedAt { get; init; }

    [JsonPropertyName("likesCount")]
    public int LikesCount { get; init; }

    [JsonPropertyName("isLikedByCurrentUser")]
    public bool IsLikedByCurrentUser { get; init; }

    [JsonPropertyName("isRetweetedByCurrentUser")]
    public bool IsRetweetedByCurrentUser { get; init; }

    [JsonPropertyName("isFavoritedByCurrentUser")]
    public bool IsFavoritedByCurrentUser { get; init; } = true;

    [JsonPropertyName("media")]
    public List<FavoriteMediaDto> Media { get; init; } = new();

    public static FavoritePostDto FromDomain(Post post)
    {
        return new FavoritePostDto
        {
            Id = post.Id,
            AuthorPostId = post.AuthorPostId,
            AuthorName = post.AuthorPost?.DisplayName ?? "Unknown",
            Title = post.Title,
            Content = post.Content,
            UploadedAt = post.UploadedAt,
            LikesCount = post.Likes.Count,
            IsLikedByCurrentUser = false,      // Se puede calcular después
            IsRetweetedByCurrentUser = false,  // Se puede calcular después
            IsFavoritedByCurrentUser = true,
            Media = post.Uploads?
                .Where(u => u.Media != null)
                .Select(u => new FavoriteMediaDto
                {
                    Id = u.Id,
                    FileName = u.Media.FileName,
                    MimeType = u.Media.MimeType,
                    Url = u.Media.Path,
                    IsWorkMedia = u.IsWorkMedia
                }).ToList() ?? new()
        };
    }
}

public sealed class FavoriteMediaDto
{
    [JsonPropertyName("id")]
    public Guid Id { get; init; }

    [JsonPropertyName("fileName")]
    public string FileName { get; init; } = string.Empty;

    [JsonPropertyName("mimeType")]
    public string MimeType { get; init; } = string.Empty;

    [JsonPropertyName("url")]
    public string Url { get; init; } = string.Empty;

    [JsonPropertyName("isWorkMedia")]
    public bool IsWorkMedia { get; init; }
}