var viewport_callbacks = {};
viewport_callbacks["mousedown"] = [];
viewport_callbacks["mousemove"] = [];
function viewportConvertEvent(event)
{
    var rect = document
        .getElementById("viewport")
        .getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    x = x / zoom;
    y = y / zoom;
    var viewport_x = Math.floor(x / TILE_SIZE_SCALED);
    var viewport_y = Math.floor(y / TILE_SIZE_SCALED);
    var world_x = viewport_x + CAMERA.offset.x;
    var world_y = viewport_y + CAMERA.offset.y;
    return {viewport_x, viewport_y, world_x, world_y};
}
function viewportMouseDown(event)
{
    if (viewport_callbacks["mousedown"].length === 0) { return; }
    var total = viewport_callbacks["mousedown"].length;
    for (var i = 0; i < total; ++i)
    {
        viewport_callbacks["mousedown"][i](viewportConvertEvent(event));
    }
}

function viewportMouseMove(event)
{
    if (viewport_callbacks["mousemove"].length === 0) { return; }
    var total = viewport_callbacks["mousemove"].length;
    for (var i = 0; i < total; ++i)
    {
        viewport_callbacks["mousemove"][i](viewportConvertEvent(event));
    }
}