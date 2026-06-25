import request from '../utils/request'

//
export function login(data) {
  return request({
    url: '/api/user/login',
    method: 'post',
    data
  })
}

export function get_xie(query) {
  return request({
    url: '/api/get_xie',
    method: 'get',
    params:query
  })
}