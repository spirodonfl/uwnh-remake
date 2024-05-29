const std = @import("std");

const INVALID_ID: u16 = std.math.maxInt(u16);

const SimpleClass = struct {
    flag: bool,
    value: i32,
};

pub const ServiceHandle = struct {
    index: usize,
    uuid: usize,
};

var current_uid: usize = 0;
pub fn generateUniqueId() usize {
    current_uid += 1;
    if (current_uid >= std.math.maxInt(usize)) {
        current_uid = 0;
    }
    return current_uid;
}

pub fn Service(comptime T: type) type {
    return struct {
        allocator: *std.mem.Allocator,
        data: []T,
        references: []usize,
        ids: []usize,
        autoResizeOnZeroRef: bool,

        pub fn init(allocator: *std.mem.Allocator, defaultSize: usize, autoResizeOnZeroRef: bool) !@This() {
            var data = try allocator.alloc(T, defaultSize);
            var references = try allocator.alloc(usize, defaultSize);
            var ids = try allocator.alloc(usize, defaultSize);
            for (0..ids.len) |id| {
                ids[id] = INVALID_ID;
            }
            return @This(){
                .allocator = allocator,
                .data = data,
                .references = references,
                .ids = ids,
                .autoResizeOnZeroRef = autoResizeOnZeroRef,
            };
        }

        pub fn deinit(self: *@This()) void {
            self.allocator.free(self.data);
            self.allocator.free(self.references);
            self.allocator.free(self.ids);
        }

        pub fn addData(self: *@This(), data: T) !ServiceHandle {
            // const uuid: usize = @intCast(std.time.milliTimestamp());
            const uuid = generateUniqueId();
            var found: bool = false;
            var index_id: usize = 0;
            for (self.ids, 0..) |itemId, index| {
                if (itemId == INVALID_ID) {
                    self.ids[index] = uuid;
                    self.data[index] = data;
                    self.references[index] = 0; // Initialize reference count to 0
                    found = true;
                    index_id = index;
                    break;
                }
            }

            if (found == false) {
                const newSize = self.data.len * 2;
                self.data = try self.allocator.realloc(self.data, newSize);
                self.references = try self.allocator.realloc(self.references, newSize);
                self.ids = try self.allocator.realloc(self.ids, newSize);

                // Update the length of self.data to reflect the new capacity
                self.data.len = newSize;
                // Now you can safely append data to self.data
                self.data[self.data.len - 1] = data;
                self.references[self.references.len - 1] = 0; // Initialize reference count to 0
                self.ids[self.ids.len - 1] = uuid;
                index_id = self.data.len - 1;
            }

            return ServiceHandle{ .index = index_id, .uuid = uuid };
        }

        pub fn removeData(self: *@This(), handle: *ServiceHandle) void {
            if (self.ids[handle.index] == handle.uuid) {
                self.ids[handle.index] = INVALID_ID;
                self.references[handle.index] = 0;
                self.data[handle.index] = undefined;
            }
        }

        // Note: Without returning the pointer to the data, when we tried to adjust the data
        // like decrementing health, it wouldn't take/stick
        pub fn getData(self: *@This(), handle: *ServiceHandle) !*T {
            if (self.ids[handle.index] == handle.uuid) {
                return &self.data[handle.index];
            }
            return undefined;
        }

        pub fn incrementReference(self: *@This(), handle: *ServiceHandle) void {
            if (self.ids[handle.index] == handle.uuid) {
                self.references[handle.index] += 1;
            }
        }

        pub fn decrementReference(self: *@This(), handle: *ServiceHandle) void {
            if (self.ids[handle.index] == handle.uuid) {
                self.references[handle.index] -= 1;
                if (self.references[handle.index] == 0 and self.autoResizeOnZeroRef) {
                    self.removeData(handle);
                }
            }
        }
    };
}

// Instantiate the Service with the specific data type
const ServiceSimpleClass = Service(SimpleClass);
const ServiceInteger = Service(u16);

test "Service initialization and basic operations" {
    var allocator = std.heap.page_allocator;

    // Initialize the Service with the specific data type
    var service = try ServiceSimpleClass.init(&allocator, 10, true);
    defer service.deinit();

    // Example of adding data to the service
    var simpleInstance = SimpleClass{
        .flag = true,
        .value = 42,
    };
    var si_handle = try service.addData(simpleInstance);
    std.debug.print("Added SimpleClass instance with id: {}\n", .{si_handle.uuid});
    var si_pull = try service.getData(&si_handle);
    try std.testing.expect(@TypeOf(si_pull) == @TypeOf(simpleInstance));
    try std.testing.expect(si_pull.flag == simpleInstance.flag);
    try std.testing.expect(si_pull.value == simpleInstance.value);
}
test "Integer Service initialization and basic operations" {
    var allocator = std.heap.page_allocator;

    // Initialize the Service with the specific data type
    var service = try ServiceInteger.init(&allocator, 10, true);
    defer service.deinit();

    // Example of adding data to the service
    var integerInstance: u16 = 42;
    var ii_handle = try service.addData(integerInstance);
    std.debug.print("Added Integer instance with id: {}\n", .{ii_handle.uuid});
    var ii_pull = try service.getData(&ii_handle);
    try std.testing.expect(@TypeOf(ii_pull) == @TypeOf(integerInstance));
    try std.testing.expect(ii_pull == integerInstance);
}
