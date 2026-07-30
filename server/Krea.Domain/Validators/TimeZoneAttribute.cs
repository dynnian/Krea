using System.ComponentModel.DataAnnotations;

namespace Krea.Domain.Validators {
    public class TimeZoneAttribute : ValidationAttribute {
        public TimeZoneAttribute() =>
            ErrorMessage = "Invalid timezone. Timezone must be a valid IANA timezone identifier.";

        public override bool IsValid(object? value) {
            if (value is not string timeZoneId) {
                return false;
            }

            if (string.IsNullOrWhiteSpace(timeZoneId)) {
                return false;
            }

            try {
                _ = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
                return true;
            }
            catch (TimeZoneNotFoundException) {
                return false;
            }
            catch (InvalidTimeZoneException) {
                return false;
            }
        }
    }
}