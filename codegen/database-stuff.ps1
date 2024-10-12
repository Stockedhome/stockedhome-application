$ErrorActionPreference = "Stop"

pnpm exec prisma generate
if (-not $?) {
    exit 1
}

$base_seed_sql = pnpm exec pnpm exec prisma migrate diff --from-empty --to-schema-datamodel src/db/schema.prisma --script
$seed_sql_addons = Get-Content -Path ./src/db/schema-additions.sql

$seed_sql = $base_seed_sql + "`n`n" + $seed_sql_addons

if (-not (Test-Path -Path './supabase_prod/volumes/db/init')) {
    New-Item -Path './supabase_prod/volumes/db/init' -ItemType Directory
}

Write-Output $seed_sql | Out-File -FilePath './supabase_prod/supabase_volumes/db/init/schema.sql' -Encoding utf8

Copy-Item -Path ./src/db/prod-stuff.sql -Destination ./supabase_prod/supabase_volumes/db/init/prod-stuff.sql -Force

pnpm exec supabase start --ignore-health-check
pnpm exec prisma db push
if (Test-Path -Path 'database.types.ts') {
    Remove-Item -Path 'database.types.ts' -Force
}
pnpm exec supabase gen types --lang=typescript --local > database.types.ts
