using System.ComponentModel.DataAnnotations;

namespace Krea.Domain.Validators {
    public class UserNameAttribute : ValidationAttribute {
        public UserNameAttribute() => ErrorMessage =
            "Invalid username. Usernames can only contain alphanumeric characters and underscores and must be between 3 and 12 characters long.";

        public override bool IsValid(object? value) {
            if (value is not string username) {
                return false;
            }

            return username.Length is >= 3 and <= 12 && username.All(c => char.IsLetterOrDigit(c) || c == '_');
        }
    }
}