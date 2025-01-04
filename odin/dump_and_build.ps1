Write-Host "Building the ROMs via Odin - PowerShell - Windows"

$ODIN_PATH = "D:\odin-windows-amd64-dev-2024-10\odin.exe"

# Run only the rom package
Remove-Item -Path "game\*.bin" -Force -ErrorAction SilentlyContinue
& $ODIN_PATH run rom

Remove-Item -Path "rom.exe" -Force -ErrorAction SilentlyContinue

Write-Host "Dumped the ROMs"

Write-Host "Building the game via Odin - PowerShell - Windows"

$ODIN_PATH = "D:\odin-windows-amd64-dev-2024-09\odin.exe"

& $ODIN_PATH build game `
    -target:freestanding_wasm32 `
    -define:USE_JS=true `
    -out:game.wasm `
    -no-entry-point

Copy-Item -Path "game.wasm" -Destination "..\web\odin.game.wasm" -Force

Write-Host "Built the game"