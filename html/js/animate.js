var createAnimatedObject = function(config)
{
    config = config || {};
    
    var animatedObject = {
        type: config.type || "generic",
        name: config.name || "animated_object",
        entity_id: null,
        start: { 
            x: (config.start && config.start.x) || 0, 
            y: (config.start && config.start.y) || 0 
        },
        current: { 
            x: (config.start && config.start.x) || 0, 
            y: (config.start && config.start.y) || 0 
        },
        end: { 
            x: (config.end && config.end.x) || 0, 
            y: (config.end && config.end.y) || 0 
        },
        animated: false,
        current_frame: 0,
        frame_rate: config.frame_rate || 2000,
        move_by: config.move_by || 1,
        render_always: config.render_always !== false,
        is_spawned: false,
        callbacks: [],
        
        spawn_fn: config.spawn_fn || function(x, y) {
            console.log("Spawning at " + x + ", " + y);
        },
        despawn_fn: config.despawn_fn || function() {
            console.log("Despawning");
        },
        move_fn: config.move_fn || function(id, x, y) {
            console.log("Moving " + id + " to " + x + ", " + y);
        },

        reset: function()
        {
            if (this.is_spawned)
            {
                this.despawn_fn();
                this.is_spawned = false;
                this.entity_id = null;
            }
            this.start = {x: 0, y: 0};
            this.current = {x: 0, y: 0};
            this.end = {x: 0, y: 0};
            this.animated = false;
            this.callbacks = [];
        },

        render: function()
        {
            if (!this.is_spawned)
            {
                this.spawn_fn(this.current.x, this.current.y);
                this.entity_id = Date.now();
                this.is_spawned = true;
            }

            ++this.current_frame;
            if (this.current_frame > this.frame_rate)
            {
                this.current_frame = 0;

                if (this.end.x > this.start.x)
                {
                    this.current.x += this.move_by;
                    if (this.current.x > this.end.x)
                    {
                        this.current.x = this.end.x;
                    }
                }
                else if (this.end.x < this.start.x)
                {
                    this.current.x -= this.move_by;
                    if (this.current.x < this.end.x)
                    {
                        this.current.x = this.end.x;
                    }
                }

                if (this.end.y > this.start.y)
                {
                    this.current.y += this.move_by;
                    if (this.current.y > this.end.y)
                    {
                        this.current.y = this.end.y;
                    }
                }
                else if (this.end.y < this.start.y)
                {
                    this.current.y -= this.move_by;
                    if (this.current.y < this.end.y)
                    {
                        this.current.y = this.end.y;
                    }
                }

                this.move_fn(this.entity_id, this.current.x, this.current.y);

                if (this.current.x === this.end.x && this.current.y === this.end.y)
                {
                    this.despawn_fn();
                    this.is_spawned = false;
                    this.animated = true;
                    
                    if (uih && uih.animations)
                    {
                        var index = uih.animations.indexOf(this);
                        if (index !== -1)
                        {
                            uih.animations.splice(index, 1);
                        }
                    }
                    
                    for (var ca = 0; ca < this.callbacks.length; ++ca)
                    {
                        this.callbacks[ca]();
                    }
                }
            }
        }
    };
    
    return animatedObject;
};