namespace Krea.API.Contracts {
    public sealed record EvaluateAdminPostModerationReportRequest(
        string Action,
        string? ModeratorNote
    );
}