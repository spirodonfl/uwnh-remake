Write-Host "Building WASM Game via Odin - PowerShell - Windows"

Write-Host "Literately Programming..."

D:\bun-windows-x64\bun-windows-x64\bun.exe D:\literate-programming\parser.js --file="D:\uwnh-remake\odin\wasm_game\game.md"

$ODIN_PATH = "D:\odin-windows-amd64-dev-2024-10\odin.exe"

Write-Host "Running Odin Build..."

& $ODIN_PATH build wasm_game `
    -target:freestanding_wasm32 `
    -define:USE_JS=true `
    -out:wasm_game.wasm `
    -no-entry-point

Copy-Item -Path "wasm_game.wasm" -Destination "..\web\odin2.game.wasm" -Force

Write-Host "Built the game"