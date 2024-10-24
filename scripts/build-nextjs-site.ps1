$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot/..

pnpm exec next build src/platforms/next
if ($?) {
    Write-Host "Next.js build successful" -ForegroundColor Green
} else {
    Write-Host "Next.js build failed" -ForegroundColor Red
    exit 1
}

# Create ./dist/web-server-docker-compose
if (Test-Path -Path "./dist/web-server-docker-compose") {
    Remove-Item -Path "./dist/web-server-docker-compose" -Recurse -Force
}
New-Item -ItemType Directory -Path "./dist/web-server-docker-compose"


# Copy the docker-compose-setup files
Copy-Item -Path "./docker-compose-setup/*" -Destination "./dist/web-server-docker-compose" -Recurse -Force
Copy-Item -Path "./src/db/prod-stuff.sql" -Destination "./dist/web-server-docker-compose/supabase_volumes/db/init/prod-stuff.sql" -Force

# Copy the config files
New-Item -ItemType Directory -Path "./dist/web-server-docker-compose/config"
Copy-Item -Path "./config/*" -Destination "./dist/web-server-docker-compose/config/" -Recurse -Force

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

# Create ./dist/web-server-static
if (Test-Path -Path "./dist/web-server-static") {
    Remove-Item -Path "./dist/web-server-static" -Recurse -Force
}
New-Item -ItemType Directory -Path "./dist/web-server-static"

# Put static files into a directory, ready to be served by a CDN

# For some reason, the Coopy-Item throws an error the first time I run it but works the second time.
# Don't quite know why that is. If anyone can explain "Copy-Item: Container cannot be copied onto existing leaf item.", hit me up
try {
    Copy-Item -Path "./src/platforms/next/.next/static/*" -Destination "./dist/web-server-static/_next/static" -Recurse -Force
} catch {
    Copy-Item -Path "./src/platforms/next/.next/static/*" -Destination "./dist/web-server-static/_next/static" -Recurse -Force
}
Copy-Item -Path "./src/platforms/next/public/*" -Destination "./dist/web-server-static" -Recurse -Force
