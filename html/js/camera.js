var CAMERA =
{
    offset: {x: 0, y: 0},
    moveLeft: function ()
    {
        this.offset.x -= 1;
        if (this.offset.x < 0)
        {
            this.offset.x = 0;
        }
    },
    moveRight: function ()
    {
        this.offset.x += 1;
        var max_offset_x = (WORLD[gh.current.world].width - (VIEWPORT.width / 2));
        if (this.offset.x >= max_offset_x)
        {
            this.offset.x = max_offset_x - 1;
        }
    },
    moveUp: function ()
    {
        this.offset.y -= 1;
        if (this.offset.y < 0)
        {
            this.offset.y = 0;
        }
    },
    moveDown: function ()
    {
        this.offset.y += 1;
        var max_offset_y = (WORLD[gh.current.world].height - (VIEWPORT.height / 2));
        if (this.offset.y >= max_offset_y)
        {
            this.offset.y = max_offset_y - 1;
        }
    },
};