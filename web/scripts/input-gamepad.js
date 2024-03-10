// const gamepads = navigator.getGamepads();
// for (const gp of gamepads) {
// gp.buttons
// gamepadInfo.textContent = `Gamepad connected at index ${gp.index}: ${gp.id}. It has ${gp.buttons.length} buttons and ${gp.axes.length} axes.`;
// }

// xbox 360 controller elite
// buttons[9] === start
// buttons[8] === select
// buttons[3] === Y
// buttons[2] === X
// buttons[1] === B
// buttons[0] === A
// buttons[12] === up
// buttons[13] === down
// buttons[14] === left
// buttons[15] === right
// buttons[4] === left bumper
// buttons[5] === right bumper
// buttons[6] === left trigger
// buttons[7] === right trigger

window.addEventListener("gamepadconnected", (e) => {
    console.log(
        "Gamepad connected at index %d: %s. %d buttons, %d axes.",
        e.gamepad.index,
        e.gamepad.id,
        e.gamepad.buttons.length,
        e.gamepad.axes.length,
    );
});
window.addEventListener("gamepaddisconnected", (e) => {
    console.log(
        "Gamepad connected at index %d: %s. %d buttons, %d axes.",
        e.gamepad.index,
        e.gamepad.id,
        e.gamepad.buttons.length,
        e.gamepad.axes.length,
    );
});

function handleGamepadInput(buttonIndex, isPressed) {
    // Handle gamepad input based on button index and press state
    if (isPressed) {
        console.log("Button " + buttonIndex + " pressed!");
        // Perform an action based on the pressed button
    } else {
        console.log("Button " + buttonIndex + " released!");
        // Perform an action based on the released button
    }
}

function updateGamepad() {
    var gamepads = navigator.getGamepads();
    for (var i = 0; i < gamepads.length; i++) {
        var gamepad = gamepads[i];
        if (gamepad) {
            // Access gamepad properties like buttons and axes
            var buttons = gamepad.buttons;
            var axes = gamepad.axes;

            // you can use buttons[i].pressed and buttons[i].touched
            // axes is just an array of floating point values from -1 to 1, length of 4

            // Example: Log button and axis values
            // console.log("Button 0: " + buttons[0].value);
            // console.log("Axis 0: " + axes[0]);

            for (var i = 0; i < buttons.length; i++) {
                if (buttons[i].pressed) {
                    console.log('button', [i, buttons[i]]);
                }
                // handleGamepadInput(i, buttons[i].pressed);
            } 
        }
    }

    // Schedule the next update
    requestAnimationFrame(updateGamepad);
}

// Start listening to gamepad input
updateGamepad();


/**
0
: 
GamepadButton
pressed
: 
false
touched
: 
false
value
: 
0
**/
