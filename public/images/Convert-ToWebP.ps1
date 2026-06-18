# Convert-ToWebP.ps1
# Converts images to WebP format using ImageMagick + cwebp, with resize support
#
# Requirements: ImageMagick and cwebp must be installed
#   cwebp via Chocolatey : choco install webp
#   cwebp via Scoop      : scoop install libwebp
#   ImageMagick          : https://imagemagick.org/script/download.php
#
# Usage:
#   .\Convert-ToWebP.ps1                                        # Convert all images in current dir (1920x1080 / 800x1067)
#   .\Convert-ToWebP.ps1 -LandscapeSize "1280x720"             # Custom landscape output size
#   .\Convert-ToWebP.ps1 -LandscapeSize "1280x720" -PortraitSize "720x960"
#   .\Convert-ToWebP.ps1 -InputDir "C:\images" -OutputDir "C:\images\resized"
#   .\Convert-ToWebP.ps1 -LandscapeSize "1280x720" -DeleteOriginals
#   .\Convert-ToWebP.ps1 -Recurse
#
# Supported input formats: jpg, jpeg, png, gif, bmp, tiff, tif, webp

param (
    [string]$InputDir        = (Get-Location).Path,
    [string]$OutputDir       = "",           # Leave empty to save alongside originals
    [switch]$Recurse         = $false,       # Process subdirectories recursively
    [switch]$DeleteOriginals = $false,       # Delete source files after successful conversion
    [int]$ImageQuality       = 70,
    [int]$AlphaQuality       = 70,
    [string]$LandscapeSize   = "1920x1080",  # Target size for landscape/square images
    [string]$PortraitSize    = ""            # Target size for portrait images (auto-derived if omitted)
)

# ── Validate tools ────────────────────────────────────────────────────────────
if (-not (Get-Command cwebp -ErrorAction SilentlyContinue)) {
    Write-Host ""
    Write-Host "  ERROR: cwebp not found in PATH." -ForegroundColor Red
    Write-Host "    Chocolatey : choco install webp" -ForegroundColor Cyan
    Write-Host "    Scoop      : scoop install libwebp" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

if (-not (Get-Command magick -ErrorAction SilentlyContinue)) {
    Write-Host ""
    Write-Host "  ERROR: ImageMagick (magick) not found in PATH." -ForegroundColor Red
    Write-Host "    Download: https://imagemagick.org/script/download.php" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

# ── Validate input directory ──────────────────────────────────────────────────
if (-not (Test-Path $InputDir -PathType Container)) {
    Write-Host "ERROR: Input directory not found: $InputDir" -ForegroundColor Red
    exit 1
}

# ── Parse landscape size and derive portrait size if not supplied ─────────────
if ($LandscapeSize -notmatch '^\d+x\d+$') {
    Write-Host "ERROR: LandscapeSize must be in WxH format, e.g. 1280x720" -ForegroundColor Red
    exit 1
}

$lsParts = $LandscapeSize.Split('x')
$lsW = [int]$lsParts[0]
$lsH = [int]$lsParts[1]

if ($PortraitSize -eq "") {
    # Swap landscape dimensions for portrait
    $PortraitSize = "${lsH}x${lsW}"
}

if ($PortraitSize -notmatch '^\d+x\d+$') {
    Write-Host "ERROR: PortraitSize must be in WxH format, e.g. 720x960" -ForegroundColor Red
    exit 1
}

# ── Gather files ──────────────────────────────────────────────────────────────
$supportedExts = @(".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".tif", ".webp")

$getChildParams = @{
    Path    = $InputDir
    File    = $true
    Recurse = $Recurse
}
$images = Get-ChildItem @getChildParams | Where-Object {
    $_.Extension.ToLower() -in $supportedExts
}

if ($images.Count -eq 0) {
    Write-Host "No supported images found in: $InputDir" -ForegroundColor Yellow
    exit 0
}

# ── Summary header ────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  WebP Batch Converter" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  Input dir      : $InputDir"
Write-Host "  Output dir     : $(if ($OutputDir) { $OutputDir } else { 'Alongside originals' })"
Write-Host "  Landscape size : $LandscapeSize"
Write-Host "  Portrait size  : $PortraitSize"
Write-Host "  Image quality  : $ImageQuality"
Write-Host "  Alpha quality  : $AlphaQuality"
Write-Host "  Recursive      : $Recurse"
Write-Host "  Delete orig.   : $DeleteOriginals"
Write-Host "  Images found   : $($images.Count)"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# ── Conversion loop ───────────────────────────────────────────────────────────
$successCount = 0
$failCount    = 0
$skipCount    = 0
$savedBytes   = 0

foreach ($image in $images) {

    # Determine output path
    if ($OutputDir) {
        $relativePath = $image.DirectoryName.Substring($InputDir.Length).TrimStart('\','/')
        $targetDir    = if ($relativePath) { Join-Path $OutputDir $relativePath } else { $OutputDir }
    } else {
        $targetDir = $image.DirectoryName
    }

    if (-not (Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }

    $outputFile = Join-Path $targetDir ($image.BaseName + ".webp")

    # Skip if output already exists and source is not the output itself
    $sourceIsOutput = $image.FullName -eq $outputFile
    if (-not $sourceIsOutput -and (Test-Path $outputFile)) {
        Write-Host "  SKIP  $($image.Name) → already exists" -ForegroundColor DarkGray
        $skipCount++
        continue
    }

    # Auto-orient into a temp PNG
    $tempFile = [System.IO.Path]::GetTempFileName() + ".png"

    & magick $image.FullName -auto-orient $tempFile 2>&1 | Out-Null

    if ($LASTEXITCODE -ne 0 -or -not (Test-Path $tempFile)) {
        Write-Host "  FAIL  $($image.Name) (auto-orient failed)" -ForegroundColor Red
        $failCount++
        continue
    }

    # Read dimensions from oriented temp file
    $dimensions = & magick identify -format "%w %h" $tempFile 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  FAIL  $($image.Name) (could not read dimensions)" -ForegroundColor Red
        Remove-Item $tempFile -Force -ErrorAction SilentlyContinue
        $failCount++
        continue
    }

    $parts  = $dimensions.Trim().Split(" ")
    $width  = [int]$parts[0]
    $height = [int]$parts[1]

    $targetSize = if ($height -gt $width) { $PortraitSize } else { $LandscapeSize }

    # Resize + centre-crop to exact target
    & magick $tempFile -resize "${targetSize}^" -gravity Center -extent $targetSize $tempFile 2>&1 | Out-Null

    if ($LASTEXITCODE -ne 0) {
        Write-Host "  FAIL  $($image.Name) (resize failed)" -ForegroundColor Red
        Remove-Item $tempFile -Force -ErrorAction SilentlyContinue
        $failCount++
        continue
    }

    # Encode to WebP
    & cwebp -q $ImageQuality -alpha_q $AlphaQuality -mt $tempFile -o $outputFile 2>&1 | Out-Null

    Remove-Item $tempFile -Force -ErrorAction SilentlyContinue

    if ($LASTEXITCODE -eq 0 -and (Test-Path $outputFile)) {
        $origSize   = $image.Length
        $webpSize   = (Get-Item $outputFile).Length
        $saving     = $origSize - $webpSize
        $savingPct  = if ($origSize -gt 0) { [math]::Round(($saving / $origSize) * 100, 1) } else { 0 }
        $savedBytes += $saving

        $sizeLabel = "{0,8} KB → {1,8} KB  ({2,5}%)" -f `
            [math]::Round($origSize / 1KB, 1), `
            [math]::Round($webpSize / 1KB, 1), `
            "$savingPct"

        $color = if ($savingPct -ge 0) { "Green" } else { "Yellow" }
        Write-Host "  OK    $($image.Name.PadRight(40)) $sizeLabel" -ForegroundColor $color

        if ($DeleteOriginals -and -not $sourceIsOutput) {
            Remove-Item $image.FullName -Force
        }

        $successCount++
    } else {
        Write-Host "  FAIL  $($image.Name)" -ForegroundColor Red
        $failCount++
    }
}

# ── Summary footer ────────────────────────────────────────────────────────────
$totalSavedMB = [math]::Round($savedBytes / 1MB, 2)

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  Done!" -ForegroundColor Green
Write-Host "  Converted  : $successCount"
Write-Host "  Skipped    : $skipCount"
Write-Host "  Failed     : $failCount"
Write-Host "  Space saved: $totalSavedMB MB"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
