import request from "./request";
const baseUrl = 'https://demos.trtc.tencent-cloud.com/prod';


export function gslb(data) {
  return request({
    url: `${baseUrl}/base/v1/gslb`,
    data,
  });
}
export function userVerifyByPicture(data) {
  return request({
    url: `${baseUrl}/base/v1/auth_users/user_verify_by_picture`,
    data,
  });
}

export function userLoginCode(data) {
  return request({
    url: `${baseUrl}/base/v1/auth_users/user_login_code`,
    data,
  });
}

export function userDelete(data) {
  return request({
    url: `${baseUrl}/base/v1/auth_users/user_delete`,
    data,
  });
}
 