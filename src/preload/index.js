import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// 为渲染进程定义自定义 API
const api = {
  // 获取app根路径
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  // 同步获取主进程目录
  getDirname: (filePath) => ipcRenderer.sendSync('get-dirname', filePath),
  // 选择文件夹
  openFolderDialog: () => ipcRenderer.invoke('dialog:openFolder'),
  // 上传文件夹
  uploadFolder: (sourceFolder, targetFolder) => ipcRenderer.invoke('upload:folder', sourceFolder, targetFolder),
  // 导出文件夹
  exportFolder: (sourceFolder, targetFolder, targetFolderName) => ipcRenderer.invoke('export-folder', sourceFolder, targetFolder, targetFolderName),
  // 选择文件
  openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),
  // 保存文件
  saveFile: (data, savePath, format) => ipcRenderer.invoke('save-file', data, savePath, format),
  // 读取文件
  readFile: (fileName, filePath, format) => ipcRenderer.invoke('read-file', fileName, filePath, format),
  // 删除文件
  deleteFile: (fileName, deletePath, format) => ipcRenderer.invoke('delete-file', fileName, deletePath, format),
  // 修改文件名
  renameFile: (oldFileName, newFileName, renamePath, format) => ipcRenderer.invoke('rename-file', oldFileName, newFileName,  renamePath, format),
  // 执行命令行
  executeReplace: (filePath, env) => ipcRenderer.invoke('execute-replace', filePath, env),
}

// 使用 `contextBridge` API 来暴露 Electron API 到渲染进程
// 仅在上下文隔离启用时执行，否则将直接添加到 DOM 全局对象中。
if (process.contextIsolated) {
  try {
    // 在主窗口中暴露 Electron API
    contextBridge.exposeInMainWorld('electronAPI', electronAPI)
    contextBridge.exposeInMainWorld('electron', api)
  } catch (error) {
    console.error(error) // 捕获并输出错误
  }
} else {
  // 如果没有启用上下文隔离，直接将 API 添加到全局对象
  window.electronAPI = electronAPI
  window.electron = api
}
