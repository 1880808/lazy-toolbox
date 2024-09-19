// const fs = require('fs');
// const path = require('path');
// const { exec } = require('child_process');
// 读取配置文件
// const config = require('./config.js');
import path, { dirname } from 'path'
import fs from 'fs';
import { exec } from 'child_process';
import config from './config.js';
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 获取配置名称
const provider = process.argv[2];

if (!provider || !config[provider]) {
    console.error('请提供有效的配置名称，例如 dev 或 prod');
    process.exit(1);
}

const selectedConfig = config[provider];

// 替换文件
function replaceImage() {
    if(!selectedConfig.sourceFile || !selectedConfig.targetFile) {
        console.log('无需替换文件');
        return false;
    }
    // const logoDestPath = path.join(__dirname, selectedConfig.targetFile);
    // const logoSourcePath = path.join(__dirname, selectedConfig.sourceFile);
    const logoDestPath = path.join(selectedConfig.targetFile);
    const logoSourcePath = path.join(selectedConfig.sourceFile);
    fs.copyFile(logoSourcePath, logoDestPath, (err) => {
        if (err) {
            console.error('替换文件失败, 路径为:', logoDestPath);
        } else {
            console.log('文件已替换为 ' + provider);
        }
    });
}
replaceImage();

// 替换文件夹
function replaceFolder() {
    if (!selectedConfig.sourceFolder || !selectedConfig.targetFolder) {
        console.log('无需替换文件夹');
        return false;
    }
    // const assetsDestPath = path.join(__dirname, selectedConfig.targetFolder); // 目标文件夹
    // const assetsSourcePath = path.join(__dirname, selectedConfig.sourceFolder); // 源文件夹
    const assetsDestPath = path.join(selectedConfig.targetFolder); // 目标文件夹
    const assetsSourcePath = path.join(selectedConfig.sourceFolder); // 源文件夹
    
    // 删除现有文件夹
    exec(`rm -rf ${assetsDestPath}`, (err) => {
        if (err) {
            console.error('删除旧文件夹失败:', assetsDestPath);
            return;
        }
        // 复制新文件夹
        exec(`cp -r ${assetsSourcePath} ${assetsDestPath}`, (err) => {
            if (err) {
                console.error('替换文件夹失败:', assetsDestPath);
            } else {
                console.log('文件夹已替换为 ' + provider);
            }
        });
    });
}
replaceFolder();

// 修改文件中的变量 只支持如下格式的修改格式  value 输出结果只支持字符串
// apiUrl = '123'
// apiUrl ='123'
// apiUrl= '123';
// apiUrl='123';
// apiUrl : '123';
// apiUrl :'123';
// apiUrl: '123';
// apiUrl:'123';
// "apiUrl" : '123',
// "apiUrl" : "123",
// "apiUrl" :"123";
// "apiUrl": "123";
// "apiUrl":"123";
function modifyVueVariables() {
    // 遍历 modifyList 列表，处理每个文件
    if (!selectedConfig.modifyList || selectedConfig.modifyList.length === 0) {
        console.log('无需修改文件');
        return false;
    }
    selectedConfig.modifyList.forEach((fileConfig) => {
        // const filePath = path.join(__dirname, fileConfig.filePath);
        const filePath = path.join(fileConfig.filePath);
        const filePathName = filePath?.split('/')?.slice(-2)?.join('/');
        // 读取文件
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error(`${provider}读取文件失败: ${filePathName}`);
                return;
            }
            let updatedContent = data;
            // 遍历 fileConfig 中的所有键值对，替换所有的变量定义
            Object.keys(fileConfig).forEach((key) => {
                if (key !== 'filePath') {
                    // 匹配变量赋值，包括字符串、函数调用或复杂表达式，并捕获结尾符号
                    const regex = new RegExp(`(["']?)${key}\\1\\s*([:=])\\s*(['"])(.*?)\\3([;,]?)`, 'g');
                    
                    // 使用捕获组替换，保留符号和结尾的标点符号
                    updatedContent = updatedContent.replace(regex, (match, quoteKey, operator, quoteValue, value, endSymbol) => {
                        // 替换整个值部分为新的配置值，并保留原始的符号和结尾标点
                        return `${quoteKey}${key}${quoteKey} ${operator} "${fileConfig[key]}"${endSymbol}`;
                    });
                }
            });
            // 写入修改后的内容
            fs.writeFile(filePath, updatedContent, 'utf8', (err) => {
                if (err) {
                    console.error(`从 ${provider} 更新文件失败: ${filePathName}`);
                } else {
                    console.log(`文件已更新为 ${provider}: ${filePath}`);
                }
            });
        });
    });
}
modifyVueVariables();
