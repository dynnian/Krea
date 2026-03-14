namespace Krea.Application.Abstractions.Payments {
    public interface IPaymentGateway
    {
        // Maybe create checkout session for donations/commissions.
        Task<string> CreateCheckoutSessionAsync(decimal amount, string currency, string successUrl, string cancelUrl);
    }
}