using ApiAcademia.Api;
using ApiAcademia.Application.Dtos;
using ApiAcademia.Application.Exceptions;
using ApiAcademia.Application.Security;
using ApiAcademia.Domain.Entities;
using ApiAcademia.Domain.Repositories;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApiAcademia.Controllers;

[ApiController]
[Route("api/admin/plans")]
[Authorize(Policy = "AdminOnly")]
public sealed class PlansController(
    IRepository<Plan> planRepository,
    IInputSanitizer sanitizer) : ControllerBase
{
    [HttpGet]
    public async Task<IReadOnlyList<PlanResponse>> List(CancellationToken cancellationToken)
    {
        var plans = await planRepository.ListAsync(cancellationToken);
        return plans.Select(x => new PlanResponse(x.Id, x.Name, x.Description, x.Price, x.DurationMonths, x.Active)).ToList();
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        CreatePlanRequest request,
        IValidator<CreatePlanRequest> validator,
        CancellationToken cancellationToken)
    {
        if (await validator.ToBadRequestIfInvalidAsync(request, cancellationToken) is { } badRequest)
        {
            return badRequest;
        }

        var plan = new Plan
        {
            Name = sanitizer.Clean(request.Name),
            Description = sanitizer.Clean(request.Description),
            Price = request.Price,
            DurationMonths = request.DurationMonths,
            Active = true
        };

        await planRepository.AddAsync(plan, cancellationToken);
        await planRepository.SaveChangesAsync(cancellationToken);
        return CreatedAtAction(nameof(List), new { id = plan.Id }, new PlanResponse(plan.Id, plan.Name, plan.Description, plan.Price, plan.DurationMonths, plan.Active));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        UpdatePlanRequest request,
        IValidator<UpdatePlanRequest> validator,
        CancellationToken cancellationToken)
    {
        if (await validator.ToBadRequestIfInvalidAsync(request, cancellationToken) is { } badRequest)
        {
            return badRequest;
        }

        var plan = await planRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new AppException("Plano nao encontrado.", StatusCodes.Status404NotFound);

        var name = sanitizer.Clean(request.Name);
        var existing = await planRepository.FirstOrDefaultAsync(x => x.Name == name && x.Id != id, cancellationToken);
        if (existing is not null)
        {
            throw new AppException("Nome de plano ja cadastrado.");
        }

        plan.Name = name;
        plan.Description = sanitizer.Clean(request.Description);
        plan.Price = request.Price;
        plan.DurationMonths = request.DurationMonths;
        plan.Active = request.Active;

        planRepository.Update(plan);
        await planRepository.SaveChangesAsync(cancellationToken);
        return Ok(new PlanResponse(plan.Id, plan.Name, plan.Description, plan.Price, plan.DurationMonths, plan.Active));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Deactivate(Guid id, CancellationToken cancellationToken)
    {
        var plan = await planRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new AppException("Plano nao encontrado.", StatusCodes.Status404NotFound);

        plan.Active = false;
        planRepository.Update(plan);
        await planRepository.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}
