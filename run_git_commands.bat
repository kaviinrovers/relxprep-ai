@echo off
cd C:\Users\ELCOT\RELXPREP

echo ========== Running: git add . ==========
git add .
echo Status: %ERRORLEVEL%
echo.

echo ========== Running: git commit ==========
git commit -m "fix: add z-index layering to login page for proper visibility

- Add z-10 to main container to appear above animated background
- Add z-20 to form content for proper stacking order
- Fixes blank login page display issue

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
echo Status: %ERRORLEVEL%
echo.

echo ========== Running: git push -u origin main ==========
git push -u origin main
echo Status: %ERRORLEVEL%
