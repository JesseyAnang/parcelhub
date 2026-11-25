# Destroys every ParcelHub CDK stack, then lists any AWS resources still tagged project=parcelhub.
# Usage (from the repo root):  ./scripts/teardown.ps1 -Profile parcelhub-dev
param(
    [string]$Profile = 'parcelhub-dev',
    [string]$Region = 'eu-west-2'
)

$ErrorActionPreference = 'Stop'
$env:AWS_PROFILE = $Profile

Write-Host "Destroying all ParcelHub stacks in $Region (profile $Profile)..."
Push-Location (Join-Path $PSScriptRoot '..\infra')
try {
    npx cdk destroy --all --force
} finally {
    Pop-Location
}

Write-Host "`nResources still tagged project=parcelhub (should be empty):"
aws resourcegroupstaggingapi get-resources `
    --region $Region `
    --tag-filters Key=project,Values=parcelhub `
    --query 'ResourceTagMappingList[].ResourceARN' `
    --output table

Write-Host "`nThe CDKToolkit bootstrap stack is kept on purpose. Delete it in CloudFormation if you are finished with the project."
