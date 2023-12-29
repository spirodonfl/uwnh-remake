window.addEventListener('keyup', function (evt) {
    if (GAME && GAME.moveEntity) {
        console.log(evt);
        if (evt.code === 'KeyW') {
            // UP
            GAME.moveEntity(0, 2);
        } else if (evt.code === 'KeyS') {
            // DOWN
            GAME.moveEntity(0, 3);
        } else if (evt.code === 'KeyA') {
            // LEFT
            GAME.moveEntity(0, 0);
        } else if (evt.code === 'KeyD') {
            // RIGHT
            GAME.moveEntity(0, 1);
        } else if (evt.code === 'Space') {
            GAME.attackEntity(0, 1);
        } else if (evt.code === 'KeyQ') {
            if (MENUS) {
                MENUS.toggle('fullscreen');
            }
        } else if (evt.code === 'ArrowUp') {
            GAME.camera_offset.y -= 1;
            GAME.setCameraPosition(GAME.camera_offset.x, GAME.camera_offset.y);
        } else if (evt.code === 'ArrowDown') {
            GAME.camera_offset.y += 1;
            GAME.setCameraPosition(GAME.camera_offset.x, GAME.camera_offset.y);
        } else if (evt.code === 'ArrowLeft') {
            GAME.camera_offset.x -= 1;
            GAME.setCameraPosition(GAME.camera_offset.x, GAME.camera_offset.y);
        } else if (evt.code === 'ArrowRight') {
            GAME.camera_offset.x += 1;
            GAME.setCameraPosition(GAME.camera_offset.x, GAME.camera_offset.y);
        }
    }
});
