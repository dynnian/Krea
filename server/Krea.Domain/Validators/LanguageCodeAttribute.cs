using System.ComponentModel.DataAnnotations;
using System.Globalization;

namespace Krea.Domain.Validators {
    public class LanguageCodeAttribute : ValidationAttribute {
        public LanguageCodeAttribute() => ErrorMessage =
            "Invalid language code. Language codes must be in the format 'xx' where 'xx' is a two-letter lowercase language code.";

        public override bool IsValid(object? value) {
            if (value is not string languageCode) {
                return false;
            }

            if (string.IsNullOrWhiteSpace(languageCode)) {
                return false;
            }

            // Must be exactly two lowercase letters
            if (languageCode.Length != 2 || !IsAllLowercaseLetters(languageCode)) {
                return false;
            }

            // Validate language against neutral cultures with two-letter names
            IEnumerable<string> neutralTwoLetterNames = CultureInfo.GetCultures(CultureTypes.NeutralCultures)
                                                                   .Select(c => c.Name.ToLowerInvariant())
                                                                   .Where(n => !string.IsNullOrEmpty(n) &&
                                                                               n.Length == 2)
                                                                   .Distinct();

            return neutralTwoLetterNames.Contains(languageCode);
        }

        private static bool IsAllLowercaseLetters(string str) => str.All(c => char.IsLower(c) && char.IsLetter(c));

        private static bool IsAllUppercaseLetters(string str) => str.All(c => char.IsUpper(c) && char.IsLetter(c));
    }
}