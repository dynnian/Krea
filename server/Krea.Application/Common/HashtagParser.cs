namespace Krea.Application.Common {
    using System.Text.RegularExpressions;

    public static class HashtagParser
    {
        public static List<string> Extract(string content)
        {
            if (string.IsNullOrWhiteSpace(content))
                return new List<string>();

            var matches = Regex.Matches(content, @"#\w+");

            return matches
                .Select(m => m.Value.ToLower().Trim())
                .Distinct()
                .ToList();
        }
    }
}