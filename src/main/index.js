import { app, shell, BrowserWindow, ipcMain, dialog, globalShortcut } from 'electron'
import { join } from 'path'
import asar from 'asar'
import fs from 'fs'
import os from 'os'
import { exec } from 'child_process'
import { electronApp, is } from '@electron-toolkit/utils'
import fixPath from 'fix-path';

// 创建浏览器窗口的函数
let mainWindow
function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false, // 初始时不显示窗口
    autoHideMenuBar: true, // 自动隐藏菜单栏
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true, // 渲染进程可以使用Node API
      webSecurity: false,
      // 如果是开发模式可以使用devTools
      // devTools: process.env.NODE_ENV === 'development',
      // 在macos中启用橡皮动画
      scrollBounce: process.platform === 'darwin',
      preload: join(__dirname, '../preload/index.mjs'), // 预加载脚本
      sandbox: false, // 禁用沙盒
    }
  })

  // 当窗口准备好显示时
  mainWindow.on('ready-to-show', () => {
    mainWindow.show() // 显示窗口
  })

  // 处理打开新窗口的请求
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url) // 在外部浏览器中打开链接
    return { action: 'deny' } // 拒绝新窗口的创建
  })

  // 根据 electron-vite cli 进行热模块替换（HMR）
  // 在开发中加载远程 URL，生产中加载本地 HTML 文件
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']) // 加载开发模式 URL
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html')) // 加载生产模式 HTML
  }
  // 打开开发工具
  // mainWindow.webContents.openDevTools()
}

// 当 Electron 初始化完成后，将被调用，准备创建浏览器窗口
app.whenReady().then(() => {
  // 为 Windows 设置应用用户模型 ID
  electronApp.setAppUserModelId('com.electron')

  // 修复环境变量
  fixPath();

  // 默认在开发模式下通过 F12 打开或关闭开发者工具
  // 在生产模式下忽略 CommandOrControl + R
  // app.on('browser-window-created', (_, window) => {
  //   optimizer.watchWindowShortcuts(window) // 监视窗口快捷键
  // })
  globalShortcut.register('Alt+CommandOrControl+Shift+D', () => {
    mainWindow.webContents.openDevTools({ mode: 'detach' }) //开启开发者工具
  })

  createWindow() // 创建窗口

  app.on('activate', function () {
    // 在 macOS 上，点击 dock 图标时常常重新创建窗口
    if (BrowserWindow.getAllWindows().length === 0) createWindow() // 如果没有窗口，则创建窗口
  })
})

// 当所有窗口关闭时退出应用，macOS 除外
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit() // 退出应用
  }
})

// 在此文件中可以包含应用特定的主进程代码
// 也可以将它们放在单独的文件中并在此处引入

// 获取 app 根路径
ipcMain.handle('get-app-path', () => {
    return app.getAppPath();
});
// 同步获取主进程目录
ipcMain.on('get-dirname', (event, folderName = '') => {
  const fullPath = join(__dirname, folderName);
  event.returnValue = fullPath;
});

// 选择文件夹
ipcMain.handle('dialog:openFolder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });
    return result.filePaths;
});

// 选择文件
ipcMain.handle('dialog:openFile', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile']
    });
    return result.filePaths; // 返回选定的文件路径
});

// 保存文件的处理器
ipcMain.handle('save-file', async (event, dataString, savePath = '', format = 'js') => {
    const data = JSON.parse(dataString); // 解析字符串为对象

    // console.log('收到保存文件请求，文件:', data.fileName, '格式:', format);
    try {
        // console.log('解析后的数据:', data);
        // 获取应用根目录
        const appRoot = savePath || join(__dirname, '../renderer/lib/build/pages');
        const targetDir = join(appRoot);

        // 确保目标目录存在
        fs.mkdirSync(targetDir, { recursive: true });

        // 生成文件名
        const fileName = `${data.fileName}.${format}`;
        const filePath = join(targetDir, fileName);

        // 根据格式生成内容
        let content;
        switch(format) {
            case 'js':
                content = `const data = ${JSON.stringify(data, null, 2)};\n\nexport default data;\n`;
                break;
            case 'json':
                content = JSON.stringify(data, null, 2);
                break;
            case 'txt':
                content = JSON.stringify(data, null, 2); // 可自定义文本格式
                break;
            default:
                throw new Error('不支持的文件格式');
        }

        // 写入文件
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log('文件保存成功:', filePath);
        return { success: true, message: `文件已保存到 ${filePath}` };
    } catch (error) {
        console.error('保存文件失败:', error);
        return { success: false, message: `保存失败: ${error.message}` };
    }
});

// 读取文件的处理器
ipcMain.handle('read-file', async (event, fileName, filePath ='', format = 'js') => {
    try {
        // const appRoot = filePath || app.getAppPath() + '/src/renderer/public/lib/build/pages';
        const appRoot = filePath || join(__dirname, '../renderer/lib/build/pages');
        const targetDir = join(appRoot);
        const filePaths = join(targetDir, `${fileName}.${format}`);

        // 检查文件是否存在
        if (!fs.existsSync(filePaths)) {
            throw new Error('文件不存在');
        }

        // 读取文件内容
        const content = fs.readFileSync(filePaths, 'utf-8');
        let data;
        switch (format) {
            case 'js':
                // 使用正则提取 JSON 部分
                // eslint-disable-next-line no-case-declarations
                const match = content.match(/const data\s*=\s*(\{[\s\S]*?\});\s*export\s+default\s+data;/);
                if (match && match[1]) {
                    data = JSON.parse(match[1]);
                } else {
                    throw new Error('无法提取 JSON 数据');
                }
                break;
            case 'json':
                data = JSON.parse(content);
                break;
            case 'txt':
                data = content; // 如果需要，可以进一步解析文本内容
                break;
            default:
                throw new Error('不支持的文件格式');
        }

        return { success: true, data, message: `文件已读取: ${filePaths}` };
    } catch (error) {
        return { success: false, message: `读取失败: ${error.message}` };
    }
});

// 删除文件的处理器
ipcMain.handle('delete-file', async (event, fileName, deletePath = '', format = 'js') => {
    console.log ('delete-file', fileName);
    try {
        const appRoot = deletePath || join(__dirname, '../renderer/lib/build/pages');
        const targetDir = join(appRoot);
        const filePath = join(targetDir, `${fileName}.${format}`);

        // 检查文件是否存在
        await fs.promises.access(filePath, fs.constants.F_OK);

        // 删除文件
        await fs.promises.unlink(filePath);
        return { success: true, message: `文件已删除: ${filePath}` };
    } catch (error) {
        if (error.code === 'ENOENT') {
            return { success: false, message: '文件不存在' };
        }
        return { success: false, message: `删除失败: ${error.message}` };
    }
});

// 修改文件名的处理器
ipcMain.handle('rename-file', async (event, oldFileName, newFileName, renamePath = '', format = 'js') => {
    try {
        const appRoot = renamePath || join(__dirname, '../renderer/lib/build/pages');
        const targetDir = join(appRoot);
        const oldFilePath = join(targetDir, `${oldFileName}.${format}`);
        const newFilePath = join(targetDir, `${newFileName}.${format}`);

        // 检查旧文件是否存在
        await fs.promises.access(oldFilePath, fs.constants.F_OK);

        // 检查新文件是否已存在，避免覆盖
        try {
            await fs.promises.access(newFilePath, fs.constants.F_OK);
            throw new Error('新文件名已存在');
        } catch (err) {
            if (err.code !== 'ENOENT') {
                throw err;
            }
            // 如果新文件不存在，则继续
        }

        // 重命名文件
        await fs.promises.rename(oldFilePath, newFilePath);

        // 读取新文件内容
        let fileContent = fs.readFileSync(newFilePath, 'utf-8');
        let data;

        switch(format) {
            case 'js':
                // 从文件内容中提取 JSON 部分
                // eslint-disable-next-line no-case-declarations
                const jsDataMatch = fileContent.match(/const\s+data\s*=\s*(\{[\s\S]*\});/);
                if (jsDataMatch) {
                    data = JSON.parse(jsDataMatch[1]);
                } else {
                    throw new Error('无法解析 JS 文件内容');
                }
                break;
            case 'json':
            case 'txt':
                data = JSON.parse(fileContent);
                break;
            default:
                throw new Error('不支持的文件格式');
        }

        // 更新 data.fileName 字段
        data.fileName = newFileName;

        // 根据格式生成内容
        let newContent;
        switch(format) {
            case 'js':
                newContent = `const data = ${JSON.stringify(data, null, 2)};\n\nexport default data;\n`;
                break;
            case 'json':
                newContent = JSON.stringify(data, null, 2);
                break;
            case 'txt':
                newContent = JSON.stringify(data, null, 2); // 可自定义文本格式
                break;
            default:
                throw new Error('不支持的文件格式');
        }

        // 写入更新后的内容到新文件
        fs.writeFileSync(newFilePath, newContent, 'utf-8');

        return { success: true, message: `文件已重命名为: ${newFilePath} 并更新 fileName 字段` };
    } catch (error) {
        if (error.code === 'ENOENT') {
            return { success: false, message: '原文件不存在' };
        }
        return { success: false, message: `重命名失败: ${error.message}` };
    }
});

// 构建命令，node执行某个文件, 例如: node replace.js dev
ipcMain.handle('execute-replace', async (event, filePath = '', env) => {
    return new Promise((resolve, reject) => {
      const appRoot = filePath || join(__dirname, '../renderer/lib/build/replace.js');
        const command = `node ${join(appRoot)} ${env}`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`执行错误: ${error.message}`);
                dialog.showErrorBox('执行错误', error.message);
                reject(error.message);
                return;
            }
            if (stderr) {
                console.error(`标准错误: ${stderr}`);
                dialog.showErrorBox('错误', stderr);
                reject(stderr);
                return;
            }
            // console.log(`标准输出: ${stdout}`);
            resolve(stdout);
        });
    });
});

// 上传文件夹 替换文件夹的内容, 不是覆盖
// targetFolder = targetFolder ? targetFolder : join(__dirname, '../renderer/lib/build/pages');
ipcMain.handle('upload:folder', async (event, sourceFolder = '', targetFolder = '') => {
  const files = fs.readdirSync(sourceFolder);
  targetFolder = targetFolder ? targetFolder : join(__dirname, '../renderer/lib/build/pages');

  if(sourceFolder.indexOf('lazy-') > 0) {
    for (const file of files) {
      const sourceFilePath = join(sourceFolder, file);
      const targetFilePath = join(targetFolder, file);
      const stat = fs.statSync(sourceFilePath);

      // 仅处理名为 headers 的文件
      if (file === 'headers.js') {
        const source = fs.readFileSync (sourceFilePath, 'utf-8')
        const match = source.match (/const data\s*=\s*(\{[\s\S]*?\});\s*export\s+default\s+data;/);
        let sourceData;
        if (match && match[1]) {
          sourceData = JSON.parse (match[1]);
        }

        const target = fs.readFileSync (targetFilePath, 'utf-8')
        const matchTarget = target.match (/const data\s*=\s*(\{[\s\S]*?\});\s*export\s+default\s+data;/);
        let targetData;
        if (matchTarget && matchTarget[1]) {
          targetData = JSON.parse (matchTarget[1]);
        }

        // 对比并追加不同的值
        sourceData.headers.forEach (header => {
          if (!targetData.headers.includes (header)) {
            targetData.headers.push (header);
          }
        });

        let content = `const data = ${JSON.stringify (targetData, null, 2)};\n\nexport default data;\n`;
        // 将更新后的内容写回目标文件
        fs.writeFileSync (targetFilePath, content, 'utf-8');
      } else if (stat.isFile()) {
        // 处理其他文件：直接复制
        // 仅复制常规文件，跳过文件夹或特殊文件
        fs.copyFileSync (sourceFilePath, targetFilePath);
      }
    }
  } else {
    dialog.showErrorBox('文件夹名必须是lazy-开头,请检查文件夹', '');
    return { success: false, message: '上传失败！' };
  }
  return { success: true, message: '上传成功！' };
  // 重启应用
  // app.relaunch();
  // app.exit();
});

// 导出文件夹
ipcMain.handle('export-folder', async (event, sourceFolder = '', targetFolder = '', targetFolderName = '') => {

  sourceFolder =  sourceFolder ? sourceFolder : join(__dirname, '../renderer/lib/build/pages');
  const exportPath = join(targetFolder, targetFolderName);

  // 创建目标文件夹（如果不存在）
  if (!fs.existsSync(exportPath)) {
    fs.mkdirSync(exportPath);
  }

  try {
    const files = fs.readdirSync(sourceFolder);
    files.forEach(file => {
      const srcFile = join(sourceFolder, file);
      const destFile = join(exportPath, file);
      fs.copyFileSync(srcFile, destFile);
    });
    return { success: true, message: '导出成功！' };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

