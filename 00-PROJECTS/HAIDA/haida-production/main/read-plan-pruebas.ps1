$docxPath = 'C:\Users\CarlosArturoArevaloM\Documents\Proyectos\CTB -\Documentación\Plan de Pruebas - CTB.docx'
$tempDir = [System.IO.Path]::GetTempPath() + 'docx_extract_' + [guid]::NewGuid()

try {
    mkdir $tempDir | Out-Null
    Expand-Archive -LiteralPath $docxPath -DestinationPath $tempDir -Force
    
    $xmlContent = Get-Content "$tempDir\word\document.xml" -Raw
    $text = $xmlContent -replace '<[^>]*>', ''
    $text = $text -replace '&nbsp;', ' '
    $text = $text -replace '&#160;', ' '
    $text = $text -replace '\s+', ' '
    
    $text.Substring(0, [Math]::Min(5000, $text.Length))
    
} finally {
    if (Test-Path $tempDir) {
        Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}
