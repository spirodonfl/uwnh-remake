var INPUT_SERVER = {
    input_mode: "keyboard",
    history_id: 0,
    buttons: [
        "up", "down", "left", "right",
        "a", "b", "x", "y",
        "l1", "l2", "r1", "r2",
        "select", "start",
    ],
    keyboard_to_buttons: {
        "KeyW": "up",
        "KeyS": "down",
        "KeyA": "left",
        "KeyD": "right",
        "KeyZ": "a",
        "KeyX": "b",
        "KeyC": "x",
        "KeyV": "y",
        "KeyQ": "l1",
        "KeyE": "r1",
        "KeyR": "l2",
        "KeyF": "r2",
        "Space": "select",
        "KeyT": "start",
    },
    current_state:
    {
        mouse:
        {
            down: false,
            x: 0,
            y: 0,
            button: null,
            composed_path: [],
        }
    },
    keyboard:
    {
        keys: {},
    },
    gamepad:
    {
        buttons: {},
        axes: {},
    },
    history: [],
    listener_names: [],
    listener_funcs: [],
    addListener: function (name, func)
    {
        for (var i = 0; i < this.listener_names.length; ++i)
        {
            if (this.listener_names[i] === name)
            {
                return null;
            }
        }
        var id = this.listener_names.length;
        this.listener_names.push(name);
        this.listener_funcs.push(func);
        return id;
    },
    removeListener: function (name)
    {
        for (var i = (this.listener_names.length - 1); i >= 0; --i)
        {
            if (this.listener_names[i] === name)
            {
                this.listener_names.splice(i, 1);
                this.listener_funcs.splice(i, 1);
            }
        }
    },

    listen: function ()
    {
        var self = INPUT_SERVER;
        document.addEventListener("pointerdown", function (event)
        {
            if (self.input_mode !== "mouse")
            {
                self.input_mode = "mouse";
            }
            self.current_state.mouse.down = true;
            self.current_state.mouse.x = event.clientX;
            self.current_state.mouse.y = event.clientY;
            self.current_state.mouse.button = event.button;
            self.current_state.mouse.composed_path = event.composedPath();
            self.logHistory("pointerdown", event);
            for (var i = 0; i < self.listener_funcs.length; ++i)
            {
                self.listener_funcs[i]();
            }
        });
        document.addEventListener("pointerup", function (event)
        {
            if (self.input_mode !== "mouse")
            {
                self.input_mode = "mouse";
            }
            self.current_state.mouse.down = false;
            self.current_state.mouse.x = event.clientX;
            self.current_state.mouse.y = event.clientY;
            self.current_state.mouse.button = event.button;
            self.current_state.mouse.composed_path = event.composedPath();
            self.logHistory("pointerup", event);
            for (var i = 0; i < self.listener_funcs.length; ++i)
            {
                self.listener_funcs[i]();
            }
        });
        document.addEventListener("pointermove", function (event)
        {
            if (self.input_mode !== "mouse")
            {
                self.input_mode = "mouse";
            }
            self.current_state.mouse.x = event.clientX;
            self.current_state.mouse.y = event.clientY;
            self.current_state.mouse.button = event.button;
            self.current_state.mouse.composed_path = event.composedPath();
            self.current_state.mouse.viewport = null;
            for (var c = 0; c < self.current_state.mouse.composed_path.length; ++c)
            {
                var element = self.current_state.mouse.composed_path[c];
                if (element.id === "viewport")
                {
                    self.current_state.mouse.viewport = viewportConvertEvent(event);
                }
            }
            for (var x = 0; x < self.history.length; ++x)
            {
                if (self.history[x].type === "pointermove")
                {
                    self.history.splice(x, 1);
                }
            }
            self.logHistory("pointermove", event);
            for (var i = 0; i < self.listener_funcs.length; ++i)
            {
                self.listener_funcs[i]();
            }
        });
        document.addEventListener("keydown", function (event)
        {
            if (self.input_mode !== "keyboard")
            {
                self.input_mode = "keyboard";
            }
            self.keyboard.keys[event.code] = true;
            self.logHistory("keydown", event);
            for (var i = 0; i < self.listener_funcs.length; ++i)
            {
                self.listener_funcs[i]();
            }
        });
        document.addEventListener("keyup", function (event)
        {
            if (self.input_mode !== "keyboard")
            {
                self.input_mode = "keyboard";
            }
            self.keyboard.keys[event.code] = false;
            self.logHistory("keyup", event);
            for (var i = 0; i < self.listener_funcs.length; ++i)
            {
                self.listener_funcs[i]();
            }
        });
    },
    logHistory: function (type, event)
    {
        // Convert event to a button
        var button = null;
        if (this.input_mode === "mouse" && this.current_state.mouse.down)
        {
            button = "a";
        }
        else if (this.input_mode === "keyboard")
        {
            button = this.keyboard_to_buttons[event.code];

            if (type === "keydown" && event.code === "ControlLeft")
            {
                ctrl_down = true;
            }
            else if (type === "keyup" && event.code === "ControlLeft")
            {
                ctrl_down = false;
            }

            if (type === "keydown")
            {
                switch (event.code)
                {
                    case "KeyA":
                        wasm.exports.user_input_left();
                        break;
                    case "KeyD":
                        wasm.exports.user_input_right();
                        break;
                    case "KeyW":
                        wasm.exports.user_input_up();
                        break;
                    case "KeyS":
                        wasm.exports.user_input_down();
                        break;
                    case "KeyZ":
                        wasm.exports.user_input_a();
                        break;
                    case "KeyX":
                        wasm.exports.user_input_b();
                        break;
                    case "KeyC":
                        wasm.exports.user_input_x();
                        break;
                    case "KeyV":
                        wasm.exports.user_input_y();
                        break;
                    case "KeyQ":
                        wasm.exports.user_input_left_bumper();
                        break;
                    case "KeyE":
                        wasm.exports.user_input_right_bumper();
                        break;
                    case "KeyT":
                        wasm.exports.user_input_start();
                        break;
                    case "KeyG":
                        wasm.exports.user_input_select();
                        break;
                    case "KeyI":
                        CAMERA.moveUp();
                        break;
                    case "KeyK":
                        CAMERA.moveDown();
                        break;
                    case "KeyJ":
                        CAMERA.moveLeft();
                        break;
                    case "KeyL":
                        CAMERA.moveRight();
                        break;
                    case "KeyP":
                        RAF.togglePause();
                        break;
                    case "KeyF":
                        var sailing = GAME_STRINGS.indexOf("GAME_MODE_SAILING");
                        if (gh.current.game_mode === sailing)
                        {
                            document.querySelector("ui-sailing-menu").initialize();
                        }
                        break;
                    default:
                        break;
                }
            }
        }
        else if (this.input_mode === "gamepad")
        {
            // TODO: This
        }
        this.history.push({
            type: type,
            event: event,
            button: button,
            history_id: this.history_id,
            mouse: {
                down: this.current_state.mouse.down,
                x: this.current_state.mouse.x,
                y: this.current_state.mouse.y,
                button: this.current_state.mouse.button,
                composed_path: this.current_state.mouse.composed_path,
                viewport: this.current_state.mouse.viewport,
            },
            keyboard: {
                keys: this.keyboard.keys,
            },
        });
        ++this.history_id;
        if (this.history_id > 1000000)
        {
            this.history_id = 0;
            // Reset all history starting with 0
            for (var i = 0; i < this.history.length; ++i)
            {
                this.history[i].history_id = i;
                this.history_id = i + 1;
            }
        }
        if (this.history.length > 300)
        {
            this.history.shift();
        }
    },
    updateGamePad: function ()
    {
        var gamepad = navigator.getGamepads()[0];
        if (!gamepad) { return; }
        for (var i = 0; i < gamepad.buttons.length; ++i)
        {
            this.gamepad.buttons[i] = gamepad.buttons[i].pressed;
        }
        for (var i = 0; i < gamepad.axes.length; ++i)
        {
            this.gamepad.axes[i] = gamepad.axes[i];
        }
    },

    clearHistory: function ()
    {
        this.history = [];
    },
    getLatestEntry: function ()
    {
        if (this.history.length === 0) { return null; }
        return this.history[this.history.length - 1];
    },
    getHistory: function (since)
    {
        return this.history.slice(since);
    },
    getHistoryAfterIteration: function (iteration)
    {
        for (var i = 0; i < this.history.length; ++i)
        {
            if (this.history[i].history_id > iteration)
            {
                return this.history.slice(i);
            }
        }
        return [];
    },
    getLastEntryByType: function (type, iteration)
    {
        for (var i = this.history.length - 1; i >= 0; --i)
        {
            if (
                this.history[i].type === type
                &&
                (
                    !iteration
                    ||
                    this.history[i].history_id > iteration
                )
            )
            {
                return this.history[i];
            }
        }
        return null;
    },
    getLastEntryByButton: function (button, iteration)
    {
        for (var i = this.history.length - 1; i >= 0; --i)
        {
            if (
                this.history[i].button === button
                &&
                (
                    !iteration
                    ||
                    this.history[i].history_id > iteration
                )
            )
            {
                return this.history[i];
            }
        }
        return null;
    },
    isTagInComposedPath: function (composed_path, tag_name)
    {
        for (var i = 0; i < composed_path.length; ++i)
        {
            if (composed_path[i].tagName === tag_name)
            {
                return i;
            }
        }
        return false;
    },
    isDataIDInComposedPath: function (composed_path, id)
    {
        // Note: To skip the last entry which is "window"
        var max = composed_path.length - 2;
        for (var i = 0; i < max; ++i)
        {
            if (!composed_path[i] instanceof HTMLElement) { continue; }
            if (!composed_path[i].hasAttribute("data-id")) { continue; }
            if (composed_path[i].getAttribute("data-id") === id)
            {
                return i;
            }
        }
        return false;
    },
};