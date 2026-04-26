using Krea.API.Controllers;
using Krea.Application.Abstractions.Payments;
using Krea.Application.Features.Payments.ConfirmPayment;
using Krea.Domain.Abstractions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Stripe;
using Xunit;

namespace Krea.API.Tests.Unit.Controllers;

public sealed class StripeWebhookControllerTests
{
    private readonly Mock<IPaymentGateway> _gatewayMock;
    private readonly Mock<ISender> _senderMock;
    private readonly StripeWebhookController _controller;

    public StripeWebhookControllerTests()
    {
        _gatewayMock = new Mock<IPaymentGateway>();
        _senderMock = new Mock<ISender>();
        var loggerMock = new Mock<ILogger<StripeWebhookController>>();

        _controller = new StripeWebhookController(
            _gatewayMock.Object,
            _senderMock.Object,
            loggerMock.Object
        );

        var httpContext = new DefaultHttpContext();
        _controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
    }

    [Fact]
    public async Task HandleWebhook_MissingSignature_ReturnsBadRequest()
    {
        // No signature header
        var result = await _controller.HandleWebhook();

        var badRequest = Assert.IsType<BadRequestResult>(result);
        Assert.Equal(400, badRequest.StatusCode);
    }

    [Fact]
    public async Task HandleWebhook_StripeException_ReturnsBadRequest()
    {
        _controller.Request.Headers["Stripe-Signature"] = "dummy";
        _gatewayMock.Setup(x => x.ConstructStripeEvent(It.IsAny<string>(), It.IsAny<string>()))
            .Throws(new StripeException("Invalid signature"));

        var result = await _controller.HandleWebhook();

        var badRequest = Assert.IsType<BadRequestResult>(result);
        Assert.Equal(400, badRequest.StatusCode);
    }

    [Fact]
    public async Task HandleWebhook_EventNotCheckoutCompleted_ReturnsOkAndDoesNotSendCommand()
    {
        _controller.Request.Headers["Stripe-Signature"] = "dummy";
        _controller.Request.Body = new MemoryStream(System.Text.Encoding.UTF8.GetBytes("{}"));

        _gatewayMock.Setup(x => x.ConstructStripeEvent(It.IsAny<string>(), It.IsAny<string>()))
            .Returns(new StripeWebhookEvent("payment_intent.succeeded", null));

        var result = await _controller.HandleWebhook();

        Assert.IsType<OkResult>(result);
        _senderMock.Verify(x => x.Send(It.IsAny<ConfirmPaymentCommand>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task HandleWebhook_CheckoutCompletedWithSessionId_SendsConfirmPaymentCommand()
    {
        _controller.Request.Headers["Stripe-Signature"] = "dummy";
        var json = "{\"id\": \"evt_123\", \"type\": \"checkout.session.completed\"}";
        _controller.Request.Body = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(json));

        _gatewayMock.Setup(x => x.ConstructStripeEvent(It.IsAny<string>(), It.IsAny<string>()))
            .Returns(new StripeWebhookEvent("checkout.session.completed", "sess_123"));

        var result = await _controller.HandleWebhook();

        Assert.IsType<OkResult>(result);
        _senderMock.Verify(x => x.Send(
            It.Is<ConfirmPaymentCommand>(c => c.Provider == "stripe" && c.ExternalId == "sess_123"),
            It.IsAny<CancellationToken>()), Times.Once);
    }
}