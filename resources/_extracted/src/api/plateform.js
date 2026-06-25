import request from '../utils/request'

export function MediaPlatformList(query) {
  return request({
    url: '/api/zhushou/get_platform',
    method: 'get',
    params:query
  })
}
