// https://jsdoc.app/about-getting-started
LOADER.addRequired('wasm');

const importObject = {
    imports: {
        getDiffList() {},
        getDiffListLen() {},
        clearDiffList() {},
        initGame() {},

        // NEW STUFF HERE
        getEntity(entityIndex) {},
        setEntityPosition(entityIndex, x, y) {},
        moveEntity(entityIndex, direction, error) {},
        // Specifically a memory length call
        getEntityLength() {},
        attackEntity(attackerEntityIndex, attackeeEntityIndex) {},
        getCurrentWorldData(layer, x, y) {},
        getCurrentWorldSize() {},
        getWorld(layer) {},

        setViewportSize(width, height) {},
        setCameraPosition(x, y) {},

        // TEST AREA
        getTestMemoryPixelBytes() {},
        getTestMemoryPixelBytesSize() {},
    },
};
let _GAME = null;
WebAssembly.instantiateStreaming(fetch("game.wasm"), importObject).then(
    (results) => {
        _GAME = results.instance.exports;
        console.log(results);
        console.log(_GAME);
        GAME = {
            camera_offset: {x: 0, y: 0},
            editor_mode: false,
            data_view: null,
            __getMemory: function() {
                return _GAME.memory;
            },

            // NEW STUFF HERE
            attackEntity: function(attackerEntityIndex, attackeeEntityIndex) {
                // TODO: Console log output the attacker & entity
                console.log(_GAME.attackEntity(attackerEntityIndex, attackeeEntityIndex));
            },
            moveEntity: function(entityIndex, direction) {
                console.log('moveEntity', entityIndex, direction);
                console.log(_GAME.moveEntity(entityIndex, direction));
            },
            getFromMemory: function(memory_position, memory_length) {
                memory_length *= 2;
                return new Uint16Array(_GAME.memory.buffer.slice(memory_position, (memory_position + memory_length)));
                // TODO: Figure this out!
                // if (this.data_view === null) {
                //     this.data_view = new DataView(_GAME.memory.buffer, 0, _GAME.memory.byteLength);
                // }
                // let data = [];
                // for (let i = 0; i < memory_length; i++) {
                //     data.push(this.data_view.getUint16(memory_position + i));
                // }
                // return data;
            },
            getEntity: function(entityIndex) {
                var entity_data = this.getFromMemory(_GAME.getEntity(entityIndex), _GAME.getEntityLength());
                return {
                    health: entity_data[0],
                    x: entity_data[1],
                    y: entity_data[2],
                };
            },
            getCurrentWorldSize: function() {
                var world_size = this.getFromMemory(_GAME.getCurrentWorldSize(), 2);
                return {
                    width: world_size[0],
                    height: world_size[1],
                };
            },
            getCurrentWorldData: function(layer, x, y) {
                var data = _GAME.getCurrentWorldData(layer, x, y);
                return data;
            },
            getWorld: function(layer) {
                var world_data = this.getFromMemory(_GAME.getWorld(layer), (this.getCurrentWorldSize().width * this.getCurrentWorldSize().height));
                console.log(world_data);
                return world_data;
            },
            setCameraPosition: function(x, y) {
                this.camera_offset.x = x;
                this.camera_offset.y = y;
                _GAME.setCameraPosition(x, y);
            },

            // OLD STUFF HERE
            __testImage()
            {
                _GAME.fillTestImage();
                var image_data = new Uint8ClampedArray(
                    _GAME.memory.buffer.slice(
                        _GAME.getTestImageBufferPointer(),
                        (
                            _GAME.getTestImageBufferPointer() + (
                                4 * _GAME.getTestImageSize() * _GAME.getTestImageSize()
                            )
                        )
                    )
                );
                console.log(image_data);

                var canvas = document.createElement("canvas");
                var canvas = new OffscreenCanvas(32, 32);
                //canvas.width = 32;
                //canvas.height = 32;
                var ctx = canvas.getContext("2d");

                // let buffer = new Uint8ClampedArray(image_data.length);
                // for (let i = 0; i < image_data.length; i+=1) {
                //     buffer[i] = image_data.charCodeAt(i);
                // }
                image_data = new ImageData(image_data, 32, 32);
                ctx.putImageData(image_data, 0, 0);
                canvas.convertToBlob({type: "image/png"}).then(function (blob) {
                    var img = document.createElement("img");
                    //img.src = canvas.toDataURL("image/png");
                    var huh = URL.createObjectURL(blob);
                    img.src = huh;
                    document.body.appendChild(img);
                });
            },
            getDiffList: function() {
                // console.log('getDiffList', _GAME.getDiffList());
                var memory_position = _GAME.getDiffList();
                var memory_length = _GAME.getDiffListLen();
                // TODO: Update other usage of this
                var array = new Uint8Array(_GAME.memory.buffer, memory_position, memory_length);
                // console.log(array);
                // var array = new Int32Array(_GAME.memory.buffer.slice(array[0], (memory_position + (4 * memory_length))));
                // console.log(array);
                return array;
            },
            getDiffListLen: function() {
                // console.log('getDiffListLen', _GAME.getDiffListLen());
                return _GAME.getDiffListLen();
            },
            clearDiffList: function() {
                // console.log('clearDiffList', _GAME.clearDiffList());
                _GAME.clearDiffList();
            },
            initGame: function() {
                console.log('initGame', _GAME.initGame());
            },
        };
        LOADER.loaded('wasm');
    },
);
let GAME = null;

let _testScript_i = 99;
let _testScript = [
    function () {
        _GAME.moveEntity(0, 0);
        ++_testScript_i;
    },
    function () {
        console.log('Script' + _testScript_i);
        _GAME.attackEntity(0, 1);
        console.log(GAME.getEntity(1));
        ++_testScript_i;
    },
    function () {
        console.log('Script' + _testScript_i);
        _GAME.attackEntity(0, 1);
        console.log(GAME.getEntity(1));
        ++_testScript_i;
    },
    function () {
        console.log('Script' + _testScript_i);
        _GAME.attackEntity(0, 1);
        console.log(GAME.getEntity(1));
        ++_testScript_i;
    },
    function () {
        console.log('Script' + _testScript_i);
        _GAME.attackEntity(0, 1);
        console.log(GAME.getEntity(1));
        ++_testScript_i;
    },
];
