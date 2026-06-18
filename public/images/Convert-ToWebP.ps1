# Convert-ToWebP.ps1
# Converts all images in a directory to WebP format using cwebp
# Image quality: 70 | Alpha quality: 70
#
# Requirements: cwebp must be installed
#   Download: https://developers.google.com/speed/webp/download
#   Or via Chocolatey: choco install webp
#   Or via Scoop: scoop install libwebp
#
# Usage:
#   .\Convert-ToWebP.ps1                          # Converts images in the current directory
#   .\Convert-ToWebP.ps1 -InputDir "C:\images"   # Converts images in a specific directory
#   .\Convert-ToWebP.ps1 -InputDir "C:\images" -OutputDir "C:\images\webp"  # Custom output folder
#   .\Convert-ToWebP.ps1 -Recurse                 # Include subdirectories
#   .\Convert-ToWebP.ps1 -DeleteOriginals         # Remove originals after conversion

param (
    [string]$InputDir     = (Get-Location).Path,
    [string]$OutputDir    = "",        # Leave empty to save WebP alongside originals
    [switch]$Recurse      = $false,    # Process subdirectories recursively
    [switch]$DeleteOriginals = $false, # Delete source files after successful conversion
    [int]$ImageQuality    = 70,
    [int]$AlphaQuality    = 70
)

# ── Validate cwebp is available ───────────────────────────────────────────────
if (-not (Get-Command cwebp -ErrorAction SilentlyContinue)) {
    Write-Host ""
    Write-Host "  ERROR: cwebp not found in PATH." -ForegroundColor Red
    Write-Host ""
    Write-Host "  Install it via one of:" -ForegroundColor Yellow
    Write-Host "    Chocolatey : choco install webp" -ForegroundColor Cyan
    Write-Host "    Scoop      : scoop install libwebp" -ForegroundColor Cyan
    Write-Host "    Manual     : https://developers.google.com/speed/webp/download" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

# ── Validate input directory ──────────────────────────────────────────────────
if (-not (Test-Path $InputDir -PathType Container)) {
    Write-Host "ERROR: Input directory not found: $InputDir" -ForegroundColor Red
    exit 1
}

# ── Supported source formats ──────────────────────────────────────────────────
$supportedExtensions = @("*.jpg", "*.jpeg", "*.png", "*.gif", "*.bmp", "*.tiff", "*.tif")

# ── Gather files ──────────────────────────────────────────────────────────────
$getChildParams = @{
    Path    = $InputDir
    File    = $true
    Recurse = $Recurse
}
$images = Get-ChildItem @getChildParams | Where-Object {
    $_.Extension -in @(".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".tif")
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
        # Mirror subdirectory structure when recursing
        $relativePath = $image.DirectoryName.Substring($InputDir.Length).TrimStart('\','/')
        $targetDir    = if ($relativePath) { Join-Path $OutputDir $relativePath } else { $OutputDir }
    } else {
        $targetDir = $image.DirectoryName
    }

    # Create output directory if needed
    if (-not (Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }

    $outputFile = Join-Path $targetDir ($image.BaseName + ".webp")

    # Skip if WebP already exists
    if (Test-Path $outputFile) {
        Write-Host "  SKIP  $($image.Name) → already exists" -ForegroundColor DarkGray
        $skipCount++
        continue
    }

    # Auto-orient first, THEN detect dimensions and resize
    $tempFile = [System.IO.Path]::GetTempFileName() + ".png"

    $magickResult = & magick $image.FullName -auto-orient $tempFile 2>&1

    if ($LASTEXITCODE -ne 0 -or -not (Test-Path $tempFile)) {
        Write-Host "  FAIL  $($image.Name) (auto-orient failed)" -ForegroundColor Red
        $failCount++
        continue
    }

    # Read dimensions from the already-rotated temp file
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

    # Determine target size based on corrected orientation
    if ($height -gt $width) {
        $targetSize = "800x1067"
    } else {
        $targetSize = "1920x1080"
    }

    # Resize + centre-crop to exact target
    $magickResult = & magick $tempFile `
        -resize "${targetSize}^" `
        -gravity Center `
        -extent $targetSize `
        $tempFile 2>&1

    if ($LASTEXITCODE -ne 0) {
        Write-Host "  FAIL  $($image.Name) (resize failed)" -ForegroundColor Red
        Remove-Item $tempFile -Force -ErrorAction SilentlyContinue
        $failCount++
        continue
    }

    $cwebpArgs = @(
        "-q",      $ImageQuality,
        "-alpha_q",$AlphaQuality,
        "-mt",
        $tempFile,
        "-o", $outputFile
    )

    $result = & cwebp @cwebpArgs 2>&1

    Remove-Item $tempFile -Force -ErrorAction SilentlyContinue

    if ($LASTEXITCODE -eq 0 -and (Test-Path $outputFile)) {
        $origSize   = $image.Length
        $webpSize   = (Get-Item $outputFile).Length
        $saving     = $origSize - $webpSize
        $savingPct  = if ($origSize -gt 0) { [math]::Round(($saving / $origSize) * 100, 1) } else { 0 }
        $savedBytes += $saving

        $sizeLabel  = "{0,8} KB → {1,8} KB  ({2,5}%)" -f `
            [math]::Round($origSize / 1KB, 1), `
            [math]::Round($webpSize / 1KB, 1), `
            "$savingPct"

        $color = if ($savingPct -ge 0) { "Green" } else { "Yellow" }
        Write-Host "  OK    $($image.Name.PadRight(40)) $sizeLabel" -ForegroundColor $color

        if ($DeleteOriginals) {
            Remove-Item $image.FullName -Force
        }

        $successCount++
    } else {
        Write-Host "  FAIL  $($image.Name)" -ForegroundColor Red
        Write-Host "        $result" -ForegroundColor DarkRed
        $failCount++
    }
}

# ── Summary footer ────────────────────────────────────────────────────────────
$totalSavedMB = [math]::Round($savedBytes / 1MB, 2)

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  Done!" -ForegroundColor Green
Write-Host "  Converted : $successCount"
Write-Host "  Skipped   : $skipCount"
Write-Host "  Failed    : $failCount"
Write-Host "  Space saved: $totalSavedMB MB"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""