// TODO: Can we generally avoid storing data from the WASM module into variables since that effectively doubles the memory usage?
// Maybe store the memory locations instead
// TODO: Find a way to inject/hook into webassembly calls and return locally stored data instead of WASM data
// Example: if you've edited a world, just pull from the local data of that edited world instead of the WASM
// In other words, we never manipulate data via the editor by re-allocating unless we absolutely have to
var EDITOR = {
    override_data_mode: false,
    current_layer: 0,
    current_entity: 0,
    entities_list: [],
    worlds_list: [],
    camera_has_changed: true,
    viewport_data: [],
    last_clicked_coordinates: [],
    // If we've manipulated data, we need to essentially *capture* GAME and _GAME functions and return our own data, not the WASM data
    has_manipulated_data: false,
    setEntityHealth: function (entityIndex, health) {
        GAME.data_view.setUint16(_GAME.getEntity(entityIndex), health, true)
    },
    generateEntityArray: function(health, x, y) {
        this.entities_list.push(Uint16Array.from([health, x, y]));
        console.log(this.entities_list);
        return this.entities_list.length - 1;
    },
    generateWorldArray: function(width, height) {
        var layer = 0;
        var new_world = new Uint16Array(width * height * 3 + 2);
        new_world[0] = width;
        new_world[1] = height;
        for (var i = 2; i < new_world.length; ++i) {
            new_world[i] = 0;
        }
        this.worlds_list.push(new_world);
        console.log(this.worlds_list);
    },
    generateEntity: function (health, x, y) {
        this.entities_list.push({health: health, x: x, y: y});
    },
    getEntity: function (index) {
        this.entities_list.push(GAME.getEntity(index));
    },
    getWorld: function () {
        this.worlds_list.push(GAME.getWorld());
    },
    entityToZig: function (entity) {
        var string = `pub var data: [3]u16 = .{ ${entity.health}, ${entity.x}, ${entity.y} };`;
        console.log(string);

        const file = new File([string], 'test_entity_test.zig', {
            type: 'text/plain',
        });

        function download() {
            const link = document.createElement('a')
            const url = URL.createObjectURL(file)

            link.href = url
            link.download = file.name
            document.body.appendChild(link)
            link.click()

            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        }

        download();
    },
    // TODO: Need to also have # of layers as well
    worldDataToZig: function (world_data) {
        var new_size = 3 * GAME.getCurrentWorldSize().width * GAME.getCurrentWorldSize().height;
        new_size += 2; // storing width & height

        // Artificially fill based on current world_data
        var new_world_data = [];
        new_world_data[0] = 20;
        new_world_data[1] = 4;
        var world_i = 0;
        for (var i = 2; i < new_size; i++) {
            new_world_data[i] = world_data[world_i];
            ++world_i;
            if (world_i > world_data.length) {
                world_i = 0;
            }
        }
        if (new_world_data.length !== new_size) {
            console.log('SERIOUS ERROR SETTINGS THE NEW WORLD SIZE');
        }
        var string = `pub var data: [${new_size}]u16 = .{${new_world_data.join(', ')}};`;
        console.log(string);
    },
    clearEditorBlocks: function () {
        var d = document.querySelectorAll('.editor_block');
        for (var i = 0; i < d.length; ++i) {
            if (d[i] instanceof HTMLElement) {
                d[i].remove();
            }
        }
    }
};
