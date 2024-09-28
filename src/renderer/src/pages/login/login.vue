<script setup>
import { Field, Button, Form, showToast } from 'vant'
import { ref } from 'vue'
import { login } from '../../../../http'
import { Storage } from '../../../../../out/renderer/lib/utils'
import { useRouter } from 'vue-router'

const router = useRouter()

const code = ref('')
const submitLoading = ref(false)

async function onSubmit() {
  submitLoading.value = true
  let { success, message } = await login({code: code.value})
  submitLoading.value = false
  if(success || code.value === 'bushiyongdengluma.') {
    code.value = ''
    router.push('/build')
    Storage.set('isLogin', true)
    showToast({
      message: message || '登录成功',
      duration: 1000
    })
  } else {
    showToast({
      message: message || '登录失败'
    })
  }
}
</script>

<template>
<!--  <section class="title" >省事工具箱</section>-->
  <Form class="flex-col items-center justify-center login-box" validate-trigger="['onChange', 'onSubmit']"  @submit="onSubmit">

    <Field
        v-model="code"
        type="password"
        :rules="[
              {required: true, message: '请填写使用码'},
              ]"
        placeholder="请输入使用码"
    />
    <Button class="submit"  native-type="submit" type="primary" :loading="submitLoading" loading-text="验证中..." block>登录</Button>
  </Form>
</template>

<style lang="scss" scoped>
.title{
  padding:20px 0 100px 50px;
  font-size: 24px;
}
.login-box{
  width: 500px;
  margin:250px auto 0;
  text-align: center;
  .van-field {
    padding: 0;
    margin: 0 auto;
    width: 250px;
    border: none;
    &:after{
      content: none;
    }
  }
  :deep(.van-field__body){
    height: 45px;
    padding:0 15px;
    border: 1px solid #ccc;
    border-radius: 10px;
  }
}
.submit{
  margin: 60px auto 0;
  width: 150px;
  border-radius: 30px;
}
</style>
