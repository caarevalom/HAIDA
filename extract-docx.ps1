# Script seguro para extraer texto de DOCX (lectura, sin modificación)
param([string]$DocxPath)

try {
    Add-Type -AssemblyName System.IO.Compression
    
    $zip = [System.IO.Compression.ZipFile]::OpenRead($DocxPath)
    $entry = $zip.GetEntry('word/document.xml')
    
    if ($entry -eq $null) {
        Write-Host "Error: No se encontró document.xml en el DOCX"
        return
    }
    
    $stream = $entry.Open()
    $reader = New-Object System.IO.StreamReader($stream)
    $xml = $reader.ReadToEnd()
    $reader.Close()
    $stream.Close()
    $zip.Close()
    
    # Extraer texto limpio
    $text = $xml -replace '<[^>]*>', ''  # Remover tags XML
    $text = [System.Net.WebUtility]::HtmlDecode($text)
    $text = $text -replace '\s+', ' '  # Normalizar espacios
    
    Write-Host $text
    
} catch {
    Write-Host "Error al procesar DOCX: $_"
}
