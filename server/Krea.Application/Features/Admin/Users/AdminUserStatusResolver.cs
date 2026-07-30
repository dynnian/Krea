namespace Krea.Application.Features.Admin.Users {
    using Domain.Entities;

    internal static class AdminUserStatusResolver {
        public static AdminUserStatus Resolve(User user) {
            if (user.IsBanned)
                return AdminUserStatus.Banned;

            if (user.IsDisabled)
                return AdminUserStatus.Suspended;

            return AdminUserStatus.Active;
        }
    }
}