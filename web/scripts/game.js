import { editor } from "./editor.js";

const importObject = {
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
  getImages() {},
};

export const game = await WebAssembly.instantiateStreaming(
  fetch("/wasm/game.wasm"),
  importObject
).then((results) => {
  /**
   * @type {WebAssembly.Instance & typeof importObject}
   */
  const exports = results.instance.exports;
  return {
    exports,
    camera_offset: { x: 0, y: 0 },
    editor_mode: false,
    data_view: null,
    last_memory_bytelength: 0,
    __getMemory() {
      return this.exports.memory;
    },
    // TODO: In here, you should inject or trap function calls if you're in editor mode and you have some data you've altered for editing purposes
    // In order to do this, you need to begin with the ability to take data out of the current webassembly memory and store it as a javascript array
    // You also need to have the editor be able to generate arrays for you
    // Then you need to provide "tags" or a way to tell when an editor memory block is available for a particular operation vs webassembly
    // You can then do a cross reference/lookup of some kind on certain wasm function calls and, if there's a matching available js memory block, return that instead of calling the wasm module itself
    addToTestWorldData(value) {
      this.exports.addToTestWorldData(value);
    },
    getTestWorldData() {
      var data = this.getFromMemory(
        this.exports.getTestWorldData(),
        this.exports.getTestWorldDataLen()
      );
      console.log(data);
    },

    // NEW STUFF HERE
    attackEntity(attackerEntityIndex, attackeeEntityIndex) {
      // TODO: Console log output the attacker & entity
      console.log(
        this.exports.attackEntity(attackerEntityIndex, attackeeEntityIndex)
      );
    },
    moveEntity(entityIndex, direction) {
      console.log("moveEntity", entityIndex, direction);
      console.log(this.exports.moveEntity(entityIndex, direction));
      this.updateViewportData();
    },
    getFromMemory(memory_position, memory_length) {
      if (
        !this.data_view ||
        this.data_view.buffer !== this.exports.memory.buffer
      ) {
        this.data_view = new DataView(
          this.exports.memory.buffer,
          0,
          this.exports.memory.byteLength
        );
      }
      let data = [];
      for (let i = 0; i < memory_length; i++) {
        // Note: uint16 occupies 2 bytes. uint8 occupies 1 byte. uint32 occupies 4 bytes
        let current_position = memory_position + i * 2;
        // Note: without the second parameter set to true, you will not get the right values
        data.push(this.data_view.getUint16(current_position, true));
      }
      return data;
    },
    getFromMemorySix(memory_position, memory_length) {
      if (
        !this.data_view ||
        this.data_view.buffer !== this.exports.memory.buffer
      ) {
        this.data_view = new DataView(
          this.exports.memory.buffer,
          0,
          this.exports.memory.byteLength
        );
      }
      let data = [];
      for (let i = 0; i < memory_length; i++) {
        // Note: uint16 occupies 2 bytes. uint8 occupies 1 byte. uint32 occupies 4 bytes
        let current_position = memory_position + i * 4;
        // Note: without the second parameter set to true, you will not get the right values
        data.push(this.data_view.getUint32(current_position, true));
      }
      return data;
    },
    getImages() {
      var data = GAME.getFromMemorySix(this.exports.getImages(), 1);
      console.log(data);
      data = GAME.getFromMemory(data[0], 32);
      console.log(data);
    },
    getImage(index) {
      var data = GAME.getFromMemorySix(this.exports.getImage(index), 1);
      console.log(data);
      var memory_position = data[0];
      data = GAME.getFromMemory(memory_position, 3);
      console.log(data);
      var length = data[2];
      data = GAME.getFromMemory(memory_position, length);
      console.log(data);
      return data;
    },
    getEntity(entityIndex) {
      var entity_data = null;
      if (
        editor &&
        editor.override_data_mode &&
        editor.entities_list[entityIndex]
      ) {
        entity_data = editor.entities_list[entityIndex];
      } else {
        entity_data = this.getFromMemory(
          this.exports.getEntity(entityIndex),
          this.exports.getEntityLength(entityIndex)
        );
      }
      // console.log(entity_data);
      return {
        health: entity_data[0],
        x: entity_data[1],
        y: entity_data[2],
      };
    },
    getCurrentWorldSize() {
      var world_size = null;
      if (editor && editor.override_data_mode && editor.worlds_list[0]) {
        world_size = editor.worlds_list[0].slice(0, 2);
      } else {
        world_size = this.getFromMemory(this.exports.getCurrentWorldSize(), 2);
      }
      var data = {
        width: world_size[0],
        height: world_size[1],
      };
      // console.log(data);
      return data;
    },
    getCurrentWorldData(layer, x, y) {
      var data = null;
      if (editor && editor.override_data_mode && editor.worlds_list[0]) {
        var offset = 2;
        offset += x * y * layer;
        data = editor.worlds_list[0].slice(offset, offset + x);
      } else {
        data = this.exports.getCurrentWorldData(layer, x, y);
      }
      return data;
    },
    getWorld() {
      var world_data = null;
      if (editor && editor.override_data_mode && editor.worlds_list[0]) {
        world_data = editor.worlds_list[0].slice(2);
      } else {
        // TODO: Should pull in total layers from somewhere more dynamic instead of hard coding it here
        var world_data = this.getFromMemory(
          this.exports.getWorld(),
          3 *
            this.getCurrentWorldSize().width *
            this.getCurrentWorldSize().height
        );
        // console.log(world_data);
      }
      return world_data;
    },
    getCameraPosition() {
      var data = this.getFromMemory(this.exports.getCameraPosition(), 2);
      this.camera_offset.x = data[0];
      this.camera_offset.y = data[1];
      return this.camera_offset;
    },
    setCameraPosition(direction) {
      this.exports.setCameraPosition(direction);
      this.updateViewportData();
      this.getCameraPosition();
    },
    setViewportSize(width, height) {
      console.log("Setting viewport size to:", width, height);
      this.exports.setViewportSize(width, height);
    },
    getViewportData() {
      var viewport_data = null;
      var memory_position = this.exports.getViewportData();
      var memory_length = this.exports.getViewportDataLen();
      viewport_data = this.getFromMemory(memory_position, memory_length);
      // console.log(viewport_data);
      return viewport_data;
    },
    updateEditorViewportData(width, height) {
      if (editor && editor.override_data_mode && editor.worlds_list[0]) {
        var x = editor.worlds_list[0][0];
        var y = editor.worlds_list[0][1];
        console.log("editor mode", { x, y });
        console.log(this.exports.updateEditorViewportData(x, y));
      } else {
        this.updateViewportData();
      }
    },
    updateViewportData() {
      console.log(this.exports.updateViewportData());
    },

    // OLD STUFF HERE
    __testImage() {
      var data = GAME.getImage(1).slice(3, GAME.getImage(1).length);
      var image_data = [];
      // Faking data fill
      var max = 32 * 32 * 4;
      var data_i = 0;
      for (var i = 0; i < max; ++i) {
        image_data[i] = data[data_i] || 0;
        ++data_i;
        if (data_i >= data.length) {
          data_i = 0;
        }
      }
      image_data = new Uint8ClampedArray(image_data);

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
      canvas.convertToBlob({ type: "image/png" }).then(function (blob) {
        var img = document.createElement("img");
        //img.src = canvas.toDataURL("image/png");
        var huh = URL.createObjectURL(blob);
        img.style.position = "absolute";
        img.style.top = "0px";
        img.style.left = "0px";
        img.src = huh;
        document.body.appendChild(img);
      });
    },
    getDiffList() {
      // console.log('getDiffList', this.exports.getDiffList());
      var memory_position = this.exports.getDiffList();
      var memory_length = this.exports.getDiffListLen();
      // TODO: Update other usage of this
      var array = new Uint16Array(
        this.exports.memory.buffer,
        memory_position,
        memory_length
      );
      // console.log(array);
      // var array = new Int32Array(this.exports.memory.buffer.slice(array[0], (memory_position + (4 * memory_length))));
      // console.log(array);
      return array;
    },
    getDiffListLen() {
      // console.log('getDiffListLen', this.exports.getDiffListLen());
      return this.exports.getDiffListLen();
    },
    clearDiffList() {
      // console.log('clearDiffList', this.exports.clearDiffList());
      this.exports.clearDiffList();
    },
    getDebug() {
      // console.log('getDiffList', this.exports.getDiffList());
      var memory_position = this.exports.getDebug();
      var memory_length = this.exports.getDebugLen();
      // TODO: Update other usage of this
      var array = new Uint16Array(
        this.exports.memory.buffer,
        memory_position,
        memory_length
      );
      return array;
    },
    getDebugLen() {
      return this.exports.getDebugLen();
    },
    clearDebug() {
      this.exports.clearDebug();
    },
    initGame() {
      console.log("initGame", this.exports.initGame());
    },
  };
});

export let _testScript_i = 99;
export let _testScript = [
  function () {
    _GAME.moveEntity(0, 0);
    ++_testScript_i;
  },
  function () {
    console.log("Script" + _testScript_i);
    _GAME.attackEntity(0, 1);
    console.log(GAME.getEntity(1));
    ++_testScript_i;
  },
  function () {
    console.log("Script" + _testScript_i);
    _GAME.attackEntity(0, 1);
    console.log(GAME.getEntity(1));
    ++_testScript_i;
  },
  function () {
    console.log("Script" + _testScript_i);
    _GAME.attackEntity(0, 1);
    console.log(GAME.getEntity(1));
    ++_testScript_i;
  },
  function () {
    console.log("Script" + _testScript_i);
    _GAME.attackEntity(0, 1);
    console.log(game.getEntity(1));
    ++_testScript_i;
  },
];
