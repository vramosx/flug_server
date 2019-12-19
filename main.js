const MONGO_URI = 'mongodb://localhost:27017';
const API_VERSION = 'v1.0';
const API_PORT = 8080;
const ENABLE_SIGNUP = true;
var FlugServer = require('./flug-server');
var Log = require('./log');

(async () => {
    Log.connecting('Mongo Database')
    let databaseStarted = await FlugServer.startDatabase(MONGO_URI);
    if(databaseStarted) Log.connected('Mongo Database'); else return;
    Log.starting('REST API');
    let apiStarted = await FlugServer.startAPI(API_VERSION, API_PORT, ENABLE_SIGNUP);
    if(apiStarted) Log.started('REST API');
})();