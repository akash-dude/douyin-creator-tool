import request from '../utils/request'

export function get_form(query) {
  return request({
    url: '/api/get_form',
    method: 'get',
    params:query
  })
}


export function updateHistory(data) {
  return request({
    url: '/api/updateHistory',
    method: 'post',
   data
  })
}