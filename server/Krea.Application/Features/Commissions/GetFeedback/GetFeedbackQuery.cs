namespace Krea.Application.Features.Commissions.GetFeedback {
    using Domain.Abstractions;
    using Dtos;

    public record GetFeedbackQuery(Guid SubmissionId) : IRequest<IReadOnlyList<SubmissionFeedbackDto>>;
}