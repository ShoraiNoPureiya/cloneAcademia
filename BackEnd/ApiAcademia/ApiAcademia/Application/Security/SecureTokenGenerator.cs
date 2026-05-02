using System.Security.Cryptography;
using Microsoft.AspNetCore.WebUtilities;

namespace ApiAcademia.Application.Security;

public interface ISecureTokenGenerator
{
    string GenerateToken(int bytes = 32);
    string GenerateNumericCode(int digits = 6);
}

public sealed class SecureTokenGenerator : ISecureTokenGenerator
{
    public string GenerateToken(int bytes = 32)
    {
        return WebEncoders.Base64UrlEncode(RandomNumberGenerator.GetBytes(bytes));
    }

    public string GenerateNumericCode(int digits = 6)
    {
        var min = (int)Math.Pow(10, digits - 1);
        var max = (int)Math.Pow(10, digits) - 1;
        return RandomNumberGenerator.GetInt32(min, max).ToString();
    }
}
