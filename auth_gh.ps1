$gh = "C:\Program Files\GitHub CLI\gh.exe"

Write-Host "Attempting to login with GitHub..."
Write-Host ""

# Try to login using device flow (no browser needed but requires user interaction)
& $gh auth login --web-auth-flow
