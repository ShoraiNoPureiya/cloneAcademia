using System.Security.Cryptography;
using System.Text;

namespace ApiAcademia.Application.Security;

public interface ITokenHasher
{
    string Hash(string token);
}

public sealed class TokenHasher : ITokenHasher
{
    public string Hash(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(bytes);
    }
}
