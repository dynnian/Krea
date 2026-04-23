namespace Krea.Application.Features.Admin.Dashboard {
    public sealed record AdminActivityLogItemDto(
        string Type,
        string Action,
        string Source,
        string Details,
        DateTime OccurredAt,
        string Status
    );
}