$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot/..

# This script handles starting the local Supabase dev instance,
# even if another Supabase instance is already running.
#
# Simply running `pnpm exec supabase start` will fail if another
# Supabase instance is already running. This script will detect
# that failure and run the `supabase stop --project-id ...` command
# that the `supabase start` command suggests, then retry starting
# the Supabase instance.

$SupabaseSTDERR = pnpm exec supabase start --ignore-health-check 2>&1

$SuggestedStopCommand = [regex]::match($SupabaseSTDERR, "Try stopping the running project with (supabase stop --project-id [a-zA-Z0-9]+)\s+").Groups[1].Value
if ($SuggestedStopCommand) {
    Write-Host "Suggested command: $SuggestedStopCommand"

    Invoke-Expression $SuggestedStopCommand
    pnpm exec supabase start --ignore-health-check
}
