# Local Development Setup Script for AM Automation
# This script sets up the database and initializes the project for local development

Write-Host "Setting up local development environment..." -ForegroundColor Cyan

# Check if database exists, create if not
Write-Host "`nChecking database setup..." -ForegroundColor Yellow
$dbExists = psql -U postgres -lqt | Select-String -Pattern "am_inventory"

if (-not $dbExists) {
    Write-Host "Creating database and user..." -ForegroundColor Yellow
    # Create user (if not exists) and database
    psql -U postgres -c "CREATE USER inventory WITH PASSWORD 'inventory_password';" 2>$null
    psql -U postgres -c "CREATE DATABASE am_inventory OWNER inventory;" 2>$null
    psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE am_inventory TO inventory;" 2>$null
    Write-Host "Database created successfully!" -ForegroundColor Green
} else {
    Write-Host "Database already exists." -ForegroundColor Green
}

# Generate Prisma Client
Write-Host "`nGenerating Prisma Client..." -ForegroundColor Yellow
npm run db:generate
if ($LASTEXITCODE -eq 0) {
    Write-Host "Prisma Client generated successfully!" -ForegroundColor Green
} else {
    Write-Host "Error generating Prisma Client" -ForegroundColor Red
    exit 1
}

# Push database schema
Write-Host "`nPushing database schema..." -ForegroundColor Yellow
npm run db:push
if ($LASTEXITCODE -eq 0) {
    Write-Host "Database schema pushed successfully!" -ForegroundColor Green
} else {
    Write-Host "Error pushing database schema" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Local development setup complete!" -ForegroundColor Green
Write-Host "`nYou can now run: npm run dev" -ForegroundColor Cyan
Write-Host "The app will be available at: http://localhost:3000" -ForegroundColor Cyan

