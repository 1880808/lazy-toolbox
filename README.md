## lazy 偷懒的小工具 一个基于Electron-vite + Vue3的小工具
### 也可以直接下载mac版本lazy-mac.zip直接使用

## 目前只有多环境打包的功能
<img src="/src/renderer/src/assets/img/example/build.jpg" width="800">

An Electron application with Vue

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```
### 1.推荐node版本22.51
### 2.如果无法启动
```bash
1, 检查node版本
2, npm run build 打包生成资源
```

### 3.静态资源public下的每次有改动, 都需要npm run build 更新out文件夹


### 4.build打包功能
```bash
 如不会配置文件 参考: resources/example/build/下的配置文件
```
### 5.导入配置文件
<img src="/src/renderer/src/assets/img/example/Import_configuration.jpg" width="500">

```bash
headers.js 是顶部的环境导航菜单配置文件, 配置1dev.js , 配置2prod.js, 请参考4.build打包功能
```
<img src="/src/renderer/src/assets/img/example/Import_configuration2.jpg" width="400">


