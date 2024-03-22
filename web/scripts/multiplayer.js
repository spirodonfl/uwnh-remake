class ClassMultiplayer {
    constructor() {
        if (ClassMultiplayer.instance) {
            return Multiplayer.instance;
        }
        ClassMultiplayer.instance = this;
    }
};

const Multiplayer = new ClassMultiplayer();
export { Multiplayer };
