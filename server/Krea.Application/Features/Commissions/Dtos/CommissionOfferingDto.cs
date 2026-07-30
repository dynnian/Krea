namespace Krea.Application.Features.Commissions.Dtos {
    public record CommissionOfferingDto(
        Guid Id,
        string Title,
        string? Description,
        decimal BasePrice,
        string Currency,
        int MaxSlots,
        int ActiveRequestCount,
        bool IsActive,
        DateTime CreatedAt,
        ArtistInfoDto Artist);

    public record ArtistInfoDto(Guid Id, string DisplayName);
}