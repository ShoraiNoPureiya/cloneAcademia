namespace ApiAcademia.Application.Dtos;

public sealed record CreatePlanRequest(string Name, string Description, decimal Price, int DurationMonths);

public sealed record PlanResponse(Guid Id, string Name, string Description, decimal Price, int DurationMonths, bool Active);
