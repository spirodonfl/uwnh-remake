// https://jsdoc.app/about-getting-started
LOADER.addRequired('wasm');

const importObject = {
    imports: {
        getViewportData() {},
        getViewportDataLen() {},
        updateEditorViewportData(width, height) {},
        updateViewportData() {},
        specialUpdateViewportData() {},
        getDiffList() {},
        getDiffListLen() {},
        clearDiffList() {},
        initGame() {},

        getDebug() {},
        getDebugLen() {},
        clearDebug() {},

        // EDITOR FUNCTIONS HERE
        editor_deleteCollision(x, y) {},
        editor_addCollision(x, y) {},

        // GENERAL FUNCTIONS HERE
        getEntity(entityIndex) {},
        setEntityPosition(entityIndex, x, y) {},
        moveEntity(entityIndex, direction) {},
        // Specifically a memory length call
        getEntityLength(entityIndex) {},
        attackEntity(attackerEntityIndex, attackeeEntityIndex) {},
        getCurrentWorldData(layer, x, y) {},
        getCurrentWorldSize() {},
        getWorld(layer) {},
        getCurrentWorldIndex(layer, x, y) {},

        setViewportSize(width, height) {},
        getCameraPosition() {},
        setCameraPosition(direction) {},

        // TEST AREA
        getTestMemoryPixelBytes() {},
        getTestMemoryPixelBytesSize() {},
        getImage(index) {},
        getImageSix() {},
        getImages() {},
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
            last_memory_bytelength: 0,
            __getMemory: function() {
                return _GAME.memory;
            },

            // TODO: In here, you should inject or trap function calls if you're in editor mode and you have some data you've altered for editing purposes
            // In order to do this, you need to begin with the ability to take data out of the current webassembly memory and store it as a javascript array
            // You also need to have the editor be able to generate arrays for you
            // Then you need to provide "tags" or a way to tell when an editor memory block is available for a particular operation vs webassembly
            // You can then do a cross reference/lookup of some kind on certain wasm function calls and, if there's a matching available js memory block, return that instead of calling the wasm module itself
            addToTestWorldData(value) {
                _GAME.addToTestWorldData(value);
            },
            getTestWorldData: function () {
                var data = this.getFromMemory(_GAME.getTestWorldData(), _GAME.getTestWorldDataLen());
                console.log(data);
            },

            // NEW STUFF HERE
            attackEntity: function(attackerEntityIndex, attackeeEntityIndex) {
                // TODO: Console log output the attacker & entity
                console.log(_GAME.attackEntity(attackerEntityIndex, attackeeEntityIndex));
            },
            moveEntity: function(entityIndex, direction) {
                console.log('moveEntity', entityIndex, direction);
                console.log(_GAME.moveEntity(entityIndex, direction));
                this.updateViewportData();
            },
            getFromMemory: function(memory_position, memory_length) {
                if (!this.data_view || this.data_view.buffer !== _GAME.memory.buffer) {
                    this.data_view = new DataView(_GAME.memory.buffer, 0, _GAME.memory.byteLength);
                }
                let data = [];
                for (let i = 0; i < memory_length; i++) {
                    // Note: uint16 occupies 2 bytes. uint8 occupies 1 byte. uint32 occupies 4 bytes
                    let current_position = memory_position + (i * 2);
                    // Note: without the second parameter set to true, you will not get the right values
                    data.push(this.data_view.getUint16(current_position, true));
                }
                return data;
            },
            getFromMemorySix: function(memory_position, memory_length) {
                if (!this.data_view || this.data_view.buffer !== _GAME.memory.buffer) {
                    this.data_view = new DataView(_GAME.memory.buffer, 0, _GAME.memory.byteLength);
                }
                let data = [];
                for (let i = 0; i < memory_length; i++) {
                    // Note: uint16 occupies 2 bytes. uint8 occupies 1 byte. uint32 occupies 4 bytes
                    let current_position = memory_position + (i * 4);
                    // Note: without the second parameter set to true, you will not get the right values
                    data.push(this.data_view.getUint32(current_position, true));
                }
                return data;
            },
            getImageSix: function() {
                console.log(GAME.getFromMemorySix(_GAME.getImageSix(), 6));
            },
            getImages: function() {
                var data = GAME.getFromMemorySix(_GAME.getImages(), 6);
                console.log(data);
                data = GAME.getFromMemory(data[0], 32);
                console.log(data);
            },
            getEntity: function(entityIndex) {
                var entity_data = null;
                if (EDITOR && EDITOR.override_data_mode && EDITOR.entities_list[entityIndex]) {
                    entity_data = EDITOR.entities_list[entityIndex];
                } else {
                    entity_data = this.getFromMemory(_GAME.getEntity(entityIndex), _GAME.getEntityLength(entityIndex));
                }
                // console.log(entity_data);
                return {
                    health: entity_data[0],
                    x: entity_data[1],
                    y: entity_data[2],
                };
            },
            getCurrentWorldSize: function() {
                var world_size = null;
                if (EDITOR && EDITOR.override_data_mode && EDITOR.worlds_list[0]) {
                    world_size = EDITOR.worlds_list[0].slice(0, 2);
                } else {
                    world_size = this.getFromMemory(_GAME.getCurrentWorldSize(), 2);
                }
                var data = {
                    width: world_size[0],
                    height: world_size[1],
                };
                // console.log(data);
                return data;
            },
            getCurrentWorldData: function(layer, x, y) {
                var data = null;
                if (EDITOR && EDITOR.override_data_mode && EDITOR.worlds_list[0]) {
                    var offset = 2;
                    offset += (x * y) * layer;
                    data = EDITOR.worlds_list[0].slice(offset, offset + x);
                } else {
                    data = _GAME.getCurrentWorldData(layer, x, y);
                }
                return data;
            },
            getWorld: function() {
                var world_data = null;
                if (EDITOR && EDITOR.override_data_mode && EDITOR.worlds_list[0]) {
                    world_data = EDITOR.worlds_list[0].slice(2);
                } else {
                    // TODO: Should pull in total layers from somewhere more dynamic instead of hard coding it here
                    var world_data = this.getFromMemory(_GAME.getWorld(), (3 * this.getCurrentWorldSize().width * this.getCurrentWorldSize().height));
                    // console.log(world_data);
                }
                return world_data;
            },
            getCameraPosition: function() {
                var data = this.getFromMemory(_GAME.getCameraPosition(), 2);
                this.camera_offset.x = data[0];
                this.camera_offset.y = data[1];
                return this.camera_offset;
            },
            setCameraPosition: function(direction) {
                _GAME.setCameraPosition(direction);
                this.updateViewportData();
                this.getCameraPosition();
            },
            setViewportSize: function(width, height) {
                console.log('Setting viewport size to:', width, height);
                _GAME.setViewportSize(width, height);
            },
            getViewportData() {
                var viewport_data = null;
                var memory_position = _GAME.getViewportData();
                var memory_length = _GAME.getViewportDataLen();
                viewport_data = this.getFromMemory(memory_position, memory_length);
                // console.log(viewport_data);
                return viewport_data;
            },
            updateEditorViewportData(width, height) {
                if (EDITOR && EDITOR.override_data_mode && EDITOR.worlds_list[0]) {
                    var x = EDITOR.worlds_list[0][0];
                    var y = EDITOR.worlds_list[0][1];
                    console.log('editor mode', {x,y});
                    console.log(_GAME.updateEditorViewportData(x, y));
                } else {
                    this.updateViewportData();
                }
            },
            updateViewportData() {
                console.log(_GAME.updateViewportData());
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
                var array = new Uint16Array(_GAME.memory.buffer, memory_position, memory_length);
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
            getDebug: function() {
                // console.log('getDiffList', _GAME.getDiffList());
                var memory_position = _GAME.getDebug();
                var memory_length = _GAME.getDebugLen();
                // TODO: Update other usage of this
                var array = new Uint16Array(_GAME.memory.buffer, memory_position, memory_length);
                // console.log(array);
                // var array = new Int32Array(_GAME.memory.buffer.slice(array[0], (memory_position + (4 * memory_length))));
                // console.log(array);
                return array;
            },
            getDebugLen: function() {
                // console.log('getDiffListLen', _GAME.getDiffListLen());
                return _GAME.getDebugLen();
            },
            clearDebug: function() {
                // console.log('clearDiffList', _GAME.clearDiffList());
                _GAME.clearDebug();
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
