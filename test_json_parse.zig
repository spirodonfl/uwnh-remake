const std = @import("std");
const allocator = std.testing.allocator;
const expect = std.testing.expect;

fn parse(object: anytype, query: []const u8) !void {
    const result = object.get(query).?;

    const f_result = try std.fmt.allocPrint(allocator, "{any}", .{result});
    defer allocator.free(f_result);

    const t_result = f_result[21];

    switch (t_result) {
        105 => {
            const output = object.get(query).?.integer;
            try expect(output == 74363456);
        },

        115 => {
            const output = object.get(query).?.string;
            try expect(std.mem.eql(u8, output, "okay"));
        },

        98 => {
            const output = object.get(query).?.bool;
            try expect(output == true);
        },

        102 => {
            const output = object.get(query).?.float;
            try expect(output == 2.33e+77);
        },

        110 => {
            const output = object.get(query).?.null;
            try expect(@TypeOf(output) == void);
        },

        97 => {
            const output = object.get(query).?.array;
            try expect(output.items[0].integer == 3);
        },

        111 => {
            const output = object.get(query).?.object;
            try expect(std.mem.eql(u8, output.get("name").?.string, "hello"));
        },

        else => {},
    }
}

test {
    const my_json =
        \\{
        \\   "hello": "okay",
        \\   "okay": 74363456,
        \\   "noway": true,
        \\   "yesway": 2.33e+77,
        \\   "maybe": [3, 4, 5],
        \\   "newone": {"name":"hello"},
        \\   "empty": null
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, my_json, .{});
    defer parsed.deinit();

    const object = parsed.value.object;

    try parse(object, "hello");
    try parse(object, "okay");
    try parse(object, "noway");
    try parse(object, "yesway");
    try parse(object, "maybe");
    try parse(object, "newone");
    try parse(object, "empty");

    const keys = object.keys();
    try expect(@TypeOf(keys) == [][]const u8);

    const values = object.values();
    try expect(@TypeOf(values) == []std.json.Value);
}
