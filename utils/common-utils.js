import logger from './logger'

// -----------------检测类型工具函数-----------------
/**
 * 检测input类型是否为数组或者object
 * @param {*} input 任意类型的输入
 * @returns {Boolean} true->input is an array or an object
 */
export const isArrayOrObject = function (input) {
  return isArray(input) || isObject(input)
}
/**
 * 检测input是否为Error的实例
 * @param {*} input 任意类型的输入
 * @returns {Boolean} true->input is an instance of Error
 */
export const isInstanceOfError = function (input) {
  return (input instanceof Error)
}


// -----------------获取时间工具函数，计算耗时用-----------------

let baseTime = 0
if (!Date.now) {
  Date.now = function now() {
    return new Date().getTime()
  }
}

export const TimeUtil = {
  now() {
    if (baseTime === 0) {
      baseTime = Date.now() - 1
    }

    const diff = Date.now() - baseTime
    if (diff > 0xffffffff) {
      baseTime += 0xffffffff
      return Date.now() - baseTime
    }
    return diff
  },

  utc() {
    return Math.round(Date.now() / 1000)
  },
}

// -----------------深度合并工具函数-----------------


// -----------------其它-----------------
/**
 * 序列化Error实例，只序列化Error实例的message和code属性（如果有的话）
 * @param {Error} error Error实例
 * @returns {String} 序列化后的内容
 */
export const stringifyError = function (error) {
  return JSON.stringify(error, ['message', 'code'])
}

