$ErrorActionPreference = "Stop"

$converter = Get-Command cwebp -ErrorAction SilentlyContinue
if (-not $converter) {
  throw "cwebp não foi encontrado. Instale o utilitário WebP e execute este script novamente."
}

$imageDirectory = Join-Path $PSScriptRoot "img"
$sources = Get-ChildItem -LiteralPath $imageDirectory -File |
  Where-Object { $_.Extension -in @(".jpg", ".jpeg", ".png") }

foreach ($source in $sources) {
  $destination = Join-Path $imageDirectory ($source.BaseName + ".webp")
  & $converter.Source -quiet -q 82 $source.FullName -o $destination
  if ($LASTEXITCODE -ne 0) {
    throw "Falha ao converter $($source.Name) para WebP (código $LASTEXITCODE)."
  }
}

Write-Output "Conversão WebP concluída em $imageDirectory."
