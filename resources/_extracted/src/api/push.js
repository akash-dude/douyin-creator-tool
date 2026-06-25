import request from '../utils/request'



// 停止发布
export function pushStop() {
  return request({
    url: '/api/push/stop',
    method: 'post'
  })
}

// 获取发布日志
export function getPushLogs(params) {
  return request({
    url: '/api/push/logs',
    method: 'get',
    params
  })
}

// 获取发布统计
export function getPushStats() {
  return request({
    url: '/api/push/stats',
    method: 'get'
  })
}

// 更新发布配置
export function updatePushConfig(data) {
  return request({
    url: '/api/push/config',
    method: 'put',
    data
  })
}

// 获取发布配置
export function getPushConfig() {
  return request({
    url: '/api/push/config',
    method: 'get'
    
  })
}

// 获取发布状态
export function getPushStatus() {
  return request({
    url: '/api/push/status',
    method: 'get'
  })
}

// 获取统计信息
export function getTongji(data) {
  return request({
    url: '/api/zhushou/get_tongji',
    method: 'post',
    data
  })
} 

//首页信息
export function send_exe(data) {
  return request({
    url: '/api/zhushou/index',
    method: 'post',
    data
  })
} 

// 启动 Flask 服务器发布任务
export async function startFlaskPush(data) {
  try {
    // 获取 Flask 端口
    const { ipcRenderer } = require('electron');
    let port = await ipcRenderer.invoke('get-flask-port-async');
    if (port == null) port = 5000;
    
    const url = `http://127.0.0.1:${port}/api/push`;
    
    // 使用 axios 直接请求 Flask 服务器
    const axios = require('axios');
    const response = await axios.post(url, data);
    
    return response.data;
  } catch (error) {
    throw new Error(`Flask 服务器请求失败: ${error.message}`);
  }
}

// 停止 Flask 服务器发布任务
export async function stopFlaskPush() {
  try {
    // 获取 Flask 端口
    const { ipcRenderer } = require('electron');
    let port = await ipcRenderer.invoke('get-flask-port-async');
    if (port == null) port = 5000;
    
    const url = `http://127.0.0.1:${port}/api/stop`;
    
    // 使用 axios 直接请求 Flask 服务器
    const axios = require('axios');
    const response = await axios.post(url);
    
    return response.data;
  } catch (error) {
    throw new Error(`停止发布任务失败: ${error.message}`);
  }
}

// 启动发布任务（新的统一接口）
export async function startPushTask(data) {
  try {
    // 获取 Flask 端口
    const { ipcRenderer } = require('electron');
    let port = await ipcRenderer.invoke('get-flask-port-async');
    if (port == null) port = 5000;
    
    const url = `http://127.0.0.1:${port}/api/push`;
    
    // 使用 axios 直接请求 Flask 服务器
    const axios = require('axios');
    const response = await axios.post(url, data);
    
    return response.data;
  } catch (error) {
    throw new Error(`启动发布任务失败: ${error.message}`);
  }
} 

// 获取发布日志（从 Flask 服务器）
export async function getFlaskLogs(taskId,last_version) {
  try {
    // 获取 Flask 端口
    const { ipcRenderer } = require('electron');
    let port = await ipcRenderer.invoke('get-flask-port-async');
    if (port == null) port = 5000;
    
    const url = `http://127.0.0.1:${port}/api/logs/${taskId}`;
    
    // 使用 axios 直接请求 Flask 服务器
    const axios = require('axios');
    const response = await axios.get(url, {
      params: {
        last_version: last_version
      }
    });
    
    // 返回整个响应，因为 Flask 返回的就是日志数据
    return response.data;
  } catch (error) {
    throw new Error(`获取日志失败: ${error.message}`);
  }
}

// 获取AI发布日志（从 Flask 服务器）
export async function getAiFlaskLogs(taskId,last_version) {
  try {
    // 获取 Flask 端口
    const { ipcRenderer } = require('electron');
    let port = await ipcRenderer.invoke('get-flask-port-async');
    if (port == null) port = 5000;
    
    const url = `http://127.0.0.1:${port}/api/ai_logs/${taskId}`;
    
    // 使用 axios 直接请求 Flask 服务器
    const axios = require('axios');
    const response = await axios.get(url, {
      params: {
        last_version: last_version
      }
    });
    
    // 返回整个响应，因为 Flask 返回的就是日志数据
    return response.data;
  } catch (error) {
    throw new Error(`获取AI日志失败: ${error.message}`);
  }
}

// 启动AI发布任务
export async function startAiPushTask(data) {
  try {
    // 获取 Flask 端口
    const { ipcRenderer } = require('electron');
    let port = await ipcRenderer.invoke('get-flask-port-async');
    if (port == null) port = 5000;
    
    const url = `http://127.0.0.1:${port}/api/ai_push`;
    
    // 使用 axios 直接请求 Flask 服务器
    const axios = require('axios');
    const response = await axios.post(url, data);
    
    return response.data;
  } catch (error) {
    throw new Error(`启动AI发布任务失败: ${error.message}`);
  }
}

// 停止AI发布任务
export async function stopAiFlaskPush() {
  try {
    // 获取 Flask 端口
    const { ipcRenderer } = require('electron');
    let port = await ipcRenderer.invoke('get-flask-port-async');
    if (port == null) port = 5000;
    
    const url = `http://127.0.0.1:${port}/api/ai_stop`;
    
    // 使用 axios 直接请求 Flask 服务器
    const axios = require('axios');
    const response = await axios.post(url);
    
    return response.data;
  } catch (error) {
    throw new Error(`停止AI发布任务失败: ${error.message}`);
  }
} 

// 自媒体授权登录
export async function mediaLogin(data) {
  try {
    // 获取 Flask 端口
    const { ipcRenderer } = require('electron');
    let port = await ipcRenderer.invoke('get-flask-port-async');
    if (port == null) port = 5000;
    
    const url = `http://127.0.0.1:${port}/api/media/login`;
    
    // 使用 axios 直接请求 Flask 服务器
    const axios = require('axios');
    const response = await axios.post(url, data);
    
    return response.data;
  } catch (error) {
    throw new Error(`抖音授权失败: ${error.message}`);
  }
}

// Deepseek授权登录
export async function deepseekLogin(data) {
  try {
    // 获取 Flask 端口
    const { ipcRenderer } = require('electron');
    let port = await ipcRenderer.invoke('get-flask-port-async');
    if (port == null) port = 5000;
    
    const url = `http://127.0.0.1:${port}/api/deepseek/login`;
    
    // 使用 axios 直接请求 Flask 服务器
    const axios = require('axios');
    const response = await axios.post(url, data);
    
    return response.data;
  } catch (error) {
    throw new Error(`Deepseek授权失败: ${error.message}`);
  }
}

// Nami授权登录
export async function kimiLogin(data) {
  try {
    // 获取 Flask 端口
    const { ipcRenderer } = require('electron');
    let port = await ipcRenderer.invoke('get-flask-port-async');
    if (port == null) port = 5000;
    
    const url = `http://127.0.0.1:${port}/api/kimi/login`;
    
    // 使用 axios 直接请求 Flask 服务器
    const axios = require('axios');
    const response = await axios.post(url, data);
    
    return response.data;
  } catch (error) {
    throw new Error(`Nami授权失败: ${error.message}`);
  }
}