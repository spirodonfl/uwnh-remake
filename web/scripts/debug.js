class ClassDebug {
    constructor() {
        if (ClassDebug.instance) {
            return Debug.instance;
        }
        ClassDebug.instance = this;
    }
    init() {
        this.maxMessages = 30;
        this.debug = true;
        this.messages = {
            'debug': [],
            'info': [],
            'warning': [],
            'error': [],
            'breakpoint': []
        };
    }
    enableDebug() {
        this.debug = true;
    }
    disableDebug() {
        this.debug = false;
    }
    log(message, type) {
        type = type || 'debug';
        if (!this.messages[type]) {
            this.messages[type] = [];
        }
        this.messages[type].push(message);
        if (this.messages[type].length > this.maxMessages) {
            this.messages[type].shift();
        }
        if (this.debug) {
            console.log(message);
        }
    }
    breakpoint(message) {
        this.messages['breakpoint'].push(message);
        if (this.messages['breakpoint'].length > this.maxMessages) {
            this.messages['breakpoint'].shift();
        }
        if (this.debug) {
            console.log(message);
        }
        debugger;
    }
}
const Debug = new ClassDebug();
export { Debug };
