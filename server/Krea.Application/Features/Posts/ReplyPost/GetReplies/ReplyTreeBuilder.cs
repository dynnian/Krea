namespace Krea.Application.Features.Posts.ReplyPost.GetReplies {
    using Domain.Entities;
    using Dto;

    public static class ReplyTreeBuilder {
        public static List<ReplyNodeResponse> Build(
            List<Post> posts,
            Guid rootPostId) {
            Dictionary<Guid, ReplyNodeResponse> lookup = posts.ToDictionary(
                p => p.Id,
                p => new ReplyNodeResponse {
                    Id = p.Id,
                    AuthorId = p.AuthorPostId,
                    AuthorName = p.AuthorPost.DisplayName,
                    AuthorProfilePictureUrl = p.AuthorPost.ProfilePicture?.Path,
                    Content = p.Content ?? string.Empty,
                    CreatedAt = p.UploadedAt
                });

            var result = new List<ReplyNodeResponse>();

            foreach (Post post in posts) {
                if (post.RepliedToId == rootPostId) {
                    result.Add(lookup[post.Id]);
                }
                else if (post.RepliedToId != null &&
                         lookup.ContainsKey(post.RepliedToId.Value)) {
                    lookup[post.RepliedToId.Value]
                        .Replies.Add(lookup[post.Id]);
                }
            }

            return result;
        }
    }
}