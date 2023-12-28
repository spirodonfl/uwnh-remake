window.addEventListener('keyup', function (evt) {
    if (GAME && GAME.moveEntity) {
        if (evt.key === 'w') {
            // UP
            GAME.moveEntity(0, 2);
        } else if (evt.key === 's') {
            // DOWN
            GAME.moveEntity(0, 3);
        } else if (evt.key === 'a') {
            // LEFT
            GAME.moveEntity(0, 0);
        } else if (evt.key === 'd') {
            // RIGHT
            GAME.moveEntity(0, 1);
        } else if (evt.code === 'Space') {
            GAME.attackEntity(0, 1);
        }
    }
});
