# 🔐 Generate Secure JWT Secret for SupportGenie AI
# Run this script to generate a secure JWT secret

Write-Host "🔐 Generating Secure JWT Secret..." -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Generate a secure random string
$secret = -join ((33..126) | Get-Random -Count 64 | ForEach-Object {[char]$_})

Write-Host "✅ Your secure JWT secret:" -ForegroundColor Yellow
Write-Host ""
Write-Host $secret -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Copy this secret and paste it in:" -ForegroundColor White
Write-Host "   backend\.env" -ForegroundColor Yellow
Write-Host "   JWT_SECRET=$secret" -ForegroundColor Cyan
Write-Host ""

# Also generate a base64 version (alternative)
$base64Secret = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($secret))
Write-Host "🔐 Alternative Base64 JWT secret:" -ForegroundColor Yellow
Write-Host $base64Secret -ForegroundColor Cyan
Write-Host ""

Write-Host "⚠️  IMPORTANT:" -ForegroundColor Red
Write-Host "   - Keep this secret secure" -ForegroundColor White
Write-Host "   - Never commit it to git" -ForegroundColor White
Write-Host "   - Use the same secret in production" -ForegroundColor White
Write-Host ""

Write-Host "🎯 Next step: Update your environment files with this secret!" -ForegroundColor Green
