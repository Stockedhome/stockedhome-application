pnpm exec prisma generate
$base_seed_sql = pnpm exec pnpm exec prisma migrate diff --from-empty --to-schema-datamodel src/db/schema.prisma --script
$seed_sql_addons = Get-Content -Path ./src/db/schema-additions.sql

$seed_sql = $base_seed_sql + "`n`n" + $seed_sql_addons

if (-not (Test-Path -Path './supabase_prod/volumes/db/init')) {
    New-Item -Path './supabase_prod/volumes/db/init' -ItemType Directory
}

Write-Output $seed_sql | Out-File -FilePath './supabase_prod/volumes/db/init/schema.sql' -Encoding utf8

Copy-Item -Path ./src/db/prod-stuff.sql -Destination ./supabase_prod/volumes/db/init/prod-stuff.sql -Force