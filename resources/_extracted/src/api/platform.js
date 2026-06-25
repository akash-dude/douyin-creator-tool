import request from '@/utils/request'

// 获取平台列表
export function getPlatformList() {
  return request({
    url: '/api/zhushou/get_platform',
    method: 'get'
  })
}

// 获取用户账号列表
export function getUserAccounts() {
  return request({
    url: '/api/users',
    method: 'get'
  })
}

// 添加用户账号
export function addUserAccount(data) {
  return request({
    url: '/api/users',
    method: 'post',
    data
  })
}

// 删除用户账号
export function deleteUserAccount(id) {
  return request({
    url: `/api/users/${id}`,
    method: 'delete'
  })
}

// 更新用户账号
export function updateUserAccount(id, data) {
  return request({
    url: `/api/users/${id}`,
    method: 'put',
    data
  })
}

// 获取平台登录状态
export function getPlatformLoginStatus(platformType) {
  return request({
    url: `/api/platforms/${platformType}/status`,
    method: 'get'
  })
} 