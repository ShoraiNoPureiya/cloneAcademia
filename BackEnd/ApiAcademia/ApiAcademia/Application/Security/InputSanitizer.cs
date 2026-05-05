using System.Net;
using System.Text.RegularExpressions;

namespace ApiAcademia.Application.Security;

public interface IInputSanitizer
{
    string Clean(string? value);
}

public sealed partial class InputSanitizer : IInputSanitizer
{
    public string Clean(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return string.Empty;
        }

        var decoded = WebUtility.HtmlDecode(value.Trim());
        return HtmlTagRegex().Replace(decoded, string.Empty);
    }

    [GeneratedRegex("<.*?>", RegexOptions.Compiled)]
    private static partial Regex HtmlTagRegex();
}
