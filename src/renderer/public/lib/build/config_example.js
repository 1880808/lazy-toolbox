// 模板示例 example
//  使用方法
//  1, 安装node
//  2, node replace.js dev

const data = {
  // 环境名 dev
  "dev": {
    // 替换文件 如无需替换文件，设置为空字符串
    // 源文件路径
    "sourceFile": "",
    // 被替换的文件路径
    "targetFile": "",

    // 替换文件夹 如无需替换文件夹，设置为空字符串
    // 源文件夹路径
    "sourceFolder": "",
    // 被替换的文件夹路径
    "targetFolder": "",

    // 需要修改的文件  如无需修改文件，设置为空数组
    "modifyList": [
      {
        // 需要修改文件路径
        "filePath": "./pages/App2.vue",
        // 需要修改的字段 可以有多个
        "apiUrl": "https://www.baidu.com",
        "NODE_ENV": "development",
      },
      {
        // 需要修改文件路径
        "filePath": "./pages/manifest.json",
        // 修改的字段
        "APPKEY_ANDROID": "111",
        "APPKEY_IOS": "222",
        "versionName": "11",
        "versionCode": "22",
      }
    ]
  },
  // 环境名 prod
  "prod": {
    // 替换文件 如无需替换文件，设置为空字符串
    // 源文件路径
    "sourceFile": "",
    // 被替换的文件路径
    "targetFile": "",

    // 替换文件夹 如无需替换文件夹，设置为空字符串
    // 源文件夹路径
    "sourceFolder": "",
    // 被替换的文件夹路径
    "targetFolder": "",

    // 需要修改的文件  如无需修改文件，设置为空数组
    "modifyList": [
      {
        // 需要修改文件路径
        "filePath": "./pages/App2.vue",
        // 需要修改的字段 可以有多个
        "apiUrl": "https://www.baidu.com",
        "NODE_ENV": "development",
      },
      {
        // 需要修改文件路径
        "filePath": "./pages/manifest.json",
        // 修改的字段
        "APPKEY_ANDROID": "111",
        "APPKEY_IOS": "222",
        "versionName": "11",
        "versionCode": "22",
      }
    ]
  },
};

export default data;
