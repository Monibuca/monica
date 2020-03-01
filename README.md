# monica
instance manager for monibuca

实例管理器，用于创建Monibuca的实例工程目录文件，以及控制实例的更新和重启等。

## 设置GOPATH

设置GOPATH的bin目录到PATH环境变量中方便直接运行monica

## 安装
```bash
go get github.com/Monibuca/monica
```

## 运行
```bash
monica
```

默认启动8000端口，可以用浏览器直接访问http://localhost:8000

## 指定端口运行

```bash
monica -port 8001
```