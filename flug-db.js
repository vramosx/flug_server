var FlugServer = require("./flug-server");
var Log = require("./log");
var ObjectID = require('mongodb').ObjectID;
var { cryptPassword, comparePassword, generateAppKey } = require('./utils');

module.exports = FlugDB = (flugServer) => {
    this.className = 'FlugDB';
    this.ERCollection = 'errorReport';
    this.BRCollection = 'bugReport';
    this.UserCollection = 'user';
    this.AppCollection = 'app';
    this.InviteCollection = 'invite';

    this.init = () => {
        this.db = flugServer.mongoClient.db(this.className);
    }

    this.checkUserExist = async (username) => {
        try {
            let nUser = await this.db.collection(this.UserCollection).findOne({
                username: username.toLowerCase()
            })

            if(nUser) {
                Log.info(this.className, 'checkUserExist', `User ${username} already exists!`);
                return true;
            } 
            
            return false;
        } catch (ex) {
            Log.error(this.className, 'checkUserExist', ex);
            throw ex;
        }
    }

    this.createInvite = async (invite) => {
        try {
            invite.createdAt = new Date();
            let nInvite =  await this.db.collection(this.InviteCollection).insertOne(invite);
            Log.info(this.className, 'createInvite', 'Invite created.');
            return true;
        } catch (ex) {
            Log.error(this.className, 'createInvite', ex);
            throw ex;
        }
    }

    this.registerUserWithInvite = async (userInvite) => {
        try {
            let inviteCollection = this.db.collection(this.InviteCollection);
            let nInvite = await inviteCollection.findOne({
                inviteCode: userInvite.inviteCode
            });

            if(nInvite.unlimited) {
                userInvite.createdAt = new Date();
                userInvite.username = userInvite.username.toLowerCase();
                userInvite.password = await cryptPassword(userInvite.password);
                userInvite.appKeys = [ nInvite.appKey ];
                userInvite.admin = false;
                let nUser =  await this.db.collection(this.UserCollection).insertOne(userInvite);
                Log.info(this.className, 'registerUserWithInvite', 'User created.');
                return true;
            } else if(!nInvite.alreadyUsed) {
                await inviteCollection.updateOne({
                    "_id": new ObjectID(nInvite._id)
                }, { $set: { "alreadyUsed": true } });

                userInvite.createdAt = new Date();
                userInvite.username = userInvite.username.toLowerCase();
                userInvite.password = await cryptPassword(userInvite.password);
                userInvite.appKeys = [ nInvite.appKey ];
                userInvite.admin = false;
                let nUser =  await this.db.collection(this.UserCollection).insertOne(userInvite);
                Log.info(this.className, 'registerUserWithInvite', 'User created.');
                return true;
            }
            return false;
        } catch (ex) {
            Log.error(this.className, 'registerUserWithInvite', ex);
            throw ex;
        }
    }

    this.registerUser = async (user) => {
        try {
            user.createdAt = new Date();
            user.username = user.username.toLowerCase();
            user.password = await cryptPassword(user.password);
            let nUser =  await this.db.collection(this.UserCollection).insertOne(user);
            Log.info(this.className, 'registerUser', 'User registered.');
            return true;
        } catch (ex) {
            Log.error(this.className, 'registerUser', ex);
            throw ex;
        }
    }

    this.loginUser = async (user) => {
        let nUser =  await this.db.collection(this.UserCollection).findOne({
            username: user.username.toLowerCase()
        });

        if(nUser) {
            let match = await comparePassword(user.password, nUser.password);
            if(match) {
                nUser.password = null;
                return nUser;
            }
        }
        return null;
    }

    this.registerApp = async (app, userId) => {
        try {
            app.createdAt = new Date();
            app.appKey = generateAppKey();

            let userCollection = this.db.collection(this.UserCollection);

            let user = await userCollection.findOne({
                _id: new ObjectID(userId)
            })

            // ADD APPKEY TO USER APPKEYS
            let nAppKeys = [];
            if(user.appKeys) {
                nAppKeys = user.appKeys;
                nAppKeys.push(app.appKey);
            } else {
                nAppKeys.push(app.appKey);
            }

            await userCollection.updateOne({
                "_id": new ObjectID(userId)
            }, { $set: { "appKeys": nAppKeys } });

            let nApp =  await this.db.collection(this.AppCollection).insertOne(app);
            Log.info(this.className, 'registerApp', 'App registered.');
            return app;
        } catch (ex) {
            Log.error(this.className, 'registerApp', ex);
            throw ex;
        }
    }

    this.getErrorReport = async (_appKey, _id) => {
        let errorReports = await this.db.collection(this.ERCollection).findOne({
            appKey: _appKey,
            _id: new ObjectID(_id)
        });

        return errorReports;
    }

    this.getAllErrorReport = async (_appKey) => {
        try
        {
            let errorReports = await this.db.collection(this.ERCollection).find({
                appKey: _appKey
            });
    
            return await errorReports.toArray();
        }
        catch (ex) {
            throw ex;
        }
    }

    this.insertErrorReport = async (_appKey, _errorReport) => {
        try {
            _errorReport.appKey = _appKey;
            _errorReport.createdAt = new Date();
            let errorReport = this.db.collection(this.ERCollection).insertOne(_errorReport);
            Log.info(this.className, 'insertErrorReport', 'New error report!');
        } catch (ex) {
            Log.error(this.className, 'insertErrorReport', ex);
            throw ex;
        }
    }

    this.getUser =  async (_id) => {
        let user = await this.db.collection(this.UserCollection).findOne({
            _id: new ObjectID(_id)
        });

        return user;
    }

    this.getApps = async (appKeys) => {
        let apps = await this.db.collection(this.AppCollection).find({
            appKey: { "$in": appKeys }
        });

        return await apps.toArray();
    }

    this.getBugReport =  async (_appKey, _id) => {
        let bugReports = await this.db.collection(this.BRCollection).findOne({
            appKey: _appKey,
            _id: new ObjectID(_id)
        });

        return bugReports;
    }

    this.getAllBugReport = async (_appKey) => {
        try
        {
            let bugReports = await this.db.collection(this.BRCollection).find({
                appKey: _appKey
            });
    
            return await bugReports.toArray();
        }
        catch (ex) {
            throw ex;
        }
    }

    this.insertBugReport = async (_appKey, _bugReport) => {
        try {
            _bugReport.appKey = _appKey;
            _bugReport.createdAt = new Date();
            let bugReport = this.db.collection(this.BRCollection).insertOne(_bugReport);
            Log.info(this.className, 'insertBugReport', 'New bug report!');
        } catch (ex) {
            Log.error(this.className, 'insertBugReport', ex);
            throw ex;
        }
    }

    return this;
}