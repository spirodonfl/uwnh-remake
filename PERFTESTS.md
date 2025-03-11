#  Performance Tests

Here is a perf test I ran that confirms global functions beat object methods every time. Even with the idea of a global cached string that you set as a property of an object... it's still way faster. Holy crap.

```
// Setup ES5 object with getters and setters
var buffer = new Float32Array(2);
buffer[0] = 10; // Initial value for x
buffer[1] = 20; // Initial value for y

var cachedString = `STRING_STUFF_HERE is now an html string <div>${buffer[1]}</div>`; // Initialize
var obj = {};
Object.defineProperty(obj, "x", {
    get: function() { return buffer[0]; },
    set: function(value) { buffer[0] = value; }
});
Object.defineProperty(obj, "y", {
    get: function() { return buffer[1]; },
    set: function(value) {
        buffer[1] = value;
        cachedString = `STRING_STUFF_HERE is now an html string <div>${value}</div>`;
    }
});
Object.defineProperty(obj, "someString", {
    get: function() { return cachedString; }
});

// Define global function with more operations, including string
function globalCompute(o) {
    var sum = o.x + o.y;
    var product = o.x * o.y;
    var diff = o.y - o.x;
    return sum + product + diff + o.someString.length; // Use string length
}

// Define object method with more operations, including string
obj.methodCompute = function() {
    var sum = this.x + this.y;
    var product = this.x * this.y;
    var diff = this.y - this.x;
    return sum + product + diff + this.someString.length; // Use string length
};

// Iteration counts
var warmupIterations = 10000; // Warm-up phase
var testIterations = 1000000; // Main test phase

// Warm-up phase for global function
for (var i = 0; i < warmupIterations; i++) {
    globalCompute(obj);
}

// Warm-up phase for object method
for (var i = 0; i < warmupIterations; i++) {
    obj.methodCompute();
}

// Test global function
var startGlobal = performance.now();
for (var i = 0; i < testIterations; i++) {
    globalCompute(obj);
}
var endGlobal = performance.now();
console.log("Global Function:", (endGlobal - startGlobal).toFixed(2), "ms");

// Test object method
var startMethod = performance.now();
for (var i = 0; i < testIterations; i++) {
    obj.methodCompute();
}
var endMethod = performance.now();
console.log("Object Method:", (endMethod - startMethod).toFixed(2), "ms");

// Verify results
var globalResult = globalCompute(obj);
var methodResult = obj.methodCompute();
console.log("Global Function Result:", globalResult); // Should be 267 (10+20 + 10*20 + 20-10 + 37)
console.log("Object Method Result:", methodResult); // Should be 267
console.log("String Value:", obj.someString); // Verify string
```

Also, the difference between get/set and just direct assignment

```
var iterations = 1000000;
var UI_DOCKYARD_DATA = new Uint32Array(7);
UI_DOCKYARD_DATA[0] = 0;
UI_DOCKYARD_DATA[1] = 0;
UI_DOCKYARD_DATA[2] = 0;

function warmup(obj, times) {
    for (var i = 0; i < times; i++) {
        obj.initialized; obj.rendered; obj.focused_element;
        obj.initialized = true; obj.rendered = false; obj.focused_element = i % 10;
    }
}

// Getters/Setters
console.time("Setup: Getters/Setters");
var UI_DOCKYARD_GETSET = {};
Object.defineProperty(UI_DOCKYARD_GETSET, "initialized", {
    get: function() { return !!UI_DOCKYARD_DATA[0]; },
    set: function(value) { UI_DOCKYARD_DATA[0] = value ? 1 : 0; }
});
Object.defineProperty(UI_DOCKYARD_GETSET, "rendered", {
    get: function() { return !!UI_DOCKYARD_DATA[1]; },
    set: function(value) { UI_DOCKYARD_DATA[1] = value ? 1 : 0; }
});
Object.defineProperty(UI_DOCKYARD_GETSET, "focused_element", {
    get: function() { return UI_DOCKYARD_DATA[2]; },
    set: function(value) { UI_DOCKYARD_DATA[2] = value; }
});
console.timeEnd("Setup: Getters/Setters");

warmup(UI_DOCKYARD_GETSET, 10000);

console.time("Get: Getters/Setters");
for (var i = 0; i < iterations; i++) {
    UI_DOCKYARD_GETSET.initialized; UI_DOCKYARD_GETSET.rendered; UI_DOCKYARD_GETSET.focused_element;
}
console.timeEnd("Get: Getters/Setters");

console.time("Set: Getters/Setters");
for (var i = 0; i < iterations; i++) {
    UI_DOCKYARD_GETSET.initialized = i % 2 === 0;
    UI_DOCKYARD_GETSET.rendered = i % 2 === 1;
    UI_DOCKYARD_GETSET.focused_element = i % 10;
}
console.timeEnd("Set: Getters/Setters");

// Direct Assignment with Sync
console.time("Setup: Direct Assignment");
var UI_DOCKYARD_DIRECT = {};
UI_DOCKYARD_DIRECT.initialized = !!UI_DOCKYARD_DATA[0];
UI_DOCKYARD_DIRECT.rendered = !!UI_DOCKYARD_DATA[1];
UI_DOCKYARD_DIRECT.focused_element = UI_DOCKYARD_DATA[2];
console.timeEnd("Setup: Direct Assignment");

warmup(UI_DOCKYARD_DIRECT, 10000);

console.time("Get: Direct Assignment");
for (var i = 0; i < iterations; i++) {
    UI_DOCKYARD_DIRECT.initialized; UI_DOCKYARD_DIRECT.rendered; UI_DOCKYARD_DIRECT.focused_element;
}
console.timeEnd("Get: Direct Assignment");

console.time("Set: Direct Assignment with Sync");
for (var i = 0; i < iterations; i++) {
    UI_DOCKYARD_DIRECT.initialized = i % 2 === 0; UI_DOCKYARD_DATA[0] = UI_DOCKYARD_DIRECT.initialized ? 1 : 0;
    UI_DOCKYARD_DIRECT.rendered = i % 2 === 1; UI_DOCKYARD_DATA[1] = UI_DOCKYARD_DIRECT.rendered ? 1 : 0;
    UI_DOCKYARD_DIRECT.focused_element = i % 10; UI_DOCKYARD_DATA[2] = UI_DOCKYARD_DIRECT.focused_element;
}
console.timeEnd("Set: Direct Assignment with Sync");

console.log("Getters/Setters:", UI_DOCKYARD_GETSET.initialized, UI_DOCKYARD_GETSET.rendered, UI_DOCKYARD_GETSET.focused_element);
console.log("Direct:", UI_DOCKYARD_DIRECT.initialized, UI_DOCKYARD_DIRECT.rendered, UI_DOCKYARD_DIRECT.focused_element);
```

Another test for global functions with passing global variables vs referencing them directly inside of global functions

```
var iterations = 100000000;
var UI_CURRENT_SCREEN = new Uint32Array(10);
var SCREEN_NAMES = ["ui_dockyard_screen_home", "other_screen"]; // Example

function warmupFirst() {
    for (var i = 0; i < 100000; i++) {
        ui_dockyard_screen_home_setup();
    }
}

function warmupSecond() {
    for (var i = 0; i < 100000; i++) {
        ui_dockyard_screen_home_setup_second(UI_CURRENT_SCREEN);
    }
}

function warmupThird() {
    for (var i = 0; i < 100000; i++) {
        ui_dockyard_screen_home_setup_third();
    }
}

function ui_dockyard_screen_home_setup() {
    UI_CURRENT_SCREEN[0] = 0;
    UI_CURRENT_SCREEN[1] = SCREEN_NAMES.indexOf("ui_dockyard_screen_home");
}

function ui_dockyard_screen_home_setup_second(data) {
    data[0] = 0;
    data[1] = SCREEN_NAMES.indexOf("ui_dockyard_screen_home");
}

function ui_dockyard_screen_home_setup_third() {
    var data = UI_CURRENT_SCREEN;
    data[0] = 0;
    data[1] = SCREEN_NAMES.indexOf("ui_dockyard_screen_home");
}

// Warm-up for first version
console.time("Warmup First");
warmupFirst();
console.timeEnd("Warmup First");

// Test first version
console.time("First Version");
for (var i = 0; i < iterations; i++) {
    ui_dockyard_screen_home_setup();
}
console.timeEnd("First Version");

// Warm-up for second version
console.time("Warmup Second");
warmupSecond();
console.timeEnd("Warmup Second");

// Test second version
console.time("Second Version");
for (var i = 0; i < iterations; i++) {
    ui_dockyard_screen_home_setup_second(UI_CURRENT_SCREEN);
}
console.timeEnd("Second Version");

// Warm-up for third version
console.time("Warmup Third");
warmupThird();
console.timeEnd("Warmup Third");

// Test third version
console.time("Third Version");
for (var i = 0; i < iterations; i++) {
    ui_dockyard_screen_home_setup_third();
}
console.timeEnd("Third Version");

// Verify
console.log("First Version Result:", UI_CURRENT_SCREEN[0], UI_CURRENT_SCREEN[1]);
console.log("Second Version Result:", UI_CURRENT_SCREEN[0], UI_CURRENT_SCREEN[1]);
console.log("Third Version Result:", UI_CURRENT_SCREEN[0], UI_CURRENT_SCREEN[1]);
```

More perf tests to determine when accessing a global has a cost vs caching a global in a function. However, when the iterations are increased, that cost is either 1 - 2 ms or it's usually faster, especially with raw numbers and arrays.

```
// Setup globals
var GLOBAL_NUMBER = 42;
var GLOBAL_ARRAY = new Uint32Array([1, 2, 3]);
var GLOBAL_OBJECT = { x: 1, y: 2 };

// Global object container
var GLOBALS = {
    number: 42,
    array: new Uint32Array([1, 2, 3]),
    object: { x: 1, y: 2 }
};

// Utility to run a test and measure time
function runTest(name, fn, iterations) {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
        fn();
    }
    const end = performance.now();
    console.log(`${name}: ${(end - start).toFixed(2)} ms`);
}

// Test functions
function testDirectGlobalNumber() {
    var x = GLOBAL_NUMBER; // Read
    GLOBAL_NUMBER = x + 1; // Write
}

function testDirectGlobalArray() {
    var x = GLOBAL_ARRAY[0]; // Read
    GLOBAL_ARRAY[0] = x + 1; // Write
}

function testDirectGlobalObject() {
    var x = GLOBAL_OBJECT.x; // Read
    GLOBAL_OBJECT.x = x + 1; // Write
}

function testGlobalObjectNumber() {
    var x = GLOBALS.number; // Read
    GLOBALS.number = x + 1; // Write
}

function testGlobalObjectArray() {
    var x = GLOBALS.array[0]; // Read
    GLOBALS.array[0] = x + 1; // Write
}

function testGlobalObjectObject() {
    var x = GLOBALS.object.x; // Read
    GLOBALS.object.x = x + 1; // Write
}

function testCachedGlobalNumber() {
    var local = GLOBAL_NUMBER; // Cache
    local = local + 1;        // Modify
    GLOBAL_NUMBER = local;     // Reassign
}

function testCachedGlobalArray() {
    var local = GLOBAL_ARRAY;  // Cache (reference)
    local[0] = local[0] + 1;  // Modify (affects global)
    // No reassignment needed since array is mutated
}

function testCachedGlobalObject() {
    var local = GLOBAL_OBJECT; // Cache (reference)
    local.x = local.x + 1;    // Modify (affects global)
    // No reassignment needed since object is mutated
}

// Run tests
const ITERATIONS = 100000000;

console.log(`Running ${ITERATIONS.toLocaleString()} iterations per test...\n`);

// Direct global lookups
runTest("Direct Global - Number", testDirectGlobalNumber, ITERATIONS);
runTest("Direct Global - Array", testDirectGlobalArray, ITERATIONS);
runTest("Direct Global - Object", testDirectGlobalObject, ITERATIONS);

// Lookups within global object
runTest("Global Object - Number", testGlobalObjectNumber, ITERATIONS);
runTest("Global Object - Array", testGlobalObjectArray, ITERATIONS);
runTest("Global Object - Object", testGlobalObjectObject, ITERATIONS);

// Cached local variables
runTest("Cached Local - Number", testCachedGlobalNumber, ITERATIONS);
runTest("Cached Local - Array", testCachedGlobalArray, ITERATIONS);
runTest("Cached Local - Object", testCachedGlobalObject, ITERATIONS);

// Reset globals to check results
console.log("\nFinal Values:");
console.log("GLOBAL_NUMBER:", GLOBAL_NUMBER);
console.log("GLOBAL_ARRAY:", GLOBAL_ARRAY);
console.log("GLOBAL_OBJECT:", GLOBAL_OBJECT);
console.log("GLOBALS.number:", GLOBALS.number);
console.log("GLOBALS.array:", GLOBALS.array);
console.log("GLOBALS.object:", GLOBALS.object);
```

Ultimately, for setup functions that are not called often

```
function ui_dockyard_setup() {
    ui_data_setup(UI_DATA);
    UI_CURRENT_COMPONENT = document.querySelector("ui-dockyard") || document.createElement("div");
    ui_dockyard_screen_home_setup(UI_CURRENT_SCREEN_DATA, SCREEN_NAMES, UI_CURRENT_SCREEN_ELEMENTS, UI_LAYOUT_ROWS);
    ui_dockyard_screen_home_render(UI_CURRENT_COMPONENT);
    INPUT_SERVER.clearHistory();
}
```

... global calls are good.

For hot path functions, you might want to use local caching

```
function ui_dockyard_listen() {
    var layoutRows = UI_LAYOUT_ROWS;
    var component = UI_CURRENT_COMPONENT;
    // Frequent operations using layoutRows and component

    // Must re-assign back to global in the end to ensure global is updated
    UI_CURRENT_COMPONENT = component;
}
```

You can also take this one step further and return re-assigned values but this is just abstracted to the same thing at a bigger scale.

```
function ui_dockyard_setup(ui_data, ui_layout_rows) {
    ui_data_setup(ui_data);
    var component = document.querySelector("ui-dockyard") || document.createElement("div");
    ui_dockyard_screen_home_setup(UI_CURRENT_SCREEN_DATA, SCREEN_NAMES, UI_CURRENT_SCREEN_ELEMENTS, ui_layout_rows);
    ui_dockyard_screen_home_render(component);
    INPUT_SERVER.clearHistory();
    return component;
}

function doit() {
    UI_CURRENT_COMPONENT = ui_dockyard_setup(UI_DATA, UI_LAYOUT_ROWS);
}
```

Really weird findings on performance between cached & non-cached local variables

```
function ui_data_setup()
{
    UI_DATA.buffer[StructUIData.INITIALIZED] = 0;
    UI_DATA.buffer[StructUIData.RENDERED] = 0;
    UI_DATA.buffer[StructUIData.FOCUSED_ELEMENT] = MAX_U32;
    UI_DATA.buffer[StructUIData.FOCUSED_ELEMENT_X] = MAX_U32;
    UI_DATA.buffer[StructUIData.FOCUSED_ELEMENT_Y] = MAX_U32;
    UI_DATA.buffer[StructUIData.DEFAULT_FOCUSED_ELEMENT] = MAX_U32;
    UI_DATA.buffer[StructUIData.LAST_INPUT_MODE] = MAX_U32;
}
function ui_data_setup_cached()
{
    var ui_data = UI_DATA;
    var struct_ui_data = StructUIData;
    ui_data.buffer[struct_ui_data.INITIALIZED] = 0;
    ui_data.buffer[struct_ui_data.RENDERED] = 0;
    ui_data.buffer[struct_ui_data.FOCUSED_ELEMENT] = MAX_U32;
    ui_data.buffer[struct_ui_data.FOCUSED_ELEMENT_X] = MAX_U32;
    ui_data.buffer[struct_ui_data.FOCUSED_ELEMENT_Y] = MAX_U32;
    ui_data.buffer[struct_ui_data.DEFAULT_FOCUSED_ELEMENT] = MAX_U32;
    ui_data.buffer[struct_ui_data.LAST_INPUT_MODE] = MAX_U32;
}
var iterations = 1000000000;
console.time("Non Cached");
for (var i = 0; i < iterations; i++) {
    ui_data_setup();
}
console.timeEnd("Non Cached");
console.time("Cached");
for (var i = 0; i < iterations; i++) {
    ui_data_setup_cached();
}
console.timeEnd("Cached");

// ALTERNATIVE TEST
function ui_data_setup_cached()
{
    update_ui_data_initialized(0);
    update_ui_data_rendered(0);
    update_ui_data_focused_element(MAX_U32);
    update_ui_data_focused_element_x(MAX_U32);
    update_ui_data_focused_element_y(MAX_U32);
    update_ui_data_default_focused_element(MAX_U32);
    update_ui_data_last_input_mode(MAX_U32);
}
var iterations = 1000000;
var first_or_second = [0, 0];
for (var x = 0; x < 10000; ++x) {
    var nc_start = performance.now();
    for (var i = 0; i < iterations; i++) {
        ui_data_setup();
    }
    var nc_end = performance.now();
    var c_start = performance.now();
    for (var i = 0; i < iterations; i++) {
        ui_data_setup_cached();
    }
    var c_end = performance.now();
    var c = c_end - c_start;
    var nc = nc_end - nc_start;
    if (nc > c) {
        ++first_or_second[1];
    } else {
        ++first_or_second[0];
    }
}
console.log("NC " + first_or_second[0]);
console.log("C  " + first_or_second[1]);
```

This test was shocking. Setting members internal to the function was SIGNIFICANTLY slower.

```
var iterations = 100000;
for (var x = 0; x < 4; ++x) {
    console.time("Non Cached");
    for (var i = 0; i < iterations; i++) {
        function StructUIData()
        {
            this.buffer = new Uint32Array(7);
        }
        StructUIData.INITIALIZED = 0;
        StructUIData.RENDERED = 1;
        StructUIData.FOCUSED_ELEMENT = 2;
        StructUIData.FOCUSED_ELEMENT_X = 3;
        StructUIData.FOCUSED_ELEMENT_Y = 4;
        StructUIData.DEFAULT_FOCUSED_ELEMENT = 5;
        StructUIData.LAST_INPUT_MODE = 6;
        var UI_DATA = new StructUIData();
    }
    console.timeEnd("Non Cached");
    console.time("Cached");
    for (var i = 0; i < iterations; i++) {
        function StructUIData()
        {
            this.buffer = new Uint32Array(7);
            this.INITIALIZED = 0;
            this.RENDERED = 1;
            this.FOCUSED_ELEMENT = 2;
            this.FOCUSED_ELEMENT_X = 3;
            this.FOCUSED_ELEMENT_Y = 4;
            this.DEFAULT_FOCUSED_ELEMENT = 5;
            this.LAST_INPUT_MODE = 6;
        }
        var UI_DATA = new StructUIData();
    }
    console.timeEnd("Cached");
}
```

A note on element.getAttribute("data-something") vs element.dataset.something. https://www.measurethat.net/Benchmarks/Show/14432/0/getattribute-vs-dataset

I wrote a test for it

```
// <div id="test-element" data-attr1="value1" data-attr2="value2" data-attr3="value3"></div>
// Get the element
var element = document.getElementById("test-element");

// Pre-warm dataset to cache the DOMStringMap object
var ds = element.dataset;

// Define operations
var getAttributeSingle = function() {
    element.getAttribute("data-attr1");
};

var datasetSingle = function() {
    element.dataset.attr1;
};

var getAttributeMultiple = function() {
    element.getAttribute("data-attr1");
    element.getAttribute("data-attr2");
    element.getAttribute("data-attr3");
};

var datasetMultiple = function() {
    var ds = element.dataset;
    ds.attr1;
    ds.attr2;
    ds.attr3;
};

// Function to measure time
function measureTime(operation, iterations) {
    var startTime = performance.now();
    for (var i = 0; i < iterations; i++) {
        operation();
    }
    var endTime = performance.now();
    return (endTime - startTime) / iterations;
}

// Number of iterations
var iterations = 10000000;

// Perform tests
var timeGetAttributeSingle = measureTime(getAttributeSingle, iterations);
var timeDatasetSingle = measureTime(datasetSingle, iterations);
var timeGetAttributeMultiple = measureTime(getAttributeMultiple, iterations);
var timeDatasetMultiple = measureTime(datasetMultiple, iterations);

// Calculate time per attribute for multiple accesses
var timePerAttributeGetAttribute = timeGetAttributeMultiple / 3;
var timePerAttributeDataset = timeDatasetMultiple / 3;

// Output results
console.log("Single attribute access with getAttribute: " + timeGetAttributeSingle + " ms per access");
console.log("Single attribute access with dataset: " + timeDatasetSingle + " ms per access");
console.log("Multiple attribute access with getAttribute (total time for 3 attributes): " + timeGetAttributeMultiple + " ms per iteration");
console.log("Multiple attribute access with dataset (total time for 3 attributes): " + timeDatasetMultiple + " ms per iteration");
console.log("Time per attribute with getAttribute: " + timePerAttributeGetAttribute + " ms per attribute");
console.log("Time per attribute with dataset: " + timePerAttributeDataset + " ms per attribute");
```

Note that I also  tested a few other variations which apparently are not as fast as using UI_DATA.buffer[StructUIData.INITIALIZE] = MAX_32;

```
function StructUIData()
{
    this.buffer = new Uint32Array(7);
    this.initialized = function (value)
    {
        var index = 0;
        if (value)
        {
            this.buffer[index] = value;
        }
        return this.buffer[index];
    }
    this.rendered = function (value)
    {
        var index = 1;
        if (value)
        {
            this.buffer[index] = value;
        }
        return this.buffer[index];
    }
    this.focused_element = function (value)
    {
        var index = 2;
        if (value)
        {
            this.buffer[index] = value;
        }
        return this.buffer[index];
    }
    this.focused_element_x = function (value)
    {
        var index = 3;
        if (value)
        {
            this.buffer[index] = value;
        }
        return this.buffer[index];
    }
    this.focused_element_y = function (value)
    {
        var index = 4;
        if (value)
        {
            this.buffer[index] = value;
        }
        return this.buffer[index];
    }
    this.default_focused_element = function (value)
    {
        var index = 5;
        if (value)
        {
            this.buffer[index] = value;
        }
        return this.buffer[index];
    }
    this.last_input_mode = function (value)
    {
        var index = 6;
        if (value)
        {
            this.buffer[index] = value;
        }
        return this.buffer[index];
    }
}
function ui_data_initialized (value)
{
    var index = 0;
    if (value)
    {
        UI_DATA.buffer[index] = value;
    }
    return UI_DATA.buffer[index];
}
function ui_data_rendered (value)
{
    var index = 1;
    if (value)
    {
        UI_DATA.buffer[index] = value;
    }
    return UI_DATA.buffer[index];
}
function ui_data_focused_element (value)
{
    var index = 2;
    if (value)
    {
        UI_DATA.buffer[index] = value;
    }
    return UI_DATA.buffer[index];
}
function ui_data_focused_element_x (value)
{
    var index = 3;
    if (value)
    {
        UI_DATA.buffer[index] = value;
    }
    return UI_DATA.buffer[index];
}
function ui_data_focused_element_y (value)
{
    var index = 4;
    if (value)
    {
        UI_DATA.buffer[index] = value;
    }
    return UI_DATA.buffer[index];
}
function ui_data_default_focused_element (value)
{
    var index = 5;
    if (value)
    {
        UI_DATA.buffer[index] = value;
    }
    return UI_DATA.buffer[index];
}
function ui_data_last_input_mode (value)
{
    var index = 6;
    if (value)
    {
        UI_DATA.buffer[index] = value;
    }
    return UI_DATA.buffer[index];
}

var UI_DATA_OBJ = {
    INITIALIZED: 0,
    RENDERED: 0,
    FOCUSED_ELEMENT: MAX_U32,
    FOCUSED_ELEMENT_X: MAX_U32,
    FOCUSED_ELEMENT_Y: MAX_U32,
    DEFAULT_FOCUSED_ELEMENT: MAX_U32,
    LAST_INPUT_MODE: MAX_U32,
};
var UI_DATA_OBJ = {
    INITIALIZED: 0,
    RENDERED: 0,
    FOCUSED_ELEMENT: MAX_U32,
    FOCUSED_ELEMENT_X: MAX_U32,
    FOCUSED_ELEMENT_Y: MAX_U32,
    DEFAULT_FOCUSED_ELEMENT: MAX_U32,
    LAST_INPUT_MODE: MAX_U32,
    initialized: function (value)
    {
        if (value) { this.INITIALIZED = value; }
        return this.INITIALIZED;
    },
    rendered: function (value)
    {
        if (value) { this.RENDERED = value; }
        return this.RENDERED;
    },
    focused_element: function (value)
    {
        if (value) { this.FOCUSED_ELEMENT = value; }
        return this.FOCUSED_ELEMENT;
    },
    focused_element_x: function (value)
    {
        if (value) { this.FOCUSED_ELEMENT_X = value; }
        return this.FOCUSED_ELEMENT_X;
    },
    focused_element_y: function (value)
    {
        if (value) { this.FOCUSED_ELEMENT_Y = value; }
        return this.FOCUSED_ELEMENT_Y;
    },
    default_focused_element: function (value)
    {
        if (value) { this.DEFAULT_FOCUSED_ELEMENT = value; }
        return this.DEFAULT_FOCUSED_ELEMENT;
    },
    last_input_mode: function (value)
    {
        if (value) { this.LAST_INPUT_MODE = value; }
        return this.LAST_INPUT_MODE;
    }
};
```

Tried the below. Also did not work. Direct calls were always faster.

```
function StructUIData()
{
    this.buffer = new Uint32Array(7);
}
StructUIData.INITIALIZED = 0;
StructUIData.RENDERED = 1;
StructUIData.FOCUSED_ELEMENT = 2;
StructUIData.FOCUSED_ELEMENT_X = 3;
StructUIData.FOCUSED_ELEMENT_Y = 4;
StructUIData.DEFAULT_FOCUSED_ELEMENT = 5;
StructUIData.LAST_INPUT_MODE = 6;
var UI_DATA = new StructUIData();
function idk() {
    this.buffer = new Uint32Array(7);
    this.initialized = function (v) { if (v) {this.buffer[0] = v;}return this.buffer[0]; };
    this.rendered = function (v) { if (v) {this.buffer[1] = v;}return this.buffer[1]; };
    this.focused_element = function (v) { if (v) {this.buffer[2] = v;}return this.buffer[2]; };
    this.focused_element_x = function (v) { if (v) {this.buffer[3] = v;}return this.buffer[3]; };
    this.focused_element_y = function (v) { if (v) {this.buffer[4] = v;}return this.buffer[4]; };
    this.default_focused_element = function (v) { if (v) {this.buffer[5] = v;}return this.buffer[5]; };
    this.last_input_mode = function (v) { if (v) {this.buffer[6] = v;}return this.buffer[6]; };
};
class idkk {
    constructor() { this.buffer = new Uint32Array(7); }
    initialized (v) { if (v) {this.buffer[0] = v;}return this.buffer[0]; };
    rendered (v) { if (v) {this.buffer[1] = v;}return this.buffer[1]; };
    focused_element (v) { if (v) {this.buffer[2] = v;}return this.buffer[2]; };
    focused_element_x (v) { if (v) {this.buffer[3] = v;}return this.buffer[3]; };
    focused_element_y (v) { if (v) {this.buffer[4] = v;}return this.buffer[4]; };
    default_focused_element (v) { if (v) {this.buffer[5] = v;}return this.buffer[5]; };
    last_input_mode (v) { if (v) {this.buffer[6] = v;}return this.buffer[6]; };
}
var UI_DATA_OBJECT = new idk();
```