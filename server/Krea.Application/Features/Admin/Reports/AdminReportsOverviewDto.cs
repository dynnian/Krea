namespace Krea.Application.Features.Admin.Reports {
    using Dashboard;

    public sealed record AdminReportsOverviewDto(
        int ActiveUsers,
        int SuspendedUsers,
        int TotalPublications,
        int FederationInteractions,
        int ModerationActions,
        IReadOnlyList<AdminActivityLogItemDto> Activity
    );
}
