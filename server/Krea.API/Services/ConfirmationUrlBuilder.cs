using Krea.Application.Abstractions.Url;
using Microsoft.AspNetCore.Mvc;

namespace Krea.API.Services;

public class ConfirmationUrlBuilder : IConfirmationUrlBuilder
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly LinkGenerator _linkGenerator;

    public ConfirmationUrlBuilder(IHttpContextAccessor httpContextAccessor, LinkGenerator linkGenerator)
    {
        _httpContextAccessor = httpContextAccessor;
        _linkGenerator = linkGenerator;
    }

    public string BuildEmailConfirmationLink(Guid userId, string token)
    {
        var httpContext = _httpContextAccessor.HttpContext;
        var link = _linkGenerator.GetUriByAction(
            httpContext,
            action: "ConfirmEmail",
            controller: "Auth",
            values: new { userId, token }
        );
        return link!;
    }
}