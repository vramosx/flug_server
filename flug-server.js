var Log = require('./log');
var FlugAPI = require("./flug-api");

function FlugServer () {}
const className = 'FlugServer';

const restify = require('restify');
const MongoClient = require('mongodb').MongoClient;

FlugServer.mongoClient = undefined;
FlugServer.api = undefined;

FlugServer.startDatabase = async (mongoURI, useNewUrlParser = false) => {
    try
    {
        const client = new MongoClient(mongoURI, { useNewUrlParser: useNewUrlParser });

        FlugServer.mongoClient = await client.connect();
        return true;
    }
    catch(ex) {
        Log.error(className, 'startDatabase', ex);
        return false;
    }
}

FlugServer.startAPI = async (apiVersion = '1.0', _port = 8080) => {
    try
    {
        FlugServer.api = FlugAPI(FlugServer);
        await FlugServer.api.init(apiVersion, _port);

        return true;
    }
    catch(ex) {
        Log.error(className, 'startAPI', ex);
        return false;
    }
}

module.exports = FlugServer;