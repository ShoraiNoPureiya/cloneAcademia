using System.ComponentModel.DataAnnotations;

namespace ApiAcademia.Domain.Entities;

public sealed class CustomerInfo
{
    [Required, MaxLength(160)]
    public string FullName { get; set; } = string.Empty;

    [Required, MaxLength(14)]
    public string Cpf { get; set; } = string.Empty;

    [Required, MaxLength(8)]
    public string ZipCode { get; set; } = string.Empty;

    [Required, MaxLength(240)]
    public string Address { get; set; } = string.Empty;
}
