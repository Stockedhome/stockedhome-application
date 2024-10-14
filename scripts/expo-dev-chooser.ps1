$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot/..

$Platform = ""
$doClean = $false

Write-Host ""
Write-Host "What mobile OS are you building for? (A for Android, I for IOS, D for a plain dev server)" -ForegroundColor Cyan
Write-Host "If you would like to clear the Expo cache, press C before selecting your platform" -ForegroundColor Cyan
Write-Host ""


while ($Platform -ne "android" -and $Platform -ne "ios" -and $Platform -ne "dev") {
    $key = [Console]::ReadKey($true)
    if ($key.KeyChar -eq "c") {
        if ($doClean -eq $false) {
            Write-Host "Will clear Expo cache. Now select a platform..." -ForegroundColor Yellow
            $doClean = $true
        }
    } elseif ($key.KeyChar -eq "a") {
        $Platform = "android"
    } elseif ($key.KeyChar -eq "i") {
        $Platform = "ios"
    } elseif ($key.KeyChar -eq "d") {
        $Platform = "dev"
    }
}

if ($Platform -eq "dev") {
    Write-Host "Starting dev server" -ForegroundColor Cyan
} else {
    Write-Host "Building for $Platform and then starting dev server" -ForegroundColor Cyan
}

if ($doClean -eq $true) {
    Invoke-Expression "pnpm run dev:expo:${Platform} --clear"
} else {
    Invoke-Expression "pnpm run dev:expo:${Platform}"
}
