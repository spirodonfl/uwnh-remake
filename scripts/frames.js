export const FRAMES = {
    frameCallbacks: [],
    addRunOnFrames: function (frames, clearOnRun, callback) {
        for (var i = 0; i < this.frameCallbacks.length; ++i) {
            if (this.frameCallbacks[i] === false) {
                this.frameCallbacks[i] = [0, frames, callback, clearOnRun];
                return i;
            }
        }
        this.frameCallbacks.push([0, frames, callback, clearOnRun]);
        return this.frameCallbacks.length - 1;
    },
    removeRunOnFrames: function (index) {
        this.frameCallbacks[i] = false;
    },
    runOnFrames: function () {
        for (let i = 0; i < this.frameCallbacks.length; ++i) {
            if (this.frameCallbacks[i] === false) {
                continue;
            }
            ++this.frameCallbacks[i][0];
            if (this.frameCallbacks[i][0] === this.frameCallbacks[i][1]) {
                this.frameCallbacks[i][0] = 0;
                var cb = this.frameCallbacks[i][2];
                if (this.frameCallbacks[i][3] === true) {
                    this.frameCallbacks[i] = false;
                }
                // this.frameCallbacks[i][2]();
                cb();
                // if (this.frameCallbacks[i][3] === true) {
                //     this.frameCallbacks[i] = false;
                // }
            }
        }
    },
}