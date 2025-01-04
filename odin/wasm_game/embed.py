import base64
import shutil

# Copy the HTML file
shutil.copy('wasm_game.html', 'wasm_game_embedded.html')

# Read the WASM file and convert to base64
with open('wasm_game.wasm', 'rb') as wasm_file:
    wasm_base64 = base64.b64encode(wasm_file.read()).decode('utf-8')

# Read the HTML file
with open('wasm_game_embedded.html', 'r') as file:
    html_content = file.read()

# Replace the placeholder
html_content = html_content.replace('<!-- WASM_FILE_HERE -->', wasm_base64)

# Write the modified content back
with open('wasm_game_embedded.html', 'w') as file:
    file.write(html_content)