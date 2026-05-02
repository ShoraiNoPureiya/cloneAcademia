# syntax=docker/dockerfile:1

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ApiAcademia/ApiAcademia.csproj ApiAcademia/
RUN dotnet restore ApiAcademia/ApiAcademia.csproj

COPY ApiAcademia/ ApiAcademia/
RUN dotnet publish ApiAcademia/ApiAcademia.csproj \
    --configuration Release \
    --output /app/publish \
    --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080

COPY --from=build /app/publish .

CMD ASPNETCORE_URLS="http://0.0.0.0:${PORT:-8080}" dotnet ApiAcademia.dll
