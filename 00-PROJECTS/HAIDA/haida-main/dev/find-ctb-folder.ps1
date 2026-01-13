$baseFolder = 'C:\Users\CarlosArturoArevaloM\Documents\Proyectos'
$folders = Get-ChildItem $baseFolder -Directory
$folders | Where-Object { $_.Name -like 'CTB*' } | ForEach-Object { $_.Name }
