<group name="*"></group>

# Canvas drawing

I suppose it's something like
- take width of map
- take height of map
- divide by 32
- that's how many tiles there

Alternative: just supply tiles and fill in any missing spots

## Dynamic sizing

TODO

Have to sort this out. Essentially, you want to draw only what's inside the screen at any given moment. How do you do this?

- Have to determine screen size
- Have to determine viewport (position x & y min/max that are viewable)
- Draw only those tiles
- On positional update, update min/max viewport

However, do not, the above may only be necessary for things like NPCs. For static maps or tiles you can just load the map onto the page and scroll the canvas accordingly.

At a certain size (small, not large) you will have to scale the minimum required canvas size down with CSS. Why? Think about something like a menu or a dialogue box. You cannot really dynamically resize that below a certain point without losing a lot of stuff. On bigger sizes you can just center and pad but on smaller, it probably just makes sense to scale the entire canvas down.

Therefore, it might actually be good to start with the minimum canvas size and work upwards from there.

## HTML

You just need some basic HTML to get started

<block name="html_output"></block>
``` html
<html>
    <head>
        <title>TEST</title>
    </head>
    <body>
        <canvas id="grid"></canvas>
        <canvas id="main"></canvas>
        <canvas id="text"></canvas>
        <script style="text/javascript">
            {{{js_output}}}
        </script>
        <style type="text/css">
            {{{css_output}}}
        </style>
    </body>
</html>
```

## Canvas CSS Layering

We want two canvases right now. One is the grid. The other is the main one where we move around. We want the grid to be consistent so we put it "below" the main one. We use z-indexing to do that for now.

<variable name="css_output" block="css_output"></variable>
<block name="css_output"></block>
``` cpp
canvas#grid {
    z-index: 0;
    position: absolute;
    top: 0;
    left: 0;
}
canvas#main {
    z-index: 1;
    position: absolute;
    top: 0;
    left: 0;
}
canvas#text {
    z-index: 2;
    position: absolute;
    top: 0;
    left: 0;    
}
```

## Javascript

<variable name="js_output" block="js_output"></variable>
<block name="js_output"></block>
``` javascript
{{{get_canvas}}}
{{{get_context}}}
{{{draw_on_canvas}}}
{{{draw_position_on_canvas}}}
{{{keyboard_position_canvas_test}}}
```

## Canvas Layers

Right now we want a main layer where our positional/movements are drawn.

We also want a grid, underneath, so we can visualize the map in 32x32 squares.

Other layers we probably want:

- a HUD layer
- a dialogue layer (for dialogue boxes)
- a menu layer

Probably in that order.

Get canvas elements first.

<variable name="get_canvas" block="get_canvas"></variable>
<block name="get_canvas"></block>
``` javascript
var canvas = {
    main: document.getElementById('main'),
    grid: document.getElementById('grid'),
    text: document.getElementById('text')
}
```

Then get the context which is just 2d

<variable name="get_context" block="get_context"></variable>
<block name="get_context"></block>
``` javascript
var context = {
    main: canvas.main.getContext('2d'),
    grid: canvas.grid.getContext('2d'),
    text: canvas.text.getContext('2d')
}
```

Then draw. First we set a color. Then we use `fillRect(x, y, width, height)`.

<variable name="draw_on_canvas" block="draw_on_canvas"></variable>
<block name="draw_on_canvas"></block>
``` javascript
var width = 30;
var height = 30;

canvas.main.width = width * 32;
canvas.main.height = height * 32;
canvas.grid.width = width * 32;
canvas.grid.height = height * 32;

context.grid.strokeStyle = 'rgb(150, 0, 0)';

for (var y = 0; y < height; ++y) {
    for (var x = 0; x < width; ++x) {
        context.grid.strokeRect((x * 32), (y * 32), 32, 32);
    }
}
{{{draw_text}}}
```

For this text, we use `fillText(txt, x, y, maxWidth)`

<variable name="draw_text" block="draw_text"></variable>
<block name="draw_text"></block>
``` javascript
canvas.text.width = 16 * 32;
canvas.text.height = 5 * 32;
context.text.fillStyle = 'rgba(255, 255, 255, 0.8)';
context.text.fillRect(0, 0, (16 * 32), (5 * 32));
context.text.fillStyle = 'rgb(0, 0, 0)';
context.text.font = '16px Verdana';
context.text.fillText('Test me out. I am a text... How far can I go?', (1 * 32), (1 * 32) + 14, (14 * 32));
context.text.fillText('Let us see. Muahahahahahahahaha', (1 * 32), (2 * 32) + 14, (14 * 32));
```

If we want to draw in a specific spot, say like a players position, we should be able to pass an x,y combo and fill it. Let's try.

<variable name="draw_position_on_canvas" block="draw_position_on_canvas"></variable>
<block name="draw_position_on_canvas"></block>
``` javascript
var position = {x: 2, y: 2};
context.main.fillStyle = 'rgba(0, 0, 0, 0.5)';
context.main.fillRect((position.x * 32), (position.y * 32), 32, 32);
```

If I want to move this around with my keyboard... Let's try.

Ideally, we want to keep the previous position in memory so we can clear it to make way for updates. We'll do a shallow copy with `Object.create` to a new position and then merge the new position onto the "in memory" one at the end.

We also do not want our position to exceed the min/max of the map width/height so we try to manage this too.

<variable name="keyboard_position_canvas_test" block="keyboard_position_canvas_test"></variable>
<block name="keyboard_position_canvas_test"></block>
``` javascript
window.addEventListener('keyup', function (evt) {
    var newPosition = Object.create(position);
    if (evt.key === 'ArrowDown') {
        newPosition.y += 1;
        if (newPosition.y > (height - 1)) {
            newPosition.y = (height - 1);
        }
    } else if (evt.key === 'ArrowUp') {
        newPosition.y -= 1;
        if (newPosition.y < 0) {
            newPosition.y = 0;
        }
    } else if (evt.key === 'ArrowRight') {
        newPosition.x += 1;
        if (newPosition.x > (width - 1)) {
            newPosition.x = (width - 1);
        }
    } else if (evt.key === 'ArrowLeft') {
        newPosition.x -= 1;
        if (newPosition.x < 0) {
            newPosition.x = 0;
        }
    }
    if (newPosition.x !== position.x || newPosition.y !== position.y) {
        context.main.clearRect((position.x * 32), (position.y * 32), 32, 32);
        context.main.fillStyle = 'rgba(0, 0, 0, 0.5)';
        context.main.fillRect((newPosition.x * 32), (newPosition.y * 32), 32, 32);
        position = newPosition;
    }
});
```