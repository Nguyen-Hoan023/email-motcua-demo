using MotCua.API;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using MotCua.Application.Interfaces;
using MotCua.Application.Services;
using MotCua.Domain.Interfaces;
using MotCua.Infrastructure.Data;
using MotCua.Infrastructure.Repositories;
using MotCua.Infrastructure.Services;
using MotCua.API.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSignalR();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.SetIsOriginAllowed(origin => true)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

// Swagger configuration (không cần JWT)
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "MotCua API", Version = "v1" });
});

// Configure DbContext — SQL Server
builder.Services.AddDbContext<MotCuaDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// DI Container
builder.Services.AddScoped<INguoiDungRepository, NguoiDungRepository>();
builder.Services.AddScoped<IYeuCauRepository, YeuCauRepository>();
builder.Services.AddScoped<ITinNhanRepository, TinNhanRepository>();
builder.Services.AddScoped<IFileStorageService, LocalFileStorageService>();

builder.Services.AddScoped<INotificationService, MotCua.API.Services.HubNotificationService>();
builder.Services.AddScoped<IYeuCauService, YeuCauService>();

var app = builder.Build();

await DemoDataSeeder.SeedAsync(app.Services);

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("AllowReactApp");


app.MapControllers();
app.MapHub<MotCuaHub>("/hubs/motcua");

app.Run();
