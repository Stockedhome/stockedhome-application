$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot/..

rm ./node_modules/lib
rm ./node_modules/interface
pnpm install --frozen-lockfile --ignore-scripts

pnpm exec next build src/platforms/next
if ($?) {
    Write-Host "Next.js build successful" -ForegroundColor Green
} else {
    Write-Host "Next.js build failed" -ForegroundColor Red
    exit 1
}

# Make sure the directory /dist/web-server exists
if (!(Test-Path -Path "./dist/web-server")) {
    New-Item -ItemType Directory -Path "./dist/web-server"
}

Remove-Item -Path "./dist/web-server/*" -Recurse -Force

# Copy the supabase_prod files
Copy-Item -Path "./supabase_prod/*" -Destination "./dist/web-server" -Recurse -Force
Copy-Item -Path "./src/db/prod-stuff.sql" -Destination "./dist/web-server/supabase_volumes/db/init/prod-stuff.sql" -Force

# Copy the config files
New-Item -ItemType Directory -Path "./dist/web-server/config"
Copy-Item -Path "./config/*" -Destination "./dist/web-server/config/" -Recurse -Force

# get the current version
$version = (Get-Content -Path "./package.json" | ConvertFrom-Json).version

# Build the docker containers for the web server
docker build --target no-static -t stockedhome/web-server:no-static-$version -t stockedhome/web-server:no-static-latest -t stockedhome/web-server:no-static .
if ($?) {
    Write-Host "First Docker build (no-static) successful" -ForegroundColor Green
} else {
    Write-Host "First Docker build (no-static) failed" -ForegroundColor Red
    exit 1
}

docker build --target with-static -t stockedhome/web-server:with-static-$version -t stockedhome/web-server:with-static-latest -t stockedhome/web-server:with-static -t stockedhome/web-server:latest .
if ($?) {
    Write-Host "Second Docker build (with-static) successful" -ForegroundColor Green
} else {
    Write-Host "Second Docker build (with-static) failed" -ForegroundColor Red
    exit 1
}
