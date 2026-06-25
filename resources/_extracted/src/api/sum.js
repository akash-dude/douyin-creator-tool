import request from '../utils/request'
// 获取用户账号列表
export function getTongji() {
    return request({
      url: '/api/tongji',
      method: 'get'
    })
}