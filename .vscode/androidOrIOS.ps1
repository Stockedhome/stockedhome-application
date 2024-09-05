param (
    [Parameter(Mandatory=$true)][string]$Command
)

$Platform = ""

Write-Host ""
Write-Host "What mobile OS are you building for? (A for Android, I for IOS, D for a plain dev server)" -ForegroundColor Cyan
Write-Host ""

while ($Platform -ne "android" -and $Platform -ne "ios" -and $Platform -ne "dev") {
    $key = [Console]::ReadKey($true)
    if ($key.KeyChar -eq "a") {
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

Invoke-Expression "${Command}:${Platform}"
