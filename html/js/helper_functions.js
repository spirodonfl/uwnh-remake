// -----------------------------------------------------------------
// - HELPER FUNCTIONS
// -----------------------------------------------------------------
function getRandomInt(max)
{
    return Math.floor(Math.random() * max);
};

function formatMemorySize(bytes)
{
    const kb = bytes / 1024;
    const mb = kb / 1024;
    const gb = mb / 1024;
    
    if (gb >= 1) return `${gb.toFixed(2)} GB`;
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    if (kb >= 1) return `${kb.toFixed(2)} KB`;
    return `${bytes} Bytes`;
};

function is_sentry(value)
{
    if (!wasm)
    {
        console.error("No wasm object");
    }
    if (value !== wasm.exports.get_sentry() && value !== 4294967295)
    {
        return false;
    }
    return true;
};
function is_sentry_or_false(value)
{
    if (!wasm)
    {
        console.error("No wasm object");
    }
    if (value !== wasm.exports.get_sentry() && value !== 4294967295 && value !== false)
    {
        return false;
    }
    return true;
};

function get_layer_value(layer, x, y)
{
    if (!is_sentry(layer.same_value))
    {
        return layer.same_value;
    }
    return layer.data[(layer.width * y) + x];
};

function toggleShouldThreeD()
{
    document.body.classList.toggle("should_3d");
    should3d = !should3d;
};
function findGridCoordinates(grid, target)
{
    for (var y = 0; y < grid.length; ++y)
    {
        for (var x = 0; x < grid[y].length; ++x)
        {
            if (grid[y][x] === target)
            {
                return { x: x, y: y };
            }
        }
    }
    return null;
}
function atlasToBGPosition(name, size)
{
    var default_size = 1;
    if (size && size > 0) { default_size *= size; }
    var coords = ATLAS_COORDS[name];
    if (!coords) { return null; }
    var x = coords[0] * TILE_SIZE_SCALED / default_size;
    var y = coords[1] * TILE_SIZE_SCALED / default_size;
    return `background-position: -${x} -${y};`;
}
function atlasToStyle(name, size, zoom_factor, absolute)
{
    var bg_size = 2;
    if (size && size > 0) { bg_size *= size; }
    var default_size = 1;
    if (size && size > 0) { default_size *= size; }
    var zoom_size = zoom / 2;
    if (zoom_factor && zoom_factor > 0)
    {
        zoom_size = zoom / zoom_factor;
    }
    var bg_position = atlasToBGPosition(name, size);
    if (bg_position === null) { return null; }
    var position = "";
    if (absolute) { position = "position: absolute;"; }
    var cursor;
    if (name === "reticle_red" || name === "reticle_green" || name === "icon_thumbs_up")
    {
        cursor = "cursor: pointer;";
    }
    var threedee = "";
    if (should3d)
    {
        threedee = ` 
            transform: 
                rotateX(90deg)
                rotateZ(180deg)
                rotateY(180deg)
                translate3d(0px, -16px, 0px);
            transform-style: preserve-3d;
            will-change: transform;
            backface-visibility: hidden;
        `;
    }
    return `
        background-image: var(--atlas-image);
        ${bg_position}
        background-size:
            ${ATLAS_IMAGE_SIZE.x / bg_size}px
            ${ATLAS_IMAGE_SIZE.y / bg_size}px;
        ${position}
        width: ${TILE_SIZE_SCALED / default_size}px;
        height: ${TILE_SIZE_SCALED / default_size}px;
        zoom: ${zoom_size};
        ${threedee}
        ${cursor}
    `;
}