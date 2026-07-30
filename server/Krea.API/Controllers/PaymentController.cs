namespace Krea.API.Controllers {
    using Application.Abstractions.Payments;
    using Application.Features.Payments.Dtos;
    using Application.Features.Payments.GetReceivedPayments;
    using Application.Features.Payments.GetSentPayments;
    using Domain.Abstractions;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;

    [Authorize]
    [ApiController]
    [Route("api/payments")]
    public class PaymentsController : ControllerBase {
        private readonly ISender _sender;

        public PaymentsController(ISender sender) => _sender = sender;

        /// <summary>
        /// Lists payments made by the authenticated user (sent payments).
        /// </summary>
        /// <param name="paymentType">Filter by type: Donation, Commission, Subscription.</param>
        /// <param name="status">Filter by status: Pending, Completed, Failed.</param>
        /// <param name="from">Start date (ISO format).</param>
        /// <param name="to">End date (ISO format).</param>
        /// <param name="page">Page number (default 1).</param>
        /// <param name="pageSize">Items per page (default 20, max 100).</param>
        /// <returns>Paginated list of payments.</returns>
        [HttpGet("sent")]
        [ProducesResponseType(typeof(PagedResult<PaymentSummaryDto>), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        public async Task<ActionResult<PagedResult<PaymentSummaryDto>>> GetSentPayments(
            [FromQuery] string? paymentType = null,
            [FromQuery] string? status = null,
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20) {
            if (pageSize > 100)
                pageSize = 100;
            var query = new GetSentPaymentsQuery(paymentType, status, from, to, page, pageSize);
            PagedResult<PaymentSummaryDto> result = await _sender.Send(query);
            return Ok(result);
        }

        /// <summary>
        /// Lists payments received by the authenticated user (as an artist).
        /// </summary>
        /// <param name="paymentType">Filter by type: Donation, Commission, Subscription.</param>
        /// <param name="status">Filter by status: Pending, Completed, Failed.</param>
        /// <param name="from">Start date (ISO format).</param>
        /// <param name="to">End date (ISO format).</param>
        /// <param name="page">Page number (default 1).</param>
        /// <param name="pageSize">Items per page (default 20, max 100).</param>
        /// <returns>Paginated list of payments.</returns>
        [HttpGet("received")]
        [ProducesResponseType(typeof(PagedResult<PaymentSummaryDto>), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        public async Task<ActionResult<PagedResult<PaymentSummaryDto>>> GetReceivedPayments(
            [FromQuery] string? paymentType = null,
            [FromQuery] string? status = null,
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20) {
            if (pageSize > 100)
                pageSize = 100;
            var query = new GetReceivedPaymentsQuery(paymentType, status, from, to, page, pageSize);
            PagedResult<PaymentSummaryDto> result = await _sender.Send(query);
            return Ok(result);
        }
    }
}