package dashboard

import (
	"bytes"
	"io/ioutil"
	"os"
	"os/exec"
	"path"

	"github.com/Monibuca/engine/v2/util"
)

type InstanceDesc struct {
	Name    string
	Path    string
	Plugins []string
	Config  string
}

func (p *InstanceDesc) Command(name string, args ...string) (cmd *exec.Cmd) {
	cmd = exec.Command(name, args...)
	cmd.Dir = p.Path
	return
}

func (p *InstanceDesc) CreateDir(sse *util.SSE, clearDir bool) (err error) {
	if clearDir {
		err = os.RemoveAll(p.Path)
	}
	if err = os.MkdirAll(p.Path, 0777); err != nil {
		return
	}
	sse.WriteEvent("step", []byte("2:目录创建成功！"))
	if err = ioutil.WriteFile(path.Join(p.Path, "config.toml"), []byte(p.Config), 0666); err != nil {
		return
	}
	var build bytes.Buffer
	build.WriteString(`package main
import(
. "github.com/Monibuca/engine/v2"`)
	for _, plugin := range p.Plugins {
		build.WriteString("\n_ \"")
		build.WriteString(plugin)
		build.WriteString("\"")
	}
	build.WriteString("\n)\n")
	build.WriteString(`
func main(){
	Run("config.toml")
	select{}
}
`)
	if err = ioutil.WriteFile(path.Join(p.Path, "main.go"), build.Bytes(), 0666); err != nil {
		return
	}
	sse.WriteEvent("step", []byte("3:文件创建成功！"))
	if err = sse.WriteExec(p.Command("go", "mod", "init", p.Name)); err != nil {
		return
	}
	sse.WriteEvent("step", []byte("4:go mod 初始化完成！"))
	if err = sse.WriteExec(p.Command("go", "build")); err != nil {
		return
	}
	sse.WriteEvent("step", []byte("5:go build 成功！"))
	if err = p.CreateRestartFile(p.Name); err != nil {
		return
	}
	return sse.WriteExec(p.RestartCmd())
}
