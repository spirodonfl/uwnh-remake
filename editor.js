var EDITOR = {
    edit_world_data_mode: false,
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
        var string = `
pub const width = ${new_world_data[0]};
pub const height = ${new_world_data[1]};
pub const size = width * height;
pub var data: [size]u16 = .{${new_world_data.join(', ')}};
        `;
        console.log(string);
    },
    imageToData: function () {
        var image = document.getElementById('image_file');
        const img = document.createElement('img');
        var fr = new FileReader();
        fr.readAsDataURL(image.files[0]);
        fr.onload = function() {
            img.onload = function() {
                var canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                var context = canvas.getContext('2d');
                context.drawImage(img, 0, 0);
                var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                var data = imageData.data;
                var output = [];
                for (var i = 0; i < data.length; i += 4) {
                    output.push(data[i]);
                }
                console.log(output);
                var size = img.width * img.height * 4 + 3;
                var string = `
        pub const width = ${img.width};
        pub const height = ${img.height};
        pub const size = width * height * 4 + 3;
        pub var data: [size]u16 = .{${img.width}, ${img.height}, ${size}, ${output.join(', ')}};
                `;
                console.log(string);
            }
            img.src = fr.result;
        }
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
