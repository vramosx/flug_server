function Log () {}

Log.info = (_class, _method, _message) => {
    console.log(`[ FlugServer ${new Date()} ] ${_class}.${_method} - INFO: ${_message}`);
}

Log.error = (_class, _method, _message) => {
    console.log(`[ FlugServer ${new Date()} ] ${_class}.${_method} - ERROR: ${_message}`);
}

Log.warn = (_class, _method, _message) => {
    console.log(`[ FlugServer ${new Date()} ] ${_class}.${_method} - WARN: ${_message}`);
}

Log.connecting = (_name) => {
    console.log(`[ FlugServer ${new Date()} ] ${_name} CONNECTING...`);
}

Log.connected = (_name) => {
    console.log(`[ FlugServer ${new Date()} ] ${_name} CONNECTED.`);
}

Log.starting = (_name) => {
    console.log(`[ FlugServer ${new Date()} ] ${_name} STARTING`);
}

Log.started = (_name) => {
    console.log(`[ FlugServer ${new Date()} ] ${_name} STARTED.`);
}

module.exports = Log;