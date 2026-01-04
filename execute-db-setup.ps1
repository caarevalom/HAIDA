# Script simple para ejecutar setup de base de datos
Set-Location "C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA"

# Cargar PATH completo para encontrar node
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Cargar variables de entorno desde .env.production
Write-Host "Loading environment variables..." -ForegroundColor Cyan
Get-Content ".env.production" | ForEach-Object {
    if ($_ -match '^([^#][^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($key, $value, "Process")
        Write-Host "Loaded: $key" -ForegroundColor Gray
    }
}

Write-Host "Environment variables loaded" -ForegroundColor Green

# Ejecutar setup de base de datos
Write-Host "Running database setup..." -ForegroundColor Cyan
node database/setup-database.js
