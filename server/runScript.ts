const { spawn } = require('child_process')

const os = require('os')

export default function runScript(filename: string, opt: object) {
  if (os.platform() == 'win32') {
    const subprocess = spawn('cmd.exe', ['/c', filename + '.bat'], {
      detached: true,
      stdio: 'ignore',
      ...opt
    })
    subprocess.unref()
  } else {
     const subprocess = spawn('sh', [filename + '.sh'], {
       detached: true,
       stdio: 'ignore',
       ...opt
     })
     subprocess.unref()
  }
}