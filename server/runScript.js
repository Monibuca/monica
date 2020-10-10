const { spawn } = require('child_process');

const os = require('os')

if (os.platform() == "win32") {
    module.exports = function (filename, opt) {
        const subprocess = spawn('cmd.exe', ['/c', filename + '.bat'], {
            detached: true,
            stdio: 'ignore',
            ...opt
        });

        subprocess.unref();
    }
} else {
    module.exports = function (filename, opt) {
        const subprocess = spawn('sh', [filename + '.sh'], {
            detached: true,
            stdio: 'ignore', ...opt
        });

        subprocess.unref();

    }
}