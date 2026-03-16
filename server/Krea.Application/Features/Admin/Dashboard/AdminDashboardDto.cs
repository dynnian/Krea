namespace Krea.Application.Features.Admin.Dashboard {
    public sealed record AdminDashboardDto(
        int TotalUsers,
        int ActiveToday,
        int FederatedInstances,
        int PendingReports,
        int SuspendedUsers,
        int ModerationActions,
        IReadOnlyList<AdminActivityLogItemDto> RecentActivity
    );
}
