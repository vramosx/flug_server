var bcrypt = require('bcrypt');

let cryptPassword = async (password) => {
    try 
    {
        let salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(password, salt);

        return hash;
    } catch (ex) {
        throw ex;
    }
 };

let comparePassword = async (plainPass, hashword) => {
    try {
        let isMatch = await bcrypt.compare(plainPass, hashword);
        return isMatch;
    } catch (ex) {
        throw ex;
    }
};

let generateAppKey = () => {
    var length = 32;
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

let createInvite = () => {
    var length = 8;
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

module.exports = {
    cryptPassword,
    comparePassword,
    generateAppKey,
    createInvite
}