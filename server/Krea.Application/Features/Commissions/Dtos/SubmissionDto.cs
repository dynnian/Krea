namespace Krea.Application.Features.Commissions.Dtos {
    public record SubmissionDto(
        Guid Id,
        Guid MediaId,
        string MediaUrl,
        IReadOnlyCollection<SubmissionFeedbackDto> Feedback);

    public record SubmissionFeedbackDto(
        Guid Id,
        Guid AuthorId,
        string AuthorDisplayName,
        string Content,
        DateTime CreatedAt,
        DateTime UpdatedAt);
}