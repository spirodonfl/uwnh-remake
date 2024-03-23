import { RyansBackendMainHole } from './websockets/ryans_backend_main_hole.js';
import { Multiplayer } from './multiplayer.js';

class ClassMultiplayerHost extends Multiplayer {
    constructor() {
        if (ClassMultiplayerHost.instance) {
            return MultiplayerHost.instance;
        }
        ClassMultiplayerHost.instance = this;
    }
    init() {
        super.init();
    }
    setRole(email, channel, roles) {
        if (email === undefined || channel === undefined || roles === undefined) {
            console.log('email, channel, and roles are required');
            return;
        }
        if (!Array.isArray(roles)) {
            console.log('roles must be an array');
            return;
        }
        RyansBackendMainHole.ws.send(JSON.stringify({
            set_roles: {
                email: email,
                channel: channel,
                roles: roles
            }
        }));
    }
};

const MultiplayerHost = new ClassMultiplayerHost();
export { MultiplayerHost };

