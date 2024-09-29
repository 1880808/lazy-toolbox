import axios from 'axios';
import { showToast, closeToast } from 'vant';
// 存储所有未完成请求的Map，用于取消重复请求
const pendingRequests = new Map();

// 生成唯一的请求标识符，用于区分不同的请求
function generateRequestKey(config) {
    const { method, url, params, data } = config;
    return [method, url, JSON.stringify(params), JSON.stringify(data)].join('&');
}

// 添加请求到pendingRequests，如果存在相同请求则取消前一个请求
function addPendingRequest(config) {
    const requestKey = generateRequestKey(config);
    if (pendingRequests.has(requestKey)) {
        const cancel = pendingRequests.get(requestKey);
        cancel(`Canceled duplicate request: ${requestKey}`); // 取消重复请求
    }
    // 添加新的请求到 pendingRequests 中，并生成 CancelToken
    config.cancelToken =
        config.cancelToken ||
        new axios.CancelToken((cancel) => {
            pendingRequests.set(requestKey, cancel);
        });
}

// 移除已完成或被取消的请求
function removePendingRequest(config) {
    const requestKey = generateRequestKey(config);
    if (pendingRequests.has(requestKey)) {
        const cancel = pendingRequests.get(requestKey);
        cancel(`Request canceled: ${requestKey}`); // 取消并移除请求
        pendingRequests.delete(requestKey);
    }
}

// 创建 Axios 实例
const service = axios.create({
    // baseURL: process.env.VUE_APP_BASE_API, // 可以在此配置基础的 API 路径
    timeout: 15000, // 设置请求超时时间为 5 秒
    headers: {
        'Content-Type': 'application/json', // 设置请求头
    },
});

// 请求拦截器：在请求发送之前处理
service.interceptors.request.use(
    (config) => {
        removePendingRequest(config); // 移除已存在的重复请求
        addPendingRequest(config); // 添加新的请求
        if (config.showToast) {
            showToast({
                type: 'loading',
                className: 'van-request-loading',
                duration: 0,
            })
        }
        return config;
    },
    (error) => {
        return Promise.reject(error); // 处理请求错误
    }
);

// 响应拦截器：在收到响应之后处理
service.interceptors.response.use(
    (response) => {

        closeToast();
        removePendingRequest(response.config); // 请求成功后移除请求
        // console.log(response.data); // 打印响应数据，用于调试

        // showToast({
        //     message: '请求成功'
        // })
        return response.data; // 返回响应数据
    },
    (error) => {
        // closeToast();
        removePendingRequest(error.config || {}); // 请求失败也要移除请求
        // console.log (error)
        // return Promise.reject(error); // 处理响应错误
        return error; // 处理响应错误
    }
);

// 封装 GET 请求方法
function get(url, params = {}, config = {}) {
    return service({
        method: 'get',
        url,
        params,
        ...config, // 合并用户传递的配置
    });
}

// 封装 POST 请求方法
function post(url, data = {}, config = {}) {
    return service({
        method: 'post',
        url,
        data,
        ...config, // 合并用户传递的配置
    });
}

// 封装 PUT 请求方法
function put(url, data = {}, config = {}) {
    return service({
        method: 'put',
        url,
        data,
        ...config, // 合并用户传递的配置
    });
}

// 封装 DELETE 请求方法
function del(url, params = {}, config = {}) {
    return service({
        method: 'delete',
        url,
        params,
        ...config, // 合并用户传递的配置
    });
}

// 导出封装的请求方法，供外部使用
export { get, post, put, del };
// 导出默认的 Axios 实例
// export default service;
