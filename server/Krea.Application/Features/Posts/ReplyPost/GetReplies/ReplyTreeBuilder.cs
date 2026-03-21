namespace Krea.Application.Features.Posts.ReplyPost.GetReplies {
    using Domain.Entities;
    using Dto;

    public static class ReplyTreeBuilder
    {
        public static List<ReplyNodeResponse> Build(
            List<Post> posts,
            Guid rootPostId)
        {
            var lookup = posts.ToDictionary(
                p => p.Id,
                p => new ReplyNodeResponse
                {
                    Id = p.Id,
                    AuthorId = p.AuthorPostId,
                    AuthorName = p.AuthorPost.DisplayName,
                    Content = p.Content,
                    CreatedAt = p.UploadedAt
                });

            var result = new List<ReplyNodeResponse>();

            foreach (var post in posts)
            {
                if (post.RepliedToId == rootPostId)
                {
                    result.Add(lookup[post.Id]);
                }
                else if (post.RepliedToId != null &&
                         lookup.ContainsKey(post.RepliedToId.Value))
                {
                    lookup[post.RepliedToId.Value]
                        .Replies.Add(lookup[post.Id]);
                }
            }

            return result;
        }
    }
}