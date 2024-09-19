import { defineStore } from "pinia";
import { Storage } from '../../../out/renderer/lib/utils.js'

export const useUserStore = defineStore("user", () => {

  function logout () {
    Storage.remove('isLogin')
  }

  return {
    logout
  };
});
