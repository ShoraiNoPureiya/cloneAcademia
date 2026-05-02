using ApiAcademia.Application.Dtos;
using FluentValidation;

namespace ApiAcademia.Application.Validators;

public sealed class CreatePlanRequestValidator : AbstractValidator<CreatePlanRequest>
{
    public CreatePlanRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().Length(3, 120).Must(NotContainHtml);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(500).Must(NotContainHtml);
        RuleFor(x => x.Price).GreaterThan(0);
        RuleFor(x => x.DurationMonths).InclusiveBetween(1, 36);
    }

    private static bool NotContainHtml(string value) => !value.Contains('<') && !value.Contains('>');
}

public sealed class CreateCouponRequestValidator : AbstractValidator<CreateCouponRequest>
{
    public CreateCouponRequestValidator()
    {
        RuleFor(x => x.Code).NotEmpty().Length(3, 40).Matches("^[A-Za-z0-9_-]+$");
        RuleFor(x => x.DiscountAmount).GreaterThan(0);
        RuleFor(x => x.ExpiresAt).GreaterThan(DateTimeOffset.UtcNow);
    }
}

public sealed class CheckoutRequestValidator : AbstractValidator<CheckoutRequest>
{
    public CheckoutRequestValidator()
    {
        RuleFor(x => x.PlanId).NotEmpty();
        RuleFor(x => x.CustomerInfo).NotNull().SetValidator(new CustomerInfoRequestValidator());
        RuleFor(x => x.CouponCode)
            .MaximumLength(40)
            .Matches("^[A-Za-z0-9_-]+$")
            .When(x => !string.IsNullOrWhiteSpace(x.CouponCode));
    }
}

public sealed class CustomerInfoRequestValidator : AbstractValidator<CustomerInfoRequest>
{
    public CustomerInfoRequestValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().Length(5, 160).Must(NotContainHtml);
        RuleFor(x => x.Cpf).NotEmpty().Must(BeCpf).WithMessage("CPF invalido.");
        RuleFor(x => x.ZipCode).NotEmpty().Matches("^\\d{8}$").WithMessage("CEP deve conter 8 numeros.");
        RuleFor(x => x.Address).NotEmpty().Length(8, 240).Must(NotContainHtml);
    }

    private static bool NotContainHtml(string value) => !value.Contains('<') && !value.Contains('>');

    private static bool BeCpf(string value)
    {
        var cpf = new string((value ?? string.Empty).Where(char.IsDigit).ToArray());
        if (cpf.Length != 11 || cpf.Distinct().Count() == 1)
        {
            return false;
        }

        var sum = 0;
        for (var i = 0; i < 9; i++)
        {
            sum += (cpf[i] - '0') * (10 - i);
        }
        var remainder = sum % 11;
        var firstDigit = remainder < 2 ? 0 : 11 - remainder;
        if (firstDigit != cpf[9] - '0')
        {
            return false;
        }

        sum = 0;
        for (var i = 0; i < 10; i++)
        {
            sum += (cpf[i] - '0') * (11 - i);
        }
        remainder = sum % 11;
        var secondDigit = remainder < 2 ? 0 : 11 - remainder;
        return secondDigit == cpf[10] - '0';
    }
}

public sealed class CreateProductRequestValidator : AbstractValidator<CreateProductRequest>
{
    public CreateProductRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().Length(3, 120).Must(NotContainHtml);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(500).Must(NotContainHtml);
        RuleFor(x => x.Sku).NotEmpty().Length(3, 60).Matches("^[A-Za-z0-9_-]+$");
        RuleFor(x => x.Image)
            .NotEmpty()
            .Must(BeSafeImage)
            .WithMessage("Envie uma imagem JPG, PNG ou WEBP com ate 2MB.");
        RuleFor(x => x.Price).GreaterThan(0);
        RuleFor(x => x.StockQuantity).GreaterThanOrEqualTo(0);
    }

    private static bool NotContainHtml(string value) => !value.Contains('<') && !value.Contains('>');

    private static bool BeSafeImage(IFormFile? file)
    {
        return file is not null &&
            file.Length is > 0 and <= 2 * 1024 * 1024 &&
            (file.ContentType == "image/jpeg" ||
             file.ContentType == "image/png" ||
             file.ContentType == "image/webp");
    }
}

public sealed class UpdateProductRequestValidator : AbstractValidator<UpdateProductRequest>
{
    public UpdateProductRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().Length(3, 120).Must(NotContainHtml);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(500).Must(NotContainHtml);
        RuleFor(x => x.Image)
            .Must(x => x is null || BeSafeImage(x))
            .WithMessage("Envie uma imagem JPG, PNG ou WEBP com ate 2MB.");
        RuleFor(x => x.Price).GreaterThan(0);
        RuleFor(x => x.StockQuantity).GreaterThanOrEqualTo(0);
    }

    private static bool NotContainHtml(string value) => !value.Contains('<') && !value.Contains('>');

    private static bool BeSafeImage(IFormFile file)
    {
        return file.Length is > 0 and <= 2 * 1024 * 1024 &&
            (file.ContentType == "image/jpeg" ||
             file.ContentType == "image/png" ||
             file.ContentType == "image/webp");
    }
}

public sealed class CreateProductPurchaseRequestValidator : AbstractValidator<CreateProductPurchaseRequest>
{
    public CreateProductPurchaseRequestValidator()
    {
        RuleFor(x => x.Quantity).InclusiveBetween(1, 50);
        RuleFor(x => x.CustomerInfo).NotNull().SetValidator(new CustomerInfoRequestValidator());
    }
}
