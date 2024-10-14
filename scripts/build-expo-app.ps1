Param (
    [Parameter(Mandatory=$true)][String] $platform,
    [Parameter(Mandatory=$true)][String] $easProfile,
    [Parameter(Mandatory=$false)][String] $buildMessage,
    [Parameter(Mandatory=$false)][switch] $androidAlwaysBuildAPK
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot/..

$extensionNoDot = ""
if ($platform -eq "ios") {
    $extensionNoDot = "ipa"
} elseif ($platform -eq "android") {
    $buildType = node -e "console.log(require('./src/platforms/expo/eas.json').build.$easProfile.android.buildType)"
    if ($buildType -eq "app-bundle") {
        $extensionNoDot = "aab"
    } elseif ($buildType -eq "apk") {
        $extensionNoDot = "apk"
    } else {
        Write-Host "Invalid build type: $buildType"
        exit 1
    }
} else {
    Write-Host "Invalid platform: $platform"
    exit 1
}

if ($env:GITHUB_ENV) {
    Write-Host "Setting EXPO_APP_PATH and EXPO_APP_PATH_APK in GitHub Actions ENV"
    Write-Output "EXPO_APP_PATH=dist/expo-app-$platform.$extensionNoDot" | Out-File -FilePath $env:GITHUB_ENV -Encoding utf8 -Append
    Write-Output "EXPO_APP_PATH_APK=dist/expo-app-$platform.apk" | Out-File -FilePath $env:GITHUB_ENV -Encoding utf8 -Append

    if ($env:EXPO_TOKEN -eq "") {
        Write-Host "EXPO_TOKEN not set in GitHub Actions ENV" -ForegroundColor Red
        Write-Host "# EXPO_TOKEN Not Present" >> $env:GITHUB_STEP_SUMMARY
        Write-Host "Please set the EXPO_TOKEN secret in your GitHub repository settings and make sure it is properly passd to the job" >> $env:GITHUB_STEP_SUMMARY
    }
}

$buildCommand =       "pnpm run build:expo:NEEDS-PLATFORM --platform=$platform --profile=$easProfile --output=""../../../dist/expo-app-$platform.$extensionNoDot"""
$buildCommandForAPK = "pnpm run build:expo:NEEDS-PLATFORM --platform=$platform --profile=$easProfile-apk --output=""../../../dist/expo-app-$platform.apk"""
if ($buildMessage -ne "") {
    $buildCommand = $buildCommand + " --message=""$buildMessage"""
    $buildCommandForAPK = $buildCommandForAPK + " --message=""$buildMessage"""
}

Write-Host "Running command: $buildCommand"
Invoke-Expression $buildCommand

if ($androidAlwaysBuildAPK -and ($extensionNoDot -eq "aab")) {
    Write-Host "Because we also want an APK for production builds, building APK..." -ForegroundColor Green
    Write-Host "Running command: $buildCommandForAPK"
    Invoke-Expression $buildCommandForAPK
}
