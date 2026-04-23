namespace Krea.Application.Common {
    public static class RoleHelper {
        public static int GetRoleInt(IEnumerable<string> roles) {
            IEnumerable<string> enumerable = roles as string[] ?? roles.ToArray();
            if (enumerable.Contains("Admin"))
                return 1;
            if (enumerable.Contains("Artist"))
                return 2;
            throw new ArgumentException("Invalid role list");
        }
    }
}