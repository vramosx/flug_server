module.exports = function Device(
    _isPhysicalDevice,
    _osRelease,
    _os,
    _deviceModel
) {
    let nDevice = {
        isPhysicalDevice: _isPhysicalDevice,
        osRelease: _osRelease,
        os: _os,
        deviceModel: _deviceModel
    }

    return nDevice;
}