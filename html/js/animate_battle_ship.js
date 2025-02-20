var animateBattleShip = {
    start: {x: 0, y: 3},
    end: {x: 15, y: 3},
    current: {x: 0, y: 3},
    current_frame: 0,
    frame_rate: 20,
    render: function ()
    {
        ++this.current_frame;
        if (this.current_frame >= this.frame_rate)
        {
            ++this.current.x;
            if (this.current.x > this.end.x)
            {
                this.current.x = this.start.x;
            }
            this.current_frame = 0;
        }
    }
};