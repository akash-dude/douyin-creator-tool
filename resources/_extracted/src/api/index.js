import request from '../utils/request'

export function get_all(query) {
  return request({
    url: '/api/get_all',
    method: 'get',
    params:query
  })
}

export function AccountList(query) {
  return request({
    url: '/api/zhushou/get_user_list',
    method: 'get',
    params:query
  })
}

export function AccountCreate(data) {
  return request({
    url: '/api/zhushou/save_cookie',
    method: 'post',
   data
  })
}

export function AccountUpdate(data) {
  return request({
     url:`/api/account/${data.id}`,
    method: 'put',
   data
  })
}

export function AccountDelete(data) {
  return request({
    url:`http://8.138.58.181/api/zhushou/del_user`,
    method: 'post',
    data
  })
}

export function AccountDetail(id) {
  return request({
    url:`/api/platform-accounts/${id}`,
    method: 'get'
  })
}

export function PlatformList(query) {
  return request({
    url: '/api/PlatformList',
    method: 'get',
    params:query
  })
}

export function FileCreate(data) {
  return request({
    url: '/api/OfferingList',
    method: 'post',
   data
  })
}

export function FileList(query) {
  return request({
    url: '/api/OfferingList',
    method: 'get',
    params:query
  })
}

export function FileUpdate(data) {
  return request({
    url:`/api/offeringDetail/${data.id}`,
    method: 'put',
   data
  })
}

export function FileDelete(data) {
  return request({
    url:`/api/offeringDetail/${data.id}`,
    method: 'delete',
   data
  })
}


export function offeringAndAccountCreate(data) {
  return request({
    url: '/api/offeringAndAccountList',
    method: 'post',
   data
  })
}

export function offeringAndAccountDetail(query) {
  return request({
   url:`/api/offeringAndAccountDetail/${query.id}`,
    method: 'get',
    params:query
  })
}

export function userInfo(query) {
  return request({
   url:`/api/user/info`,
    method: 'get',
    params:query
  })
}


export function HistoryList(query) {
  return request({
    url: '/api/OfferingHistory',
    method: 'get',
    params:query
  })
}
export function HistoryCreate(data) {
  return request({
    url: '/api/HistoryCreate',
    method: 'post',
   data
  })
}

export function ClipTaskCreate(data) {
  return request({
    url: '/api/ClipTaskCreate',
    method: 'post',
   data
  })
}

export function ClipTaskPut(data) {
  return request({
    url: '/api/ClipTaskCreate',
    method: 'put',
   data
  })
}

export function ClipTaskGet(query) {
  return request({
    url: '/api/ClipTaskCreate',
    method: 'get',
    params:query
  })
}

export function getModelList(query) {
  return request({
    url: '/api/zhushou/get_model',
    method: 'get',
    params: query
  })
}

export function saveModelCookie(data) {
  return request({
    url: '/api/zhushou/save_model_cookie',
    method: 'post',
    data: data
  })
}

export function getModelUserList(query) {
  return request({
    url: '/api/zhushou/get_model_user_list',
    method: 'get',
    params:query
  })
}

// 删除模型用户授权
export function deleteModelUser(query) {
  return request({
    url: '/api/zhushou/del_model_user',
    method: 'get',
    params:query
  })
}

// 获取规则检查状态
export function checkRule(query) {
  return request({
    url: '/api/zhushou/check_rule',
    method: 'get',
    params:query
  })
}
