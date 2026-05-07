using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using MotCua.Infrastructure.Data;
using MotCua.Infrastructure.Repositories;
using MotCua.Domain.Interfaces;
using MotCua.Worker;

var builder = Host.CreateDefaultBuilder(args);

builder.ConfigureServices((hostContext, services) =>
{
    services.AddDbContext<MotCuaDbContext>(options =>
        options.UseSqlServer(hostContext.Configuration.GetConnectionString("DefaultConnection")));

    services.AddScoped<ITinNhanRepository, TinNhanRepository>();
    services.AddHostedService<EmailWorkerService>();
});

var host = builder.Build();
host.Run();
