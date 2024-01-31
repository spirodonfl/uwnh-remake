(function(){
    var oldLog = console.log;
    console.log = function (message) {
        // textarea
        var editor_console = document.getElementById('editor_console');
        var message_as_text = JSON.stringify(message);
        if (editor_console && (message_as_text.search("panic:") || message_as_text.search("info:"))) {
            editor_console.innerHTML += JSON.stringify(message) + '\n';
            editor_console.innerHTML += JSON.stringify(arguments) + '\n';
            editor_console.innerHTML += '\n';
        }
        oldLog.apply(console, arguments);
    };
})();
