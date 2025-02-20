var animateOceanBattleCannon = {
    type: "ocean_battle",
    start: {x: 0, y: 0},
    current: {x: 0, y: 0},
    end: {x: 0, y: 0},
    animated: false,
    current_frame: 0,
    frame_rate: 1,
    move_by: 8,
    render_always: true,
    cannon_tile: null,
    callbacks: [],
    reset: function ()
    {
        if (this.cannon_tile !== null)
        {
            this.cannon_tile.remove();
            this.cannon_tile = null;
        }
        this.start = {x: 0, y: 0};
        this.current = {x: 0, y: 0};
        this.end = {x: 0, y: 0};
        this.animated = false;
        this.callbacks = [];
    },
    render: function ()
    {
        if (this.cannon_tile === null)
        {
            this.cannon_tile = document.createElement('div');
            this.cannon_tile.id = "cannon_tile";
            this.cannon_tile.style.position = "absolute";
            this.cannon_tile.style.zIndex = "100";
            this.cannon_tile.style.width = TILE_SIZE_SCALED + "px";
            this.cannon_tile.style.height = TILE_SIZE_SCALED + "px";
            this.cannon_tile.style.backgroundImage = "var(--atlas-image)";
            this.cannon_tile.style.backgroundPosition = `-${17 * TILE_SIZE_SCALED} -${2 * TILE_SIZE_SCALED}`;
            // TODO: Remove magic numbers on bg atlas size
            this.cannon_tile.style.backgroundSize = `${ATLAS_IMAGE_SIZE.x / 2}px ${ATLAS_IMAGE_SIZE.y / 2}px`;
            document.body.appendChild(this.cannon_tile);
            this.current.x = this.start.x;
            this.current.y = this.start.y;
            this.cannon_tile.style.top = this.current.x + "px";
            this.cannon_tile.style.left = this.current.y + "px";
        }

        ++this.current_frame;
        if (this.current_frame > this.frame_rate)
        {
            this.current_frame = 0;
            if (this.end.x > this.start.x)
            {
                this.current.x += this.move_by;
                if (this.current.x > this.end.x) {
                    this.current.x = this.end.x;
                }
            }
            else
            {
                this.current.x -= this.move_by;
                if (this.current.x < this.end.x)
                {
                    this.current.x = this.end.x;
                }
            }
            this.cannon_tile.style.left = this.current.x + "px";
            if (this.end.y > this.start.y)
            {
                this.current.y += this.move_by;
                if (this.current.y > this.end.y)
                {
                    this.current.y = this.end.y;
                }
            }
            else
            {
                this.current.y -= this.move_by;
                if (this.current.y < this.end.y)
                {
                    this.current.y = this.end.y;
                }
            }
            this.cannon_tile.style.top = this.current.y + "px";
            if (
                this.current.x == this.end.x
                &&
                this.current.y == this.end.y
            ) {
                this.cannon_tile.remove();
                this.animated = true;
                uih.animations.splice(uih.animations.indexOf(animateOceanBattleCannon), 1);
                for (var ca = 0; ca < this.callbacks.length; ++ca)
                {
                    this.callbacks[ca]();
                }
            }
        }
    }
};
var animateOceanBattleCannonCoords = {
    type: "ocean_battle",
    render_always: false,
    add_to_viewport_world_tile: true,
    is_valid: function (x, y)
    {
        var valid = false;
        var coords = UI_OCEAN_BATTLE.data.battle.valid_cannon_coords;
        for (var i = 0; i < coords.length; i += 2)
        {
            var valid_x = coords[i];
            var valid_y = coords[i + 1];
            if (valid_x === x && valid_y === y)
            {
                valid = true;
                break;
            }
        }
        return valid;
    },
    render_html: function (world_x, world_y)
    {
        var classes = `ocean-battle-cannon-coord`;
        var onmousedown = `
        UI_OCEAN_BATTLE.setCannonsTo(
            ${world_x},
            ${world_y}
        );
        `;
        var style = `
            cursor: pointer;
            position: absolute;
            z-index: 7;
            width: ${TILE_SIZE_SCALED}px;
            height: ${TILE_SIZE_SCALED}px;
            background-image: var(--atlas-image);
            background-position: 
                -${18 * TILE_SIZE_SCALED}
                -${3 * TILE_SIZE_SCALED};
            background-size: 
                ${ATLAS_IMAGE_SIZE.x / 2}px
                ${ATLAS_IMAGE_SIZE.y / 2}px;
        `;
        var html = `
        <div
            onmousedown="${onmousedown}"
            class="${classes}"
            style="${style}"
        ></div>
        `;
        return html;
    }
};
var animateOceanBattleCannonIntendedCoords = {
    type: "ocean_battle",
    render_always: false,
    add_to_viewport_world_tile: true,
    is_valid: function (x, y)
    {
        if (
            x === UI_OCEAN_BATTLE.data.battle.intended_cannon_coords[0]
            &&
            y === UI_OCEAN_BATTLE.data.battle.intended_cannon_coords[1]
        )
        {
            return true;
        }
        return false;
    },
    render_html: function (world_x, world_y)
    {
        var classes = `ocean-battle-intended-boarding-coord`;
        var style = `
            cursor: pointer;
            position: absolute;
            z-index: 7;
            width: ${TILE_SIZE_SCALED}px;
            height: ${TILE_SIZE_SCALED}px;
            background-image: var(--atlas-image);
            background-position: 
                -${20 * TILE_SIZE_SCALED}
                -${3 * TILE_SIZE_SCALED};
            background-size: 
                ${ATLAS_IMAGE_SIZE.x / 2}px
                ${ATLAS_IMAGE_SIZE.y / 2}px;
        `;
        var html = `
        <div
            class="${classes}"
            style="${style}"
        ></div>
        `;
        return html;
    }
};
var animateOceanBattleMoveCoords = {
    type: "ocean_battle",
    render_always: false,
    add_to_viewport_world_tile: true,
    zIndex: 4,
    is_valid: function (x, y)
    {
        var valid = false;
        var coords = UI_OCEAN_BATTLE.data.battle.valid_move_coords;
        for (var i = 0; i < coords.length; i += 2)
        {
            var valid_x = coords[i];
            var valid_y = coords[i + 1];
            if (valid_x === x && valid_y === y)
            {
                valid = true;
                break;
            }
        }
        return valid;
    },
    render_html: function (world_x, world_y)
    {
        var classes = `ocean-battle-move-coord`;
        var onmousedown = `
        UI_OCEAN_BATTLE.moveWorldNPCTo(
            ${world_x},
            ${world_y}
        );
        `;
        var style = `
            cursor: pointer;
            position: absolute;
            z-index: 7;
            width: ${TILE_SIZE_SCALED}px;
            height: ${TILE_SIZE_SCALED}px;
            background-image: var(--atlas-image);
            background-position: 
                -${19 * TILE_SIZE_SCALED}
                -${3 * TILE_SIZE_SCALED};
            background-size: 
                ${ATLAS_IMAGE_SIZE.x / 2}px
                ${ATLAS_IMAGE_SIZE.y / 2}px;
        `;
        var html = `
        <div
            onmousedown="${onmousedown}"
            class="${classes}"
            style="${style}"
        ></div>
        `;
        return html;
    }
};
var animateOceanBattleMoveIntendedCoords = {
    name: "intended_move",
    type: "ocean_battle",
    add_to_viewport_world_tile: true,
    render_always: false,
    is_valid: function (x, y)
    {
        if (
            x === UI_OCEAN_BATTLE.data.battle.intended_move_coords[0]
            &&
            y === UI_OCEAN_BATTLE.data.battle.intended_move_coords[1]
        )
        {
            return true;
        }
        return false;
    },
    render_html: function (world_x, world_y)
    {
        var classes = `ocean-battle-intended-move-coord`;
        var style = `
            cursor: pointer;
            position: absolute;
            z-index: 7;
            width: ${TILE_SIZE_SCALED}px;
            height: ${TILE_SIZE_SCALED}px;
            background-image: var(--atlas-image);
            background-position: 
                -${24 * TILE_SIZE_SCALED}
                -${3 * TILE_SIZE_SCALED};
            background-size: 
                ${ATLAS_IMAGE_SIZE.x / 2}px
                ${ATLAS_IMAGE_SIZE.y / 2}px;
        `;
        var html = `
        <div
            class="${classes}"
            style="${style}"
        ></div>
        `;
        return html;
    }
};
var animateOceanBattleMove = {
    type: "ocean_battle",
    name: "ocean_battle_move",
    render_always: true,
    start: {x: 0, y: 0},
    current: {x: 0, y: 0},
    end: {x: 0, y: 0},
    animated: false,
    animating: false,
    current_frame: 0,
    frame_rate: 1,
    move_by: 2,
    callbacks: [],
    reset: function ()
    {
        this.start = {x: 0, y: 0};
        this.current = {x: 0, y: 0};
        this.end = {x: 0, y: 0};
        this.animated = false;
        this.callbacks = [];
    },
    render: function ()
    {
        ++this.current_frame;
        this.animating = true;
        if (this.current_frame > this.frame_rate)
        {
            this.current_frame = 0;
            if (this.end.x > this.start.x)
            {
                this.current.x += this.move_by;
                if (this.current.x > this.end.x) {
                    this.current.x = this.end.x;
                }
            }
            else
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
            else
            {
                this.current.y -= this.move_by;
                if (this.current.y < this.end.y)
                {
                    this.current.y = this.end.y;
                }
            }
            if (
                this.current.x == this.end.x
                &&
                this.current.y == this.end.y
            ) {
                this.animating = false;
                this.animated = true;
                uih.animations.splice(uih.animations.indexOf(animateOceanBattleMove), 1);
                for (var ca = 0; ca < this.callbacks.length; ++ca)
                {
                    this.callbacks[ca]();
                }
            }
        }
    }
};
var animateOceanBattleBoardingCoords = {
    type: "ocean_battle",
    render_always: false,
    add_to_viewport_world_tile: true,
    is_valid: function (x, y)
    {
        var valid = false;
        var coords = UI_OCEAN_BATTLE.data.battle.valid_boarding_coords;
        for (var i = 0; i < coords.length; i += 2)
        {
            var valid_x = coords[i];
            var valid_y = coords[i + 1];
            if (valid_x === x && valid_y === y)
            {
                valid = true;
                break;
            }
        }
        return valid;
    },
    render_html: function (world_x, world_y)
    {
        var classes = `ocean-battle-boarding-coord`;
        var onmousedown = `
        UI_OCEAN_BATTLE.setBoardingTo(
            ${world_x},
            ${world_y}
        );
        `;
        var style = `
            cursor: pointer;
            position: absolute;
            z-index: 7;
            width: ${TILE_SIZE_SCALED}px;
            height: ${TILE_SIZE_SCALED}px;
            background-image: var(--atlas-image);
            background-position: 
                -${18 * TILE_SIZE_SCALED}
                -${3 * TILE_SIZE_SCALED};
            background-size: 
                ${ATLAS_IMAGE_SIZE.x / 2}px
                ${ATLAS_IMAGE_SIZE.y / 2}px;
        `;
        var html = `
        <div
            onmousedown="${onmousedown}"
            class="${classes}"
            style="${style}"
        ></div>
        `;
        return html;
    }
};
var animateOceanBattleBoardingIntendedCoords = {
    type: "ocean_battle",
    render_always: false,
    add_to_viewport_world_tile: true,
    is_valid: function (x, y)
    {
        if (
            x === UI_OCEAN_BATTLE.data.battle.intended_boarding_coords[0]
            &&
            y === UI_OCEAN_BATTLE.data.battle.intended_boarding_coords[1]
        )
        {
            return true;
        }
        return false;
    },
    render_html: function (world_x, world_y)
    {
        var classes = `ocean-battle-intended-boarding-coord`;
        var style = `
            cursor: pointer;
            position: absolute;
            z-index: 7;
            width: ${TILE_SIZE_SCALED}px;
            height: ${TILE_SIZE_SCALED}px;
            background-image: var(--atlas-image);
            background-position: 
                -${20 * TILE_SIZE_SCALED}
                -${3 * TILE_SIZE_SCALED};
            background-size: 
                ${ATLAS_IMAGE_SIZE.x / 2}px
                ${ATLAS_IMAGE_SIZE.y / 2}px;
        `;
        var html = `
        <div
            class="${classes}"
            style="${style}"
        ></div>
        `;
        return html;
    }
};
var animateOceanBattleBoarding = {
    type: "ocean_battle",
    start: {x: 0, y: 0},
    current: {x: 0, y: 0},
    end: {x: 0, y: 0},
    animated: false,
    current_frame: 0,
    frame_rate: 1,
    move_by: 2,
    render_always: true,
    boarding_tile: null,
    callbacks: [],
    reset: function ()
    {
        if (this.boarding_tile !== null)
        {
            this.boarding_tile.remove();
            this.boarding_tile = null;
        }
        this.start = {x: 0, y: 0};
        this.current = {x: 0, y: 0};
        this.end = {x: 0, y: 0};
        this.animated = false;
        this.callbacks = [];
    },
    render: function ()
    {
        if (this.boarding_tile === null)
        {
            this.boarding_tile = document.createElement('div');
            this.boarding_tile.id = "boarding_tile";
            this.boarding_tile.style.position = "absolute";
            this.boarding_tile.style.zIndex = "100";
            this.boarding_tile.style.width = TILE_SIZE_SCALED + "px";
            this.boarding_tile.style.height = TILE_SIZE_SCALED + "px";
            this.boarding_tile.style.backgroundImage = "var(--atlas-image)";
            this.boarding_tile.style.backgroundPosition = `-${15 * TILE_SIZE_SCALED} -${2 * TILE_SIZE_SCALED}`;
            // TODO: Remove magic numbers on bg atlas size
            this.boarding_tile.style.backgroundSize = `${ATLAS_IMAGE_SIZE.x / 2}px ${ATLAS_IMAGE_SIZE.y / 2}px`;
            document.body.appendChild(this.boarding_tile);
            this.current.x = this.start.x;
            this.current.y = this.start.y;
            this.boarding_tile.style.top = this.current.x + "px";
            this.boarding_tile.style.left = this.current.y + "px";
        }

        ++this.current_frame;
        if (this.current_frame > this.frame_rate)
        {
            this.current_frame = 0;
            if (this.end.x > this.start.x)
            {
                this.current.x += this.move_by;
                if (this.current.x > this.end.x) {
                    this.current.x = this.end.x;
                }
            }
            else
            {
                this.current.x -= this.move_by;
                if (this.current.x < this.end.x)
                {
                    this.current.x = this.end.x;
                }
            }
            this.boarding_tile.style.left = this.current.x + "px";
            if (this.end.y > this.start.y)
            {
                this.current.y += this.move_by;
                if (this.current.y > this.end.y)
                {
                    this.current.y = this.end.y;
                }
            }
            else
            {
                this.current.y -= this.move_by;
                if (this.current.y < this.end.y)
                {
                    this.current.y = this.end.y;
                }
            }
            this.boarding_tile.style.top = this.current.y + "px";
            if (
                this.current.x == this.end.x
                &&
                this.current.y == this.end.y
            ) {
                this.boarding_tile.remove();
                this.animated = true;
                uih.animations.splice(uih.animations.indexOf(animateOceanBattleBoarding), 1);
                for (var ca = 0; ca < this.callbacks.length; ++ca)
                {
                    this.callbacks[ca]();
                }
            }
        }
    }
};