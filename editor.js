// TODO: Can we generally avoid storing data from the WASM module into variables since that effectively doubles the memory usage?
// Maybe store the memory locations instead
var EDITOR = {
    current_layer: 0,
    current_entity: 0,
    entities_list: [],
    worlds_list: [],
    generateEntity: function (health, x, y) {
        this.entities_list.push({health: health, x: x, y: y});
    },
    getEntity: function (index) {
        this.entities_list.push(GAME.getEntity(index));
    },
    getWorld: function (layer) {
        this.worlds_list.push(GAME.getWorld(layer));
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
        var string = `pub var data: [3][4][20]u16 = .{
            .{
                .{ ${world_data.slice(0, 20).join(', ')} },
                .{ ${world_data.slice(20, 40).join(', ')} },
                .{ ${world_data.slice(40, 60).join(', ')} },
                .{ ${world_data.slice(60, 80).join(', ')} },
            },
            .{
                .{ ${world_data.slice(0, 20).join(', ')} },
                .{ ${world_data.slice(20, 40).join(', ')} },
                .{ ${world_data.slice(40, 60).join(', ')} },
                .{ ${world_data.slice(60, 80).join(', ')} },
            },
            .{
                .{ ${world_data.slice(0, 20).join(', ')} },
                .{ ${world_data.slice(20, 40).join(', ')} },
                .{ ${world_data.slice(40, 60).join(', ')} },
                .{ ${world_data.slice(60, 80).join(', ')} },
            },
        };`;
        console.log(string);
    },
};
