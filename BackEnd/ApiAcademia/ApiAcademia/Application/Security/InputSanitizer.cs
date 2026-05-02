using System.Text.Encodings.Web;
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

        var withoutTags = HtmlTagRegex().Replace(value.Trim(), string.Empty);
        return HtmlEncoder.Default.Encode(withoutTags);
    }

    [GeneratedRegex("<.*?>", RegexOptions.Compiled)]
    private static partial Regex HtmlTagRegex();
}
