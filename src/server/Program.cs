using Microsoft.Extensions.Logging;

namespace U2.Server;

public class Program
{
    public static void Main(string[] args)
    {
        using var loggerFactory = LoggerFactory.Create(builder =>
        {
            builder.AddConsole();
        });

        var logger = loggerFactory.CreateLogger<Program>();
        logger.LogInformation("U2 Server starting...");
        logger.LogInformation("M0.1 - Repository and build structure initialized");
        
        // Заглушка для будущего сервера
        Console.WriteLine("Press any key to exit...");
        Console.ReadKey();
    }
}
