function jsonToZigArray(jsonString) {
    // Parse the JSON string
    const jsonObj = JSON.parse(jsonJsonString);

    // Assuming the JSON structure is always one key with an array of numbers
    const key = Object.keys(jsonObj)[0];
    const array = jsonObj[key];

    // Generate the Zig array declaration
    let zigCode = `const ${key} = [_]u16{ ${array.join(', ')} };`;

    return zigCode;
}

// Example usage
const jsonString = '{"world_data": [0, 255, 0]}';
const zigCode = jsonToZigArray(jsonString);

console.log(zigCode);
// Output: const world_data = [_]i32{ 0, 255, 0 };
