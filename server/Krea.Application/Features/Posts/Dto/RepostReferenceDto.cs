namespace Krea.Application.Features.Posts.Dto {
    using Domain.ValueObjects;
    
    public sealed record RepostReferenceDto( 
        Guid Id, 
        Guid AuthorPostId, 
        string AuthorName, 
        string Title, 
        string? Content, 
        bool IsWork, 
        bool IsLocal, 
        int UploadCount, 
        int LikesCount, 
        DateTime UploadedAt, 
        IReadOnlyList<PostMediaDto> Media
    );
}