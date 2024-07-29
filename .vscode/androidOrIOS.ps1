param (
    [Parameter(Mandatory=$true)][string]$Command
)

$Platform = ""

while ($Platform -ne "android" -and $Platform -ne "ios") {
    if ($Platform -ne "") {
        Write-Host "Invalid input. Please try again." -ForegroundColor Yellow
    }
    $Platform = Read-Host "What mobile OS are you building for? (android/ios or a/i)"
    if ($Platform -eq "a") {
        $Platform = "android"
    } elseif ($Platform -eq "i") {
        $Platform = "ios"
    }
}

Invoke-Expression "${Command}:${Platform}"
