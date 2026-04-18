namespace Krea.API.Controllers {
    using Application.Features.Admin.Configuration;
    using Application.Features.Admin.Dashboard;
    using Application.Features.Admin.Reports;
    using Application.Features.Admin.Users;
    using Contracts;
    using Domain.Abstractions;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using System.Security.Claims;

    [ApiController]
    [Authorize(Roles = "Admin")]
    [Route("api/admin")]
    public sealed class AdminController : ControllerBase {
        private readonly ISender _sender;

        public AdminController(ISender sender) => _sender = sender;

        [HttpGet("dashboard")]
        public async Task<ActionResult<AdminDashboardDto>> GetDashboard(CancellationToken cancellationToken) {
            AdminDashboardDto result = await _sender.Send(new GetAdminDashboardQuery(), cancellationToken);
            return Ok(result);
        }

        [HttpGet("users")]
        public async Task<ActionResult<AdminUsersPageDto>> GetUsers(
            [FromQuery] string? search,
            [FromQuery] string? role,
            [FromQuery] string? status,
            [FromQuery] string? sortBy,
            [FromQuery] string? sortDirection,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            CancellationToken cancellationToken = default) {
            if (!TryParseStatus(status, out AdminUserStatus? parsedStatus)) {
                return BadRequest(new { error = "Invalid status. Allowed values: Active, Suspended, Banned." });
            }

            if (!TryParseSortBy(sortBy, out AdminUserSortBy parsedSortBy)) {
                return BadRequest(new {
                    error = "Invalid sortBy. Allowed values: CreatedAt, Username, Email, DisplayName, Role, Status."
                });
            }

            if (!TryParseSortDirection(sortDirection, out AdminSortDirection parsedSortDirection)) {
                return BadRequest(new { error = "Invalid sortDirection. Allowed values: Asc, Desc." });
            }

            AdminUsersPageDto result = await _sender.Send(
                new GetAdminUsersQuery(search, role, parsedStatus, page, pageSize, parsedSortBy, parsedSortDirection),
                cancellationToken);

            return Ok(result);
        }

        [HttpPatch("users/{userId:guid}/status")]
        public async Task<IActionResult> UpdateUserStatus(
            Guid userId,
            [FromBody] UpdateAdminUserStatusRequest request,
            CancellationToken cancellationToken) {
            if (!TryParseStatus(request.Status, out AdminUserStatus? status) || status is null) {
                return BadRequest(new { error = "Invalid status. Allowed values: Active, Suspended, Banned." });
            }

            try {
                await _sender.Send(new UpdateAdminUserStatusCommand(userId, status.Value), cancellationToken);
                return NoContent();
            }
            catch (KeyNotFoundException ex) {
                return NotFound(new { error = ex.Message });
            }
        }

        [HttpPatch("users/{userId:guid}/role")]
        public async Task<IActionResult> UpdateUserRole(
            Guid userId,
            [FromBody] UpdateAdminUserRoleRequest request,
            CancellationToken cancellationToken) {
            try {
                await _sender.Send(new UpdateAdminUserRoleCommand(GetCurrentUserId(), userId, request.Role),
                    cancellationToken);
                return NoContent();
            }
            catch (InvalidOperationException ex) {
                return BadRequest(new { error = ex.Message });
            }
            catch (ArgumentException ex) {
                return BadRequest(new { error = ex.Message });
            }
            catch (KeyNotFoundException ex) {
                return NotFound(new { error = ex.Message });
            }
        }

        [HttpDelete("users/{userId:guid}")]
        public async Task<IActionResult> DeleteUser(
            Guid userId,
            CancellationToken cancellationToken) {
            try {
                await _sender.Send(new DeleteAdminUserCommand(GetCurrentUserId(), userId), cancellationToken);
                return NoContent();
            }
            catch (InvalidOperationException ex) {
                return BadRequest(new { error = ex.Message });
            }
            catch (ArgumentException ex) {
                return BadRequest(new { error = ex.Message });
            }
            catch (KeyNotFoundException ex) {
                return NotFound(new { error = ex.Message });
            }
        }

        [HttpGet("reports")]
        public async Task<ActionResult<AdminReportsOverviewDto>> GetReports(CancellationToken cancellationToken) {
            AdminReportsOverviewDto result = await _sender.Send(new GetAdminReportsOverviewQuery(), cancellationToken);
            return Ok(result);
        }

        [HttpGet("reports/posts")]
        public async Task<ActionResult<AdminPostModerationReportsPageDto>> GetPostReports(
            [FromQuery] string? status,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            CancellationToken cancellationToken = default) {
            if (!TryParseReportStatus(status, out Domain.ValueObjects.PostModerationReportStatus? parsedStatus)) {
                return BadRequest(new { error = "Invalid status. Allowed values: Pending, Resolved." });
            }

            AdminPostModerationReportsPageDto result = await _sender.Send(
                new GetAdminPostModerationReportsQuery(parsedStatus, page, pageSize),
                cancellationToken);

            return Ok(result);
        }

        [HttpPatch("reports/posts/{reportId:guid}/evaluate")]
        public async Task<IActionResult> EvaluatePostReport(
            Guid reportId,
            [FromBody] EvaluateAdminPostModerationReportRequest request,
            CancellationToken cancellationToken) {
            if (!TryParseModerationAction(request.Action,
                    out Domain.ValueObjects.PostModerationDecisionAction action)) {
                return BadRequest(new {
                    error = "Invalid action. Allowed values: Dismiss, DeletePost, SuspendAuthor."
                });
            }

            try {
                await _sender.Send(
                    new EvaluateAdminPostModerationReportCommand(GetCurrentUserId(), reportId, action,
                        request.ModeratorNote),
                    cancellationToken);

                return NoContent();
            }
            catch (InvalidOperationException ex) {
                return BadRequest(new { error = ex.Message });
            }
            catch (ArgumentException ex) {
                return BadRequest(new { error = ex.Message });
            }
            catch (KeyNotFoundException ex) {
                return NotFound(new { error = ex.Message });
            }
        }

        [HttpGet("configuration")]
        public async Task<ActionResult<AdminInstanceConfigurationDto>> GetConfiguration(
            CancellationToken cancellationToken) {
            AdminInstanceConfigurationDto result = await _sender.Send(
                new GetAdminInstanceConfigurationQuery(),
                cancellationToken);

            return Ok(result);
        }

        [HttpPut("configuration")]
        public async Task<ActionResult<AdminInstanceConfigurationDto>> UpdateConfiguration(
            [FromBody] UpdateAdminInstanceConfigurationRequest request,
            CancellationToken cancellationToken) {
            try {
                AdminInstanceConfigurationDto result = await _sender.Send(
                    new UpdateAdminInstanceConfigurationCommand(
                        request.PlatformName,
                        request.Description,
                        request.AdministratorEmail),
                    cancellationToken);

                return Ok(result);
            }
            catch (ArgumentException ex) {
                return BadRequest(new { error = ex.Message });
            }
        }

        private static bool TryParseStatus(string? status, out AdminUserStatus? parsedStatus) {
            parsedStatus = null;

            if (string.IsNullOrWhiteSpace(status))
                return true;

            if (!Enum.TryParse(status, true, out AdminUserStatus value))
                return false;

            parsedStatus = value;
            return true;
        }

        private static bool TryParseSortBy(string? sortBy, out AdminUserSortBy parsedSortBy) {
            if (string.IsNullOrWhiteSpace(sortBy)) {
                parsedSortBy = AdminUserSortBy.CreatedAt;
                return true;
            }

            return Enum.TryParse(sortBy, true, out parsedSortBy);
        }

        private static bool TryParseSortDirection(string? sortDirection, out AdminSortDirection parsedSortDirection) {
            if (string.IsNullOrWhiteSpace(sortDirection)) {
                parsedSortDirection = AdminSortDirection.Desc;
                return true;
            }

            return Enum.TryParse(sortDirection, true, out parsedSortDirection);
        }

        private static bool TryParseReportStatus(string? status,
                                                 out Domain.ValueObjects.PostModerationReportStatus? parsedStatus) {
            parsedStatus = null;

            if (string.IsNullOrWhiteSpace(status))
                return true;

            if (!Enum.TryParse(status, true, out Domain.ValueObjects.PostModerationReportStatus value))
                return false;

            parsedStatus = value;
            return true;
        }

        private static bool TryParseModerationAction(string? action,
                                                     out Domain.ValueObjects.PostModerationDecisionAction
                                                         parsedAction) {
            if (string.IsNullOrWhiteSpace(action)) {
                parsedAction = default;
                return false;
            }

            return Enum.TryParse(action, true, out parsedAction);
        }

        private Guid GetCurrentUserId() {
            string? userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out Guid userId))
                throw new UnauthorizedAccessException("User ID not found in claims.");

            return userId;
        }
    }
}