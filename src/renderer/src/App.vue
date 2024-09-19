<script setup>
import { useRouter } from 'vue-router'
import { Storage } from '../../../out/renderer/lib/utils'

const router = useRouter()

let isLogin = Storage.get('isLogin')
if(isLogin) {
  router.push('/build')
}
</script>

<template>
  <router-view></router-view>
</template>
