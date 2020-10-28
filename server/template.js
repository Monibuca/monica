const os = require('os')
exports.main = `package main

import (
	"flag"
	_ "net/http/pprof"
	"path/filepath"
	"runtime"

	. "github.com/Monibuca/engine/v2"
	_ "github.com/Monibuca/plugin-cluster"
	_ "github.com/Monibuca/plugin-gateway"
	_ "github.com/Monibuca/plugin-hdl"
	_ "github.com/Monibuca/plugin-hls"
	_ "github.com/Monibuca/plugin-jessica"
	_ "github.com/Monibuca/plugin-logrotate"

	_ "github.com/Monibuca/plugin-gb28181"
	_ "github.com/Monibuca/plugin-record"
	_ "github.com/Monibuca/plugin-rtmp"
	_ "github.com/Monibuca/plugin-rtsp"
	_ "github.com/Monibuca/plugin-webrtc"
)

func main() {
	addr := flag.String("c", "", "config file")
	flag.Parse()
	if *addr == "" {
		_, currentFile, _, _ := runtime.Caller(0)
		configFile := filepath.Join(filepath.Dir(currentFile), "config.toml")
		Run(configFile)
	} else {
		Run(*addr)
	}
	select {}
}
`
if (os.platform() == 'win32') {
    exports.restart = function (name) {
        return `if shutdown.bat call shutdown.bat
start ${name}.exe
`
    }
} else
    exports.restart = function (name) {
        return `if [ -f "shutdown.sh" ];then
./shutdown.sh
fi
nohup ./${name} > debug.log 2>&1 &
`
    }