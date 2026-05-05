using System.Security.Cryptography;
using System.Text;

namespace ApiAcademia.Application.Security;

public interface ITokenHasher
{
    string Hash(string token);
    bool Verify(string token, string? tokenHash);
}

public sealed class TokenHasher(IConfiguration configuration) : ITokenHasher
{
    public string Hash(string token)
    {
        var key = Encoding.UTF8.GetBytes(configuration["Jwt:SigningKey"] ?? throw new InvalidOperationException("Jwt:SigningKey nao configurado."));
        var bytes = HMACSHA256.HashData(key, Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(bytes);
    }

    public bool Verify(string token, string? tokenHash)
    {
        if (string.IsNullOrWhiteSpace(tokenHash))
        {
            return false;
        }

        try
        {
            var expected = Convert.FromHexString(tokenHash);
            var actual = Convert.FromHexString(Hash(token));
            return CryptographicOperations.FixedTimeEquals(actual, expected);
        }
        catch (FormatException)
        {
            return false;
        }
    }
}
