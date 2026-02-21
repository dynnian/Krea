using Krea.Domain.Entities;
using Krea.Domain.Repositories;
using Krea.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Krea.Infrastructure.Repositories {
    public sealed class PaymentRepository : IPaymentRepository {
        private readonly AppDbContext _context;

        public PaymentRepository(AppDbContext context) {
            _context = context;
        }

        public async Task<Payment?> GetByIdAsync(Guid id) {
            return await _context.Payments
                .Include(p => p.Payer)
                .Include(p => p.Payee)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task AddAsync(Payment payment) {
            await _context.Payments.AddAsync(payment);
        }

        public Task UpdateAsync(Payment payment) {
            _context.Payments.Update(payment);
            return Task.CompletedTask;
        }
    }
}