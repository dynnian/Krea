using Krea.Domain.ValueObjects;

namespace Krea.Domain.Entities;

public sealed class Subscription
{
    public Guid Id { get; private set; }
    public User Subscriber { get; private set; }
    public MembershipPlan Plan { get; private set; }

    private readonly List<Payment> _payments = new();
    public IReadOnlyCollection<Payment> Payments => _payments;

    public bool IsActive { get; private set; }
    public DateTime CurrentPeriodStart { get; private set; }
    public DateTime CurrentPeriodEnd { get; private set; }
    public DateTime? CanceledAt { get; private set; }
    public DateTime SubscribedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    #pragma warning disable CS8618
    private Subscription() { }
    #pragma warning restore CS8618

    public Subscription(User subscriber, MembershipPlan plan, DateTime start, DateTime end)
    {
        Validate(subscriber, plan, start, end);

        Id = Guid.NewGuid();
        Subscriber = subscriber;
        Plan = plan;
        CurrentPeriodStart = start;
        CurrentPeriodEnd = end;
        IsActive = true;
        SubscribedAt = DateTime.UtcNow;
        UpdatedAt = SubscribedAt;
    }

    public static Subscription Load(
        Guid id,
        User subscriber,
        MembershipPlan plan,
        bool isActive,
        DateTime start,
        DateTime end,
        DateTime? canceledAt,
        DateTime subscribedAt,
        DateTime updatedAt)
    {
        Validate(subscriber, plan, start, end);

        return new Subscription
        {
            Id = id,
            Subscriber = subscriber,
            Plan = plan,
            IsActive = isActive,
            CurrentPeriodStart = start,
            CurrentPeriodEnd = end,
            CanceledAt = canceledAt,
            SubscribedAt = subscribedAt,
            UpdatedAt = updatedAt
        };
    }

    // Crear un pago asociado a esta suscripción    
    public Payment CreatePayment(User payer, Money amount, ExternalPaymentRef externalRef)
    {
        if (!IsActive)
            throw new InvalidOperationException("Cannot create payment for inactive subscription.");

        if (!ReferenceEquals(payer, Subscriber))
            throw new ArgumentException("Payer must be the subscriber.");
        
        if (amount != Plan.PriceAmount) throw new ArgumentException("Paid amount does not coincide with plan price.");

        var payment = new Payment(payer, amount, externalRef, this);
        _payments.Add(payment);
        return payment;
    }

    public void Renew(DateTime newStart, DateTime newEnd)
    {
        if (!IsActive)
            throw new InvalidOperationException("Cannot renew inactive subscription.");

        ValidatePeriod(newStart, newEnd);
        CurrentPeriodStart = newStart;
        CurrentPeriodEnd = newEnd;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Cancel()
    {
        if (!IsActive) return;

        IsActive = false;
        CanceledAt = DateTime.UtcNow;
        UpdatedAt = CanceledAt.Value;
    }

    private static void Validate(User subscriber, MembershipPlan plan, DateTime start, DateTime end)
    {
        if (subscriber is null) throw new ArgumentNullException(nameof(subscriber));
        if (plan is null) throw new ArgumentNullException(nameof(plan));
        ValidatePeriod(start, end);
    }

    private static void ValidatePeriod(DateTime start, DateTime end)
    {
        if (end <= start)
            throw new ArgumentException("Invalid subscription period.");
    }
}