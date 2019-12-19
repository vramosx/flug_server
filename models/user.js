module.exports = function User(
    _username,
    _password,
    _appKeys,
    _admin
) {
    let nUser = {
        username: _username,
        password: _password,
        appKeys: _appKeys,
        admin: _admin
    }

    return nUser;
}