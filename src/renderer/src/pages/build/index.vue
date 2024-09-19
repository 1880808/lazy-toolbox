<script setup>
import { Button, Field, Icon, showToast, Dialog, showDialog } from 'vant'
import { ref } from 'vue'
import { useUserStore } from '../../../../store/modules/user.js'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

// 配置
const overallShow = ref(false)
const overallIndex = ref(0)
const overallType = ref('')
const fileNameList = ref([])

// 读取配置, 存在赋值给变量
readFromHeader()
async function readFromHeader() {
  const result = await window.electron.readFile('headers');
  if(result.success) {
    fileNameList.value = result.data?.headers
    readFromFile()
  }
}
// 读取内容, 存在赋值给变量
async function readFromFile() {
  const result = await window.electron.readFile(fileNameList.value[overallIndex.value]);
  if(result.success) {
    const data = result.data
    sourceFile.value = data.sourceFile
    targetFile.value = data.targetFile
    sourceFolder.value = data.sourceFolder
    targetFolder.value = data.targetFolder
    data.modifyList.forEach(item => {
      item.json = item.json.filter(json => json.key && json.value)
    })

    let isSave = data.modifyList.filter(item => item.json.length === 0)
    if(isSave.length > 0) {
      window.electron.saveFile(JSON.stringify(data));
    }

    data.modifyList = data.modifyList.filter(item => item.json.length > 0)
    modifyList.value = data.modifyList || []
  }
}

// 切换配置
function selectFileName (index) {
  overallIndex.value = index
  readFromFile()
}
// 修改配置名
const fileNameModify = ref('')
function openFileName (type, index) {
  overallType.value = type
  overallShow.value = true
  if(type === 'add') {
    fileNameModify.value = ''

  } else if (type === 'edit') {
    overallIndex.value = index
    fileNameModify.value = fileNameList.value[overallIndex.value]
  }
}
function confirmFileName () {
  if (!fileNameModify.value) {
    showToast({
      message: '请填写配置名',
      duration: 1000
    })
    return false
  }
  const isExist = fileNameList.value.some(item => item === fileNameModify.value)
  if(isExist) {
    showToast({
      message: '配置名已存在',
      duration: 1000
    })
    return false
  }
  if (overallType.value === 'add') {
    fileNameList.value.push(fileNameModify.value)
    overallIndex.value = fileNameList.value.length - 1
    const data = {
      fileName: fileNameModify.value,
      sourceFile: "",
      targetFile: "",
      sourceFolder: "",
      targetFolder: "",
      modifyList: []
    }
    window.electron.saveFile(JSON.stringify(data));
    readFromFile()
  } else if (overallType.value === 'edit') {
    window.electron.renameFile(fileNameList.value[overallIndex.value], fileNameModify.value);
    fileNameList.value[overallIndex.value] = fileNameModify.value
  }
  window.electron.saveFile(JSON.stringify({"fileName": "headers", "headers": fileNameList.value}));
}
// 删除配置
function removeFileName (index) {
  overallIndex.value = index
  showDialog({
    title: '提示',
    message: '确认删除 ' + fileNameList.value[overallIndex.value] + ' 配置吗?',
    showCancelButton: true,
  }).then(() => {
    if (fileNameList.value.length === 1) {
      showToast({
        message: '至少保留一个配置!',
        duration: 1000
      })
      return false
    }
    window.electron.deleteFile(fileNameList.value[overallIndex.value]);
    fileNameList.value.splice(index, 1)
    window.electron.saveFile(JSON.stringify({"fileName": "headers", "headers": fileNameList.value}));
    overallIndex.value = fileNameList.value.length - 1
    readFromFile()
  });

}

// 选择文件
const sourceFile = ref('')
const targetFile = ref('')
async function openFile(who) {
  const paths = await window.electron.openFileDialog();
  if (paths.length > 0) {
    who === 'new' ? sourceFile.value = paths[0] : targetFile.value = paths[0]
    saveToFile()
  }
}

// 选择文件夹
const sourceFolder = ref('')
const targetFolder = ref('')
async function openFolder(who) {
  const paths = await window.electron.openFolderDialog();
  if (paths.length > 0) {
    who === 'new' ? sourceFolder.value = paths[0] : targetFolder.value = paths[0]
    saveToFile()
  }
}

// 修改文件
const modifyList = ref([])
const modifyListIndex = ref(0)
async function openFileModify() {
  const paths = await window.electron.openFileDialog();
  if (paths.length > 0) {
    if(modifyList.value.some(item => item.filePath === paths[0])) {
      showToast({
        message: '文件已存在',
        duration: 1000
      })
      return false
    }
    modifyList.value.push({
      id: modifyList.value.length,
      filePath: paths[0],
      name: paths[0].split('/').slice(-2).join('/'),
      json: [
        { id: 0, key: '', value: '' }
      ]
    })
    modifyListIndex.value = modifyList.value.length - 1
    saveToFile()
  }
}

function removeFileList (index) {
  console.log ()
  showDialog({
    title: '提示',
    message: '确认删除 ' + modifyList.value[index]?.name +' 吗?',
    showCancelButton: true,
  }).then(() => {
    modifyList.value.splice(index, 1)
    saveToFile()
  });
}

// 添加字段
// 增加一个防抖, 防止多次点击
let debounce = true
function addJsonField(index) {
  if (!debounce) {
    showToast({
      message: '请勿频繁点击',
      duration: 1000
    })
    return false
  }
  debounce = false
  setTimeout(() => {
    debounce = true
  }, 2000)
  modifyList.value[index].json.push({
    id: modifyList.value[index].json.length,
    key: '',
    value: ''
  })
  saveToFile()
}
function removeJsonField (index, indexC) {
  showDialog({
    title: '提示',
    message: '确认删除吗?',
    showCancelButton: true,
  }).then(() => {
    modifyList.value[index].json.splice(indexC, 1)
    saveToFile()
  });
}

// 文件改变时, 保存数据到 pages
async function saveToFile() {
  // 去掉 key 或者 value空字段
  const data = {
    fileName: fileNameList.value[overallIndex.value],
    sourceFile: sourceFile.value,
    targetFile: targetFile.value,
    sourceFolder: sourceFolder.value,
    targetFolder: targetFolder.value,
    modifyList: modifyList.value
  }
  window.electron.saveFile(JSON.stringify(data));
}
// 修改保存config
async function saveFileConfig() {
  const result = await window.electron.readFile('config', window.electron.getDirname('../renderer/lib/build'));
  if (result.success) {
    if (!result.data[fileNameList.value[overallIndex.value]]) {
      result.data[fileNameList.value[overallIndex.value]] = {}
    }

    result.data[fileNameList.value[overallIndex.value]].sourceFile = sourceFile.value
    result.data[fileNameList.value[overallIndex.value]].targetFile = targetFile.value
    result.data[fileNameList.value[overallIndex.value]].sourceFolder = sourceFolder.value
    result.data[fileNameList.value[overallIndex.value]].targetFolder = targetFolder.value
    result.data[fileNameList.value[overallIndex.value]].modifyList = []
    for (const item of modifyList.value) {
      let saveJson = {
        filePath: item.filePath,
      }

      const isEmpty = item.json.some(json => json.key === '' || json.value === '')
      if (isEmpty) {
        showToast ({
          message: '字段名和值不能为空, 请检查数据后再试',
          duration: 1000
        })
        return false
      }

      for (const itemC of item.json) {
        saveJson[itemC.key] = itemC.value
      }

      result.data[fileNameList.value[overallIndex.value]].modifyList.push(saveJson)
    }

    // 清除已经不存在的配置
    for (const key in result.data) {
      if(key !== 'fileName') {
        let keyExist = fileNameList.value.some(item => item === key)
        if(!keyExist) {
          delete result.data[key]
        }
      }
    }
    window.electron.saveFile(JSON.stringify(result.data), window.electron.getDirname('../renderer/lib/build'));
    await window.electron.executeReplace('', fileNameList.value[overallIndex.value]);
    showDialog({
      title: '提示',
      message: '执行完成',
      showCancelButton: false,
      theme: 'round-button',
    })
  }
}

// 上传文件夹
async function uploadFolder () {
  const result = await window.electron.openFolderDialog();
  if (result.length > 0) {
    const folderResult = await window.electron.uploadFolder(result[0]);
    console.log (folderResult)
    if(folderResult.success) {
      readFromHeader()
      readFromFile()
      showDialog({
        title: '提示',
        message: '上传完成',
        showCancelButton: false,
        theme: 'round-button',
      })
    }
  }
}
// 导出文件夹
async function exportFolder () {
  let result = await window.electron.openFolderDialog();
  console.log (result)
  if (result.length > 0) {
    await window.electron.exportFolder('', result[0], 'lazy-build-config');
    showDialog({
      title: '提示',
      message: '导出完成',
      showCancelButton: false,
      theme: 'round-button',
    })
  }
}

// 提交执行
function submit() {
  saveFileConfig()
}
function logout () {
  showDialog({
    title: '提示',
    message: '确认退出吗?',
    showCancelButton: true,
  }).then(() => {
    userStore.logout()
    router.push('/login')
  });
}
</script>

<template>
  <section class="pl-20 pr-20 pt-20 pb-50">
    <nav class="flex-row items-center header">
      <section class="flex-row items-center justify-center nav"
               :class="{active: overallIndex === index}"
               @click="selectFileName(index)"
               v-for="(item, index) in fileNameList" :key="index">
        {{item}}
        <Icon name="edit" size="18" class="ml-30" @click="openFileName('edit', index)"/>
        <Icon name="close"  size="18" class="ml-5" color="red" @click="removeFileName(index)"/>
      </section>
      <section @click="exportFolder" class="upload-folder">导出配置</section>
      <section @click="uploadFolder" class="upload-folder">上传配置</section>
      <Icon name="add-o" size="24" color="#4187F2" class="cursor" @click="openFileName('add')"/>
    </nav>

    <section class="file-box">
      <section class="title">替换文件<span class="c-gray sub"> (文件内容替换, 文件名不会替换, 如无填空)</span></section>
      <section class="flex-row items-center">
        <section class="flex-row items-center flex-1">
          <Field v-model="sourceFile" placeholder="请填写 或 选择新文件地址" @change="saveToFile"/>
          <Button type="primary" plain @click="openFile('new')" class="button">选择新文件</Button>
        </section>
        <section class="flex-row items-center flex-1">
          <Field v-model="targetFile" placeholder="请填写 或 选择旧文件地址" @change="saveToFile"/>
          <Button type="primary" plain @click="openFile('old')" class="button">选择旧文件</Button>
        </section>
      </section>
    </section>

    <section class="file-box">
      <section class="title">替换文件夹<span class="c-gray sub"> (整个文件夹替换, 文件夹名不会替换, 如无填空)</span></section>
      <section class="flex-row items-center">
        <section class="flex-row items-center flex-1">
          <Field v-model="sourceFolder" placeholder="请填写 或 选择新文件夹地址" @change="saveToFile"/>
          <Button type="primary" plain @click="openFolder('new')" class="button">新文件夹</Button>
        </section>
        <section class="flex-row items-center flex-1">
          <Field v-model="targetFolder" placeholder="请填写 或 选择旧文件夹地址" @change="saveToFile"/>
          <Button type="primary" plain @click="openFolder('old')" class="button">旧文件夹</Button>
        </section>
      </section>
    </section>

    <section class="file-box modify-box">
      <section class="flex-row items-center title">
        修改文件
        <Icon name="add-o" size="24" color="#4187F2" class="cursor ml-10"  @click="openFileModify"/>
        <span class="c-gray ml-10 sub"> (修改文件内某些字段, 如无清除json字段, 只能修改包含且支持js语法文件里的 "aaa"="111" 或者"aaa":"111"这样的格式)</span>
<!--        <Button type="primary" plain size="small" class="ml-10" @click="openFileModify">添加文件</Button>-->
      </section>

      <section v-for="(item, index) in modifyList" :key="item.id">
        <section class="flex-row items-center mt-15 mb-10 select">
          <nav class="select-list active">
            {{item.name}}
          </nav>
<!--          <Button type="primary" plain size="small" class="ml-10" @click="addJsonField(index)">添加字段</Button>-->
          <Icon name="add-o" size="24" color="#4187F2" class="cursor ml-10"  @click="addJsonField(index)"/>
          <Icon name="close" size="24" color="red" class="ml-10 cursor" @click="removeFileList(index)"/>
        </section>
        <section class="flex-row items-center pb-10" v-for="(itemC, indexC) in item.json" :key="item.id" >
          <Field v-model="itemC.key" label="字段名:" label-width="50" placeholder="请填写json字段名" class="flex-1 input" @change="saveToFile"/>
          <Field v-model="itemC.value" label="值:" label-width="20" placeholder="请填写json值" class="flex-1 input" @change="saveToFile"/>
          <Button type="danger" plain size="small" class="ml-10" @click="removeJsonField(index, indexC)">删除</Button>
        </section>
      </section>

    </section>

    <section class="flex-row justify-center items-center submit-btns">
      <Button type="primary" @click="submit" class="submit">立即执行</Button>
      <Button plain @click="logout" class="logout">退出</Button>
    </section>

    <Dialog
        v-model:show="overallShow"
        title="增加配置"
        show-cancel-button
        @confirm="confirmFileName"
        class="dialog"
        confirmButtonColor="#4187F2"
        cancelButtonColor="#cccccc"
        theme="round-button">
      <section class="ml-20 mr-20 mt-30 mb-30">
        <Field v-model="fileNameModify" label="填写配置名:" label-width="80" placeholder="请填写配置名" class="input"/>
      </section>
    </Dialog>
  </section>
</template>

<style scoped lang="scss">
.header{
  flex-wrap: wrap;
  min-height: 35px;
  margin-bottom: 20px;
  .nav{
    padding:0 10px 0 15px;
    height: 35px;
    margin: 5px 15px 5px 0;
    color: #333333;
    cursor: pointer;
    background: #ffffff;
    border: 1px solid #DCDEE0;
    border-radius: 4px;
    font-size: 16px;
    &.active{
      background: #58BE6A;
      color: #ffffff;
    }
  }
  .upload-folder{
    padding:0 8px;
    height: 35px;
    line-height: 35px;
    margin:0 15px 0 0;
    color: #4187F2;
    cursor: pointer;
    background: #ffffff;
    border: 1px solid #4187F2;
    border-radius: 4px;
    font-size: 12px;
  }
}

.file-box{
  margin-bottom: 30px;
  .title{
    font-weight: bold;
    font-size: 16px;
  }
  .sub{
    font-weight: normal;
    font-size: 12px;
  }
  .button{
    width: 120px;
  }
}

.modify-box{
  .select{
    flex-wrap: wrap;
    .select-list{
      position: relative;
      padding: 6px 20px 6px 10px;
      border-radius: 6px;
      border: 1px solid #cccccc;
      color: #cccccc;
      cursor: pointer;
      .van-icon{
        position: absolute;
        right: 0;
        top: 0;
      }
      &.active{
        background: #58BE6A;
        color: #ffffff;
      }
    }
  }
  .input{
    &:nth-child(2){
      margin-left: 10px;
    }
  }
}
.input{
  border: 1px solid #ebedf0;
  border-radius: 10px;
  &:after{
    content: none;
  }
}

.submit-btns{
  .submit{
    width: 300px;
    border-radius: 30px;
  }
  .logout{
    margin-left: 10px;
    width: 100px;
    border-radius: 30px;
  }
}

</style>
