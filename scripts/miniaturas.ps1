# Gera versoes menores das fotos de img/ em img/640/, img/828/ e img/1280/ (grade, miniaturas,
# celular e o banner de tela cheia; a de 1280 so sai para fotos com mais de 1408px de largura).
# Uso: npm run fotos   (ou: powershell -ExecutionPolicy Bypass -File scripts/miniaturas.ps1)
# Rode de novo sempre que adicionar ou trocar fotos. Fotos ja convertidas sao puladas.
param([int[]]$Larguras = @(640, 828, 1280), [int]$Qualidade = 70)

Add-Type -AssemblyName System.Drawing
$raiz = Split-Path -Parent $PSScriptRoot
$origem = Join-Path $raiz 'img'

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$params = New-Object System.Drawing.Imaging.EncoderParameters 1
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality, [long]$Qualidade)

$geradas = 0; $puladas = 0
$fotos = Get-ChildItem $origem -File | Where-Object { $_.Extension -match '^\.(jpe?g|png)$' }
foreach ($Largura in $Larguras) {
  $destino = Join-Path $origem ([string]$Largura)
  New-Item -ItemType Directory -Force $destino | Out-Null
  foreach ($foto in $fotos) {
    $saida = Join-Path $destino ($foto.BaseName + '.jpg')
    if ((Test-Path $saida) -and ((Get-Item $saida).LastWriteTime -ge $foto.LastWriteTime)) { $puladas++; continue }

    $img = [System.Drawing.Image]::FromFile($foto.FullName)
    try {
      # Respeita a orientacao gravada pela camera (EXIF 0x0112)
      if ($img.PropertyIdList -contains 0x0112) {
        switch ([int]$img.GetPropertyItem(0x0112).Value[0]) {
          3 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipNone) }
          6 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone) }
          8 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipNone) }
        }
      }
      # So reduz: se a foto ja for menor que a largura (com folga de 10%), nao gera
      if ($img.Width -le [int]($Largura * 1.1)) { $puladas++; continue }
      $altura = [int][Math]::Round($img.Height * $Largura / $img.Width)
      $bmp = New-Object System.Drawing.Bitmap $Largura, $altura
      $g = [System.Drawing.Graphics]::FromImage($bmp)
      $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
      $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
      $g.DrawImage($img, 0, 0, $Largura, $altura)
      $bmp.Save($saida, $codec, $params)
      $g.Dispose(); $bmp.Dispose()
      $geradas++
      Write-Host ("  OK  img/{0}/{1}.jpg  ({2}x{3}, {4:N0} KB)" -f $Largura, $foto.BaseName, $Largura, $altura, ((Get-Item $saida).Length / 1KB))
    } finally { $img.Dispose() }
  }
}
Write-Host ("Miniaturas: {0} gerada(s), {1} pulada(s) em img/{2}/" -f $geradas, $puladas, ($Larguras -join '/, img/'))
