$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot/..

# get the current version
$version = (Get-Content -Path "./package.json" | ConvertFrom-Json).version

# export the docker containers to a file
docker save stockedhome/web-server:no-static-$version stockedhome/web-server:no-static-latest stockedhome/web-server:no-static stockedhome/web-server:with-static-$version stockedhome/web-server:with-static-latest stockedhome/web-server:with-static stockedhome/web-server:latest -o ./dist/web-server-images.tar
