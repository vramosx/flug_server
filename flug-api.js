var restify = require('restify');
var FlugDB = require('./flug-db');
const config = require('./config');
const rjwt = require('restify-jwt-community');
const jwt = require('jsonwebtoken');
var Device = require('./models/device');
var ErrorReport = require('./models/error-report');
var BugReport = require('./models/bug-report');
var Log = require('./log');
var User = require('./models/user');
var App = require('./models/app');
var Invite = require('./models/invite');
var { createInvite } = require('./utils');

const APPKEY_HEADER = 'app-key';

module.exports = function FlugAPI (_flugServer) {

    // HELPERS
    this.getAppKey = (req) => {
        if(req.headers) {
            if(req.headers.authorization) {
                let token = req.headers.authorization.replace('Bearer ', '');
                let { appKey } = jwt.decode(token);
                return appKey;
            }
        }

        return undefined;
    }

    this.getDecodedToken = (req) => {
        if(req.headers) {
            if(req.headers.authorization) {
                let token = req.headers.authorization.replace('Bearer ', '');
                let decodedToken = jwt.decode(token);
                return decodedToken;
            }
        }

        return undefined;
    }


    // ERROR REPORT
    this.getAllErrorReport = async (req, res, next) => {
        let appKey = this.getAppKey(req);

        if(!appKey) {
            Log.info('FlugAPI', 'getAllErrorReport', 'Request without APPKEY!');
            res.send(401);
            return;
        }
        
        let errorReports = await this.flugDb.getAllErrorReport(appKey);

        res.send(errorReports);
        next();
    }

    this.getErrorReport = async (req, res, next) => {
        try {
            let appKey = this.getAppKey(req);

            if(!appKey) {
                Log.info('FlugAPI', 'getErrorReport', 'Request without APPKEY!');
                res.send(401);
                return;
            }
            let errorReport = await this.flugDb.getErrorReport(appKey, req.params.id);
            res.send(errorReport);
        } catch (ex) {
            Log.error('FlugAPI', 'getErrorReport', ex);
            res.send(500)
        }
        next();
    }

    this.insertErrorReport = async (req, res, next) => {
        try {
            let appKey = this.getAppKey(req);

            if(!appKey) {
                Log.info('FlugAPI', 'insertErrorReport', 'Request without APPKEY!');
                res.send(401);
                return;
            }
            
            let device = Device();
            device.deviceModel = req.params.deviceModel;
            device.os = req.params.os;
            device.osRelease = req.params.osRelease;
            device.isPhysicalDevice = req.params.isPhysicalDevice;

            let nER = ErrorReport();
            nER.appName = req.params.appName;
            nER.appVersion = req.params.appVersion;
            nER.buildNumber = req.params.buildNumber;
            nER.packageName = req.params.packageName;
            nER.device = device;
            nER.error = req.params.error;
            nER.stackTrace = req.params.stackTrace;
        
            await this.flugDb.insertErrorReport(appKey, nER);
            res.send(200);
        }
        catch (ex) {
            Log.error('FlugAPI', 'insertErrorReport', ex);
            res.send(500)
        }

        next();
    }


    // BUG REPORT
    this.getAllBugReport = async (req, res, next) => {
        let appKey = this.getAppKey(req);

        if(!appKey) {
            Log.info('FlugAPI', 'getAllBugReport', 'Request without APPKEY!');
            res.send(401);
            return;
        }
        
        let bugReports = await this.flugDb.getAllBugReport(appKey);

        res.send(bugReports);
        next();
    }

    this.getBugReport = async (req, res, next) => {
        try {
            let appKey = this.getAppKey(req);

            if(!appKey) {
                Log.info('FlugAPI', 'getBugReport', 'Request without APPKEY!');
                res.send(401);
                return;
            }
            let bugReport = await this.flugDb.getBugReport(appKey, req.params.id);
            res.send(bugReport);
        } catch (ex) {
            Log.error('FlugAPI', 'getBugReport', ex);
            res.send(500)
        }
        next();
    }

    this.insertBugReport = async (req, res, next) => {
        try {
            let appKey = this.getAppKey(req);

            if(!appKey) {
                Log.info('FlugAPI', 'insertBugReport', 'Request without APPKEY!');
                res.send(401);
                return;
            }
            
            let device = Device();
            device.deviceModel = req.params.deviceModel;
            device.os = req.params.os;
            device.osRelease = req.params.osRelease;
            device.isPhysicalDevice = req.params.isPhysicalDevice;

            let nBR = BugReport();
            nBR.appName
            nBR.appName = req.params.appName;
            nBR.appVersion = req.params.appVersion;
            nBR.buildNumber = req.params.buildNumber;
            nBR.packageName = req.params.packageName;
            nBR.device = device;
            nBR.description = req.params.description;
            nBR.imageURL = req.params.imageURL;
        
            await this.flugDb.insertBugReport(appKey, nBR);
            res.send(200);
        }
        catch (ex) {
            Log.error('FlugAPI', 'insertBugReport', ex);
            res.send(500)
        }

        next();
    }

    // APPS
    this.registerApp = async (req, res, next) => {
        try {
            var tokenContent = this.getDecodedToken(req);
            var app = App(); 
            app.appName = req.params.appName;
            app.codeName = req.params.codeName;
            app.icon = req.params.icon;
 
            let nApp = await this.flugDb.registerApp(app, tokenContent._id)
 
            if(nApp) {
                tokenContent.appKey = nApp.appKey;
                delete tokenContent.exp;
                delete tokenContent.iat;
                
                let nToken = jwt.sign(tokenContent, config.jwt.secret, {
                    expiresIn: '360d' // token expires in 15 minutes
                });

                let { iat, exp } = jwt.decode(nToken);
                res.send({ token: nToken, iat, exp });
                return;
            }

            res.send(500);
         }
         catch (ex) {
             Log.error('FlugAPI', 'registerApp', ex);
             res.send(500);
         }
    }

    this.getApps = async (req, res, next) => {
        try {
            var tokenContent = this.getDecodedToken(req);
            let userId = tokenContent._id;

            let user = await this.flugDb.getUser(userId);
 
            if(user) {
                let apps = await this.flugDb.getApps(user.appKeys);
                res.send(apps);
                return;
            }

            res.send(517);
         }
         catch (ex) {
             Log.error('FlugAPI', 'registerApp', ex);
             res.send(500);
         }
    }


    // SIGN-IN
    this.signin = async (req, res, next) => {
        try {
            var user = User(); 
            let { username, password } = req.params;
            user.password = password;
            user.username = username;
 
            let u = await this.flugDb.loginUser(user);
            if(u) {
                let token = jwt.sign(u, config.jwt.secret, {
                    expiresIn: '360d' // token expires in 15 minutes
                });

                let decoded = jwt.decode(token);
                let { iat, exp } = jwt.decode(token);
                res.send({ decoded, token });
            } else {
                res.send(401)
            }
         }
         catch (ex) {
             Log.error('FlugAPI', 'signin', ex);
             res.send(500);
         }
    }

    this.getAppKeyAuthorization = async (req, res, next) => {
        try {
            let decToken = this.getDecodedToken(req);
            if(!decToken) { res.send(401); return; }

            delete decToken.exp;
            delete decToken.iat;

            decToken.appKey = req.params.appKey;
            let token = jwt.sign(decToken, config.jwt.secret, {
                expiresIn: '360d' // token expires in 15 minutes
            });

            res.send({ token });
         }
         catch (ex) {
             Log.error('FlugAPI', 'getAppKeyAuthorization', ex);
             res.send(500);
         }
    }

    
    // SIGN-UP
    this.signup = async (req, res, next) => {
        try {
           var user = User(); 
           user.admin = true;
           user.password = req.params.password;
           user.username = req.params.username;

           let exist = await this.flugDb.checkUserExist(user.username);

           if(exist) {
               res.send(515);
               return;
           }

           await this.flugDb.registerUser(user);
           res.send(200);
        }
        catch (ex) {
            Log.error('FlugAPI', 'signup', ex);
            res.send(500);
        }
    }

    this.signupWithInvite = async (req, res, next) => {
        try {
            var user = User(); 
            user.admin = false;
            user.inviteCode = req.params.inviteCode;
            user.password = req.params.password;
            user.username = req.params.username;
 
            let exist = await this.flugDb.checkUserExist(user.username);
 
            if(exist) {
                res.send(515);
                return;
            }
 
            if(await this.flugDb.registerUserWithInvite(user)) {
                res.send(200);
            } else {
                res.send(516);
            }
         }
         catch (ex) {
             Log.error('FlugAPI', 'signupWithInvite', ex);
             res.send(500);
         }
    }

    this.generateInvite = async (req, res, next) => {
        try {
            let appKey = this.getAppKey(req);

            if(!appKey) {
                Log.info('FlugAPI', 'generateInvite', 'Request without APPKEY!');
                res.send(401);
                return;
            }

            let invite = Invite();
            invite.appKey = appKey;
            if(req.params.unlimited) {
                invite.unlimited = true;
            } else {
                invite.alreadyUsed = false;
            }
            invite.inviteCode = createInvite();
 
            await this.flugDb.createInvite(invite)

            res.send({ inviteCode: invite.inviteCode });
         }
         catch (ex) {
             Log.error('FlugAPI', 'signup', ex);
             res.send(500);
         }
    }


    // CONFIGURATION
    this.createRoutes = (_enableSignUp) => {
        this.server.post(`/${this.apiVersion}/sign-in`, this.signin);

        if(_enableSignUp) this.server.post(`/${this.apiVersion}/sign-up`, this.signup);

        this.server.post(`/${this.apiVersion}/invited`, this.signupWithInvite);

        // ERROR-REPORT ROUTES
        this.server.get(`/${this.apiVersion}/error-report`, this.getAllErrorReport);  
        this.server.get(`/${this.apiVersion}/error-report/:id`, this.getErrorReport);        
        this.server.post(`/${this.apiVersion}/error-report`, this.insertErrorReport);

        // BUG-REPORT ROUTES
        this.server.get(`/${this.apiVersion}/bug-report`, this.getAllBugReport);  
        this.server.get(`/${this.apiVersion}/bug-report/:id`, this.getBugReport);        
        this.server.post(`/${this.apiVersion}/bug-report`, this.insertBugReport);

        // APP ROUTES
        this.server.post(`/${this.apiVersion}/app`, this.registerApp);
        this.server.post(`/${this.apiVersion}/app-auth`, this.getAppKeyAuthorization);
        this.server.post(`/${this.apiVersion}/create-invite`, this.generateInvite);
        this.server.get(`/${this.apiVersion}/get-apps`, this.getApps);
    }

    this.init = async (_apiVersion, _port = 8080, _enableSignUp = true) => {
        this.flugDb = FlugDB(_flugServer);
        this.flugDb.init();

        let noauth_paths = [
            `/${_apiVersion}/sign-in`,
            `/${_apiVersion}/invited`
        ];

        if(_enableSignUp) {
            noauth_paths = [
                `/${_apiVersion}/sign-in`,
                `/${_apiVersion}/invited`,
                `/${_apiVersion}/sign-up`
            ];
        }

        try {
            this.server = restify.createServer();
            this.server.use(restify.plugins.acceptParser(server.acceptable));
            this.server.use(restify.plugins.queryParser());
            this.server.use(restify.plugins.jsonp());
            this.server.use(rjwt(config.jwt).unless({
                path: noauth_paths
            }));
            this.server.use(restify.plugins.bodyParser({ mapParams: true }));
            this.apiVersion = _apiVersion;
            this.createRoutes(_enableSignUp);

            await this.server.listen(_port);
            return true;
        } catch (ex) {
            throw ex;
        }
    }

    return this;
}