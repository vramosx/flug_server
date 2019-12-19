module.exports = function BugReport(
    _appName,
    _buildNumber,
    _packageName,
    _appVersion,
    _device,
    _username,
    _description,
    _imageURL
) {
    let nBReport = {
        appName: _appName,
        buildNumber: _buildNumber,
        packageName: _packageName,
        appVersion: _appVersion,
        device: _device,
        username: _username,
        description: _description,
        imageURL: _imageURL
    }

    return nBReport;
}