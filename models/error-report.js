module.exports = function ErrorReport(
    _appName,
    _buildNumber,
    _packageName,
    _appVersion,
    _device,
    _error,
    _stackTrace,
) {
    let nEReport = {
        appName: _appName,
        buildNumber: _buildNumber,
        packageName: _packageName,
        appVersion: _appVersion,
        device: _device,
        error: _error,
        stackTrace: _stackTrace
    }

    return nEReport;
}