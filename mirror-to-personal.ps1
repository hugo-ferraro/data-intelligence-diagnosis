# Data Intelligence Diagnosis - Repository Mirroring Script
# This script pushes changes to both organization and personal repositories

Write-Host "🔄 Starting repository mirroring process..." -ForegroundColor Cyan

# Function to write colored output
function Write-Status {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host "  $Message" -ForegroundColor $Color
}

# Push to organization repository (origin)
Write-Status "📤 Pushing to organization repository (origin)..." "Yellow"
try {
    git push origin main
    Write-Status "✅ Successfully pushed to organization repository" "Green"
} catch {
    Write-Status "❌ Failed to push to organization repository" "Red"
    Write-Status "Error: $($_.Exception.Message)" "Red"
    exit 1
}

# Push to personal repository (personal)
Write-Status "📤 Pushing to personal repository (personal)..." "Yellow"
try {
    git push personal main
    Write-Status "✅ Successfully pushed to personal repository" "Green"
} catch {
    Write-Status "❌ Failed to push to personal repository" "Red"
    Write-Status "Error: $($_.Exception.Message)" "Red"
    exit 1
}

Write-Host ""
Write-Host "🎉 Repository mirroring completed successfully!" -ForegroundColor Green
Write-Host "📋 Both repositories are now in sync:" -ForegroundColor Cyan
Write-Status "   • Organization: https://github.com/falqondev/data-intelligence-diagnosis" "Blue"
Write-Status "   • Personal: https://github.com/hugo-ferraro/data-intelligence-diagnosis" "Blue"
Write-Host ""
