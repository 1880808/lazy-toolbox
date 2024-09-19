
const Storage = {
  /**
   * 设置缓存
   * @param {string} key - 键
   * @param {any} value - 值
   * @param {number} expire - 过期时间 (秒)，不设置表示永久
   * Storage.set('storage_key', 'hello', 60)
   */
  set: function (key, value, expire = 0) {
    let obj = {
      value: value,
      timestamp: new Date().getTime()
    };
    if (expire > 0) {
      obj.expire = expire * 1000; // 转换成毫秒
    }
    localStorage.setItem(key, JSON.stringify(obj));
  },

  /**
   * 获取缓存
   * @param {string} key - 键
   * @return {any} - 返回值
   */
  get: function (key) {
    let value = localStorage.getItem(key);
    if (!value) {
      return null;
    }
    let obj = JSON.parse(value);
    if (obj.expire) {
      if (new Date().getTime() - obj.timestamp > obj.expire) {
        this.remove(key);
        return null;
      }
    }
    return obj.value;
  },

  /**
   * 删除缓存
   * @param {string} key - 键
   */
  remove: function (key) {
    localStorage.removeItem(key);
  }
};

export {
  Storage
};
