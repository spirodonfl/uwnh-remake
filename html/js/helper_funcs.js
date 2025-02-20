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