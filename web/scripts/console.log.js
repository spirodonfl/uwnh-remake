(function(){
    var oldLog = console.log;
    console.log = function (message) {
        if (EDITOR) {
            var message_as_text = JSON.stringify(message);
            // if (editor_console && (message_as_text.search("panic:") || message_as_text.search("info:"))) {
            //     message_as_text = JSON.stringify(message) + '\n';
            //     message_as_text += JSON.stringify(arguments) + '\n';
            //     message_as_text += '\n';
            // }
            EDITOR.addLog(message_as_text);
        }
        oldLog.apply(console, arguments);
    };
})();
