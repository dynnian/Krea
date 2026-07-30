namespace Krea.Application.Abstractions.Url {
    public interface IConfirmationUrlBuilder {
        string BuildEmailConfirmationLink(Guid userId, string token);
    }
}